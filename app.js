const Koa = require('koa');
const app = new Koa();
const staticFiles = require('koa-static');
const path = require("path");
const http = require("http");
const https = require("https");
const fs = require("fs");
const socketIo = require('socket.io');
const log4js = require("log4js");
let logger = log4js.getLogger();
app.use(staticFiles(path.resolve(__dirname, "public")));



// http.createServer(app.callback());
const options = {
key: fs.readFileSync("./server.key", "utf8"),
cert: fs.readFileSync("./server.cert", "utf8")
};
let server = https.createServer(options, app.callback())
const io = socketIo(server);
io.sockets.on('connection', (socket) => { 
    socket.on("join", (room)=> {
        socket.join(room);
        var myRoom = io.sockets.adapter.rooms[room];
        // 用户数量
       var users =  Object.keys(myRoom.sockets).length;
       logger.log("join-users", users);
    //    返回
       socket.emit("joined", room, socket.id);
    //    除了自己之外的人
    //    socket.to(room).emit("joined",room, socket.id)
    //    给房间所有人发
    // 给这个站点所有人发 除了自己全部
    // socket.broadcast.emit("joined", room, socket.id);
    });
    socket.on("leave",()=> {
        var myRoom = io.sockets.adapter.rooms[room];
        var users =  Object.keys(myRoom.sockets).length;
        // users-1
        logger.log("leave-users", users-1);
        socket.leave(room);
        socket.broadcast.emit("joined", room, socket.id);
    })
});
server.listen(3000, ()=>{
    console.log(`开始了localhost:${3000}`)
});

// app.use(async ctx => {
//     ctx.body = 'Hello World';
//   });

//   app.listen(3000, () => {
//     console.log(`starting in http://localhost:3000`)
// })