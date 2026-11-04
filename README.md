# Urmele lui Mișșișșippi

Joc scurt de interactive fiction în română, pentru un copil de 6 ani, parte dintr-un treasure hunt real (QR pe un lockbox → jocul → codul lacătului).

Totul e într-un singur fișier: `index.html` (fără dependențe, merge pe iPad).

## Etape
0. **Scrisoarea lui Mișșișșippi**: plic secret, apoi scrisoarea cere numele „ca să-ți trimită o gogoașă”. Acceptă doar `David` / `Davi`; la alte nume, cerneala răspunde amuzant. Scrisoarea avertizează „să nu încerci să mă păcălești prefăcându-te că ești ALTCINEVA”, un indiciu ascuns. La `Pufu` / `Unchiul Pufu` vine un mesaj special: Pufu e singurul care l-ar putea prinde vreodată pe M... „dar sigur nu ești el”. Numele corect declanșează CAPCANA: clic, cutremur, cădere în labirint.
1. **Labirintul Încâlcit** (garduri vii, văzut de sus): orice direcție te învârte în cerc. Gogoașa mușcată (cea promisă în scrisoare) apare mereu; dacă o atingi, nu vrei s-o iei. În primele răscruci e câte o **ghindă** pe jos, maxim 5 (`MAX_GHINDE`); o atingi și intră în inventar (contorul de jos). Din a treia răscruce, pe un gard viu e bătut în cuie un **afiș WANTED**. Îl atingi, se deschide pe tot ecranul și rămâne în inventar (îl poți redeschide). După 6 mutări apare butonul **ȘTÂNGA**.
2. **Mișși și Șșippi**, pirații (doi ratoni gemeni, nepoții lui M; împreună fac „Mișși-Șșippi”; Șșippi repetă finalul frazelor lui Mișși). Se prezintă ca „ucenici de pirați”. Mișși are tricorn și petic pe ochi, Șșippi bandană și cercel, amândoi tricouri de marinar. Stau pe o plajă cu steag de pirat și vorbesc ca pirații („Ahoi!”, „Arrr!”). Sunt animați: se uită în stânga și în dreapta, dau din coadă și râd. Ei pun o întrebare de quiz; dacă răspunzi corect, alegi tu **Question A!** sau **Question B!** pentru ei. Din răspunsuri se vede cine minte. Cine minte se schimbă la fiecare joc nou, și ratonii spun asta. Apoi, pe un ecran separat („momentul cel mare”, cu o reamintire a răspunsurilor), fiecare spune în ce cufăr e comoara. Cele trei cufere sunt prezentate încă de la început. Dacă alegi cufărul greșit, o iei de la quiz. Comoara: **harta**.
3. **Râul cu Pietre**: 5 rânduri de câte 3 pietre, de la malul tău până pe celălalt mal. Pe fiecare rând sari pe piatra cu răspunsul corect: adunări și scăderi până la 20, șiruri, dublu, jumătate, „câte picioare au 3 ratoni” (nivel 7–8 ani). Dacă greșești piatra, face PLEOSC și se scufundă.
4. **Pârșul Tenneșșee și ușa**: îl găsești dormind buștean chiar în fața ușii, cu fundul în sus (ca Shin-chan) și căciuliță de noapte. Îl trezești și devine morocănos și flămând. Dacă îi dai cel puțin o ghindă, devine prietenos și promite să te ajute în luptă; are altă replică pentru fiecare ghindă (1–5). Desenat în stil Shin-chan (sprâncene groase ca omizile); când adoarme, doarme cu fundul în sus. Ușa are 5 taste cu katakana. Pârșul nu spune direct parola, dă doar indicii („e ușa lui Mișșișșippi... stăpânul meu e îngâmfat, cel mai mult îi place să audă... nu-ți spun!”). Parola corectă: ミッシッシッピ (mi-șși-șși-ppi). Celelalte sunt variante amestecate sau cu altă literă (Ppișșișșimi, Mișșișșippa, Mikkișșippi...). La fiecare, pârșul râde de cum sună („Mișșișșippa? Sună ca o pizza!”), iar tasta se blochează.
5. **MECHA-MIȘȘIȘȘIPPI 3000** (30 HP; ai 12 HP și 3 poțiuni): robotul anunță dinainte atacul (laser, rachete, coadă, țipăt, iar când se înfurie și mega-laser, pumn-rachetă). Acțiunea potrivită (Ferește-te / Blochează / Sari / Gâdilă) dă CONTRAATAC. **JUGHINEȘTE!** se încarcă în 3 ture. Dacă i-ai dat ghinde pârșului, ai și **SUMONEAZĂ PÂRȘUL!** (se poate folosi o dată). Urmează o animație ca în RPG-uri: cerc magic cu katakana/kanji, raze, ghindele tale rotindu-se. Pârșul lovește cu coada (4 + numărul de ghinde date, maxim 9), robotul strigă „Măi, pârșule, măi! Tu de partea cui ești?!”, apoi adoarme la cântecul de leagăn. Cât doarme, ai o **acțiune gratuită**, fără să fii atacat. Nu se poate pierde: la 0 HP, Mișși și Șșippi îți aruncă o poțiune.
6. **VICTORIE + LEVEL UP**: după explozie, cu fanfară, EXP-ul se adună rând cu rând (labirint, gemeni, râu, pârș, ghinde găsite și dăruite, afiș, contraatacuri, robot). Bara se umple, apare LEVEL UP din „Ucenic detectiv” în „Nivel 2 · Detectiv junior” și cresc statisticile. Boss-ul remarcă promovarea.
7. **LOOT!**: din robot iese boss-ul cel mare, deghizat: pălărie cu pană, ochelari de soare coborâți, sprânceană ridicată, trenci, bombă cu fum. E șmecher, nu rău. Dispare într-un PUF și lasă un cufăr strălucitor. Din el ies o ghindă strălucitoare (comun), harta lui Mișșișșippi (rar), pălăria cu pană a șefului (epic) și bilețelul cu codul lacătului (legendar), plus confetti. Pe bilețel: „Și mie îmi place cifra 8. E ca un infinit întors.”

Ilustrațiile sunt desenate în SVG direct în cod, în stil de desen animat cu creioane colorate (contur gros, linii tremurate, sprâncene groase); filtrul `#crayon` se poate scoate dintr-o singură linie CSS. Prin joc apar mici bucăți de japoneză: 川 și 山 pe hartă, メカ pe robot. iar sunetele sunt sintetizate (Web Audio), deci nu există fișiere externe.

## Setări (începutul scriptului)
- `NUME_ACCEPTATE`, `COD_LACAT` (acum `8888`), `PAROLA` (`ミッシッシッピ`), `RATON`. Variantele greșite de parolă și glumele pârșului sunt în `PAROLE_GLUME`.

Totul încape pe un singur ecran pe iPad și pe laptop: pe ecranele late, desenul stă în stânga, iar textul și butoanele în dreapta. Stickerele și inventarul sunt jos, sub card.

Progresul se salvează în localStorage (cheia `misi-joc-v2`); butonul „↺ de la început” resetează.

## Cod QR
`qr/qr-joc.png` (simplu) și `qr/qr-joc-cu-text.png` („Scanează-mă, detective!”) duc la https://henrygale815.github.io/joc-raton/. 1800 px, 300 DPI (≈15 cm), corecție de erori H, deci merge și printat mic (min. ~3 cm).

## Afișul WANTED (`wanted/`)
Două variante, cu același text și aceeași hârtie:
- **A**: puiul de raton desenat în cod, în stil creion/cărbune.
- **B**, **C**: desenele generate (`sursa/raton-X-original.jpg`), decupate fără ramă, curățate și transformate în „cerneală” pe hârtia afișului (`sursa/raton-X.png`, cu `python3 wanted/sursa/pregateste.py`).

Pentru fiecare variantă X:
- `afis-wanted-X-print.jpg`: pentru print, A4 la 300 DPI (2480×3507).
- `afis-wanted-X-mic.jpg`: versiunea mică, pentru joc (jocul folosește varianta C, aleasă pentru print; constanta `AFIS` din `index.html`).
- `afis-wanted-X.svg`: sursa, cu fonturile incluse.

`genereaza.js` desenează afișul și exportă fișierele: `node wanted/genereaza.js A` (sau `B`, `C`).
- Fonturi (SIL Open Font License, din Google Fonts): Rye, Sancreek, Bevan, Special Elite.
- `qr/qr-raton.png` (cu textul „Scanează... dacă îndrăznești!”) și `qr/qr-raton-fara-text.png`: același link, cu ratonul în creion de pe afișul WANTED (varianta C) care se uită peste pancarta cu codul, și o lăbuță în mijloc. Se generează cu `node qr/genereaza-qr.js`. Colțurile codului rămân pătrate intenționat, pentru că rotunjite nu mai sunt citite sigur.

## Murdoku: „Unde s-a ascuns Mișșișșippi?” (`murdoku/`)
Ultimul pas din traseu. Piesele hărții adunate formează tabla, iar rezolvarea arată unde e seiful (canapeaua).
- `indicii.png`: titlul, regula și 6 cartonașe-polaroid (Pisica, Tenneșșee, Șșippi, Mișși, Robotul, Mișșișșippi), fiecare cu indiciul lui.
- `harta.png` și `harta-piese.png`: harta casei (11×8, fără nume de camere), a doua cu liniile de tăiat în 5 piese.
- `jetoane.png`: două seturi de jetoane rotunde de decupat.
- `solutie.png`: harta cu personajele așezate, pentru părinte.
- Regula: două personaje nu stau niciodată pe același rând sau pe aceeași coloană. Se poate sta pe jos, pe pat, pe canapea, pe fotoliu, pe scaun și în cadă.
- Soluția: Pisica B2 (patul mare), Tenneșșee A7 (patul mic), Șșippi C5 (baia mare), Mișși E3 (în fața TV), Robotul F6 (hol), **Mișșișșippi H4 (canapea)**, găsit prin eliminare.
- `node murdoku/genereaza.js` verifică întâi că indiciile au o singură soluție, apoi generează toate paginile. Casa (`ROOMS`, `FURN`, `DOORS`), personajele și indiciile (`CHARS`) sunt la începutul fișierului. Pisica și robotul sunt desenate acolo, restul personajelor vin din joc.
- Fonturi (SIL Open Font License): Pacifico, Nunito.

## Grila secretă (`cifru/`)
Înlocuiește harta ca ultim pas. La fiecare pas din traseu, David găsește o piesă din „Grila detectivului”. La final pune cele 5 piese peste „Jurnalul secret al lui Mișșișșippi” și, prin ferestre, citește rând cu rând: **COMOARA / ESTE / SUB / CANAPEA** (fiecare cuvânt începe pe un rând nou).
- `de-printat.pdf`: cele două pagini A4, jurnalul și grila. Se printează la 100% („Dimensiune reală”), ca grila să cadă fix peste litere.
- `jurnal.png`, `grila.png`: aceleași pagini ca imagini. `solutie.png`: jurnalul cu literele mesajului marcate, pentru părinte.
- Grila se lipește pe carton (de exemplu de la o cutie de cereale), apoi se decupează pătrățelele gri și se taie pe liniile roșii.
- `node cifru/genereaza.js` așază textul, alege ferestrele (verifică că dau exact mesajul) și trasează tăieturile pe lângă ferestre. Textul și mesajul sunt la începutul fișierului (`TEXT`, `MESAJ`).

## Scrisoarea de start (`scrisoare/`)
Scrisoarea se scrie de mână. `hartie-labute.pdf` e o foaie albă A4 cu urme de lăbuțe de raton pe margini, pentru bucata lui Mișșișșippi (`node scrisoare/genereaza.js`).

## Biletele printate (`bilete/`)
- `oglinda.pdf`: biletul de la Yellow Submarine (A4 cu două exemplare, unul de rezervă). Sus scrie „Citește-mă în オグリンダ!” (oglindă, în katakana). Dedesubt, textul e scris în oglindă: „URMĂTORUL INDICIU SE AFLĂ ASCUNS SUB DESENUL DE PE FRIGIDER!”, citibil doar în fața unei oglinzi.
- `node bilete/genereaza.js` regenerează biletele. Katakana folosește fontul IPAGothic, instalat în sistem.
