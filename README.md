# Urmele lui Mișșișșippi

Joc scurt de interactive fiction în română, pentru un copil de 6 ani, parte dintr-un treasure hunt real (QR pe un lockbox → jocul → codul lacătului).

Totul e într-un singur fișier: `index.html` (fără dependențe, merge pe iPad).

## Etape
0. **Scrisoarea lui Mișșișșippi**: plic secret, apoi scrisoarea cere numele „ca să-ți trimită o gogoașă”. Acceptă doar `David` / `Davi`; la alte nume, cerneala răspunde amuzant. La `Pufu` / `Unchiul Pufu` vine un mesaj special: Pufu e singurul care l-ar putea prinde vreodată pe M... „dar sigur nu ești el”. Numele corect declanșează CAPCANA: clic, cutremur, cădere în labirint.
1. **Labirintul Încâlcit** (garduri vii, văzut de sus): orice direcție te învârte în cerc. Gogoașa mușcată (cea promisă în scrisoare) apare mereu; dacă o atingi, nu vrei s-o iei. În primele răscruci e câte o **ghindă** pe jos, maxim 5 (`MAX_GHINDE`); o atingi și intră în inventar (contorul de jos). După 6 mutări apare butonul **ȘTÂNGA**.
2. **Mișși și Șșippi** (doi ratoni gemeni, nepoții lui M; împreună fac „Mișși-Șșippi”; Șșippi repetă finalul frazelor lui Mișși). Sunt animați: se uită în stânga și în dreapta, dau din coadă și râd. Ei pun o întrebare de quiz; dacă răspunzi corect, alegi tu **Question A!** sau **Question B!** pentru ei. Din răspunsuri se vede cine minte. Cine minte se schimbă la fiecare joc nou, și ratonii spun asta. Apoi, pe un ecran separat („momentul cel mare”, cu o reamintire a răspunsurilor), fiecare spune în ce cufăr e comoara. Cele trei cufere sunt prezentate încă de la început. Dacă alegi cufărul greșit, o iei de la quiz. Comoara: **harta**.
3. **Râul cu Pietre**: 5 rânduri de câte 3 pietre, de la malul tău până pe celălalt mal. Pe fiecare rând sari pe piatra cu răspunsul corect: adunări și scăderi până la 20, șiruri, dublu, jumătate, „câte picioare au 3 ratoni” (nivel 7–8 ani). Dacă greșești piatra, face PLEOSC și se scufundă.
4. **Pârșul Tenneșșee și ușa**: la început pârșul e morocănos și flămând. Dacă îi dai cel puțin o ghindă, devine prietenos și promite să te ajute în luptă; are altă replică pentru fiecare ghindă (1–5). Desenat în stil Shin-chan (sprâncene groase ca omizile); când adoarme, doarme cu fundul în sus. Ușa are 5 taste cu katakana. Pârșul nu spune direct parola, dă doar indicii („e ușa lui Mișșișșippi... stăpânul meu e îngâmfat, cel mai mult îi place să audă... nu-ți spun!”). Parola corectă: ミッシッシッピ (mi-șși-șși-ppi). Celelalte sunt variante amestecate sau cu altă literă (Ppișșișșimi, Mișșișșippa, Mikkișșippi...). La fiecare, pârșul râde de cum sună („Mișșișșippa? Sună ca o pizza!”), iar tasta se blochează.
5. **MECHA-MIȘȘIȘȘIPPI 3000** (30 HP; ai 12 HP și 3 poțiuni): robotul anunță dinainte atacul (laser, rachete, coadă, țipăt, iar când se înfurie și mega-laser, pumn-rachetă). Acțiunea potrivită (Ferește-te / Blochează / Sari / Gâdilă) dă CONTRAATAC. **JUGHINEȘTE!** se încarcă în 3 ture. Dacă i-ai dat ghinde pârșului, ai și **SUMONEAZĂ PÂRȘUL!** (se poate folosi o dată). Urmează o animație ca în RPG-uri: cerc magic cu katakana/kanji, raze, ghindele tale rotindu-se. Pârșul lovește cu coada (4 + numărul de ghinde date, maxim 9), robotul strigă „Măi, pârșule, măi! Tu de partea cui ești?!”, apoi adoarme la cântecul de leagăn. Cât doarme, ai o **acțiune gratuită**, fără să fii atacat. Nu se poate pierde: la 0 HP, Mișși și Șșippi îți aruncă o poțiune.
6. **LOOT!**: din robot iese șeful cel mare, deghizat: pălărie cu pană, ochelari de soare coborâți, sprânceană ridicată, trenci, bombă cu fum. E șmecher, nu rău. Dispare într-un PUF și lasă un cufăr strălucitor. Din el ies o ghindă strălucitoare (comun), harta lui Mișșișșippi (rar), pălăria cu pană a șefului (epic) și bilețelul cu codul lacătului (legendar), plus confetti. Pe bilețel: „Și mie îmi place cifra 8. E ca un infinit întors.”

Ilustrațiile sunt desenate în SVG direct în cod, în stil de desen animat cu creioane colorate (contur gros, linii tremurate, sprâncene groase); filtrul `#crayon` se poate scoate dintr-o singură linie CSS. Prin joc apar mici bucăți de japoneză: 川 și 山 pe hartă, メカ pe robot. iar sunetele sunt sintetizate (Web Audio), deci nu există fișiere externe.

## Setări (începutul scriptului)
- `NUME_ACCEPTATE`, `COD_LACAT` (acum `8888`), `PAROLA` (`ミッシッシッピ`), `RATON`. Variantele greșite de parolă și glumele pârșului sunt în `PAROLE_GLUME`.

Totul încape pe un singur ecran pe iPad și pe laptop: pe ecranele late, desenul stă în stânga, iar textul și butoanele în dreapta. Stickerele și inventarul sunt jos, sub card.

Progresul se salvează în localStorage (cheia `misi-joc-v2`); butonul „↺ de la început” resetează.

## Cod QR
`qr/qr-joc.png` (simplu) și `qr/qr-joc-cu-text.png` („Scanează-mă, detective!”) duc la https://henrygale815.github.io/joc-raton/. 1800 px, 300 DPI (≈15 cm), corecție de erori H, deci merge și printat mic (min. ~3 cm).
