// Portadas del catálogo: la pantalla de título de cada juego, ya montada
import { chromium } from 'playwright';
const juegos = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
for (const j of juegos) {
  await p.goto(`http://localhost:8765/juegos/${j}/`); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('cajon-mapa:' + location.pathname, '1'); }); await p.reload();
  await p.waitForTimeout(3400);
  await p.screenshot({ path: `/tmp/por-${j}.png` });
}
await b.close();
