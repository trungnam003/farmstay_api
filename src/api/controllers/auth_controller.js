const {User}       = require('../models/mysql')
const bcrypt       = require('bcrypt')
const config = require('../../config')
const jwt = require('jsonwebtoken')
const {HttpError, } = require('../utils/error');
const ResponseAPI = require('../utils/api_response');


class AuthController{
    async test(req, res, next){
        try {
            res.json('ok')
        } catch (error) {
            
        }
    }

    async registerUser(req, res, next){
        try {
            const {username, email, password, phone, gender} = req.body;
            const userType = 'customer';
            const salt = await bcrypt.genSalt(config.password.salt);
            const hashed_password = await bcrypt.hash(password, salt);
            await User.create({
                username, email, hashed_password, phone, gender,
                user_type: userType
            })

            const responseAPI = new ResponseAPI({
                msg: 'Successfully created user',
                msg_vi: 'Tạo thành công user',
            })

            res.status(200).json(responseAPI)
        } catch (error) {
            console.log(error)
            res.status(409).json('err')
        }
    }

    async loginUser(req, res, next){
        try {
            const {user} = req;
            const {username} = user;
            
            const JWT = jwt.sign({
                sub: username,
            }, config.secret_key.jwt , {expiresIn: config.jwt.exp, issuer: config.jwt.issuer})
            res.header(config.jwt.jwt_header, JWT);
            
            const responseAPI = new ResponseAPI({
                msg: 'Login successfully',
                msg_vi: 'Đăng nhập thành công',
                object: {
                    status_login: true,
                    [config.jwt.jwt_header]: JWT,
                }
            })

            res.status(200).json(responseAPI)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}

module.exports = new AuthController();