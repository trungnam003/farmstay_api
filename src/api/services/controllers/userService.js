const {sendMail} = require('../../services/mailer')
const {templateOtpCode} = require('../../services/mailer/templates');
const {addOtpCode, checkValidOtp, deleteOtpUser} = require('../redis/storeOtpCode')
const crypto = require('crypto');
const {HttpError, } = require('../../utils/error');
const {ApiError, } = require('../../utils/apiResponse');
const {User,} = require('../../models/mysql')
const bcrypt       = require('bcrypt');
const config = require('../../../config')

const generateOtpCode = ()=>{
    return new Promise((resolve, reject)=>{
        crypto.randomInt(100000, 999999, (err, number) => {
            if (err){
                reject(err)
            }else{
                resolve(number)
            }
        });
    })
}

const handleSendOtpToEmailUser = (user)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const {username, email} = user;
            const otp = await generateOtpCode();
            await addOtpCode(username, otp, Math.floor(Date.now()/1000)+config.otp.exp)
            await sendMail(email+'', 'Mã OTP xác thực', templateOtpCode(otp))
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const handleActiveUser = (user, otpCode)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const {username,} = user;
            try {
                const checkOtp = await checkValidOtp(username, otpCode)
                if(checkOtp){
                    user['is_active'] = true;
                    const check = await deleteOtpUser(username)
                    if(check){
                        await user.save();
                        resolve(true);
                    }else{
                        const respone = new ApiError({message:'Something went wrong'})
                        reject(new HttpError({statusCode:500,respone}))
                    }
                    
                }else{
                    const respone = new ApiError({message:'Invalid otp'})
                    reject(new HttpError({statusCode:401,respone}))
                }
            } catch (error) {
                try {
                    const {message, code} = JSON.parse(error.message)
                    const respone = new ApiError({message})
                    reject(new HttpError({statusCode:code,respone}))
                } catch{
                    reject(error)
                }
            }
            
        } catch (error) {
            reject(error);
        }
    })
}

const handleSendEmailOtpForgotPassword = (email)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const user = await User.findOne({
                where:{email},
                attributes: ['username']
            })
            
            if(!user){
                const respone = new ApiError({message: 'This email is not registered for an account'})
                throw new HttpError({statusCode:401,respone})
            }
            const {username,} = user;
            const otp = await generateOtpCode();
            await addOtpCode(username, otp, Math.floor(Date.now()/1000)+60*5)
            await sendMail(email+'', 'Mã OTP xác thực', templateOtpCode(otp))
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
}

const handleResetPasswordUserUsingOtp = (email, otpCode, newPassword)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const user = await User.findOne({
                where:{email},
                attributes: ['id','username', 'hashed_password', 'changed_password_at']
            })
            if(!user){
                const respone = new ApiError({message: 'This email is not registered for an account'})
                throw new HttpError({statusCode:401,respone})
            }
            const {username,} = user;
            try {
                const checkOtp = await checkValidOtp(username, otpCode)
                if(checkOtp){
                    const check = await deleteOtpUser(username)
                    if(check){
                        const salt = await bcrypt.genSalt(config.password.salt);
                        const newHashedPassword = await bcrypt.hash(newPassword, salt);
                        user['hashed_password'] = newHashedPassword;
                        user['changed_password_at'] = Date.now();
                        await user.save();
                        resolve(true);
                    }else{
                        const respone = new ApiError({message:'Something went wrong'})
                        reject(new HttpError({statusCode:500,respone}))
                    }
                }else{
                    const respone = new ApiError({message:'Invalid otp'})
                    reject(new HttpError({statusCode:401,respone}))
                }
            } catch (error) {
                try {
                    const {message, code} = JSON.parse(error.message)
                    const respone = new ApiError({message})
                    reject(new HttpError({statusCode:code,respone}))
                } catch{
                    reject(error)
                }
            }
        } catch (error) {
            reject(error)
        }
    })
}

const handleVerifyOtpByEmail = (email, otpCode)=>{
    return new Promise(async(resolve, reject)=>{
        try {
            const user = await User.findOne({
                where:{email},
                attributes: ['username']
            })
            
            if(!user){
                const respone = new ApiError({message: 'This email is not registered for an account'})
                throw new HttpError({statusCode:401,respone})
            }
            const {username,} = user;
            try {
                const checkOtp = await checkValidOtp(username, otpCode)
                resolve(checkOtp)
            } catch (error) {
                const {message, code} = JSON.parse(error.message)
                const respone = new ApiError({message})
                reject(new HttpError({statusCode:code,respone}))
            }
        } catch (error) {
            reject(error)
        }

    })    
}

module.exports = {
    handleSendOtpToEmailUser, handleActiveUser, handleSendEmailOtpForgotPassword,handleVerifyOtpByEmail,handleResetPasswordUserUsingOtp
}