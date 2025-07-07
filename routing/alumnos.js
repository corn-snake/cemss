import { Router } from "@oak/oak";
import { HTMLPath, render } from "../lib/compose.js";
import { getPupilFront } from "../lib/sql.js";
import { decodeToken } from "../lib/jwt.js";

const alumnos = new Router()
    .get("/", async ctx => ctx.response.body = render(await HTMLPath("alumnos/head.html"), await HTMLPath("loggedInTopbar.html"), await HTMLPath("tail.html")))
    .post("/", async ctx => ctx.response.body = await getPupilFront(await decodeToken(await ctx.request.body.text())));

export default alumnos;