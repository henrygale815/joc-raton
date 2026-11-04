# Murdoku pe harta casei: verifică dacă indiciile duc la o singură soluție.
# Regulă: pe fiecare rând și pe fiecare coloană stă exact un personaj.
from itertools import permutations

# grila 5x5 peste schiță (rând, coloană); None = în afara casei
CAMERE = [
    [None,        'dormitor', 'baie',     'camera',    'camera'],
    [None,        'dormitor', 'baie',     'camera',    'camera'],
    ['sufragerie','sufragerie','hol',     'bucatarie', 'bucatarie'],
    ['sufragerie','sufragerie','hol',     'bucatarie', 'bucatarie'],
    ['sufragerie','sufragerie','hol',     'baie2',     None],
]
# mobilă: pe unele se poate sta, altele ocupă pătrățelul
MOBILA = {(0, 1): 'pat', (1, 1): 'covor', (0, 2): 'cada', (1, 2): 'chiuveta', (0, 3): 'pat', (0, 4): 'birou',
          (2, 0): 'birou', (2, 1): 'tv', (3, 0): 'planta', (3, 1): 'covor', (4, 0): 'canapea', (4, 1): 'canapea',
          (2, 3): 'masa', (3, 3): 'scaun', (4, 3): 'chiuveta'}
BLOCAT = {'birou', 'tv', 'planta', 'masa', 'chiuveta'}
N = 5
PERS = ['Tennessee', 'Missi', 'Ssippi', 'Robotul', 'Mississippi']

def liber(r, c):
    return CAMERE[r][c] is not None and MOBILA.get((r, c)) not in BLOCAT

def langa(r, c, ce):
    return any(MOBILA.get((r + dr, c + dc)) == ce for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)))

INDICII = {
    'Tennessee': lambda r, c: MOBILA.get((r, c)) == 'pat',
    'Missi': lambda r, c: MOBILA.get((r, c)) == 'covor',
    'Robotul': lambda r, c: CAMERE[r][c] == 'hol',
    'Ssippi': lambda r, c: CAMERE[r][c] == 'bucatarie' and not langa(r, c, 'masa'),
}

sol = []
for cols in permutations(range(N)):           # coloana personajului de pe fiecare rând
    for ordine in permutations(PERS):          # cine stă pe fiecare rând
        poz = {p: (r, cols[r]) for r, p in enumerate(ordine)}
        if all(liber(*poz[p]) for p in PERS) and all(f(*poz[p]) for p, f in INDICII.items()):
            sol.append(poz)
print(len(sol), 'soluții')
for s in sol[:5]:
    print({p: (s[p], CAMERE[s[p][0]][s[p][1]], MOBILA.get(s[p])) for p in PERS})
