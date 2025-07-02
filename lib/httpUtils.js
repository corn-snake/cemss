////////////////////////////////
import { encodeBase64 as base64Encode } from "@std/encoding/base64";

const encoder = new TextEncoder();

const DEFAULT_ALGORITHM = "SHA-256";

function isFileInfo(value) {
  return Boolean(
    value && typeof value === "object" && "mtime" in value && "size" in value,
  );
}

async function calcEntity(
  entity,
  { algorithm = DEFAULT_ALGORITHM },
) {
  // a short circuit for zero length entities
  if (entity.length === 0) {
    return `0-47DEQpj8HBSa+/TImW+5JCeuQeR`;
  }

  if (typeof entity === "string") {
    entity = encoder.encode(entity);
  }

  const hash = base64Encode(await crypto.subtle.digest(algorithm, entity))
    .substring(0, 27);

  return `${entity.length.toString(16)}-${hash}`;
}

async function calcFileInfo(
  fileInfo,
  { algorithm = DEFAULT_ALGORITHM },
) {
  if (fileInfo.mtime) {
    const hash = base64Encode(
      await crypto.subtle.digest(
        algorithm,
        encoder.encode(fileInfo.mtime.toJSON()),
      ),
    ).substring(0, 27);
    return `${fileInfo.size.toString(16)}-${hash}`;
  }
}

/**
 * Calculate an ETag for file information entity. This returns a
 * {@linkcode https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag#w | weak tag}
 * of the form `W\"<ascii chars>"`, which guarantees the equivalence of the resource,
 * not the byte-for-byte equality.
 *
 * @example Usage
 * ```ts
 * import { eTag } from "@std/http/etag";
 * import { assert } from "@std/assert";
 *
 * const fileInfo = await Deno.stat("README.md");
 *
 * const etag = await eTag(fileInfo);
 * assert(etag);
 *
 * using file = await Deno.open("README.md");
 *
 * const res = new Response(file.readable, { headers: { etag } });
 * ```
 *
 * @param entity The entity to get the ETag for.
 * @param options Various additional options.
 * @returns The calculated ETag.
 */
export async function eTag(
  entity,
  options = {},
) {
  const weak = options.weak ?? isFileInfo(entity);
  const tag =
    await (isFileInfo(entity)
      ? calcFileInfo(entity, options)
      : calcEntity(entity, options));

  return tag ? weak ? `W/"${tag}"` : `"${tag}"` : undefined;
}

const STAR_REGEXP = /^\s*\*\s*$/;
const COMMA_REGEXP = /\s*,\s*/;

/** A helper function that takes the value from the `If-Match` header and a
 * calculated etag for the target. By using strong comparison, return `true` if
 * the values match, otherwise `false`.
 *
 * See MDN's [`If-Match`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-Match)
 * article for more information on how to use this function.
 *
 * @example Usage
 * ```ts ignore
 * import {
 *   eTag,
 *   ifMatch,
 * } from "@std/http/etag";
 * import { assert } from "@std/assert";
 *
 * const body = "hello deno!";
 *
 * Deno.serve(async (req) => {
 *   const ifMatchValue = req.headers.get("if-match");
 *   const etag = await eTag(body);
 *   assert(etag);
 *   if (!ifMatchValue || ifMatch(ifMatchValue, etag)) {
 *     return new Response(body, { status: 200, headers: { etag } });
 *   } else {
 *     return new Response(null, { status: 412, statusText: "Precondition Failed"});
 *   }
 * });
 * ```
 *
 * @param value the If-Match header value.
 * @param etag the ETag to check against.
 * @returns whether or not the parameters match.
 */
export function ifMatch(
  value,
  etag,
) {
  // Weak tags cannot be matched and return false.
  if (!value || !etag || etag.startsWith("W/")) {
    return false;
  }
  if (STAR_REGEXP.test(value)) {
    return true;
  }
  const tags = value.split(COMMA_REGEXP);
  return tags.includes(etag);
}

/** A helper function that takes the value from the `If-None-Match` header and
 * a calculated etag for the target entity and returns `false` if the etag for
 * the entity matches the supplied value, otherwise `true`.
 *
 * See MDN's [`If-None-Match`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/If-None-Match)
 * article for more information on how to use this function.
 *
 * @example Usage
 * ```ts ignore
 * import {
 *   eTag,
 *   ifNoneMatch,
 * } from "@std/http/etag";
 * import { assert } from "@std/assert";
 *
 * const body = "hello deno!";
 *
 * Deno.serve(async (req) => {
 *   const ifNoneMatchValue = req.headers.get("if-none-match");
 *   const etag = await eTag(body);
 *   assert(etag);
 *   if (!ifNoneMatch(ifNoneMatchValue, etag)) {
 *     return new Response(null, { status: 304, headers: { etag } });
 *   } else {
 *     return new Response(body, { status: 200, headers: { etag } });
 *   }
 * });
 * ```
 *
 * @param value the If-None-Match header value.
 * @param etag the ETag to check against.
 * @returns whether or not the parameters do not match.
 */
export function ifNoneMatch(
  value,
  etag,
) {
  if (!value || !etag) {
    return true;
  }
  if (STAR_REGEXP.test(value)) {
    return false;
  }
  etag = etag.startsWith("W/") ? etag.slice(2) : etag;
  const tags = value.split(COMMA_REGEXP).map((tag) =>
    tag.startsWith("W/") ? tag.slice(2) : tag
  );
  return !tags.includes(etag);
}

///////////////////////////////////////////////////////
/* extracted etag.ts from jsr:@std/http from the Deno team. their license is as follows:
MIT License

Copyright 2018-2022 the Deno authors.

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