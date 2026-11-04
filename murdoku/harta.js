// Desenează harta casei ca hartă de comori (tabla de Murdoku), A4 orizontal, fără legendă.
// Rulare: node murdoku/harta.js  ->  murdoku/harta.png (300 DPI) și murdoku/harta-piese.png (cu liniile de tăiat în 5 piese)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const W = 1188, H = 840;
// aceeași grilă ca în rezolva.py
const CAMERE = [
  [null, 'dormitor', 'baie', 'camera', 'camera'],
  [null, 'dormitor', 'baie', 'camera', 'camera'],
  ['sufragerie', 'sufragerie', 'hol', 'bucatarie', 'bucatarie'],
  ['sufragerie', 'sufragerie', 'hol', 'bucatarie', 'bucatarie'],
  ['sufragerie', 'sufragerie', 'hol', 'baie2', null],
];
const NUME = { dormitor: 'Dormitor', baie: 'Baie', camera: 'Camera mică', sufragerie: 'Sufragerie', hol: 'Hol', bucatarie: 'Bucătărie', baie2: 'Baie' };
const CULOARE = { dormitor: '#e9d6b8', baie: '#d5e3e0', camera: '#e6d2c4', sufragerie: '#e7dcb6', hol: '#ddd2bd', bucatarie: '#e3d9c0', baie2: '#d5e3e0' };
const MOBILA = { '0,1': 'pat', '1,1': 'covor', '0,2': 'cada', '1,2': 'chiuveta', '0,3': 'pat', '0,4': 'birou', '2,0': 'birou', '2,1': 'tv', '3,0': 'planta', '3,1': 'covor', '2,3': 'masa', '3,3': 'scaun', '4,3': 'chiuveta' };
const N = 5, CW = 186, CH = 126, X0 = 150, Y0 = 136;
const cx = c => X0 + c * CW, cy = r => Y0 + r * CH;
const ink = '#3a2614';

const font = (fam, file, range) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'wanted', 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = font('Sancreek', 'sancreek-latin-400-normal.woff2') + font('Sancreek', 'sancreek-latin-ext-400-normal.woff2', 'U+0100-02AF')
  + font('Bevan', 'bevan-latin-400-normal.woff2') + font('Bevan', 'bevan-latin-ext-400-normal.woff2', 'U+0100-02AF');

// ---------- mobila, desenată în pătrățelul ei ----------
const g = (r, c, inner) => `<g transform="translate(${cx(c) + CW / 2} ${cy(r) + CH / 2 + 8}) scale(.78)" stroke="${ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${inner}</g>`;
const ICON = {
  pat: '<rect x="-62" y="-46" width="124" height="92" rx="10" fill="#f4ecdc"/><rect x="-52" y="-38" width="44" height="26" rx="8" fill="#fff"/><rect x="2" y="-38" width="44" height="26" rx="8" fill="#fff"/><path d="M-62 -4 H62 V36 Q62 46 52 46 H-52 Q-62 46 -62 36 Z" fill="#8fb8de"/><path d="M-62 8 H62" fill="none" stroke-width="2"/>',
  covor: '<rect x="-64" y="-40" width="128" height="80" rx="8" fill="#c97b5a"/><rect x="-52" y="-30" width="104" height="60" rx="6" fill="none" stroke="#f4ecdc" stroke-width="3"/><path d="M-30 0 L0 -18 L30 0 L0 18 Z" fill="#f4ecdc" stroke-width="2"/><path d="M-64 -30 h-8 M-64 -14 h-8 M-64 2 h-8 M-64 18 h-8 M64 -30 h8 M64 -14 h8 M64 2 h8 M64 18 h8" stroke-width="2"/>',
  cada: '<rect x="-66" y="-40" width="132" height="80" rx="34" fill="#fff"/><rect x="-54" y="-28" width="108" height="56" rx="24" fill="#a9d4ef"/><circle cx="-38" cy="0" r="5" fill="#fff"/><path d="M-10 -6 q8 -6 16 0 M14 6 q8 -6 16 0" fill="none" stroke="#fff" stroke-width="2.5"/>',
  chiuveta: '<rect x="-40" y="-34" width="80" height="62" rx="14" fill="#fff"/><ellipse cx="0" cy="2" rx="26" ry="18" fill="#a9d4ef"/><path d="M0 -34 V-16 M-8 -34 H8" fill="none" stroke-width="4"/>',
  birou: '<rect x="-66" y="-34" width="132" height="58" rx="5" fill="#a5754a"/><path d="M-58 24 V44 M58 24 V44" stroke-width="5"/><rect x="-46" y="-26" width="34" height="24" rx="3" fill="#f4ecdc"/><path d="M30 -10 V-30 l14 -10" fill="none" stroke-width="3"/><path d="M38 -46 l16 -6 l4 12 Z" fill="#ffd166"/>',
  tv: '<rect x="-60" y="-42" width="120" height="70" rx="8" fill="#2d2a33"/><rect x="-52" y="-34" width="104" height="54" rx="4" fill="#5f7fa3"/><path d="M-42 -26 l16 -6" stroke="#fff" stroke-width="3"/><path d="M-20 28 L-28 46 M20 28 L28 46 M-34 46 H34" fill="none" stroke-width="4"/>',
  planta: '<path d="M-24 14 H24 L18 46 H-18 Z" fill="#c4683f"/><path d="M0 14 Q-6 -20 -36 -30 Q-10 -26 0 4 Q4 -36 20 -46 Q12 -20 4 8 Q22 -14 42 -16 Q20 -4 6 14" fill="#5aab4e"/>',
  canapea: '',
  masa: '<ellipse cx="0" cy="0" rx="52" ry="38" fill="#b9854f"/><ellipse cx="0" cy="-4" rx="40" ry="26" fill="none" stroke="#e0b884" stroke-width="2"/><rect x="-82" y="-14" width="22" height="28" rx="6" fill="#d9b277"/><rect x="60" y="-14" width="22" height="28" rx="6" fill="#d9b277"/>',
  scaun: '<rect x="-30" y="-24" width="60" height="54" rx="8" fill="#d9b277"/><rect x="-30" y="-38" width="60" height="16" rx="6" fill="#b9854f"/>',
};
const BLOCAT = new Set(['birou', 'tv', 'planta', 'masa', 'chiuveta']);
function furniture() {
  let s = '';
  for (const [k, t] of Object.entries(MOBILA)) { const [r, c] = k.split(',').map(Number); s += g(r, c, ICON[t]); }
  // canapeaua ocupă două pătrățele (4,0)-(4,1)
  s += `<g transform="translate(${cx(1)} ${cy(4) + CH / 2 + 6}) scale(.92 .82)" stroke="${ink}" stroke-width="3" stroke-linejoin="round"><rect x="-160" y="-6" width="320" height="50" rx="16" fill="#7aa36b"/><rect x="-160" y="-36" width="320" height="34" rx="14" fill="#8db87d"/><rect x="-176" y="-30" width="30" height="74" rx="12" fill="#6a9160"/><rect x="146" y="-30" width="30" height="74" rx="12" fill="#6a9160"/><path d="M-50 -2 V40 M50 -2 V40" stroke-width="2"/></g>`;
  return s;
}

// ---------- camerele: podea colorată + pereți groși doar între camere diferite ----------
function rooms() {
  let floor = '', walls = '', grid = '';
  const room = (r, c) => (r >= 0 && r < N && c >= 0 && c < N) ? CAMERE[r][c] : null;
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const k = room(r, c); if (!k) continue;
    floor += `<rect x="${cx(c)}" y="${cy(r)}" width="${CW}" height="${CH}" fill="${CULOARE[k]}"/>`;
    grid += `<rect x="${cx(c)}" y="${cy(r)}" width="${CW}" height="${CH}" fill="none" stroke="${ink}" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="6 6"/>`;
    if (room(r - 1, c) !== k) walls += `M${cx(c)} ${cy(r)} H${cx(c + 1)} `;
    if (room(r + 1, c) !== k) walls += `M${cx(c)} ${cy(r + 1)} H${cx(c + 1)} `;
    if (room(r, c - 1) !== k) walls += `M${cx(c)} ${cy(r)} V${cy(r + 1)} `;
    if (room(r, c + 1) !== k) walls += `M${cx(c + 1)} ${cy(r)} V${cy(r + 1)} `;
  }
  // numele camerelor, în colțul de sus al primei celule
  const done = new Set(); let labels = '';
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    const k = room(r, c); if (!k || done.has(k)) continue; done.add(k);
    labels += `<rect x="${cx(c) + 6}" y="${cy(r) + 6}" width="${NUME[k].length * 10.5 + 14}" height="24" rx="7" fill="#fbf3df" stroke="${ink}" stroke-width="1.5"/><text x="${cx(c) + 13}" y="${cy(r) + 24}" font-family="Bevan" font-size="16" fill="${ink}">${NUME[k]}</text>`;
  }
  return floor + grid + `<path d="${walls}" fill="none" stroke="${ink}" stroke-width="7" stroke-linecap="square"/>` + labels;
}

// coordonatele grilei (rânduri cu litere, coloane cu cifre), ca să poată spune „B3”
const coords = () => {
  let s = '';
  for (let c = 0; c < N; c++) s += `<text x="${cx(c) + CW / 2}" y="${Y0 - 12}" text-anchor="middle" font-family="Bevan" font-size="24" fill="${ink}">${c + 1}</text>`;
  for (let r = 0; r < N; r++) s += `<text x="${X0 - 22}" y="${cy(r) + CH / 2 + 9}" text-anchor="middle" font-family="Bevan" font-size="24" fill="${ink}">${'ABCDE'[r]}</text>`;
  return s;
};
const compass = (x, y) => `<g transform="translate(${x} ${y})" stroke="${ink}" stroke-width="2.5"><circle r="44" fill="none" stroke-dasharray="3 5"/><path d="M0 -50 L10 0 L0 50 L-10 0 Z" fill="#c0392b"/><path d="M-50 0 L0 10 L50 0 L0 -10 Z" fill="#f1deb0"/><text y="-56" text-anchor="middle" font-family="Bevan" font-size="20" fill="${ink}" stroke="none">N</text></g>`;
const legend = () => {
  const y = Y0 + 5 * CH + 4, items = [['Se poate sta pe:', ['pat', 'covor', 'cada', 'scaun']], ['Nu se poate sta pe:', ['masa', 'tv', 'birou', 'planta', 'chiuveta']]];
  const names = { pat: 'pat', covor: 'covor', cada: 'cadă', scaun: 'scaun', masa: 'masă', tv: 'TV', birou: 'birou', planta: 'plantă', chiuveta: 'chiuvetă' };
  let s = `<g font-family="Bevan" font-size="15" fill="${ink}">`;
  items.forEach(([t, list], i) => {
    const ly = y + 22 + i * 46;
    s += `<text x="${X0}" y="${ly + 6}" font-size="17">${t}</text>`;
    list.forEach((k, j) => {
      const lx = X0 + 210 + j * 128;
      s += `<g transform="translate(${lx} ${ly}) scale(.27)" stroke="${ink}" stroke-width="5">${ICON[k]}</g><text x="${lx + 24}" y="${ly + 6}">${names[k]}</text>`;
    });
  });
  s += `<text x="${X0 + 210 + 4 * 128}" y="${y + 28}" font-size="0">.</text>`;
  return s + `<g transform="translate(${X0 + 210 + 4 * 128} ${y + 22}) scale(.27)" stroke="${ink}" stroke-width="5"><rect x="-80" y="-20" width="160" height="40" rx="12" fill="#7aa36b"/></g><text x="${X0 + 210 + 4 * 128 + 28}" y="${y + 28}">canapea</text></g>`;
};
// liniile de tăiat în 5 piese (zimțate, ca de puzzle)
function cuts() {
  const jag = pts => 'M' + pts.map(([x, y]) => `${x.toFixed(0)} ${y.toFixed(0)}`).join(' L');
  const yA = cy(2) - 50, xB = cx(2) + 6, xC = cx(4) + 20, yD = cy(3) + 56;
  const a = [[40, yA + 10], [cx(1) - 20, yA - 12], [cx(1) + 70, yA + 22], [cx(2) + 10, yA - 6], [cx(3) - 20, yA + 26], [cx(3) + 110, yA - 10], [cx(4) + 80, yA + 18], [W - 40, yA]];
  const b = [[xB, yA + 4], [xB - 18, cy(2) + 50], [xB + 22, cy(3) + 10], [xB - 14, cy(4) + 20], [xB + 12, H - 40]];
  const c = [[xC, yA + 14], [xC - 18, cy(2) + 60], [xC + 22, cy(3) + 30], [xC - 14, cy(4) + 40], [xC + 10, H - 40]];
  const d = [[40, yD], [cx(0) + 70, yD + 24], [cx(1) + 30, yD - 14], [xB - 4, yD + 14]];
  return `<g fill="none" stroke="#7a2e1e" stroke-width="2.5" stroke-dasharray="12 8">${[a, b, c, d].map(p => `<path d="${jag(p)}"/>`).join('')}</g>`;
}

function svg(withCuts) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${FONTS}</style>
<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 -1.2 .7"/></filter>
  <radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#7a5a30" stop-opacity="0"/><stop offset="1" stop-color="#5a3a18" stop-opacity=".7"/></radialGradient>
  <filter id="wobble" x="-2%" y="-2%" width="104%" height="104%"><feTurbulence type="fractalNoise" baseFrequency=".03" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="3" xChannelSelector="R" yChannelSelector="G"/></filter>
</defs>
<rect width="${W}" height="${H}" fill="#efdfb8"/>
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".5"/>
<rect width="${W}" height="${H}" fill="url(#vign)"/>
<rect x="22" y="22" width="${W - 44}" height="${H - 44}" fill="none" stroke="${ink}" stroke-width="4"/><rect x="32" y="32" width="${W - 64}" height="${H - 64}" fill="none" stroke="${ink}" stroke-width="1.5"/>
<text x="${W / 2}" y="76" text-anchor="middle" font-family="Sancreek" font-size="46" fill="${ink}">Unde s-a ascuns Mișșișșippi?</text>
<g filter="url(#wobble)">${rooms()}${furniture()}</g>
${coords()}${compass(1128, 440)}
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
