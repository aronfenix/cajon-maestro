# Segunda entrega de portadas de la feria (18): recorte de la caseta y piezas sueltas en WebP.
import os, subprocess
from PIL import Image
S = '/mnt/user-data/uploads/para-claude-feria-otono-2/portadas'
D = '/home/claude/cajon/public/juegos/motores/feria'
CLAVES = ['el-cambio','los-patitos','las-colchonetas','pares-y-nones','la-bascula','el-martillo-de-fuerza','la-tirolina',
  'la-caseta-de-los-records','tijeras-y-abanicos','las-banderolas','la-ruleta','los-farolillos','las-manzanas-de-caramelo',
  'las-tiras-de-tickets','las-tres-cartas','el-puesto-de-chapas','los-encargos','el-gran-concurso']
os.makedirs('/tmp/feria2', exist_ok=True)
subprocess.run(['python3', '/home/claude/herramientas/recorta_casetas.py', S, '/tmp/feria2', *CLAVES], check=True)
for n in CLAVES:
    Image.open(f'/tmp/feria2/caseta-{n}.png').save(f'{D}/caseta-{n}.webp', 'WEBP', quality=84, method=5)
    i = 1
    while os.path.exists(f'{S}/portada-{n}-pieza-{i}.png'):
        pz = Image.open(f'{S}/portada-{n}-pieza-{i}.png').convert('RGBA'); pz = pz.crop(pz.getbbox()); pz.thumbnail((240, 240), Image.LANCZOS)
        pz.save(f'{D}/pieza-{n}-{i}.webp', 'WEBP', quality=84, method=5); i += 1
    print(n, i - 1, 'piezas')
