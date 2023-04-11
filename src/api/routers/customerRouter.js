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
    checkCustomerUser(), checkUserActive(),
    customerController.getFarmstayOwn
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/farmstay/equipments')
.get(
    authenticateJWT(),
    checkCustomerUser(), checkUserActive(),
    customerController.getEquipmentFarmstayOwn
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});


Router
.route('/farmstay/equipments/fields')
.get(
    authenticateJWT(),
    checkCustomerUser(), checkUserActive(),
    customerController.getFieldEquipmentFarmstay
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/farmstay/equipments/fields/latest_data')
.get(
    authenticateJWT(),
    checkCustomerUser(), checkUserActive(),
    customerController.getLatestDataInField
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});
module.exports = Router;