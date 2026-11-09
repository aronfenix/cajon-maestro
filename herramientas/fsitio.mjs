// node fsitio.mjs ruta ancho alto nombre [completa]
import { chromium } from 'playwright';
const [ruta, w, h, n, full] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: +w, height: +h } });
await p.goto('http://localhost:8791/' + ruta); await p.waitForTimeout(1200);
await p.screenshot({ path: `/tmp/s-${n}.png`, fullPage: !!full });
await b.close();
