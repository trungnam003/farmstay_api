const {HttpError, STATUS_CODES} = require('../../utils/error')
const {ApiError} = require('../../utils/apiResponse');
const jwt = require('jsonwebtoken')
const {AUTHENTICATE} = require('../../constants/errors')

function handleJwtError(err, req, res, next){
    
    if (err instanceof jwt.JsonWebTokenError || err instanceof jwt.NotBeforeError){
        
        next(new HttpError({statusCode: 401, respone: new ApiError({
            message: AUTHENTICATE.TOKEN_INVALID.message,
            error: AUTHENTICATE.TOKEN_INVALID
        })}))
    }
    next(err);
}

function handleHttpError(err, req, res, next){
    if(err instanceof HttpError){
        if(err.statusCode === 401){
            return res.status(err.statusCode).json(err.respone); 
        }
        res.status(err.statusCode).json(err.respone);
    }else if(err instanceof Error){
        const {message, } = err;
        console.log(err)
        const httpError = new HttpError({
            statusCode: 500,
            respone: new ApiError({
                message: message,
        })});
        res.status(500).json(httpError.respone)
    }
}

const listArrayHandleError = [handleJwtError, handleHttpError];
module.exports = listArrayHandleError