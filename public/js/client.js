if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("不支持 enumerateDevices")
} else {
    // 获取视频设备
    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices).catch(err=>{
        console.log(err);
    })
}

var audioSource = document.getElementById("audioinput");
var audioOutput = document.getElementById("audiooutput");
var viodeSource = document.getElementById("videoinput");
function gotDevices(deviceInfos){
    var vConsole = new VConsole();
    console.log(deviceInfos);
    deviceInfos.forEach(deviceInfo => {
        var option = document.createElement('option');
            option.value = deviceInfo.kind;
            option.text = deviceInfo.deviceId
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
    });
   
}
// deviceInfos
// [{"deviceId":"","kind":"audioinput","label":"","groupId":"efe47bfc7d23d1a2a36175c4f40b4fed115f500c04d545d20925b28f45646352"},
// {"deviceId":"","kind":"videoinput","label":"","groupId":"7aac510847a10ad2f88458bc62f77142100a7e8b75af9929bb516bcb16f0481a"},
// {"deviceId":"","kind":"audiooutput","label":"","groupId":"efe47bfc7d23d1a2a36175c4f40b4fed115f500c04d545d20925b28f45646352"}]