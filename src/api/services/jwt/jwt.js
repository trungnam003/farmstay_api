const jwt = require('jsonwebtoken')
const {nanoid} = require('nanoid')
const {User, Customer, Employee} = require('../../models/mysql')
const config  = require('../../../config')


const signJwtUser = (username)=>{
    const JWT = jwt.sign({
        sub: username,
        jwt_id: nanoid(),
    }, config.secret_key.jwt , {expiresIn: config.jwt.exp, issuer: config.jwt.issuer})
    return JWT;
}

const getUser = async(user)=>{
    try {
        const {user_type, username, email, id:user_id, is_active}=user;
        const userResponse = {
            username, user_type, email, user_id, is_active
        }
        if(user_type === 'customer'){
            const customer = await Customer.findOne({where: {user_id}})
            if(customer){
                const {id, fullname} = customer
                Object.assign(userResponse, {customer: {
                    id, fullname
                }})
            }
        }else if(user_type === 'employee'){
            const employee = await Employee.findOne({where: {user_id}})
            if(employee){
                const {id, fullname} = employee
                Object.assign(userResponse, {employee: {
                    id, fullname
                }})
            }
        
        }
        return userResponse;
    } catch (error) {
        throw error
    }
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
    signJwtUser, verifyJwt, getUser
}