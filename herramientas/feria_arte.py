# Pasa la entrega de ChatGPT (Feria de Otoño) a WebP para la web.
import os, numpy as np
from PIL import Image
S = '/mnt/user-data/uploads/para-claude-feria-otono'
M = '/home/claude/cajon/public/juegos/motores'
D = f'{M}/feria'
os.makedirs(f'{D}/premios', exist_ok=True)
def w(im, p, q=82): im.save(p, 'WEBP', quality=q, method=6)

# premio → juego (mismo orden que el encargo: cada animal lleva el objeto de su caseta)
PREMIOS = {
 'la-tombola': 'oso', 'el-candado-de-la-taquilla': 'gato', 'la-caja-registradora': 'cerdito', 'el-cambio': 'mapache',
 'la-noria': 'pulpo', 'los-patitos': 'pato', 'las-colchonetas': 'canguro', 'pares-y-nones': 'ratones-gemelos',
 'la-bascula': 'elefante', 'el-martillo-de-fuerza': 'gorila', 'la-tirolina': 'mono', 'la-caseta-de-los-records': 'jirafa',
 'tijeras-y-abanicos': 'pavo-real', 'las-banderolas': 'zorro', 'la-ruleta': 'buho', 'los-farolillos': 'luciernaga',
 'las-manzanas-de-caramelo': 'erizo', 'las-tiras-de-tickets': 'oruga', 'las-tres-cartas': 'conejo-mago',
 'el-puesto-de-chapas': 'tortuga', 'los-encargos': 'perro-cartero', 'el-gran-concurso': 'leon'}
for slug, a in PREMIOS.items():
    for suf in ['', '-silueta']:
        im = Image.open(f'{S}/premios/premio-{a}{suf}.png').convert('RGBA').resize((320, 320), Image.LANCZOS)
        w(im, f'{D}/premios/{slug}{suf}.webp', 82 if not suf else 70)
w(Image.open(f'{S}/premios/estanteria-premios.png').convert('RGB').resize((900, 1200), Image.LANCZOS), f'{D}/estanteria.webp', 78)

# fondo: la textura de base y las dos tiras (bombillas arriba, noria y palomitas abajo)
for o, (W, H) in {'horizontal': (1920, 1200), 'movil': (1080, 1920)}.items():
    k = 'h' if o == 'horizontal' else 'v'
    base = Image.open(f'{S}/fondos/feria/feria-{o}-encendida-fondo.png').convert('RGB')
    w(base.resize((W // 2, H // 2), Image.LANCZOS), f'{D}/fondo-{k}.webp', 70)
    for e in ['apagada', 'encendida']:
        arr = Image.open(f'{S}/fondos/feria/feria-{o}-{e}-delante.png').convert('RGBA')
        top = arr.crop((0, 0, W, arr.getbbox()[3] + 2))
        w(top, f'{D}/arriba-{k}-{e}.webp', 80)
    ab = Image.open(f'{S}/fondos/feria/feria-{o}-encendida-bordes.png').convert('RGBA')
    y0 = ab.getbbox()[1] - 2
    w(ab.crop((0, y0, W, H)), f'{D}/abajo-{k}.webp', 80)
    print(o, 'arriba alto', top.size, 'abajo desde', y0, 'alto', H - y0)

# portadas: la caseta recortada (de recorta_casetas.py) y las piezas sueltas
for n in ['tombola', 'taquilla', 'caja', 'noria']:
    im = Image.open(f'/tmp/feria/caseta-{n}.png'); print(n, im.size)
    w(im, f'{D}/caseta-{n}.webp', 84)
    for i in (1, 2, 3):
        p = f'{S}/portadas/portada-{n}-pieza-{i}.png'
        if not os.path.exists(p): continue
        pz = Image.open(p).convert('RGBA'); pz = pz.crop(pz.getbbox()); pz.thumbnail((240, 240), Image.LANCZOS)
        w(pz, f'{D}/pieza-{n}-{i}.webp', 84)

# Goma señala a la derecha: seis fotogramas de 512 → tira de 6 × 256 (mismo apoyo que las demás)
tira = Image.new('RGBA', (1536, 256))
for i in range(6):
    f = Image.open(f'{S}/personajes/goma/senalar_derecha/goma-senalar-derecha-0{i+1}.png').convert('RGBA').resize((256, 256), Image.LANCZOS)
    tira.alpha_composite(f, (i * 256, 0))
w(tira, f'{M}/personajes/goma-senalar_derecha.webp', 85)
