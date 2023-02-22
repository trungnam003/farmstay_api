const {HttpError, } = require('../../utils/error');
const ResponseAPI = require('../../utils/api_response');
const {Validate, Joi} = require('../../helpers/validate')
/**
* 
* @param {object} source object cần được validate vd req.params, req.body, req.query
* @param {object} target object chứa các key value, key là property của source cần validate - value là loại validate cho key
* @param {string} target.key
* @param {Validate} target.value
* 
*/
module.exports.validateParam = function (target){
    return (req, res, next)=>{
        const {error, } = Validate(req.params, target)
        if(error){
            const resError = new ResponseAPI({
                msg: "loi",
                msg_vi: "loi"
            })
            next(new HttpError({statusCode: 400, respone: resError}))
        }else{
            next();
        }
    }
}
module.exports.validateBody = function (target){
    return (req, res, next)=>{
        const {error, } = Validate(req.body, target)
        
        if(error){
            console.log(error)
            const resError = new ResponseAPI({
                msg: error.message,
            })
            next(new HttpError({statusCode: 400, respone: resError}))
        }else{
            return next();
        }
    }
}
module.exports.validateQuery = function (target){
    return (req, res, next)=>{
        const {error, } = Validate(req.query, target)
        
        if(error){
            const resError = new ResponseAPI({
                msg: "loi",
                msg_vi: "loi"
            })
            next(new HttpError({statusCode: 400, respone: resError}))
        }else{
            return next();
        }
    }
}
module.exports.Validate = Validate;
module.exports.Joi = Joi