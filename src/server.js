const express                           = require('express');
const cors = require('cors')
const {sequelize}                       = require('./api/models/mysql');
const morgan                            = require('morgan');
const { createServer }                  = require('http');
const router                            = require('./api/routers')
const errors 							= require('./api/middlewares/errors');
const {HttpError,} 						= require('./api/utils/error');
const {ApiError} 						= require('./api/utils/apiResponse');
const cron 								= require('node-cron');
const helmet 							= require("helmet");
const {removeJwtExpiredFromBlacklist} 	= require('./api/helpers/redis/blacklistJwt')
const {redis} 							= require('./config/redis')
const {connect} = require('./config/mongo')
const mqttClient = require('./config/mqtt')


const {socketio} = require('./api/app/socket.io')
const path = require('path');

require('dotenv').config();

const app = express()
const PORT = process.env.PORT
const env = process.env.NODE_ENV

const main =  async()=>{
	
	app.use(cors())
	// logging
	app.use(morgan('dev'));

	// body parser
	app.use(express.urlencoded({extended: true,}));
    app.use(express.json());

	// helmet
	app.use(helmet.hidePoweredBy());

	//static
	app.use(express.static(path.join(__dirname, 'public') ));

	// create server
	const httpServer = createServer(app)
	//socketio
	socketio(httpServer)
	
	mqttClient.on('connect', () => {
		console.log('Connected to MQTT broker');
		
	});
	
	app.use('/api',router);

	app.all('*', function(req, res, next){
        next(new HttpError({statusCode: 404, respone: new ApiError({})}))
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
	try {
        await connect();
        console.log("Connect MongoDB OK ^^");
    } catch (error) {
        console.log("Connect MongoDB FAIL :(", error);
    }
	try {
		await redis.ping();
        console.log("Connect Redis OK ^^");
	} catch (error) {
		console.log(error)
		console.log("Connect Redis FAIL :(");
	}

    await new Promise((resolve) => httpServer.listen(PORT, '0.0.0.0', undefined, 
		()=>{console.log(`App listening on http://localhost:${PORT}`);}
	));

}
//'59 23 * * 2,4,6'
// cron.schedule('*/30 * * * * *', () => { 
// 	// console.log("Remove Blacklist")
// 	removeJwtExpiredFromBlacklist();
// }, {
// 	timezone: 'Asia/Ho_Chi_Minh' // Set múi giờ cho job
// })


main().catch(error => console.log('ERROR STARTING SERVER: ', error))
