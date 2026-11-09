# Recorta la caseta de cada portada: quita el azul noche conectado con los bordes (relleno por inundación).
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
src, dst = sys.argv[1], sys.argv[2]
for n in (sys.argv[3:] or ['tombola','taquilla','caja','noria']):
    im = Image.open(f'{src}/portada-{n}.png').convert('RGBA')
    a = np.array(im).astype(int)
    rgb = a[..., :3]
    d = np.abs(rgb - np.array([35, 40, 92])).sum(-1)
    fondo = d < 26
    lab, k = ndimage.label(fondo)
    borde = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    quita = np.isin(lab, list(borde))
    keep = ~quita
    if n == 'tombola':
        # el faldón de rayas azules toca el fondo: se rellena cada fila entre su primer y su último píxel
        for y in range(keep.shape[0]):
            xs = np.where(keep[y])[0]
            if len(xs) > 1 and y > 520: keep[y, xs[0]:xs[-1]] = True
    alfa = keep.astype(np.uint8) * 255
    m = Image.fromarray(alfa).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
    out = Image.fromarray(a.astype(np.uint8)); out.putalpha(m)
    bb = out.getbbox(); print(n, bb, 'quita', round(quita.mean(), 2))
    out = out.crop(bb)
    out.save(f'{dst}/caseta-{n}.png')
