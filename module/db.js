const lowDB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, '..', 'database', 'db.json'));
const db = lowDB(adapter);

db.defaults({ group:[], machine: [] }).write();

module.exports = db;
