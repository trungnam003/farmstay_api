
const e = require('express');
const config= require('../../../../config')
const ResponseAPI = require('../../../utils/api_response');
const {HttpError, } = require('../../../utils/error');

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
                return next(new HttpError({statusCode: 403, respone: new ResponseAPI({
                    msg: 'Account must be activated',
                    msg_vi: 'Tài khoản phải được kích hoạt',
                })}));
            }
        }
    }
}

const checkCustomerUser = function({isRequired=true}={}){
    return (req, res, next)=>{
        if(req.user){
            const {user_type} = req.user;
            if(user_type === config.user.customer){
                next()
            }else if(!isRequired){
                next();
            }else{
                return next(new HttpError({statusCode: 403, respone: new ResponseAPI({
                    msg: 'Unsuccessfully',
                    msg_vi: 'Không thành công',
                })}));
            }
        }
    }
}

module.exports = {setUrlAuthorization, checkUserActive, checkCustomerUser}