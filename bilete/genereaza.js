// Biletele printate din traseu.
//   oglinda.pdf: biletul de la Yellow Submarine. Sus: „Citește-mă în オグリンダ!” (oglindă, în katakana);
//                dedesubt, textul scris în oglindă, care se citește doar ținând biletul în fața unei oglinzi.
// Rulare: node bilete/genereaza.js  ->  bilete/oglinda.pdf + oglinda.png (A4 cu două bilete: unul de rezervă)
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

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2480 / W });
  await p.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`); await p.waitForTimeout(300);
  await p.screenshot({ path: path.join(DIR, 'oglinda.png'), clip: { x: 0, y: 0, width: W, height: H } });
  const q = await b.newPage();
  await q.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block;width:210mm;height:297mm}</style></head><body>${svg}</body></html>`);
  await q.waitForTimeout(300);
  await q.pdf({ path: path.join(DIR, 'oglinda.pdf'), format: 'A4', printBackground: true });
  await b.close(); console.log('gata');
})();
