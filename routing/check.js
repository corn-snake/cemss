import { Router } from "@oak/oak";

const check = new Router()
  .post("/staff/privilege", ctx => { })
  .post("/staff", ctx => { })
  .post("/alumni", ctx => { });
export default check;