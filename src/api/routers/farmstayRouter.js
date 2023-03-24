const {HttpError, } = require('../utils/error');
const {authenticateJWT} = require('../middlewares/auths/authenticate/jwt')
const {validateBody, Validate, Joi } = require('../middlewares/validates')
const {setUrlAuthorization, checkCustomerUser, checkUserActive} = require('../middlewares/auths/authorization')
const FarmstayController = require('../controllers/farmstayController');
const Router = require("express").Router();
const farmstayController = new FarmstayController();

Router
.route('/')
.get(
    authenticateJWT({isRequired:false}),
    farmstayController.getAllFarmstay
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/:uuid')
.get(
    authenticateJWT({isRequired:false}),
    checkCustomerUser({isRequired:false}),
    farmstayController.getFarmstayByUuid
)
.post(
    authenticateJWT(),
    checkCustomerUser(),
    checkUserActive({isRequired:false}),
    farmstayController.handleUserRentFarmstayByUuid
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

// Router
// .route('/:uuid/payment')
// .post(
//     authenticateJWT(),
//     checkCustomerUser(),
//     checkUserActive({isRequired:false}),
//     farmstayController.createPaymentFarmstay
// )
// .all((req, res, next)=>{
//     next(new HttpError({statusCode: 405}))
// });

module.exports = Router;