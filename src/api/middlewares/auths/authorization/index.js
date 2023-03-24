const config= require('../../../../config')
const {ApiError} = require('../../../utils/apiResponse');
const {HttpError, } = require('../../../utils/error');
const {Customer}                         = require('../../../models/mysql');

const setUrlAuthorization = (currentUrl)=>{
    return (req, res, next)=>{
        if(typeof currentUrl === 'string' && currentUrl.startsWith('/')){
            if(req.urlRbac && Array.isArray(req.urlRbac)){
                req.urlRbac.push(currentUrl)
            }else{
                req.urlRbac = [currentUrl]
            }
            next()
        }else{
            throw new Error('URL RBAC không hợp lệ')
        }
    }
}

const checkUserActive = function({isRequired=true}={}){
    return (req, res, next)=>{
        
        if(req.user){
            const {is_active} = req.user;
            if(is_active){
                next()
            }else if(!isRequired){
                next();
            }else{
                return next(new HttpError({statusCode: 403, respone: new ApiError({
                    message: 'Account must be activated',
                })}));
            }
        }
    }
}

const checkCustomerUser = function({isRequired=true}={}){
    return async (req, res, next)=>{
        try {
            if(req.user){
                const {user_type, id:user_id} = req.user;
                if(user_type === config.user.customer){
                    const customer = await Customer.findOne({where: {user_id}})
                    req.customer = customer;
                    next()
                }else if(!isRequired){
                    next();
                }else{
                    return next(new HttpError({statusCode: 403, respone: new ApiError({})}));
                }
            }
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = {setUrlAuthorization, checkUserActive, checkCustomerUser}