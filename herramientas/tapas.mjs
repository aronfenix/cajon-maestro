// Tapas del catálogo: la portada del juego sin el texto pequeño y con el título enorme, para que se lea en miniatura.
// node tapas.mjs slug… → /tmp/por-<slug>.png (1280×800)
import { chromium } from 'playwright';
const juegos = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
const CSS = `.portada-objetivo,.portada-jugar,.portada-estado,.portada-volver,.portada-bocadillo{display:none!important}
.portada-capa{grid-template-columns:minmax(0,.72fr) minmax(0,1.28fr)!important;padding:5vh 4vw 6vh!important}
.portada-texto{max-width:none!important;width:100%}
.portada-etiqueta{padding:18px 26px 24px!important;border-width:5px!important}
.portada-titulo{font-size:var(--fs,120px)!important;line-height:.92!important}
.portada-personaje{transform:scale(.8);transform-origin:100% 100%}`;
for (const j of juegos) {
  await p.goto(`http://localhost:8765/juegos/${j}/`);
  await p.evaluate(() => { localStorage.clear(); localStorage.setItem('cajon-mapa:' + location.pathname, '1'); });
  await p.reload(); await p.waitForTimeout(3400);
  const ok = await p.evaluate((css) => {
    const t = document.querySelector('.portada-titulo'); if (!t) return false;
    document.head.append(Object.assign(document.createElement('style'), { textContent: css }));
    const caja = document.querySelector('.portada-texto');
    // el título más grande que quepa en la columna sin pasar de 3 líneas ni de 560 px de alto
    for (let fs = 170; fs >= 70; fs -= 4) {
      t.style.setProperty('--fs', fs + 'px');
      const et = document.querySelector('.portada-etiqueta'); const e = { width: et.offsetWidth, height: et.offsetHeight }; // sin el giro
      const lineas = Math.round(t.offsetHeight / (fs * 0.92));
      if (e.width <= caja.offsetWidth + 1 && e.height <= 640 && lineas <= 3 && t.scrollWidth <= t.clientWidth + 1) break;
    }
    return true;
  }, CSS);
  await p.waitForTimeout(250);
  await p.screenshot({ path: `/tmp/por-${j}.png` });
  console.log(j, ok ? 'tapa' : 'sin título (captura normal)');
}
await b.close();
