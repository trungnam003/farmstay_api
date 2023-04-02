const socketio = require('socket.io');

class SocketIoSingleton {
    static instance = null;
    
    constructor(server) {
        if (SocketIoSingleton.instance) {
            return SocketIoSingleton.instance;
        }else{
            if(!server){
                throw new Error('Phải khởi tạo server trước')
            }else{
                this.io = new socketio.Server(server, {cors: {origin: '*'}});
                SocketIoSingleton.instance = this;
            }
        }
    }

    static initSocketIo(server){
        if(server){
            if(!SocketIoSingleton.instance){
                return new SocketIoSingleton(server)
            }
        }else{
            throw new Error('Phải khởi tạo server trước')
        }
        
    }

    static getInstance(server) {
      if (!SocketIoSingleton.instance) {
        
        SocketIoSingleton.instance = new SocketIoSingleton(server);
      }
      return SocketIoSingleton.instance;
    }
    /* Các phương thức khác */
}


module.exports = SocketIoSingleton