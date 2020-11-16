'use strict'

var username = document.querySelector("input#username");
var room = document.querySelector("input#room");
var btnConnect = document.querySelector("button#connect");
var output = document.querySelector("textarea#output");
var input = document.querySelector("textarea#input");
var send = document.querySelector("button#send");

var socket;
btnConnect.onclick = ()=>{
    // connect
    socket = io.connect();
    // message
    socket.on("joined", (room, id)=>{

    })
    socket.on("leaved", (room, id)=>{
        
    })
    // send message
    socket.on("message", (room, id)=>{
        
    })
}