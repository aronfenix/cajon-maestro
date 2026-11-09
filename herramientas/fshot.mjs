// node fshot.mjs slug [ancho alto] [query] → /tmp/f-slug.png, y errores de consola
import { chromium } from 'playwright';
const [slug, w = 1280, h = 800, q = 'sinportada'] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const errs = [];
p.on('pageerror', (e) => errs.push('PAGE ' + e.message));
p.on('console', (m) => m.type() === 'error' && errs.push('CON ' + m.text()));
await p.goto(`http://localhost:8765/juegos/${slug}/?${q}`);
await p.waitForTimeout(+(process.env.ESPERA || 2200));
if (process.env.JS) { await p.evaluate(process.env.JS); await p.waitForTimeout(+(process.env.ESPERA2 || 1500)); }
await p.screenshot({ path: `/tmp/f-${slug}${process.env.SUF || ''}.png` });
console.log(slug, errs.join('\n') || 'sin errores');
await b.close();
