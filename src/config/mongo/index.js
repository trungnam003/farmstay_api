const mongoose = require('mongoose')
mongoose.set("strictQuery", false);
function connect(){
    return new Promise((resolve, reject)=>{
        mongoose.connect('mongodb+srv://doadmin:5fIX0x6719s3KMT8@mongodb-farmstay-377e851f.mongo.ondigitalocean.com/admin?authSource=admin&tls=true',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'FarmstayData'
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