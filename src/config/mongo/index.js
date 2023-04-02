const mongoose = require('mongoose')
require('dotenv').config()

const STRING_CONNECT = process.env.MONGODB_STRING_CONNECT;
const NAME_DB = process.env.MONGODB_DATABASE_NAME;

mongoose.set("strictQuery", false);
function connect(){
    return new Promise((resolve, reject)=>{
        mongoose.connect(STRING_CONNECT,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: NAME_DB
            // authSource: "admin",
            // user: "trungnam1611",
            // pass: "Trungnam.123",
        }, (err)=>{
            if(err){
                reject(err)
            }else{
                resolve(true)
            }
        }
        );
            
    })
}


module.exports.connect = connect;