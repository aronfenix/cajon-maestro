// Motor «reparto»: la merienda (división).
//   bandejas    → ¿cuántas bandejas de N se llenan y cuántas golosinas sobran? (con "manos": true se puede llenar a mano)
//   paquetes    → repartir cajas de 100, bolsas de 10 y sueltas entre amigos, abriendo lo que no llegue (el algoritmo)
//   calculadora → la calculadora del Sacapuntas da un decimal: ¿cuántas bandejas llenas y cuántas sobran?
import { el, svg, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, bote, chispasEn, temblor, vuela, mano } from './efectos.js';

const T = '#1b1e3a';
const COLORES = ['#ff7fae', '#ffc531', '#5ec3ff', '#9bd84a', '#ff9f45', '#b79cff'];
const lee = (input) => { const t = String(input.value).replace(/[\s.]/g, ''); return t === '' || !/^\d+$/.test(t) ? null : Number(t); };
function campo(etiqueta, ancho = 5) {
  const i = el('input', { class: 'campo-num', inputmode: 'numeric', autocomplete: 'off', 'aria-label': etiqueta, maxlength: 6, style: { width: ancho + 'ch' } });
  i.addEventListener('input', () => { i.value = i.value.replace(/[^\d]/g, ''); i.classList.remove('mal', 'bien'); });
  return i;
}
// un caramelo envuelto
const caramelo = (k) => { const c = COLORES[k % COLORES.length]; return svg('0 0 44 28', `<path d="M10 14 L1 5 L3 23Z M34 14 L43 5 L41 23Z" fill="${c}" stroke="${T}" stroke-width="2.4" stroke-linejoin="round"/><ellipse cx="22" cy="14" rx="13" ry="11" fill="${c}" stroke="${T}" stroke-width="2.6"/><path d="M15 10 q4 -4 9 -3" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.6" stroke-linecap="round"/>`, { class: 'caramelo' }); };
const CAJA = svg('0 0 60 48', `<rect x="3" y="10" width="54" height="34" rx="4" fill="#e0ad70" stroke="${T}" stroke-width="3"/><path d="M3 10 l8 -7 h38 l8 7" fill="#f0c48c" stroke="${T}" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="18" width="16" height="10" rx="2" fill="#fffdf6" stroke="${T}" stroke-width="2"/><text x="30" y="26.5" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="8" fill="${T}">100</text>`);
const BOLSA = svg('0 0 44 52', `<path d="M8 14 Q4 48 22 49 Q40 48 36 14Z" fill="#ff7fae" stroke="${T}" stroke-width="3" stroke-linejoin="round"/><path d="M10 14 q12 -12 24 0" fill="none" stroke="${T}" stroke-width="3"/><path d="M12 12 l20 0" stroke="#ffc531" stroke-width="5" stroke-linecap="round"/><text x="22" y="36" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="13" fill="${T}">10</text>`);

/* ================================================================ generar */
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  const rango = (r, def) => azar(...(r ?? def));
  if (d.modo === 'bandejas') {
    d.tam = rango(g.tam, [3, 6]);
    const q = rango(g.llenas, [2, 6]);
    d.resto = Math.random() < (g.exactas ?? 0.15) ? 0 : azar(1, d.tam - 1);
    d.total = q * d.tam + d.resto;
    return d;
  }
  if (d.modo === 'paquetes') {
    d.amigos = rango(g.amigos, [2, 4]);
    d.total = rango(g.total, [120, 480]);
    return d;
  }
  if (d.modo === 'calculadora') {
    d.tam = elige(g.tam ?? [6, 8, 12, 25]);
    const q = rango(g.llenas, [8, 40]);
    d.resto = azar(1, d.tam - 1);
    d.total = q * d.tam + d.resto;
    return d;
  }
  return d;
}
export function ronda(d, ctx) {
  return { bandejas, paquetes, calculadora }[d.modo](d, ctx);
}

/* ================================================================ bandejas */
function bandejas(d, ctx) {
  const { total: N, tam } = d;
  const q = Math.floor(N / tam), r = N % tam;
  ctx.reto(d.texto ?? `Hay **${num(N)} caramelos**. En cada bandeja caben **${tam}**. ¿Cuántas bandejas se llenan y cuántos sobran?`);
  ctx.pista(d.pista ?? (d.manos ? 'Puedes llenar bandejas con el botón y contarlas, o pensarlo de cabeza.' : 'Piensa qué número de la tabla del ' + tam + ' se acerca más sin pasarse.'));
  const monton = el('div', { class: 'monton', 'aria-label': `${N} caramelos` });
  const piezas = Array.from({ length: N }, (_, i) => { const c = el('span', { class: 'golosina' }, caramelo(i)); c.style.rotate = azar(-25, 25) + 'deg'; monton.append(c); return c; });
  const fila = el('div', { class: 'fila-bandejas', 'aria-live': 'polite' });
  const llenas = campo('Bandejas llenas', 4), sobran = campo('Caramelos que sobran', 4);
  const preguntas = el('div', { class: 'preguntas-reparto' },
    el('label', {}, el('span', { text: 'Bandejas llenas' }), llenas),
    el('label', {}, el('span', { text: 'Sobran' }), sobran));
  ctx.escenario.append(el('div', { class: 'mantel-merienda' }, monton, fila), preguntas);
  let hechas = 0, hecho = false;
  const nuevaBandeja = () => { const b = el('div', { class: 'bandeja-golosinas', style: { '--tam': Math.min(tam, 6) } }); fila.append(b); return b; };
  async function llenaUna(rapido = false) {
    const libres = piezas.filter((p) => p.isConnected && p.parentNode === monton);
    if (libres.length < tam) { ctx.aviso(`Quedan ${libres.length}: no llegan para otra bandeja de ${tam}.`, true); temblor(monton, 4); return false; }
    const b = nuevaBandeja(); hechas++;
    gsap.from(b, { scale: 0.6, opacity: 0, duration: 0.3, ease: 'back.out(2)' });
    for (const p of libres.slice(0, tam)) {
      const queda = p.cloneNode(true); queda.style.rotate = '0deg'; queda.style.visibility = 'hidden'; b.append(queda);
      vuela(p, queda, p.cloneNode(true), { ms: rapido ? 180 : 280, escala: 1, alFinal: () => (queda.style.visibility = '') });
      p.remove();
      if (!rapido) { suena('pon'); await espera(60); } else await espera(12);
    }
    suena('selloBien', hechas - 1);
    return true;
  }
  if (d.manos) {
    ctx.boton('Llenar una bandeja', () => !hecho && llenaUna(), true);
    if (ctx.primera) setTimeout(() => { const b = ctx.acciones.querySelector('.tecla:not(.primaria)'); if (b) mano(b, { dx: 0.5 }); }, 900);
  }
  const comprobar = ctx.boton('Comprobar', revisar);
  [llenas, sobran].forEach((i) => i.addEventListener('keydown', (e) => e.key === 'Enter' && revisar()));
  ctx.pistas([
    { texto: d.pistas?.[0] ?? `Repartir en bandejas de ${tam} es lo mismo que buscar **cuántas veces cabe el ${tam}** en ${num(N)}.` },
    { texto: d.pistas?.[1] ?? 'Te escribo la tabla hasta pasarte.', ver: () => { const t = []; for (let k = 1; k * tam <= N + tam; k++) t.push(`${k} × ${tam} = ${k * tam}`); preguntas.append(el('p', { class: 'tabla-pista', text: t.join(' · ') })); } },
    { texto: d.pistas?.[2] ?? 'Te lleno las bandejas: cuéntalas tú y mira lo que queda.', ver: async () => { while (await llenaUna(true)); } },
  ]);
  async function revisar() {
    if (hecho) return;
    const a = lee(llenas), b = lee(sobran);
    if (a == null || b == null) return ctx.aviso('Escribe las dos cosas: bandejas llenas y los que sobran.', true);
    if (b >= tam) { ctx.aviso(`Si sobran ${b}, todavía se llena otra bandeja de ${tam}.`, true); sobran.classList.add('mal'); temblor(sobran, 5); return; }
    hecho = true; comprobar.disabled = true;
    ctx.acciones.querySelectorAll('button').forEach((x) => (x.disabled = true));
    // se llenan las que falten, para ver el resultado
    while (await llenaUna(true));
    await espera(250);
    const okA = a === q, okB = b === r;
    llenas.classList.add(okA ? 'bien' : 'mal'); sobran.classList.add(okB ? 'bien' : 'mal');
    piezas.filter((p) => p.parentNode === monton).forEach((p) => p.classList.add('sobrante'));
    const estrellas = okA && okB ? 3 : okA || okB ? 1 : 0;
    ctx.fin(estrellas, (okA && okB ? `**${q} bandejas y sobran ${r}.** ` : `Se llenan **${q} bandejas** y sobran **${r}**. `) + `${num(N)} = ${q} × ${tam} + ${r}.` + (r === 0 ? ' Esta vez no sobra ninguno: la división es exacta.' : '') + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ================================================================ paquetes: cajas, bolsas y sueltas */
function paquetes(d, ctx) {
  const n = d.amigos, N = d.total;
  ctx.reto(d.texto ?? `Reparte **${num(N)} caramelos** entre **${n} amigos**, a partes iguales`);
  ctx.pista(d.pista ?? 'Reparte primero lo grande. Si no llega para todos, ábrelo: una caja son 10 bolsas y una bolsa, 10 sueltos.');
  const stock = { c: Math.floor(N / 100), b: Math.floor(N / 10) % 10, s: N % 10 };
  const reparto = Array.from({ length: n }, () => ({ c: 0, b: 0, s: 0 }));
  const NOM = { c: ['caja', 'cajas'], b: ['bolsa', 'bolsas'], s: ['suelto', 'sueltos'] };
  const ICON = { c: () => CAJA.cloneNode(true), b: () => BOLSA.cloneNode(true), s: () => caramelo(azar(0, 5)) };
  const montones = {}, botones = {};
  const almacen = el('div', { class: 'almacen-reparto' });
  for (const t of ['c', 'b', 's']) {
    const pila = el('div', { class: 'pila pila-' + t });
    const cuenta = el('b', { class: 'cuenta-pila' });
    const rep = el('button', { type: 'button', class: 'tecla', text: 'Repartir', onclick: () => repartir(t) });
    const abre = t !== 's' && el('button', { type: 'button', class: 'tecla', text: 'Abrir una', onclick: () => abrir(t) });
    montones[t] = { pila, cuenta }; botones[t] = { rep, abre };
    almacen.append(el('div', { class: 'columna-pila' }, el('span', { class: 'nombre-pila', text: NOM[t][1][0].toUpperCase() + NOM[t][1].slice(1) }), pila, cuenta, el('div', { class: 'botones-pila' }, rep, abre)));
  }
  const platos = reparto.map((_, k) => { const p = el('div', { class: 'plato' }, el('span', { class: 'nombre-amigo', text: ['Ana', 'Leo', 'Iris', 'Teo', 'Sara', 'Hugo'][k] }), el('div', { class: 'en-plato' }), el('small', { class: 'resumen-plato' })); return p; });
  const mesa = el('div', { class: 'platos' }, platos);
  ctx.escenario.append(el('div', { class: 'mantel-merienda paquetes' }, almacen, mesa));
  const cada = campo('Caramelos de cada amigo', 5), sob = campo('Caramelos que sobran', 4);
  const preguntas = el('div', { class: 'preguntas-reparto', hidden: true },
    el('label', {}, el('span', { text: 'Cada amigo tiene' }), cada), el('label', {}, el('span', { text: 'Sobran' }), sob));
  ctx.escenario.append(preguntas);
  let hecho = false, pasos = 0;
  const pinta = () => {
    for (const t of ['c', 'b', 's']) {
      const m = montones[t];
      m.pila.replaceChildren(...Array.from({ length: Math.min(stock[t], t === 's' ? 30 : 12) }, () => ICON[t]()));
      m.cuenta.textContent = `${stock[t]} ${NOM[t][stock[t] === 1 ? 0 : 1]}`;
      botones[t].rep.disabled = hecho || stock[t] < n;
      if (botones[t].abre) botones[t].abre.disabled = hecho || stock[t] === 0;
    }
    platos.forEach((p, k) => {
      const r = reparto[k];
      p.querySelector('.resumen-plato').textContent = ['c', 'b', 's'].filter((t) => r[t]).map((t) => `${r[t]} ${NOM[t][r[t] === 1 ? 0 : 1]}`).join(', ') || 'nada todavía';
    });
    const acabado = stock.c === 0 && stock.b === 0 && stock.s < n;
    preguntas.hidden = !acabado;
    comprobar.disabled = !acabado || hecho;
    if (acabado && !preguntas.dataset.visto) { preguntas.dataset.visto = '1'; gsap.from(preguntas, { y: 20, opacity: 0, duration: 0.4, ease: 'back.out(2)' }); ctx.di('Ya no se puede repartir más. ¿Cuántos tiene cada uno?', 'pista', 4000); }
  };
  async function repartir(t) {
    if (hecho) return;
    const q = Math.floor(stock[t] / n);
    if (!q) { ctx.aviso(`Con ${stock[t]} ${NOM[t][1]} no llega para los ${n}. Ábrela.`, true); return; }
    pasos++; ctx.aviso('');
    stock[t] -= q * n;
    const desde = montones[t].pila;
    for (let k = 0; k < n; k++) {
      reparto[k][t] += q;
      const destino = platos[k].querySelector('.en-plato');
      for (let j = 0; j < Math.min(q, 4); j++) {
        const ic = ICON[t](); ic.classList.add('mini'); ic.style.visibility = 'hidden'; destino.append(ic);
        const src = desde.lastElementChild || desde;
        vuela(src, ic, src.cloneNode(true), { ms: 340, escala: 'ajusta', alFinal: () => (ic.style.visibility = '') });
      }
      if (q > 4) destino.append(el('span', { class: 'mas-plato', text: `+${q - 4}` }));
      suena('pon'); await espera(110);
    }
    pinta();
  }
  async function abrir(t) {
    if (hecho || !stock[t]) return;
    pasos++; ctx.aviso('');
    const sig = t === 'c' ? 'b' : 's';
    const pila = montones[t].pila;
    gsap.fromTo(pila.lastElementChild, { scale: 1 }, { scale: 1.3, rotation: 12, opacity: 0, duration: 0.3 });
    suena('quita'); await espera(250);
    stock[t]--; stock[sig] += 10;
    pinta();
    gsap.from([...montones[sig].pila.children].slice(-10), { y: -30, opacity: 0, scale: 0.4, duration: 0.35, ease: 'back.out(2)', stagger: 0.03 });
    suena('cremallera');
  }
  const comprobar = ctx.boton('Comprobar', revisar);
  pinta();
  const siguientePaso = () => { for (const t of ['c', 'b', 's']) { if (stock[t] >= n) return repartir(t); if (t !== 's' && stock[t] > 0) return abrir(t); } };
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'Empieza por las **cajas**: dale a cada uno las que puedas. Las que no lleguen para todos, ábrelas.' },
    { texto: d.pistas?.[1] ?? 'Al final, cada amigo tiene cajas, bolsas y sueltos. Una caja vale 100 y una bolsa, 10.' },
    { texto: d.pistas?.[2] ?? 'Te hago el siguiente paso.', ver: siguientePaso },
  ]);
  async function revisar() {
    if (hecho) return;
    const a = lee(cada), b = lee(sob);
    if (a == null || b == null) return ctx.aviso('Escribe cuántos tiene cada uno y cuántos sobran.', true);
    hecho = true; pinta();
    const q = Math.floor(N / n), r = N % n;
    const okA = a === q, okB = b === r;
    cada.classList.add(okA ? 'bien' : 'mal'); sob.classList.add(okB ? 'bien' : 'mal');
    platos.forEach((p, k) => setTimeout(() => { bote(p, 8); suena('selloBien', k); }, k * 140));
    await espera(n * 140 + 200);
    ctx.fin(okA && okB ? 3 : okA || okB ? 1 : 0, (okA && okB ? `**${q} cada uno y sobran ${r}.** ` : `A cada uno le tocan **${q}** y sobran **${r}**. `) + `${num(N)} : ${n} = ${q}, y sobran ${r}. Lo que has hecho abriendo cajas y bolsas es exactamente la cuenta de dividir.`);
  }
}

/* ================================================================ calculadora del Sacapuntas */
function calculadora(d, ctx) {
  const { total: N, tam } = d;
  const q = Math.floor(N / tam), r = N % tam;
  // como una calculadora: hasta 8 cifras en pantalla, sin redondear
  let pantalla = String(Math.floor((N / tam) * 1e6) / 1e6).replace('.', ',');
  if (pantalla.replace(',', '').length > 8) pantalla = pantalla.slice(0, 9);
  ctx.reto(d.texto ?? `Hay **${num(N)} caramelos** y bandejas de **${tam}**. El Sacapuntas lo ha hecho con la calculadora. ¿Cuántas bandejas se llenan y cuántos sobran?`);
  ctx.pista(d.pista ?? 'La calculadora no habla de bandejas ni de sobras: eso lo tienes que decidir tú.');
  const calc = el('div', { class: 'calculadora', 'aria-label': `La calculadora muestra ${N} entre ${tam} igual a ${pantalla}` },
    el('div', { class: 'pantalla-calc' }, el('small', { text: `${N} : ${tam} =` }), el('b', { text: pantalla })),
    el('div', { class: 'teclas-calc', 'aria-hidden': 'true' }, ['7', '8', '9', ':', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '=', '+'].map((t) => el('span', { text: t }))));
  const llenas = campo('Bandejas llenas', 4), sobran = campo('Caramelos que sobran', 4);
  const preguntas = el('div', { class: 'preguntas-reparto' }, el('label', {}, el('span', { text: 'Bandejas llenas' }), llenas), el('label', {}, el('span', { text: 'Sobran' }), sobran));
  ctx.escenario.append(el('div', { class: 'rincon-calc' }, calc, preguntas));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.from(calc, { rotation: -8, y: 30, opacity: 0, duration: 0.5, ease: 'back.out(1.8)' });
  let hecho = false;
  const comprobar = ctx.boton('Comprobar', revisar);
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'Lo que hay **antes de la coma** son las bandejas que se llenan enteras.' },
    { texto: d.pistas?.[1] ?? `Si se llenan ${q} bandejas, ¿cuántos caramelos van en ellas? Multiplica.`, ver: () => preguntas.append(el('p', { class: 'tabla-pista', text: `${q} × ${tam} = ?` })) },
    { texto: d.pistas?.[2] ?? 'Los que sobran son los que no caben en esas bandejas: réstalos del total.', ver: () => preguntas.append(el('p', { class: 'tabla-pista', text: `${num(N)} − ${num(q * tam)} = ?` })) },
  ]);
  async function revisar() {
    if (hecho) return;
    const a = lee(llenas), b = lee(sobran);
    if (a == null || b == null) return ctx.aviso('Escribe las dos cosas: bandejas llenas y los que sobran.', true);
    hecho = true; comprobar.disabled = true;
    const okA = a === q, okB = b === r;
    llenas.classList.add(okA ? 'bien' : 'mal'); sobran.classList.add(okB ? 'bien' : 'mal');
    const decimales = pantalla.split(',')[1] ?? '';
    const trampa = !okB && String(b) === decimales.slice(0, String(b).length) && b !== r;
    await espera(200);
    ctx.fin(okA && okB ? 3 : okA || okB ? 1 : 0, (okA && okB ? `**${q} bandejas y sobran ${r}.** ` : `Se llenan **${q} bandejas** y sobran **${r}**. `) + `${q} × ${tam} = ${num(q * tam)}, y ${num(N)} − ${num(q * tam)} = ${r}.` + (trampa ? ' Ojo: los decimales de la calculadora **no son** los que sobran.' : ' Los decimales no son los que sobran: hay que calcularlos.'));
  }
}
