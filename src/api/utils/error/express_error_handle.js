const STATUS_CODES = require('./status_code')
const ResponeAPI = require('../api_response');
class HttpError extends Error{
    constructor({statusCode, respone = ""}){
        super('HTTP ERROR')
        
        if(STATUS_CODES.hasOwnProperty(statusCode) && statusCode>=400 && statusCode<=600){
            this.statusCode = statusCode;
            this.nameError = STATUS_CODES[statusCode];
            if(typeof respone === 'string'){
                this.respone = respone==="" 
                ? new ResponeAPI({msg: STATUS_CODES[statusCode].replaceAll('_', ' ')})
                : new ResponeAPI({msg: respone});
            }else if(respone instanceof ResponeAPI){
                this.respone = respone
            }
            
        }else{
            throw new Error('This status code does not exist')
        }
    }
    
}

module.exports ={ HttpError}