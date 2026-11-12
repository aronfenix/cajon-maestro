import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } }); const err = []; p.on('pageerror', (e) => err.push(e.message));
const urls = []; p.on('request', (r) => { if (r.url().includes('/motores/') && r.url().includes('.js')) urls.push(r.url()); });
await p.goto('http://localhost:8791/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('cajon-progreso:/juegos/el-examen-del-maniqui/', JSON.stringify({ progreso: 5, nivel: 4 })); });
await p.goto('http://localhost:8791/juegos/el-examen-del-maniqui/?sinportada'); await p.waitForTimeout(2500);
console.log(await p.locator('.reto').innerText(), '|', await p.locator('.v-opciones-salida').count());
console.log('módulos sin versión:', urls.filter((u) => !u.includes('?v=')).length, 'de', urls.length, err.join(' | '));
await b.close();
