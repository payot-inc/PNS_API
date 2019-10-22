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


// function writeLog(topic, message) {
//   const [, mac, , type] = topic.split("/");
//   const [err, amount] = message.toString().split(" ");

//   // 돈을 넣는 행위가 아니라면
//   if (!["cash", "card", "claim"].includes(type)) return;

//   // 장비를 조회
//   const machine = db
//     .get("machine")
//     .find({ mac })
//     .value();

//   // 장비가 현재 동작 중인 상태에서 돈이 들어온 경우라면 무시
//   // if (machine.stopTime > Date.now()) return;

//   // 동작시간을 설정
//   const duration = Date.now() + 42 * 60 * 1000;
//   db.get("machine")
//     .find({ mac })
//     .assign({ stopTime: duration })
//     .write();

//   // 웹소켓으로 변동 내역 전파
//   const socketMessage = JSON.stringify({
//     method: "updated",
//     group: machine.groupId
//   });
//   event.next(socketMessage);
// }

client.on("message", eventHander);

module.exports = event;
