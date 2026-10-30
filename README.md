# Urmele lui Mișșișșippi

Joc scurt de interactive fiction în română, pentru un copil de 6 ani, parte dintr-un treasure hunt real (QR pe un lockbox → jocul → codul lacătului).

Totul e într-un singur fișier: `index.html` (fără dependențe, merge pe iPad).

## Etape
0. **Scrisoarea lui Mișșișșippi**: plic secret, apoi scrisoarea cere numele „ca să-ți trimită o gogoașă”. Acceptă doar `David` / `Davi`; la alte nume, cerneala răspunde amuzant. La `Pufu` / `Unchiul Pufu` vine un mesaj special: Pufu e singurul care l-ar putea prinde vreodată pe M... „dar sigur nu ești el”. Numele corect declanșează CAPCANA: clic, cutremur, cădere în labirint.
1. **Labirintul Încâlcit** (garduri vii, văzut de sus): orice direcție te învârte în cerc, șoseta cu dungi apare mereu. După 6 mutări apare butonul **ȘTÂNGA**.
2. **Mișși și Șșippi** (doi ratoni gemeni, nepoții lui M; împreună fac „Mișși-Șșippi”; Șșippi repetă finalul frazelor lui Mișși). Sunt animați: se uită în stânga și în dreapta, dau din coadă și râd. Ei pun o întrebare de quiz; dacă răspunzi corect, alegi tu **Question A!** sau **Question B!** pentru ei. Din răspunsuri se vede cine minte. Cine minte se schimbă la fiecare joc nou, și ratonii spun asta. Apoi, pe un ecran separat („momentul cel mare”, cu o reamintire a răspunsurilor), fiecare spune în ce cufăr e comoara. Cele trei cufere sunt prezentate încă de la început. Dacă alegi cufărul greșit, o iei de la quiz. Comoara: **harta**.
3. **Râul cu Pietre**: 5 rânduri de câte 3 pietre, de la malul tău până pe celălalt mal. Pe fiecare rând sari pe piatra cu răspunsul corect: adunări și scăderi până la 20, șiruri, dublu, jumătate, „câte picioare au 3 ratoni” (nivel 7–8 ani). Dacă greșești piatra, face PLEOSC și se scufundă.
4. **Ușa lui Tenneșșee** (pârșul de pază, care tot adoarme): parola e numele lui M în **katakana**, ミッシッシッピ (mi-șși-șși-ppi, cu ッ mic pentru fiecare „ȘȘ”). Pârșul a scris pe ușă 5 variante: cea corectă și 4 amestecate sau cu capcane (ツ, ビ, ン, ori ミシシッピ, adică râul din America). La o alegere greșită, pârșul citește cu voce tare varianta („Ppișșișșimi!”), dă un indiciu și varianta se blochează.
5. **MECHA-MIȘȘIȘȘIPPI 3000**: robotul anunță dinainte atacul (laser, rachete, coadă, țipăt, iar când se înfurie și mega-laser, pumn-rachetă). Acțiunea potrivită (Ferește-te / Blochează / Sari / Gâdilă) dă CONTRAATAC. **JUGHINEȘTE!** se încarcă în 3 ture. Nu se poate pierde: la 0 HP, Timi și Tomi îți aruncă o poțiune.
6. **LOOT!**: din robot iese șeful cel mare, deghizat: pălărie cu pană, ochelari de soare coborâți, sprânceană ridicată, trenci, bombă cu fum. E șmecher, nu rău. Dispare într-un PUF și lasă un cufăr strălucitor. Din el ies obiecte comune, rare, epice și unul legendar, bilețelul cu codul lacătului, plus confetti.

Ilustrațiile sunt desenate în SVG direct în cod, în stil de desen animat cu creioane colorate (contur gros, linii tremurate, sprâncene groase); filtrul `#crayon` se poate scoate dintr-o singură linie CSS. Prin joc apar mici bucăți de japoneză: 川 și 山 pe hartă, メカ pe robot. iar sunetele sunt sintetizate (Web Audio), deci nu există fișiere externe.

## Setări (începutul scriptului)
- `NUME_ACCEPTATE`, `COD_LACAT` (acum `8888`), `PAROLA` (`ミッシッシッピ`), `PAROLE_GRESITE`, `RATON`.

Progresul se salvează în localStorage (cheia `misi-joc-v2`); butonul „↺ de la început” resetează.

## Cod QR
`qr/qr-joc.png` (simplu) și `qr/qr-joc-cu-text.png` („Scanează-mă, detective!”) duc la https://henrygale815.github.io/joc-raton/. 1800 px, 300 DPI (≈15 cm), corecție de erori H, deci merge și printat mic (min. ~3 cm).
