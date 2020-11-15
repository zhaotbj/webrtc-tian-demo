<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
  mounted() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("不支持 enumerateDevices");
    } else {
      navigator.mediaDevices
        .enumerateDevices()
        .then(gotDevices)
        .catch(err => {
          console.log(err);
        });
    }

    var audioinput = document.getElementById("audioinput");
    var audiooutput = document.getElementById("audiooutput");
    var videoinput = document.getElementById("videoinput");
    function gotDevices(deviceInfos) {
      let parent = document.getElementById("parent");
      let str = "";
      console.log(deviceInfos);

      deviceInfos.forEach(deviceInfo => {
        let { deviceId, groupId, kind, label } = deviceInfo;
        var option = document.createElement("option");
        option.value = kind;
        option.innerText = kind;
        str += ` <li><h3>${kind}</h3>---<p>${groupId}</p></li>`;

        // console.log(kind,
        //     'label= '+ label ,
        //     'id= ' + deviceId,
        //     "groupId= " + groupId
        //     )

        if (kind === "audiooutput") {
          audiooutput.appendChild(option);
        } else if (kind === "audiooutput") {
          audiooutput.appendChild(option);
        } else {
          videoinput.appendChild(option);
        }
      });

      // $(parent).html(str);
    }
    // deviceInfos
    // [{"deviceId":"","kind":"audioinput","label":"","groupId":"efe47bfc7d23d1a2a36175c4f40b4fed115f500c04d545d20925b28f45646352"},
    // {"deviceId":"","kind":"videoinput","label":"","groupId":"7aac510847a10ad2f88458bc62f77142100a7e8b75af9929bb516bcb16f0481a"},
    // {"deviceId":"","kind":"audiooutput","label":"","groupId":"efe47bfc7d23d1a2a36175c4f40b4fed115f500c04d545d20925b28f45646352"}]
  }
};
</script>

<style>
</style>
