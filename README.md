## 学习笔记
## 音视频WebRTC实时互动直播技术入门与实战
git地址：https://github.com/zhaotbj/webrtc-tian-demo

```
npm install

node app.js // 默认端口https://localhost:3000
全局安装nodemon 用 nodemon app.js // 热更新启动
node启动的是https 可以掉起本地获取摄像头权限

浏览器输入https://localhost:3000

https://localhost:3000/ 获取音视频设备信息
https://localhost:3000/room 完整项目 展示本地流 连接远程流
https://localhost:3000/mediastream 

```

![](/assets/demo.png)
![](/assets/demo1.png)
> WebRTC 主要提供了三个核心的 API：

- getUserMedia：可以获取本地的媒体流，一个流包含几个轨道，比如视频和音频轨道。
- RTCPeerConnection：用于建立 P2P 连接以及传输多媒体数据。
- RTCDataChannel：建立一个双向通信的数据通道，可以传递多种数据类型。


如果假设，对等体 A 想要与对等体 B 建立 WebRTC 连接，则需要执行以下操作：

- Peer A使用 ICE 生成它的 ICE候选者。在大多数情况下，它需要 NAT（STUN）的会话遍历实用程序或 NAT（TURN）服务器的遍历使用中继。
- Peer A 将 ICE候选者 和会话描述捆绑到一个对象中。该对象在对等体 A 内存储为本地描述（对等体自己的连接信息），并通过信令机制传送给对等体 B.这部分称为要约。
- 对等体 B 接收该提议并将其存储为远程描述（另一端的对等体的连接信息）以供进一步使用。对等体 B 生成它自己的 ICE候选者和会话描述，将它们存储为本地描述，并通过信令机制将其发送给对等体A.这部分称为答案。 （注：如前所述，步骤2和3中的ICE候选人也可以单独发送）
- 对等体 A 从对等体 B 接收答案并将其存储为远程描述。
- 这样，两个对等体都具有彼此的连接信息，并且可以通过 WebRTC 成功开始通信！


```javascript
// 获取音视频设备初始化本地流
function start() {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("不支持");
        return
    } else {
        var deviceId = viodeSource.value;
        // 音频视频采集
        var constraints = {
            video: {
                width: 640,
                height: 480,
                frameRate: 15,//30, // 帧率
                // facingMode: "enviroment" // 摄像头
                deviceId: deviceId ? deviceId : undefined  // 视频设备id  // 设置之后可以在手机上切换摄像头 前置后置切换
            },
            audio: {
                noiseSuppression: true, //降噪
                echoCancellation: true   // 回音消除
            }
        }
        // 只设置音频
        // var constraints = {
        //     video: false,
        //     audio: true
        // }
        navigator.mediaDevices.getUserMedia(constraints)
        .then(gotMediaStream)
        .then(gotDevices)
        .catch(handleError)
    }
}

function gotMediaStream(stream) {
    console.log(stream)
     videoplay.srcObject = stream;  //设置视频流
     window.stream = stream;
     //  获取视频约束
    var videoTrack = stream.getVideoTracks()[0];
    var videoConstraints = videoTrack.getSettings();
    constraints.textContent = JSON.stringify(videoConstraints); //打印在页面上
    
    // audioplayer.srcObject = stream; // 只设置音频
    return navigator.mediaDevices.enumerateDevices();
    // promise返回 then 后接口 then
}

```

### 建立信令服务器
使用node+koa2搭建信令服务器
引入socket.io 

`npm i socket.io --save`
```javascript
// 服务器端代码
const Koa = require('koa');
const app = new Koa();
const staticFiles = require('koa-static');
const path = require("path");
// const http = require("http");
const https = require("https");
const fs = require("fs");
const socketIo = require('socket.io');
const log4js = require("log4js");
let logger = log4js.getLogger();
logger.level = "debug";
app.use(staticFiles(path.resolve(__dirname, "public")));


const options = {
    key: fs.readFileSync("./server.key", "utf8"),
    cert: fs.readFileSync("./server.cert", "utf8")
};
let server = https.createServer(options, app.callback())
// const server = http.createServer(app.callback());

server.listen(3000, () => {
    console.log(`开始了localhost:${3000}`)
});
const io = socketIo(server);
io.on('connection', (socket) => {
    socket.on("join", (room) => {
        socket.join(room);
        
        // var myRoom = io.sockets.adapter.rooms[room]; // 获取当前房间， rooms是Map对象 Map对象中是set对象 踩坑
        var myRoom = io.sockets.adapter.rooms.get(room); // get获取Map  size获取大小
        // 用户数量
        var users = myRoom ? myRoom.size : 0;
        logger.debug('--房间用户数量--',users, 'room',room);
        // 是一对一的直播
        if(users < 9) { // 小于三个人
            socket.emit("joined", room, socket.id);
            if(users>1) {
                socket.to(room).emit("otherjoin", room, socket.id);
            }
        } else {
            // 大于三 剔除房间
            socket.leave(room);
            socket.emit("full", room, socket.id); // 房间已满
        }
        // 发给自己
        // socket.emit("joined", room, socket.id); 
        // 发给除自己之外的这个节点上的所有人 // 给这个站点所有人发 除了自己全部
        // socket.broadcast.emit("joined", room, socket.id);
        //    发给除了自己之外房间内的所有人
        //    socket.to(room).emit("joined",room, socket.id)
        //    发给给房间内所有人
        // io.in(room).emit('joined', room, socket.id);
        
    });
    socket.on("leave", (room) => {
        // var myRoom = io.sockets.adapter.rooms[room];
        var myRoom = io.sockets.adapter.rooms.get(room); 
        console.log("myRoom",myRoom);
        var users  =  myRoom ? myRoom.size : 0;
        logger.debug('--房间用户数量离开房间--',users-1);
        //
        // socket.broadcast.emit("leaved", room, socket.id);
        socket.to(room).emit('bye', room, socket.id);
        socket.emit("leaved", room, socket.id);
        // socket.leave(room);
        // io.in(room).emit('joined', room, socket.id);
    })
    socket.on("message", (room, data)=>{
        console.log("message",room)
        // socket.broadcast.emit("message",room, data)
        socket.to(room).emit("message",room, data)
    })
});

```
前端代码

 引入`<script src="../js/socket.io.min.js"></script>`
```javascript

//客户端代码
// 连接sockit
function coon() {
  console.log("coon")
  socket = io.connect();
  // 新用户加入
  socket.on("joined", (roomid, id) => {
    console.log("收到---joined", roomid, id);
    state = "joined";
    createPeerConnecion();
    btnConn.disabled = true;
    btnLeave.disabled = false;
    console.log("recevie--joined-state--", state);
  });
  // 其他加入
  socket.on("otherjoin", (roomid, id) => {
    console.log("-otherjoin-", roomid, id);
    // 开始媒体协商
    if (state === "joined_unbind") {
      createPeerConnecion(); // 创建链接并绑定
    }    
    state = "joined_conn";
    call();
    // 媒体协商
    console.log("recevie--otherjoin-state--", state);
  });
  // 用户已满
  socket.on("full", (roomid, id) => {
    console.log("-full-", roomid, id);
    state = "leaved";
    console.log("recevie--full-state--", state);
    socket.disconnect(); // 断开连接
    alert("房间已满");
    // 有人退出后可以重连
    btnConn.disabled = false;
    btnLeave.disabled = true;
  });
  // 离开
  socket.on("leaved", (roomid, id) => {
    console.log("-leaved-", roomid, id);
    state = "leaved";
    socket.disconnect();
    btnConn.disabled = false;
    btnLeave.disabled = true;
    console.log("recevie---leaved-state--", state);
  });
  // 离开了
  socket.on("bye", (roomid, id) => {
    console.log("-bye-", roomid, id);
    state = "joined_unbind"; // 未绑定状态
    console.log("bye-state--", state);
    closePeerConnection();
  });
  // 服务端不关心，客户端处理这些消息  收到端对端的消息 怎么处理
  socket.on("message", (roomid, data) => {
    console.log("收到了客户端的 message", roomid, data);
    // 媒体协商
    if(data) {
      if(data.type ==='offer') {
        // 如果收到是offer 对端已经创建好了
        pc.setRemoteDescription(new RTCSessionDescription(data));
			//create answer
			  pc.createAnswer()
				.then(getAnswer)
				.catch(err=>{console.log("err 创建失败getanswer")});
      } else if(data.type ==='answer') {
        pc.setRemoteDescription(new RTCSessionDescription(data));
      } else if(data.type ==='candidate') {
        var candidate = new RTCIceCandidate({
          sdpMLineIndex: data.label,
          candidate: data.candidate
        });
        // 加入到本端 peercollect
        pc.addIceCandidate(candidate)
				.then(()=>{
					console.log('Successed to add ice candidate');	
				})
				.catch(err=>{
					console.error(err);	
				});
      } else {
        console.error("the message is invalid!", data);
      }
    }
  });
  // 发送消息
  socket.emit("join", "111111"); // 写死加入的房间
  return;
}
```
## 创建RTCPeerConnection
WebRTC 中，我们通过 [RTCPeerConnection](https://developer.mozilla.org/zh-CN/docs/Web/API/RTCPeerConnection/RTCPeerConnection)建立通信双方的点对点连接，该接口提供了创建，保持，监控，关闭连接的方法的实现。
为了建立连接，我们需要一台信令服务器，用于浏览器之间建立通信时交换各种元数据（信令）。同时，还需要 STUN 或者 TURN 服务器来完成 NAT 穿透。连接的建立主要包含两个部分：信令交换和设置 ICE 候选。

RTCPeerConnection
常见开源的turn|stun服务器
```
//stun:stun.l.google.com:19302
// stun.xten.com   
// stun.voipbuster.com  
// stun.sipgate.net  
// stun.ekiga.net
// stun.ideasip.com
// stun.schlund.de
// stun.voiparound.com
// stun.voipbuster.com
// stun.voipstunt.com
// stun.counterpath.com
// stun.1und1.de
// stun.gmx.net
// stun.callwithus.com
// stun.counterpath.net
// stun.internetcalls.com
// numb.viagenie.ca
```
创建peer
```javascript
 let iceServer = {
        "iceServers": [
          
          // {
          //   "url": "stun:stun.l.google.com:19302"
          // }
        ],
        sdpSemantics: 'plan-b',
        // sdpSemantics: 'unified-plan',
        // bundlePolicy: 'max-bundle',
        // iceCandidatePoolSize: 0
      };
      // 创建
      //兼容浏览器的PeerConnection写法
      let PeerConnection = (window.PeerConnection ||
        window.webkitPeerConnection00 ||
        window.webkitRTCPeerConnection ||
        window.mozRTCPeerConnection)
      // 创建
      var peer = new RTCPeerConnection(iceServer);
```

## 谷歌调试
谷歌调试 ： chrome://webrtc-internals
## 回音消除和降噪
noiseSuppression
在Firefox中运行堪称完美，当关掉这个约束时，我能非常清晰的听到麦克风收
## 参考资料：
- https://xirsys.com/developers/
- https://www.yuque.com/wangdd/opensips/lxsndd 

常用的视频会议和直播架构

- https://www.cnblogs.com/yjmyzz/p/webrtc-multiparty-call-architecture.html

vue 使用 socket https://www.imooc.com/article/289816

