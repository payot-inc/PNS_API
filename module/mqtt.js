require("dotenv").config();

const mqtt = require("mqtt");
const client = mqtt.connect(process.env.MQTT_HOST);
const db = require("./db");
const { Subject } = require("rxjs");
const { isEmpty } = require('lodash');
const event = new Subject();

client.on("connect", () => {
  db.get("machine")
    .map("mac")
    .value()
    .forEach(mac => {
      ["cash", "card", "claim", "stop"].forEach(method => {
        const subscribeTopic = `machine/${mac}/service/${method}`;
        client.subscribe(subscribeTopic);
      });
    });
});

function eventHander(topic, message) {
  const topics = topic.split('/');
  const isStop = topics.includes('stop');
  !isStop ? updateStartTime(topic, message) : updateStopTime(topic, message);
}

// 장비 정지시 업데이트
function updateStartTime(topic, message) {
  const mac = topic.split('/')[1];
  const machineDB = db.get('machine');
  const machine = machineDB.find({ mac }).value();

  if (isEmpty(machine)) return;
  machineDB.find({ mac }).assign({ startTime: Date.now() }).write();

  console.log('장비 동작 시작 ', mac);
  const params = { method: 'updated', group: machine.groupId };
  event.next(params);
}

// 장비 중지시 업데이트
function updateStopTime(topic, message) {
  // 정지시간 업데이트
  const mac = topic.split('/')[1];
  const machineDB = db.get('machine');
  const machine = machineDB.find({ mac }).value();
  
  if (isEmpty(machine)) return;
  machineDB.find({ mac }).assign({ stopTime: Date.now() }).write();

  console.log('장비 동작 종료 ', mac);
  const params = { method: 'updated', group: machine.groupId };
  event.next(params);
}

client.on("message", eventHander);

module.exports = event;
