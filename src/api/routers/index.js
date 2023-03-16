const baseRouter = require("express").Router();
const authRouter = require('./auth_router');
const farmstayRouter = require('./farmstay_route');
const customerRouter = require('./customer_router');
const {setUrlAuthorization} = require('../middlewares/auths/authorization')

baseRouter.use('/auth',  authRouter);
baseRouter.use('/farmstays', setUrlAuthorization('/farmstays'), farmstayRouter);
baseRouter.use('/customer', customerRouter)


module.exports = baseRouter;