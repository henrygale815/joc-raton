// Grila secretă: „Jurnalul secret al lui Mișșișșippi” + cartonașul cu ferestre (tăiat în 5 piese).
// Prin ferestre se citește, rând cu rând: COMOARA / ESTE / SUB / CANAPEA (fiecare cuvânt începe pe un rând nou).
// Rulare: node cifru/genereaza.js  ->  cifru/jurnal.png, cifru/grila.png, cifru/solutie.png, cifru/de-printat.pdf (A4)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const MESAJ = ['COMOARA', 'ESTE', 'SUB', 'CANAPEA'];
const TEXT = `LUNI: AM FURAT UN NAS DE CLOVN. ÎMI STĂ SUPER! MARȚI: AM MÂNCAT ȘAPTE GOGOȘI. PE A OPTA AM PĂSTRAT-O PENTRU DETECTIV. GLUMĂ! AM MÂNCAT-O ȘI PE EA. MIERCURI: AM DANSAT PE O BOXĂ. JOI: TENNEȘȘEE A DORMIT TOATĂ ZIUA. VINERI: AM ASCUNS CEVA SECRET. SÂMBĂTĂ: AM UITAT UNDE. DUMINICĂ: MI-AM AMINTIT! UN DETECTIV MĂ CAUTĂ. HA-HA! PE MINE NU MĂ PRINDE NIMENI. SEMNAT: M.`;
const COLS = 19, ROWS = 21;
// A4 portret în unități de 0,25 mm
const W = 840, H = 1188, CELL = 40, GX = (W - COLS * CELL) / 2, GY = 150;
const ink = '#2f2a3a';

// ---------- textul pe grilă: câte o literă în pătrățel, cuvintele nu se rup ----------
function layout(text) {
  const rows = []; let line = '';
  for (const w of text.split(' ')) {
    if ((line ? line.length + 1 : 0) + w.length <= COLS) line += (line ? ' ' : '') + w;
    else { rows.push(line); line = w; }
  }
  rows.push(line);
  return rows.map(r => [...r.padEnd(COLS, ' ')]);
}
const G = layout(TEXT);
if (G.length > ROWS) throw new Error(`Textul are ${G.length} rânduri, încap ${ROWS}`);

// ---------- ferestrele: literele mesajului, în ordine; fiecare cuvânt începe pe un rând nou ----------
function windows() {
  // căutare cu întoarcere: fiecare cuvânt începe pe un rând nou, literele merg în ordinea citirii,
  // două ferestre de pe același rând nu stau lipite; preferăm ferestre întinse uniform pe pagină
  const letters = MESAJ.flatMap((w, wi) => [...w].map((ch, k) => ({ ch, wi, first: k === 0 })));
  const total = letters.length, pos = [];
  for (let r = 0; r < G.length; r++) for (let c = 0; c < COLS; c++) pos.push([r, c]);
  const idx = ([r, c]) => r * COLS + c;
  const out = [];
  (function bt(i) {
    if (i === total) return true;
    const L = letters[i], prev = out[i - 1];
    const ideal = Math.round((i + .5) / total * G.length * COLS); // unde ar fi „uniform”
    const cand = pos.filter(([r, c]) => G[r][c] === L.ch && (!prev || idx([r, c]) > idx(prev))
      && (!prev || !L.first || r > prev[0]) && (!prev || r !== prev[0] || c - prev[1] >= 2))
      .sort((a, b) => Math.abs(idx(a) - ideal) - Math.abs(idx(b) - ideal));
    for (const p of cand.slice(0, 6)) { out.push(p); if (bt(i + 1)) return true; out.pop(); }
    return false;
  })(0);
  if (out.length !== total) throw new Error('Nu pot ascunde mesajul în text; adaugă litere în TEXT.');
  return out;
}
const WIN = windows();
// verificare: citind ferestrele rând cu rând iese exact mesajul
const read = WIN.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]).map(([r, c]) => G[r][c]).join('');
if (read !== MESAJ.join('')) throw new Error('Ferestrele nu dau mesajul: ' + read);

// ---------- desen ----------
const ff = (fam, file, weight, range) => `@font-face{font-family:"${fam}";font-weight:${weight};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'murdoku', 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = ff('Pacifico', 'pacifico-latin-400-normal.woff2', 400) + ff('Pacifico', 'pacifico-latin-ext-400-normal.woff2', 400, 'U+0100-02AF')
  + ff('Nunito', 'nunito-latin-900-normal.woff2', 900) + ff('Nunito', 'nunito-latin-ext-900-normal.woff2', 900, 'U+0100-02AF')
  + ff('Nunito', 'nunito-latin-700-normal.woff2', 700) + ff('Nunito', 'nunito-latin-ext-700-normal.woff2', 700, 'U+0100-02AF');
const x = c => GX + c * CELL, y = r => GY + r * CELL;
const frame = () => `<rect x="${GX - 8}" y="${GY - 8}" width="${COLS * CELL + 16}" height="${ROWS * CELL + 16}" fill="none" stroke="${ink}" stroke-width="5"/>
${[[GX - 8, GY - 8], [GX + COLS * CELL + 8, GY - 8], [GX - 8, GY + ROWS * CELL + 8], [GX + COLS * CELL + 8, GY + ROWS * CELL + 8]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="9" fill="${ink}"/>`).join('')}`;
const PAW = '<path d="M20 33 m-10.5 0 a10.5 11.5 0 1 0 21 0 a10.5 11.5 0 1 0 -21 0 M5.5 21 m-3.4 0 a3.4 6.5 0 1 0 6.8 0 a3.4 6.5 0 1 0 -6.8 0 M12 11 m-3.4 0 a3.4 7.5 0 1 0 6.8 0 a3.4 7.5 0 1 0 -6.8 0 M20 7.5 m-3.4 0 a3.4 7.5 0 1 0 6.8 0 a3.4 7.5 0 1 0 -6.8 0 M28 11 m-3.4 0 a3.4 7.5 0 1 0 6.8 0 a3.4 7.5 0 1 0 -6.8 0 M34.5 21 m-3.4 0 a3.4 6.5 0 1 0 6.8 0 a3.4 6.5 0 1 0 -6.8 0"/>';
const paw = (px, py, s, fill) => `<g transform="translate(${px} ${py}) scale(${s})" fill="${fill}">${PAW}</g>`;
const page = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${FONTS}</style><rect width="${W}" height="${H}" fill="#fff"/>${body}</svg>`;

function letters(highlight) {
  let s = '';
  G.forEach((row, r) => row.forEach((ch, c) => {
    const win = WIN.some(([a, b]) => a === r && b === c);
    if (highlight && win) s += `<rect x="${x(c) + 3}" y="${y(r) + 3}" width="${CELL - 6}" height="${CELL - 6}" rx="6" fill="#ffd166"/>`;
    if (ch !== ' ') s += `<text x="${x(c) + CELL / 2}" y="${y(r) + CELL / 2 + 9}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="26" fill="${ink}">${ch}</text>`;
  }));
  return s;
}
const jurnal = highlight => page(`<text x="${W / 2}" y="78" text-anchor="middle" font-family="Pacifico" font-size="40" fill="${ink}">Jurnalul secret al lui Mișșișșippi</text>
${paw(80, 40, 1.2, '#c9b9a0')}${paw(722, 40, 1.2, '#c9b9a0')}
<text x="${W / 2}" y="118" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="17" fill="#7a6a58">STRICT SECRET! Nimeni nu are voie să citească. Mai ales detectivii.</text>
${frame()}${letters(highlight)}`);

// cartonașul: gri = fereastră de decupat; liniile roșii = tăieturile în 5 piese
// tăieturile ocolesc ferestrele: merg pe marginile pătrățelelor și nu ating nicio fereastră
const isWin = (r, c) => WIN.some(([a, b]) => a === r && b === c);
function hLevels(R) {
  return Array.from({ length: COLS }, (_, c) => [R, R + 1, R - 1, R + 2, R - 2].find(L => !isWin(L - 1, c) && !isWin(L, c)));
}
function vColumn(fromRow) {
  return [12, 11, 13, 10, 14, 9].find(C => { for (let r = fromRow; r < ROWS; r++) if (isWin(r, C - 1) || isWin(r, C)) return false; return true; });
}
// câte margini ale tăieturii ating o fereastră (0 = ideal), plus câte trepte are
function cutScore(L) {
  let bad = 0, steps = 0;
  L.forEach((lv, c) => {
    if (isWin(lv - 1, c) || isWin(lv, c)) bad++;
    if (c + 1 < COLS && L[c + 1] !== lv) { steps++; for (let r = Math.min(lv, L[c + 1]); r < Math.max(lv, L[c + 1]); r++) if (isWin(r, c) || isWin(r, c + 1)) bad++; }
  });
  return bad * 100 + steps;
}
const bestCut = rows => rows.map(hLevels).sort((a, b) => cutScore(a) - cutScore(b))[0];
const CUT = (() => {
  const A = bestCut([4, 5, 6, 7]), B = bestCut([9, 10, 11, 12, 13]), C = bestCut([14, 15, 16, 17]);
  const start = Math.max(...C.slice(8, 15));
  return { A, B, C, V: vColumn(start) };
})();
function cuts() {
  const X1 = GX - 8, X2 = GX + COLS * CELL + 8, Y2 = GY + ROWS * CELL + 8;
  const hpath = L => {
    let d = `M${X1} ${y(L[0])}`;
    L.forEach((lv, c) => { d += ` L${x(c + 1)} ${y(lv)}`; if (c + 1 < COLS && L[c + 1] !== lv) d += ` L${x(c + 1)} ${y(L[c + 1])}`; });
    return d.replace(new RegExp(`L${x(COLS)} `), `L${X2} `);
  };
  const vc = CUT.V, vTop = CUT.C[vc];
  const lines = [hpath(CUT.A), hpath(CUT.B), hpath(CUT.C), `M${x(vc)} ${y(vTop)} L${x(vc)} ${Y2}`];
  return `<g fill="none" stroke="#d64541" stroke-width="3" stroke-dasharray="10 7">${lines.map(d => `<path d="${d}"/>`).join('')}</g>`;
}
// eticheta fiecărei piese: primul loc liber (3 pătrățele fără ferestre) din zona piesei
function labelSpot(r0, r1, c0, c1) {
  for (let r = Math.floor((r0 + r1) / 2); r <= r1; r++) for (let c = c0; c + 2 <= c1; c++)
    if (![0, 1, 2].some(k => isWin(r, c + k) || isWin(r - 1, c + k) || isWin(r + 1, c + k))) return [r, c];
  return [r0, c0];
}
function grila() {
  let s = `<text x="${W / 2}" y="78" text-anchor="middle" font-family="Pacifico" font-size="40" fill="${ink}">Grila detectivului</text>
<rect x="${GX - 8}" y="${GY - 8}" width="${COLS * CELL + 16}" height="${ROWS * CELL + 16}" fill="#f6f1e6"/>`;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) s += `<rect x="${x(c)}" y="${y(r)}" width="${CELL}" height="${CELL}" fill="none" stroke="#e3d9c5" stroke-width="1"/>`;
  WIN.forEach(([r, c]) => s += `<rect x="${x(c) + 3}" y="${y(r) + 3}" width="${CELL - 6}" height="${CELL - 6}" fill="#9aa0a6" stroke="${ink}" stroke-width="2"/>`);
  // numărul fiecărei piese, cu o lăbuță
  const lo = a => Math.min(...a), hi = a => Math.max(...a);
  const spots = [labelSpot(0, lo(CUT.A) - 2, 1, COLS - 1), labelSpot(hi(CUT.A) + 1, lo(CUT.B) - 2, 1, COLS - 1), labelSpot(hi(CUT.B) + 1, lo(CUT.C) - 2, 1, COLS - 1),
    labelSpot(hi(CUT.C) + 1, ROWS - 1, CUT.V + 1, COLS - 1), labelSpot(hi(CUT.C) + 1, ROWS - 1, 1, CUT.V - 1)];
  spots.forEach(([r, c], i) => s += paw(x(c) + 2, y(r) + 1, .9, '#c9b9a0') + `<text x="${x(c) + 46}" y="${y(r) + 30}" font-family="Nunito" font-weight="900" font-size="22" fill="#b9a988">${i + 1}/5</text>`);
  return page(s + frame() + cuts());
}

(async () => {
  console.log('Ferestre:', WIN.map(([r, c]) => `${G[r][c]}@${r + 1},${c + 1}`).join(' '));
  const b = await chromium.launch();
  const pages = [['jurnal.png', jurnal(false)], ['grila.png', grila()], ['solutie.png', jurnal(true)]];
  for (const [file, svg] of pages) {
    const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2480 / W });
    await p.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`); await p.waitForTimeout(300);
    await p.screenshot({ path: path.join(DIR, file), clip: { x: 0, y: 0, width: W, height: H } });
  }
  // PDF cu cele două pagini de printat, la mărime exactă (A4), ca grila să cadă fix peste litere
  const pdf = await b.newPage();
  await pdf.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block;width:210mm;height:297mm;page-break-after:always}</style></head><body>${jurnal(false)}${grila()}</body></html>`);
  await pdf.waitForTimeout(300);
  await pdf.pdf({ path: path.join(DIR, 'de-printat.pdf'), format: 'A4', printBackground: true });
  await b.close();
  console.log('gata');
})();
