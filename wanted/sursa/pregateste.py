# Pregătește un desen generat pentru afiș: decupează ratonul (fără ramă), face fundalul alb,
# estompează marginile, îl mărește pentru print și îl transformă în „cerneală” pe fond transparent.
# Rulare: python3 wanted/sursa/pregateste.py
from PIL import Image, ImageFilter
import numpy as np
import os

DIR = os.path.dirname(os.path.abspath(__file__))
# varianta: (fișier original, decupaj x0, y0, x1, y1)
VARIANTE = {
    'B': ('raton-B-original.jpg', (70, 285, 710, 960)),
    'C': ('raton-C-original.jpg', (70, 80, 700, 760)),
}

for v, (src, box) in VARIANTE.items():
    a = np.array(Image.open(os.path.join(DIR, src)).convert('L').crop(box)).astype(float)
    black, white = 12, 222
    a = np.clip((a - black) / (white - black), 0, 1) ** 1.1 * 255
    h, w = a.shape
    yy, xx = np.mgrid[0:h, 0:w]
    d = np.minimum.reduce([xx, w - 1 - xx, yy, h - 1 - yy]).astype(float)
    a = 255 - (255 - a) * np.clip(d / 45, 0, 1) ** 1.5
    img = Image.fromarray(a.astype('uint8'))
    img = img.resize((round(w * 1320 / h), 1320), Image.LANCZOS).filter(ImageFilter.UnsharpMask(radius=2.2, percent=70, threshold=2))
    L = np.array(img).astype(float)
    rgba = np.zeros((L.shape[0], L.shape[1], 4), 'uint8')
    rgba[..., 0], rgba[..., 1], rgba[..., 2] = 29, 24, 20
    rgba[..., 3] = np.clip(255 - L, 0, 255).astype('uint8')
    Image.fromarray(rgba, 'RGBA').save(os.path.join(DIR, f'raton-{v}.png'), optimize=True)
    print(v, img.size)
