// node fniveles.mjs slug [ancho alto] → /tmp/n-slug.png con todos los niveles en rejilla
import { chromium } from 'playwright';
import { execSync } from 'child_process';
const [slug, w = 1280, h = 800] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
p.on('console', (m) => m.type() === 'error' && errs.push('CON ' + m.text()));
await p.goto(`http://localhost:8765/juegos/${slug}/?sinportada`); await p.waitForTimeout(800);
const n = await p.evaluate(() => JSON.parse(document.getElementById('config').textContent).niveles.length);
const files = [];
for (let k = 0; k < n; k++) {
  await p.evaluate(([s, k]) => localStorage.setItem(`cajon-progreso:/juegos/${s}/`, JSON.stringify({ progreso: 5, nivel: k })), [slug, k]);
  await p.reload(); await p.waitForTimeout(+(process.env.ESPERA || 1700));
  const f = `/tmp/nv-${k}.png`; await p.screenshot({ path: f }); files.push(f);
}
await b.close();
execSync(`python3 -c "
from PIL import Image
fs='${files.join(',')}'.split(',')
ims=[Image.open(f) for f in fs]; W,H=ims[0].size; c=3 if len(ims)>4 else 2; r=(len(ims)+c-1)//c
o=Image.new('RGB',(W*c,H*r),'white')
for i,im in enumerate(ims): o.paste(im,((i%c)*W,(i//c)*H))
o.thumbnail((1900,1900)); o.save('/tmp/n-${slug}.png')"`);
console.log(slug, n, 'niveles', errs.join(' | ') || 'sin errores');
