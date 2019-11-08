require('dotenv').config();

const mqtt = require('mqtt');
const client = mqtt.connect(process.env.MQTT_HOST);
const db = require('./db');
const { Subject } = require('rxjs');
const { isEmpty } = require('lodash');
const event = new Subject();

client.on('connect', () => {
  console.log('mqtt-server connected ' + process.env.MQTT_HOST);
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

<<<<<<< HEAD
function eventHander(mac) {
  const machine = db.get('machine').find({ mac }).value();
  if (machine.isRunning) {
    db.get('machine').find({ mac }).assign({ isRunning: false, stopTime: Date.now() }).write();
  } else {
    db.get('machine').find({ mac }).assign({ isRunning: true, startTime: Date.now() }).write();
  }
  event.next({ method: 'updated', group: machine.groupId });
=======
function writeLog(topic, message) {
  const [, mac, , type] = topic.split("/");
  const [err, amount] = message.toString().split(" ");

  // 돈을 넣는 행위가 아니라면
  if (!["cash", "card", "claim"].includes(type)) return;

  // 장비를 조회
  const machine = db
    .get("machine")
    .find({ mac })
    .value();

  // 장비가 현재 동작 중인 상태에서 돈이 들어온 경우라면 무시
  // if (machine.stopTime > Date.now()) return;

  // 동작시간을 설정
  const duration = Date.now() + 50 * 60 * 1000;
  db.get("machine")
    .find({ mac })
    .assign({ stopTime: duration })
    .write();

  // 웹소켓으로 변동 내역 전파
  const socketMessage = JSON.stringify({
    method: "updated",
    group: machine.groupId
  });
  event.next(socketMessage);
>>>>>>> bf797d0be98e7f42523671cd4dc89c673ad77b6b
}

module.exports = event;
