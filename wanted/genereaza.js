// Generează afișul WANTED (varianta A, desenată în stil creion / cărbune).
// Rulare: node wanted/genereaza.js  ->  afis-wanted-A.svg, afis-wanted-A-print.jpg (A4, 300 DPI), afis-wanted-A-mic.jpg (pentru joc)
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = __dirname;
const W = 840, H = 1188; // proporții A4

// număr aleator cu sămânță fixă, ca afișul să iasă la fel de fiecare dată
let seed = 7;
const rnd = () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const R = (a, b) => a + rnd() * (b - a);
const f1 = n => n.toFixed(1);

const font = (fam, file, range) => `@font-face{font-family:"${fam}";src:url(data:font/woff2;base64,${fs.readFileSync(path.join(DIR, 'fonts', file)).toString('base64')}) format("woff2");${range ? `unicode-range:${range};` : ''}}`;
const EXT = 'U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';
const FONTS = [
  font('Rye', 'rye-latin-400-normal.woff2'),
  font('Sancreek', 'sancreek-latin-400-normal.woff2'), font('Sancreek', 'sancreek-latin-ext-400-normal.woff2', EXT),
  font('Bevan', 'bevan-latin-400-normal.woff2'), font('Bevan', 'bevan-latin-ext-400-normal.woff2', EXT),
  font('Special Elite', 'special-elite-latin-400-normal.woff2'), font('Special Elite', 'special-elite-latin-ext-400-normal.woff2', EXT),
].join('');

// ---------- puiul de raton, desenat cu „creionul” ----------
// totul e desenat în jurul punctului (0,0) = centrul capului
function strokesAround(cx, cy, rx, ry, n, len, color, op, w, from = 0, to = Math.PI * 2) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const a = from + (to - from) * i / n + R(-.03, .03), k = R(.94, 1.0);
    const x0 = cx + Math.cos(a) * rx * k, y0 = cy + Math.sin(a) * ry * k;
    const a2 = a + R(-.25, .25), L = len * R(.6, 1.3);
    const x1 = x0 + Math.cos(a2) * L, y1 = y0 + Math.sin(a2) * L;
    const mx = (x0 + x1) / 2 + R(-2, 2), my = (y0 + y1) / 2 + R(-2, 2);
    s += `<path d="M${f1(x0)} ${f1(y0)} Q${f1(mx)} ${f1(my)} ${f1(x1)} ${f1(y1)}" stroke="${color}" stroke-opacity="${f1(op * R(.6, 1.1))}" stroke-width="${f1(w * R(.7, 1.2))}"/>`;
  }
  return s;
}
// blăniță în interior: fire scurte orientate dinspre nas spre margini
function furInside(n, test, color, op, w, len) {
  let s = '', k = 0;
  while (k < n) {
    const x = R(-175, 175), y = R(-150, 230);
    if (!test(x, y)) continue;
    k++;
    const a = Math.atan2(y - 60, x) + R(-.35, .35), L = len * R(.6, 1.3);
    const x1 = x + Math.cos(a) * L, y1 = y + Math.sin(a) * L;
    s += `<path d="M${f1(x)} ${f1(y)} Q${f1((x + x1) / 2 + R(-1.5, 1.5))} ${f1((y + y1) / 2 + R(-1.5, 1.5))} ${f1(x1)} ${f1(y1)}" stroke="${color}" stroke-opacity="${f1(op * R(.5, 1.1))}" stroke-width="${f1(w * R(.7, 1.3))}"/>`;
  }
  return s;
}
const inEll = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1;
const inHead = (x, y) => inEll(x, y, 0, -5, 168, 138);
const inMask = (x, y) => inEll(x, y, -82, 16, 80, 36) || inEll(x, y, 82, 16, 80, 36);
const inMuzzle = (x, y) => inEll(x, y, 0, 80, 70, 50);

function kit() {
  const ink = '#1d1915', mid = '#5b544c';
  let s = '';
  // umbra din spate
  s += '<ellipse cx="0" cy="120" rx="250" ry="210" fill="url(#halo)"/>';
  // corpul / pieptul, cu blană
  s += '<path d="M-205 330 Q-215 170 -120 110 Q0 70 120 110 Q215 170 205 330 Z" fill="url(#bodyG)"/>';
  s += strokesAround(0, 230, 190, 150, 140, 16, ink, .45, 1.4, Math.PI * 1.05, Math.PI * 1.95);
  s += furInside(260, (x, y) => y > 120 && Math.abs(x) < 190 - (y - 120) * 0, mid, .35, 1.1, 13);
  // urechile
  [-1, 1].forEach(sg => {
    s += `<g transform="translate(${sg * 122} -112) rotate(${sg * 18})"><ellipse rx="56" ry="58" fill="url(#earG)"/><ellipse rx="34" ry="36" cy="8" fill="#3d3731" filter="url(#soft)"/>`;
    s += strokesAround(0, 0, 56, 58, 70, 11, '#fff', .9, 1.6, Math.PI * .95, Math.PI * 2.05);
    s += strokesAround(0, 0, 58, 60, 60, 9, ink, .5, 1.2, Math.PI * .95, Math.PI * 2.05);
    s += '</g>';
  });
  // capul
  s += '<ellipse cx="0" cy="-5" rx="168" ry="138" fill="url(#headG)"/>';
  // obrajii pufoși
  s += '<ellipse cx="-128" cy="55" rx="62" ry="58" fill="url(#cheekG)"/><ellipse cx="128" cy="55" rx="62" ry="58" fill="url(#cheekG)"/>';
  // dunga închisă de pe frunte
  s += '<path d="M-26 -140 Q0 -150 26 -140 L14 -25 Q0 -18 -14 -25 Z" fill="#4a433c" filter="url(#smudge)" opacity=".85"/>';
  // sprâncenele albe
  s += '<path d="M-160 -22 Q-112 -82 -36 -50 Q-84 -46 -160 -4 Z M160 -22 Q112 -82 36 -50 Q84 -46 160 -4 Z" fill="#fff" filter="url(#soft)"/><path d="M-150 -30 Q-110 -70 -48 -50 M150 -30 Q110 -70 48 -50" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" filter="url(#smudge)"/>';
  // masca
  s += '<g filter="url(#smudge)"><ellipse cx="-82" cy="16" rx="82" ry="38" transform="rotate(-16 -82 16)" fill="#26211d"/><ellipse cx="82" cy="16" rx="82" ry="38" transform="rotate(16 82 16)" fill="#26211d"/><ellipse cx="0" cy="4" rx="30" ry="22" fill="#5c544b"/></g>';
  // boticul alb
  s += '<ellipse cx="0" cy="82" rx="74" ry="54" fill="#fdfbf6" filter="url(#soft)"/>';
  // blăniță: margine pufoasă + fire în interior
  s += strokesAround(0, -5, 168, 138, 260, 15, ink, .55, 1.3, Math.PI * .02, Math.PI * 1.98);
  s += strokesAround(0, -5, 166, 136, 160, 10, '#fff', .9, 1.4, Math.PI * .02, Math.PI * 1.98);
  s += furInside(900, (x, y) => inHead(x, y) && !inMask(x, y) && !inMuzzle(x, y), mid, .28, 1, 11);
  s += furInside(380, (x, y) => inMask(x, y) && !inEll(x, y, -68, 8, 34, 34) && !inEll(x, y, 68, 8, 34, 34), ink, .55, 1.2, 10);
  s += furInside(160, inMuzzle, '#8c847b', .18, .9, 8);
  // ochii mari, lucioși
  [-1, 1].forEach(sg => {
    const ex = sg * 68;
    s += `<circle cx="${ex}" cy="8" r="33" fill="#0b0908"/><circle cx="${ex}" cy="8" r="33" fill="url(#eyeG)"/>`;
    s += `<circle cx="${ex - 11}" cy="-5" r="11" fill="#fff"/><circle cx="${ex + 11}" cy="22" r="4.5" fill="#fff" opacity=".9"/>`;
    s += `<path d="M${ex - 24} 14 Q${ex - 20} 30 ${ex - 4} 36" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="2.5"/>`;
  });
  // nasul (al lui, nefurat)
  s += '<path d="M-24 56 Q0 46 24 56 Q22 74 0 82 Q-22 74 -24 56 Z" fill="#141210"/><ellipse cx="-7" cy="58" rx="8" ry="4" fill="#fff" opacity=".7"/>';
  s += '<path d="M0 82 L0 96 M0 96 Q-12 108 -24 100 M0 96 Q12 108 24 100" fill="none" stroke="#2a2420" stroke-width="2.6" stroke-linecap="round"/>';
  // limbuța scoasă
  s += '<path d="M-8 103 Q0 120 8 103 Z" fill="#bdb3a8" stroke="#2a2420" stroke-width="1.8"/><path d="M0 106 L0 113" stroke="#8a7f74" stroke-width="1.2"/>';
  // mustățile
  [-1, 1].forEach(sg => {
    for (let i = 0; i < 4; i++) s += `<path d="M${sg * 40} ${86 + i * 6} Q${sg * 90} ${78 + i * 9} ${sg * (150 + i * 8)} ${70 + i * 16}" fill="none" stroke="#3a332c" stroke-opacity=".55" stroke-width="1.1"/>`;
    s += `<circle cx="${sg * 36}" cy="88" r="1.6" fill="#3a332c"/><circle cx="${sg * 44}" cy="94" r="1.6" fill="#3a332c"/><circle cx="${sg * 34}" cy="98" r="1.6" fill="#3a332c"/>`;
  });
  // lăbuțele care țin un nas furat
  s += '<circle cx="0" cy="196" r="38" fill="url(#noseG)"/><ellipse cx="-13" cy="181" rx="12" ry="7" fill="#fff" opacity=".85"/>';
  s += strokesAround(0, 196, 38, 38, 44, 3, ink, .5, 1, 0, Math.PI * 2);
  [-1, 1].forEach(sg => {
    s += `<g transform="translate(${sg * 50} 206) rotate(${sg * -12})"><ellipse rx="30" ry="24" fill="url(#pawG)"/>`;
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .38 * sg - sg * .7; s += `<ellipse cx="${f1(Math.cos(a) * 26)}" cy="${f1(Math.sin(a) * 22)}" rx="6" ry="9" transform="rotate(${f1(a * 180 / Math.PI + 90)} ${f1(Math.cos(a) * 26)} ${f1(Math.sin(a) * 22)})" fill="#4d463f"/>`; }
    s += strokesAround(0, 0, 30, 24, 50, 5, ink, .5, 1) + '</g>';
  });
  return s;
}

// ---------- simbolul GP ----------
const gp = (x, y, sz) => `<g transform="translate(${x} ${y})"><text x="0" y="0" font-family="Bevan" font-size="${sz}" fill="#2a1d12">G</text><path d="M${f1(sz * .40)} ${f1(-sz * .98)} L${f1(sz * .44)} ${f1(sz * .2)}" stroke="#2a1d12" stroke-width="${f1(sz * .11)}" stroke-linecap="round"/></g>`;
const star = (x, y, r) => { let p = []; for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = -Math.PI / 2 + i * Math.PI / 5; p.push(f1(x + Math.cos(a) * rr) + ',' + f1(y + Math.sin(a) * rr)); } return `<polygon points="${p.join(' ')}" fill="#2a1d12"/>`; };
const rule = y => `<path d="M120 ${y} H360 M480 ${y} H720" stroke="#2a1d12" stroke-width="3"/><path d="M140 ${y + 7} H350 M490 ${y + 7} H700" stroke="#2a1d12" stroke-width="1.2"/>${star(390, y + 2, 11)}${star(420, y + 2, 14)}${star(450, y + 2, 11)}`;

// pete de vreme pe hârtie
let stains = '';
for (let i = 0; i < 9; i++) stains += `<ellipse cx="${f1(R(60, 780))}" cy="${f1(R(60, 1130))}" rx="${f1(R(30, 110))}" ry="${f1(R(20, 80))}" fill="url(#stain)" opacity="${f1(R(.25, .6))}"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">
<style>${FONTS}</style>
<defs>
  <filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 -1.2 .75"/></filter>
  <filter id="fibers" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".02 .35" numOctaves="2" seed="9"/><feColorMatrix values="0 0 0 0 .4  0 0 0 0 .3  0 0 0 0 .15  0 0 0 -1 .55"/></filter>
  <filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="2" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="2.5" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency=".9" seed="5" result="g"/><feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.6 0 0 0 1.9" result="ga"/><feComposite in="d" in2="ga" operator="in"/></filter>
  <filter id="pencil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="2" seed="11" result="w"/><feDisplacementMap in="SourceGraphic" in2="w" scale="2" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="1.2" seed="8" result="g"/><feColorMatrix in="g" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -1.3 0 0 0 1.55" result="ga"/><feComposite in="d" in2="ga" operator="in"/></filter>
  <filter id="smudge" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
  <radialGradient id="vign" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#7a5a30" stop-opacity="0"/><stop offset="1" stop-color="#5a3a18" stop-opacity=".75"/></radialGradient>
  <radialGradient id="stain"><stop offset="0" stop-color="#a07840" stop-opacity=".0"/><stop offset=".7" stop-color="#a07840" stop-opacity=".25"/><stop offset="1" stop-color="#8a6030" stop-opacity="0"/></radialGradient>
  <radialGradient id="halo" cx=".5" cy=".4" r=".6"><stop offset="0" stop-color="#6b6258" stop-opacity=".35"/><stop offset="1" stop-color="#6b6258" stop-opacity="0"/></radialGradient>
  <radialGradient id="headG" cx=".5" cy=".62" r=".62"><stop offset="0" stop-color="#f6f2ec"/><stop offset=".6" stop-color="#cfc8be"/><stop offset="1" stop-color="#8e867c"/></radialGradient>
  <radialGradient id="cheekG"><stop offset="0" stop-color="#f7f3ed" stop-opacity=".9"/><stop offset="1" stop-color="#f7f3ed" stop-opacity="0"/></radialGradient>
  <radialGradient id="earG" cx=".5" cy=".55" r=".6"><stop offset="0" stop-color="#9a9288"/><stop offset="1" stop-color="#6a635b"/></radialGradient>
  <radialGradient id="bodyG" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#d8d1c7"/><stop offset=".6" stop-color="#9c9489"/><stop offset="1" stop-color="#6c655d"/></radialGradient>
  <radialGradient id="eyeG" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#4a4038" stop-opacity=".7"/><stop offset=".5" stop-color="#0b0908" stop-opacity="0"/></radialGradient>
  <radialGradient id="noseG" cx=".35" cy=".3" r=".75"><stop offset="0" stop-color="#9a928a"/><stop offset=".55" stop-color="#4a433c"/><stop offset="1" stop-color="#1e1a17"/></radialGradient>
  <radialGradient id="pawG" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#a59d93"/><stop offset="1" stop-color="#5d564e"/></radialGradient>
  <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><path d="M0 0 V9" stroke="#4a3b2a" stroke-width="1" stroke-opacity=".22"/></pattern>
  <clipPath id="portrait"><rect x="175" y="224" width="490" height="442"/></clipPath>
</defs>
<rect width="${W}" height="${H}" fill="#eadcb9"/>
<rect width="${W}" height="${H}" filter="url(#fibers)" opacity=".5"/>
${stains}
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".55"/>
<rect width="${W}" height="${H}" fill="url(#vign)"/>
<path d="M0 420 Q420 436 840 410 M300 0 Q310 600 290 1188" fill="none" stroke="#7a5a30" stroke-opacity=".18" stroke-width="2"/>
<g filter="url(#ink)">
  <rect x="30" y="30" width="${W - 60}" height="${H - 60}" fill="none" stroke="#2a1d12" stroke-width="6"/>
  <rect x="42" y="42" width="${W - 84}" height="${H - 84}" fill="none" stroke="#2a1d12" stroke-width="2"/>
  <text x="${W / 2}" y="176" text-anchor="middle" font-family="Rye" font-size="150" letter-spacing="4" fill="#2a1d12">WANTED</text>
  ${rule(194)}
  <rect x="165" y="214" width="510" height="462" fill="#f2e7cd" stroke="#2a1d12" stroke-width="6"/>
  <rect x="175" y="224" width="490" height="442" fill="none" stroke="#2a1d12" stroke-width="1.5"/>
  <text x="${W / 2}" y="716" text-anchor="middle" font-family="Special Elite" font-size="31" fill="#2a1d12">Căutat încă de când era mic</text>
  <text x="${W / 2}" y="774" text-anchor="middle" font-family="Sancreek" font-size="50" letter-spacing="2" fill="#2a1d12">CREDIBILUL RATON</text>
  <text x="${W / 2}" y="852" text-anchor="middle" font-family="Sancreek" font-size="84" letter-spacing="2" fill="#2a1d12">MIȘȘIȘȘIPPI</text>
  ${rule(894)}
  <text x="${W / 2}" y="940" text-anchor="middle" font-family="Special Elite" font-size="28" letter-spacing="3" fill="#2a1d12">PENTRU:</text>
  <text x="${W / 2}" y="988" text-anchor="middle" font-family="Bevan" font-size="40" fill="#2a1d12">FURT DE NASURI ÎN SERIE</text>
  <text x="${W / 2}" y="1052" text-anchor="middle" font-family="Sancreek" font-size="54" letter-spacing="3" fill="#2a1d12">RECOMPENSĂ</text>
  <text x="430" y="1126" text-anchor="end" font-family="Bevan" font-size="70" fill="#2a1d12">100</text>
  ${gp(452, 1126, 72)}
</g>
<g clip-path="url(#portrait)">
  <rect x="175" y="224" width="490" height="442" fill="url(#hatch)"/>
  <g transform="translate(420 418) scale(1.0)" filter="url(#pencil)" style="mix-blend-mode:multiply">${kit()}</g>
</g>
${[[58, 58], [782, 58], [58, 1130], [782, 1130]].map(([x, y]) => `<circle cx="${x + 2}" cy="${y + 3}" r="9" fill="#000" opacity=".25"/><circle cx="${x}" cy="${y}" r="8" fill="#6b6b6b" stroke="#2a2a2a" stroke-width="2"/><circle cx="${x - 2.5}" cy="${y - 2.5}" r="2.5" fill="#cfcfcf"/>`).join('')}
</svg>`;

(async () => {
  fs.writeFileSync(path.join(DIR, 'afis-wanted-A.svg'), svg);
  const b = await chromium.launch();
  const html = `<!doctype html><html><head><style>html,body{margin:0;background:#fff}svg{display:block;width:100vw;height:auto}@page{size:A4;margin:0}</style></head><body>${svg}</body></html>`;
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2480 / W });
  await p.setContent(html); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(DIR, 'afis-wanted-A-print.jpg'), type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: W, height: H } });
  const p2 = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.4 });
  await p2.setContent(html); await p2.waitForTimeout(500);
  await p2.screenshot({ path: path.join(DIR, 'afis-wanted-A-mic.jpg'), type: 'jpeg', quality: 82, clip: { x: 0, y: 0, width: W, height: H } });
  await b.close();
  console.log('gata');
})();
