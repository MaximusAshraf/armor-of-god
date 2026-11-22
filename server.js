const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');
const selfsigned = require('selfsigned');
const express = require('express');
const { Server } = require('socket.io');
const qrcode = require('qrcode-terminal');
const cfg = require('./config');
const { createGame } = require('./game');
const { lanAddresses, qrSvg } = require('./share');

const PORT = Number(process.env.PORT) || 4000;      // https only: phones need it for the camera, and the admin on the laptop uses it too
const app = express();
const io = new Server({ pingInterval: 10000, pingTimeout: 25000 });

// self-signed certificate (phones ask once "continue anyway"); regenerated when the laptop's IP changes
async function loadCert() {
  const file = path.join(__dirname, 'data', 'cert.json');
  const ips = lanAddresses();
  try {
    const c = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (ips.every((ip) => c.ips.includes(ip)) && Date.now() < c.expires) return c;
  } catch { /* first run */ }
  const altNames = [{ type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }, ...ips.map((ip) => ({ type: 7, ip }))];
  const pems = await selfsigned.generate([{ name: 'commonName', value: 'armor-of-god' }], {
    days: 365, keySize: 2048, extensions: [{ name: 'subjectAltName', altNames }],
  });
  const c = { ips, key: pems.private, cert: pems.cert, expires: Date.now() + 360 * 864e5 };
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(c));
  return c;
}

// admin pages and controls only work on the laptop that runs the server
const ownIps = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);
const refreshOwn = () => lanAddresses().forEach((ip) => { ownIps.add(ip); ownIps.add(`::ffff:${ip}`); });
refreshOwn();
const isLocalAddr = (addr) => { refreshOwn(); return ownIps.has(addr); };
const requireLocal = (req, res, next) => (isLocalAddr(req.socket.remoteAddress) ? next() : res.status(403).send('Admin works only on the laptop running the server'));

const game = createGame(cfg, io, (socket) => isLocalAddr(socket.conn.remoteAddress || socket.handshake.address));

const page = (name) => (req, res) => res.sendFile(path.join(__dirname, 'public', name));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'), { index: false }));
app.get('/jsqr.js', (req, res) => res.sendFile(path.join(__dirname, 'node_modules', 'jsqr', 'dist', 'jsQR.js'))); // QR decoder for phones without BarcodeDetector

app.get('/', page('index.html'));                  // players: pick a name and join
app.get('/play', page('play.html'));               // players: the game itself
app.get('/screen', page('screen.html'));           // projector: all teams, live
app.get('/admin', requireLocal, page('admin.html'));
app.get('/qrs', requireLocal, page('qrs.html'));
app.get('/demo', requireLocal, page('demo.html'));   // QR codes scattered at random on screen, for a test / preview   // printable hidden QR sheets
app.get('/found/:code', (req, res) => res.redirect(`/play?scan=${encodeURIComponent(req.params.code)}`)); // what a tool QR opens

// text the clients need (no secrets)
app.get('/api/config', (req, res) => res.json({ teams: cfg.teamDefs, tools: cfg.tools, monsters: cfg.monsters, traps: cfg.traps }));

app.post('/api/join', (req, res) => {
  const name = String((req.body && req.body.name) || '').trim().slice(0, 20);
  const pid = req.body && req.body.pid;
  if (!name && !game.findPlayer(pid)) return res.status(400).json({ error: 'name' });
  const p = game.join(name, pid);
  res.json({ pid: p.pid, name: p.name, team: p.team });
});

app.get('/api/share', async (req, res) => {
  res.json(await Promise.all(lanAddresses().map(async (ip) => {
    const join = `https://${ip}:${PORT}/`;
    return { ip, join, svg: await qrSvg(join) };
  })));
});

app.get('/api/admin/qrs', requireLocal, async (req, res) => {
  const card = async (kind, i) => {
    const code = game.codeOf[kind][i];
    // the QR holds just the code (not an address), so printed sheets keep working when the laptop's IP changes
    return { kind, idx: i, code, svg: await qrSvg(code, 600, 2), svgFull: await qrSvg(code, 600, 0) }; // 2-module quiet zone, plain vector: scales to any size
  };
  res.json({
    tools: cfg.tools, monsters: cfg.monsters, traps: cfg.traps,
    toolCards: await Promise.all(cfg.tools.map((_, i) => card('tool', i))),
    monsterCards: await Promise.all(cfg.monsters.map((_, i) => card('monster', i))),
    trapCards: await Promise.all(cfg.traps.map((_, i) => card('trap', i))),
  });
});
app.post('/api/admin/settings', requireLocal, (req, res) => {
  const b = req.body || {};
  if (b.teamCount !== undefined) game.setTeamCount(b.teamCount);
  if (b.gatherPercent !== undefined) game.setGatherPercent(b.gatherPercent);
  res.json({ ok: true });
});
app.post('/api/admin/start', requireLocal, (req, res) => { game.start(); res.json({ ok: true }); });
app.post('/api/admin/reset', requireLocal, (req, res) => { game.reset(); res.json({ ok: true }); });
app.post('/api/admin/skip', requireLocal, (req, res) => {
  const b = req.body || {};
  res.json({ ok: b.player !== undefined ? game.skipPlayer(b.player) : game.skip(Number(b.team)) });
});

(async () => {
  if (process.env.HTTP_ONLY) { // tests / quick dev: plain http only
    io.attach(http.createServer(app).listen(PORT));
    return console.log(`http only on ${PORT}`);
  }
  const cert = await loadCert();
  const httpsServer = https.createServer({ key: cert.key, cert: cert.cert }, app);
  io.attach(httpsServer);
  httpsServer.listen(PORT, () => {
    const ips = lanAddresses();
    console.log('Whole Weapon of God is running');
    console.log(`  admin (this laptop only): https://localhost:${PORT}/admin`);
    console.log(`  printable QR sheet:       https://localhost:${PORT}/qrs`);
    console.log(`  big screen / projector:   https://localhost:${PORT}/screen`);
    if (!ips.length) return console.log('  (no network connection found - phones cannot join)');
    console.log(`  players join:             https://${ips[0]}:${PORT}/   (phones: tap "Advanced" > "continue" once)`);
    console.log(`\nScan to join (${ips[0]}):`);
    qrcode.generate(`https://${ips[0]}:${PORT}/`, { small: true });
  });
})();
