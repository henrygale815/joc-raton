// Murdoku „Unde s-a ascuns Mișșișșippi?”: harta casei, cartonașele cu indicii, jetoanele și soluția.
// Rulare: node murdoku/genereaza.js
//   -> murdoku/indicii.png, harta.png, harta-piese.png, jetoane.png, solutie.png (A4 orizontal, 300 DPI)
// Verifică întâi că indiciile au o singură soluție; altfel se oprește.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const W = 1188, H = 840; // A4 orizontal; 1 unitate = 0,25 mm
const ROWS = 8, COLS = 11, CS = 84;
const ink = '#2f2a3a';

// ---------- casa ----------
// camerele: [nume, rând, coloană, înălțime, lățime]
const ROOMS = [
  ['dormitor', 0, 0, 3, 4], ['baie', 0, 4, 3, 2], ['camera', 0, 6, 3, 4], ['balcon', 0, 10, 3, 1],
  ['sufragerie', 3, 0, 5, 5], ['hol', 3, 5, 5, 1], ['bucatarie', 3, 6, 3, 4], ['bucatarie', 6, 8, 2, 2],
  ['baie2', 6, 6, 2, 2], ['balcon2', 3, 10, 3, 1],
];
// podeaua fiecărei camere: [culoare, model]
const FLOOR = {
  dormitor: ['#e6dcef', 'lemn'], camera: ['#dde8f1', 'lemn'], sufragerie: ['#f1e4cc', 'lemn'], hol: ['#e7e1d8', 'lemn'],
  baie: ['#dcefec', 'gresie'], baie2: ['#dcefec', 'gresie'], bucatarie: ['#f2ead9', 'gresie'], balcon: ['#e3eedb', 'gresie'], balcon2: ['#e3eedb', 'gresie'],
};
// mobila: [tip, rând, coloană, înălțime, lățime]
const FURN = [
  ['sifonier', 0, 0, 2, 1], ['pat2', 0, 1, 2, 2],
  ['cada', 0, 4, 1, 2], ['chiuveta', 1, 4, 1, 1], ['wc', 1, 5, 1, 1],
  ['pat1', 0, 6, 2, 1], ['birou', 0, 9, 1, 1],
  ['raft', 3, 0, 1, 1], ['birou', 3, 1, 1, 1], ['tv', 3, 2, 1, 1], ['raft', 3, 4, 1, 1], ['raft', 5, 0, 1, 1],
  ['pickup', 7, 0, 1, 1], ['fotoliu', 7, 1, 1, 1], ['canapea', 7, 2, 1, 2], ['fotoliu', 7, 4, 1, 1],
  ['frigider', 4, 5, 1, 1], ['cuier', 7, 5, 1, 1],
  ['chiuveta', 6, 6, 1, 1], ['wc', 6, 7, 1, 1], ['litiera', 7, 7, 1, 1],
  ['blat', 3, 8, 1, 2], ['scaun', 4, 6, 1, 1], ['masa', 4, 7, 1, 1], ['scaun', 4, 8, 1, 1], ['spalat', 7, 8, 1, 1],
];
// uși: [rând, coloană, latura] – rămâne o deschidere în perete
const DOORS = [[5, 5, 'l'], [3, 5, 'r'], [7, 5, 'r'], [3, 5, 't'], [7, 5, 'b'], [4, 9, 'r'], [1, 9, 'r'], [2, 3, 'b'], [2, 6, 'b']];
// pe ce se poate sta (în rest, mobila ocupă pătrățelul)
const SOFT = new Set(['pat1', 'pat2', 'canapea', 'fotoliu', 'scaun', 'cada']);

const room = (r, c) => { for (const [k, r0, c0, h, w] of ROOMS) if (r >= r0 && r < r0 + h && c >= c0 && c < c0 + w) return k; return null; };
const furn = (r, c) => { for (const [t, r0, c0, h, w] of FURN) if (r >= r0 && r < r0 + h && c >= c0 && c < c0 + w) return t; return null; };
const free = (r, c) => room(r, c) && (!furn(r, c) || SOFT.has(furn(r, c)));
// „lângă” = în pătrățelul alăturat (nu pe diagonală), în aceeași cameră
const near = (r, c, t) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => furn(r + a, c + b) === t && room(r + a, c + b) === room(r, c));

// ---------- personajele și indiciile ----------
// [nume, culoare, indiciu (cu **cuvinte îngroșate**, | = rând nou), condiția verificată de program]
const CHARS = [
  ['Pisica', '#f4a259', 'Doarme pe **patul cel mare**,|lângă **șifonier**.', (r, c) => furn(r, c) === 'pat2' && near(r, c, 'sifonier')],
  ['Tenneșșee', '#8a4f8a', 'Doarme pe **patul cel mic**,|cu capul pe pernă.', (r, c) => furn(r, c) === 'pat1' && r === 0],
  ['Șșippi', '#d64541', 'E în **baia mare**,|lângă **chiuvetă**.', (r, c) => room(r, c) === 'baie' && near(r, c, 'chiuveta')],
  ['Mișși', '#3f7fd0', 'Se uită la **televizor**,|chiar în fața lui.', (r, c) => r === 4 && c === 2],
  ['Robotul', '#6b737c', 'Stă în **hol**, lângă ușa|**sufrageriei**.', (r, c) => r === 5 && c === 5],
  ['Mișșișșippi', '#2f2a3a', 'S-a ascuns pe ceva **moale**|din **sufragerie**. Unde?', (r, c) => room(r, c) === 'sufragerie' && ['canapea', 'fotoliu'].includes(furn(r, c))],
];
const RULE = 'Două personaje nu stau niciodată pe **același rând** sau pe **aceeași coloană**.|Se poate sta pe jos, pe pat, pe canapea, pe fotoliu, pe scaun și în cadă.';

function solve() {
  const cells = []; for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (free(r, c)) cells.push([r, c]);
  const opts = CHARS.map(ch => cells.filter(([r, c]) => ch[3](r, c)));
  const out = [], rows = new Set(), cols = new Set(), cur = [];
  (function bt(i) {
    if (out.length > 1) return;
    if (i === CHARS.length) { out.push(cur.slice()); return; }
    for (const [r, c] of opts[i]) if (!rows.has(r) && !cols.has(c)) { rows.add(r); cols.add(c); cur.push([r, c]); bt(i + 1); cur.pop(); rows.delete(r); cols.delete(c); }
  })(0);
  return out;
}

// ---------- fonturi ----------
const ff = (fam, file, weight, range) => `@font-face{font-family:"${fam}";font-weight:${weight};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(DIR, 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const EXT = 'U+0100-02AF';
const FONTS = ff('Pacifico', 'pacifico-latin-400-normal.woff2', 400) + ff('Pacifico', 'pacifico-latin-ext-400-normal.woff2', 400, EXT)
  + ff('Nunito', 'nunito-latin-700-normal.woff2', 700) + ff('Nunito', 'nunito-latin-ext-700-normal.woff2', 700, EXT)
  + ff('Nunito', 'nunito-latin-900-normal.woff2', 900) + ff('Nunito', 'nunito-latin-ext-900-normal.woff2', 900, EXT);
// text cu **îngroșat** și | pentru rând nou
const rich = (txt, x, y, size, lh, anchor = 'middle', color = ink) => txt.split('|').map((line, i) =>
  `<text x="${x}" y="${y + i * lh}" text-anchor="${anchor}" font-family="Nunito" font-weight="700" font-size="${size}" fill="${color}">${line.split('**').map((p, j) => j % 2 ? `<tspan font-weight="900">${p}</tspan>` : p).join('')}</text>`).join('');

// ---------- mobila (vedere de sus, stil plat) ----------
const st = `stroke="${ink}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
const DRAW = {
  pat2: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 6}" width="${w - 16}" height="${h - 12}" rx="10" fill="#f6f1fb"/><rect x="${x + 8}" y="${y + 6}" width="${w - 16}" height="16" rx="6" fill="#8b6d9c"/>
    <rect x="${x + 20}" y="${y + 28}" width="${w / 2 - 30}" height="26" rx="9" fill="#fff"/><rect x="${x + w / 2 + 10}" y="${y + 28}" width="${w / 2 - 30}" height="26" rx="9" fill="#fff"/>
    <path d="M${x + 8} ${y + 66} H${x + w - 8} V${y + h - 16} Q${x + w - 8} ${y + h - 6} ${x + w - 18} ${y + h - 6} H${x + 18} Q${x + 8} ${y + h - 6} ${x + 8} ${y + h - 16} Z" fill="#a98fc4"/><path d="M${x + 8} ${y + 80} H${x + w - 8}" fill="none" stroke-width="1.6"/>`,
  pat1: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 6}" width="${w - 20}" height="${h - 12}" rx="9" fill="#f6f1fb"/><rect x="${x + 10}" y="${y + 6}" width="${w - 20}" height="14" rx="6" fill="#5f7fa3"/>
    <rect x="${x + 18}" y="${y + 26}" width="${w - 36}" height="24" rx="8" fill="#fff"/><path d="M${x + 10} ${y + 60} H${x + w - 10} V${y + h - 16} Q${x + w - 10} ${y + h - 6} ${x + w - 20} ${y + h - 6} H${x + 20} Q${x + 10} ${y + h - 6} ${x + 10} ${y + h - 16} Z" fill="#8fb8de"/>`,
  sifonier: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 16}" rx="5" fill="#6e5a7e"/><path d="M${x + w / 2} ${y + 14} V${y + h - 14}" fill="none"/><circle cx="${x + w / 2 - 7}" cy="${y + h / 2}" r="3.5" fill="#e2b33c"/><circle cx="${x + w / 2 + 7}" cy="${y + h / 2}" r="3.5" fill="#e2b33c"/>`,
  cada: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 10}" width="${w - 16}" height="${h - 20}" rx="28" fill="#fff"/><rect x="${x + 18}" y="${y + 20}" width="${w - 36}" height="${h - 40}" rx="20" fill="#a9d4ef"/><circle cx="${x + 32}" cy="${y + h / 2}" r="4" fill="#fff"/>`,
  chiuveta: (x, y, w, h) => `<rect x="${x + 16}" y="${y + 18}" width="${w - 32}" height="${h - 30}" rx="12" fill="#fff"/><ellipse cx="${x + w / 2}" cy="${y + h / 2 + 6}" rx="${w / 2 - 26}" ry="${h / 2 - 26}" fill="#a9d4ef"/><path d="M${x + w / 2} ${y + 10} V${y + 26} M${x + w / 2 - 7} ${y + 10} H${x + w / 2 + 7}" fill="none" stroke-width="3.2"/>`,
  wc: (x, y, w, h) => `<rect x="${x + 22}" y="${y + 10}" width="${w - 44}" height="18" rx="5" fill="#fff"/><ellipse cx="${x + w / 2}" cy="${y + h / 2 + 10}" rx="${w / 2 - 24}" ry="${h / 2 - 22}" fill="#fff"/><ellipse cx="${x + w / 2}" cy="${y + h / 2 + 12}" rx="${w / 2 - 34}" ry="${h / 2 - 32}" fill="#a9d4ef"/>`,
  litiera: (x, y, w, h) => `<rect x="${x + 12}" y="${y + 18}" width="${w - 24}" height="${h - 32}" rx="10" fill="#9aa0a6"/><rect x="${x + 20}" y="${y + 26}" width="${w - 40}" height="${h - 48}" rx="6" fill="#efe2bd"/>`,
  birou: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 16}" width="${w - 16}" height="${h - 34}" rx="4" fill="#8a6d58"/><rect x="${x + 16}" y="${y + 22}" width="24" height="17" rx="2" fill="#f6f1fb"/><circle cx="${x + w - 22}" cy="${y + 30}" r="8" fill="#ffd166"/>`,
  raft: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 16}" rx="3" fill="#6e5a7e"/><path d="M${x + 10} ${y + h / 2} H${x + w - 10}" fill="none"/>${['#d64541', '#3f7fd0', '#f4a259', '#5aab4e', '#9b4de0'].map((c, i) => `<rect x="${x + 16 + i * 10}" y="${y + 14}" width="8" height="${h / 2 - 20}" fill="${c}" stroke-width="1.2"/><rect x="${x + 16 + i * 10}" y="${y + h / 2 + 6}" width="8" height="${h / 2 - 20}" fill="${['#5aab4e', '#f4a259', '#d64541', '#9b4de0', '#3f7fd0'][i]}" stroke-width="1.2"/>`).join('')}`,
  tv: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 18}" width="${w - 16}" height="${h - 44}" rx="5" fill="#2d2a33"/><rect x="${x + 14}" y="${y + 24}" width="${w - 28}" height="${h - 56}" rx="3" fill="#5f7fa3"/><path d="M${x + w / 2 - 14} ${y + h - 16} H${x + w / 2 + 14} M${x + w / 2} ${y + h - 26} V${y + h - 16}" fill="none" stroke-width="3.5"/>`,
  pickup: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 12}" width="${w - 16}" height="${h - 24}" rx="6" fill="#8a6d58"/><rect x="${x + 16}" y="${y + 20}" width="${w - 32}" height="${h - 40}" rx="4" fill="#3a3a40"/><circle cx="${x + w / 2 - 4}" cy="${y + h / 2}" r="${h / 2 - 26}" fill="#111"/><circle cx="${x + w / 2 - 4}" cy="${y + h / 2}" r="5" fill="#d64541"/><path d="M${x + w - 22} ${y + 26} L${x + w - 26} ${y + h / 2 + 4} L${x + w / 2 + 4} ${y + h / 2 + 6}" fill="none" stroke="#c9d1d9" stroke-width="3"/>`,
  fotoliu: (x, y, w, h) => `<rect x="${x + 12}" y="${y + 14}" width="${w - 24}" height="${h - 24}" rx="14" fill="#8b6d9c"/><rect x="${x + 22}" y="${y + 30}" width="${w - 44}" height="${h - 44}" rx="9" fill="#b49ac9"/>`,
  canapea: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 14}" width="${w - 20}" height="${h - 24}" rx="14" fill="#5f8a7a"/><rect x="${x + 24}" y="${y + 32}" width="${w - 48}" height="${h - 48}" rx="9" fill="#86b3a2"/><path d="M${x + w / 2} ${y + 32} V${y + h - 16}" fill="none" stroke-width="2"/>`,
  frigider: (x, y, w, h) => `<rect x="${x + 16}" y="${y + 8}" width="${w - 32}" height="${h - 16}" rx="7" fill="#f4f6f8"/><path d="M${x + 16} ${y + h / 2 - 6} H${x + w - 16} M${x + w - 26} ${y + 18} V${y + 30} M${x + w - 26} ${y + h / 2 + 4} V${y + h / 2 + 20}" fill="none" stroke-width="3"/>`,
  cuier: (x, y, w, h) => `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="18" fill="#8a6d58"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="6" fill="#2f2a3a"/>${[0, 90, 180, 270].map(a => `<path d="M${x + w / 2} ${y + h / 2} l${(Math.cos(a * Math.PI / 180) * 24).toFixed(1)} ${(Math.sin(a * Math.PI / 180) * 24).toFixed(1)}" stroke-width="3.5"/>`).join('')}`,
  masa: (x, y, w, h) => `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 12}" fill="#c49a6c"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 22}" fill="none" stroke="#e0c49c" stroke-width="2"/>`,
  scaun: (x, y, w, h) => `<rect x="${x + 22}" y="${y + 26}" width="${w - 44}" height="${h - 42}" rx="7" fill="#d9b277"/><rect x="${x + 22}" y="${y + 14}" width="${w - 44}" height="12" rx="5" fill="#b9854f"/>`,
  blat: (x, y, w, h) => `<rect x="${x + 6}" y="${y + 10}" width="${w - 12}" height="${h - 24}" rx="4" fill="#cfc6d8"/><rect x="${x + 16}" y="${y + 18}" width="${w / 2 - 22}" height="${h - 40}" rx="4" fill="#3a3a40"/>${[[.18, .4], [.34, .4], [.18, .62], [.34, .62]].map(([a, b]) => `<circle cx="${x + w * a}" cy="${y + h * b}" r="7" fill="none" stroke="#e05a47" stroke-width="2.4"/>`).join('')}<rect x="${x + w / 2 + 14}" y="${y + 20}" width="${w / 2 - 30}" height="${h - 44}" rx="8" fill="#a9d4ef"/>`,
  spalat: (x, y, w, h) => `<rect x="${x + 12}" y="${y + 10}" width="${w - 24}" height="${h - 20}" rx="6" fill="#f4f6f8"/><circle cx="${x + w / 2}" cy="${y + h / 2 + 5}" r="${w / 2 - 24}" fill="#a9d4ef"/><circle cx="${x + w / 2}" cy="${y + h / 2 + 5}" r="${w / 2 - 32}" fill="none" stroke="#fff" stroke-width="2.5"/>`,
};

// ---------- harta ----------
function mapSvg(X0, Y0, opt = {}) {
  const cx = c => X0 + c * CS, cy = r => Y0 + r * CS;
  let floor = '', grid = '', walls = '', windows = '';
  const door = (r, c, s) => DOORS.some(d => d[0] === r && d[1] === c && d[2] === s);
  const seg = (x1, y1, x2, y2, isDoor) => {
    if (!isDoor) return `M${x1} ${y1} L${x2} ${y2} `;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, hx = (x2 - x1) * .3, hy = (y2 - y1) * .3;
    return `M${x1} ${y1} L${mx - hx} ${my - hy} M${mx + hx} ${my + hy} L${x2} ${y2} `;
  };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const k = room(r, c); if (!k) continue;
    const [col, pat] = FLOOR[k];
    floor += `<rect x="${cx(c)}" y="${cy(r)}" width="${CS}" height="${CS}" fill="${col}"/><rect x="${cx(c)}" y="${cy(r)}" width="${CS}" height="${CS}" fill="url(#${pat})"/>`;
    grid += `<rect x="${cx(c) + 1}" y="${cy(r) + 1}" width="${CS - 2}" height="${CS - 2}" rx="3" fill="none" stroke="${ink}" stroke-opacity=".16" stroke-width="1.6"/>`;
    if (room(r - 1, c) !== k) walls += seg(cx(c), cy(r), cx(c + 1), cy(r), door(r, c, 't') || door(r - 1, c, 'b'));
    if (room(r, c - 1) !== k) walls += seg(cx(c), cy(r), cx(c), cy(r + 1), door(r, c, 'l') || door(r, c - 1, 'r'));
    if (!room(r + 1, c)) walls += seg(cx(c), cy(r + 1), cx(c + 1), cy(r + 1), door(r, c, 'b'));
    if (!room(r, c + 1)) walls += seg(cx(c + 1), cy(r), cx(c + 1), cy(r + 1), door(r, c, 'r'));
    if (k.startsWith('balcon') && !room(r, c + 1)) windows += `<path d="M${cx(c + 1) - 8} ${cy(r) + 10} V${cy(r + 1) - 10}" stroke="#8cc4ec" stroke-width="5" stroke-linecap="round"/>`;
  }
  const ex = cx(5) + CS / 2, ey = cy(ROWS);
  const mat = `<rect x="${ex - 26}" y="${ey + 5}" width="52" height="12" rx="4" fill="#c97b5a" stroke="${ink}" stroke-width="2"/>`;
  const furniture = FURN.map(([t, r, c, h, w]) => `<g ${st}>${DRAW[t](cx(c), cy(r), w * CS, h * CS)}</g>`).join('');
  const tokens = (opt.tokens || []).map(([i, r, c]) => token(i, cx(c) + CS / 2, cy(r) + CS / 2, 34)).join('');
  return floor + grid + windows + `<g filter="url(#shadow)">${furniture}</g>` + `<path d="${walls}" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="square"/>` + mat + tokens;
}

// ---------- portrete ----------
let ART = {}; // completat din joc (index.html)
function cat() {
  const fur = '#a8a39c', dk = '#7d776f';
  return `<svg viewBox="0 0 120 150"><g stroke="#2b2118" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">
<path d="M84 136 q36 -4 28 -42 q-4 -14 -16 -10" fill="none" stroke="#2b2118" stroke-width="15"/><path d="M84 136 q36 -4 28 -42 q-4 -14 -16 -10" fill="none" stroke="${fur}" stroke-width="9"/>
<ellipse cx="60" cy="114" rx="30" ry="31" fill="${fur}"/><ellipse cx="60" cy="120" rx="17" ry="20" fill="#f6f2ea" stroke="none"/>
<ellipse cx="46" cy="143" rx="10" ry="6" fill="#f6f2ea"/><ellipse cx="74" cy="143" rx="10" ry="6" fill="#f6f2ea"/>
<path d="M24 48 L28 8 L54 30 Z" fill="${fur}"/><path d="M96 48 L92 8 L66 30 Z" fill="${fur}"/><path d="M31 38 L32 18 L45 30 Z" fill="#f3b9c0" stroke="none"/><path d="M89 38 L88 18 L75 30 Z" fill="#f3b9c0" stroke="none"/>
<ellipse cx="60" cy="60" rx="41" ry="34" fill="${fur}"/>
<path d="M50 30 q4 8 0 14 M60 28 v16 M70 30 q-4 8 0 14 M20 62 h9 M21 71 h8 M100 62 h-9 M99 71 h-8" fill="none" stroke="${dk}" stroke-width="3"/>
<ellipse cx="60" cy="77" rx="16" ry="11" fill="#f6f2ea"/>
<ellipse cx="44" cy="58" rx="9" ry="10" fill="#b5d96a"/><ellipse cx="76" cy="58" rx="9" ry="10" fill="#b5d96a"/>
<ellipse cx="44" cy="59" rx="3.5" ry="7" fill="#111" stroke="none"/><ellipse cx="76" cy="59" rx="3.5" ry="7" fill="#111" stroke="none"/><circle cx="46" cy="55" r="2" fill="#fff" stroke="none"/><circle cx="78" cy="55" r="2" fill="#fff" stroke="none"/>
<path d="M34 44 Q44 37 53 43 M86 44 Q76 37 67 43" fill="none" stroke="#111" stroke-width="7"/>
<path d="M56 70 h8 l-4 5 Z" fill="#e98ca0"/><path d="M60 75 v3 M54 79 q6 6 6 -1 q0 7 6 1" fill="none" stroke-width="2.4"/>
<path d="M46 76 L18 70 M46 80 L18 84 M74 76 L102 70 M74 80 L102 84" stroke-width="1.4"/>
</g></svg>`;
}
const PORTRAIT = i => [
  () => cat(),
  () => `<svg viewBox="0 0 122 116">${ART.pars}</svg>`,
  () => `<svg viewBox="4 -8 112 112">${ART.ssippi}</svg>`,
  () => `<svg viewBox="4 -8 112 112">${ART.missi}</svg>`,
  () => ART.robot.replace('<svg ', '<svg viewBox="16 0 168 168" ').replace(/viewBox="0 0 200 200"/, ''),
  () => ART.boss.replace(/viewBox="0 0 300 230"/, 'viewBox="80 2 140 140"'),
][i]();
const PHOTO_BG = ['#fde3c8', '#efe2f5', '#fbd9d6', '#d9e7fb', '#e1e5ea', '#f7d9b8'];
function token(i, x, y, r) {
  const [name, col] = CHARS[i];
  return `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${PHOTO_BG[i]}" stroke="${col}" stroke-width="5"/>
<clipPath id="tk${i}-${Math.round(x)}-${Math.round(y)}"><circle cx="${x}" cy="${y}" r="${r - 3}"/></clipPath>
<g clip-path="url(#tk${i}-${Math.round(x)}-${Math.round(y)})"><svg x="${x - r}" y="${y - r + 2}" width="${2 * r}" height="${2 * r}">${PORTRAIT(i).replace('<svg ', '<svg width="100%" height="100%" ')}</svg></g>
<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${ink}" stroke-width="2"/></g>`;
}

// ---------- pagini ----------
const DEFS = () => `<defs>${ART.defs}
  <pattern id="lemn" width="${CS}" height="${CS / 4}" patternUnits="userSpaceOnUse"><path d="M0 ${CS / 4 - .5} H${CS} M${CS * .35} 0 V${CS / 4}" stroke="#7a6248" stroke-opacity=".14" stroke-width="1.5"/></pattern>
  <pattern id="gresie" width="${CS / 3}" height="${CS / 3}" patternUnits="userSpaceOnUse"><path d="M0 .5 H${CS / 3} M.5 0 V${CS / 3}" stroke="#fff" stroke-opacity=".75" stroke-width="1.5"/></pattern>
  <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%"><feDropShadow dx="0" dy="2.5" stdDeviation="1.6" flood-color="#2f2a3a" flood-opacity=".22"/></filter>
  <filter id="cardsh" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="0" dy="4" stdDeviation="4" flood-color="#2f2a3a" flood-opacity=".25"/></filter>
</defs>`;
const page = body => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${FONTS}</style>${DEFS()}<rect width="${W}" height="${H}" fill="#fbf8f2"/>${body}</svg>`;
const MAPX = (W - COLS * CS) / 2, MAPY = (H - ROWS * CS) / 2 - 10;

function cluesPage() {
  let s = `<text x="${W / 2}" y="70" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="44" fill="${ink}">Unde s-a ascuns Mișșișșippi?</text>`;
  s += `<rect x="150" y="92" width="${W - 300}" height="64" rx="16" fill="#efe7f6" stroke="${ink}" stroke-width="2"/>${rich(RULE, W / 2, 118, 18, 25)}`;
  CHARS.forEach(([name, col, clue], i) => {
    const gx = 70 + (i % 3) * 360, gy = 178 + Math.floor(i / 3) * 322, rot = [-2, 1.5, -1, 2, -1.5, 1][i];
    s += `<g transform="rotate(${rot} ${gx + 120} ${gy + 120})" filter="url(#cardsh)"><rect x="${gx + 18}" y="${gy}" width="204" height="232" rx="4" fill="#fff" stroke="#d9d2e2" stroke-width="1.5"/>
<rect x="${gx + 30}" y="${gy + 12}" width="180" height="168" fill="${PHOTO_BG[i]}" stroke="${ink}" stroke-width="2"/>
<svg x="${gx + 34}" y="${gy + 16}" width="172" height="164">${PORTRAIT(i).replace('<svg ', '<svg width="100%" height="100%" ')}</svg>
<text x="${gx + 120}" y="${gy + 216}" text-anchor="middle" font-family="Pacifico" font-size="27" fill="${ink}">${name}</text></g>`;
    s += `<rect x="${gx}" y="${gy + 244}" width="240" height="60" rx="18" fill="#fff" stroke="${col}" stroke-width="3"/>${rich(clue, gx + 120, gy + 269, 17, 22)}`;
  });
  return page(s);
}
function cuts(X0, Y0) {
  const cx = c => X0 + c * CS, cy = r => Y0 + r * CS;
  const jag = pts => 'M' + pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L');
  const yA = cy(3) - 40, xB = cx(4) + 30, xC = cx(8) - 20, yD = cy(5) + 50;
  const a = [[20, yA + 10], [cx(2), yA - 14], [cx(4), yA + 20], [cx(6), yA - 10], [cx(8), yA + 18], [W - 20, yA]];
  const b = [[xB, yA + 4], [xB - 20, cy(4) + 40], [xB + 20, cy(6)], [xB - 10, H - 20]];
  const c = [[xC, yA + 12], [xC + 22, cy(4) + 30], [xC - 18, cy(6) + 20], [xC + 10, H - 20]];
  const d = [[20, yD], [cx(1), yD + 22], [cx(3), yD - 14], [xB - 6, yD + 10]];
  return `<g fill="none" stroke="#b0413e" stroke-width="2.5" stroke-dasharray="12 8">${[a, b, c, d].map(p => `<path d="${jag(p)}"/>`).join('')}</g>`;
}
const mapPage = (withCuts, sol) => page(mapSvg(MAPX, MAPY, { tokens: sol }) + (withCuts ? cuts(MAPX, MAPY) : ''));
function tokensPage() {
  let s = `<text x="${W / 2}" y="70" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="34" fill="${ink}">Jetoane: decupează-le și așază-le pe hartă</text>`;
  for (let set = 0; set < 2; set++) CHARS.forEach(([name], i) => {
    const x = 150 + i * 178, y = 200 + set * 300;
    s += token(i, x, y, 36) + `<text x="${x}" y="${y + 66}" text-anchor="middle" font-family="Pacifico" font-size="22" fill="${ink}">${name}</text>`;
    s += `<circle cx="${x}" cy="${y}" r="44" fill="none" stroke="#b0413e" stroke-width="1.5" stroke-dasharray="6 5"/>`;
  });
  return page(s);
}

(async () => {
  const sol = solve();
  if (sol.length !== 1) { console.error(`Indiciile au ${sol.length} soluții, nu una singură. Nu generez nimic.`); process.exit(1); }
  console.log('Soluție unică:', CHARS.map((ch, i) => `${ch[0]} ${'ABCDEFGH'[sol[0][i][0]]}${sol[0][i][1] + 1} (${furn(...sol[0][i]) || room(...sol[0][i])})`).join(', '));
  const b = await chromium.launch();
  const p0 = await b.newPage();
  await p0.goto('file://' + path.join(ROOT, 'index.html'));
  ART = await p0.evaluate(() => ({
    defs: document.querySelector('svg defs').innerHTML,
    missi: raccoon(0, 0, 120, { shirt: 'B', pirate: 'hat', patch: true }),
    ssippi: raccoon(0, 0, 120, { shirt: 'R', pirate: 'bandana', earring: true }),
    pars: dormouse(0, 0, 122, 'happy'), robot: BOSS_SVG, boss: BOSS_REVEAL,
  }));
  // fără animații sau clase din joc pe hârtie
  for (const k of ['missi', 'ssippi', 'pars']) ART[k] = ART[k].replace(/ class="[^"]*"/g, '').replace(/ style="animation-delay:[^"]*"/g, '');
  ART.robot = ART.robot.replace(' id="boss"', '').replace(/<animate[^>]*\/>/g, '').replace(/<animateTransform[^>]*\/>/g, '');
  ART.boss = ART.boss.replace(' class="scene" id="shadow"', '').replace(/<animate[^>]*\/>/g, '').replace(/ class="[^"]*"/g, '');
  const SOL = sol[0].map(([r, c], i) => [i, r, c]);
  const out = [['indicii.png', cluesPage()], ['harta.png', mapPage(false)], ['harta-piese.png', mapPage(true)], ['jetoane.png', tokensPage()], ['solutie.png', mapPage(false, SOL)]];
  for (const [file, svg] of out) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 3508 / W });
    await p.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(DIR, file), clip: { x: 0, y: 0, width: W, height: H } });
  }
  await b.close();
  console.log('gata');
})();
