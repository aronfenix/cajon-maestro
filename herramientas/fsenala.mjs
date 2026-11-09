// Comprueba el gesto de señalar en la portada (pc y móvil) y en una pista con «ver»
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [slug, w, hh] of [['la-tombola', 1280, 800], ['la-tombola', 390, 844], ['la-noria', 1280, 800]]) {
  const p = await b.newPage({ viewport: { width: w, height: hh } });
  const err = []; p.on('pageerror', (e) => err.push(e.message));
  await p.goto(`http://localhost:8765/juegos/${slug}/`);
  const acc = [];
  for (let i = 0; i < 14; i++) { await p.waitForTimeout(350); acc.push(await p.evaluate(() => { const s = document.querySelector('.portada-figura .sprite'); return s ? s.dataset.accion + (s.hasAttribute('data-espejo') ? '*' : '') : '-'; })); }
  console.log(slug, w, [...new Set(acc)].join(' → '), err.join(';') || 'ok');
  await p.close();
}
await b.close();
