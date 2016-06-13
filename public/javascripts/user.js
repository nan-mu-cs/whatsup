
$(document).ready(function(){
    var socket = io.connect('http://localhost:3000');
    var senderid = document.getElementById('senderid').value;
    var username = $('#username').val();
    socket.emit('add user',senderid);
    socket.on(senderid,function(data){
        alert(data);
        console.log(data);  
    });

    $('#dialog').hide();
    $.get('/friendlist',function(data){
        for(i = 0;i<data.length;i++){
            //alert(user.username);
            $('#friendlist').append(
                '<li><a class="friend" href="'+data[i]._id+'">'+data[i].username+'</a></li>'
            );   
        }
    });
    $(document).on('click','.friend',function(){
        var id = $(this).attr('href');
        //var username = $(this).text();
        $('#dialog').show();
        $("#receiverid").val(id);
        // $.get('/chat',{id:id,username:name},function(data){
            
        // })
        return false;
    });
    $('#sendmessage').click(function(){
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
        li.innerText = username+' say:'+message;
        document.getElementById('messagelist').appendChild(li);
        return false; 
    })
})