const Koa = require('koa');
const app = new Koa();
const staticFiles = require('koa-static');
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
app.use(staticFiles(path.resolve(__dirname, "public")));



// http.createServer(app.callback());
const options = {
key: fs.readFileSync("./server.key", "utf8"),
cert: fs.readFileSync("./server.cert", "utf8")
};
https.createServer(options, app.callback()).listen(3000, ()=>{
    console.log('开始了')
});

// app.use(async ctx => {
//     ctx.body = 'Hello World';
//   });

//   app.listen(3000, () => {
//     console.log(`starting in http://localhost:3000`)
// })