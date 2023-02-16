const {HttpError, STATUS_CODES} = require('../../utils/error')
const ResponseAPI = require('../../utils/api_response');
const jwt = require('jsonwebtoken')
function handleJwtError(err, req, res, next){
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.NotBeforeError){
        const {message} = err
        next(new HttpError({statusCode: 401, respone: new ResponseAPI({
            msg: message,
            msg_vi: 'Xác thực không thành công'
        })}))
    }
    next(err);
}

function handleHttpError(err, req, res, next){
    if(err instanceof HttpError){
        if(err.statusCode === 401){
            Object.assign(err.respone, {login_required: true})
        }
        res.status(err.statusCode).json(err.respone);
    }else if(err instanceof Error){
        const {message, } = err;
        const httpError = new HttpError({
            statusCode: 500,
            respone: message
        })
        res.status(500).json(httpError.respone)
    }
}

const listArrayHandleError = [handleJwtError, handleHttpError];
module.exports = listArrayHandleError