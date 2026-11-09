import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const errs = []; p.on('pageerror', (e) => errs.push(e.message));
await p.goto('http://localhost:8765/juegos/la-tombola/?sinportada'); await p.waitForTimeout(300);
await p.evaluate(() => { localStorage.clear(); localStorage.setItem('cajon-progreso:/juegos/la-tombola/', JSON.stringify({ progreso: 99, nivel: 7 })); localStorage.setItem('cajon-historia:/juegos/la-tombola/', '1'); });
await p.reload(); await p.waitForTimeout(1800);
const nums = await p.$$eval('.cesta-tombola .boleto', (bs) => bs.map((b) => +b.dataset.n));
const sube = (await p.$eval('.reto', (r) => r.textContent)).includes('menor a mayor');
const orden = [...nums].sort((a, b) => (sube ? a - b : b - a));
for (let i = 0; i < orden.length; i++) { await p.click(`.boleto[data-n="${orden[i]}"]`); await p.click(`.hueco-boleto[data-i="${i}"]`, { position: { x: 6, y: 90 } }); }
await p.click('.acciones .tecla'); await p.waitForTimeout(1500);
await p.click('.correccion .tecla.primaria'); await p.waitForTimeout(1600);
await p.screenshot({ path: '/tmp/final.png' });
// mapa con una caseta recién encendida
await p.goto('http://localhost:8765/juegos/la-feria-de-otono/'); await p.evaluate(() => { localStorage.setItem('cajon-mapa:/juegos/la-feria-de-otono/', '1'); localStorage.setItem('cajon-hecho:/juegos/el-candado-de-la-taquilla/', '1'); });
await p.reload(); await p.waitForTimeout(2600); await p.screenshot({ path: '/tmp/mapa-baile.png' });
console.log(errs.join(' | ') || 'sin errores');
await b.close();
