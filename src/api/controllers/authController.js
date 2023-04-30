const bcrypt                                = require('bcrypt')
const config                                = require('../../config')
const {HttpError, }                         = require('../utils/error');
const {ApiError, ApiSuccess}                = require('../utils/apiResponse');
const {addJwtIdToBlacklist}                 = require('../helpers/redis/blacklistJwt')
const {createUserCustomer}                  = require('../services/controllers/authService')
const {signJwtUser, getUser}                 = require('../services/jwt')


class AuthController{
    constructor(){
        this.registerUser = this.registerUser.bind(this);
        this.loginUser = this.loginUser.bind(this);
        this.logoutUser = this.logoutUser.bind(this);        
    }

    async registerUser(req, res, next){
        try {
            const {username, email, password,} = req.body;
            const salt = await bcrypt.genSalt(config.password.salt);
            const hashed_password = await bcrypt.hash(password, salt);
            try{
                const userCreate = {username, email, hashed_password, user_customer:{}}
                await createUserCustomer(userCreate);
            }catch(error){
                return next(new HttpError({
                    statusCode: 422, respone: new ApiError({
                        message: 'Can not create an account',
                    })
                }))
            }
            const responseAPI = new ApiSuccess({})
            res.status(200).json(responseAPI)
        } catch (error) {
            next(error)
        }
    }

    async loginUser(req, res, next){
        try {
            const {user} = req;
            const {username} = user;
            
            const JWT = signJwtUser(username);
            const userResponse = await getUser(user);
            
            const responseAPI = new ApiSuccess({
                data: userResponse,
                object: {
                    [config.jwt.jwt_header]: JWT,
                    token_expires_in: Math.floor((Date.now()/1000)+(config.jwt.exp))
                }
            })
            res.status(200).json(responseAPI)
        } catch (error) {
            next(error)
        }
    }

    async logoutUser(req, res, next){
        try {
            
            if(req.jwtPayload){
                let {jwt_id, exp} = req.jwtPayload;
                await addJwtIdToBlacklist(jwt_id, exp);
                const responseAPI = new ApiSuccess({})
                res.status(200).json(responseAPI)
            }else{
                const responseAPI = new ApiError({
                    message: 'Logout failed',
                })
                next(new HttpError({statusCode: 401, respone:responseAPI}))
            }
        } catch (error) {
            next(error)
        }
    }
}

module.exports = AuthController;