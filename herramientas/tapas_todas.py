# Rehace las portadas del catálogo de todos los juegos con motor (no los mapas): tapa con título grande.
import re, glob, json, subprocess, sys
from PIL import Image
R = '/home/claude/cajon'
slugs = []
for f in sorted(glob.glob(f'{R}/src/content/materiales/*.md')):
    s = open(f).read()
    m = re.search(r'^enlace:\s*/?juegos/([^/\s]+)/?\s*$', s, re.M)
    if not m or not re.search(r'^portada:', s, re.M): continue
    slug = m.group(1)
    try: html = open(f'{R}/public/juegos/{slug}/index.html').read()
    except FileNotFoundError: continue
    if 'arranque.js' not in html: continue
    cfg = json.loads(re.search(r'<script type="application/json"[^>]*>(.*?)</script>', html, re.S).group(1))
    if 'compartimentos' in cfg: continue  # los mapas conservan su captura
    slugs.append(slug)
slugs = [s for s in slugs if not sys.argv[1:] or s in sys.argv[1:]]
print(len(slugs), 'tapas')
subprocess.run(['node', '/home/claude/herramientas/tapas.mjs', *slugs], check=True)
for s in slugs:
    Image.open(f'/tmp/por-{s}.png').convert('RGB').resize((800, 500), Image.LANCZOS).save(f'{R}/src/media/portadas/{s}.jpg', quality=86)
