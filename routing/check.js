import { Router } from "@oak/oak";
import { decodeToken } from "../lib/jwt.js";

const check = new Router()
  .post("/staff", async ctx => {
    const t = await decodeToken(await ctx.request.body.text());
    if (t === false){
      ctx.response.status = 403;
      ctx.response.body = t;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = true;
    return;
  })
  .post("/alumnos", async ctx => {
    const t = await decodeToken(await ctx.request.body.text());
    if (t === false) {
      ctx.response.status = 403;
      ctx.response.body = t;
      return;
    }
    ctx.response.status = 200;
    ctx.response.body = true;
    return;
  });
export default check;