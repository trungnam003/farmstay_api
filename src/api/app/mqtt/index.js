const mqttClient = require('../../../config/mqtt')
const SocketIoSingleton = require('../socket.io/SocketIoSingleton');
const {FarmstayData, FarmstayConfig} = require('../../models/mongo')
const {getFieldNameEventById} = require('../redis/socketioCache')

async function pushDataEquipmentToDB(data, hardwareId){
    try {
        return await FarmstayData.findOneAndUpdate({
            hardware_id:hardwareId,
        },
        {
            "$push": {
              "equipments_data": data
            }
        }
        ).select('-equipments_data').exec()
    } catch (error) {
        console.log(error);
        throw error 
    }
    
}

function subscribeMqttFarmstay(){
    const io = new SocketIoSingleton().io
    mqttClient.subscribe('farmstay/#', function (err) {
        if (!err) {
          console.log('Subscribed to farmstay/#');
        }
    });
    mqttClient.on('message',  async(topic, message)=> {
        console.log('Received message:', JSON.parse(message), 'on topic:', topic);
        const receivedData = JSON.parse(message);
        const {hardware_id:hardwareIdReceived, value, from} = receivedData;
        let valueInsert = typeof +value === 'number' && !isNaN(+value) ? parseFloat((+value).toFixed(2)):NaN;
        
        const dataInsert = {
            value: valueInsert,
            timestamp: Math.round(Date.now()/1000)
        }
        if(from==='hardware' && !isNaN(valueInsert) && hardwareIdReceived){
            console.log('save to db')
            try {
                const hardware = await pushDataEquipmentToDB(dataInsert, hardwareIdReceived);
                if(!hardware){
                    return;
                }
                const {hardware_id, farmstay_id} = hardware
                // const fieldName = await getFieldNameEventById(hardware_id+'')
                const farmstayConfig = await FarmstayConfig.findOne({
                    farmstay_id: farmstay_id,
                    'equipments.equipment_fields': {
                        $elemMatch:{
                            hardware_id
                        }
                    }
                }).exec();
                const {equipments} = farmstayConfig
                equipments.forEach((equipment)=>{
                    const {equipment_fields} = equipment;
                    const field = equipment_fields.find((field)=>{
                        return field.hardware_id === hardware_id
                    })
                    if(field){
                        const {danger_min, danger_max, field_name} = field;
                        if(dataInsert.value<=danger_min || dataInsert.value>=danger_max){
                            
                            io.of('/farmstay').to(farmstay_id).emit(field_name, Object.assign(dataInsert, 
                            {
                                danger: true
                            }));
                            
                        }else{
                            io.of('/farmstay').to(farmstay_id).emit(field_name, dataInsert)
                        }
                    }
                })
            } catch (error) {
                console.log(error)
            }  
        }else{
            console.log('no save')
        }
    });  

    return mqttClient
}

module.exports = subscribeMqttFarmstay