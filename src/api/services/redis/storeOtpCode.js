const {redis} = require('../../../config/redis')
const config = require('../../../config')

function addOtpCode(username, otp, exp){
    return new Promise(async(resolve, reject)=>{
        try {
            const json = {otp: otp, exp:parseInt(exp)};
            await redis.hset(config.redis.user_otp_code, username, JSON.stringify(json));
            resolve(true)
        } catch (error) {
            reject(error)
        }
    })
    
}
async function isUserExistOtp(username){
    const isExists = await redis.hexists(config.redis.user_otp_code, username);
    return isExists;
}

function checkValidOtp(username, otp){
    return new Promise(async(resolve, reject)=>{
        try {
            const payload = await redis.hget(config.redis.user_otp_code, username);
            if(!payload){
                throw new Error(JSON.stringify({
                    message: 'User does not have otp code',
                    code: 403
                }))
            }
            const {otp:otpPayload, exp} = JSON.parse(payload);
            const timeNow = Math.floor(Date.now()/1000);
            if(+otpPayload === +otp){
                if(timeNow>+exp){
                    throw new Error(JSON.stringify({
                        message: 'Otp is expired',
                        code: 401
                    }))
                }else{
                    resolve(true)
                }
            }else{
                throw new Error(JSON.stringify({
                    message: 'Otp code does not match',
                    code: 401
                }))
            }
        } catch (error) {
            reject(error)
        }
    })
    // return +exp < Math.floor(Date.now() / 1000);
}

function deleteOtpUser(username){
    return new Promise(async(resolve, reject)=>{
        try {
            const check = await redis.hdel(config.redis.user_otp_code, username);
            resolve(check)
        } catch (error) {
            reject(error)
        }
    })
}


async function removeOtpExpired(){
    const lst = []
    const bl = await redis.zrange(config.redis.user_otp_code, 0, -1, 'WITHSCORES')

    for (let index = 0; index < bl.length; index+=2) {
        const jwtId= bl[index];
        const exp= bl[index+1];
        if(+exp < Math.floor(Date.now() / 1000)){
        lst.push(jwtId);
        }
    }
    if(lst.length){
        await redis.zrem(config.redis.user_otp_code, ...lst)
    }
    
}

module.exports = {
    addOtpCode, isUserExistOtp, checkValidOtp, removeOtpExpired, deleteOtpUser
}