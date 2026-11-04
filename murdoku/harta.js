// Desenează harta casei ca hartă de comori (tabla de Murdoku), A4 orizontal, fără nume de camere.
// Rulare: node murdoku/harta.js  ->  murdoku/harta.png (300 DPI) și murdoku/harta-piese.png (cu liniile de tăiat în 5 piese)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const W = 1188, H = 840;
const COLS = 11, ROWS = 8, CS = 84, X0 = 150, Y0 = 118;
const cx = c => X0 + c * CS, cy = r => Y0 + r * CS;
const ink = '#3a2614';

// camerele: [nume, rând, coloană, înălțime, lățime] (în pătrățele); numele nu apar pe hartă
const ROOMS = [
  ['dormitor', 0, 0, 3, 4], ['baie', 0, 4, 3, 2], ['camera', 0, 6, 3, 4], ['balcon', 0, 10, 3, 1],
  ['sufragerie', 3, 0, 5, 5], ['hol', 3, 5, 5, 1], ['bucatarie', 3, 6, 3, 4], ['bucatarie', 6, 8, 2, 2],
  ['baie2', 6, 6, 2, 2], ['balcon2', 3, 10, 3, 1],
];
const FLOOR = { dormitor: '#ead7b8', baie: '#d3e4e0', camera: '#ecd3c2', balcon: '#e2e6d2', sufragerie: '#eadfb9', hol: '#dccfb8', bucatarie: '#e4dac0', baie2: '#d3e4e0', balcon2: '#e2e6d2' };
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
// uși: [rând, coloană, latura] ('l' stânga, 'r' dreapta, 't' sus, 'b' jos) – rămâne o deschidere în perete
const DOORS = [[5, 5, 'l'], [3, 5, 'r'], [7, 5, 'r'], [3, 5, 't'], [7, 5, 'b'], [4, 9, 'r'], [1, 9, 'r'], [2, 3, 'b'], [2, 6, 'b']];

const font = (fam, file, range) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'wanted', 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = font('Sancreek', 'sancreek-latin-400-normal.woff2') + font('Sancreek', 'sancreek-latin-ext-400-normal.woff2', 'U+0100-02AF')
  + font('Bevan', 'bevan-latin-400-normal.woff2') + font('Bevan', 'bevan-latin-ext-400-normal.woff2', 'U+0100-02AF');

// ---------- mobila: fiecare desen primește cutia lui (x, y, lățime, înălțime) ----------
const st = `stroke="${ink}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"`;
const DRAW = {
  pat2: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 6}" width="${w - 16}" height="${h - 12}" rx="10" fill="#f4ecdc"/><rect x="${x + 8}" y="${y + 6}" width="${w - 16}" height="16" rx="6" fill="#a5754a"/>
    <rect x="${x + 20}" y="${y + 28}" width="${w / 2 - 30}" height="26" rx="9" fill="#fff"/><rect x="${x + w / 2 + 10}" y="${y + 28}" width="${w / 2 - 30}" height="26" rx="9" fill="#fff"/>
    <path d="M${x + 8} ${y + 66} H${x + w - 8} V${y + h - 16} Q${x + w - 8} ${y + h - 6} ${x + w - 18} ${y + h - 6} H${x + 18} Q${x + 8} ${y + h - 6} ${x + 8} ${y + h - 16} Z" fill="#8fb8de"/><path d="M${x + 8} ${y + 80} H${x + w - 8}" fill="none" stroke-width="1.8"/>`,
  pat1: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 6}" width="${w - 20}" height="${h - 12}" rx="9" fill="#f4ecdc"/><rect x="${x + 10}" y="${y + 6}" width="${w - 20}" height="14" rx="6" fill="#a5754a"/>
    <rect x="${x + 18}" y="${y + 26}" width="${w - 36}" height="24" rx="8" fill="#fff"/><path d="M${x + 10} ${y + 60} H${x + w - 10} V${y + h - 16} Q${x + w - 10} ${y + h - 6} ${x + w - 20} ${y + h - 6} H${x + 20} Q${x + 10} ${y + h - 6} ${x + 10} ${y + h - 16} Z" fill="#e8a0a8"/>`,
  sifonier: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 16}" rx="5" fill="#a5754a"/><path d="M${x + w / 2} ${y + 14} V${y + h - 14}" fill="none"/><circle cx="${x + w / 2 - 7}" cy="${y + h / 2}" r="3.5" fill="#e2b33c"/><circle cx="${x + w / 2 + 7}" cy="${y + h / 2}" r="3.5" fill="#e2b33c"/>`,
  cada: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 10}" width="${w - 16}" height="${h - 20}" rx="28" fill="#fff"/><rect x="${x + 18}" y="${y + 20}" width="${w - 36}" height="${h - 40}" rx="20" fill="#a9d4ef"/><circle cx="${x + 32}" cy="${y + h / 2}" r="4" fill="#fff"/><path d="M${x + w / 2 - 10} ${y + h / 2 - 4} q8 -6 16 0 M${x + w / 2 + 14} ${y + h / 2 + 6} q8 -6 16 0" fill="none" stroke="#fff" stroke-width="2.5"/>`,
  chiuveta: (x, y, w, h) => `<rect x="${x + 16}" y="${y + 18}" width="${w - 32}" height="${h - 30}" rx="12" fill="#fff"/><ellipse cx="${x + w / 2}" cy="${y + h / 2 + 6}" rx="${w / 2 - 26}" ry="${h / 2 - 26}" fill="#a9d4ef"/><path d="M${x + w / 2} ${y + 10} V${y + 26} M${x + w / 2 - 7} ${y + 10} H${x + w / 2 + 7}" fill="none" stroke-width="3.2"/>`,
  wc: (x, y, w, h) => `<rect x="${x + 22}" y="${y + 10}" width="${w - 44}" height="18" rx="5" fill="#fff"/><ellipse cx="${x + w / 2}" cy="${y + h / 2 + 10}" rx="${w / 2 - 24}" ry="${h / 2 - 22}" fill="#fff"/><ellipse cx="${x + w / 2}" cy="${y + h / 2 + 12}" rx="${w / 2 - 34}" ry="${h / 2 - 32}" fill="#a9d4ef"/>`,
  litiera: (x, y, w, h) => `<rect x="${x + 12}" y="${y + 18}" width="${w - 24}" height="${h - 32}" rx="10" fill="#9aa0a6"/><rect x="${x + 20}" y="${y + 26}" width="${w - 40}" height="${h - 48}" rx="6" fill="#e8d9b0"/>${[[0.35, .5], [.5, .42], [.62, .56], [.42, .62]].map(([a, b]) => `<circle cx="${x + w * a}" cy="${y + h * b}" r="1.8" fill="${ink}" stroke="none"/>`).join('')}`,
  birou: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 16}" width="${w - 16}" height="${h - 34}" rx="4" fill="#a5754a"/><path d="M${x + 14} ${y + h - 18} V${y + h - 8} M${x + w - 14} ${y + h - 18} V${y + h - 8}" stroke-width="4"/><rect x="${x + 16}" y="${y + 22}" width="24" height="17" rx="2" fill="#f4ecdc"/><path d="M${x + w - 24} ${y + 40} V${y + 24} l9 -7" fill="none"/><path d="M${x + w - 18} ${y + 12} l12 -4 l3 10 Z" fill="#ffd166"/>`,
  raft: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 8}" width="${w - 20}" height="${h - 16}" rx="3" fill="#a5754a"/><path d="M${x + 10} ${y + h / 2} H${x + w - 10}" fill="none"/>${['#d64541', '#3f7fd0', '#f4a259', '#5aab4e', '#9b4de0'].map((c, i) => `<rect x="${x + 16 + i * 10}" y="${y + 14}" width="8" height="${h / 2 - 20}" fill="${c}" stroke-width="1.4"/><rect x="${x + 16 + i * 10}" y="${y + h / 2 + 6}" width="8" height="${h / 2 - 20}" fill="${['#5aab4e', '#f4a259', '#d64541', '#9b4de0', '#3f7fd0'][i]}" stroke-width="1.4"/>`).join('')}`,
  tv: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 12}" width="${w - 16}" height="${h - 38}" rx="5" fill="#2d2a33"/><rect x="${x + 14}" y="${y + 18}" width="${w - 28}" height="${h - 50}" rx="3" fill="#5f7fa3"/><path d="M${x + 20} ${y + 24} l12 -4" stroke="#fff" stroke-width="2.5"/><path d="M${x + w / 2 - 12} ${y + h - 14} H${x + w / 2 + 12} M${x + w / 2} ${y + h - 26} V${y + h - 14}" fill="none" stroke-width="3.5"/>`,
  pickup: (x, y, w, h) => `<rect x="${x + 8}" y="${y + 12}" width="${w - 16}" height="${h - 24}" rx="6" fill="#a5754a"/><rect x="${x + 16}" y="${y + 20}" width="${w - 32}" height="${h - 40}" rx="4" fill="#3a3a40"/><circle cx="${x + w / 2 - 4}" cy="${y + h / 2}" r="${h / 2 - 26}" fill="#111"/><circle cx="${x + w / 2 - 4}" cy="${y + h / 2}" r="5" fill="#d64541"/><path d="M${x + w - 22} ${y + 26} L${x + w - 26} ${y + h / 2 + 4} L${x + w / 2 + 4} ${y + h / 2 + 6}" fill="none" stroke="#c9d1d9" stroke-width="3"/>`,
  fotoliu: (x, y, w, h) => `<rect x="${x + 12}" y="${y + 14}" width="${w - 24}" height="${h - 24}" rx="14" fill="#c4683f"/><rect x="${x + 22}" y="${y + 30}" width="${w - 44}" height="${h - 44}" rx="9" fill="#e0895f"/>`,
  canapea: (x, y, w, h) => `<rect x="${x + 10}" y="${y + 14}" width="${w - 20}" height="${h - 24}" rx="14" fill="#6a9160"/><rect x="${x + 24}" y="${y + 32}" width="${w - 48}" height="${h - 48}" rx="9" fill="#8db87d"/><path d="M${x + w / 2} ${y + 32} V${y + h - 16}" fill="none" stroke-width="2"/>`,
  frigider: (x, y, w, h) => `<rect x="${x + 16}" y="${y + 8}" width="${w - 32}" height="${h - 16}" rx="7" fill="#f4f6f8"/><path d="M${x + 16} ${y + h / 2 - 6} H${x + w - 16} M${x + w - 26} ${y + 18} V${y + 30} M${x + w - 26} ${y + h / 2 + 4} V${y + h / 2 + 20}" fill="none" stroke-width="3"/><path d="M${x + 30} ${y + 22} h10 M${x + 35} ${y + 17} v10 M${x + 31} ${y + 18} l8 8 M${x + 39} ${y + 18} l-8 8" stroke="#5aa9e6" stroke-width="2"/>`,
  cuier: (x, y, w, h) => `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="26" fill="none" stroke-dasharray="3 5"/><path d="M${x + w / 2} ${y + 18} V${y + h - 14} M${x + w / 2 - 14} ${y + h - 12} H${x + w / 2 + 14} M${x + w / 2 - 12} ${y + 24} L${x + w / 2} ${y + 30} L${x + w / 2 + 12} ${y + 24}" fill="none" stroke-width="3.5"/><path d="M${x + w / 2 + 2} ${y + 32} q14 4 12 26 h-12 Z" fill="#d64541"/><path d="M${x + w / 2 - 22} ${y + 26} q4 -12 14 -8 l-2 10 Z" fill="#3f7fd0"/>`,
  masa: (x, y, w, h) => `<circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 12}" fill="#b9854f"/><circle cx="${x + w / 2}" cy="${y + h / 2}" r="${w / 2 - 22}" fill="none" stroke="#e0b884" stroke-width="2"/>`,
  scaun: (x, y, w, h) => `<rect x="${x + 22}" y="${y + 26}" width="${w - 44}" height="${h - 42}" rx="7" fill="#d9b277"/><rect x="${x + 22}" y="${y + 14}" width="${w - 44}" height="12" rx="5" fill="#b9854f"/>`,
  blat: (x, y, w, h) => `<rect x="${x + 6}" y="${y + 10}" width="${w - 12}" height="${h - 24}" rx="4" fill="#c9b9a0"/><rect x="${x + 16}" y="${y + 18}" width="${w / 2 - 22}" height="${h - 40}" rx="4" fill="#3a3a40"/>${[[.18, .4], [.34, .4], [.18, .62], [.34, .62]].map(([a, b]) => `<circle cx="${x + w * a}" cy="${y + h * b}" r="7" fill="none" stroke="#e05a47" stroke-width="2.4"/>`).join('')}<rect x="${x + w / 2 + 14}" y="${y + 20}" width="${w / 2 - 30}" height="${h - 44}" rx="8" fill="#a9d4ef"/>`,
  spalat: (x, y, w, h) => `<rect x="${x + 12}" y="${y + 10}" width="${w - 24}" height="${h - 20}" rx="6" fill="#f4f6f8"/><circle cx="${x + w / 2}" cy="${y + h / 2 + 5}" r="${w / 2 - 24}" fill="#a9d4ef"/><circle cx="${x + w / 2}" cy="${y + h / 2 + 5}" r="${w / 2 - 32}" fill="none" stroke="#fff" stroke-width="2.5"/><circle cx="${x + 24}" cy="${y + 19}" r="3" fill="${ink}" stroke="none"/><circle cx="${x + 34}" cy="${y + 19}" r="3" fill="${ink}" stroke="none"/>`,
};

function roomAt(r, c) {
  for (const [k, r0, c0, h, w] of ROOMS) if (r >= r0 && r < r0 + h && c >= c0 && c < c0 + w) return k;
  return null;
}
function rooms() {
  let floor = '', grid = '', walls = '', windows = '';
  const door = (r, c, s) => DOORS.some(d => d[0] === r && d[1] === c && d[2] === s);
  const seg = (x1, y1, x2, y2, isDoor) => {
    if (!isDoor) return `M${x1} ${y1} L${x2} ${y2} `;
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, hx = (x2 - x1) * .3, hy = (y2 - y1) * .3;
    return `M${x1} ${y1} L${mx - hx} ${my - hy} M${mx + hx} ${my + hy} L${x2} ${y2} `;
  };
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const k = roomAt(r, c); if (!k) continue;
    floor += `<rect x="${cx(c)}" y="${cy(r)}" width="${CS}" height="${CS}" fill="${FLOOR[k]}"/>`;
    grid += `<rect x="${cx(c)}" y="${cy(r)}" width="${CS}" height="${CS}" fill="none" stroke="${ink}" stroke-opacity=".3" stroke-width="1.3" stroke-dasharray="5 5"/>`;
    // pereții: doar spre altă cameră sau spre afară (o singură dată pe latură)
    if (roomAt(r - 1, c) !== k) walls += seg(cx(c), cy(r), cx(c + 1), cy(r), door(r, c, 't') || door(r - 1, c, 'b'));
    if (roomAt(r, c - 1) !== k) walls += seg(cx(c), cy(r), cx(c), cy(r + 1), door(r, c, 'l') || door(r, c - 1, 'r'));
    if (!roomAt(r + 1, c)) walls += seg(cx(c), cy(r + 1), cx(c + 1), cy(r + 1), door(r, c, 'b'));
    if (!roomAt(r, c + 1)) walls += seg(cx(c + 1), cy(r), cx(c + 1), cy(r + 1), door(r, c, 'r'));
    // balcoanele închise: geam pe peretele de afară
    if (k.startsWith('balcon') && !roomAt(r, c + 1)) windows += `<path d="M${cx(c + 1) - 8} ${cy(r) + 8} V${cy(r + 1) - 8}" stroke="#7fb8e0" stroke-width="5"/>`;
  }
  // intrarea: preșul de la ușă
  const ex = cx(5) + CS / 2, ey = cy(8);
  const entry = `<rect x="${ex - 26}" y="${ey + 4}" width="52" height="12" rx="4" fill="#c97b5a" stroke="${ink}" stroke-width="2"/>`;
  return floor + grid + windows + `<path d="${walls}" fill="none" stroke="${ink}" stroke-width="6.5" stroke-linecap="square"/>` + entry;
}
const furniture = () => FURN.map(([t, r, c, h, w]) => `<g ${st}>${DRAW[t](cx(c), cy(r), w * CS, h * CS)}</g>`).join('');
const coords = () => {
  let s = `<g font-family="Bevan" font-size="20" fill="${ink}" text-anchor="middle">`;
  for (let c = 0; c < COLS; c++) s += `<text x="${cx(c) + CS / 2}" y="${Y0 - 10}">${c + 1}</text>`;
  for (let r = 0; r < ROWS; r++) s += `<text x="${X0 - 20}" y="${cy(r) + CS / 2 + 7}">${'ABCDEFGH'[r]}</text>`;
  return s + '</g>';
};
const compass = (x, y) => `<g transform="translate(${x} ${y})" stroke="${ink}" stroke-width="2.2"><circle r="34" fill="none" stroke-dasharray="3 5"/><path d="M0 -40 L8 0 L0 40 L-8 0 Z" fill="#c0392b"/><path d="M-40 0 L0 8 L40 0 L0 -8 Z" fill="#f1deb0"/><text y="-46" text-anchor="middle" font-family="Bevan" font-size="17" fill="${ink}" stroke="none">N</text></g>`;
// liniile de tăiat în 5 piese (zimțate)
function cuts() {
  const jag = pts => 'M' + pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L');
  const yA = cy(3) - 40, xB = cx(4) + 30, xC = cx(8) - 20, yD = cy(5) + 50;
  const a = [[40, yA + 10], [cx(2), yA - 14], [cx(4), yA + 20], [cx(6), yA - 10], [cx(8), yA + 18], [W - 40, yA]];
  const b = [[xB, yA + 4], [xB - 20, cy(4) + 40], [xB + 20, cy(6)], [xB - 10, H - 40]];
  const c = [[xC, yA + 12], [xC + 22, cy(4) + 30], [xC - 18, cy(6) + 20], [xC + 10, H - 40]];
  const d = [[40, yD], [cx(1), yD + 22], [cx(3), yD - 14], [xB - 6, yD + 10]];
  return `<g fill="none" stroke="#7a2e1e" stroke-width="2.5" stroke-dasharray="12 8">${[a, b, c, d].map(p => `<path d="${jag(p)}"/>`).join('')}</g>`;
}

function svg(withCuts) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${FONTS}</style>
<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 -1.2 .7"/></filter>
  <radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#7a5a30" stop-opacity="0"/><stop offset="1" stop-color="#5a3a18" stop-opacity=".7"/></radialGradient>
  <filter id="wobble" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="2.5" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="#efdfb8"/>
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".5"/>
<rect width="${W}" height="${H}" fill="url(#vign)"/>
<rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${ink}" stroke-width="4"/><rect x="32" y="32" width="${W - 64}" height="${H - 64}" fill="none" stroke="${ink}" stroke-width="1.5"/>
<text x="${W / 2}" y="64" text-anchor="middle" font-family="Sancreek" font-size="40" fill="${ink}">Unde s-a ascuns Mișșișșippi?</text>
<g filter="url(#wobble)">${rooms()}${furniture()}</g>
${coords()}${compass(1118, 470)}
${withCuts ? cuts() : ''}
</svg>`;
}

(async () => {
  const b = await chromium.launch();
  for (const [cut, file] of [[false, 'harta.png'], [true, 'harta-piese.png']]) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 3508 / W });
    await p.setContent(`<!doctype html><html><body style="margin:0">${svg(cut)}</body></html>`); await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(DIR, file), clip: { x: 0, y: 0, width: W, height: H } });
  }
  await b.close();
  console.log('gata');
})();
