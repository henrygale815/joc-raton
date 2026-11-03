// Generează codul QR cu ratonul în creion (de pe afișul WANTED, varianta C) care se uită peste pancarta cu codul.
// Rulare: node qr/genereaza-qr.js  ->  qr/qr-raton.png (cu text) și qr/qr-raton-fara-text.png
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const URL = 'https://henrygale815.github.io/joc-raton/';
const DIR = __dirname, ROOT = path.join(DIR, '..');
const TEXT = 'Scanează... dacă îndrăznești!';

// matricea codului (corecție de erori H: rezistă și cu lăbuța din mijloc)
const M = JSON.parse(execFileSync('python3', ['-c', `
import qrcode, json
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
q.add_data(${JSON.stringify(URL)}); q.make(fit=True)
print(json.dumps([[1 if c else 0 for c in r] for r in q.get_matrix()]))`]).toString());
const N = M.length;

const font = (file, range) => `@font-face{font-family:"Sancreek";src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'wanted', 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = font('sancreek-latin-400-normal.woff2') + font('sancreek-latin-ext-400-normal.woff2', 'U+0100-02AF');

function qrSvg(x0, y0, size) {
  const m = size / N, ink = '#2b2118', c = (N - 1) / 2, hole = 4.6;
  const inFinder = (r, k) => (r < 7 && k < 7) || (r < 7 && k >= N - 7) || (r >= N - 7 && k < 7);
  let s = '';
  for (let r = 0; r < N; r++) for (let k = 0; k < N; k++) {
    if (!M[r][k] || inFinder(r, k) || Math.hypot(r - c, k - c) < hole) continue;
    s += `<rect x="${(x0 + k * m + m * .02).toFixed(2)}" y="${(y0 + r * m + m * .02).toFixed(2)}" width="${(m * .96).toFixed(2)}" height="${(m * .96).toFixed(2)}" rx="${(m * .22).toFixed(2)}" fill="${ink}"/>`;
  }
  // colțurile (ochii codului): rămân pătrate, altfel unele telefoane nu mai citesc codul
  [[0, 0], [0, N - 7], [N - 7, 0]].forEach(([r, k]) => {
    const x = x0 + k * m, y = y0 + r * m;
    s += `<rect x="${(x + m * .5).toFixed(2)}" y="${(y + m * .5).toFixed(2)}" width="${(m * 6).toFixed(2)}" height="${(m * 6).toFixed(2)}" rx="${(m * .12).toFixed(2)}" fill="none" stroke="${ink}" stroke-width="${m.toFixed(2)}"/>`;
    s += `<rect x="${(x + m * 2).toFixed(2)}" y="${(y + m * 2).toFixed(2)}" width="${(m * 3).toFixed(2)}" height="${(m * 3).toFixed(2)}" rx="${(m * .12).toFixed(2)}" fill="${ink}"/>`;
  });
  // lăbuța din mijloc
  const cx = x0 + (c + .5) * m, cy = y0 + (c + .5) * m, pw = m * 6.2;
  s += `<svg x="${(cx - pw / 2).toFixed(2)}" y="${(cy - pw * .6).toFixed(2)}" width="${pw.toFixed(2)}" height="${(pw * 1.2).toFixed(2)}" viewBox="0 0 40 48"><g fill="${ink}"><ellipse cx="20" cy="33" rx="10.5" ry="11.5"/><ellipse cx="5.5" cy="21" rx="3.4" ry="6.5" transform="rotate(-35 5.5 21)"/><ellipse cx="12" cy="11" rx="3.4" ry="7.5" transform="rotate(-14 12 11)"/><ellipse cx="20" cy="7.5" rx="3.4" ry="7.5"/><ellipse cx="28" cy="11" rx="3.4" ry="7.5" transform="rotate(14 28 11)"/><ellipse cx="34.5" cy="21" rx="3.4" ry="6.5" transform="rotate(35 34.5 21)"/></g></svg>`;
  return s;
}

(async () => {
  const b = await chromium.launch();
  // ratonul în creion de pe afișul WANTED (varianta C), care se uită peste marginea pancartei
  const img = fs.readFileSync(path.join(ROOT, 'wanted', 'sursa', 'raton-C.png')), iw = img.readUInt32BE(16), ih = img.readUInt32BE(20);
  const RW = 400, RH = RW * ih / iw, PY = Math.round(RH * .725), PH = 520, H0 = PY + PH + 24;
  const make = withText => {
    const H = withText ? H0 + 70 : H0;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${H}" width="600" height="${H}"><style>${FONTS}</style>
<rect width="600" height="${H}" fill="#fff"/>
<image href="data:image/png;base64,${img.toString('base64')}" x="${300 - RW / 2}" y="0" width="${RW}" height="${RH.toFixed(1)}"/>
<rect x="40" y="${PY}" width="520" height="${PH}" rx="30" fill="#fff" stroke="#2b2118" stroke-width="8"/>
${qrSvg(90, PY + 50, 420)}
${withText ? `<text x="300" y="${H - 26}" text-anchor="middle" font-family="Sancreek" font-size="38" fill="#2b2118">${TEXT}</text>` : ''}
</svg>`;
  };
  for (const [withText, file] of [[true, 'qr-raton.png'], [false, 'qr-raton-fara-text.png']]) {
    const svg = make(withText), H = withText ? H0 + 70 : H0;
    const q = await b.newPage({ viewport: { width: 600, height: H }, deviceScaleFactor: 4 });
    await q.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`); await q.waitForTimeout(300);
    await q.screenshot({ path: path.join(DIR, file), clip: { x: 0, y: 0, width: 600, height: H } });
  }
  await b.close();
  console.log('gata', N, 'module');
})();
