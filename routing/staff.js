import { Router } from "@oak/oak";
import { HTMLPath, render } from "../lib/compose.js";
import { getGroupInfoAdmin, getStaffFront } from "../lib/sql.js";
import { decodeToken } from "../lib/jwt.js";

const staff = new Router()
    .get("/", async ctx =>ctx.response.body = render(await HTMLPath("staff/head.html"), await HTMLPath("loggedInTopbar.html"), await HTMLPath("tail.html")))
    .post("/", async ctx => ctx.response.body = await getStaffFront(await decodeToken(await ctx.request.body.text())))
    .post("/g/:gID", async ctx => ctx.response.body = await getGroupInfoAdmin(await decodeToken(await ctx.request.body.text()), ctx.params.gID));

export default staff;