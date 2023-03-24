const config = require('../../../../../config')
const jwt = require('jsonwebtoken')
const { isBlacklistedJwt } = require('../../../../helpers/redis/blacklistJwt')
const SocketIoSingleton = require('../../SocketIoSingleton')
const {FarmstayConfig, FarmstayData} = require('../../../../models/mongo');
const mqttClient = require('../../../../../config/mqtt')

function openConnectSocketFarmstayUuid(uuidFarmstay){
    const io = new SocketIoSingleton().io;
    const nsp = io.of(`farmstay/${uuidFarmstay}`);
    
    const SENSOR = 'sensor'
    const RFID = 'rfid'
    nsp.use((socket, next)=>{
        const query = FarmstayConfig.findOne({
            farmstay_id: uuidFarmstay,
        },
        )
        query.then((farmstay)=>{
            const {equipments} = farmstay
            
            socket[SENSOR] = []
            socket[RFID] = []

            if(Array.isArray(equipments)){
                equipments.forEach(equipment=>{
                    const {type, hardware_id, mqtt_topic} = equipment;
                    if(type === SENSOR){
                        socket[SENSOR].push({
                            hardware_id, 
                            mqtt_topic
                        })
                        
                    }else if(type === RFID){
                        socket[RFID].push({
                            hardware_id, 
                            mqtt_topic
                        })
                    }
                })
            }
            
            
            
            next()
        }).catch(err=>{
            console.log(err)
            next(new Error('Something went wrong'))
        })
    })

    nsp.on('connection', function(socket){
        socket.emit('ping', 'pong')
        console.log(`farmstay/${uuidFarmstay}`)
        socket[SENSOR].forEach(value=>{
            const { mqtt_topic } = value;
            mqttClient.subscribe(`${mqtt_topic}`, function (err) {
                if (!err) {
                    console.log(`sub thành công ${mqtt_topic}`)
                }
            })
        })
        mqttClient.on('message', (topic, message)=>{
            
            if(Array.isArray(socket[SENSOR])){
                const a = socket[SENSOR].find((value)=>{
                    return value.mqtt_topic === topic
                })
                
                if(a){
                    // console.log(`${topic}-${message.toString()}`)
                    socket.emit('message', `${message.toString()}`)
                }
            }
            
        })

        // setInterval(() => {
        //     if('farmstay/efbd40e7-c502-4793-9ffa-283973bbbf53' === `farmstay/${uuidFarmstay}`)
        //     socket.emit('message', `farmstay/${uuidFarmstay}`)
        // }, 1000);

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    })
    
}

module.exports = openConnectSocketFarmstayUuid
