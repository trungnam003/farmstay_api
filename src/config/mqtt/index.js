const mqtt = require('mqtt');
require('dotenv').config();

const URL = process.env.MQTT_URL
const USERNAME = process.env.MQTT_USERNAME
const PASSWORD = process.env.MQTT_PASSWORD

const client  = mqtt.connect(URL, {
  username: USERNAME,
  password: PASSWORD
});

module.exports = client