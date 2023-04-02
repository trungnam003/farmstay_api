const {HttpError, }             = require('../utils/error');
const {ApiError, ApiSuccess}    = require('../utils/apiResponse');
const bcrypt       = require('bcrypt');
const {addJwtIdToBlacklist}                 = require('../helpers/redis/blacklistJwt')
const config                                = require('../../config')
const {handleSendOtpToEmailUser, handleActiveUser, 
    handleSendEmailOtpForgotPassword, handleVerifyOtpByEmail,
handleResetPasswordUserUsingOtp} = require('../services/controllers/userService')

class UserController{

    getInfomationUser(req, res, next){
        try {
            const user = req.user.toJSON();
            const {username, email, phone, gender, is_active, user_type,changed_password_at} = user;
            const userResponse = {username, email, phone, gender, is_active, user_type,changed_password_at};

            const respone = new ApiSuccess({data:userResponse});
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }

    }

    async sendMailOtpActiveUser(req, res, next){
        try {
            const {user} = req
            const {is_active} = user;
            if(is_active){
                const respone = new ApiError({message:'User has been activated'})
                throw new HttpError({statusCode:410,respone})
            }
            await handleSendOtpToEmailUser(user);
            const respone = new ApiSuccess({});
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }
    }

    async activeUser(req, res, next){
        try {
            const {user} = req
            const {is_active} = user;
            if(is_active){
                const respone = new ApiError({message:'User has been activated'})
                throw new HttpError({statusCode:410,respone})
            }
            const {otp} = req.body
            const isActived = await handleActiveUser(user, otp);
            if(isActived){
                const respone = new ApiSuccess({});
                res.status(200).json(respone)
            }else{
                const respone = new ApiError({message:'Can not activate user, try again later'})
                throw new HttpError({statusCode:500,respone})
            }
        } catch (error) {
            next(error)
        }
    }


    async sendMailOtpForgotPassword(req, res, next){
        try {
            const {email} = req.body;
            await handleSendEmailOtpForgotPassword(email);
            const respone = new ApiSuccess({});
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }
    }

    async resetNewPasswordUser(req, res, next){
        try {
            const {email, otp, new_password} = req.body;
            await handleResetPasswordUserUsingOtp(email, otp, new_password);
            const respone = new ApiSuccess({});
            res.status(200).json(respone)
        } catch (error) {
            next(error)
        }
    }

    async verifyOtp(req, res, next){
        try {
            const {otp, email} = req.body;
            const isOtpVerify = await handleVerifyOtpByEmail(email, otp);
            if(isOtpVerify){
                const respone = new ApiSuccess({});
                res.status(202).json(respone)
            }else{
                const respone = new ApiError({message:'Invalid otp'})
                throw new HttpError({statusCode:401,respone})
            }
        } catch (error) {
            next(error)
        }
    }

    async changeUserPassword(req, res, next){
        try {
            const {new_password, old_password} = req.body;
            const {user, jwtPayload} = req
            
            if(new_password===old_password){
                const respone = new ApiError({
                    message: 'The old password cannot be the same as the new password'
                })
                throw new HttpError({statusCode:400, respone})
            }
            // compare old_password
            const {hashed_password} = user;
            if(hashed_password && old_password){
                const isAuth = await bcrypt.compare(old_password, hashed_password);
                if(isAuth){
                    
                    const {jwt_id, exp} = jwtPayload;
                    const salt = await bcrypt.genSalt(config.password.salt);
                    const newHashedPassword = await bcrypt.hash(new_password, salt);
                    user['hashed_password'] = newHashedPassword;
                    user['changed_password_at'] = Date.now();

                    await user.save();
                    await addJwtIdToBlacklist(jwt_id, exp);
                    const respone = new ApiSuccess({});
                    res.status(200).json(respone)
                }else{
                    const respone = new ApiError({
                        message: 'Incorrect password'
                    })
                    throw new HttpError({statusCode:400, respone})
                }
            }else{
                const respone = new ApiError({
                    message: 'Can not change password'
                })
                throw new HttpError({statusCode:500, respone})
            }
        } catch (error) {
            next(error)
        }
    }
}

module.exports = UserController