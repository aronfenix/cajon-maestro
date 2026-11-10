# Recorta la escena de cada portada de La Gran Limpieza (fondo plano #2e7d5b) y la guarda en WebP con sus piezas y premios.
# Quita el verde conectado con los bordes y también los huecos interiores que sean verde exacto (las gomas, los recortables...).
import sys, numpy as np, json
from PIL import Image, ImageFilter
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
VERDE = np.array([46, 125, 91])
man = json.load(open(f'{src}/manifest.json'))
for j in man['juegos']:
    n = j['clave']
    a = np.array(Image.open(f'{src}/{j["portada"]}').convert('RGBA')).astype(int)
    d = np.abs(a[..., :3] - VERDE).sum(-1)
    lab, k = ndimage.label(d < 30)
    borde = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    quita = np.isin(lab, list(borde))
    lab2, k2 = ndimage.label(d < 10)
    tam = ndimage.sum(np.ones_like(d), lab2, range(1, k2 + 1))
    huecos = [i + 1 for i, t in enumerate(tam) if t >= 120]
    quita |= np.isin(lab2, huecos)
    alfa = (~quita).astype(np.uint8) * 255
    m = Image.fromarray(alfa).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.7))
    out = Image.fromarray(a.astype(np.uint8)); out.putalpha(m)
    bb = out.getbbox(); out = out.crop(bb)
    print(n, bb, 'huecos', len(huecos))
    out.save(f'{dst}/escena-{n}.webp', quality=86, method=6)
    for i, p in enumerate(j['piezas'], 1):
        im = Image.open(f'{src}/{p}'); im = im.crop(im.getbbox())
        im.thumbnail((360, 360)); im.save(f'{dst}/pieza-{n}-{i}.webp', quality=86, method=6)
    for s, suf in ((j['pegatina'], ''), (j['silueta'], '-silueta')):
        im = Image.open(f'{src}/{s}'); im.thumbnail((320, 320)); im.save(f'{dst}/premio-{n}{suf}.webp', quality=88, method=6)
