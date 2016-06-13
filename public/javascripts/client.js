alert('test');
var socket = io.connect('http://localhost:3000');
var senderid = document.getElementById('senderid').value;
socket.emit('add user',senderid);
socket.on('new message',function(data){
     console.log(data);
});
function sendMessage(){
    var receiverid = document.getElementById('receiverid').value;
    var message = document.getElementById('message').value;
    if(!message)
        return false;
    socket.emit('message from client',{
        sender:senderid,
        receiverid:receiverid,
        message:message,
    });
    var li = document.createElement("li");
    li.innerText = message;
    document.getElementById('messagelist').appendChild(li);
    return false; 
}