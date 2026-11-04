// Scrisoarea de start, în două bucăți:
//  1) începutul scris de părinți, pe hârtie albă (se rupe de mână sub ultimul rând);
//  2) bucata „interceptată” de Mișșișșippi, pe hârtie veche, care se lipește cu scotch dedesubt.
// Rulare: node scrisoare/genereaza.js  ->  scrisoare/scrisoare.pdf (2 pagini A4) + parinti.png, raton.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname;
const W = 840, H = 1188; // A4 portret, 1 unitate = 0,25 mm

const PARINTI = ['Dragă David,', '', 'Sperăm să îți placă ce ți-am pregătit,', 'este o...'];
const RATON = [
  ['big', '...SURPRIZĂ!'],
  ['', 'Ha-ha! Sunt CREDIBILUL RATON'],
  ['', 'MIȘȘIȘȘIPPI și am interceptat'],
  ['', 'scrisoarea ta. Și surpriza adevărată!'],
  ['', ''],
  ['', 'Dacă vrei să le găsești, va trebui'],
  ['', 'să rezolvi niște CHALLENGE-URI'],
  ['', 'ingenioase, pregătite special pentru tine.'],
  ['', ''],
  ['', 'Începem cu prima ghicitoare:'],
  ['poem', 'Sunt galben ca o lămâie'],
  ['poem', 'și am și eu o melodie:'],
  ['poem', '„We all live in a Yellow...” — hai, ghicește!'],
  ['poem', 'Mă scufund adânc în mare,'],
  ['poem', 'dar nu mă ud deloc. Ce lucru rar e!'],
  ['poem', 'Am elice, periscop, hublou rotund,'],
  ['poem', 'și sunt din piese mici, puse cap la cap, nu mint.'],
  ['poem', 'Găsește-mă și-o să vezi:'],
  ['poem', 'acolo te-aștept cu al doilea indiciu. Ce crezi?'],
  ['', ''],
  ['sign', 'Succes! O să-ți trebuiască. — M.'],
];

const ff = (fam, file, weight, range) => `@font-face{font-family:"${fam}";font-weight:${weight};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(DIR, 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = ff('Caveat', 'caveat-latin-400-normal.woff2', 400) + ff('Caveat', 'caveat-latin-ext-400-normal.woff2', 400, 'U+0100-02AF')
  + ff('Caveat', 'caveat-latin-700-normal.woff2', 700) + ff('Caveat', 'caveat-latin-ext-700-normal.woff2', 700, 'U+0100-02AF');
const PAW = '<g><ellipse cx="20" cy="33" rx="10.5" ry="11.5"/><ellipse cx="5.5" cy="21" rx="3.4" ry="6.5" transform="rotate(-35 5.5 21)"/><ellipse cx="12" cy="11" rx="3.4" ry="7.5" transform="rotate(-14 12 11)"/><ellipse cx="20" cy="7.5" rx="3.4" ry="7.5"/><ellipse cx="28" cy="11" rx="3.4" ry="7.5" transform="rotate(14 28 11)"/><ellipse cx="34.5" cy="21" rx="3.4" ry="6.5" transform="rotate(35 34.5 21)"/></g>';
const paw = (x, y, s, rot, fill, op) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})" fill="${fill}" opacity="${op}">${PAW}</g>`;
const svg = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${FONTS}</style>${body}</svg>`;

// 1) foaia părinților: hârtie dictando, scris albastru; textul ocupă doar partea de sus (restul se rupe)
function parinti() {
  let s = `<rect width="${W}" height="${H}" fill="#fff"/>`;
  for (let y = 150; y < 560; y += 46) s += `<path d="M70 ${y} H${W - 70}" stroke="#cfe0f2" stroke-width="1.5"/>`;
  s += `<path d="M120 90 V560" stroke="#f2b8b8" stroke-width="1.5"/>`;
  PARINTI.forEach((t, i) => s += `<text x="140" y="${190 + i * 92}" font-family="Caveat" font-weight="400" font-size="${i === 0 ? 58 : 52}" fill="#1f4e9c">${t}</text>`);
  return svg(s);
}

// 2) bucata ratonului: hârtie veche, pătată, cu urme de lăbuțe; scris mov
function raton() {
  let s = `<defs><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 -1.2 .7"/></filter>
<radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#7a5a30" stop-opacity="0"/><stop offset="1" stop-color="#5a3a18" stop-opacity=".55"/></radialGradient>
<radialGradient id="stain"><stop offset="0" stop-color="#a07840" stop-opacity="0"/><stop offset=".7" stop-color="#a07840" stop-opacity=".22"/><stop offset="1" stop-color="#8a6030" stop-opacity="0"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="#efdfb8"/><rect width="${W}" height="${H}" filter="url(#grain)" opacity=".5"/>
<ellipse cx="660" cy="260" rx="110" ry="80" fill="url(#stain)"/><ellipse cx="180" cy="900" rx="130" ry="90" fill="url(#stain)"/><ellipse cx="600" cy="1050" rx="90" ry="60" fill="url(#stain)"/>
<rect width="${W}" height="${H}" fill="url(#vign)"/>`;
  // urme de lăbuțe: trec peste foaie, ca și cum ratonul ar fi călcat pe ea
  [[640, 560, 20], [690, 610, 30], [660, 680, 15], [710, 730, 35], [60, 120, -30], [100, 70, -10]].forEach(([x, y, r]) => s += paw(x, y, 1.1, r, '#5b3a1e', .28));
  let y = 130;
  for (const [kind, t] of RATON) {
    if (!t) { y += 24; continue; }
    if (kind === 'big') { s += `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="96" fill="#6b3fa0" transform="rotate(-3 ${W / 2} ${y})">${t}</text>`; y += 96; continue; }
    if (kind === 'poem') { s += `<text x="120" y="${y}" font-family="Caveat" font-weight="700" font-size="40" fill="#2f2a3a">${t}</text>`; y += 46; continue; }
    if (kind === 'sign') { s += `<text x="${W - 90}" y="${y}" text-anchor="end" font-family="Caveat" font-weight="700" font-size="46" fill="#6b3fa0">${t}</text>${paw(W - 150, y + 14, 1.4, 12, '#5b3a1e', .85)}`; y += 50; continue; }
    s += `<text x="90" y="${y}" font-family="Caveat" font-weight="700" font-size="46" fill="#6b3fa0">${t}</text>`; y += 52;
  }
  return svg(s);
}

(async () => {
  const b = await chromium.launch();
  for (const [file, page] of [['parinti.png', parinti()], ['raton.png', raton()]]) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2480 / W });
    await p.setContent(`<!doctype html><html><body style="margin:0">${page}</body></html>`); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(DIR, file), clip: { x: 0, y: 0, width: W, height: H } });
  }
  const p = await b.newPage();
  await p.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block;width:210mm;height:297mm;page-break-after:always}</style></head><body>${parinti()}${raton()}</body></html>`);
  await p.waitForTimeout(300);
  await p.pdf({ path: path.join(DIR, 'scrisoare.pdf'), format: 'A4', printBackground: true });
  await b.close();
  console.log('gata');
})();
