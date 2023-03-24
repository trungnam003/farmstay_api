const baseRouter = require("express").Router();
const authRouter = require('./authRouter');
const farmstayRouter = require('./farmstayRouter');
const customerRouter = require('./customerRouter');
const userRouter = require('./userRouter');

const {setUrlAuthorization} = require('../middlewares/auths/authorization')

baseRouter.use('/auth',  authRouter);
baseRouter.use('/farmstays', setUrlAuthorization('/farmstays'), farmstayRouter);
baseRouter.use('/customer', customerRouter)
baseRouter.use('/user', userRouter)


module.exports = baseRouter;