import { Router } from "@oak/oak";
import { dev } from "../lib/sql.js";
import { decodeToken } from "../lib/jwt.js";

const devRoutes = new Router()
    .post("/classlistof", async ctx => {
        const { tkn, type } = await ctx.request.body.json();
        return ctx.response.body = await dev.classfresh(await decodeToken(await tkn), await type);
    });

export default devRoutes;