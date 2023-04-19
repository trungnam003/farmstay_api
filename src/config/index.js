require("dotenv").config();
const {deepFreeze} = require('../api/utils/objectUtils')

const config = {
    server: {
        port: process.env.PORT,
        // host: process.env.SV_HOST,
        env: process.env.NODE_ENV
    },
    secret_key:{
        jwt: process.env.JWT_SECRET_KEY,
        jwt_refesh: process.env.JWT_SECRET_REFESH_KEY,
    },
    jwt: {
        exp : parseFloat(process.env.JWT_EXP)*60,
        refesh_exp:  parseInt(process.env.JWT_REFESH_EXP)*60,
        issuer: process.env.JWT_ISSUER,
        jwt_header: process.env.JWT_HEADER,
        jwt_refesh_header: process.env.JWT_REFESH_HEADER,

    },
    otp:{
        exp: parseFloat(process.env.OTP_EXP)*60
    },
    password:{
        salt: 12
    },
    redis: {
        blacklist_jwt: 'blacklist_jwt',
        user_otp_code: 'user_otp_code'
    },
    user:{
        customer: 'customer',
        employee: 'employee'
    },
    email_service: {
        password: process.env.MAIL_PASSWORD,
        username : process.env.MAIL_USERNAME,
        mail_mailer : process.env.MAIL_MAILER,
        host : process.env.MAIL_HOST,
        port : process.env.MAIL_PORT,
        encryption : process.env.MAIL_ENCRYPTION,
        from : process.env.MAIL_FROM, 
        from_name : process.env.MAIL_FROM_NAME,
    },
    payment_vnp:{
        vnp_TmnCode: process.env.vnp_TmnCode,
        secret_key: process.env.vnp_HashSecret,
        vnp_url: process.env.vnp_Url,
        vnp_api: process.env.vnp_Api,
        return_url: process.env.vnp_ReturnUrl,
    }
}

deepFreeze(config);
module.exports = config;
