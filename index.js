import { Application, HttpError, send } from "@oak/oak";
import r from "./routing/index.js";

const app = new Application();
app.addEventListener("listen", ({hostname, port})=>console.log(`Listening @ ${hostname ?? "localhost"}:${port}!`));

app.use(async (ctx, next) => {
  try { await next(); } catch (e) {
    if (e instanceof HttpError && ctx.response.status == 404)
      return send(ctx, "./public/404.html").then(()=>ctx.response.status = 404);
    console.log(e)
    ctx.response.body = "[HYPERLINK BLOCKED]";
    ctx.response.status = 400;
    return;
  }
});


app.use(r.routes()).listen({ port: 80, hostname: "0.0.0.0" });