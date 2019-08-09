const lowDB = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('../database/db.json');
const db = lowDB(adapter);

db.defaults({ machine: [] });

module.exports = db;
