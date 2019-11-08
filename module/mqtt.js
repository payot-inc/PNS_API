require('dotenv').config();

const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_HOST);
const db = require('./db');
const { Subject } = require('rxjs');
const { isEmpty } = require('lodash');
const event = new Subject();

client.on('connect', () => {
  // console.log('mqtt-server connected ' + process.env.MQTT_HOST);
  db.get('machine')
    .map('mac')
    .value()
    .forEach(mac => {
      const subscribeTopic = `machine/${mac}/service/stop`;
      client.subscribe(subscribeTopic);
    });
  client.on('message', (topic, message) => {
    const [,mac] = topic.toString().split('/');
    eventHander(mac);
  });
});

function eventHander(mac) {
  const machine = db.get('machine').find({ mac }).value();
  if (machine.isRunning) {
    db.get('machine').find({ mac }).assign({ isRunning: false, stopTime: Date.now() }).write();
  } else {
    db.get('machine').find({ mac }).assign({ isRunning: true, startTime: Date.now() }).write();
  }
  event.next({ method: 'updated', group: machine.groupId });
}

module.exports = event;
