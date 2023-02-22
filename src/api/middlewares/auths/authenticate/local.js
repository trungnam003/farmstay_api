
const {User, sequelize}       = require('../../../models/mysql');
const bcrypt       = require('bcrypt');
const {HttpError, } = require('../../../utils/error');
const ResponseAPI = require('../../../utils/api_response');
const {Validate, Joi} = require('../../../helpers/validate')

async function authenticateLocal(req, res, next){
    try {
        // const check = req.body.hasOwnProperty('email') || req.body.hasOwnProperty('username')
        const {login, password, } = req.body;
        
        const {error, value} = Validate({login}, {
            login: Validate.isEmail(),
        })
        console.log(value)
        let query = error ? {username: value.login}: {email: value.login};
        
        console.log(query)
        const user = await User.findOne({
            where:{...query},
        });
        
        if(!user){
            const error = new HttpError({statusCode: 401, respone: new ResponseAPI({
                msg: 'Account does not exist',
                msg_vi: 'Tài khoản không tồn tại',
                object: {
                    status_login: false
                }
            })})
            next(error)
        }else{
            const isAuth = await bcrypt.compare(password, user.hashed_password)
            
            if(isAuth){
                req.user = user
                next()
            }else{
                const error = new HttpError({statusCode: 401, respone: new ResponseAPI({
                    msg: 'Wrong password',
                    msg_vi: 'Sai mật khẩu',
                    object: {
                        status_login: false
                    }
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