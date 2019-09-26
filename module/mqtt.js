require("dotenv").config();

const mqtt = require("mqtt");
const client = mqtt.connect(process.env.MQTT_HOST);
const db = require("./db");
const { Subject } = require("rxjs");

const event = new Subject();

client.on("connect", () => {
  db.get("machine")
    .map("mac")
    .value()
    .forEach(mac => {
      ["cash", "card", "claim"].forEach(method => {
        const subscribeTopic = `machine/${mac}/service/${method}`;
        client.subscribe(subscribeTopic);
      });
    });
});

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
  const duration = Date.now() + 42 * 60 * 1000;
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
}

client.on("message", writeLog);

module.exports = event;
