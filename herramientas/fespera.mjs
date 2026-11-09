import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const err = []; p.on('pageerror', (e) => err.push(e.message));
await p.clock.install();
await p.goto('http://localhost:8765/juegos/la-noria/?sinportada');
await p.clock.runFor(3000);
await p.evaluate(() => document.querySelector('.bocadillo')?.setAttribute('hidden', ''));
await p.clock.runFor(18000); for (let i = 0; i < 10; i++) { await p.clock.runFor(1000); console.log(i, await p.evaluate(() => document.querySelector('.asistente .sprite')?.dataset.accion)); }

console.log(await p.evaluate(() => [document.body.className, !!document.querySelector('.bocadillo')?.hidden, document.querySelector('.asistente .sprite')?.dataset.accion].join(' ')), err.join(';') || 'ok');
await b.close();
