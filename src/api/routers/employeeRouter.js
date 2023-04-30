const {HttpError, } = require('../utils/error');
const {authenticateJWT} = require('../middlewares/auths/authenticate/jwt')
const {validateBody, Validate, Joi } = require('../middlewares/validates')
const {setUrlAuthorization, checkEmployeeUser, checkUserActive} = require('../middlewares/auths/authorization')
const EmployeeController = require('../controllers/employeeController');

const Router = require("express").Router();
const employeeController = new EmployeeController();

Router.route('/conversations')
.get(
    authenticateJWT(),
    checkEmployeeUser(), checkUserActive(),
    employeeController.getAllConversation
)
.post(
    authenticateJWT(),
    checkEmployeeUser(), checkUserActive(),
    employeeController.createConversation
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router.route('/conversations/employees')
.get(
    authenticateJWT(),
    checkEmployeeUser(), checkUserActive(),
    employeeController.getAllEmployeeNoConversation
).all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router.route('/messages/:conversation_id')
.get(
    authenticateJWT(),
    checkEmployeeUser(), checkUserActive(),
    employeeController.getAllMessageOfConversation
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router.route('/messages')
.post(
    authenticateJWT(),
    checkEmployeeUser(), checkUserActive(),
    employeeController.sendMessage
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});



module.exports = Router