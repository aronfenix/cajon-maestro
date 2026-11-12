// Prueba los juegos de Naturales: cada nivel de cada juego, captura del reto y lo juega a lo bruto hasta la corrección.
// node fvida.mjs [slug ...]   (servidor de public/ en :8765)
import { chromium } from 'playwright';
const JUEGOS = { 'el-portero-de-la-celula': 6, 'una-o-muchas': 5, 'la-lupa': 6, 'la-miga-perdida': 8, 'la-consulta': 5, 'la-cadena-del-balon': 6, 'tira-y-afloja': 7, 'la-primera-celula': 7, 'el-examen-del-maniqui': 10 };
const pedidos = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const ancho = process.argv.includes('--movil') ? [390, 844] : [1280, 800];
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const ctx = await b.newContext({ viewport: { width: ancho[0], height: ancho[1] }, hasTouch: ancho[0] < 500, reducedMotion: 'reduce' });
const p = await ctx.newPage();
const errores = [];
p.on('pageerror', (e) => errores.push(e.message));
p.on('console', (m) => m.type() === 'error' && errores.push(m.text()));
const clic = async (sel) => { const l = p.locator(sel).first(); if (await l.count() && await l.isEnabled().catch(() => false)) { await l.click({ timeout: 2000 }).catch(() => {}); return true; } return false; };
const corrige = () => p.locator('.correccion:not([hidden])').count();
async function juega() {
  for (let vuelta = 0; vuelta < 40 && !(await corrige()); vuelta++) {
    if (await p.locator('.v-portero').count()) { await clic('.acciones .tecla'); await p.waitForTimeout(150); continue; }
    if (await p.locator('.v-averia').count()) { await clic('.v-tarjeta:not(.tachada):not(:disabled)'); await clic('.acciones .tecla'); continue; }
    if (await p.locator('.v-cuenta').count()) { await clic('.v-stepper .tecla >> nth=1'); await clic('.v-botones-cel .tecla'); await clic('.acciones .tecla'); continue; }
    if (await p.locator('.v-lupa').count()) { await clic('.acciones .tecla'); continue; }
    if (await p.locator('.v-cadena').count()) { for (let k = 0; k < 8; k++) await clic('.v-monton .v-ficha:not(.puesta)'); await clic('.acciones .tecla'); await clic('.v-hueco >> nth=0'); continue; }
    if (await p.locator('.v-opciones-salida').count()) { await clic('.v-opciones-salida .v-tarjeta:not(:disabled)'); await p.waitForTimeout(150); continue; }
    if (await p.locator('.v-ruta').count()) { await clic('.v-opciones-ruta .v-tarjeta:not(:disabled)'); await p.waitForTimeout(100); continue; }
    if (await p.locator('.v-musculos').count()) { await clic('.v-musc >> nth=0 >> .tecla >> nth=0'); await clic('.v-musc >> nth=1 >> .tecla >> nth=1'); await clic('.acciones .tecla'); await p.waitForTimeout(700); continue; }
    if (await p.locator('.v-articulaciones').count()) { await clic('.v-art >> nth=3'); await clic('.acciones .tecla'); continue; }
    if (await p.locator('.v-divide').count()) { await p.fill('.v-divide input', '4').catch(() => {}); await clic('.acciones .tecla'); await p.waitForTimeout(400); continue; }
    await p.waitForTimeout(200);
  }
  return corrige();
}
for (const [slug, n] of Object.entries(JUEGOS)) {
  if (pedidos.length && !pedidos.includes(slug)) continue;
  for (let L = 0; L < n; L++) {
    await p.goto('http://localhost:8765/');
    await p.evaluate(([s, L]) => { localStorage.clear(); localStorage.setItem('cajon-progreso:/juegos/' + s + '/', JSON.stringify({ progreso: 5, nivel: L })); }, [slug, L]);
    await p.goto(`http://localhost:8765/juegos/${slug}/?sinportada`);
    await p.waitForSelector('.reto', { timeout: 8000 }).catch(() => errores.push(slug + ' sin reto'));
    await p.waitForTimeout(600);
    await p.screenshot({ path: `/tmp/v-${slug}-${L}${ancho[0] < 500 ? 'm' : ''}.png` });
    const ok = await juega();
    const msg = ok ? (await p.locator('.correccion .texto p').first().innerText()).slice(0, 90) : 'SIN CORRECCIÓN';
    console.log(slug, L, ok ? 'ok' : 'FALLA', '·', msg.replace(/\n/g, ' '));
  }
}
console.log(errores.length ? 'ERRORES: ' + [...new Set(errores)].join(' | ') : 'sin errores');
await b.close();
