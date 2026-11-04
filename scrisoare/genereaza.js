// Foaie albă A4 cu urme de lăbuțe de raton pe margini, pentru bucata de scrisoare a lui Mișșișșippi (scrisă de mână).
// Rulare: node scrisoare/genereaza.js  ->  scrisoare/hartie-labute.pdf + hartie-labute.png
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, W = 840, H = 1188;
const PAW = '<ellipse cx="20" cy="33" rx="10.5" ry="11.5"/><ellipse cx="5.5" cy="21" rx="3.4" ry="6.5" transform="rotate(-35 5.5 21)"/><ellipse cx="12" cy="11" rx="3.4" ry="7.5" transform="rotate(-14 12 11)"/><ellipse cx="20" cy="7.5" rx="3.4" ry="7.5"/><ellipse cx="28" cy="11" rx="3.4" ry="7.5" transform="rotate(14 28 11)"/><ellipse cx="34.5" cy="21" rx="3.4" ry="6.5" transform="rotate(35 34.5 21)"/>';
// o dâră de urme: pași alternativi stânga/dreapta de-a lungul unei linii
function trail(x0, y0, x1, y1, n, op) {
  let s = ''; const a = Math.atan2(y1 - y0, x1 - x0), rot = a * 180 / Math.PI + 90;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1), side = i % 2 ? 1 : -1;
    const x = x0 + (x1 - x0) * t - Math.sin(a) * 14 * side, y = y0 + (y1 - y0) * t + Math.cos(a) * 14 * side;
    s += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)}) translate(-20 -24)" fill="#5b3a1e" opacity="${op}">${PAW}</g>`;
  }
  return s;
}
const body = trail(-20, 140, 330, 40, 7, .55) + trail(560, 1170, 860, 960, 7, .55) + trail(820, 330, 760, 620, 4, .35) + trail(30, 760, 70, 1000, 4, .35);
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="#fff"/>${body}</svg>`;
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2480 / W });
  await p.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`); await p.waitForTimeout(200);
  await p.screenshot({ path: path.join(DIR, 'hartie-labute.png'), clip: { x: 0, y: 0, width: W, height: H } });
  const q = await b.newPage();
  await q.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}svg{display:block;width:210mm;height:297mm}</style></head><body>${svg}</body></html>`);
  await q.pdf({ path: path.join(DIR, 'hartie-labute.pdf'), format: 'A4', printBackground: true });
  await b.close(); console.log('gata');
})();
