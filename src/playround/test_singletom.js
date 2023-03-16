const socketio = require('socket.io')
const {createServer} = require('http')
const sv  = createServer()
function abc(sv){
    let io = new socketio.Server(sv)
    return ()=>{
        return Object.freeze(io);
    }
}

class SingletonClass {
    static instance = null;
    
    constructor(server) {
      if (SingletonClass.instance) {
        return SingletonClass.instance;
      }
      if(!server){
        throw new Error('Phải khởi tạo server trước')
    }
    
      this.io = new socketio.Server(server);
      SingletonClass.instance = this;
      
      /* Khởi tạo các thuộc tính và phương thức */
    }


    static initIo(server){
        return new SingletonClass(server)
    }

    static getInstance(server) {
      if (!SingletonClass.instance) {
        
        SingletonClass.instance = new SingletonClass(server);
      }
      return SingletonClass.instance;
    }
    /* Các phương thức khác */
}

SingletonClass.initIo(sv)
const a = new SingletonClass();
const b = new SingletonClass();

console.log(a.io===b.io);