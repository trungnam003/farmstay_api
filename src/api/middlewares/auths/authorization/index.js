const config= require('../../../../config')
const {ApiError} = require('../../../utils/apiResponse');
const {HttpError, } = require('../../../utils/error');
const {Customer, Employee}                         = require('../../../models/mysql');
const {AUTHORIZATION} = require('../../../constants/errors')

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
                    error: AUTHORIZATION.USER_NOT_ACTIVED
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
                    if(!customer){
                        return next(new HttpError({statusCode: 403, respone: new ApiError({
                            message: AUTHORIZATION.MUST_BE_CUSTOMER.message,
                            error: AUTHORIZATION.MUST_BE_CUSTOMER
                        })}));
                    }
                    next()
                }else if(!isRequired){
                    next();
                }else{
                    return next(new HttpError({statusCode: 403, respone: new ApiError({
                        message: AUTHORIZATION.MUST_BE_CUSTOMER.message,
                        error: AUTHORIZATION.MUST_BE_CUSTOMER
                    })}));
                }
            }
        } catch (error) {
            return next(error);
        }
    }
}

const checkEmployeeUser = function({isRequired=true}={}){
    return async (req, res, next)=>{
        try {
            if(req.user){
                const {user_type, id:user_id} = req.user;
                if(user_type === config.user.employee){
                    const employee = await Employee.findOne({where: {user_id}})
                    req.employee = employee;
                    if(!employee){
                        return next(new HttpError({statusCode: 403, respone: new ApiError({
                            message: AUTHORIZATION.MUST_BE_EMPLOYEE.message,
                            error: AUTHORIZATION.MUST_BE_EMPLOYEE
                        })}));
                    }
                    next()
                }else if(!isRequired){
                    next();
                }else{
                    return next(new HttpError({statusCode: 403, respone: new ApiError({
                        message: AUTHORIZATION.MUST_BE_EMPLOYEE.message,
                        error: AUTHORIZATION.MUST_BE_EMPLOYEE
                    })}));
                }
            }
        } catch (error) {
            return next(error);
        }
    }
}

module.exports = {setUrlAuthorization, checkUserActive, checkCustomerUser, checkEmployeeUser}