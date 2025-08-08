import { Router } from "@oak/oak";
import { FragmentPath, render } from "../lib/compose.js";
import { commitProgress, getActivity, getClassInfo, getPupilFront, getPupilProgress } from "../lib/sql.js";
import { decodeToken } from "../lib/jwt.js";
import { isDev } from "../.env/dev.js";

const alumnos = new Router()
    .get("/", async ctx => ctx.response.body = render(
        await FragmentPath("alumnos/head.html"),
        isDev ? await FragmentPath("dev/overlay.html") : "",
        await FragmentPath("loggedInTopbar.html"), await FragmentPath("tail.html")
    ))
    .post("/", async ctx => ctx.response.body = await getPupilFront(await decodeToken(await ctx.request.body.text())))
    .post("/clase", async ctx => {
        const { tkn, plantilla, tema, material } = await ctx.request.body.json();
        ctx.response.body = await getClassInfo(await decodeToken(tkn), plantilla, tema, material);
    })
    .post("/act", async ctx => {
        const { tkn, plantilla, tema, material } = await ctx.request.body.json();
        ctx.response.body = await getActivity(await decodeToken(tkn), plantilla, tema, material);
    })
    .post("/progreso", async ctx => ctx.response.body = await getPupilProgress(await decodeToken(await ctx.request.body.text())))
    .put("/commitProgreso", async ctx=>{
        const fd = await ctx.request.body.formData();
        const r = await commitProgress(await decodeToken(fd.get("tkn")), fd.get("progreso"));
        if (await r === false) {
            ctx.response.status = 500;
            return ctx.response.body = "AAH!";
        }
        ctx.response.body = await r;
    });

export default alumnos;