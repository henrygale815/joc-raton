// Biletele printate din traseu.
//   oglinda.pdf: biletul de la Yellow Submarine. Sus: „Citește-mă în オグリンダ!” (oglindă, în katakana);
//                dedesubt, textul scris în oglindă, care se citește doar ținând biletul în fața unei oglinzi.
//   semn-intrebare.pdf: indiciul de sub desenul de pe frigider (se citește cu lupa). Față: un semn de întrebare
//                al cărui punct e făcut din text de 2,5 pt; colțurile au text de 2 pt care îl plimbă din colț în colț.
//                Spate: la mijloc, indiciul adevărat.
// Rulare: node bilete/genereaza.js  ->  bilete/oglinda.pdf, semn-intrebare.pdf (+ .png pentru previzualizare)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const W = 840, H = 1188, ink = '#2f2a3a';
const OGLINDA = ['URMĂTORUL INDICIU', 'SE AFLĂ ASCUNS', 'SUB DESENUL', 'DE PE FRIGIDER!'];

const ff = (fam, file, weight, range) => `@font-face{font-family:"${fam}";font-weight:${weight};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'murdoku', 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = ff('Nunito', 'nunito-latin-900-normal.woff2', 900) + ff('Nunito', 'nunito-latin-ext-900-normal.woff2', 900, 'U+0100-02AF')
  + ff('Pacifico', 'pacifico-latin-400-normal.woff2', 400) + ff('Pacifico', 'pacifico-latin-ext-400-normal.woff2', 400, 'U+0100-02AF');
const PAW = '<ellipse cx="20" cy="33" rx="10.5" ry="11.5"/><ellipse cx="5.5" cy="21" rx="3.4" ry="6.5" transform="rotate(-35 5.5 21)"/><ellipse cx="12" cy="11" rx="3.4" ry="7.5" transform="rotate(-14 12 11)"/><ellipse cx="20" cy="7.5" rx="3.4" ry="7.5"/><ellipse cx="28" cy="11" rx="3.4" ry="7.5" transform="rotate(14 28 11)"/><ellipse cx="34.5" cy="21" rx="3.4" ry="6.5" transform="rotate(35 34.5 21)"/>';
const paw = (x, y, s, rot, op = .5) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-20 -24)" fill="#5b3a1e" opacity="${op}">${PAW}</g>`;

// un bilet ocupă o jumătate de A4 (A5 culcat)
function bilet(y0) {
  let s = `<rect x="30" y="${y0 + 30}" width="${W - 60}" height="${H / 2 - 60}" rx="18" fill="#fffaf0" stroke="${ink}" stroke-width="3"/>`;
  s += `<text x="${W / 2}" y="${y0 + 112}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="46" fill="${ink}">Citește-mă în <tspan font-family="IPAGothic" font-weight="700">オグリンダ</tspan>!</text>`;
  // textul în oglindă: oglindit pe orizontală în jurul centrului paginii
  s += `<g transform="translate(${W} 0) scale(-1 1)">${OGLINDA.map((t, i) => `<text x="${W / 2}" y="${y0 + 210 + i * 66}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="54" fill="#6b3fa0">${t}</text>`).join('')}</g>`;
  s += `<text x="${W - 80}" y="${y0 + H / 2 - 58}" text-anchor="end" font-family="Pacifico" font-size="34" fill="#6b3fa0">— M.</text>`;
  s += paw(W - 70, y0 + H / 2 - 74, 1, 15, .8) + paw(80, y0 + 80, .9, -20, .3) + paw(110, y0 + 130, .9, -10, .3);
  return s;
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><style>${FONTS}</style><rect width="${W}" height="${H}" fill="#fff"/>
${bilet(0)}${bilet(H / 2)}<path d="M10 ${H / 2} H${W - 10}" stroke="#b0413e" stroke-width="2" stroke-dasharray="10 8"/></svg>`;

// ---------- semnul de întrebare (în milimetri; 1 pt = 0,3528 mm) ----------
const PT = .3528, MICRO = 2.5 * PT, COLT = 2 * PT, SANS = 'Liberation Sans';
const PUNCT = { ha: 'HA ', mesaj: 'INDICIUL SE AFLĂ ÎN COLȚUL DE SUS STÂNGA! ' };
const COLTURI = {
  ss: ['NU AICI! HA-HA!', 'MERGI ÎN COLȚUL DE JOS DREAPTA.'],
  jd: ['NICI AICI!', 'ÎNCEARCĂ ÎN COLȚUL DE SUS DREAPTA.'],
  sd: ['APROAPE...', 'ACUM COLȚUL DE JOS STÂNGA!'],
  js: ['GLUMEAM!', 'INDICIUL E DE FAPT PE SPATE, LA MIJLOC!'],
};
const SPATE = ['URMĂTORUL INDICIU ESTE LIPIT', 'SUB MĂSUȚA TA DIN SUFRAGERIE!', '— M.'];
// textul din „punct”: rânduri tăiate pe cerc; prima jumătate HA HA, apoi mesajul repetat
function punct(cx, cy, r) {
  const lh = MICRO * 1.15, n = Math.floor(2 * r / lh), cw = MICRO * .66;
  const ha = ['HA'], msg = PUNCT.mesaj.trim().split(' ');
  let out = '', k = 0;
  for (let i = 0; i < n; i++) {
    const y = cy - r + lh * (i + .8), dy = y - cy, half = Math.sqrt(Math.max(0, r * r - dy * dy));
    if (half < 2) continue;
    // doar cuvinte întregi: HA HA pe prima jumătate, apoi mesajul curge de pe un rând pe altul
    const words = i < n / 2 ? ha : msg, max = 2 * half / cw, line = [];
    while (true) {
      const w = words[(i < n / 2 ? 0 : k) % words.length], len = line.join(' ').length + (line.length ? 1 : 0) + w.length;
      if (len > max) break;
      line.push(w); if (i >= n / 2) k++;
    }
    if (!line.length) continue;
    const txt = line.join(' '), full = txt.length * cw >= 2 * half * .82;
    out += `<text x="${cx}" y="${y.toFixed(2)}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="${MICRO.toFixed(3)}"${full ? ` textLength="${(2 * half * .96).toFixed(2)}" lengthAdjust="spacing"` : ''} fill="#111">${txt}</text>`;
  }
  return out;
}
const corner = (lines, x, y, anchor) => lines.map((t, i) => `<text x="${x}" y="${(y + i * COLT * 1.25).toFixed(2)}" text-anchor="${anchor}" font-family="${SANS}" font-weight="700" font-size="${COLT.toFixed(3)}" fill="#111">${t}</text>`).join('');
const A4 = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm"><rect width="210" height="297" fill="#fff"/>${body}</svg>`;
function semnFata() {
  // cârligul semnului, desenat; punctul e textul minuscul
  const hook = `<path d="M62 92 Q62 48 105 48 Q148 48 148 90 Q148 118 120 130 Q105 137 105 158 V170" fill="none" stroke="#2f2a3a" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`;
  return A4(hook + punct(105, 210, 15)
    + corner(COLTURI.ss, 12, 14, 'start') + corner(COLTURI.sd, 198, 14, 'end')
    + corner(COLTURI.js, 12, 283, 'start') + corner(COLTURI.jd, 198, 283, 'end'));
}
const semnSpate = () => A4(SPATE.map((t, i) => `<text x="105" y="${(148 + i * MICRO * 1.3).toFixed(2)}" text-anchor="middle" font-family="${SANS}" font-weight="700" font-size="${MICRO.toFixed(3)}" fill="#111">${t}</text>`).join(''));

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2480 / W });
  await p.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(DIR, 'oglinda.png'), clip: { x: 0, y: 0, width: W, height: H } });
  const q = await b.newPage();
  await q.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block;width:210mm;height:297mm}</style></head><body>${svg}</body></html>`);
  await q.waitForTimeout(300);
  await q.pdf({ path: path.join(DIR, 'oglinda.pdf'), format: 'A4', printBackground: true });
  // semnul de întrebare: 2 pagini (față, spate), vectorial, ca textul mic să rămână clar
  const sq = await b.newPage();
  await sq.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block;page-break-after:always}</style></head><body>${semnFata()}${semnSpate()}</body></html>`);
  await sq.waitForTimeout(300);
  await sq.pdf({ path: path.join(DIR, 'semn-intrebare.pdf'), format: 'A4', printBackground: true });
  const pv = await b.newPage({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 4 });
  await pv.setContent(`<!doctype html><html><body style="margin:0">${semnFata().replace('width="210mm" height="297mm"', 'width="794" height="1123"')}</body></html>`); await pv.waitForTimeout(300);
  await pv.screenshot({ path: path.join(DIR, 'semn-intrebare.png') });
  await b.close(); console.log('gata');
})();
