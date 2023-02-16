const express                           = require('express');
const {sequelize}                       = require('./api/models/mysql');
const morgan                            = require('morgan');
const { createServer }                  = require('http');
const router                            = require('./api/routers')
const errors = require('./api/middlewares/errors');
const {HttpError, STATUS_CODES} 		= require('./api/utils/error');
const ResponseAPI 		= require('./api/utils/api_response');

const helmet = require("helmet");
require('dotenv').config();

const app = express()
const PORT = process.env.PORT
const env = process.env.NODE_ENV

const main =  async()=>{
	// logging
	app.use(morgan('dev'));

	// body parser
	app.use(express.urlencoded({extended: true,}));
    app.use(express.json());

	// helmet
	app.use(helmet.hidePoweredBy());

	app.use(router);

	app.all('*', function(req, res, next){
        next(new HttpError({statusCode: 404, respone: new ResponeAPI({
			msg: 'Invalid API',
			msg_vi: 'API không hợp lệ'
		})}))
    });

    // use list error handle
    app.use(errors)

	// connect MySQL
	try {
		await sequelize.authenticate();
        console.log("Connect MySql OK ^^");
	} catch (error) {
		console.log(error)
		console.log("Connect MySql FAIL :(");
	}

	// create server
	const httpServer = createServer(app)
    await new Promise((resolve) => httpServer.listen(PORT, '0.0.0.0', undefined, 
		()=>{console.log(`App listening on http://localhost:${PORT}`);}
	));

}

main().catch(error => console.log('ERROR STARTING SERVER: ', error))
