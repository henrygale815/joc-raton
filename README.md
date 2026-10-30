# Urmele lui Mișșișșippi

Joc scurt de interactive fiction în română, pentru un copil de 6 ani, parte dintr-un treasure hunt real (QR pe un lockbox → jocul → codul lacătului).

Totul e într-un singur fișier: `index.html` (fără dependențe, merge pe iPad).

## Etape
0. **Scrisoarea lui Mișșișșippi**: plic secret, apoi scrisoarea cere numele „ca să-ți trimită o gogoașă”. Acceptă doar `David` / `Davi`; la alte nume, cerneala răspunde amuzant. Numele corect declanșează CAPCANA: clic, cutremur, cădere în labirint.
1. **Labirintul Încâlcit** (garduri vii, văzut de sus): orice direcție te învârte în cerc, șoseta cu dungi apare mereu. După 6 mutări apare butonul **ȘTÂNGA**.
2. **Timi și Tomi** (doi ratoni gemeni, nepoții lui M; Tomi repetă finalul frazelor lui Timi). Ei pun o întrebare de quiz; dacă răspunzi corect, alegi tu una din două întrebări pentru ei. Din răspunsuri se vede cine minte (ales aleator la fiecare rundă). Apoi fiecare spune în ce cufăr e comoara. Dacă alegi cufărul greșit, o iei de la quiz. Comoara: **harta**.
3. **Râul cu Pietre**: sari pe pietre în ordine, de la 1 la 10 (dacă greșești, faci PLEOSC).
4. **Ușa lui Tenneșșee** (oposumul de pază, care leșină de emoție): tastatură cu numere; codul e numărul preferat al lui M, **8** („are două burți”), cu indicii la răspunsurile greșite.
5. **MECHA-MIȘȘIȘȘIPPI 3000**: robotul anunță dinainte atacul (laser, rachete, coadă, țipăt, iar când se înfurie și mega-laser, pumn-rachetă). Acțiunea potrivită (Ferește-te / Blochează / Sari / Gâdilă) dă CONTRAATAC. **JUGHINEȘTE!** se încarcă în 3 ture. Nu se poate pierde: la 0 HP, Timi și Tomi îți aruncă o poțiune.
6. **Cufărașul**: 3 atingeri, apoi codul lacătului și confetti.

Ilustrațiile sunt desenate în SVG direct în cod, iar sunetele sunt sintetizate (Web Audio), deci nu există fișiere externe.

## Setări (începutul scriptului)
- `NUME_ACCEPTATE`, `COD_LACAT` (acum `8888`), `NUMAR_PREFERAT` (`8`), `RATON`.

Progresul se salvează în localStorage (cheia `misi-joc-v2`); butonul „↺ de la început” resetează.

## Cod QR
`qr/qr-joc.png` (simplu) și `qr/qr-joc-cu-text.png` („Scanează-mă, detective!”) duc la https://henrygale815.github.io/joc-raton/. 1800 px, 300 DPI (≈15 cm), corecție de erori H, deci merge și printat mic (min. ~3 cm).
