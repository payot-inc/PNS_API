const db = require('./module/db');
const axios = require('axios');
const { chain } = require('lodash');

const HOST = 'http://service.payot-coin.com/v1';
const client = axios.create({
  baseURL: HOST,
});

async function getMachine(companyId) {
  const url = `/company/${companyId}/machines`;
  const { data } = await client.get(url);

  return chain(data).filter(item => item.type === '세탁기').value();
}

// 26
const companyIds = [26];

Promise.all(companyIds.map(getMachine)).then(machines => {
  const groupMachines = chain(machines)
    .flatten()
    .map(({ mac ,name, companyId }) => { return { mac, name, companyId }; })
    .map(item => {
      const groupIndex = companyIds.indexOf(item.companyId);
      const genderIndex = item.name.includes('남자') ? 0 : 1;
      const initTime = Date.now();

      return {
        mac: item.mac,
        name: item.name,
        startTime: initTime,
        stopTime: initTime,
        isBroken: false,
        groupId: 2 * groupIndex + genderIndex + 1,
      };
    })
    .sortBy('groupId', 'name')
    .value();
  
  groupMachines.forEach(item => {
    db.get('machine').push(item).write();
  });
}).catch(console.log);