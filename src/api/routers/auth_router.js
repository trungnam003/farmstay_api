const Router = require("express").Router();
const AuthController = require('../controllers/auth_controller');
const {authenticateLocal} = require('../middlewares/auths/authenticate/local')
const {HttpError, } = require('../utils/error');
const ResponseAPI = require('../utils/api_response');
const {authenticateJWT} = require('../middlewares/auths/authenticate/jwt')

Router
.route('/test')
.get(
    authenticateJWT, 
    AuthController.test
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
    
});

Router
.route('/register')
.post(

    AuthController.registerUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
    
});

Router
.route('/login')
.post(
    authenticateLocal,
    AuthController.loginUser
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

module.exports = Router;