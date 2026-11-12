// capturas sueltas: node fvida2.mjs ancho alto slug:nivel ...
import { chromium } from 'playwright';
const [w, h, ...que] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const ctx = await b.newContext({ viewport: { width: +w, height: +h }, hasTouch: +w < 900 });
const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(e.message));
for (const q of que) {
  const [slug, L] = q.split(':');
  await p.goto('http://localhost:8765/');
  await p.evaluate(([s, L]) => { localStorage.clear(); localStorage.setItem('cajon-progreso:/juegos/' + s + '/', JSON.stringify({ progreso: 5, nivel: +L })); }, [slug, L]);
  await p.goto(`http://localhost:8765/juegos/${slug}/?sinportada`); await p.waitForTimeout(1800);
  await p.screenshot({ path: `/tmp/w-${slug}-${L}-${w}.png` });
}
console.log(err.join(' | ') || 'sin errores'); await b.close();
