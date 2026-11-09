// node festante.mjs [ancho alto] → /tmp/est-<ancho>.png (mapa de la feria con 9 premios y la estantería abierta)
import { chromium } from 'playwright';
const [w = 1280, h = 800] = process.argv.slice(2).map(Number);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
const err = []; p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => m.type() === 'error' && err.push(m.text()));
await p.goto('http://localhost:8765/juegos/la-feria-de-otono/');
await p.evaluate(() => {
  const hechos = ['la-tombola', 'el-candado-de-la-taquilla', 'la-caja-registradora', 'el-cambio', 'la-noria', 'la-bascula', 'la-ruleta', 'las-tres-cartas', 'el-puesto-de-chapas'];
  localStorage.setItem('cajon-mapa:' + location.pathname, '1');
  for (const s of hechos) { localStorage.setItem('cajon-hecho:/juegos/' + s + '/', '2026-11-09'); localStorage.setItem('cajon-pegada:/juegos/' + s + '/', '1'); }
});
await p.reload(); await p.waitForTimeout(2500);
await p.screenshot({ path: `/tmp/map-${w}.png` });
await p.click('.boton-album'); await p.waitForTimeout(1800);
await p.screenshot({ path: `/tmp/est-${w}.png` });
await p.click('.premio-balda.falta'); await p.waitForTimeout(500);
await p.screenshot({ path: `/tmp/est2-${w}.png` });
console.log(err.join('\n') || 'sin errores'); await b.close();
