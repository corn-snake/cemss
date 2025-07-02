import { send as oaksend, createHttpError, Response } from "@oak/oak";
import { parse, isAbsolute, join, normalize, SEPARATOR, extname, basename } from "@std/path";
import { readFile, stat, open } from "node:fs/promises";
import { eTag, ifNoneMatch } from "./httpUtils.js";
import { range, responseRange } from "@oak/commons/range";
import { Status } from "@oak/oak";
import { contentType } from "@std/media-types";

let d;
try {
  d = Deno;
} catch (e) {
  d = false;
  console.log("using node port!");
}

const send = d ? oaksend : async ({request, response}, path, options) => {
  /////////////////////////////// miscellaneous functions, from utils folder or deps.ts. closured for no good reason other than "encapsulate EVERYTHING"
  function decode(pathname) {
    try {
      return decodeURI(pathname);
    } catch (err) {
      if (err instanceof URIError) {
        throw createHttpError(400, "Failed to decode URI", { expose: false });
      }
      throw err;
    }
  }
  function isHidden(path) {
    const pathArr = path.split("/");
    for (const segment of pathArr) {
      if (segment[0] === "." && segment !== "." && segment !== "..") {
        return true;
      }
      return false;
    }
  }

  const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/;
  function resolvePath(rootPath, relativePath) {
    let path = relativePath;
    let root = rootPath;

    // root is optional, similar to root.resolve
    if (relativePath === undefined) {
      path = rootPath;
      root = ".";
    }

    if (path == null) {
      throw new TypeError("Argument relativePath is required.");
    }

    // containing NULL bytes is malicious
    if (path.includes("\0")) {
      throw createHttpError(400, "Malicious Path");
    }

    // path should never be absolute
    if (isAbsolute(path)) {
      throw createHttpError(400, "Malicious Path");
    }

    // path outside root
    if (UP_PATH_REGEXP.test(normalize(`.${SEPARATOR}${path}`))) {
      throw createHttpError(403);
    }

    // join the relative path
    return normalize(join(root, path));
  }

  async function exists(path) {
    try {
      return (await stat(path)).isFile();
    } catch {
      return false;
    }
  }

  async function getEntity(
    path,
    mtime,
    stats,
    maxbuffer,
    response,
  ) {
    let body, entity;
    const fileInfo = { mtime: new Date(mtime), size: stats.size };
    if (stats.size < maxbuffer) {
      const buffer = await readFile(path);
      body = entity = buffer;
    } else {
      const file = await open(path); // defaults to reading
      response.addResource(file);
      body = file;
      entity = fileInfo;
      // mildly concerned this might be different behaviour between Node & Deno, but hopefully they're not *too* different
    }
    return [body, entity, fileInfo];
  }

  ////////////////////////////////// begin function proper

  const {
    brotli = true,
    contentTypes = {},
    extensions,
    format = true,
    gzip = true,
    hidden = false,
    immutable = false,
    index,
    maxbuffer = 1_048_576, // 1MiB;,
    maxage = 0,
    root,
  } = options;
  const trailingSlash = path[path.length - 1] === "/";
  path = decode(path.substring(parse(path).root.length));

  if (index && trailingSlash) {
    path += index;
  }
  if (!hidden && isHidden(path)) {
    throw createHttpError(403);
  }
  path = resolvePath(root, path);
  let encodingExt = "";

  if (
    brotli &&
    request.getHeader('accept-encoding').indexOf("br") > 0
  ) {
    try {
      await exists(`${path}.br`);
      path = `${path}.br`;
      response.headers.set("Content-Encoding", "br");
      response.headers.delete("Content-Length");
      encodingExt = ".br";
    } catch (e) { }
  } else if (
    gzip &&
    request.getHeader('accept-encoding').indexOf("gzip") > 0
  ) {
    try {
      await exists(`${path}.gz`);
      path = `${path}.gz`;
      response.headers.set("Content-Encoding", "gzip");
      response.headers.delete("Content-Length");
      encodingExt = ".gz";
    } catch (e) { }
  }
  if (extensions && !/\.[^/]*$/.exec(path)) {
    for (let ext of extensions) {
      if (!/^\./.exec(ext)) {
        ext = `.${ext}`;
      }
      if (await exists(`${path}${ext}`)) {
        path += ext;
        break;
      }
    }
  }
  let stats;
  try {
    stats = await stat(path);
    if (stats.isDirectory()) {
      if (format && index) {
        path += `/${index}`;
        stats = await stat(path);
      } else {
        return;
      }
    }
  } catch (e) {
    if(e.message.startsWith("ENOENT"))
      throw createHttpError(404, err.message);
    throw createHttpError(
      500,
      err instanceof Error ? err.message : "[non-error thrown]",
    );
  }

  let mtime;
  if (response.headers.has("Last-Modified")) {
    mtime = new Date(response.headers.get("Last-Modified")).getTime();
  } else if (stats.mtime) {
    // Round down to second because it's the precision of the UTC string.
    mtime = stats.mtime.getTime();
    mtime -= mtime % 1000;
    response.headers.set("Last-Modified", new Date(mtime).toUTCString());
  }
  if (!response.headers.has("Cache-Control")) {
    const directives = [`max-age=${(maxage / 1000) | 0}`];
    if (immutable) {
      directives.push("immutable");
    }
    response.headers.set("Cache-Control", directives.join(","));
  }
  if (!response.type) {
    response.type = encodingExt !== ""
      ? extname(basename(path, encodingExt))
      : contentTypes[extname(path)] ?? extname(path);
  }

  let entity, body, fileInfo;
  if (request.hasHeader("if-none-match") && mtime) {
    [body, entity, fileInfo] = await getEntity(
      path,
      mtime,
      stats,
      maxbuffer,
      response,
    );
    const etag = await eTag(entity);
    if (
      etag && !ifNoneMatch(request.getHeader("if-none-match"), etag)
    ) {
      response.headers.set("ETag", etag);
      response.status = 304;
      return path;
    }
  }

  if (request.hasHeader("if-modified-since") && mtime) {
    const ifModifiedSince = new Date(request.getHeader("if-modified-since"));
    if (ifModifiedSince.getTime() >= mtime) {
      response.status = 304;
      return path;
    }
  }

  if (!body || !entity || !fileInfo) {
    [body, entity, fileInfo] = await getEntity(
      path,
      mtime ?? 0,
      stats,
      maxbuffer,
      response,
    );
  }

  let returnRanges, size;
  if (request.source && body && entity) {
    const { ok, ranges } = ArrayBuffer.isView(body)
      ? await range(request, body, fileInfo)
      : await range(request, fileInfo);
    if (ok && ranges) {
      size = ArrayBuffer.isView(entity) ? entity.byteLength : entity.size;
      returnRanges = ranges;
    } else if (!ok) {
      response.status = Status.RequestedRangeNotSatisfiable;
    }
  }

  if (!response.headers.has("ETag")) {
    const etag = await eTag(entity);
    if (etag) {
      response.headers.set("ETag", etag);
    }
  }

  if (returnRanges && size) {
    response.with(
      responseRange(body, size, returnRanges, { headers: response.headers }, {
        type: response.type ? contentType(response.type) : "",
      }),
    );
  } else {
    response.body = body;
  }
  return path;
};

export default send;

///////////////////////////////////////
/* port of "send.ts" from the Oak team. their license is as follows:
MIT License

Copyright (c) 2018-2025 the oak authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/