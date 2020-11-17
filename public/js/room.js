var btnConn = document.querySelector("button#connserver");
var btnLeave = document.querySelector("button#leave");
var localVideo = document.querySelector("video#localvideo");
var remoteVideo = document.querySelector("video#remotevideo");
var localStream;
var socket;
var roomid = '111111';
var state = "init";
var pc = null;
function sendMessage(roomid, data) {
    console.log("send", roomid, data)
    if(socket) {
        socket.emit("message", roomid, data);
    }
}
function getOffer(desc){
    pc.setLocalDescription(desc);
    sendMessage(roomid, desc);
}
function call() {
    if(state ==='joined_conn') {
        if(pc) {
            var options = {
                offerToRecieveAudio: 1,
                offerToRecieveVideo: 1
            }
            pc.createOffer(options)
            .then(getOffer)
            .catch(err=>console.log("createOffer---err", err))
        }
    }
}
function getMediaStream(stream) {
  localVideo.srcObject = stream;
  localStream = stream;
  coon(); // 链接
}
function start() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    console.log("不支持");
    return;
  } else {
    var constraints = {
      video: true,
      audio: false,
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

function coon() {
  socket = io.connect('http://localhost:3000');
  socket.on("joined", (roomid, id) => {
    console.log("收到---joined", roomid, id);
    state = "joined";
    createPeerConnecion();
    btnConn.disabled = true;
    btnLeave.disabled = false;
    console.log("joined-state--", state);
  });
  socket.on("otherjoin", (roomid, id) => {
    console.log("-otherjoin-", roomid, id);
    if (state === "joined_unbind") {
      createPeerConnecion(); // 创建链接并绑定
    }
    state = "joined_conn";
    // 媒体协商
    console.log("otherjoin-state--", state);
  });
  socket.on("full", (roomid, id) => {
    console.log("-full-", roomid, id);
    state = "leaved";
    console.log("full-state--", state);
    socket.disconnect();
    alert("房间已满");
    btnConn.disabled = false;
    btnLeave.disabled = true;
  });
  socket.on("leaved", (roomid, id) => {
    console.log("-leaved-", roomid, id);
    state = "leaved";
    socket.disconnect();
    btnConn.disabled = false;
    btnLeave.disabled = true;
    console.log("leaved-state--", state);
  });
  socket.on("bye", (roomid, id) => {
    console.log("-bye-", roomid, id);
    state = "joined_unbind"; // 未绑定状态
    console.log("bye-state--", state);
    closePeerConnection();
  });
  socket.on("message", (roomid, id) => {
    console.log("收到了客户端的 message", roomid, id);
    // 媒体协商
  });
  socket.emit("join", "111111"); // 写死加入的房间
  return;
}
function closeLocalMedia() {
  if (localStream && localStream.getTracks()) {
    localStream.getTracks().forEach((track) => {
      track.stop();
    });
  }
  localStream = null;
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
        {
          url: "stun:stun.l.google.com:19302",
        },
      ],
      sdpSemantics: "plan-b",
    };
    pc = new RTCPeerConnection(iceServer);
    // 协商的时候监听到 这里做端对端的消息日志
    pc.onicecandidate = (e) =>{
        if(e.candidate) {
            // 
            console.log('-onicecandidate---');
            
        }
    }
    // 远端走ontrack
    pc.ontrack = (e) =>{
        // 设置给远端 显示远端流
        remoteVideo.srcObject = e.streams[0];
    }
  }

  if(localStream) {
      localStream.getTracks().forEach((track)=>{
          pc.addTrack(track);
      })
  }
}

function closePeerConnection() {
    console.log('--closePeerConnection-');
    
    if(pc) {
        pc.close();
        pc = null;
    }
}
function closePeerConnection() {
  console.log("关闭--closePeerConnection");
  if (pc) {
    pc.close();
    pc = null;
  }
}
btnConn.onclick = connSignalServer;
btnLeave.onclick = leave;
