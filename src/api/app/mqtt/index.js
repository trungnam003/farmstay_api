const mqttClient = require('../../../config/mqtt')
const SocketIoSingleton = require('../socket.io/SocketIoSingleton');
const {FarmstayData} = require('../../models/mongo')
const {getFieldNameEventById} = require('../redis/socketioCache')

function subscribeMqttFarmstay(){
    const io = new SocketIoSingleton().io
    mqttClient.subscribe('farmstay/#', function (err) {
        if (!err) {
          console.log('Subscribed to farmstay/#');
        }
    });
    mqttClient.on('message',  function (topic, message) {
        console.log('Received message:', JSON.parse(message), 'on topic:', topic);
        const receivedData = JSON.parse(message);
        const {hardware_id, value} = receivedData;
        const dataInsert = {
            value,
            timestamp: Math.round(Date.now()/1000)
        }
        FarmstayData.findOneAndUpdate({
            hardware_id,
        },
        {
            "$push": {
              "equipments_data": dataInsert
            }
        }
        ).select('-equipments_data')
        .then((respone)=>{
            console.log(respone)
            const {hardware_id, farmstay_id} = respone
            getFieldNameEventById(hardware_id+'').then(value=>{
                console.log(value)
                io.of('/farmstay').to(farmstay_id).emit('humidity_temperature_sensor_0_data_0', dataInsert)
            }).catch(console.log)
            
        }).catch(error=>{
            console.log(error)
        })
    });

    return mqttClient
}

module.exports = subscribeMqttFarmstay