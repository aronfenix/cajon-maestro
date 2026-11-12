import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://localhost:8765/'); await p.evaluate(() => { localStorage.clear(); localStorage.setItem('cajon-mapa:/juegos/el-maniqui-de-ciencias/', '1'); });
await p.goto('http://localhost:8765/juegos/el-maniqui-de-ciencias/'); await p.waitForTimeout(2500);
await p.evaluate(() => document.querySelectorAll('.vineta-capa').forEach((c) => c.remove())); await p.waitForTimeout(300);
await p.screenshot({ path: '/tmp/por-el-maniqui-de-ciencias.png' });
await b.close();
