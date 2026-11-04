// Mesajul codat cu simboluri (pasul de la colecția de discuri) și Alfabetul secret al lui Mișșișșippi.
// Pagina 1: mesajul în simboluri, cu o căsuță goală sub fiecare, pentru litera decodată.
// Pagina 2: alfabetul: fiecare literă are un simbol din lumea ratonului; Ă și Ș = simbolul lui A / S cu semnul lor.
// Rulare: node bilete/alfabet.js  ->  bilete/mesaj-codat.pdf (2 pagini A4) + mesaj-codat.png, alfabet.png
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const MESAJ = [['SEIFUL', 'ESTE'], ['ASCUNS', 'PE'], ['MAȘINA', 'DE'], ['SPĂLAT']];
const ink = '#2f2a3a';

// ---------- simbolurile (desenate într-un pătrat de 100×100) ----------
const S = `stroke="${ink}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
const ICONS = {
  ghinda: `<path d="M28 42 Q28 88 50 92 Q72 88 72 42 Z" fill="#d98b3a"/><path d="M20 44 Q20 20 50 18 Q80 20 80 44 Q50 50 20 44 Z" fill="#8a5a2b"/><path d="M50 18 q4 -10 12 -10" fill="none"/>`,
  laba: `<g fill="${ink}" stroke="none"><ellipse cx="50" cy="66" rx="20" ry="22"/><ellipse cx="20" cy="42" rx="7" ry="12" transform="rotate(-35 20 42)"/><ellipse cx="35" cy="22" rx="7" ry="13" transform="rotate(-14 35 22)"/><ellipse cx="51" cy="15" rx="7" ry="13"/><ellipse cx="67" cy="22" rx="7" ry="13" transform="rotate(14 67 22)"/><ellipse cx="81" cy="42" rx="7" ry="12" transform="rotate(35 81 42)"/></g>`,
  coada: `<path d="M18 86 Q12 40 50 30 Q86 22 82 10" fill="none" stroke="${ink}" stroke-width="28"/><path d="M18 86 Q12 40 50 30 Q86 22 82 10" fill="none" stroke="#ececf0" stroke-width="19"/><path d="M18 86 Q12 40 50 30 Q86 22 82 10" fill="none" stroke="${ink}" stroke-width="19" stroke-dasharray="10 10" stroke-linecap="butt"/>`,
  gogoasa: `<circle cx="50" cy="52" r="38" fill="#e2a35c"/><path d="M14 46 Q20 18 50 16 Q80 18 86 46 Q74 40 64 48 Q52 40 40 48 Q28 40 14 46 Z" fill="#ff8fb1"/><circle cx="50" cy="52" r="12" fill="#fff"/>`,
  frunza: `<path d="M18 82 Q14 20 82 16 Q86 78 18 82 Z" fill="#5aab4e"/><path d="M18 82 L70 28" fill="none"/>`,
  stea: `<path d="M50 8 L61 38 L93 38 L67 57 L77 88 L50 69 L23 88 L33 57 L7 38 L39 38 Z" fill="#ffd166"/>`,
  luna: `<path d="M64 10 A40 40 0 1 0 90 66 A32 32 0 1 1 64 10 Z" fill="#f4e27a"/>`,
  soare: `<circle cx="50" cy="50" r="22" fill="#ffb03a"/>${[0, 45, 90, 135, 180, 225, 270, 315].map(a => `<path d="M${50 + Math.cos(a * Math.PI / 180) * 32} ${50 + Math.sin(a * Math.PI / 180) * 32} L${50 + Math.cos(a * Math.PI / 180) * 44} ${50 + Math.sin(a * Math.PI / 180) * 44}"/>`).join('')}`,
  nas: `<circle cx="50" cy="52" r="34" fill="#e53935"/><ellipse cx="38" cy="38" rx="10" ry="6" fill="#fff" stroke="none"/>`,
  palarie: `<ellipse cx="50" cy="70" rx="44" ry="12" fill="#6b4a3a"/><path d="M24 70 Q24 24 50 22 Q76 24 76 70 Q50 62 24 70 Z" fill="#7d5846"/><path d="M25 58 Q50 52 75 58 L76 68 Q50 62 24 68 Z" fill="#e05a47"/>`,
  ochelari: `<rect x="8" y="36" width="36" height="26" rx="12" fill="#1d2b3a"/><rect x="56" y="36" width="36" height="26" rx="12" fill="#1d2b3a"/><path d="M44 46 Q50 40 56 46" fill="none"/><path d="M16 44 l8 8 M64 44 l8 8" stroke="#fff" stroke-width="4"/>`,
  ancora: `<path d="M50 22 V86 M30 36 H70 M16 60 Q18 86 50 86 Q82 86 84 60" fill="none" stroke="#3f7fd0" stroke-width="9"/><circle cx="50" cy="16" r="8" fill="#fff" stroke="#3f7fd0" stroke-width="6"/><path d="M8 64 L16 54 L24 64 M76 64 L84 54 L92 64" fill="none" stroke="#3f7fd0" stroke-width="7"/>`,
  cheie: `<circle cx="28" cy="50" r="18" fill="#e2b33c"/><circle cx="28" cy="50" r="7" fill="#fff"/><path d="M46 50 H92 M80 50 V64 M68 50 V60" fill="none" stroke-width="8"/>`,
  lacat: `<path d="M30 46 V30 Q30 12 50 12 Q70 12 70 30 V46" fill="none" stroke-width="8"/><rect x="18" y="44" width="64" height="46" rx="8" fill="#e2b33c"/><circle cx="50" cy="64" r="6" fill="${ink}"/>`,
  lupa: `<circle cx="40" cy="40" r="26" fill="#cfe8f7"/><path d="M60 60 L88 88" stroke-width="12"/>`,
  inima: `<path d="M50 88 Q10 60 10 34 Q10 12 30 12 Q44 12 50 26 Q56 12 70 12 Q90 12 90 34 Q90 60 50 88 Z" fill="#ff6f91"/>`,
  nor: `<path d="M20 72 Q4 72 6 56 Q8 42 24 44 Q26 22 48 22 Q66 22 70 38 Q92 36 94 56 Q94 72 78 72 Z" fill="#dfe9f2"/>`,
  fulger: `<path d="M58 6 L22 56 H46 L38 94 L80 38 H54 Z" fill="#ffd166"/>`,
  peste: `<path d="M12 50 Q36 18 70 50 Q36 82 12 50 Z" fill="#5aa9e6"/><path d="M68 50 L92 30 V70 Z" fill="#5aa9e6"/><circle cx="30" cy="46" r="4" fill="${ink}"/>`,
  os: `<path d="M26 40 L74 60" stroke-width="16"/><path d="M26 40 L74 60" stroke="#f4f0e6" stroke-width="9"/><circle cx="20" cy="34" r="10" fill="#f4f0e6"/><circle cx="30" cy="48" r="10" fill="#f4f0e6"/><circle cx="70" cy="52" r="10" fill="#f4f0e6"/><circle cx="80" cy="66" r="10" fill="#f4f0e6"/>`,
  ciuperca: `<path d="M10 54 Q12 14 50 14 Q88 14 90 54 Z" fill="#e53935"/><rect x="38" y="54" width="24" height="34" rx="8" fill="#f4f0e6"/><circle cx="34" cy="34" r="6" fill="#fff" stroke="none"/><circle cx="62" cy="28" r="5" fill="#fff" stroke="none"/><circle cx="70" cy="44" r="5" fill="#fff" stroke="none"/>`,
  floare: `${[0, 72, 144, 216, 288].map(a => `<circle cx="${50 + Math.cos((a - 90) * Math.PI / 180) * 24}" cy="${50 + Math.sin((a - 90) * Math.PI / 180) * 24}" r="16" fill="#b06bff"/>`).join('')}<circle cx="50" cy="50" r="12" fill="#ffd166"/>`,
  nota: `<path d="M38 74 V18 L80 10 V64" fill="none" stroke-width="7"/><ellipse cx="28" cy="76" rx="14" ry="11" fill="${ink}"/><ellipse cx="70" cy="66" rx="14" ry="11" fill="${ink}"/>`,
  disc: `<circle cx="50" cy="50" r="42" fill="#222"/><circle cx="50" cy="50" r="30" fill="none" stroke="#555" stroke-width="2"/><circle cx="50" cy="50" r="14" fill="#e53935"/><circle cx="50" cy="50" r="3" fill="#fff" stroke="none"/>`,
  bomba: `<circle cx="44" cy="58" r="32" fill="#3a3a40"/><path d="M64 32 Q74 20 86 22" fill="none"/><path d="M88 10 L92 22 L82 18 Z" fill="#ffb03a"/><circle cx="34" cy="48" r="6" fill="#fff" stroke="none" opacity=".6"/>`,
  mar: `<path d="M50 30 Q20 14 14 46 Q12 86 50 90 Q88 86 86 46 Q80 14 50 30 Z" fill="#7cc36b"/><path d="M50 30 Q50 16 58 8" fill="none"/><path d="M52 18 Q66 6 74 14 Q62 22 52 18 Z" fill="#3e8a3a"/>`,
};
const NAMES = Object.keys(ICONS);
const LITERE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
// potrivire literă -> simbol, amestecată, dar mereu la fel (sămânță fixă)
let seed = 11;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const order = NAMES.slice(); for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
const KEY = Object.fromEntries(LITERE.map((l, i) => [l, order[i]]));
const BAZA = { 'Ă': 'A', 'Â': 'A', 'Î': 'I', 'Ș': 'S', 'Ț': 'T' };
// un simbol la (x, y) cu latura s (mm), cu semnul diacritic dacă e cazul
function sym(ch, x, y, s) {
  const base = BAZA[ch] || ch, mark = ch === base ? '' : ch;
  let out = `<g transform="translate(${x} ${y}) scale(${s / 100})" ${S}>${ICONS[KEY[base]]}</g>`;
  const k = s / 100;
  if (mark === 'Ă') out += `<path d="M${x + 36 * k} ${y - 6 * k} Q${x + 50 * k} ${y + 8 * k} ${x + 64 * k} ${y - 6 * k}" fill="none" stroke="${ink}" stroke-width="${7 * k}" stroke-linecap="round"/>`;
  if (mark === 'Â' || mark === 'Î') out += `<path d="M${x + 36 * k} ${y + 2 * k} L${x + 50 * k} ${y - 10 * k} L${x + 64 * k} ${y + 2 * k}" fill="none" stroke="${ink}" stroke-width="${7 * k}" stroke-linecap="round" stroke-linejoin="round"/>`;
  if (mark === 'Ș' || mark === 'Ț') out += `<path d="M${x + 52 * k} ${y + 102 * k} q${5 * k} ${6 * k} ${-5 * k} ${16 * k}" fill="none" stroke="${ink}" stroke-width="${8 * k}" stroke-linecap="round"/>`;
  return out;
}

const ff = (fam, file, weight, range) => `@font-face{font-family:"${fam}";font-weight:${weight};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'murdoku', 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = ff('Nunito', 'nunito-latin-900-normal.woff2', 900) + ff('Nunito', 'nunito-latin-ext-900-normal.woff2', 900, 'U+0100-02AF')
  + ff('Nunito', 'nunito-latin-700-normal.woff2', 700) + ff('Nunito', 'nunito-latin-ext-700-normal.woff2', 700, 'U+0100-02AF')
  + ff('Pacifico', 'pacifico-latin-400-normal.woff2', 400) + ff('Pacifico', 'pacifico-latin-ext-400-normal.woff2', 400, 'U+0100-02AF');
const A4 = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm"><style>${FONTS}</style><rect width="210" height="297" fill="#fff"/>${body}</svg>`;
const title = (t, sub) => `<text x="105" y="24" text-anchor="middle" font-family="Pacifico" font-size="11" fill="${ink}">${t}</text><text x="105" y="33" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="4.6" fill="#7a6a58">${sub}</text>`;

// pagina 1: mesajul, rând cu rând; sub fiecare simbol, o căsuță goală
function mesaj() {
  const CELL = 16, GAP = 9, ROW = 46;
  let s = title('Mesaj secret', 'Decodează-l cu Alfabetul secret: scrie litera potrivită sub fiecare simbol.');
  MESAJ.forEach((words, r) => {
    const n = words.reduce((a, w) => a + [...w].length, 0) + (words.length - 1);
    let x = 105 - (n * CELL + (n - 1) * 1.5 - (words.length - 1) * (CELL - GAP)) / 2;
    const y = 52 + r * ROW;
    words.forEach((w, wi) => {
      [...w].forEach(ch => {
        s += `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2.5" fill="#faf6ee" stroke="#d9cfbd" stroke-width=".4"/>` + sym(ch, x + 1.5, y + 1.5, CELL - 3);
        s += `<rect x="${x}" y="${y + CELL + 4}" width="${CELL}" height="${CELL}" rx="2.5" fill="#fff" stroke="${ink}" stroke-width=".7"/>`;
        x += CELL + 1.5;
      });
      if (wi < words.length - 1) x += GAP - 1.5;
    });
  });
  s += `<text x="190" y="270" text-anchor="end" font-family="Pacifico" font-size="8" fill="#6b3fa0">— M.</text>`;
  return A4(s);
}

// pagina 2: alfabetul, 26 de litere pe 5 rânduri + regula pentru diacritice
function alfabet() {
  let s = title('Alfabetul secret al lui Mișșișșippi', 'Fiecare literă are simbolul ei. Nu-l arăta nimănui!');
  const cols = 6, cw = 30, ch = 40, x0 = 105 - (cols * cw) / 2;
  LITERE.forEach((l, i) => {
    const c = i % cols, r = Math.floor(i / cols), x = x0 + c * cw + (r === 4 ? cw * 2 : 0), y = 42 + r * ch;
    s += `<rect x="${x + 2}" y="${y}" width="${cw - 4}" height="${ch - 4}" rx="3" fill="#faf6ee" stroke="#d9cfbd" stroke-width=".4"/>`;
    s += sym(l, x + 6, y + 3, cw - 12) + `<text x="${x + cw / 2}" y="${y + ch - 8}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="9" fill="${ink}">${l}</text>`;
  });
  const y = 248;
  s += `<text x="105" y="${y}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="5.5" fill="${ink}">Literele cu semn:</text>`;
  [['Ă'], ['Ș']].forEach(([l], i) => {
    const x = 62 + i * 52;
    s += sym(l, x, y + 6, 16) + `<text x="${x + 22}" y="${y + 18}" font-family="Nunito" font-weight="900" font-size="7" fill="${ink}">= ${l}</text>`;
  });
  s += `<text x="105" y="${y + 36}" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="4.2" fill="#7a6a58">Ă = simbolul lui A cu căciulă · Ș = simbolul lui S cu virgulă dedesubt</text>`;
  return A4(s);
}

(async () => {
  console.log('Cheia:', LITERE.map(l => `${l}=${KEY[l]}`).join(' '));
  const b = await chromium.launch();
  const p = await b.newPage();
  await p.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block;page-break-after:always}</style></head><body>${mesaj()}${alfabet()}</body></html>`);
  await p.waitForTimeout(300);
  await p.pdf({ path: path.join(DIR, 'mesaj-codat.pdf'), format: 'A4', printBackground: true });
  for (const [file, page] of [['mesaj-codat.png', mesaj()], ['alfabet.png', alfabet()]]) {
    const q = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 });
    await q.setContent(`<!doctype html><html><body style="margin:0">${page.replace('width="210mm" height="297mm"', 'width="794" height="1123"')}</body></html>`); await q.waitForTimeout(300);
    await q.screenshot({ path: path.join(DIR, file) });
  }
  await b.close(); console.log('gata');
})();
