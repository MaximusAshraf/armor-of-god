// Plays the whole game with 3 bots in one team: join, start, find 6 tools, beat 6 monsters.
const { spawn } = require('child_process');
const path = require('path');
const { io } = require('socket.io-client');
const PORT = 4555, BASE = `http://localhost:${PORT}`;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const post = (u, b) => fetch(BASE + u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b || {}) }).then((r) => r.json());
const assert = (c, m) => { if (!c) { console.error('FAIL:', m); process.exit(1); } console.log('ok  -', m); };

(async () => {
  const srv = spawn(process.execPath, [path.join(__dirname, '..', 'server.js')], { env: { ...process.env, PORT, HTTP_PORT: PORT, HTTP_ONLY: '1' }, stdio: 'ignore' });
  process.on('exit', () => srv.kill());
  await sleep(1200);

  // 2 teams, balanced: 6 bots -> 3 each
  const bots = [];
  for (let i = 0; i < 6; i++) {
    const p = await post('/api/join', { name: 'bot' + i });
    const s = io(BASE, { auth: { pid: p.pid } });
    const bot = { p, s, state: null, evs: [] };
    s.on('state', (st) => (bot.state = st)); s.on('ev', (e) => bot.evs.push(e));
    bots.push(bot);
  }
  await sleep(600);
  const teamOf = (b) => b.state.team.id;
  assert(bots.filter((b) => teamOf(b) === 0).length === 3, 'default is 2 teams, balanced 3/3');

  // admin changes the number of teams in the lobby: players are re-balanced
  await post('/api/admin/settings', { teamCount: 3 }); await sleep(500);
  assert([0, 1, 2].every((k) => bots.filter((b) => teamOf(b) === k).length === 2), 'admin: 3 teams -> players re-balanced 2/2/2');
  await post('/api/admin/settings', { teamCount: 2 }); await sleep(500);
  assert(bots.filter((b) => teamOf(b) === 0).length === 3 && bots.every((b) => teamOf(b) < 2), 'admin: back to 2 teams, 3/3');

  const admin = io(BASE, { auth: { role: 'admin' } });
  let board = null; admin.on('board', (b) => (board = b));
  const team0 = bots.filter((b) => teamOf(b) === 0);
  const ack = (b, code) => new Promise((r) => b.s.emit('scan', code, r));
  assert((await ack(team0[0], 'ABCDEF')).result === 'not_started', 'scan before start is rejected');

  await post('/api/admin/start');
  await sleep(400);
  const qrs = await fetch(`${BASE}/api/admin/qrs`).then((r) => r.json());
  const tc = qrs.toolCards.map((c) => c.code), mc = qrs.monsterCards.map((c) => c.code), xc = qrs.trapCards.map((c) => c.code);
  assert(tc.length === 6 && mc.length === 6 && xc.length === 6 && new Set([...tc, ...mc, ...xc]).size === 18, '18 distinct shared QR codes');
  const take = (b, code) => new Promise((r) => b.s.emit('take', code, r));
  const T = () => team0[0].state.team;
  const waitState = () => sleep(350);
  const [a, b2] = team0;

  // scanning only shows the item; nothing is collected
  let r = await ack(a, tc[0]);
  assert(r.result === 'item' && r.kind === 'tool' && r.inOrder === true && r.level === 1, 'scan shows tool 1 (in order)');
  await waitState(); assert(T().tools === 0, 'scanning alone does not collect the tool');
  r = await ack(a, mc[0]);
  assert(r.result === 'item' && r.inOrder === false && r.level === 1, 'monster 1 appears but is out of order (level shown)');
  assert((await take(a, mc[0])).result === 'need_tool', 'tapping the monster before its tool is refused');
  r = await ack(a, tc[1]);
  assert(r.inOrder === false && r.level === 2, 'tool 2 appears out of order with level 2');
  assert((await take(a, tc[1])).result === 'too_early', 'tapping tool 2 early is refused');
  r = await ack(a, xc[0]);
  assert(r.kind === 'trap' && r.level === null, 'a trap appears with no level badge');
  assert((await ack(a, 'ZZZZZZ')).result === 'wrong', 'garbage code is rejected');
  assert((await take(a, xc[0])).result === 'trap_empty', 'trap with no tool to lose does nothing');

  for (let i = 0; i < 6; i++) {
    if (i === 1) { // after monster 1 is beaten: fall into a trap, lose tool 1, recollect it WITHOUT re-fighting
      await waitState();
      assert(T().tools === 1 && T().defeated === 1, 'tool 1 owned, monster 1 beaten');
      assert((await take(a, xc[2])).result === 'trap', 'tapping a trap works');
      await waitState();
      assert(T().tools === 0 && T().defeated === 1 && T().want.kind === 'tool' && T().want.idx === 0, 'lost tool 1, monster 1 stays beaten, tool 1 wanted again');
      assert(b2.evs.some((e) => e.type === 'lost' && e.tool === 0), 'teammates are told about the loss');
      assert((await take(a, tc[1])).result === 'too_early', 'cannot take tool 2 before re-collecting tool 1');
    }
    if (i === 0 || i === 1) {
      if (i === 1) assert((await take(a, tc[0])).result === 'ok', 're-collect tool 1 (no fight needed)');
    }
    assert((await take(a, tc[i].toLowerCase())).result === (i === 1 ? 'ok' : (i === 0 ? 'ok' : 'ok')), `tool ${i + 1} collected by tap`);
    await waitState();
    assert(b2.evs.some((e) => e.type === 'found' && e.tool === i), 'teammates see the tool');
    assert((await take(b2, tc[i])).result === 'already', 'taking it again says already');
    if (i < 2) { // gathering: 50% of the 3 online teammates = 2 must be at the monster
      r = await take(a, mc[i]);
      assert(r.result === 'gathering' && r.have === 1 && r.need === 2, `monster ${i + 1}: one player alone is not enough (1/2)`);
      await waitState(); assert(T().gather && T().gather.have === 1 && T().gather.need === 2, 'team state shows the gathering 1/2');
      assert((await take(b2, mc[i])).result === 'ok', `monster ${i + 1} summoned once 2 of 3 gathered`);
    } else {
      if (i === 2) await post('/api/admin/settings', { gatherPercent: 0 });
      assert((await take(a, mc[i])).result === 'ok', `monster ${i + 1} summoned by one tap (gather % = 0 skips the condition)`);
    }
    await waitState();
    assert((await ack(a, xc[1])).result === 'in_fight', 'cannot scan during a fight');

    const hp0 = T().hp;
    for (let k = 0; k < 10; k++) { a.s.emit('tap'); await sleep(60); }
    await waitState();
    assert(T().hp >= hp0, `monster ${i + 1} ignores a single tapper`);

    const t0 = Date.now();
    while (T().phase === 'fight' && Date.now() - t0 < 60000) { team0.forEach((b) => b.s.emit('tap')); await sleep(70); }
    await waitState();
    assert(T().defeated === i + 1, `monster ${i + 1} defeated by teamwork`);
  }
  assert(team0[0].state.team.phase === 'done' && team0[0].state.rank[0] === 0, 'team finished the armor and ranks first');
  assert(board.teams[1].stage === 0, 'the other team is untouched');
  await post('/api/admin/settings', { teamCount: 4 }); await sleep(300);
  assert(board.teams.length === 4, 'admin can add teams while the game is running');
  await post('/api/admin/settings', { teamCount: 2 }); await sleep(300);
  assert(board.teams.length === 4, 'teams cannot be removed while running');
  await post('/api/admin/skip', { team: 1 }); await sleep(400);
  assert(board.teams[1].phase === 'monster', 'admin skip gives the team its tool');
  assert((await ack(bots.find((b) => teamOf(b) === 1), tc[0])).result === 'item', 'both teams share the same QR codes');
  // per-player skip: team 2 is in the "monster" phase; the gather % is 0 now, so one player's skip summons it
  await post('/api/admin/settings', { gatherPercent: 50 });
  const m1 = board.teams[1].members;
  assert(m1.every((m) => typeof m.uid === 'number' && !('pid' in m)), 'players have a public uid, never their secret pid');
  assert((await post('/api/admin/skip', { player: m1[0].uid })).ok, 'admin skips player 1 of team 2'); await sleep(400);
  assert(board.teams[1].phase === 'monster' && board.teams[1].gather.have === 1, 'one player gathered (1/2): still waiting');
  assert((await post('/api/admin/skip', { player: m1[1].uid })).ok, 'admin skips player 2 of team 2'); await sleep(400);
  assert(board.teams[1].phase === 'fight', '2 of 3 gathered: the fight starts');
  console.log('\nALL PASSED');
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
