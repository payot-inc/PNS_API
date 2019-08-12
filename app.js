const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const mqttEvent = require('./module/mqtt');
const db = require('./module/db');

global.db = db;
global.event = mqttEvent;

app.use(require('cors')());
app.use(express.json());
app.use('/', require('./router/index'));

io.on('connection', ws => {
  console.log(`Connected ID: ${ws.id}`);
  const pushUpdate = mqttEvent.subscribe(data => {
    ws.emit('update', JSON.stringify(data));
  }, () => {});
  
  ws.on('disconnect', reason => {
    console.log(reason);
    pushUpdate.unsubscribe();
  });
});

server.listen(3000);

module.exports = server;