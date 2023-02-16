const Router = require("express").Router();
const authRouter = require('./auth_router');

Router.use('/auth', authRouter);

module.exports = Router;