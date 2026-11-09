// Panorámica: cada juego en tres tamaños. Errores, desbordes, scroll necesario, pistas.
import { chromium } from 'playwright';
import fs from 'fs';
const juegos = (process.env.J ? process.env.J.split(',') : fs.readdirSync('/home/claude/cajon/public/juegos')).filter((j) => { try { return fs.readFileSync(`/home/claude/cajon/public/juegos/${j}/index.html`, 'utf8').includes('arranque.js'); } catch { return false; } });
const tamaños = [[1280, 800, 'pc'], [1024, 768, 'tab'], [390, 844, 'mov']].filter((x) => (process.env.T || 'pc,tab,mov').split(',').includes(x[2]));
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const informe = [];
for (const [w, h, t] of tamaños) {
  const p = await b.newPage({ viewport: { width: w, height: h }, hasTouch: t !== 'pc' });
  for (const j of juegos) {
    const err = [];
    p.removeAllListeners('pageerror'); p.removeAllListeners('console');
    p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => m.type() === 'error' && err.push(m.text()));
    for (let nivel of [0, 3]) {
      await p.goto(`http://localhost:8765/juegos/${j}/?sinportada`);
      await p.evaluate((n) => { localStorage.clear(); if (n) localStorage.setItem('cajon-progreso:' + location.pathname, JSON.stringify({ progreso: 30, nivel: n })); }, nivel);
      await p.reload(); await p.waitForTimeout(1300);
      const m = await p.evaluate(() => {
        const main = document.querySelector('.mesa-juego');
        const fuera = [...document.querySelectorAll('.escenario *')].filter((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && (r.right > innerWidth + 2 || r.left < -2); }).length;
        const acc = document.querySelector('.acciones'); const ra = acc?.getBoundingClientRect();
        const asis = document.querySelector('.bocadillo:not([hidden])')?.getBoundingClientRect();
        const esc = document.querySelector('.escenario')?.getBoundingClientRect();
        const tapa = asis && esc && asis.left < esc.right && asis.top < esc.bottom && asis.bottom > esc.top;
        const peq = [...document.querySelectorAll('.escenario button, .acciones button')].filter((x) => { const r = x.getBoundingClientRect(); return r.width && (r.width < 40 || r.height < 40); }).length;
        return { scroll: main ? Math.round(main.scrollHeight - main.clientHeight) : 0, fuera, accionesFuera: ra ? Math.round(ra.bottom - innerHeight) : null, bocadilloTapa: !!tapa, peq };
      });
      for (let i = 0; i < 3; i++) await p.locator('.boton-ayuda').click({ force: true, timeout: 1500 }).catch(() => {});
      await p.waitForTimeout(400);
      if (nivel === 0) await p.screenshot({ path: `/tmp/au-${t}-${j}.png` });
      informe.push({ t, j, nivel, ...m, err: [...new Set(err)].slice(0, 3) });
      err.length = 0;
    }
  }
  await p.close();
}
fs.writeFileSync('/tmp/auditoria.json', JSON.stringify(informe, null, 1));
for (const r of informe) { const malo = r.err.length || r.fuera || r.accionesFuera > 0 || r.scroll > 40 || r.peq; if (malo) console.log(r.t, r.j, 'n' + r.nivel, `scroll=${r.scroll}`, `fuera=${r.fuera}`, `accFuera=${r.accionesFuera}`, `tapa=${r.bocadilloTapa}`, `peq=${r.peq}`, r.err.join(' | ').slice(0, 160)); }
await b.close();
