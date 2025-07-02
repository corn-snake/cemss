import { send } from "@oak/oak";
import { Status } from "@oak/oak";
import { Router } from "@oak/oak/router";

const sender = (...exts) => exts.length > 0 ? (ctx, n) => {
  let rf;
  try {
    rf = send(ctx, n, { root: "./public", extensions: exts });
  } catch (e) {
    console.log("[HYPERLINK BLOCKED]");
    ctx.response.status = Status.NotFound;
    rf = send(ctx, "./public/404.html");
  }
  return rf;
} : (ctx, n) => { let rf; try {  rf = send(ctx, n, { root: "./public", index: "index.html" }); } catch (e) { ctx.response.status = Status.NotFound; rf = send(ctx, "./public/404.html"); } return rf };

const readPublicFile = sender();
const readStyle = sender("css");
const readScript = sender("js");
const readImage = sender("png", "jpeg", "jpg", "ico", "bmp", "webp");

const r = new Router()
  .get("/styles/(.*)", ctx => readStyle(ctx, ctx.request.url.pathname.substring(ctx.request.url.pathname.indexOf("/", 3))))
  .get("/scripts/(.*)", ctx => readScript(ctx, ctx.request.url.pathname.substring(ctx.request.url.pathname.indexOf("/", 3))))
  .get("/images/(.*)", ctx => readImage(ctx, ctx.request.url.pathname.substring(ctx.request.url.pathname.indexOf("/", 3))))
  .get("/(.*)", ctx => readPublicFile(ctx, ctx.request.url.pathname.substring(1)));

export default r;