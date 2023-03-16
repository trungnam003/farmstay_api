const mqtt = require('mqtt');
require('dotenv').config();
const cron 								= require('node-cron');
const URL = process.env.MQTT_URL
const USERNAME = process.env.MQTT_USERNAME
const PASSWORD = process.env.MQTT_PASSWORD

const client  = mqtt.connect(URL, {
  username: USERNAME,
  password: PASSWORD
});

client.on('connect', () => {
    console.log('Connected to MQTT broker');
});

const mqtt_topic1 = ['3c05296a-64e5-41c5-b4a6-eb679d845372/cam-bien-dat', '3c05296a-64e5-41c5-b4a6-eb679d845372/cam-bien-muc-nuoc', '3c05296a-64e5-41c5-b4a6-eb679d845372/cam-bien-lua'];
const mqtt_topic2 = ['efbd40e7-c502-4793-9ffa-283973bbbf53/cam-bien-dat', 'efbd40e7-c502-4793-9ffa-283973bbbf53/cam-bien-muc-nuoc', 'efbd40e7-c502-4793-9ffa-283973bbbf53/cam-bien-do-am'];
const id1 = ['ts62xys', 'c989ss', '7287fhs', '878sds2']
const id2 = ['d84746j', 't5633', '3dsg32f', '82sds2']

mqtt_topic1.forEach((v, i)=>{
    client.subscribe(`${v}`, function (err) {
        if (!err) {
            console.log(`sub thành công ${v}`)
        }
    })
})
mqtt_topic2.forEach((v, i)=>{
    client.subscribe(`${v}`, function (err) {
        if (!err) {
            console.log(`sub thành công ${v}`)
        }
    })
})

mqtt_topic1.forEach((v, i)=>{
    cron.schedule('*/1 * * * * *', () => { 
        client.publish(v, JSON.stringify({
            hardware_id: id1[i],
            value: 10+Math.random()*20
        }))
    }, {
        timezone: 'Asia/Ho_Chi_Minh' // Set múi giờ cho job
    }).start()
})

mqtt_topic2.forEach((v, i)=>{
    cron.schedule('*/1 * * * * *', () => { 
        client.publish(v, JSON.stringify({
            hardware_id: id2[i],
            value: 10+Math.random()*20
        }))
    }, {
        timezone: 'Asia/Ho_Chi_Minh' // Set múi giờ cho job
    }).start()
})

