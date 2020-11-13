if(!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
    console.log("不支持 enumerateDevices")
} else {
    navigator.mediaDevices.enumerateDevices()
    .then(gotDevices).catch(err=>{
        console.log(err);
    })
}

function gotDevices(deviceInfos){
    let parent = document.getElementById("parent");
    let str ='';
    deviceInfos.forEach(deviceInfo => {
        let {deviceId, groupId,kind,label} = deviceInfo
       str +=   ` <li><h3>${kind}</h3>---<p>${label}</p></li>`;

        // console.log(kind,
        //     'label= '+ label ,
        //     'id= ' + deviceId, 
        //     "groupId= " + groupId
        //     )  
    });
    console.log(str);
    $(parent).html(str);
   
}