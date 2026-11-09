// Motor «mental»: atracciones de cálculo mental.
//   noria       → seis cabinas, seis cuentas. Vienen por parejas: la de antes ayuda a la siguiente.
//   patitos     → el número oculto: se pesca el patito que completa la cuenta.
//   colchonetas → saltos de 10, de 100… en camas elásticas: dónde cae, o de cuánto es el salto.
//   pares       → pares y nones: colocar números para que salga par o impar, o decidirlo sin hacer la cuenta.
//   bascula     → colocar cifras para que el resultado caiga en la zona verde de la báscula.
import { el, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, chispasEn, temblor, bote, arrastra, aterriza, demuestra } from './efectos.js';
import { dibuja, POSES } from './personaje.js';
import { campo, lee, conIntro, porIntento } from './kit.js';

const porFallos = (f) => (f === 0 ? 3 : f === 1 ? 2 : f <= 3 ? 1 : 0);
const signo = (op) => (op === '+' ? '+' : '−');
const opera = (a, op, b) => (op === '+' ? a + b : a - b);

/* ---------------------------------------------------------------- generadores */
function pareja(tipo) {
  const p = (a, op, b) => ({ a, op, b, r: opera(a, op, b) });
  if (tipo === 'decenas') { // 6 − 4 → 600 − 400
    const op = elige(['+', '−']); const a = op === '+' ? azar(2, 7) : azar(4, 9), b = op === '+' ? azar(1, 9 - a) : azar(1, a - 1);
    const k = elige([10, 100, 100, 1000]); return [p(a, op, b), p(a * k, op, b * k)];
  }
  if (tipo === 'compuestas') { // 600 + 130 + 7
    const c = azar(2, 8) * 100, d = azar(11, 19) * 10, u = azar(1, 9);
    return [{ a: c, op: '+', b: d, c: u, r: c + d + u }, { a: c - 100, op: '+', b: d + azar(1, 3) * 10, c: azar(1, 9), get r() { return this.a + this.b + this.c; } }].map((x) => ({ ...x, r: x.a + x.b + x.c }));
  }
  if (tipo === 'millares') { const a = azar(1, 8) * 1000, b = azar(1, 9 - a / 1000) * 1000; return [p(a, '+', b), p(azar(5, 9) * 1000, '−', azar(1, 4) * 1000)]; }
  if (tipo === 'compensar') { // 830 − 300 → 830 − 290 ;  780 − 500 → 779 − 499
    const a = azar(4, 9) * 100 + azar(1, 9) * 10, b = azar(2, Math.floor(a / 100) - 1) * 100;
    return elige([[p(a, '−', b), p(a, '−', b - 10)], [p(a, '−', b), p(a, '−', b + 1)], [p(a, '−', b), p(a - 1, '−', b - 1)], [p(a, '+', b), p(a, '+', b - 10)]]);
  }
  if (tipo === 'redondos') { // 670 + 30 → 670 + 230
    const a = azar(3, 7) * 100 + azar(1, 9) * 10, b = 100 - (a % 100);
    return elige([[p(a, '+', b), p(a, '+', b + 200)], [p(a, '+', b), p(a - 50, '+', b + 50)]]);
  }
  return pareja(elige(['decenas', 'compuestas', 'millares', 'compensar', 'redondos']));
}
function oculto(tipo, g) {
  const [lo, hi] = g.rango ?? [10, 60];
  const a = azar(lo, hi), b = azar(Math.max(2, Math.floor(lo / 3)), Math.max(3, a - 2));
  const formas = {
    restaMedio: () => ({ izq: [a, '−', null], der: a - b, sol: b }),      // 45 − ? = 24
    sumaMedio: () => ({ izq: [b, '+', null], der: a, sol: a - b }),       // 18 + ? = 45
    restaPrimero: () => ({ izq: [null, '−', b], der: a - b, sol: a }),    // ? − 18 = 27
    sumaPrimero: () => ({ izq: [null, '+', b], der: a, sol: a - b }),
  };
  const f = formas[tipo === 'mezcla' ? elige(Object.keys(formas)) : tipo]();
  const conocidos = f.izq.filter((x) => typeof x === 'number');
  const trampas = new Set([f.sol]);
  // la trampa típica: operar los dos números que se ven con la operación que se ve
  const vis = [...conocidos, f.der];
  trampas.add(vis[0] + vis[1]); trampas.add(Math.abs(vis[0] - vis[1]));
  while (trampas.size < (g.patos ?? 5)) trampas.add(Math.max(1, f.sol + elige([-10, -1, 1, 10, 2, -2, 11, -11])));
  trampas.delete(0);
  return { ...f, patos: barajar([...trampas]).slice(0, g.patos ?? 5).concat(trampas.has(f.sol) ? [] : [f.sol]) };
}
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (d.modo === 'noria') {
    const tipos = g.tipos ?? ['decenas'];
    d.cuentas = [0, 1, 2].flatMap((i) => pareja(tipos[i % tipos.length]));
    return d;
  }
  if (d.modo === 'patitos') {
    d.cuentas = Array.from({ length: g.cuantas ?? 3 }, () => oculto(elige(g.tipos ?? ['restaMedio']), g));
    d.cuentas.forEach((c) => { if (!c.patos.includes(c.sol)) c.patos[0] = c.sol; c.patos = barajar(c.patos); });
    return d;
  }
  if (d.modo === 'colchonetas') {
    const saltos = g.saltos ?? [100, 100, 100];
    const atras = g.atras;
    let ini = azar(...(g.inicio ?? [1000, 8999]));
    if (g.cruzar) { const s = saltos[0]; ini = Math.floor(ini / (s * 10)) * s * 10 + s * 10 - s * azar(1, 2) + azar(0, s - 1) * (s >= 10 ? 1 : 0); if (atras) ini += s * azar(2, 3); }
    const pasos = (g.barajar ? barajar(saltos) : saltos).map((s) => (atras ? -s : s));
    const cae = [ini]; pasos.forEach((s) => cae.push(cae.at(-1) + s));
    if (cae.some((x) => x < 0 || x > 99999)) return generar(spec);
    Object.assign(d, { cae, pasos, pregunta: g.pregunta ?? 'cae' });
    return d;
  }
  if (d.modo === 'pares') {
    if (d.rapido) {
      d.cuentas = Array.from({ length: g.cuantas ?? 6 }, () => { const op = elige(g.ops ?? ['+', '−']); let a = azar(...(g.rango ?? [100, 9999])), b = azar(...(g.rango ?? [100, 9999])); if (op === '−' && b > a) [a, b] = [b, a]; return { a, op, b, r: opera(a, op, b) }; });
      return d;
    }
    const op = g.op ?? '+';
    let cartas;
    do cartas = barajar(Array.from({ length: g.cartas ?? 4 }, () => azar(...(g.rango ?? [11, 99])))); while (new Set(cartas.map((c) => c % 2)).size < 2 || new Set(cartas).size < cartas.length);
    Object.assign(d, { cartas, op, quiere: g.quiere ?? elige(['par', 'impar']), huecos: g.huecos ?? 2 });
    return d;
  }
  if (d.modo === 'bascula') {
    const forma = g.forma ?? ['dd', '+', 'd'];
    const nc = forma.filter((f) => f !== '+' && f !== '−').join('').length;
    for (let t = 0; t < 200; t++) {
      const cifras = barajar([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, g.cifras ?? nc);
      const res = resultados(cifras, forma);
      if (!res.length) continue;
      const ancho = g.ancho ?? 10;
      const r = elige(res);
      const lo = Math.max(0, r - azar(0, ancho)), hi = lo + ancho;
      const dentro = res.filter((x) => x >= lo && x <= hi).length;
      if (dentro / res.length > (g.maxFraccion ?? 0.3)) continue;
      return Object.assign(d, { cifras, forma, lo, hi, max: Math.max(...res) });
    }
  }
  return d;
}
// todos los resultados posibles de colocar unas cifras en una forma como ['dd', '+', 'd']
function resultados(cifras, forma) {
  const out = [];
  const huecos = forma.filter((f) => f !== '+' && f !== '−').join('').length;
  const va = (resto, pref) => {
    if (pref.length === huecos) { const r = evalua(pref, forma); if (r != null) out.push(r); return; }
    resto.forEach((c, i) => va(resto.filter((_, j) => j !== i), [...pref, c]));
  };
  va(cifras, []);
  return out;
}
function evalua(cs, forma) {
  let k = 0; const nums = [], ops = [];
  for (const f of forma) { if (f === '+' || f === '−') ops.push(f); else { nums.push(Number(cs.slice(k, k + f.length).join(''))); k += f.length; } }
  let r = nums[0];
  ops.forEach((o, i) => (r = opera(r, o, nums[i + 1])));
  return r < 0 ? null : r;
}
export function ronda(d, ctx) { return ({ noria, patitos, colchonetas, pares, bascula })[d.modo](d, ctx); }

/* ================================================================ la noria */
const texto = (c) => `${num(c.a)} ${signo(c.op)} ${num(c.b)}${c.c != null ? ` + ${num(c.c)}` : ''}`;
function noria(d, ctx) {
  const N = d.cuentas.length;
  ctx.reto(d.texto ?? 'Seis cabinas, seis cuentas. **Las cuentas van por parejas**: la de antes te ayuda.');
  ctx.pista(d.pista ?? 'Escribe el resultado y pulsa ✓. La noria gira y llega la siguiente cabina.');
  const COL = ['#e8417a', '#ffc531', '#5ec3ff', '#9bd84a', '#ffb054', '#b79cff'];
  const R = 130;
  const cabinas = d.cuentas.map((c, i) => { const a = (i * 2 * Math.PI) / N + Math.PI / 2; return `<g class="cabina" data-i="${i}" transform="translate(${(Math.cos(a) * R).toFixed(1)} ${(Math.sin(a) * R).toFixed(1)})"><g class="colgante"><path d="M0 0 v10" stroke="#1b1e3a" stroke-width="4"/><path d="M-24 10 h48 l-6 32 h-36z" fill="${COL[i]}" stroke="#1b1e3a" stroke-width="4" stroke-linejoin="round"/><rect x="-14" y="16" width="28" height="12" rx="3" fill="#fffdf6" stroke="#1b1e3a" stroke-width="2.5"/><path class="tic" d="M-8 26 l6 6 l12 -14" fill="none" stroke="#1b8f4e" stroke-width="5" stroke-linecap="round" opacity="0"/><path class="cruz" d="M-8 18 l16 14 M8 18 l-16 14" stroke="#d7263d" stroke-width="5" stroke-linecap="round" opacity="0"/></g></g>`; }).join('');
  const rueda = el('div', { class: 'rueda-noria', html: `<svg viewBox="-190 -190 380 420" aria-hidden="true"><path d="M-60 210 L0 0 L60 210" fill="none" stroke="#1b1e3a" stroke-width="12" stroke-linejoin="round"/><path d="M-60 210 L0 0 L60 210" fill="none" stroke="#d39a5c" stroke-width="6"/><g class="gira"><circle r="${R}" fill="none" stroke="#1b1e3a" stroke-width="11"/><circle r="${R}" fill="none" stroke="#ff7fae" stroke-width="5"/><circle r="${R * 0.6}" fill="none" stroke="#1b1e3a" stroke-width="4"/>${Array.from({ length: N }, (_, i) => { const a = (i * 2 * Math.PI) / N + Math.PI / 2; return `<path d="M0 0 L${(Math.cos(a) * R).toFixed(1)} ${(Math.sin(a) * R).toFixed(1)}" stroke="#fffdf6" stroke-width="4"/>`; }).join('')}${cabinas}</g><circle r="18" fill="#ffc531" stroke="#1b1e3a" stroke-width="4"/></svg>` });
  const ticket = el('div', { class: 'ticket-noria' }, el('small', { class: 'n-cabina' }), el('b', { class: 'cuenta-noria' }));
  const i = campo('Resultado', 7);
  const antes = el('p', { class: 'antes-noria' });
  const panel = el('div', { class: 'panel-noria' }, antes, ticket, el('label', { class: 'prediccion' }, el('span', { text: '=' }), i));
  ctx.escenario.append(el('div', { class: 'caseta-noria' }, rueda, panel));
  const gira = rueda.querySelector('.gira');
  let n = 0, fallos = 0, malEsta = 0, ocupado = false, angulo = 0;
  const muestra = () => {
    const c = d.cuentas[n];
    ticket.querySelector('.n-cabina').textContent = `Cabina ${n + 1} de ${N}`;
    ticket.querySelector('.cuenta-noria').textContent = texto(c);
    antes.replaceChildren(...(n % 2 ? [el('small', { text: 'La de antes: ' }), el('b', { text: `${texto(d.cuentas[n - 1])} = ${num(d.cuentas[n - 1].r)}` })] : [el('small', { text: 'Cuenta nueva' })]));
    gsap.from(ticket, { y: 18, opacity: 0, duration: 0.3, ease: 'back.out(2)' });
    i.value = ''; i.classList.remove('mal', 'bien'); i.readOnly = false; malEsta = 0;
    if (n > 0) setTimeout(() => i.focus({ preventScroll: true }), 50);
  };
  // la cabina de abajo es la que se sube: la noria gira para traer la siguiente
  const coloca = () => { angulo = -(n * 360) / N; gsap.to(gira, { rotation: angulo, svgOrigin: '0 0', duration: 0.9, ease: 'power2.inOut' }); gira.querySelectorAll('.colgante').forEach((c) => gsap.to(c, { rotation: -angulo, svgOrigin: '0 0', duration: 0.9, ease: 'power2.inOut' })); };
  const marca = (k, ok) => { const c = gira.querySelector(`.cabina[data-i="${k}"]`); c.querySelector(ok ? '.tic' : '.cruz').setAttribute('opacity', 1); };
  const responde = async () => {
    if (ocupado || n >= N) return;
    const v = lee(i); if (v == null) return ctx.aviso('Escribe el resultado.', true);
    const c = d.cuentas[n];
    if (v === c.r) {
      ocupado = true; i.classList.add('bien'); i.readOnly = true; marca(n, !malEsta); suena('estrella', n); chispasEn(i, 8, '#9bd84a');
      ctx.aviso('');
      await espera(450); n++;
      if (n >= N) return final();
      coloca(); await espera(700); muestra(); ocupado = false;
      return;
    }
    malEsta++; fallos++; i.classList.add('mal'); temblor(i, 5); suena('mal');
    if (malEsta >= 2) {
      ocupado = true; ctx.aviso(`Era **${num(c.r)}**.`, true); i.value = c.r; marca(n, false);
      await espera(1300); n++; ctx.aviso('');
      if (n >= N) return final();
      coloca(); await espera(700); muestra(); ocupado = false;
    } else ctx.aviso(n % 2 && c.op === d.cuentas[n - 1].op ? '¿En qué se parece a la de antes? Úsala.' : 'Casi. Prueba otra vez.', true);
  };
  const final = () => {
    boton.disabled = true;
    gsap.to(gira, { rotation: angulo - 360, svgOrigin: '0 0', duration: 1.6, ease: 'power2.inOut' });
    gira.querySelectorAll('.colgante').forEach((c) => gsap.to(c, { rotation: -(angulo - 360), svgOrigin: '0 0', duration: 1.6, ease: 'power2.inOut' }));
    suena('sube');
    ctx.fin(porFallos(fallos), fallos ? `Vuelta completa con ${fallos} ${fallos === 1 ? 'fallo' : 'fallos'}. Las parejas se parecen: si sabes una, la otra sale casi sola.` : '**¡Vuelta perfecta!** Seis cabinas, ni un fallo.');
  };
  conIntro(i, responde);
  const boton = ctx.boton('✓ Subir', responde);
  muestra();
  ctx.pistas([
    { texto: 'Si es como **6 − 4 = 2**, entonces **600 − 400** son 6 centenas menos 4 centenas.' },
    { texto: 'Restar 290 es restar 300 y **devolver 10**. Restar 301 es restar 300 y **quitar 1 más**.' },
    { texto: 'Para sumar 600 + 130 + 7: primero las centenas (600 + 100), luego lo que queda (30 y 7).' },
  ]);
}

/* ================================================================ los patitos */
const PATO = (c) => `<svg viewBox="0 0 90 70" aria-hidden="true"><ellipse cx="44" cy="46" rx="34" ry="18" fill="${c}" stroke="#1b1e3a" stroke-width="4"/><path d="M18 40 q-12 -10 -6 -22 q8 12 18 14" fill="${c}" stroke="#1b1e3a" stroke-width="4" stroke-linejoin="round"/><circle cx="64" cy="24" r="15" fill="${c}" stroke="#1b1e3a" stroke-width="4"/><path d="M76 24 l12 3 l-12 5z" fill="#ff8a1f" stroke="#1b1e3a" stroke-width="3" stroke-linejoin="round"/><circle cx="67" cy="20" r="3" fill="#1b1e3a"/><path d="M30 44 q12 8 26 0" fill="none" stroke="#1b1e3a" stroke-width="3" opacity=".4"/></svg>`;
function patitos(d, ctx) {
  ctx.reto(d.texto ?? '**Pesca el patito** que completa la cuenta');
  ctx.pista(d.pista ?? 'Toca el patito con el número que falta. Cada cuenta tiene uno.');
  const caja = (c) => el('div', { class: 'cuenta-patos' }, ...c.izq.map((x) => (x == null ? el('span', { class: 'hueco-pato', text: '?' }) : el('b', { text: typeof x === 'number' ? num(x) : x }))), el('b', { text: '=' }), el('b', { text: num(c.der) }));
  const cuentas = d.cuentas.map(caja);
  const lista = el('div', { class: 'lista-patos' }, cuentas);
  const estanque = el('div', { class: 'estanque' });
  ctx.escenario.append(el('div', { class: 'caseta-patos' }, lista, estanque));
  let n = 0, fallos = 0, ocupado = false;
  const COL = ['#ffc531', '#ff9fbf', '#5ec3ff', '#9bd84a', '#ffb054', '#b79cff'];
  const echa = () => {
    estanque.replaceChildren(el('div', { class: 'olas', 'aria-hidden': 'true' }));
    cuentas.forEach((c, k) => c.classList.toggle('activa', k === n));
    const c = d.cuentas[n];
    c.patos.forEach((v, k) => {
      const p = el('button', { type: 'button', class: 'pato', 'aria-label': `Patito ${num(v)}`, style: { '--d': (k * 1.7) % 5 + 's', '--x': (k / c.patos.length) * 100 + '%', '--v': 7 + (k % 3) * 1.6 + 's' } }, el('span', { class: 'cuerpo-pato', html: PATO(COL[k % COL.length]) }), el('b', { text: num(v) }));
      p.onclick = () => pesca(p, v);
      estanque.append(p);
    });
    gsap.from(estanque.querySelectorAll('.pato'), { y: 40, opacity: 0, duration: 0.4, stagger: 0.07, ease: 'back.out(2)' });
  };
  const pesca = async (p, v) => {
    if (ocupado) return;
    ocupado = true;
    const c = d.cuentas[n], hueco = cuentas[n].querySelector('.hueco-pato');
    suena('coge');
    await gsap.to(p, { y: -50, rotation: -15, duration: 0.25, ease: 'power2.out' });
    if (v === c.sol) {
      hueco.textContent = num(v); hueco.classList.add('bien'); chispasEn(hueco, 12, '#ffc531'); suena('estrella', n);
      gsap.to(p, { scale: 0, opacity: 0, duration: 0.3 });
      await espera(600); n++;
      if (n >= d.cuentas.length) return ctx.fin(porFallos(fallos), fallos ? `Todas pescadas, con ${fallos} ${fallos === 1 ? 'chapuzón' : 'chapuzones'}. Truco: **comprueba** poniendo el número en el hueco y haciendo la cuenta.` : '**¡Los tres a la primera!**');
      echa(); ocupado = false;
      return;
    }
    fallos++; suena('mal');
    hueco.classList.add('mal'); setTimeout(() => hueco.classList.remove('mal'), 600);
    const hecho = c.izq.map((x) => (x == null ? v : x));
    const r = opera(hecho[0], hecho[1], hecho[2]);
    ctx.aviso(`Con ${num(v)}: ${num(hecho[0])} ${hecho[1]} ${num(hecho[2])} = ${num(r)}, y tiene que dar ${num(c.der)}.`, true);
    await gsap.to(p, { y: 20, rotation: 30, opacity: 0.2, duration: 0.3, ease: 'power2.in' });
    p.disabled = true; p.classList.add('al-agua');
    ocupado = false;
  };
  echa();
  ctx.pistas([
    { texto: 'Prueba un patito: ponlo en el hueco **con la cabeza** y haz la cuenta. ¿Da lo que tiene que dar?' },
    { texto: 'Si falta lo que se **resta** (45 − ? = 24), es la distancia entre los dos: 45 − 24. Si falta lo **primero** (? − 18 = 27), se suman: 27 + 18. Si falta un sumando, se resta.' },
    { texto: 'Te quito los patitos imposibles.', ver: () => { const c = d.cuentas[n]; estanque.querySelectorAll('.pato:not(.al-agua)').forEach((p) => { const v = +p.getAttribute('aria-label').replace(/\D/g, ''); if (v !== c.sol && Math.random() < 0.7) { p.disabled = true; p.classList.add('al-agua'); } }); } },
  ]);
}

/* ================================================================ las colchonetas */
function colchonetas(d, ctx) {
  const k = d.pasos.length, preguntaSalto = d.pregunta === 'salto', mixto = d.pregunta === 'mixto';
  ctx.reto(d.texto ?? (preguntaSalto ? '**¿De cuánto es cada salto?**' : d.pasos.every((s) => s === d.pasos[0]) ? `Salta de **${num(Math.abs(d.pasos[0]))} en ${num(Math.abs(d.pasos[0]))}** ${d.pasos[0] < 0 ? 'hacia atrás' : 'hacia delante'}. ¿Dónde cae en cada colchoneta?` : '¿Dónde cae en cada colchoneta?'));
  ctx.pista(d.pista ?? (preguntaSalto ? 'Fíjate en qué cifra cambia de una colchoneta a la siguiente.' : 'Escribe el número de cada colchoneta. Luego, ¡a saltar!'));
  const fila = el('div', { class: 'fila-colchonetas', style: { '--n': k + 1 } });
  const campos = [];
  // qué se pregunta en cada sitio: en «mixto», unas caídas y unos saltos
  const ocultaCae = (j) => (preguntaSalto ? false : mixto ? j % 2 === 0 && j > 0 : j > 0);
  const ocultaSalto = (j) => (preguntaSalto ? true : mixto ? j % 2 === 1 : false);
  d.cae.forEach((v, j) => {
    const cartel = ocultaCae(j) ? campo(`Colchoneta ${j + 1}`, 7) : el('b', { class: 'num-colchoneta', text: num(v) });
    if (ocultaCae(j)) campos.push({ inp: cartel, val: v, j, tipo: 'cae' });
    fila.append(el('div', { class: 'colchoneta' + (j === 0 ? ' salida' : ''), style: { '--i': j } }, el('div', { class: 'cama', 'aria-hidden': 'true' }), el('div', { class: 'cartel-colchoneta' }, cartel)));
    if (j < k) {
      const s = d.pasos[j];
      const et = ocultaSalto(j) ? el('span', { class: 'signo-salto' }, el('b', { text: s < 0 ? '−' : '+' }), campo(`Salto ${j + 1}`, 5)) : el('b', { text: (s < 0 ? '− ' : '+ ') + num(Math.abs(s)) });
      if (ocultaSalto(j)) campos.push({ inp: et.querySelector('input'), val: Math.abs(s), j, tipo: 'salto' });
      fila.append(el('div', { class: 'arco-salto' }, et));
    }
  });
  const saltarin = el('div', { class: 'saltarin', html: dibuja('fosforito', POSES.celebra) });
  const zona = el('div', { class: 'caseta-colchonetas' }, fila, saltarin);
  ctx.escenario.append(zona);
  // las flechas de los saltos se dibujan con CSS; el saltarín empieza en la primera
  const camas = () => [...fila.querySelectorAll('.colchoneta')];
  const ponEn = (j, inst = true) => { const c = camas()[j].querySelector('.cama').getBoundingClientRect(), z = zona.getBoundingClientRect(); const x = c.left - z.left + zona.scrollLeft + c.width / 2 - 30, y = c.top - z.top - 70; return inst ? gsap.set(saltarin, { x, y }) : { x, y }; };
  requestAnimationFrame(() => ponEn(0));
  campos.forEach((c, n) => conIntro(c.inp, () => (campos[n + 1] ? campos[n + 1].inp.focus() : boton.click())));
  let intento = 0, hecho = false;
  const boton = ctx.boton('¡A saltar!', async () => {
    if (hecho) return;
    if (campos.some((c) => lee(c.inp) == null)) return ctx.aviso('Rellena todas las casillas.', true);
    intento++; hecho = true; boton.disabled = true;
    let malos = 0;
    for (let j = 1; j <= k; j++) {
      const del = campos.filter((c) => (c.tipo === 'cae' ? c.j === j : c.j === j - 1));
      const ok = del.every((c) => lee(c.inp) === c.val);
      const { x, y } = ponEn(j, false);
      suena('sube', j);
      await gsap.timeline().to(saltarin, { x, duration: 0.5, ease: 'none' }).to(saltarin, { y: y - 90, duration: 0.25, ease: 'power2.out' }, 0).to(saltarin, { y, duration: 0.25, ease: 'power2.in' }, 0.25);
      const cama = camas()[j].querySelector('.cama');
      gsap.fromTo(cama, { scaleY: 0.6 }, { scaleY: 1, duration: 0.5, ease: 'elastic.out(1.2,0.3)' });
      del.forEach((c) => { c.inp.classList.add(lee(c.inp) === c.val ? 'bien' : 'mal'); c.inp.readOnly = lee(c.inp) === c.val; });
      if (!ok) { malos++; suena('mal'); temblor(saltarin, 8); } else suena('pon');
    }
    if (!malos) { chispasEn(saltarin, 18, '#ffc531'); return ctx.fin(porIntento(intento), `**¡Todos los botes buenos!** ${d.cae.map((v) => num(v)).join(' → ')}`); }
    if (intento >= 2) { campos.forEach((c) => { c.inp.value = c.val; c.inp.readOnly = true; }); return ctx.fin(0, `Era así: ${d.cae.map((v) => num(v)).join(' → ')}. ${preguntaSalto ? 'El salto es la diferencia entre dos colchonetas seguidas.' : 'Al saltar de 10 en 10 cambian las decenas; si llegan a 10, suben las centenas.'}`); }
    ctx.aviso('Las casillas en rojo no están bien. Arréglalas y vuelve a saltar.', true);
    campos.forEach((c) => { if (lee(c.inp) !== c.val) c.inp.value = ''; });
    await gsap.to(saltarin, { ...ponEn(0, false), duration: 0.6, ease: 'power2.inOut' });
    hecho = false; boton.disabled = false;
  });
  const s0 = Math.abs(d.pasos[0]);
  ctx.pistas([
    { texto: preguntaSalto ? 'Compara dos colchonetas seguidas cifra a cifra. **¿Cuál ha cambiado y cuánto?**' : `Saltar ${num(s0)} cambia la cifra de las **${s0 === 10 ? 'decenas' : s0 === 100 ? 'centenas' : s0 === 1000 ? 'unidades de millar' : 'unidades'}**. Las demás se quedan igual… casi siempre.`, ver: () => zona.classList.add('marca-cifra') },
    { texto: 'Si esa cifra pasa de 9, se convierte en 0 y **sube la de la izquierda**: 1 790 + 10 = 1 800.' },
    { texto: `La primera casilla es **${num(campos[0]?.val ?? 0)}**.`, ver: () => { if (campos[0]) { campos[0].inp.value = campos[0].val; campos[0].inp.classList.add('bien'); } } },
  ]);
}

/* ---------------------------------------------------------------- cartas y huecos (pares y báscula) */
function mesaDeCartas({ valores, huecos, alCambiar, clase = 'carta-feria' }) {
  const cartas = valores.map((v, i) => el('div', { class: clase, tabindex: 0, role: 'button', 'data-v': v, 'aria-label': `Carta ${v}` }, el('b', { text: typeof v === 'number' ? num(v) : v })));
  const mazo = el('div', { class: 'mazo-cartas' }, cartas);
  const sitio = new Map();
  let elegida = null;
  const de = (h) => cartas.find((c) => sitio.get(c) === h);
  const pon = (c, h) => {
    const otra = de(h), antes = sitio.get(c);
    if (otra && otra !== c) { if (antes) { sitio.set(otra, antes); antes.append(otra); } else { sitio.delete(otra); mazo.append(otra); } }
    sitio.set(c, h); h.append(c); alCambiar?.();
  };
  const quita = (c) => { sitio.delete(c); mazo.append(c); alCambiar?.(); };
  const marca = (c) => { elegida?.classList.remove('elegida'); elegida = elegida === c ? null : c; elegida?.classList.add('elegida'); suena('clic'); };
  let bloqueado = false;
  cartas.forEach((c) => arrastra(c, { puede: () => !bloqueado, destinos: () => [...huecos, mazo], alSoltar: (dest) => { elegida?.classList.remove('elegida'); elegida = null; dest === mazo ? quita(c) : pon(c, dest); return c; }, alTocar: () => !bloqueado && marca(c) }));
  huecos.forEach((h) => h.addEventListener('click', (e) => { if (!elegida || bloqueado || e.target.closest('.' + clase) === elegida) return; const c = elegida; marca(c); pon(c, h); aterriza(c); }));
  mazo.addEventListener('click', (e) => { if (elegida && !e.target.closest('.' + clase)) { const c = elegida; marca(c); quita(c); aterriza(c); } });
  return { mazo, cartas, valor: (h) => { const c = de(h); return c ? c.dataset.v : null; }, bloquea: (b = true) => (bloqueado = b), pon, de };
}

/* ================================================================ pares y nones */
function pares(d, ctx) { return d.rapido ? paresRapido(d, ctx) : paresColoca(d, ctx); }
function paresColoca(d, ctx) {
  const op = d.op, quiere = d.quiere;
  ctx.reto(d.texto ?? `Pon dos cartas para que el resultado sea **${quiere.toUpperCase()}**`);
  ctx.pista(d.pista ?? (op === '−' ? 'La de la izquierda tiene que ser la más grande. Luego, ¡pares o nones!' : 'Arrastra dos cartas a las manos. Luego, ¡pares o nones!'));
  const h1 = el('div', { class: 'mano-carta izq' }), h2 = el('div', { class: 'mano-carta der' });
  const res = el('div', { class: 'resultado-pares' }, el('span', { text: '?' }));
  const M = mesaDeCartas({ valores: d.cartas, huecos: [h1, h2], alCambiar: () => (boton.disabled = !(M.valor(h1) && M.valor(h2))) });
  const juez = el('div', { class: 'juez-pares' }, el('span', { class: 'cartel-quiere ' + quiere, text: quiere === 'par' ? 'PAR' : 'IMPAR' }));
  ctx.escenario.append(el('div', { class: 'caseta-pares' }, juez, el('div', { class: 'mesa-pares' }, h1, el('b', { class: 'op-pares', text: signo(op) }), h2, el('b', { class: 'op-pares', text: '=' }), res), M.mazo));
  let intento = 0, hecho = false;
  const boton = ctx.boton('¡Pares o nones!', async () => {
    if (hecho) return;
    const a = +M.valor(h1), b = +M.valor(h2);
    if (op === '−' && b > a) { ctx.aviso('En la resta, la carta grande va a la izquierda.', true); temblor(h1, 5); return; }
    intento++;
    const r = opera(a, op, b);
    res.firstChild.textContent = num(r);
    gsap.from(res, { scale: 0.4, duration: 0.3, ease: 'back.out(2)' });
    const ok = (r % 2 === 0) === (quiere === 'par');
    res.classList.toggle('bien', ok); res.classList.toggle('mal', !ok);
    if (ok) {
      hecho = true; boton.disabled = true; M.bloquea(); suena('selloBien'); chispasEn(res, 14, '#ffc531');
      return ctx.fin(porIntento(intento), `${num(a)} ${signo(op)} ${num(b)} = **${num(r)}**, ${quiere}. ${a % 2 === b % 2 ? 'Dos pares o dos impares dan **par**.' : 'Uno par y otro impar dan **impar**.'}`);
    }
    suena('mal'); temblor(res, 6);
    if (intento >= 3) { hecho = true; boton.disabled = true; M.bloquea(); return ctx.fin(0, `Para que salga ${quiere}: ${quiere === 'par' ? 'dos pares o dos impares' : 'uno par y otro impar'}. Solo mira **la última cifra**.`); }
    ctx.aviso(`${num(r)} es ${r % 2 ? 'impar' : 'par'}. Cambia alguna carta.`, true);
  });
  boton.disabled = true;
  if (ctx.primera) demuestra(M.cartas[0], h1, { demora: 1300 });
  ctx.pistas([
    { texto: 'No hace falta hacer la cuenta: mira solo **la última cifra** de cada carta. ¿Es par o impar?', ver: () => M.cartas.forEach((c) => c.classList.add('mira-ultima')) },
    { texto: 'Par ± par = **par**. Impar ± impar = **par**. Par ± impar = **impar**.' },
    { texto: quiere === 'par' ? 'Busca dos cartas que acaben las dos en par, o las dos en impar.' : 'Busca una carta que acabe en par y otra que acabe en impar.' },
  ]);
}
function paresRapido(d, ctx) {
  ctx.reto(d.texto ?? '¿Sale **par** o **impar**? Sin hacer la cuenta');
  ctx.pista(d.pista ?? 'Mira solo la última cifra de cada número.');
  const tarjeta = el('div', { class: 'cuenta-rapida' });
  const marcador = el('div', { class: 'marcador-rapido' }, d.cuentas.map(() => el('i')));
  const bPar = el('button', { type: 'button', class: 'tecla grande boton-par', text: 'PAR' });
  const bImpar = el('button', { type: 'button', class: 'tecla grande boton-impar', text: 'IMPAR' });
  ctx.escenario.append(el('div', { class: 'caseta-pares rapida' }, marcador, tarjeta, el('div', { class: 'botones-pares' }, bPar, bImpar)));
  let n = 0, fallos = 0, ocupado = false;
  const muestra = () => { const c = d.cuentas[n]; tarjeta.replaceChildren(el('b', { text: `${num(c.a)} ${signo(c.op)} ${num(c.b)}` })); gsap.from(tarjeta, { x: 60, opacity: 0, duration: 0.3, ease: 'back.out(1.6)' }); };
  const responde = async (par) => {
    if (ocupado) return; ocupado = true;
    const c = d.cuentas[n], ok = (c.r % 2 === 0) === par;
    const pto = marcador.children[n];
    pto.classList.add(ok ? 'bien' : 'mal');
    tarjeta.append(el('small', { text: `= ${num(c.r)}` }));
    if (!ok) { fallos++; suena('mal'); temblor(tarjeta, 5); } else suena('estrella', n);
    await espera(ok ? 650 : 1300);
    n++;
    if (n >= d.cuentas.length) { [bPar, bImpar].forEach((b) => (b.disabled = true)); return ctx.fin(porFallos(fallos), fallos ? `${d.cuentas.length - fallos} de ${d.cuentas.length}. Recuerda: **igual con igual, par**; distinto, impar.` : '**¡Seis de seis!** Ojo de feriante.'); }
    muestra(); ocupado = false;
  };
  bPar.onclick = () => responde(true); bImpar.onclick = () => responde(false);
  muestra();
  ctx.pistas([{ texto: 'Fíjate solo en las **unidades**: el resto del número no cambia si el resultado es par o impar.' }, { texto: 'Par con par, o impar con impar: **par**. Uno de cada: **impar**. Vale para sumar y para restar.' }]);
}

/* ================================================================ la báscula */
function bascula(d, ctx) {
  const max = Math.ceil((d.max * 1.1) / 10) * 10 || 100;
  ctx.reto(d.texto ?? `Coloca las cifras para que el resultado esté **entre ${num(d.lo)} y ${num(d.hi)}**`);
  ctx.pista(d.pista ?? 'Pon una cifra en cada hueco y pesa. La aguja tiene que caer en la zona verde.');
  const huecos = [], fila = el('div', { class: 'fila-bascula' });
  d.forma.forEach((f) => {
    if (f === '+' || f === '−') return fila.append(el('b', { class: 'op-pares', text: f }));
    const grupo = el('div', { class: 'numero-bascula' });
    for (const _ of f) { const h = el('div', { class: 'hueco-cifra' }); huecos.push(h); grupo.append(h); }
    fila.append(grupo);
  });
  const M = mesaDeCartas({ valores: d.cifras, huecos, clase: 'ficha-bascula', alCambiar: () => (boton.disabled = huecos.some((h) => !M.valor(h))) });
  // la esfera: medio círculo de 0 a max, con la zona verde
  const ang = (v) => -90 + (180 * Math.min(v, max)) / max;
  const arco = (a0, a1, r) => { const p = (a) => [Math.sin((a * Math.PI) / 180) * r, -Math.cos((a * Math.PI) / 180) * r]; const [x0, y0] = p(a0), [x1, y1] = p(a1); return `M${x0.toFixed(1)} ${y0.toFixed(1)} A${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`; };
  const ticks = Array.from({ length: 11 }, (_, k) => { const a = -90 + k * 18, r1 = 112, r2 = k % 5 ? 100 : 94; const s = Math.sin((a * Math.PI) / 180), c = -Math.cos((a * Math.PI) / 180); return `<path d="M${(s * r1).toFixed(1)} ${(c * r1).toFixed(1)} L${(s * r2).toFixed(1)} ${(c * r2).toFixed(1)}" stroke="#1b1e3a" stroke-width="${k % 5 ? 2 : 3.5}"/>${k % 5 ? '' : `<text x="${(s * 74).toFixed(1)}" y="${(c * 74 + (k % 10 ? 6 : -8)).toFixed(1)}" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="800" font-size="15" fill="#1b1e3a">${num((max * k) / 10)}</text>`}`; }).join('');
  const esfera = el('div', { class: 'esfera-bascula', html: `<svg viewBox="-135 -135 270 160" aria-hidden="true"><path d="M-128 10 A128 128 0 0 1 128 10 Z" fill="#fffdf6" stroke="#1b1e3a" stroke-width="5"/><path d="${arco(ang(d.lo), ang(d.hi), 106)}" fill="none" stroke="#5cc56a" stroke-width="18"/>${ticks}<g class="aguja"><path d="M0 0 L0 -104" stroke="#d7263d" stroke-width="5" stroke-linecap="round"/></g><circle r="10" fill="#1b1e3a"/></svg>` });
  const zonaVerde = el('div', { class: 'zona-verde-texto' }, el('span', { text: 'Zona verde: ' }), el('b', { text: `${num(d.lo)} – ${num(d.hi)}` }));
  const lectura = el('div', { class: 'lectura-bascula', text: '—' });
  ctx.escenario.append(el('div', { class: 'caseta-bascula' }, el('div', { class: 'bascula' }, esfera, lectura, el('div', { class: 'plato-bascula' }, fila)), zonaVerde, M.mazo));
  const aguja = esfera.querySelector('.aguja');
  gsap.set(aguja, { rotation: -90, svgOrigin: '0 0' });
  let intento = 0, hecho = false;
  const boton = ctx.boton('Pesar', async () => {
    if (hecho) return;
    const cs = huecos.map((h) => +M.valor(h));
    const r = evalua(cs, d.forma);
    if (r == null) { ctx.aviso('Así la resta daría menos de 0. Pon el número grande delante.', true); return; }
    intento++; boton.disabled = true; M.bloquea();
    suena('coge');
    await gsap.to(aguja, { rotation: ang(r) + 12, svgOrigin: '0 0', duration: 0.6, ease: 'power2.out' });
    await gsap.to(aguja, { rotation: ang(r), svgOrigin: '0 0', duration: 0.7, ease: 'elastic.out(1.4,0.3)' });
    lectura.textContent = num(r);
    const ok = r >= d.lo && r <= d.hi;
    lectura.classList.toggle('bien', ok); lectura.classList.toggle('mal', !ok);
    if (ok) { hecho = true; suena('selloBien'); chispasEn(lectura, 14, '#5cc56a'); return ctx.fin(porIntento(intento), `**${num(r)}**: en la zona verde. ${intento === 1 ? '¡A la primera!' : 'Cada pesada te dice si te pasas o te quedas corto.'}`); }
    suena('mal'); temblor(esfera, 5);
    if (intento >= 3) {
      hecho = true;
      return ctx.fin(0, `${num(r)} se ${r > d.hi ? 'pasa' : 'queda corto'}. Mira primero **las cifras que más valen** (las de la izquierda de cada número): deciden casi todo.`);
    }
    ctx.aviso(r > d.hi ? `${num(r)}: te pasas. ¿Qué cifra cambiarías para que baje?` : `${num(r)}: te quedas corto. ¿Qué cifra cambiarías para que suba?`, true);
    M.bloquea(false); boton.disabled = false;
  });
  boton.disabled = true;
  ctx.pistas([
    { texto: 'Empieza por las cifras que **más valen**: las de la izquierda de cada número. Las unidades solo afinan.' },
    { texto: d.forma.includes('−') ? 'Para que una resta dé poco, los dos números tienen que estar **cerca**. Para que dé mucho, **lejos**.' : 'Si te pasas, pon cifras más pequeñas a la izquierda. Si te quedas corto, más grandes.' },
    { texto: `Prueba a estimar: el resultado tiene que rondar el **${num(Math.round((d.lo + d.hi) / 2))}**.` },
  ]);
}
