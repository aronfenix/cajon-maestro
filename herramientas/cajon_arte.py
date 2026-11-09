# Entrega «cajón» de ChatGPT → WebP para la portada y las aventuras.
import os
from PIL import Image
S = '/mnt/user-data/uploads/para-claude-cajon-web'
D = '/home/claude/cajon/public/cajon'
os.makedirs(D, exist_ok=True)
def w(im, p, q=80): im.save(p, 'WEBP', quality=q, method=5)
# cajón: dos capas por orientación, a dos tamaños
for o, anchos in {'h': (1920, 1100), 'v': (1080, 720)}.items():
    for capa in ('fondo', 'frente'):
        im = Image.open(f'{S}/cajon/cajon-{o}-{capa}.png').convert('RGBA' if capa == 'frente' else 'RGB')
        for a in anchos:
            r = im.resize((a, round(im.height * a / im.width)), Image.LANCZOS)
            w(r, f'{D}/cajon-{o}-{capa}-{a}.webp', 78 if capa == 'fondo' else 82)
# objetos: recortados a su contenido, a 720 y 360 de ancho
for f in sorted(os.listdir(f'{S}/objetos')):
    n = f[:-4]
    im = Image.open(f'{S}/objetos/{f}').convert('RGBA')
    if n == 'tablet':
        im = im.rotate(90, expand=True)  # en horizontal: la pantalla queda apaisada
    im = im.crop(im.getbbox())
    print(n, im.size)
    for a in (720, 360):
        r = im.resize((a, round(im.height * a / im.width)), Image.LANCZOS) if im.width > a else im
        w(r, f'{D}/obj-{n}-{a}.webp', 84)
# cajas de las aventuras: tapa, interior y lomos
for av in ('la-feria-de-otono', 'la-gran-limpieza-del-cajon', 'plantilla'):
    for p, a in (('tapa', 1200), ('interior', 1200), ('lomo-largo', 1200), ('lomo-corto', 760)):
        im = Image.open(f'{S}/aventuras/{av}/{p}.png').convert('RGBA')
        w(im.resize((a, round(im.height * a / im.width)), Image.LANCZOS), f'{D}/{av}-{p}.webp', 82)
# asomarse: tiras de 8 × 512 → 8 × 256
for q in ('goma', 'boli', 'fosforito'):
    t = Image.open(f'{S}/personajes/{q}/asomarse/{q}-asomarse-tira.png').convert('RGBA')
    w(t.resize((2048, 256), Image.LANCZOS), f'/home/claude/cajon/public/juegos/motores/personajes/{q}-asomarse.webp', 85)
