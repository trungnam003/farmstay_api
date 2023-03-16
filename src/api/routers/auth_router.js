const AuthController = require('../controllers/auth_controller');
const {authenticateLocal} = require('../middlewares/auths/authenticate/local')
const {HttpError, } = require('../utils/error');
const {authenticateJWT} = require('../middlewares/auths/authenticate/jwt')
const {validateBody, Validate, Joi } = require('../middlewares/validates')

const Router = require("express").Router();
const authController = new AuthController();

Router
.route('/register')
.post(
    authController.registerUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
    
});

Router
.route('/login')
.post(
    validateBody({
        login: Validate.isUsernameOrEmail(),
        password: Validate.isString().min(3),
    }),
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