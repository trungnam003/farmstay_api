
class ResponseAPI{
    constructor({msg, msg_vi, object={}}){
        
        if(msg){
            this.msg = msg
        }
        if(msg_vi){
            this.msg_vi = msg_vi
        }
        Object.assign(this, object)
    }
}

module.exports = ResponseAPI