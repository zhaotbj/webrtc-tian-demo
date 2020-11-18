var localVideo = document.querySelector("video#localvideo");
var remotevideo = document.querySelector("video#remotevideo");
var btnStart = document.querySelector("button#start");
var btnCall = document.querySelector("button#call");
var btnHangup = document.querySelector("button#hangup");


var offer = document.querySelector("textarea#offer");
var answer = document.querySelector("textarea#answer");
var localStream;
var pc1;
var pc2;
function getMediaStream(stream) {
    localVideo.srcObject = stream;
    localStream = stream;
}
function start() {
    if(!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.log("不支持")
        return
    } else {
        var constraints = {
            video: true,
            audio: false
        }
        navigator.mediaDevices.getUserMedia(constraints)
        .then(getMediaStream).catch(err=>console.log('错误',err))
    }
}

function getRemoteStream(e) {
    remotevideo.srcObject = e.streams[0];
}

function getOffer(desc) {
    pc1.setLocalDescription(desc);
    offer.value = desc.sdp;
    pc2.setRemoteDescription(desc);
    pc2.createAnswer()
    .then(getAnswer).catch(err=>{
        console.log('getOffer', err)
    })
}
// 远端
function getAnswer(desc) {
    pc2.setLocalDescription(desc);
    answer.value = desc.sdp;
    pc1.setRemoteDescription(desc);
}
function call(){
    pc1 = new RTCPeerConnection(); // 调用者
    pc2 = new RTCPeerConnection(); // 被调用者
    pc1.onicecandidate = (e)=>{
        pc2.addIceCandidate(e.candidate);
    }
    pc2.onicecandidate = (e) =>{
        pc1.addIceCandidate(e.candidate);
    }
    pc2.ontrack = getRemoteStream;
    // 本地采集的音视频流添加到本地
    localStream.getTracks().forEach(track=>{
        pc1.addTrack(track, localStream);
    })
    var offerOptions = {
        offerToReceiveAudio: 0,
        offerToReceiveVideo: 1
    }
    // 媒体协商
    pc1.createOffer(offerOptions)
    .then(getOffer)
    .catch(err=>{
        console.log("err", err);
    });
}
function hangup(){
    pc1.close();
    pc2.close();
}
btnStart.onclick = start;
btnCall.onclick = call;
btnHangup.onclick = hangup;