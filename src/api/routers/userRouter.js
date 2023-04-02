const {HttpError, } = require('../utils/error');
const {authenticateJWT} = require('../middlewares/auths/authenticate/jwt')
const {validateBody, Validate, Joi } = require('../middlewares/validates')
const {checkUserActive} = require('../middlewares/auths/authorization')

const UserController = require('../controllers/userController');
const userController = new UserController();

const Router = require("express").Router();

Router
.route('/change-password')
.put(
    authenticateJWT(),
    checkUserActive(),
    userController.changeUserPassword
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/active')
.post(
    authenticateJWT(),
    userController.sendMailOtpActiveUser
)
.put(
    authenticateJWT(),
    userController.activeUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/forgot-password')
.post(
    userController.sendMailOtpForgotPassword
)
.put(
    userController.resetNewPasswordUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/otp')
.post(
    userController.verifyOtp
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/')
.get(
    authenticateJWT(),
    userController.getInfomationUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

module.exports = Router;