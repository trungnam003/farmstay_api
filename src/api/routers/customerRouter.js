const {HttpError, } = require('../utils/error');
const {authenticateJWT} = require('../middlewares/auths/authenticate/jwt')
const {validateBody, Validate, Joi } = require('../middlewares/validates')
const {setUrlAuthorization, checkCustomerUser, checkUserActive} = require('../middlewares/auths/authorization')
const CustomerController = require('../controllers/customerController');

const Router = require("express").Router();
const customerController = new CustomerController();

Router
.route('/farmstay')
.get(
    authenticateJWT(),
    checkCustomerUser(), checkUserActive({isRequired: false}),
    customerController.getFarmstayOwn
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/farmstay/equipments')
.get(
    authenticateJWT(),
    checkCustomerUser(), checkUserActive({isRequired: false}),
    customerController.getEquipmentFarmstayOwn
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});




module.exports = Router;