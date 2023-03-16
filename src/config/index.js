require("dotenv").config();
const {deepFreeze} = require('../api/utils/object_utils')

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
    password:{
        salt: 12
    },
    redis: {
        blacklist_jwt: 'blacklist_jwt'
    },
    user:{
        customer: 'customer',
        employee: 'employee'
    }
}

deepFreeze(config);
module.exports = config;
