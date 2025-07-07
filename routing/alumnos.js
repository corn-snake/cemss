import { Router } from "@oak/oak";
import { HTMLPath, render } from "../lib/compose.js";

const alumnos = new Router()
    .get("/", async ctx => ctx.response.body = render(await HTMLPath("alumnos/head.html"), await HTMLPath("loggedInTopbar.html"), await HTMLPath("tail.html")));

export default alumnos;