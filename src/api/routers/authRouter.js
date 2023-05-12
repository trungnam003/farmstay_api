const AuthController = require('../controllers/authController');
const {authenticateLocal} = require('../middlewares/auths/authenticate/local')
const {HttpError, } = require('../utils/error');
const {authenticateJWT} = require('../middlewares/auths/authenticate/jwt')
const {validateBody, Validate, Joi, validateBody2 } = require('../middlewares/validates')
const schema = require('../helpers/validateSchema/auth')

const Router = require("express").Router();
const authController = new AuthController();

Router
.route('/register')
.post(
    validateBody2(schema.register),
    authController.registerUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
    
});

Router
.route('/login')
.post(
    validateBody2(schema.login),
    authenticateLocal,
    authController.loginUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/logout')
.get(
    authenticateJWT(),
    authController.logoutUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

module.exports = Router;