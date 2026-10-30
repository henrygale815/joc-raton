# Urmele lui Mișșișșippi

Joc scurt de interactive fiction în română, pentru un copil de 6 ani, parte dintr-un treasure hunt real (QR pe un lockbox → jocul → codul lacătului).

Totul e într-un singur fișier: `index.html` (fără dependențe, merge pe iPad).

## Etape
1. **Paznicul Huhurezu** (bufniță) – cere numele; acceptă doar `David` / `Davi`, altfel răspunsuri amuzante.
2. **Labirintul Încâlcit** – orice direcție te învârte în cerc; urmele ratonului arată mereu altă direcție; după 6 mutări apare butonul 🌀 Ștânga.
3. **Statuile Tic și Tac** – una minte, una spune adevărul (aleasă aleator); copilul trage cartonașe de quiz ca să afle cine minte, apoi deduce cufărul (albastru) → Jetonul Întrebării.
4. **Broscoii Oac și Oc** – puzzle-ul clasic cu doi paznici, o singură întrebare (4 variante); ușa bună e cea mov.
5. **MECHA-MIȘȘIȘȘIPPI 3000** – boss fără lose state (HP jucător nu scade sub 2), poțiuni; explodează, ratonul fuge, rămâne un cufăraș.
6. **Cufărașul** – 3 atingeri → codul lacătului.

## Setări (începutul scriptului)
- `NUME_ACCEPTATE`, `COD_LACAT` (acum `8888`), `RATON`.

Progresul se salvează în localStorage; butonul „↺ de la început” resetează.

## Cod QR
`qr/qr-joc.png` (simplu) și `qr/qr-joc-cu-text.png` („Scanează-mă, detective!”) duc la https://henrygale815.github.io/joc-raton/. 1800 px, 300 DPI (≈15 cm), corecție de erori H, deci merge și printat mic (min. ~3 cm).
