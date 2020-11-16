var videoplay = document.querySelector("video#player");
var audioSource = document.querySelector("select#audioSource");
var audioOutput = document.querySelector("select#audioOutput");
var viodeSource = document.querySelector("select#viodeSource");
var filterSelect = document.querySelector("select#filter");
var snapshot = document.querySelector("button#snapshot");
var picture = document.querySelector("canvas#picture");
picture.width = 320;
picture.height = 240;
// 获取音频
var audioplayer = document.querySelector("audio#audioplayer");
var constraints = document.querySelector("div#constraints");

var recvideo = document.querySelector("video#recplayer");
var btnRecord = document.querySelector("button#record");
var btnPlay = document.querySelector("button#recplay");
var btnDownload = document.querySelector("button#download");
var buffer;
var mediaRecorder;
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

function gotDevices(deviceInfos) {
    // var vConsole = new VConsole();
    console.log(JSON.stringify(deviceInfos))
    deviceInfos.forEach(deviceInfo => {
            var option = document.createElement("option");
            option.text = deviceInfo.label;
            option.value = deviceInfo.deviceId;
            if(deviceInfo.kind === 'audioinput') {
                audioSource.appendChild(option);
            } else if (deviceInfo.kind === 'audiooutput'){
                audioOutput.appendChild(option);
            } else if (deviceInfo.kind === 'videoinput') {
                viodeSource.appendChild(option);
            }
    });
}
function handleError(err) {
    console.log(err)
}

// 
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

start();
// 视频切换的时候再次调用
viodeSource.onchange = start;
filterSelect.onchange = function() {
    // 设置视频效果 滤镜 也就是给video设置css
    videoplay.className = filterSelect.value;
}

// 截图
snapshot.onclick = function (){
    picture.className = filterSelect.value; // 设置滤镜
    picture.getContext("2d").drawImage(videoplay, 0, 0, picture.width, picture.height);
}
function handleDataAvailable(e) {
    if(e && e.data && e.data.size>0) {
        buffer.push(e.data);
    }
}
// 开始
 function startRecord(){
     buffer = [];
     var options = {
        mimeType: 'video/webm;codecs=vp8'
     }
     if(!MediaRecorder.isTypeSupported(options.mimeType)) {
         console.error(`${options.mimeType}不支持`)
     }
    try {
        mediaRecorder = new MediaRecorder(window.stream, options);
    } catch (error) {
        console.error("创建失败了", error);
        return
    }
    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start(10); // 切片
 }
 function stopRecord(){
    mediaRecorder.stop();
 }
// 开始录制
btnRecord.onclick = ()=>{
    if(btnRecord.textContent==='Start Record') {
        startRecord();
        btnRecord.textContent = 'Stop Record';
        btnPlay.disabled = true;
        btnDownload.disabled = true;
    } else {
        stopRecord();
        btnRecord.textContent = 'Start Record';
        btnPlay.disabled = false;
        btnDownload.disabled = false;
    }
}
// 播放
btnPlay.onclick = ()=>{
    var blob = new Blob(buffer, {type: "video/webm"});
    recvideo.src = window.URL.createObjectURL(blob);
    recvideo.srcObject = null;
    recvideo.controls = true;
    recvideo.play();
}
// 下载
btnDownload.onclick = ()=> {
    var blob = new Blob(buffer, {type: "video/webm"});
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.style.display = 'none';
    a.download = 'text.webm';
    a.click();
}
// https://localhost:3000/mediastream.html