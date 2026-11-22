// Shared by every page: language (Arabic / English), sound effects, and all the 2D artwork (drawn as SVG, no image files).
const LANG = (() => { // ?lang=en|ar wins (handy for screenshots), then the saved choice, then Arabic
  const q = new URLSearchParams(location.search).get('lang');
  if (q === 'ar' || q === 'en') return q;
  try { return localStorage.getItem('aog_lang') || 'ar'; } catch { return 'ar'; }
})();
document.documentElement.lang = LANG;
document.documentElement.dir = LANG === 'ar' ? 'rtl' : 'ltr';

const I18N = {
  ar: {
    title: 'سلاح الله الكامل', sub: 'أفسس ٦: ١٠–١٨', yourName: 'اكتب اسمك', join: 'انضم للمعركة', continueAs: 'متابعة باسم',
    joinErr: 'اكتب اسمك أولًا', team: 'فريقك', waitStart: 'بانتظار بدء المعركة…', waitHint: 'كونوا جاهزين مع فريقكم',
    members: 'أعضاء الفريق', seekTool: 'ابحثوا عن QR الأداة', seekMonster: 'ابحثوا عن QR الوحش', seekHint: 'وجّهوا الكاميرا نحو كود QR مخفي. سيظهر شيء شفاف — اضغطوا عليه لتأخذوه', camStart: 'افتح الكاميرا', camErr: 'تعذّر فتح الكاميرا. اسمحوا للمتصفح باستخدامها أو اكتبوا الكود.', camInsecure: 'الكاميرا تحتاج رابط https. افتحوا الرابط من الـ QR الخاص بالانضمام.',
    orType: 'أو اكتبوا الكود المطبوع تحته', send: 'إرسال', codePh: 'الكود', clue: 'تلميح',
    gatherTitle: 'التجمّع عند الوحش', gatherHelp: 'على أفراد الفريق أن يتجمعوا عند كود الوحش: يمسحه كل واحد ثم يضغط عليه', gatherCount: '{have} من {need} حاضرون', gatheringReg: 'سُجّل حضوركم! بانتظار الفريق ({have}/{need}) — ليمسح البقية كود الوحش ويضغطوا عليه', gatherNone: 'لا يوجد شرط تجمّع — اضغطوا على الوحش لاستدعائه',
    playersList: 'اللاعبون ومستوياتهم', offline_: 'غير متصل',
    teamCount: 'عدد الفرق', gatherPct: 'نسبة الفريق المطلوبة عند الوحش (٠ = بدون شرط)', openDemo: 'صفحة التجربة', shuffle: 'خلط', showNames: 'إظهار الأسماء', autoShuffle: 'خلط تلقائي', onlyRunning: 'يمكن الزيادة فقط أثناء اللعب',
    tapTool: 'اضغط لتأخذ الأداة', tapMonster: 'اضغط لاستدعاء الوحش', tapItem: 'اضغط لتأخذه', level: 'المستوى', already_beaten: 'هذا الوحش هُزم بالفعل', trap_empty: 'كان فخًّا! لحسن الحظ لا تملكون أداة لتخسروها', in_fight: 'أنتم في معركة الآن', done: 'أكملتم اللعبة',
    trapTitle: 'وقعتم في فخ!', trapLost: 'خسرتم', trapGo: 'ارجعوا وامسحوا QR هذه الأداة من جديد وخذوها — لا حاجة لهزيمة الوحش مرة أخرى.', feedLost: '{team} خسروا {tool} بسبب فخ!', recollect: 'استعادة',
    found: 'وجدتم الأداة!', foundBy: 'مسحها', monsterAppears: 'والآن ابحثوا عن QR الوحش الذي يحرسها!', summoned: 'ظهر الوحش!', fight: 'قاتلوا!',
    fightHint: 'اضغطوا بسرعة على الوحش — كلكم معًا!', needTogether: 'يلزم {n} من فريقكم يضغطون معًا!',
    tappingNow: 'يضغطون الآن', healing: 'الوحش يستعيد قوته!', quorumOk: 'ممتاز! استمروا!',
    defeated: 'هُزم الوحش!', nextTool: 'ابحثوا الآن عن الأداة التالية', cont: 'متابعة',
    victory: 'اكتمل سلاح الله!', victorySub: 'ثبتوا ضد مكايد إبليس', time: 'الزمن', rank: 'الترتيب', place: 'المركز',
    wrong: 'كود غير صحيح', need_tool: 'اعثروا على أداة هذا الوحش أولًا!', too_early: 'ليس الآن! هذا المستوى {n}. اتبعوا الترتيب',
    already: 'تملكون هذه الأداة بالفعل', not_started: 'المعركة لم تبدأ بعد', unknown: 'انتهت الجلسة، انضم من جديد',
    attack: 'الوحش يهاجم!', connecting: 'جارٍ الاتصال…', offline: 'انقطع الاتصال، نحاول مجددًا…',
    // screen + admin
    scanToJoin: 'امسح للانضمام', players: 'لاعب', online: 'متصل', waitingStart: 'بانتظار البدء', running: 'المعركة دائرة',
    searching: 'يبحثون عن', searchingMonster: 'يبحثون عن QR الوحش:', fighting: 'يقاتلون', finished: 'أكملوا السلاح!', feedFound: '{team} وجدوا {tool}', feedDefeated: '{team} هزموا {monster}',
    feedSummon: '{team} استدعوا {monster}', feedDone: '{team} أكملوا سلاح الله!', start: 'ابدأ المعركة', reset: 'إعادة', confirmReset: 'إعادة ضبط كل التقدم؟',
    skip: 'تخطي', skipHint: 'تخطي الخطوة الحالية: أخذ الأداة / الحضور عند الوحش / هزيمته', printQr: 'طباعة أكواد QR', openScreen: 'فتح شاشة العرض',
    ipLabel: 'عنوان الشبكة', print: 'طباعة', hideTip: 'اطبعوا الصفحة وقصّوا الأكواد الثمانية عشر (أدوات ووحوش وفخاخ) وأخفوها. كل الفرق تبحث عن نفس الأكواد.',
    equipped: 'أداة', tool: 'الأداة', team_: 'الفريق', progress: 'التقدم', state: 'الحالة',
  },
  en: {
    title: 'The Whole Weapon of God', sub: 'Ephesians 6:10–18', yourName: 'Your name', join: 'Join the battle', continueAs: 'Continue as',
    joinErr: 'Please type your name', team: 'Your team', waitStart: 'Waiting for the battle to start…', waitHint: 'Get ready with your team',
    members: 'Team members', seekTool: 'Find the QR of the tool', seekMonster: 'Find the QR of the monster', seekHint: 'Point the camera at a hidden QR code. A see-through item appears — tap it to use it', camStart: 'Open camera', camErr: 'Could not open the camera. Allow it in the browser or type the code.', camInsecure: 'The camera needs an https link. Open the join link from the join QR.',
    orType: 'or type the code printed under it', send: 'Send', codePh: 'CODE', clue: 'Clue',
    gatherTitle: 'Gather at the monster', gatherHelp: 'Teammates must gather at the monster’s QR: each one scans it and taps it', gatherCount: '{have} of {need} are here', gatheringReg: 'You are registered! Waiting for the team ({have}/{need}) — the others must scan the monster QR and tap it', gatherNone: 'No gathering condition — tap the monster to summon it',
    playersList: 'Players and their levels', offline_: 'offline',
    teamCount: 'Number of teams', gatherPct: 'Team % needed at the monster (0 = no condition)', openDemo: 'Demo page', shuffle: 'Shuffle', showNames: 'Show names', autoShuffle: 'Auto shuffle', onlyRunning: 'While running you can only add teams',
    tapTool: 'Tap to collect the tool', tapMonster: 'Tap to summon the monster', tapItem: 'Tap to take it', level: 'Level', already_beaten: 'That monster is already beaten', trap_empty: 'It was a trap! Luckily you had no tool to lose', in_fight: 'You are in a battle now', done: 'You finished the game',
    trapTitle: 'You fell into a trap!', trapLost: 'You lost', trapGo: 'Go back, scan this tool’s QR again and take it — no need to beat the monster again.', feedLost: '{team} lost the {tool} to a trap!', recollect: 'Recollect',
    found: 'Tool found!', foundBy: 'Scanned by', monsterAppears: 'Now find the QR of the monster guarding it!', summoned: 'The monster appears!', fight: 'Fight!',
    fightHint: 'Tap the monster fast — all together!', needTogether: 'Need {n} teammates tapping together!',
    tappingNow: 'tapping now', healing: 'The monster is healing!', quorumOk: 'Great! Keep going!',
    defeated: 'Monster defeated!', nextTool: 'Now find the next tool', cont: 'Continue',
    victory: 'Weapon of God complete!', victorySub: 'Stand firm against the schemes of the devil', time: 'Time', rank: 'Rank', place: 'Place',
    wrong: 'Wrong code', need_tool: 'Collect this monster’s tool first!', too_early: 'Not now! This is level {n}. Follow the order',
    already: 'You already have this tool', not_started: 'The battle has not started yet', unknown: 'Session ended, please join again',
    attack: 'The monster attacks!', connecting: 'Connecting…', offline: 'Connection lost, retrying…',
    scanToJoin: 'Scan to join', players: 'players', online: 'online', waitingStart: 'Waiting to start', running: 'Battle in progress',
    searching: 'searching for', searchingMonster: 'looking for the QR of', fighting: 'fighting', finished: 'completed the Weapon of God!', feedFound: '{team} found the {tool}', feedDefeated: '{team} defeated {monster}',
    feedSummon: '{team} summoned {monster}', feedDone: '{team} completed the Whole Weapon of God!', start: 'Start the battle', reset: 'Reset', confirmReset: 'Reset all progress?',
    skip: 'Skip', skipHint: 'skip the current step: take the tool / be at the monster / beat it', printQr: 'Print QR codes', openScreen: 'Open big screen',
    ipLabel: 'Network address', print: 'Print', hideTip: 'Print, cut out the 18 codes (6 tools, 6 monsters, 6 trap decoys) and hide them. All teams hunt the same codes.',
    equipped: 'tool', tool: 'Tool', team_: 'Team', progress: 'Progress', state: 'Status',
  },
};
const t = (k, vars) => {
  let s = (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
  for (const [a, b] of Object.entries(vars || {})) s = s.replaceAll(`{${a}}`, b);
  return s;
};
const L = (o) => (o && (o[LANG] || o.en)) || '';
const toggleLang = () => { try { localStorage.setItem('aog_lang', LANG === 'ar' ? 'en' : 'ar'); } catch {} location.reload(); };
const fmtTime = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// click a small QR -> it fills the screen so people can scan it from far away (click / Esc to close)
function zoomable(el, caption) {
  el.style.cursor = 'zoom-in'; el.title = '🔍';
  const close = () => { const o = document.getElementById('qrfull'); if (o) o.remove(); };
  el.addEventListener('click', () => {
    close();
    const o = document.createElement('div'); o.id = 'qrfull';
    o.innerHTML = `<div class="qrbig">${el.innerHTML}</div>${caption ? `<div class="qrcap" dir="ltr">${esc(typeof caption === 'function' ? caption() : caption)}</div>` : ''}`;
    o.onclick = close; document.body.appendChild(o);
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

// ---------------------------------------------------------------- sound (WebAudio synth, no files)
const Sfx = {
  ctx: null,
  muted: (() => { try { return localStorage.getItem('aog_mute') === '1'; } catch { return false; } })(),
  init() {
    if (!this.ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) this.ctx = new C(); }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },
  toggle() { this.muted = !this.muted; try { localStorage.setItem('aog_mute', this.muted ? '1' : '0'); } catch {} return this.muted; },
  tone(f, d = 0.12, type = 'sine', vol = 0.15, slide = 0, delay = 0) {
    if (this.muted || !this.ctx) return;
    const c = this.ctx, at = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(f, at);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f + slide), at + d);
    g.gain.setValueAtTime(vol, at); g.gain.exponentialRampToValueAtTime(0.0001, at + d);
    o.connect(g).connect(c.destination); o.start(at); o.stop(at + d + 0.03);
  },
  noise(d = 0.2, vol = 0.2, delay = 0, freq = 900) {
    if (this.muted || !this.ctx) return;
    const c = this.ctx, at = c.currentTime + delay, n = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, n, c.sampleRate), data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    f.type = 'lowpass'; f.frequency.value = freq; src.buffer = buf; g.gain.value = vol;
    src.connect(f).connect(g).connect(c.destination); src.start(at);
  },
  tap() { this.tone(520 + Math.random() * 180, 0.06, 'square', 0.04); },
  hit() { this.tone(200, 0.1, 'sawtooth', 0.09, -120); this.noise(0.07, 0.1, 0, 1800); },
  blocked() { this.tone(140, 0.12, 'square', 0.06, -40); },
  attack() { this.tone(120, 0.55, 'sawtooth', 0.18, -70); this.noise(0.35, 0.25, 0, 500); this.tone(70, 0.5, 'square', 0.1, -20, 0.05); },
  found() { [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => this.tone(f, 0.4, 'triangle', 0.13, 0, i * 0.09)); this.noise(0.5, 0.06, 0, 6000); },
  defeat() { this.noise(0.7, 0.3, 0, 700); this.tone(300, 0.7, 'sawtooth', 0.15, -230); [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.35, 'triangle', 0.12, 0, 0.5 + i * 0.1)); },
  win() { [523, 523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.3, 'square', 0.09, 0, i * 0.16)); [262, 330, 392].forEach((f) => this.tone(f, 1.4, 'triangle', 0.12, 0, 1.2)); },
  lose() { this.noise(0.5, 0.25, 0, 500); [392, 330, 262, 196, 131].forEach((f, i) => this.tone(f, 0.25, 'sawtooth', 0.12, -20, i * 0.12)); },
  appear() { this.tone(880, 0.18, 'sine', 0.08, 220); this.tone(1320, 0.25, 'triangle', 0.06, 0, 0.1); },
  error() { this.tone(220, 0.15, 'square', 0.08, -60); this.tone(160, 0.2, 'square', 0.08, -40, 0.12); },
};
['pointerdown', 'keydown'].forEach((ev) => addEventListener(ev, () => Sfx.init(), { passive: true }));

// ---------------------------------------------------------------- artwork
let _uid = 0;
const DEFS = (p) => `<filter id="${p}ds" x="-25%" y="-20%" width="150%" height="160%"><feDropShadow dx="0" dy="9" stdDeviation="6" flood-color="#000" flood-opacity=".55"/></filter>`;
const svgWrap = (vb, inner, cls = '') => `<svg class="art ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

const Art = {
  // the 6 pieces of armor, in order
  tool(i, cls = '') {
    const p = `t${++_uid}_`;
    const metal = `<linearGradient id="${p}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f7fb"/><stop offset=".5" stop-color="#aab7c8"/><stop offset="1" stop-color="#5f6e84"/></linearGradient>`;
    const gold = `<linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".55" stop-color="#e8b923"/><stop offset="1" stop-color="#a87400"/></linearGradient>`;
    const leather = `<linearGradient id="${p}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e0aa63"/><stop offset="1" stop-color="#7d4d1d"/></linearGradient>`;
    const art = [
      // 0 belt of truth
      `<defs>${DEFS(p)}${gold}${leather}</defs><g filter="url(#${p}ds)">
        <rect x="8" y="76" width="184" height="48" rx="11" fill="url(#${p}l)"/>
        <rect x="8" y="79" width="184" height="9" rx="4" fill="#fff" opacity=".2"/>
        <path d="M18 88H182M18 112H182" stroke="#4d2f0f" stroke-width="2" stroke-dasharray="6 5" fill="none" opacity=".65"/>
        <rect x="68" y="62" width="64" height="76" rx="14" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="4"/>
        <rect x="80" y="76" width="40" height="48" rx="8" fill="#7d4d1d"/>
        <path d="M100 82l6 12 13 2-9.500 9 2.500 13-12-6.500-12 6.500 2.500-13-9.500-9 13-2z" fill="#fff4b0"/></g>`,
      // 1 breastplate
      `<defs>${DEFS(p)}${metal}${gold}</defs><g filter="url(#${p}ds)">
        <path d="M52 38 Q100 18 148 38 L168 90 Q160 146 100 182 Q40 146 32 90 Z" fill="url(#${p}m)" stroke="#47566c" stroke-width="4"/>
        <path d="M100 26 V180" stroke="#47566c" stroke-width="3" opacity=".5"/>
        <path d="M52 38 L100 60 L148 38" fill="none" stroke="#47566c" stroke-width="3" opacity=".6"/>
        <path d="M44 70 Q100 96 156 70" fill="none" stroke="#fff" stroke-width="5" opacity=".35"/>
        <path d="M100 82 l12 0 0 14 14 0 0 12 -14 0 0 28 -12 0 0 -28 -14 0 0 -12 14 0z" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="2.500" transform="translate(-6 0)"/></g>`,
      // 2 shoes of peace
      `<defs>${DEFS(p)}${leather}${gold}</defs><g filter="url(#${p}ds)">
        <path d="M62 28 H112 V104 C112 118 124 122 138 127 L172 138 C186 143 190 152 190 164 V176 H48 V28 Z" fill="url(#${p}l)" stroke="#4d2f0f" stroke-width="4"/>
        <rect x="46" y="164" width="146" height="20" rx="9" fill="#2c1a08"/>
        <path d="M62 52H112M62 68H112M62 84H112" stroke="#f6e3c0" stroke-width="4" stroke-linecap="round"/>
        <path d="M62 36 C22 20 6 52 14 84 C28 62 42 70 62 76 Z" fill="#fff" stroke="#b9c3d0" stroke-width="3"/>
        <path d="M18 74 C34 58 44 62 60 66 M20 62 C34 46 44 52 60 54" stroke="#c9d3e0" stroke-width="3" fill="none"/>
        <circle cx="150" cy="150" r="9" fill="url(#${p}g)"/></g>`,
      // 3 shield of faith
      `<defs>${DEFS(p)}${gold}<radialGradient id="${p}s" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#6aa8ff"/><stop offset="1" stop-color="#16397f"/></radialGradient></defs><g filter="url(#${p}ds)">
        <path d="M100 10 L174 34 V100 C174 148 138 174 100 192 C62 174 26 148 26 100 V34 Z" fill="url(#${p}g)"/>
        <path d="M100 22 L162 42 V100 C162 140 132 163 100 179 C68 163 38 140 38 100 V42 Z" fill="url(#${p}s)"/>
        <path d="M92 52 h16 v34 h28 v16 h-28 v52 h-16 v-52 h-28 v-16 h28z" fill="#fff" opacity=".95"/>
        <path d="M50 54 Q74 40 100 40" fill="none" stroke="#fff" stroke-width="6" opacity=".35" stroke-linecap="round"/></g>`,
      // 4 helmet of salvation
      `<defs>${DEFS(p)}${metal}${gold}</defs><g filter="url(#${p}ds)" transform="translate(0 8)">
        <path d="M100 6 C80 -8 118 -12 156 14 C136 10 124 18 114 30 Z" fill="#e23b3b" stroke="#8c1717" stroke-width="3"/>
        <path d="M36 112 C36 52 66 24 100 24 C134 24 164 52 164 112 V162 H132 V128 H68 V162 H36 Z" fill="url(#${p}m)" stroke="#47566c" stroke-width="4"/>
        <path d="M100 24 V104" stroke="#47566c" stroke-width="3" opacity=".5"/>
        <path d="M48 98 H152" stroke="url(#${p}g)" stroke-width="8" stroke-linecap="round"/>
        <rect x="64" y="104" width="72" height="14" rx="7" fill="#1b2433"/>
        <path d="M54 60 Q68 38 92 32" stroke="#fff" stroke-width="6" fill="none" opacity=".4" stroke-linecap="round"/></g>`,
      // 5 sword of the spirit
      `<defs>${DEFS(p)}${gold}<linearGradient id="${p}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e9db3"/><stop offset=".45" stop-color="#fff"/><stop offset="1" stop-color="#7a8aa2"/></linearGradient>
        <radialGradient id="${p}f" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe28a" stop-opacity=".9"/><stop offset="1" stop-color="#ff8a00" stop-opacity="0"/></radialGradient></defs>
        <ellipse class="aura" cx="100" cy="86" rx="62" ry="86" fill="url(#${p}f)"/><g filter="url(#${p}ds)">
        <path d="M100 4 L116 30 V124 H84 V30 Z" fill="url(#${p}b)" stroke="#57657c" stroke-width="3"/>
        <path d="M100 30 V118" stroke="#57657c" stroke-width="3" opacity=".5"/>
        <rect x="52" y="122" width="96" height="14" rx="7" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="3"/>
        <rect x="92" y="136" width="16" height="38" rx="5" fill="#6b3f17"/><path d="M92 146H108M92 156H108M92 166H108" stroke="#c28a46" stroke-width="2"/>
        <circle cx="100" cy="182" r="11" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="3"/></g>`,
    ][i];
    return svgWrap('0 0 200 200', art, `tool tool-${i} ${cls}`);
  },


  // the 6 tempting trap items
  trap(i, cls = '') {
    const p = `x${++_uid}_`;
    const gold = `<linearGradient id="${p}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff2a8"/><stop offset=".55" stop-color="#e8b923"/><stop offset="1" stop-color="#a87400"/></linearGradient>`;
    const shine = `<path class="glint" d="M150 30 l4 12 12 4 -12 4 -4 12 -4 -12 -12 -4 12 -4z" fill="#fff"/><path class="glint g2" d="M40 150 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" fill="#fff"/>`;
    const art = [
      // 0 golden coin
      `<defs>${DEFS(p)}${gold}</defs><g filter="url(#${p}ds)"><circle cx="100" cy="100" r="74" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="5"/><circle cx="100" cy="100" r="58" fill="none" stroke="#8d5f00" stroke-width="3" stroke-dasharray="4 5"/>
        <path d="M112 62 C84 54 78 82 100 94 C122 106 116 138 86 134 M99 52 V148" stroke="#7a5200" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M52 70 Q70 48 96 40" stroke="#fff" stroke-width="6" fill="none" opacity=".5" stroke-linecap="round"/></g>${shine}`,
      // 1 mirror
      `<defs>${DEFS(p)}${gold}<radialGradient id="${p}r" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="#a9d6ff"/><stop offset="1" stop-color="#4a78c7"/></radialGradient></defs><g filter="url(#${p}ds)">
        <rect x="90" y="132" width="20" height="56" rx="9" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="3"/><ellipse cx="100" cy="82" rx="62" ry="70" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="4"/><ellipse cx="100" cy="82" rx="50" ry="58" fill="url(#${p}r)"/>
        <path d="M68 52 Q78 36 98 32" stroke="#fff" stroke-width="7" fill="none" opacity=".8" stroke-linecap="round"/></g>${shine}`,
      // 2 apple
      `<defs>${DEFS(p)}<radialGradient id="${p}a" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#ff8a8a"/><stop offset=".55" stop-color="#e01e2c"/><stop offset="1" stop-color="#7d0712"/></radialGradient></defs><g filter="url(#${p}ds)">
        <path d="M100 58 C70 36 24 58 30 112 C36 160 74 186 100 172 C126 186 164 160 170 112 C176 58 130 36 100 58 Z" fill="url(#${p}a)" stroke="#5a0510" stroke-width="4"/>
        <path d="M100 58 C100 44 104 32 114 22" stroke="#5b3a14" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M110 34 C130 14 158 20 162 34 C142 44 124 42 110 34 Z" fill="#3fb34f" stroke="#1d6b2a" stroke-width="3"/>
        <path d="M54 82 Q60 66 78 60" stroke="#fff" stroke-width="8" fill="none" opacity=".55" stroke-linecap="round"/></g>${shine}`,
      // 3 gem
      `<defs>${DEFS(p)}<linearGradient id="${p}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8fbff"/><stop offset=".5" stop-color="#38c7f0"/><stop offset="1" stop-color="#7a35d6"/></linearGradient></defs><g filter="url(#${p}ds)">
        <path d="M60 50 H140 L178 96 L100 180 L22 96 Z" fill="url(#${p}c)" stroke="#2a3a8c" stroke-width="4" stroke-linejoin="round"/>
        <path d="M22 96 H178 M60 50 L80 96 L100 180 L120 96 L140 50 M80 96 L100 50 L120 96" fill="none" stroke="#fff" stroke-width="3" opacity=".7" stroke-linejoin="round"/></g>${shine}`,
      // 4 chalice
      `<defs>${DEFS(p)}${gold}</defs><g filter="url(#${p}ds)">
        <path d="M44 40 H156 C156 96 134 118 108 122 V150 H136 V172 H64 V150 H92 V122 C66 118 44 96 44 40 Z" fill="url(#${p}g)" stroke="#8d5f00" stroke-width="4" stroke-linejoin="round"/>
        <path d="M50 52 H150 C148 90 130 108 108 112 H92 C70 108 52 90 50 52 Z" fill="#8a2be2" opacity=".9"/><circle cx="84" cy="70" r="6" fill="#d9a6ff"/><circle cx="116" cy="84" r="4" fill="#d9a6ff"/>
        <circle cx="100" cy="136" r="7" fill="#e23b3b" stroke="#8d5f00" stroke-width="2"/></g>${shine}`,
      // 5 mask
      `<defs>${DEFS(p)}${gold}</defs><g filter="url(#${p}ds)">
        <path d="M30 50 C60 36 140 36 170 50 C180 110 150 168 100 184 C50 168 20 110 30 50 Z" fill="#fff7e6" stroke="url(#${p}g)" stroke-width="7"/>
        <path d="M52 84 Q70 68 88 84 Q70 94 52 84 Z M112 84 Q130 68 148 84 Q130 94 112 84 Z" fill="#1b1330"/>
        <path d="M60 130 Q100 168 140 130" stroke="#c4223a" stroke-width="9" fill="none" stroke-linecap="round"/>
        <circle cx="62" cy="112" r="9" fill="#ffb3c0" opacity=".7"/><circle cx="138" cy="112" r="9" fill="#ffb3c0" opacity=".7"/><path d="M92 40 L100 22 L108 40 Z" fill="url(#${p}g)"/></g>${shine}`,
    ][i];
    return svgWrap('0 0 200 200', art, `tool trap trap-${i} ${cls}`);
  },

  // the 6 monsters, in order. Uses the animated image rig (public/monsters) when it is loaded, else the SVG drawing below.
  monster(i, cls = '') {
    const rig = window.MONSTER_RIG && window.MONSTER_RIG[i];
    if (rig) {
      const R = Array.isArray(rig) ? { layers: rig } : rig;
      const noGl = window.MWARP && window.MWARP.ok === false;   // no WebGL on this phone: show the picture without the warp
      const canvas = R.warp && noGl ? `<img class="mwarp" src="${R.warp}" alt="">` : R.warp ? `<canvas class="mwarp" data-src="${R.warp}" data-m="${i}" width="384" height="384"></canvas>` : '';
      return `<div class="mrig monster monster-${i} ${cls}">${canvas}<div class="mbody ${R.g || ''}">${R.layers.map((l) => `<div class="ml ${l.v ? 'v-' + l.v : ''}" style="left:${l.l}%;top:${l.t}%;width:${l.w}%;z-index:${l.z};${l.r ? `transform:rotate(${l.r}deg);` : ''}"><img class="${l.c}" src="${l.src}" alt="" draggable="false" style="transform-origin:${l.o};${l.fx ? 'scale:-1 1;' : ''}${l.k ? `clip-path:${l.k};` : ''}"></div>`).join('')}</div></div>`;
    }
    return Art.monsterSvg(i, cls);
  },
  monsterSvg(i, cls = '') {
    const p = `m${++_uid}_`;
    const grad = (id, a, b) => `<radialGradient id="${p}${id}" cx=".4" cy=".3" r=".9"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient>`;
    const eye = (cx, cy, r, pupil = '#111', iris = '#fff') => `<g class="eye"><circle cx="${cx}" cy="${cy}" r="${r}" fill="${iris}" stroke="#0007" stroke-width="2"/><circle class="pupil" cx="${cx}" cy="${cy}" r="${r * 0.45}" fill="${pupil}"/></g>`;
    const art = [
      // 0 the Liar: purple, long nose, forked tongue
      `<defs>${DEFS(p)}${grad('a', '#b57cff', '#4a1d86')}</defs><g class="m-body" filter="url(#${p}ds)">
        <path d="M70 62 L84 20 L102 60 Z M170 62 L156 20 L138 60 Z" fill="#2f0f57"/>
        <ellipse cx="120" cy="142" rx="76" ry="72" fill="url(#${p}a)" stroke="#2f0f57" stroke-width="4"/>
        ${eye(94, 124, 17, '#111')}${eye(146, 124, 17, '#111')}
        <path d="M84 104 L110 114 M156 104 L130 114" stroke="#2f0f57" stroke-width="6" stroke-linecap="round"/>
        <path class="nose" d="M118 134 L206 156 L118 168 Z" fill="#c79bff" stroke="#2f0f57" stroke-width="3"/>
        <path d="M82 186 Q120 214 160 186" fill="#2a0a1c" stroke="#2f0f57" stroke-width="4"/>
        <path class="tongue" d="M120 200 V222 M120 222 l-8 8 M120 222 l8 8" stroke="#ff4d6d" stroke-width="5" stroke-linecap="round" fill="none"/>
        <text class="float" x="26" y="70" font-size="34" fill="#e9d5ff" font-weight="700">?</text><text class="float d2" x="196" y="86" font-size="30" fill="#e9d5ff" font-weight="700">!?</text></g>`,
      // 1 the Accuser: red, pointing finger
      `<defs>${DEFS(p)}${grad('a', '#ff6b6b', '#7f1010')}</defs><g class="m-body" filter="url(#${p}ds)">
        <path d="M70 66 L58 22 L98 52 Z M170 66 L182 22 L142 52 Z" fill="#4a0707"/>
        <ellipse cx="120" cy="140" rx="72" ry="74" fill="url(#${p}a)" stroke="#4a0707" stroke-width="4"/>
        <path d="M78 104 L112 122 M162 104 L128 122" stroke="#250303" stroke-width="9" stroke-linecap="round"/>
        <ellipse cx="96" cy="130" rx="13" ry="9" fill="#ffd84d"/><ellipse cx="144" cy="130" rx="13" ry="9" fill="#ffd84d"/>
        <rect class="pupil" x="94" y="123" width="4" height="14" fill="#111"/><rect class="pupil" x="142" y="123" width="4" height="14" fill="#111"/>
        <path d="M84 170 H156 L146 196 L134 176 L120 198 L106 176 L94 196 Z" fill="#fff" stroke="#250303" stroke-width="3"/>
        <g class="point"><path d="M178 150 L222 98" stroke="#b42323" stroke-width="22" stroke-linecap="round"/><path d="M222 98 L236 76" stroke="#ff8a8a" stroke-width="12" stroke-linecap="round"/></g>
        <rect x="22" y="150" width="34" height="46" rx="4" fill="#f2e3c2" stroke="#6b4a1d" stroke-width="3" transform="rotate(-14 39 173)"/>
        <path d="M30 164 H50 M30 174 H50 M30 184 H44" stroke="#6b4a1d" stroke-width="3" transform="rotate(-14 39 173)"/></g>`,
      // 2 the Fear Phantom: dark ghost with a crack
      `<defs>${DEFS(p)}${grad('a', '#5b6bd6', '#10153d')}</defs><g class="m-body" filter="url(#${p}ds)">
        <path d="M44 214 V112 C44 34 196 34 196 112 V214 L172 192 L146 218 L120 192 L94 218 L68 192 Z" fill="url(#${p}a)" stroke="#080b22" stroke-width="4"/>
        <path d="M120 44 L110 78 L128 96 L112 128 L130 150" stroke="#cfe3ff" stroke-width="4" fill="none" opacity=".8"/>
        <g class="eye"><ellipse cx="92" cy="110" rx="17" ry="22" fill="#9ff3ff"/><circle class="pupil" cx="92" cy="114" r="8" fill="#031b2b"/>
        <ellipse cx="150" cy="110" rx="17" ry="22" fill="#9ff3ff"/><circle class="pupil" cx="150" cy="114" r="8" fill="#031b2b"/></g>
        <path d="M78 156 L92 148 L104 160 L116 148 L128 160 L140 148 L162 156 L150 184 L120 172 L90 184 Z" fill="#050818" stroke="#cfe3ff" stroke-width="2"/>
        <g class="wisp" fill="#8fa3ff" opacity=".55"><circle cx="30" cy="150" r="9"/><circle cx="214" cy="140" r="12"/><circle cx="24" cy="94" r="6"/></g></g>`,
      // 3 the Doubt Cyclops: green, one eye, fiery darts
      `<defs>${DEFS(p)}${grad('a', '#8be26b', '#1f6b22')}<radialGradient id="${p}e" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff"/><stop offset=".7" stop-color="#fff"/><stop offset="1" stop-color="#ffb4b4"/></radialGradient></defs><g class="m-body" filter="url(#${p}ds)">
        <path d="M78 64 L70 26 L102 52 Z M162 64 L170 26 L138 52 Z" fill="#124a15"/>
        <ellipse cx="120" cy="140" rx="74" ry="76" fill="url(#${p}a)" stroke="#124a15" stroke-width="4"/>
        <circle cx="120" cy="124" r="40" fill="url(#${p}e)" stroke="#124a15" stroke-width="4"/>
        <path d="M84 118 L100 124 M156 118 L140 124 M96 100 L108 112 M144 100 L132 112" stroke="#e24b4b" stroke-width="2" opacity=".7"/>
        <circle class="pupil" cx="120" cy="124" r="19" fill="#1c0b2e"/><circle cx="113" cy="117" r="6" fill="#fff"/>
        <path d="M74 134 Q86 96 120 84 Q154 96 166 134" fill="none" stroke="#124a15" stroke-width="7" stroke-linecap="round"/>
        <path d="M84 188 Q120 176 156 188" fill="none" stroke="#124a15" stroke-width="6" stroke-linecap="round"/></g>
        <g class="dart d1"><path d="M10 40 L58 62" stroke="#7b4a1a" stroke-width="4"/><path d="M58 62 L46 50 L50 68 Z" fill="#ccc"/><path d="M12 38 C-2 28 6 18 14 26 C16 14 28 20 20 36 Z" fill="#ff9a1f"/></g>
        <g class="dart d2"><path d="M232 60 L186 92" stroke="#7b4a1a" stroke-width="4"/><path d="M186 92 L200 88 L192 78 Z" fill="#ccc"/><path d="M234 58 C246 46 236 38 228 46 C228 34 216 40 224 56 Z" fill="#ff9a1f"/></g>
        <g class="dart d3"><path d="M20 196 L62 170" stroke="#7b4a1a" stroke-width="4"/><path d="M62 170 L50 170 L58 182 Z" fill="#ccc"/><path d="M18 198 C6 208 16 220 24 212 C28 224 40 214 28 200 Z" fill="#ff9a1f"/></g>`,
      // 4 the Storm of Despair: grey cloud, tears, lightning
      `<defs>${DEFS(p)}${grad('a', '#8b93a7', '#2c3142')}</defs><g class="m-body" filter="url(#${p}ds)">
        <g fill="url(#${p}a)" stroke="#1a1d29" stroke-width="4"><circle cx="76" cy="124" r="46"/><circle cx="122" cy="96" r="58"/><circle cx="168" cy="126" r="46"/><rect x="60" y="124" width="124" height="48" rx="24"/></g>
        <g fill="url(#${p}a)"><circle cx="76" cy="124" r="43"/><circle cx="122" cy="96" r="55"/><circle cx="168" cy="126" r="43"/><rect x="62" y="126" width="120" height="44" rx="22"/></g>
        <ellipse cx="98" cy="118" rx="12" ry="14" fill="#fff"/><ellipse cx="148" cy="118" rx="12" ry="14" fill="#fff"/>
        <circle class="pupil" cx="98" cy="124" r="6" fill="#111"/><circle class="pupil" cx="148" cy="124" r="6" fill="#111"/>
        <path d="M82 96 L110 106 M162 96 L134 106" stroke="#1a1d29" stroke-width="6" stroke-linecap="round"/>
        <path d="M100 156 Q122 140 146 156" fill="none" stroke="#1a1d29" stroke-width="6" stroke-linecap="round"/>
        <path class="bolt" d="M126 168 L100 206 L120 206 L106 238 L146 194 L124 194 L140 168 Z" fill="#ffe14d" stroke="#a37d00" stroke-width="2"/>
        <g fill="#7cc4ff"><path class="tear" d="M92 140 q-7 12 0 16 q7 -4 0 -16z"/><path class="tear t2" d="M156 140 q-7 12 0 16 q7 -4 0 -16z"/><path class="tear t3" d="M54 170 q-6 10 0 14 q6 -4 0 -14z"/><path class="tear t4" d="M192 172 q-6 10 0 14 q6 -4 0 -14z"/></g></g>`,
      // 5 the Great Dragon
      `<defs>${DEFS(p)}${grad('a', '#ff7a45', '#7a0f0f')}${grad('w', '#5a1a1a', '#1c0505')}</defs><g class="m-body" filter="url(#${p}ds)">
        <path d="M96 118 C40 70 6 76 4 30 C40 40 70 48 100 80 Z" fill="url(#${p}w)" stroke="#0e0202" stroke-width="3"/>
        <path d="M144 118 C200 70 234 76 236 30 C200 40 170 48 140 80 Z" fill="url(#${p}w)" stroke="#0e0202" stroke-width="3"/>
        <path d="M80 70 C60 40 66 14 84 4 C84 28 98 40 106 52 Z M160 70 C180 40 174 14 156 4 C156 28 142 40 134 52 Z" fill="#f1e6cf" stroke="#3a2a10" stroke-width="3"/>
        <path d="M60 120 C60 64 180 64 180 120 C186 176 154 218 120 218 C86 218 54 176 60 120 Z" fill="url(#${p}a)" stroke="#3b0606" stroke-width="4"/>
        <path d="M120 66 L112 84 L128 84 Z M98 74 L92 90 L106 88 Z M142 74 L148 90 L134 88 Z" fill="#3b0606"/>
        <path d="M70 108 L108 122 M170 108 L132 122" stroke="#210303" stroke-width="8" stroke-linecap="round"/>
        <path d="M78 124 Q96 108 112 128 Q94 138 78 124 Z M162 124 Q144 108 128 128 Q146 138 162 124 Z" fill="#ffe14d" stroke="#210303" stroke-width="3"/>
        <rect class="pupil" x="92" y="116" width="5" height="16" fill="#111"/><rect class="pupil" x="143" y="116" width="5" height="16" fill="#111"/>
        <ellipse cx="106" cy="160" rx="8" ry="5" fill="#210303"/><ellipse cx="134" cy="160" rx="8" ry="5" fill="#210303"/>
        <path d="M82 178 Q120 168 158 178 Q150 208 120 210 Q90 208 82 178 Z" fill="#2a0505" stroke="#210303" stroke-width="3"/>
        <path d="M90 180 L96 196 L102 178 M138 178 L144 196 L150 180" fill="#fff" stroke="#fff" stroke-width="3"/>
        <path class="flame" d="M120 192 C100 208 104 232 120 238 C136 232 140 208 120 192 Z" fill="#ffb02e"/>
        <path class="flame f2" d="M120 206 C110 218 112 230 120 234 C128 230 130 218 120 206 Z" fill="#fff2a8"/></g>`,
    ][i];
    return svgWrap('0 0 240 250', art, `monster monster-${i} ${cls}`);
  },
};
