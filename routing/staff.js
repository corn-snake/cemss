import { Router } from "@oak/oak";
import { FragmentPath, render } from "../lib/compose.js";
import { bookResult, getAllTemplates, getGroupInfoAdmin, getOpenTerms, getStaffFront, getTeachers, getTerms, checkAdmin, getImpartingInfo, getTemplatesForClass, assignClass } from "../lib/sql.js";
import { decodeToken } from "../lib/jwt.js";
import { isDev } from "../.env/dev.js";

const staff = new Router()
    .get("/", async ctx =>ctx.response.body = render(
        await FragmentPath("staff/head.html"),
        isDev ? await FragmentPath("dev/overlay.html") : "",
        await FragmentPath("loggedInTopbar.html"),
        await FragmentPath("tail.html")))
    .post("/check", async ctx => ctx.response.body = await decodeToken(await ctx.request.body.text()) ? await FragmentPath("staff/adminExtras.js") : "")
    .post("/", async ctx => ctx.response.body = await getStaffFront(await decodeToken(await ctx.request.body.text())))
    .post("/c", async ctx => {
        const { tkn, group, template } = await ctx.request.body.json();
        ctx.response.body = await getImpartingInfo(await decodeToken(tkn), group, template);
    })
    .post("/g/:gID", async ctx => ctx.response.body = await getGroupInfoAdmin(await decodeToken(await ctx.request.body.text()), ctx.params.gID))
    .post("/m", async ctx => ctx.response.body = await getTeachers(await decodeToken(await ctx.request.body.text())))
    .post("/cForNew", async ctx => {
        const { tkn, grupo } = await ctx.request.body.json();
        ctx.response.body = await getTemplatesForClass(await decodeToken(tkn), grupo);
    })
    .post("/t", async ctx => ctx.response.body = await getTerms(await decodeToken(await ctx.request.body.text())))
    .post("/opT", async ctx => ctx.response.body = await getOpenTerms(await decodeToken(await ctx.request.body.text())))
    .post("/p", async ctx => ctx.response.body = await getAllTemplates(await decodeToken(await ctx.request.body.text())))
    .post("/assign", async ctx => {
        const { tkn, clase } = await ctx.request.body.json();
        ctx.response.body = await assignClass( await decodeToken(tkn), clase );
    })
    .post("/word", async ctx => {
      const b = await ctx.request.body.formData();
      try {
        await checkAdmin(await decodeToken(b.get("tkn")));
      } catch (e) {
        throw e;
      }
      const r = JSON.parse(b.get("read"));
      bookResult(r, b.get("cuatrimestre"));
      ctx.response.body = "received."
      // console.log(m.messages);
    });
export default staff;