const STATUS_SUCCESS = 'success';
const STATUS_ERROR = 'error';


class ResponseAPI{
    constructor({status,object={}}){
        this.status = status;
        Object.assign(this, object)
    }
}
class ApiSuccess extends ResponseAPI{
    constructor({data,object={}}){
        super({status: STATUS_SUCCESS,object:object})
        if(data){
            this.data = data;
        }
        
    }
}

class ApiError extends ResponseAPI{
    constructor({message,code, error,object = {}}){
        super({status: STATUS_ERROR,object:object})
        if(code){
            this.code = code;
        }
        if(error){
            this.error = error;
        }
        this.message = message
    }
}

module.exports = {ResponseAPI, ApiSuccess, ApiError}