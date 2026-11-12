// Lee la configuración del juego (el bloque <script type="application/json" id="config">) y arranca su motor.
// Mientras se cargan el motor y los dibujos, el personaje del juego baila.
const MOTORES = { recta: './recta.js', cifras: './cifras.js', rejilla: './rejilla.js', geoplano: './geoplano.js', multiplica: './multiplica.js', formas: './formas.js', giros: './giros.js', reparto: './reparto.js', ceros: './ceros.js', examen: './examen.js', numeros: './numeros.js', linea: './linea.js', medida: './medida.js', caja: './caja.js', mental: './mental.js', angulos: './angulos.js', tablas: './tablas.js', vida: './vida.js' };

let capa = null;
try {
  const config = JSON.parse(document.getElementById('config').textContent);
  const ruta = MOTORES[config.motor];
  if (!ruta) throw new Error(`No conozco el motor «${config.motor}». Los que hay: ${Object.keys(MOTORES).join(', ')}.`);
  const quien = ['goma', 'boli', 'fosforito'].includes(config.personaje) ? config.personaje : 'goma';
  capa = document.createElement('div');
  capa.className = 'carga-baile' + (config.escena === 'feria' ? ' feria' : '');
  capa.setAttribute('role', 'status');
  document.body.append(capa);
  const t0 = performance.now();
  const { sprite, precarga } = await import('./sprites.js');
  capa.innerHTML = `<div class="bailarin">${sprite(quien, 'baile')}</div><b>Cargando…</b>`;
  const tope = new Promise((ok) => setTimeout(ok, 2500)); // con mala wifi no se espera a todos los dibujos
  const [{ arrancar }, motor] = await Promise.all([import('./nucleo.js'), import(ruta), Promise.race([precarga(quien), tope])]);
  let visto = false; try { visto = !!sessionStorage.getItem('cajon-bailado'); sessionStorage.setItem('cajon-bailado', '1'); } catch {}
  const falta = (visto ? 500 : 1200) - (performance.now() - t0); // la primera vez, un baile entero
  if (falta > 0 && !matchMedia('(prefers-reduced-motion: reduce)').matches) await new Promise((ok) => setTimeout(ok, falta));
  capa.classList.add('sale'); setTimeout(() => capa.remove(), 350);
  await arrancar(config, motor);
} catch (e) {
  capa?.remove();
  document.body.innerHTML = '';
  const p = document.createElement('pre');
  p.style.cssText = 'margin:24px;padding:16px;background:#fff;border-left:8px solid #c8201a;white-space:pre-wrap;font-size:16px';
  p.textContent = 'Este juego tiene un error en su configuración:\n\n' + e.message;
  document.body.append(p);
  console.error(e);
}
