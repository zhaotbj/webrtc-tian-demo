const Koa = require('koa');
const app = new Koa();
const staticFiles = require('koa-static');
const path = require("path");

app.use(staticFiles(path.resolve(__dirname, "public")));


app.use(async ctx => {
    ctx.body = 'Hello World';
  });

  app.listen(3000, () => {
    console.log(`starting in http://localhost:3000`)
})