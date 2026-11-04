// Codurile QR cu ratonii în creion (de pe afișele WANTED) care se uită peste pancarta cu codul.
//   joc:   ratonul C, ramă maro, lăbuță în mijloc       -> jocul (index.html)
//   mesaj: ratonul B, ramă mov, notă muzicală în mijloc -> mesajul audio (mesaj.html), pentru boxa-raton
// Rulare: node qr/genereaza-qr.js  ->  qr/qr-raton*.png, qr-mesaj*.png + câte o foaie A4 de printat (1 mare + 2 mici)
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const SITE = 'https://henrygale815.github.io/joc-raton/';
const DIR = __dirname, ROOT = path.join(DIR, '..');
const DESIGNS = {
  joc: { url: SITE, raton: 'raton-C.png', cut: .725, ink: '#2b2118', frame: '#2b2118', center: 'paw', dots: false,
    text: 'Scanează... dacă îndrăznești!', files: ['qr-raton.png', 'qr-raton-fara-text.png', 'qr-raton-de-printat-A4.pdf'] },
  mesaj: { url: SITE + 'mesaj.html', raton: 'raton-B.png', cut: .74, ink: '#2a1f3d', frame: '#6b3fa0', center: 'note', dots: true, notes: true, phones: { l: [148, 208], r: [452, 208], top: 34 },
    text: 'Am un mesaj pentru tine!', files: ['qr-mesaj.png', 'qr-mesaj-fara-text.png', 'qr-mesaj-de-printat-A4.pdf'] },
};

// matricea codului (corecție de erori H: rezistă și cu desenul din mijloc)
const matrix = url => JSON.parse(execFileSync('python3', ['-c', `
import qrcode, json
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_H, border=0)
q.add_data(${JSON.stringify(url)}); q.make(fit=True)
print(json.dumps([[1 if c else 0 for c in r] for r in q.get_matrix()]))`]).toString());

const font = (file, range) => `@font-face{font-family:"Sancreek";src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'wanted', 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const FONTS = font('sancreek-latin-400-normal.woff2') + font('sancreek-latin-ext-400-normal.woff2', 'U+0100-02AF');
const PAW = '<ellipse cx="20" cy="33" rx="10.5" ry="11.5"/><ellipse cx="5.5" cy="21" rx="3.4" ry="6.5" transform="rotate(-35 5.5 21)"/><ellipse cx="12" cy="11" rx="3.4" ry="7.5" transform="rotate(-14 12 11)"/><ellipse cx="20" cy="7.5" rx="3.4" ry="7.5"/><ellipse cx="28" cy="11" rx="3.4" ry="7.5" transform="rotate(14 28 11)"/><ellipse cx="34.5" cy="21" rx="3.4" ry="6.5" transform="rotate(35 34.5 21)"/>';
// notă muzicală dublă (optimi legate), în cutia 0..40 x 0..48
const NOTE = '<path d="M14 6 L38 1 V33" fill="none" stroke-width="4.5" stroke-linejoin="round"/><path d="M14 6 V38" fill="none" stroke-width="4.5"/><path d="M14 6 L38 1 V9 L14 14 Z"/><ellipse cx="8.5" cy="39" rx="7.5" ry="5.6" transform="rotate(-22 8.5 39)"/><ellipse cx="32.5" cy="34" rx="7.5" ry="5.6" transform="rotate(-22 32.5 34)"/>';
const NOTE1 = '<path d="M16 4 V36" fill="none" stroke-width="4.5"/><path d="M16 4 Q30 10 30 22 Q26 14 16 13 Z"/><ellipse cx="10.5" cy="37" rx="7.5" ry="5.6" transform="rotate(-22 10.5 37)"/>';

function qrSvg(M, d, x0, y0, size) {
  const N = M.length, m = size / N, ink = d.ink, c = (N - 1) / 2, hole = 4.6;
  const inFinder = (r, k) => (r < 7 && k < 7) || (r < 7 && k >= N - 7) || (r >= N - 7 && k < 7);
  let s = '';
  for (let r = 0; r < N; r++) for (let k = 0; k < N; k++) {
    if (!M[r][k] || inFinder(r, k) || Math.hypot(r - c, k - c) < hole) continue;
    const x = x0 + k * m, y = y0 + r * m;
    s += d.dots
      ? `<circle cx="${(x + m / 2).toFixed(2)}" cy="${(y + m / 2).toFixed(2)}" r="${(m * .5).toFixed(2)}" fill="${ink}"/>`
      : `<rect x="${(x + m * .02).toFixed(2)}" y="${(y + m * .02).toFixed(2)}" width="${(m * .96).toFixed(2)}" height="${(m * .96).toFixed(2)}" rx="${(m * .22).toFixed(2)}" fill="${ink}"/>`;
  }
  // colțurile (ochii codului): rămân pătrate, altfel unele telefoane nu mai citesc codul
  const eye = d.frame;
  [[0, 0], [0, N - 7], [N - 7, 0]].forEach(([r, k]) => {
    const x = x0 + k * m, y = y0 + r * m;
    s += `<rect x="${(x + m * .5).toFixed(2)}" y="${(y + m * .5).toFixed(2)}" width="${(m * 6).toFixed(2)}" height="${(m * 6).toFixed(2)}" rx="${(m * .12).toFixed(2)}" fill="none" stroke="${eye}" stroke-width="${m.toFixed(2)}"/>`;
    s += `<rect x="${(x + m * 2).toFixed(2)}" y="${(y + m * 2).toFixed(2)}" width="${(m * 3).toFixed(2)}" height="${(m * 3).toFixed(2)}" rx="${(m * .12).toFixed(2)}" fill="${eye}"/>`;
  });
  // desenul din mijloc
  const cx = x0 + (c + .5) * m, cy = y0 + (c + .5) * m, pw = m * 6.2;
  const art = d.center === 'note' ? `<g fill="${d.frame}" stroke="${d.frame}">${NOTE}</g>` : `<g fill="${ink}">${PAW}</g>`;
  s += `<svg x="${(cx - pw / 2).toFixed(2)}" y="${(cy - pw * .6).toFixed(2)}" width="${pw.toFixed(2)}" height="${(pw * 1.2).toFixed(2)}" viewBox="0 0 40 48">${art}</svg>`;
  return s;
}

const note = (x, y, s, rot, which, col, op = 1) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s}) translate(-20 -24)" fill="${col}" stroke="${col}" opacity="${op}">${which}</g>`;

function design(d, M, withText) {
  const img = fs.readFileSync(path.join(ROOT, 'wanted', 'sursa', d.raton)), iw = img.readUInt32BE(16), ih = img.readUInt32BE(20);
  const RW = 400, RH = RW * ih / iw, PY = Math.round(RH * d.cut), PH = 520, H0 = PY + PH + 24, H = withText ? H0 + 70 : H0;
  const deco = d.notes ? note(70, 110, 1.5, -18, NOTE, d.frame) + note(78, 250, .95, 12, NOTE1, d.frame, .75) + note(530, 85, 1.2, 16, NOTE1, d.frame)
    + note(528, 225, 1.35, -10, NOTE, d.frame, .8) : '';
  // căștile ratonului muzical
  const H_ = d.phones, ph = H_ ? `<g fill="${d.frame}" stroke="${d.ink}" stroke-width="3">
<path d="M${H_.l[0]} ${H_.l[1] - 20} C${H_.l[0] - 8} ${H_.top - 40} ${H_.r[0] + 8} ${H_.top - 40} ${H_.r[0]} ${H_.r[1] - 20}" fill="none" stroke="${d.frame}" stroke-width="15" stroke-linecap="round"/>
<path d="M${H_.l[0]} ${H_.l[1] - 20} C${H_.l[0] - 8} ${H_.top - 40} ${H_.r[0] + 8} ${H_.top - 40} ${H_.r[0]} ${H_.r[1] - 20}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="4" stroke-linecap="round"/>
${[H_.l, H_.r].map(([x, y]) => `<rect x="${x - 21}" y="${y - 38}" width="42" height="76" rx="20"/><rect x="${x - 11}" y="${y - 26}" width="22" height="52" rx="11" fill="#9b72cf" stroke="none"/>`).join('')}</g>` : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 ${H}" width="600" height="${H}"><style>${FONTS}</style>
<rect width="600" height="${H}" fill="#fff"/>${deco}
<defs><linearGradient id="fade"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".06" stop-color="#fff"/><stop offset=".94" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
<mask id="edge"><rect x="${300 - RW / 2}" y="0" width="${RW}" height="${RH.toFixed(1)}" fill="url(#fade)"/></mask></defs>
<image href="data:image/png;base64,${img.toString('base64')}" x="${300 - RW / 2}" y="0" width="${RW}" height="${RH.toFixed(1)}"${d.notes ? ' mask="url(#edge)"' : ''}/>${ph}
<rect x="40" y="${PY}" width="520" height="${PH}" rx="30" fill="#fff" stroke="${d.frame}" stroke-width="8"/>
${d.notes ? `<rect x="54" y="${PY + 14}" width="492" height="${PH - 28}" rx="20" fill="none" stroke="${d.frame}" stroke-width="2.5" stroke-dasharray="3 9" stroke-linecap="round"/>` : ''}
${qrSvg(M, d, 90, PY + 50, 420)}
${withText ? `<text x="300" y="${H - 26}" text-anchor="middle" font-family="Sancreek" font-size="38" fill="${d.notes ? d.frame : d.ink}">${d.text}</text>` : ''}
</svg>`;
  return { svg, H };
}

(async () => {
  const b = await chromium.launch();
  for (const [name, d] of Object.entries(DESIGNS)) {
    const M = matrix(d.url);
    for (const [withText, file] of [[true, d.files[0]], [false, d.files[1]]]) {
      const { svg, H } = design(d, M, withText);
      const q = await b.newPage({ viewport: { width: 600, height: H }, deviceScaleFactor: 4 });
      await q.setContent(`<!doctype html><html><body style="margin:0">${svg}</body></html>`); await q.waitForTimeout(300);
      await q.screenshot({ path: path.join(DIR, file), clip: { x: 0, y: 0, width: 600, height: H } });
      await q.close();
    }
    // foaia A4: un cod mare (7 cm) și două mai mici (5 cm), cu linie de tăiere
    const png = 'data:image/png;base64,' + fs.readFileSync(path.join(DIR, d.files[1])).toString('base64');
    const p = await b.newPage();
    await p.setContent(`<!doctype html><html><head><style>@page{size:A4;margin:0}html,body{margin:0}
.page{width:210mm;height:297mm;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10mm;font-family:sans-serif}
.cut{border:1px dashed #bbb;padding:4mm}.row{display:flex;gap:10mm}img{display:block}.big img{width:7cm}.small img{width:5cm}p{color:#999;font-size:9pt;margin:0}</style></head><body><div class="page">
<div class="cut big"><img src="${png}"></div>
<div class="row"><div class="cut small"><img src="${png}"></div><div class="cut small"><img src="${png}"></div></div>
<p>Taie pe linia punctată. Mare: 7 cm lățime · rezerve: 5 cm lățime. Printează la „Dimensiune reală / 100%”.</p>
</div></body></html>`);
    await p.waitForTimeout(400);
    await p.pdf({ path: path.join(DIR, d.files[2]), format: 'A4', printBackground: true });
    await p.close();
    console.log(name, M.length, 'module ->', d.url);
  }
  await b.close();
})();
