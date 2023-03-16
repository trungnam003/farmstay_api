const {User, Customer}       = require('../models/mysql')
const bcrypt       = require('bcrypt')
const config = require('../../config')
const jwt = require('jsonwebtoken')
const {HttpError, } = require('../utils/error');
const ResponseAPI = require('../utils/api_response');
const {nanoid} = require('nanoid')
const {addJwtIdToBlacklist} = require('../helpers/redis/blacklist_jwt')


class AuthController{
    constructor(){
        this.registerUser = this.registerUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);        
    }

    async registerUser(req, res, next){
        try {
            const {username, email, password, phone, gender} = req.body;
            const salt = await bcrypt.genSalt(config.password.salt);
            const hashed_password = await bcrypt.hash(password, salt);
            try{
                await User.create({
                    username, email, hashed_password, phone, gender,
                    user_type: config.user.customer,
                    user_customer: {}
                }, {
                    include: [
                        {
                            model: Customer,
                            as: 'user_customer',
                            
                        }
                    ]
                })
            }catch{
                return next(new HttpError({
                    statusCode: 422, respone: new ResponseAPI({
                        msg: 'Can\'t create an account',
                        msg_vi: 'Không thể tạo tài khoản',
                    })
                }))
            }
            

            const responseAPI = new ResponseAPI({
                msg: 'Account successfully created',
                msg_vi: 'Tạo tài khoản thành công',
            })

            res.status(200).json(responseAPI)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async loginUser(req, res, next){
        try {
            const {user} = req;
            const {username} = user;
            
            const JWT = jwt.sign({
                sub: username,
                jwt_id: nanoid(),
            }, config.secret_key.jwt , {expiresIn: config.jwt.exp, issuer: config.jwt.issuer})
            
            const responseAPI = new ResponseAPI({
                msg: 'Login successfully',
                msg_vi: 'Đăng nhập thành công',
                object: {
                    status_login: true,
                    [config.jwt.jwt_header]: JWT,
                    token_expires_in: Math.floor((Date.now()/1000)+(config.jwt.exp))
                }
            })


            res.status(200).json(responseAPI)
        } catch (error) {
            console.log(error)
            next(error)
        }
    }

    async logoutUser(req, res, next){
        try {
            
            if(req.jwt_payload){
                let {jwt_id, exp} = req.jwt_payload;
                await addJwtIdToBlacklist(jwt_id, exp);
                const responseAPI = new ResponseAPI({
                    msg: 'Logout successfully',
                    msg_vi: 'Đăng xuất thành công',
                })
                res.status(200).json(responseAPI)
            }else{
                const responseAPI = new ResponseAPI({
                    msg: 'Logout failed',
                    msg_vi: 'Đăng xuất thất bại',
                })
                res.status(401).json(responseAPI)
            }
            
            
        } catch (error) {
            console.log(error)
            next(error)
        }
    }
}

module.exports = AuthController;