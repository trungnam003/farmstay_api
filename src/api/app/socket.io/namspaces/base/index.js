const SocketIoSingleton = require('../../SocketIoSingleton')

function baseSocketIo(){

    const io = new SocketIoSingleton().io
    
    io.on('connection', function(socket){
        socket.emit('message', 'Wellcome')
        // Broadcast cho mn trừ người kết nối biết
        socket.broadcast.emit('message', "A user has join chat")
        io.emit('ping', 'ok')
        socket.on("joinRoom", ( username, room ) => {
            socket.join(room)
            io.to(room).emit("roomUsers", "hello");
        })
        
        socket.on('disconnect', ()=>{
            io.emit('message', 'A user has left chat')
        })
        
        //listen chat msg
        socket.on('chatMessage', msg=>{
            io.emit('message', msg)

        })
    });

    
    
}

module.exports = baseSocketIo