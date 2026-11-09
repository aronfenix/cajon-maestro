// node fsitio2.mjs ruta ancho alto nombre scrollY  → captura de la ventana tras hacer scroll (con imágenes cargadas)
import { chromium } from 'playwright';
const [ruta, w, h, n, y = 0] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
const err = []; p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => m.type() === 'error' && err.push(m.text()));
await p.goto('http://localhost:8791/' + ruta); await p.waitForTimeout(500);
await p.evaluate((y) => window.scrollTo(0, +y), y); await p.waitForTimeout(1500);
await p.screenshot({ path: `/tmp/s-${n}.png` });
console.log(n, err.join(' | ') || 'sin errores');
await b.close();
