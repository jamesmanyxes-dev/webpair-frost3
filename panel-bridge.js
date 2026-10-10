// Panel bridge: talks to the SEYORI Pterodactyl panel for project 2 (evil666mdV)
const https = require('node:https');
const PANEL = 'victorylordhimselfofficial.seyori.name.ng';
const KEY = process.env.PANEL_KEY || 'ptlc_Ip3HOe5kCil8w63we8rS9SSKtfCUvLnApzx0Zitn82y';
const SERVER = process.env.PANEL_SERVER || '7c30d3fc-bd55-4076-a18b-15fb2ea42266';

function panel(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname: PANEL, path: pathname, method: 'GET',
      headers: { Authorization: 'Bearer ' + KEY, Accept: 'application/json' } },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject); req.end();
  });
}
function panelPost(pathname, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body || {});
    const req = https.request({ hostname: PANEL, path: pathname, method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, body: d })); });
    req.on('error', reject); req.end(data);
  });
}
async function restartServer() {
  const r = await panelPost(`/api/client/servers/${SERVER}/power`, { signal: 'restart' });
  return r.status === 204;
}
async function logTail() {
  return await new Promise((resolve) => {
    const req = https.get({ hostname: '01a12100-14de-7420-90b2-6a10e33ea37d.skydive.app', path: '/webpair/frost/logtail' },
      res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(d)); });
    req.setTimeout(45000, () => req.destroy());
    req.on('error', () => resolve(''));
  });
}
function latestCode(log) { const m = [...log.matchAll(/[A-Z0-9]{4}-[A-Z0-9]{4}/g)]; return m.length ? m[m.length-1][0] : null; }
function latestStatus(log) {
  if (/Connected/i.test(log.slice(-3000))) return 'connected';
  if (/Pairing failed too many times/i.test(log.slice(-4000))) return 'failed';
  if (/logged out/i.test(log.slice(-4000))) return 'logged-out';
  return 'waiting';
}
async function getState() {
  try {
    const r = await panel(`/api/client/servers/${SERVER}/resources`);
    return JSON.parse(r.body).attributes.current_state;
  } catch { return 'unknown'; }
}
module.exports = { restartServer, logTail, latestCode, latestStatus, getState };
