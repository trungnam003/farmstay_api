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
    farmstayController.getAllFarmstay
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/:uuid')
.get(
    farmstayController.getFarmstayByUuid
)
// .post(
//     authenticateJWT(),
//     checkCustomerUser(),
//     checkUserActive(),
//     farmstayController.handleUserRentFarmstayByUuid
// )
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/:uuid')
.get(
    farmstayController.getFarmstayByUuid
)
// .post(
//     authenticateJWT(),
//     checkCustomerUser(),
//     checkUserActive(),
//     farmstayController.handleUserRentFarmstayByUuid
// )
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/:uuid/create_deposit_payment_url')
.post(
    authenticateJWT(),
    checkCustomerUser(),
    checkUserActive(),
    farmstayController.createPaymentURL
)
.all((req, res, next)=>{
    next(new HttpError({statusCode: 405}))
});

Router
.route('/:uuid/check_deposit_payment')
.post(
    authenticateJWT(),
    checkCustomerUser(),
    checkUserActive(),
    farmstayController.checkUserPayment
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