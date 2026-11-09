// Prueba de humo de la web: falla (código 1) si algo se rompe.  Uso: node humo.mjs  (tras npm run build)
// Sirve dist/ en :8791. Páginas clave en pc, tablet táctil y móvil; enlaces; animaciones de scroll; transiciones; todos los juegos.
import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
const DIST = '/home/claude/cajon/dist', B = 'http://localhost:8791';
try { execSync(`curl -sf -o /dev/null ${B}/`); } catch { execSync(`setsid nohup python3 -m http.server 8791 --directory ${DIST} >/tmp/srv-dist.log 2>&1 < /dev/null & sleep 1.2`, { shell: '/bin/bash' }); }
const PAGINAS = ['', 'todo/', 'matematicas/', 'materiales/la-noria/', 'materiales/la-feria-de-otono/', 'materiales/la-gran-limpieza/', '404.html'];
const TAM = [['pc', 1280, 800, false], ['tab', 1024, 768, true], ['tabv', 768, 1024, true], ['mov', 390, 844, true]];
const fallos = []; const mal = (m) => { fallos.push(m); console.log('  ✗ ' + m); };
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const enlaces = new Set();
for (const [t, w, h, touch] of TAM) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch && w < 500 });
  const p = await ctx.newPage();
  for (const ruta of PAGINAS) {
    const err = [];
    p.removeAllListeners(); p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => m.type() === 'error' && err.push(m.text()));
    p.on('response', (r) => r.url().startsWith(B) && r.status() >= 400 && !(ruta === '404.html' && r.url().endsWith('404.html')) && err.push(`${r.status()} ${r.url().slice(B.length)}`));
    await p.goto(`${B}/${ruta}`); await p.waitForTimeout(700);
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } scrollTo(0, 0); });
    await p.waitForTimeout(300);
    const d = await p.evaluate(() => {
      const nombres = [...document.querySelectorAll('*')].map((e) => getComputedStyle(e).viewTransitionName).filter((n) => n && n !== 'none');
      const dup = [...new Set(nombres.filter((n, i) => nombres.indexOf(n) !== i))];
      const tl = (sel) => { const e = document.querySelector(sel); return e ? getComputedStyle(e).animationTimeline : null; };
      const ancho = document.documentElement.scrollWidth - innerWidth;
      return { dup, tapa: tl('.tapa-suelta'), fila: tl('.fila > li'), ancho, hrefs: [...document.querySelectorAll('a[href]')].map((a) => a.href), alto: document.body.scrollHeight };
    });
    d.hrefs.filter((u) => u.startsWith(B)).forEach((u) => enlaces.add(u.split('#')[0].split('?')[0]));
    const id = `${t} /${ruta}`;
    err.forEach((e) => mal(`${id}: ${e}`));
    if (d.dup.length) mal(`${id}: view-transition-name repetido ${d.dup.join(', ')}`);
    if (d.ancho > 1) mal(`${id}: desborda en horizontal ${d.ancho}px`);
    if (d.tapa === 'auto') mal(`${id}: la tapa no va con el scroll (animation-timeline auto)`);
    if (ruta === '' && d.fila === 'auto') mal(`${id}: filas sin animation-timeline`);
    console.log(`${id}: alto ${d.alto}px`);
  }
  await ctx.close();
}
// enlaces internos
const api = (await b.newContext()).request; // (el fetch de Node se atraganta con el servidor de Python)
for (const u of enlaces) { const r = await api.get(u); if (r.status() >= 400) mal(`enlace roto ${u.slice(B.length)} → ${r.status()}`); }
console.log(`${enlaces.size} enlaces internos revisados`);
// todos los juegos arrancan
const juegos = fs.readdirSync(`${DIST}/juegos`).filter((j) => { try { return fs.readFileSync(`${DIST}/juegos/${j}/index.html`, 'utf8').includes('arranque.js'); } catch { return false; } });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
for (const j of juegos) {
  const err = []; p.removeAllListeners(); p.on('pageerror', (e) => err.push(e.message)); p.on('console', (m) => m.type() === 'error' && err.push(m.text()));
  await p.goto(`${B}/juegos/${j}/`); await p.waitForTimeout(1400);
  const ok = await p.evaluate(() => !!document.querySelector('.portada, .portada-capa, .mapa, .mesa-juego, .mapa-cajon, [class*="mapa"]'));
  err.forEach((e) => mal(`juego ${j}: ${e}`)); if (!ok) mal(`juego ${j}: no llega a pintar nada`);
}
console.log(`${juegos.length} juegos arrancados`);
await b.close();
console.log(fallos.length ? `\n${fallos.length} FALLOS` : '\nTODO BIEN');
process.exit(fallos.length ? 1 : 0);
