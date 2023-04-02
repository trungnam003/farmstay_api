
const {User, sequelize}       = require('../../../models/mysql');
const bcrypt       = require('bcrypt');
const {HttpError, } = require('../../../utils/error');
const {ApiError} = require('../../../utils/apiResponse');
const {Validate, Joi} = require('../../../helpers/validate')
const {AUTHENTICATE} = require('../../../constants/errors')

async function authenticateLocal(req, res, next){
    try {
        // const check = req.body.hasOwnProperty('email') || req.body.hasOwnProperty('username')
        const {login, password, } = req.body;
        
        const {error, value} = Validate({login}, {
            login: Validate.isEmail(),
        })
        
        let query = error ? {username: value.login}: {email: value.login};
        
        const user = await User.findOne({
            where:{...query},
        });
        
        if(!user){
            const error = new HttpError({statusCode: 401, respone: new ApiError({
                message: 'Account does not exist', 
                error: AUTHENTICATE.ACCOUNT_NOT_EXIST
            })})
            next(error)
        }else{
            const isAuth = await bcrypt.compare(password, user.hashed_password)
            
            if(isAuth){
                req.user = user
                next()
            }else{
                const error = new HttpError({statusCode: 401, respone: new ApiError({
                    message: 'Wrong password',
                    error: AUTHENTICATE.WRONG_PASSWORD
                })})
                next(error)
            }
        }
        
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    authenticateLocal,
}