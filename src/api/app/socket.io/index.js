const SocketIoSingleton = require('./SocketIoSingleton')
const baseSocketIo = require('./namspaces/base')
const farmstaySocketIo = require('./namspaces/farmstay')
const farmstayRoomSoketIo = require('./namspaces/farmstay_room')


function socketio(server){
    const io = SocketIoSingleton.initSocketIo(server).io;
    baseSocketIo();
    farmstayRoomSoketIo();
    // farmstaySocketIo();
    return io;
}

module.exports = {
    SocketIoSingleton, socketio
}