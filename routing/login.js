import { Router, Status } from "@oak/oak";
import check from "./check.js";
import { validatePupil, validateStaff } from "../lib/sql.js";
import { encodeToken } from "../lib/jwt.js";

const logins = new Router()
  .use("/check", check.routes(), check.allowedMethods())
  .post("/staff", async ctx => {
    let dat = await ctx.request.body.json();
    if (!(Array.isArray(await dat)) || (await dat).length !== 2) {
      ctx.response.status = Status.BadRequest;
      return;
    }
    const v = await validateStaff(...(await dat));
    ctx.response.status = v;
    if (v===200)
      ctx.response.body = await encodeToken((await dat)[0]);
    return;
  })
  .post("/alumnos", async ctx => {
    let dat = await ctx.request.body.json();
    if (!(Array.isArray(await dat)) || (await dat).length !== 2) {
      ctx.response.status = Status.BadRequest;
      return;
    }
    const v = await validatePupil(...(await dat));
    ctx.response.status = v;
    if (v === 200)
      ctx.response.body = await encodeToken((await dat)[0]);
    return;
  })

export default logins;