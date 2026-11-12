import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [w, h] of [[1280, 800], [390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } }); const err = []; p.on('pageerror', (e) => err.push(e.message));
  await p.goto('http://localhost:8765/');
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('cajon-mapa:/juegos/el-maniqui-de-ciencias/', '1'); for (const s of ['el-portero-de-la-celula', 'una-o-muchas', 'la-miga-perdida']) localStorage.setItem(`cajon-hecho:/juegos/${s}/`, '2026-11-12'); });
  await p.goto('http://localhost:8765/juegos/el-maniqui-de-ciencias/'); await p.waitForTimeout(2500);
  await p.evaluate(() => document.querySelectorAll('.vineta-capa').forEach((c) => c.remove())); await p.waitForTimeout(300);
  await p.screenshot({ path: `/tmp/mapa-${w}.png`, fullPage: w < 900 });
  console.log(err.join(' | ') || 'ok');
  await p.close();
}
await b.close();
