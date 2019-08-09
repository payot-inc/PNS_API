const express = require('express');
const app = express();
const WebSocket = require('ws').Server;

const websocket = new WebSocket({ port: 8999 });

websocket.on('connection', ws => {
  ws.on('message', console.log);
  global.ws = ws;

  setInterval(() => {
    const message = JSON.stringify({ machine: 'asdfasdfsa', stopTime: new Date(), isBroken: false });
    ws.send(message);
  }, 2000);
});

app.use(express.json());
app.use('/', require('./router/index'));

app.listen(3000);