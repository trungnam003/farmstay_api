const jwt = require('jsonwebtoken')
const {nanoid} = require('nanoid')

const config  = require('../../../config')


const signJwtUserCustomer = (username)=>{
    const JWT = jwt.sign({
        sub: username,
        jwt_id: nanoid(),
    }, config.secret_key.jwt , {expiresIn: config.jwt.exp, issuer: config.jwt.issuer})
    return JWT;
}

const verifyJwt = (jwtVerify)=>{
    return new Promise((resolve, reject)=>{
        jwt.verify(jwtVerify, config.secret_key.jwt,{ issuer: config.jwt.issuer }, (err, decode)=>{
            if(err){
                reject(err)
            }
            resolve(decode)
        })
    })
}
module.exports = {
    signJwtUserCustomer, verifyJwt
}