const STATUS_CODES = require('./status_code')
const {ApiError} = require('../apiResponse');

function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
  }

class HttpError extends Error{
    constructor({statusCode, respone = ""}){
        super('HTTP ERROR')
        
        if(STATUS_CODES.hasOwnProperty(statusCode) && statusCode>=400 && statusCode<=600){
            this.statusCode = statusCode;
            this.nameError = STATUS_CODES[statusCode];
            let message = toTitleCase(STATUS_CODES[statusCode].replaceAll('_', ' ')+'')
            if(typeof respone === 'string'){
                this.respone = respone==="" 
                ? new ApiError({code: statusCode, message})
                : new ApiError({code: statusCode, message: respone});
            }else if(respone instanceof ApiError){
                respone.code = statusCode;
                if(respone.message === '' || !respone.message){
                    respone.message = message
                }
                this.respone = respone
            }
            
        }else{
            throw new Error('This status code does not exist')
        }
    }
    
}

module.exports ={ HttpError}