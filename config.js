// Everything you may want to tweak lives here: teams, the 6 tools, the 6 monsters and their difficulty.
const COLORS = [
  { ar: 'الأحمر', en: 'Red', color: '#ef4444' },
  { ar: 'الأزرق', en: 'Blue', color: '#3b82f6' },
  { ar: 'الأخضر', en: 'Green', color: '#22c55e' },
  { ar: 'الذهبي', en: 'Gold', color: '#eab308' },
  { ar: 'البنفسجي', en: 'Purple', color: '#a855f7' },
  { ar: 'البرتقالي', en: 'Orange', color: '#f97316' },
  { ar: 'الوردي', en: 'Pink', color: '#ec4899' },
  { ar: 'الفيروزي', en: 'Teal', color: '#14b8a6' },
];
const MAX_TEAMS = COLORS.length;

// the admin can change the number of teams while the game runs (default 2, up to MAX_TEAMS)
const DEFAULT_TEAMS = Math.max(2, Math.min(MAX_TEAMS, parseInt(process.env.TEAMS, 10) || 2));
// % of the online team that must gather at a monster (scan + tap its item) before the fight starts; 0 = no condition
const DEFAULT_GATHER_PERCENT = Math.max(0, Math.min(100, process.env.GATHER_PERCENT === undefined ? 50 : parseInt(process.env.GATHER_PERCENT, 10) || 0));

const teamDefs = COLORS.map((c, id) => ({
  id,
  color: c.color,
  name: { ar: `الفريق ${c.ar}`, en: `${c.en} Team` },
  colorName: { ar: c.ar, en: c.en },
}));

// order matters: tool N must be found, then monster N defeated, before tool N+1 unlocks
// hint: optional clue shown to players while they hunt (e.g. where to look) - leave empty to hide
const tools = [
  {
    ar: 'منطقة الحق', en: 'Belt of Truth',
    ref: { ar: 'أفسس ٦: ١٤', en: 'Ephesians 6:14' },
    verse: {
      ar: 'فَاثْبُتُوا مُمَنْطِقِينَ أَحْقَاءَكُمْ بِالْحَقِّ',
      en: 'Stand therefore, having your loins girt about with truth',
    },
    hint: { ar: '', en: '' },
  },
  {
    ar: 'درع البر', en: 'Breastplate of Righteousness',
    ref: { ar: 'أفسس ٦: ١٤', en: 'Ephesians 6:14' },
    verse: {
      ar: 'وَلاَبِسِينَ دِرْعَ الْبِرِّ',
      en: 'and having on the breastplate of righteousness',
    },
    hint: { ar: '', en: '' },
  },
  {
    ar: 'حذاء استعداد إنجيل السلام', en: 'Shoes of the Gospel of Peace',
    ref: { ar: 'أفسس ٦: ١٥', en: 'Ephesians 6:15' },
    verse: {
      ar: 'وَحَاذِينَ أَرْجُلَكُمْ بِاسْتِعْدَادِ إِنْجِيلِ السَّلاَمِ',
      en: 'And your feet shod with the preparation of the gospel of peace',
    },
    hint: { ar: '', en: '' },
  },
  {
    ar: 'ترس الإيمان', en: 'Shield of Faith',
    ref: { ar: 'أفسس ٦: ١٦', en: 'Ephesians 6:16' },
    verse: {
      ar: 'حَامِلِينَ فَوْقَ الْكُلِّ تُرْسَ الإِيمَانِ، الَّذِي بِهِ تَقْدِرُونَ أَنْ تُطْفِئُوا جَمِيعَ سِهَامِ الشِّرِّيرِ الْمُلْتَهِبَةِ',
      en: 'Above all, taking the shield of faith, wherewith ye shall be able to quench all the fiery darts of the wicked',
    },
    hint: { ar: '', en: '' },
  },
  {
    ar: 'خوذة الخلاص', en: 'Helmet of Salvation',
    ref: { ar: 'أفسس ٦: ١٧', en: 'Ephesians 6:17' },
    verse: {
      ar: 'وَخُذُوا خُوذَةَ الْخَلاَصِ',
      en: 'And take the helmet of salvation',
    },
    hint: { ar: '', en: '' },
  },
  {
    ar: 'سيف الروح', en: 'Sword of the Spirit',
    ref: { ar: 'أفسس ٦: ١٧', en: 'Ephesians 6:17' },
    verse: {
      ar: 'وَسَيْفَ الرُّوحِ الَّذِي هُوَ كَلِمَةُ اللهِ',
      en: 'and the sword of the Spirit, which is the word of God',
    },
    hint: { ar: '', en: '' },
  },
];

// hint (optional): where the QR is hidden, shown to players while they search for it
// hpPerPlayer: monster health = hpPerPlayer x (team members online when the fight starts)
//              (about 4 taps/sec/player, so 25 ~ 6s when the whole team taps together)
// need: how many teammates must tap at the same moment (about 1.2s window) to hurt it.
//       Capped by the team's online members, so small teams can still win.
const monsters = [
  { ar: 'وحش الكذب', en: 'The Liar', tag: { ar: 'يهمس بالأكاذيب', en: 'Whispers lies' }, hpPerPlayer: 25, need: 2, hint: { ar: '', en: '' } },
  { ar: 'وحش الاتهام', en: 'The Accuser', tag: { ar: 'يشير بإصبع الاتهام', en: 'Points the finger of blame' }, hpPerPlayer: 30, need: 3, hint: { ar: '', en: '' } },
  { ar: 'وحش الخوف والانقسام', en: 'The Fear Phantom', tag: { ar: 'يزرع الخوف والفرقة', en: 'Sows fear and division' }, hpPerPlayer: 38, need: 3, hint: { ar: '', en: '' } },
  { ar: 'وحش الشك', en: 'The Doubt Cyclops', tag: { ar: 'يرمي سهامًا ملتهبة', en: 'Hurls fiery darts' }, hpPerPlayer: 46, need: 4, hint: { ar: '', en: '' } },
  { ar: 'وحش اليأس', en: 'The Storm of Despair', tag: { ar: 'يمطر حزنًا وظلمة', en: 'Rains sorrow and darkness' }, hpPerPlayer: 56, need: 5, hint: { ar: '', en: '' } },
  { ar: 'التنين العظيم', en: 'The Great Dragon', tag: { ar: 'المجرّب الأكبر', en: 'The great tempter' }, hpPerPlayer: 70, need: 6, hint: { ar: '', en: '' } },
];

// 6 trap items: tempting things hidden like the real ones. Tapping one makes the team lose its last collected tool.
// (name = what players see on the item, lesson = shown after they fall for it)
const traps = [
  { ar: 'عملة ذهبية', en: 'Golden Coin', lesson: { ar: 'محبة المال أصل كل شر', en: 'The love of money is a root of all evil' }, hint: { ar: '', en: '' } },
  { ar: 'مرآة لامعة', en: 'Shiny Mirror', lesson: { ar: 'الكبرياء قبل الانكسار', en: 'Pride goes before destruction' }, hint: { ar: '', en: '' } },
  { ar: 'تفاحة حمراء', en: 'Red Apple', lesson: { ar: 'الإغراء يبدو جميلًا', en: 'Temptation looks sweet' }, hint: { ar: '', en: '' } },
  { ar: 'جوهرة براقة', en: 'Glittering Gem', lesson: { ar: 'الطمع يُعمي العيون', en: 'Greed blinds the eyes' }, hint: { ar: '', en: '' } },
  { ar: 'كأس مزخرف', en: 'Fancy Chalice', lesson: { ar: 'ليس كل ما يلمع نافعًا', en: 'Not everything shiny is good' }, hint: { ar: '', en: '' } },
  { ar: 'قناع جميل', en: 'Pretty Mask', lesson: { ar: 'الرياء يخدع الجميع', en: 'Hypocrisy fools everyone' }, hint: { ar: '', en: '' } },
];

module.exports = { teamDefs, MAX_TEAMS, DEFAULT_TEAMS, DEFAULT_GATHER_PERCENT, tools, monsters, traps, TAP_WINDOW_MS: 1200, REGEN_PER_SEC: 0.05, GATHER_WINDOW_MS: 45000 };
