const WebSocket = require('ws').Server;
const websocket = new WebSocket({ port: 9000 });

const mqttEvent = require('./mqtt');

websocket.on('connection', ws => {
  console.log('websocket is opend');
  ws.on('message', console.log);
  global.ws = ws;
  mqttEvent.subscribe(e => {
    console.log('event', e);
    ws.send(JSON.stringify(e));
  }, () => {});
});