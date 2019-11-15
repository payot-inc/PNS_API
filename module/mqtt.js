require('dotenv').config();

const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_HOST);
const db = require('./db');
const { Subject } = require('rxjs');
const event = new Subject();

client.on('connect', () => {
  console.log('mqtt-server connected ' + process.env.MQTT_HOST);
  db.get('machine')
    .map('mac')
    .value()
    .forEach(mac => {
      ['stop', 'claim', 'cash', 'card'].forEach(t => {
        const topic = `machine/${mac}/service/${t}`;
        client.subscribe(topic);
      });
    });
  client.on('message', (topic, message) => {
    console.log(topic.toString(), message.toString());
    const [, mac,,method] = topic.toString().split('/');
    const [code] = message.toString().split(' ');

    const isRunning = method !== 'stop';
    if (isRunning && code !== '000') return;
    db.get('machine').find({ mac }).assign({ isRunning, updatedAt: Date.now() }).write();
    const machine = db.get('machine').find({ mac }).value();
    event.next(machine);
  });
});

module.exports = event;
