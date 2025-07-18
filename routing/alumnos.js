import { Router } from "@oak/oak";
import { FragmentPath, render } from "../lib/compose.js";
import { getPupilFront } from "../lib/sql.js";
import { decodeToken } from "../lib/jwt.js";

const alumnos = new Router()
    .get("/", async ctx => ctx.response.body = render(await FragmentPath("alumnos/head.html"), await FragmentPath("loggedInTopbar.html"), await FragmentPath("tail.html")))
    .post("/", async ctx => ctx.response.body = await getPupilFront(await decodeToken(await ctx.request.body.text())));

export default alumnos;