// Actele detectivului: legitimația (fără poză) și diploma de detectiv junior.
//   legitimatie.pdf: A4 cu 4 legitimații 85,6×54 mm (mărimea unui card). Fiecare are fața și spatele alăturate:
//                    se decupează, se îndoaie pe linia din mijloc și se lipește, apoi intră în ecuson.
//   diploma.pdf:     A4 orizontal.
// Rulare: node acte/genereaza.js  ->  acte/legitimatie.pdf, acte/diploma.pdf (+ .png pentru previzualizare)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname, ROOT = path.join(DIR, '..');
const ink = '#2f2a3a', navy = '#2f4a63', gold = '#e2b33c', goldD = '#b8891f';
const ff = (fam, dir, file, weight, range) => `@font-face{font-family:"${fam}";font-weight:${weight};src:url(data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, dir, 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const EXT = 'U+0100-02AF';
const FONTS = ff('Nunito', 'murdoku', 'nunito-latin-900-normal.woff2', 900) + ff('Nunito', 'murdoku', 'nunito-latin-ext-900-normal.woff2', 900, EXT)
  + ff('Nunito', 'murdoku', 'nunito-latin-700-normal.woff2', 700) + ff('Nunito', 'murdoku', 'nunito-latin-ext-700-normal.woff2', 700, EXT)
  + ff('Pacifico', 'murdoku', 'pacifico-latin-400-normal.woff2', 400) + ff('Pacifico', 'murdoku', 'pacifico-latin-ext-400-normal.woff2', 400, EXT)
  + ff('Sancreek', 'wanted', 'sancreek-latin-400-normal.woff2', 400) + ff('Sancreek', 'wanted', 'sancreek-latin-ext-400-normal.woff2', 400, EXT);
const PAW = '<ellipse cx="20" cy="33" rx="10.5" ry="11.5"/><ellipse cx="5.5" cy="21" rx="3.4" ry="6.5" transform="rotate(-35 5.5 21)"/><ellipse cx="12" cy="11" rx="3.4" ry="7.5" transform="rotate(-14 12 11)"/><ellipse cx="20" cy="7.5" rx="3.4" ry="7.5"/><ellipse cx="28" cy="11" rx="3.4" ry="7.5" transform="rotate(14 28 11)"/><ellipse cx="34.5" cy="21" rx="3.4" ry="6.5" transform="rotate(35 34.5 21)"/>';
const paw = (x, y, size, fill, rot = 0) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${size / 48}) translate(-20 -24)" fill="${fill}">${PAW}</g>`;
const star = (cx, cy, r1, r2, n = 5) => { const p = []; for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = -Math.PI / 2 + i * Math.PI / n; p.push(`${(cx + Math.cos(a) * r).toFixed(2)},${(cy + Math.sin(a) * r).toFixed(2)}`); } return p.join(' '); };
// insigna: stea aurie cu o lupă, iar în lupă o lăbuță
const badge = (cx, cy, r) => `<polygon points="${star(cx, cy, r, r * .62, 6)}" fill="${gold}" stroke="${goldD}" stroke-width="${r * .05}" stroke-linejoin="round"/>
<circle cx="${cx}" cy="${cy}" r="${r * .5}" fill="#fff8e1" stroke="${goldD}" stroke-width="${r * .04}"/>
<circle cx="${cx - r * .07}" cy="${cy - r * .07}" r="${r * .27}" fill="#cfe8f7" stroke="${ink}" stroke-width="${r * .06}"/>
<path d="M${cx + r * .12} ${cy + r * .12} L${cx + r * .32} ${cy + r * .32}" stroke="${ink}" stroke-width="${r * .1}" stroke-linecap="round"/>${paw(cx - r * .07, cy - r * .07, r * .3, ink)}`;

// ---------- legitimația: 85,6 × 54 mm, fața (stânga) + spatele (dreapta) ----------
const CW = 85.6, CH = 54;
function front(x, y) {
  return `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="3" fill="#fbf6ea" stroke="${ink}" stroke-width=".4"/>
<path d="M${x + 3} ${y} H${x + CW - 3} Q${x + CW} ${y} ${x + CW} ${y + 3} V${y + 11} H${x} V${y + 3} Q${x} ${y} ${x + 3} ${y} Z" fill="${navy}"/>
<text x="${x + CW / 2}" y="${y + 7.6}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="4.5" letter-spacing=".2" fill="#fff">LEGITIMAȚIE DE DETECTIV</text>
${badge(x + 15.5, y + 30, 11)}
${[['NUME', 'DAVID', 5.2], ['GRAD', 'Ucenic detectiv', 3.6], ['NR.', '001', 3.6], ['VALABILĂ', 'până îl prinde pe Mișșișșippi', 2.9]].map(([l, v, s], i) =>
    `<text x="${x + 31}" y="${y + 17 + i * 8.2}" font-family="Nunito" font-weight="900" font-size="2" letter-spacing=".2" fill="#8a7c6a">${l}</text><text x="${x + 31}" y="${y + 21.2 + i * 8.2}" font-family="Nunito" font-weight="900" font-size="${s}" fill="${ink}">${v}</text>`).join('')}
<path d="M${x + 31} ${y + 50} H${x + CW - 6}" stroke="${ink}" stroke-width=".25"/><text x="${x + 31}" y="${y + 52.6}" font-family="Nunito" font-weight="700" font-size="1.9" fill="#8a7c6a">Semnătura detectivului</text>`;
}
function back(x, y) {
  let s = `<rect x="${x}" y="${y}" width="${CW}" height="${CH}" rx="3" fill="#fbf6ea" stroke="${ink}" stroke-width=".4"/>`;
  s += `<text x="${x + 6}" y="${y + 9}" font-family="Nunito" font-weight="900" font-size="2.2" letter-spacing=".2" fill="#8a7c6a">ECHIPAMENT</text><text x="${x + 6}" y="${y + 13.2}" font-family="Nunito" font-weight="900" font-size="3.3" fill="${ink}">lupă · lanternă UV</text>`;
  s += `<text x="${x + 6}" y="${y + 19.5}" font-family="Nunito" font-weight="900" font-size="2.2" letter-spacing=".2" fill="#8a7c6a">ABILITĂȚI</text><text x="${x + 6}" y="${y + 23.7}" font-family="Nunito" font-weight="900" font-size="3.3" fill="${ink}">citit în oglindă · coduri secrete</text>`;
  s += `<text x="${x + 6}" y="${y + 30.5}" font-family="Nunito" font-weight="900" font-size="2.2" letter-spacing=".2" fill="#8a7c6a">SIGILII</text>`;
  for (let i = 0; i < 5; i++) { const cx = x + 11 + i * 15.5; s += `<circle cx="${cx}" cy="${y + 38}" r="5.4" fill="#fff" stroke="${ink}" stroke-width=".35" stroke-dasharray="1 .8"/><text x="${cx}" y="${y + 39.2}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="3.2" fill="#d9cfbd">${i + 1}</text>`; }
  s += `<text x="${x + CW / 2}" y="${y + 49.5}" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="2.2" fill="#8a7c6a">Dacă o găsești, returneaz-o detectivului David.</text><text x="${x + CW / 2}" y="${y + 52.3}" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="2.2" fill="#b0413e">NU ratonului!</text>`;
  return s + paw(x + CW - 8, y + 7.5, 7, '#5b3a1e', 15);
}
function legitimatii() {
  const x0 = (210 - 2 * CW) / 2, gap = 13;
  let s = '';
  for (let i = 0; i < 4; i++) {
    const y = 16 + i * (CH + gap);
    s += front(x0, y) + back(x0 + CW, y);
    s += `<path d="M${x0 + CW} ${y - 3} V${y + CH + 3}" stroke="#b0413e" stroke-width=".35" stroke-dasharray="2 1.5"/>`;
  }
  s += `<text x="105" y="290" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="3" fill="#a09684">Decupează pe contur · îndoaie pe linia roșie din mijloc · lipește cele două fețe</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 297" width="210mm" height="297mm"><style>${FONTS}</style><rect width="210" height="297" fill="#fff"/>${s}</svg>`;
}

// ---------- diploma: A4 orizontal ----------
function diploma() {
  const W = 297, H = 210;
  let s = `<rect width="${W}" height="${H}" fill="#fffdf7"/>
<rect x="9" y="9" width="${W - 18}" height="${H - 18}" fill="none" stroke="${navy}" stroke-width="2.2"/>
<rect x="13" y="13" width="${W - 26}" height="${H - 26}" fill="none" stroke="${gold}" stroke-width=".9"/>
<rect x="15.5" y="15.5" width="${W - 31}" height="${H - 31}" fill="none" stroke="${navy}" stroke-width=".35"/>`;
  [[22, 22, 135], [W - 22, 22, -135], [22, H - 22, 45], [W - 22, H - 22, -45]].forEach(([x, y, r]) => s += paw(x, y, 8, gold, r));
  s += `<text x="${W / 2}" y="34" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="4.2" letter-spacing="1.2" fill="#8a7c6a">AGENȚIA DE DETECTIVI</text>
<text x="${W / 2}" y="60" text-anchor="middle" font-family="Sancreek" font-size="26" fill="${navy}">DIPLOMĂ</text>
<text x="${W / 2}" y="74" text-anchor="middle" font-family="Sancreek" font-size="11" letter-spacing=".5" fill="${ink}">DE DETECTIV JUNIOR</text>
<text x="${W / 2}" y="91" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="5.2" fill="#6a5f50">Se acordă lui</text>
<text x="${W / 2}" y="112" text-anchor="middle" font-family="Pacifico" font-size="20" fill="${navy}">David</text>
<path d="M98 118 Q148.5 112 199 118" fill="none" stroke="${gold}" stroke-width=".8"/>`;
  ['pentru curajul, isteția și răbdarea cu care a descifrat toate indiciile,', 'a învins robotul Mecha-Mișșișșippi 3000 și aproape l-a prins', 'pe Credibilul Raton Mișșișșippi.'].forEach((t, i) =>
    s += `<text x="${W / 2}" y="${131 + i * 7.4}" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="5" fill="${ink}">${t}</text>`);
  // semnături
  s += `<path d="M38 177 H100 M197 177 H259" stroke="${ink}" stroke-width=".35"/>
<text x="69" y="183" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="3.6" fill="#8a7c6a">Data</text>
<text x="228" y="183" text-anchor="middle" font-family="Nunito" font-weight="700" font-size="3.6" fill="#8a7c6a">Șeful agenției</text>`;
  // sigiliul: rozetă cu panglici, stea aurie și lăbuță
  const cx = W / 2, cy = 172;
  s += `<path d="M${cx - 9} ${cy + 8} L${cx - 14} ${cy + 26} L${cx - 8} ${cy + 22} L${cx - 4} ${cy + 28} L${cx - 1} ${cy + 10} Z" fill="#c0392b"/><path d="M${cx + 9} ${cy + 8} L${cx + 14} ${cy + 26} L${cx + 8} ${cy + 22} L${cx + 4} ${cy + 28} L${cx + 1} ${cy + 10} Z" fill="#c0392b"/>
<polygon points="${star(cx, cy, 15, 12.5, 24)}" fill="#c0392b"/><circle cx="${cx}" cy="${cy}" r="10.5" fill="${gold}" stroke="${goldD}" stroke-width=".6"/>${paw(cx, cy, 11, ink)}`;
  s += `<text x="33" y="${H - 19}" font-family="Pacifico" font-size="4.4" fill="#6b3fa0">P.S. Data viitoare poate mă prinzi! — M.</text>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"><style>${FONTS}</style>${s}</svg>`;
}

(async () => {
  const b = await chromium.launch();
  const out = [['legitimatie', legitimatii(), 'A4', false], ['diploma', diploma(), 'A4', true]];
  for (const [name, svg, fmt, land] of out) {
    const p = await b.newPage();
    await p.setContent(`<!doctype html><html><head><style>@page{size:A4 ${land ? 'landscape' : 'portrait'};margin:0}html,body{margin:0}svg{display:block}</style></head><body>${svg}</body></html>`);
    await p.waitForTimeout(300);
    await p.pdf({ path: path.join(DIR, name + '.pdf'), format: fmt, landscape: land, printBackground: true });
    const [w, h] = land ? [1123, 794] : [794, 1123];
    const q = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 });
    await q.setContent(`<!doctype html><html><body style="margin:0">${svg.replace(/width="\d+mm" height="\d+mm"/, `width="${w}" height="${h}"`)}</body></html>`); await q.waitForTimeout(300);
    await q.screenshot({ path: path.join(DIR, name + '.png') });
  }
  await b.close(); console.log('gata');
})();
