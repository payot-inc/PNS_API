require('dotenv').config();

const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_CLIENT);

