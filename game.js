// Game rules + state. One game, several teams; every team plays on its own:
//   - scanning a QR only makes the item APPEAR on the phone; the player must TAP it to use it ("take")
//   - tools are collected in order (1..6); a tool can only be taken once the monster before it is beaten
//   - monster N is summoned by tapping its item once tool N is owned; teammates then tap together to beat it
//   - 6 trap items look tempting: tapping one makes the team lose its last collected tool
//     (no monster needs to be beaten again - just scan and take the lost tool again, in order)
// All teams share the same QR codes: 6 tools + 6 monsters + 6 traps.
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O/1/I so codes are easy to read and type

function loadSecret() {
  const file = path.join(__dirname, 'data', 'secret.txt');
  try { return fs.readFileSync(file, 'utf8').trim(); } catch { /* first run */ }
  const secret = crypto.randomBytes(16).toString('hex');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, secret);
  return secret;
}

function makeCode(secret, team, tool, salt) {
  const h = crypto.createHmac('sha256', secret).update(`${team}:${tool}:${salt}`).digest();
  let s = '';
  for (let i = 0; i < 6; i++) s += ALPHA[h[i] % ALPHA.length];
  return s;
}

function createGame(cfg, io, isLocalSocket) {
  const { teamDefs, MAX_TEAMS, tools, monsters, TAP_WINDOW_MS, REGEN_PER_SEC, GATHER_WINDOW_MS } = cfg;
  let teamCount = cfg.DEFAULT_TEAMS;
  let gatherPercent = cfg.DEFAULT_GATHER_PERCENT;
  const secret = loadSecret();

  // secret codes shared by every team: codeOf.tool[i], codeOf.monster[i], codeOf.trap[i]
  const codes = new Map(); // code -> { kind, idx }
  const codeOf = { tool: [], monster: [], trap: [] };
  ['tool', 'monster', 'trap'].forEach((kind, k) => {
    const n = kind === 'trap' ? cfg.traps.length : tools.length;
    for (let idx = 0; idx < n; idx++) {
      let salt = 0, c;
      do { c = makeCode(secret, k, idx, salt++); } while (codes.has(c));
      codes.set(c, { kind, idx });
      codeOf[kind][idx] = c;
    }
  });

  let status = 'lobby'; // lobby | running
  let startedAt = null;
  let uidCounter = 0; // public player id (shown to the admin); the secret pid never leaves the player's phone
  const players = new Map(); // pid -> { pid, name, team, sockets:Set, lastTapAt }
  const newTeam = (t) => ({
    ...t, stage: 0, tools: 0, fighting: false, phase: 'tool', hp: 0, maxHp: 0, active: 0,
    finishedAt: null, nextAttack: 0, lastTap: new Map(), gather: new Map(), dirty: true,
  });
  let teams = teamDefs.slice(0, teamCount).map(newTeam);

  const online = (t) => { let n = 0; for (const p of players.values()) if (p.team === t.id && p.sockets.size) n++; return n; };
  const total = (t) => { let n = 0; for (const p of players.values()) if (p.team === t.id) n++; return n; };
  const needNow = (t) => (t.phase === 'fight' ? Math.min(monsters[t.stage].need, Math.max(1, online(t))) : 0);
  const isActive = (t, p, now) => p.sockets.size > 0 && now - (t.lastTap.get(p.pid) || 0) < TAP_WINDOW_MS;
  const activeCount = (t, now) => { let n = 0; for (const p of players.values()) if (p.team === t.id && isActive(t, p, now)) n++; return n; };

  // gathering: before a monster can be summoned, enough of the online team must have scanned + tapped its item
  const gatheredAt = (t, p) => (t.gather.get(p.pid) || 0);
  const isGathered = (t, p, now) => p.sockets.size > 0 && now - gatheredAt(t, p) < GATHER_WINDOW_MS;
  const gatherNeed = (t) => (gatherPercent <= 0 ? 0 : Math.max(1, Math.ceil(online(t) * gatherPercent / 100)));
  const gatherHave = (t, now) => { let n = 0; for (const p of players.values()) if (p.team === t.id && isGathered(t, p, now)) n++; return n; };

  const toTeam = (t, ev, data) => io.to(`team:${t.id}`).emit(ev, data);
  const feed = (type, t, extra = {}) => io.to('screen').to('admin').emit('feed', { type, team: t.id, at: Date.now(), ...extra });

  // stage = monsters beaten, tools = tools owned (always tools 1..tools, collected in order)
  function settle(t) {
    t.phase = t.stage >= tools.length ? 'done' : t.fighting ? 'fight' : t.tools <= t.stage ? 'tool' : 'monster';
    t.dirty = true;
  }
  // the item the team has to find next
  const want = (t) => (t.phase === 'tool' ? { kind: 'tool', idx: t.tools } : t.phase === 'monster' ? { kind: 'monster', idx: t.stage } : null);

  function collectTool(t, by) {
    const idx = t.tools++;
    settle(t);
    toTeam(t, 'ev', { type: 'found', tool: idx, by: by || null });
    feed('found', t, { tool: idx, by: by || null });
  }

  function loseTool(t, by, trap) {
    const idx = --t.tools;
    settle(t);
    toTeam(t, 'ev', { type: 'lost', tool: idx, trap, by: by || null });
    feed('lost', t, { tool: idx, trap, by: by || null });
  }

  function beginFight(t, by) {
    const n = Math.max(1, online(t));
    t.fighting = true;
    t.maxHp = monsters[t.stage].hpPerPlayer * n;
    t.hp = t.maxHp;
    t.active = 0;
    t.lastTap.clear();
    t.gather.clear();
    t.nextAttack = Date.now() + 2500;
    settle(t);
    toTeam(t, 'ev', { type: 'summon', monster: t.stage, by: by || null });
    feed('summon', t, { monster: t.stage, by: by || null });
  }

  function defeat(t) {
    const idx = t.stage;
    t.stage += 1;
    t.fighting = false;
    t.hp = 0;
    t.active = 0;
    settle(t);
    if (t.phase === 'done') {
      t.finishedAt = Date.now();
      toTeam(t, 'ev', { type: 'done', monster: idx });
      feed('done', t, { monster: idx });
    } else {
      toTeam(t, 'ev', { type: 'defeated', monster: idx });
      feed('defeated', t, { monster: idx });
    }
  }

  // best first: finished teams by finish time, then by progress
  function ranking() {
    const score = (t) => t.stage * 10 + t.tools;
    return [...teams].sort((a, b) => {
      if (a.finishedAt && b.finishedAt) return a.finishedAt - b.finishedAt;
      if (a.finishedAt) return -1;
      if (b.finishedAt) return 1;
      return score(b) - score(a);
    }).map((t) => t.id);
  }

  function teamView(t, now = Date.now()) {
    const members = [];
    for (const p of players.values()) {
      if (p.team === t.id) members.push({ uid: p.uid, name: p.name, online: p.sockets.size > 0, active: t.phase === 'monster' ? isGathered(t, p, now) : isActive(t, p, now) });
    }
    return {
      id: t.id, name: t.name, color: t.color, colorName: t.colorName,
      stage: t.stage, phase: t.phase,
      gather: t.phase === 'monster' ? { have: gatherHave(t, now), need: gatherNeed(t) } : null,
      tools: t.tools, found: t.tools, defeated: t.stage, want: want(t),
      hp: Math.ceil(t.hp), maxHp: t.maxHp, need: needNow(t), active: t.phase === 'fight' ? t.active : 0,
      online: online(t), total: total(t),
      finishedAt: t.finishedAt, members,
    };
  }

  const board = () => ({
    status, startedAt, now: Date.now(), settings: { teamCount: teams.length, maxTeams: MAX_TEAMS, gatherPercent },
    teams: teams.map((t) => teamView(t)),
    rank: ranking(),
  });

  const stateFor = (p) => ({ status, startedAt, now: Date.now(), team: teamView(teams[p.team]), rank: ranking() });

  // ---- player actions ----
  function join(name, pid) {
    if (pid && players.has(pid)) {
      const p = players.get(pid);
      if (name) p.name = name;
      return p;
    }
    // balance teams: smallest first, random among equals
    const sizes = teams.map((t) => total(t));
    const min = Math.min(...sizes);
    const pool = teams.filter((t, i) => sizes[i] === min);
    const team = pool[Math.floor(Math.random() * pool.length)];
    const p = { pid: crypto.randomBytes(8).toString('hex'), uid: ++uidCounter, name, team: team.id, sockets: new Set(), lastTapAt: 0 };
    players.set(p.pid, p);
    team.dirty = true;
    return p;
  }

  // can this item be used right now? -> { ok: true } or { ok: false, reason }
  function check(t, hit) {
    if (hit.kind === 'trap') return { ok: true };
    if (hit.kind === 'tool') {
      if (hit.idx < t.tools) return { ok: false, reason: 'already' };
      if (hit.idx > t.tools || hit.idx > t.stage) return { ok: false, reason: 'too_early' };
      return { ok: true };
    }
    if (hit.idx < t.stage) return { ok: false, reason: 'already_beaten' };
    if (hit.idx > t.stage) return { ok: false, reason: 'too_early' };
    if (t.tools <= t.stage) return { ok: false, reason: 'need_tool' };
    return { ok: true };
  }

  function lookup(pid, raw) {
    const p = players.get(pid);
    if (!p) return { err: { result: 'unknown' } };
    if (status !== 'running') return { err: { result: 'not_started' } };
    const t = teams[p.team];
    if (t.phase === 'done') return { err: { result: 'done' } };
    if (t.phase === 'fight') return { err: { result: 'in_fight' } };
    const hit = codes.get(String(raw || '').trim().toUpperCase());
    if (!hit) return { err: { result: 'wrong' } };
    return { p, t, hit };
  }

  // "this player is at the monster"; the fight starts once enough of the team has gathered
  function gatherAt(t, p) {
    const now = Date.now();
    t.gather.set(p.pid, now);
    const have = gatherHave(t, now), need = gatherNeed(t);
    t.dirty = true;
    if (have < need) return { summoned: false, have, need };
    t.gather.clear();
    beginFight(t, p.name);
    return { summoned: true, have, need };
  }

  // step 1: a QR was scanned -> the item appears (opacity) on the phone. Nothing changes yet.
  function scan(pid, raw) {
    const r = lookup(pid, raw);
    if (r.err) return r.err;
    const { hit, t } = r;
    return { result: 'item', kind: hit.kind, idx: hit.idx, level: hit.kind === 'trap' ? null : hit.idx + 1, inOrder: check(t, hit).ok };
  }

  // step 2: the player tapped the item -> collect the tool / summon the monster / fall into the trap
  function take(pid, raw) {
    const r = lookup(pid, raw);
    if (r.err) return r.err;
    const { p, t, hit } = r;
    const c = check(t, hit);
    if (!c.ok) return { result: c.reason, kind: hit.kind, level: hit.idx + 1 };
    if (hit.kind === 'tool') { collectTool(t, p.name); return { result: 'ok', kind: 'tool', idx: hit.idx }; }
    if (hit.kind === 'monster') {
      const g = gatherAt(t, p);
      return g.summoned ? { result: 'ok', kind: 'monster', idx: hit.idx } : { result: 'gathering', kind: 'monster', have: g.have, need: g.need };
    }
    if (t.tools === 0) return { result: 'trap_empty', kind: 'trap', idx: hit.idx };
    loseTool(t, p.name, hit.idx);
    return { result: 'trap', kind: 'trap', idx: hit.idx };
  }

  function tap(pid) {
    const p = players.get(pid);
    if (!p || status !== 'running') return;
    const now = Date.now();
    if (now - p.lastTapAt < 50) return; // ignore auto-clickers / floods
    p.lastTapAt = now;
    const t = teams[p.team];
    if (t.phase !== 'fight') return;
    t.lastTap.set(pid, now);
    t.active = activeCount(t, now);
    if (t.active >= needNow(t)) {
      t.hp -= 1;
      if (t.hp <= 0) return defeat(t);
    }
    t.dirty = true;
  }

  // ---- admin actions ----
  function start() { if (status !== 'running') { status = 'running'; startedAt = Date.now(); io.emit('start'); teams.forEach((t) => (t.dirty = true)); } }
  function reset() {
    status = 'lobby'; startedAt = null;
    teams = teamDefs.slice(0, teamCount).map(newTeam);
    io.emit('reset');
  }
  function setGatherPercent(n) {
    gatherPercent = Math.max(0, Math.min(100, Math.round(Number(n) || 0)));
    teams.forEach((t) => (t.dirty = true));
  }

  // lobby: any count 2..max, players are re-balanced over the teams. Running: only more teams (new ones start from zero).
  function setTeamCount(n) {
    n = Math.max(2, Math.min(MAX_TEAMS, Math.round(Number(n) || 0)));
    if (status === 'running' && n < teams.length) return false;
    if (n === teams.length) return true;
    teams = teamDefs.slice(0, n).map((d, i) => teams[i] || newTeam(d));
    teamCount = n;
    if (status !== 'running') {
      const list = [...players.values()].sort(() => Math.random() - 0.5);
      list.forEach((p, i) => {
        const old = p.team; p.team = i % n;
        if (old === p.team) return;
        for (const sid of p.sockets) { const s = io.sockets.sockets.get(sid); if (s) { s.leave(`team:${old}`); s.join(`team:${p.team}`); } }
      });
    }
    teams.forEach((t) => (t.dirty = true));
    return true;
  }

  // admin: push ONE player through their current step (collect the tool / be present at the monster / beat it)
  function skipPlayer(uid) {
    const p = [...players.values()].find((x) => x.uid === Number(uid));
    if (!p || status !== 'running') return false;
    const t = teams[p.team];
    if (t.phase === 'tool') collectTool(t, p.name);
    else if (t.phase === 'monster') gatherAt(t, p);
    else if (t.phase === 'fight') defeat(t);
    else return false;
    return true;
  }

  function skip(teamId) {
    const t = teams[teamId];
    if (!t || status !== 'running') return false;
    if (t.phase === 'tool') collectTool(t, 'admin');
    else if (t.phase === 'monster') beginFight(t, 'admin');
    else if (t.phase === 'fight') defeat(t);
    else return false;
    return true;
  }

  // ---- sockets ----
  io.on('connection', (socket) => {
    const a = socket.handshake.auth || {};
    if (a.role === 'screen') { socket.join('screen'); return socket.emit('board', board()); }
    if (a.role === 'admin') {
      if (!isLocalSocket(socket)) return socket.disconnect(true);
      socket.join('admin');
      return socket.emit('board', board());
    }
    const p = players.get(a.pid);
    if (!p) { socket.emit('unknown'); return; }
    p.sockets.add(socket.id);
    socket.join(`team:${p.team}`);
    teams[p.team].dirty = true;
    socket.emit('state', stateFor(p));
    socket.on('scan', (code, ack) => { const r = scan(p.pid, code); if (typeof ack === 'function') ack(r); });
    socket.on('take', (code, ack) => { const r = take(p.pid, code); if (typeof ack === 'function') ack(r); });
    socket.on('tap', () => tap(p.pid));
    socket.on('disconnect', () => { p.sockets.delete(socket.id); teams[p.team].dirty = true; });
  });

  // ---- clock: regen, monster attacks, 5 Hz broadcasts ----
  setInterval(() => {
    const now = Date.now();
    for (const t of teams) {
      if (status === 'running' && t.phase === 'monster') { // people arriving / leaving / their "I am here" expiring
        const have = gatherHave(t, now);
        if (have !== t.gatherHave) { t.gatherHave = have; t.dirty = true; }
        if (have > 0 && have >= gatherNeed(t)) { t.gather.clear(); beginFight(t, null); }
        continue;
      }
      if (status !== 'running' || t.phase !== 'fight') continue;
      const active = activeCount(t, now);
      if (active !== t.active) { t.active = active; t.dirty = true; }
      if (active < needNow(t) && t.hp < t.maxHp) { // not enough teammates: the monster heals
        t.hp = Math.min(t.maxHp, t.hp + t.maxHp * REGEN_PER_SEC * 0.25);
        t.dirty = true;
      }
      if (now >= t.nextAttack) {
        t.nextAttack = now + 3000 + Math.random() * 2500;
        toTeam(t, 'ev', { type: 'attack' });
      }
    }
  }, 250);

  setInterval(() => {
    let any = false;
    for (const t of teams) {
      if (!t.dirty) continue;
      t.dirty = false; any = true;
      const now = Date.now();
      toTeam(t, 'state', { status, startedAt, now, team: teamView(t, now), rank: ranking() });
    }
    if (any) io.to('screen').to('admin').emit('board', board());
  }, 200);

  return {
    join, board, scan, take, skip, setTeamCount, setGatherPercent, skipPlayer, start, reset,
    codeOf, tools, status: () => status,
    findPlayer: (pid) => players.get(pid),
  };
}

module.exports = { createGame };
