import { Router } from "@oak/oak";
import { FragmentPath, render } from "../lib/compose.js";
import { getAllTemplates, getClassesForCopy, getGroupInfoAdmin, getGroupsFromTerm, getOpenTerms, getStaffFront, getTeachers, getTerms, tokenCorrect } from "../lib/sql.js";
import { decodeToken } from "../lib/jwt.js";
import mammoth from "mammoth";

const staff = new Router()
    .get("/", async ctx =>ctx.response.body = render(await FragmentPath("staff/head.html"), await FragmentPath("loggedInTopbar.html"), await FragmentPath("tail.html")))
    .post("/check", async ctx => ctx.response.body = await decodeToken(await ctx.request.body.text()) ? await FragmentPath("staff/adminExtras.js") : "")
    .post("/", async ctx => ctx.response.body = await getStaffFront(await decodeToken(await ctx.request.body.text())))
    .post("/g/:gID", async ctx => ctx.response.body = await getGroupInfoAdmin(await decodeToken(await ctx.request.body.text()), ctx.params.gID))
    .post("/m", async ctx => ctx.response.body = await getTeachers(await decodeToken(await ctx.request.body.text())))
    .post("/cAllForCopy", async ctx => ctx.response.body = await getClassesForCopy(await decodeToken(await ctx.request.body.text())))
    .post("/t", async ctx => ctx.response.body = await getTerms(await decodeToken(await ctx.request.body.text())))
    .post("/opT", async ctx => ctx.response.body = await getOpenTerms(await decodeToken(await ctx.request.body.text())))
    .post("/opG", async ctx => ctx.response.body = await getGroupsFromTerm(await decodeToken(await ctx.request.body.text())))
    .post("/p", async ctx => ctx.response.body = await getAllTemplates(await decodeToken(await ctx.request.body.text())))
    .post("/parseWord", async ctx => {
      const b = await ctx.request.body.formData();
      try {
        await tokenCorrect(await decodeToken(b.get("tkn")));
      } catch (e) {
        throw e;
      }
      const m = await mammoth.convertToHtml({ buffer: await b.get("file").arrayBuffer() });
      ctx.response.body = m.value;
      // console.log(m.messages);
    });
export default staff;