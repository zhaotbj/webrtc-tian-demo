var btnConn = document.querySelector("button#connserver");
var btnLeave = document.querySelector("button#leave");
var localVideo = document.querySelector("video#localvideo");
var remoteVideo = document.querySelector("video#remotevideo");
var remotevideoBox = document.getElementById("remotevideoBox");
var localStream;
var socket = null;
// var _roomid = '111111';
var state = "init";
var pc = null;  // peerConnect // 连接
function sendMessage(roomid, data) {
  console.log("send", roomid, data)
  if (socket) {
    socket.emit("message", roomid, data);
  }
}
function getAnswer(desc) {
    pc.setLocalDescription(desc);
    sendMessage('111111', desc);
}
// 异步操作 成功调用
function getOffer(desc) {
  console.log('desc',desc)
  pc.setLocalDescription(desc);
  sendMessage('111111', desc);
}
// 创建媒体协商
function call() {
  // 有人加入时调用
  if (state === 'joined_conn') {
    if (pc) {
      var options = {
        offerToReceiveAudio: 1,
        offerToReceiveVideo: 1
      }
      pc.createOffer(options)
        .then(getOffer)
        .catch(err => console.log("createOffer---err", err))
    }
  }
}
function getMediaStream(stream) {
  localVideo.srcObject = stream; // 本地视频
  localStream = stream;
  coon(); // 连接服务端socike
}
function start() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log("不支持");
    return;
  } else {
    var constraints = {
      video: true,
      audio: {
        channelCount:1, //单声道
        noiseSuppression: true, //降噪
        echoCancellation: true   // 回音消除
    }
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(getMediaStream)
      .catch((err) => console.log("错误", err));
  }
}

function connSignalServer() {
  // 开启本地视频
  start();
  return true;
}

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


function leave() {
  if (socket) {
    socket.emit("leave", "111111");
  }
  closePeerConnection(); // 关闭连接
  closeLocalMedia(); // 关闭本地设备
  btnConn.disabled = false;
  btnLeave.disabled = true;
}
// 创建一个连接
function createPeerConnecion() {
  console.log("创建 createPeerConnecion");
  if (!pc) {
    let iceServer = {
      "iceServers": [
        // {
        //   url: "stun:stun.l.google.com:19302",
        // },
      {
        // "url": "stun:stun1.l.google.com:19302",
        urls: "turn:124.70.0.135:3478?transport=udp",
        username: "zhizhong",
        credential: "123456"
      }
      //  { 
      //    "url":"stun:stun.l.google.com:19302", 
      //   }
    ],
    sdpSemantics: 'plan-b'
    };
    pc = new RTCPeerConnection(iceServer);
    // 协商的时候监听到 这里做端对端的消息日志
    pc.onicecandidate = (e) => {
      if (e.candidate) {
        // 
        console.log('-onicecandidate---', e.candidate);
        // 发送出去
        sendMessage('111111', {
          type: 'candidate',
          label: e.candidate.sdpMLineIndex,
          id: e.candidate.sdpMid,
          candidate: e.candidate.candidate
        })
      }
    }
    // 远端走ontrack
    pc.ontrack = (e) => {
      // 设置给远端 显示远端流
      remoteVideo.srcObject = e.streams[0];
      console.log('远端流',e, 'localStream',localStream);
        // let video = document.createElement('video');
            // video.controls = true;
            // video.autoplay = 'autoplay';
            // video.srcObject = e.streams[0];
            // // video.id = v.ele;
            // video.className = 'col-md-4';
            // console.log('-createElement--', video);
            // remotevideoBox.append(video);
    }
  }

  // 当连接在了，给本地设置 加到pc中音频和视频的媒体流
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      // 
      console.log('加到pc中音频和视频的媒体流',track);
      pc.addTrack(track);
    })
  }
}
// 关闭本地设备
function closeLocalMedia() {
  if (localStream && localStream.getTracks()) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  localStream = null;
}
// 关闭连接pc 释放资源
function closePeerConnection() {
  console.log("关闭--closePeerConnection");
  if (pc) {
    pc.close();
    pc = null;
  }
}
btnConn.onclick = connSignalServer;
btnLeave.onclick = leave;
