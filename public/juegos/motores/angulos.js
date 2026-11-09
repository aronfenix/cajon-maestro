// Motor «angulos»: tres casetas de ángulos.
//   abanicos   → comparar aperturas (abanicos, tijeras) aunque los brazos sean de distinto largo, ordenarlas
//                y abrir un abanico igual que otro
//   banderolas → tipos de ángulo (agudo, recto, obtuso, llano, completo), banderines con algún ángulo obtuso
//                y parejas de ángulos iguales
//   ruleta     → estimar cuánto mide un ángulo, dibujarlo con el medidor y medirlo
import { el, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, chispasEn, temblor, bote, arrastra, aterriza, demuestra, mano } from './efectos.js';
import { mesaDeCartas } from './mental.js';
import { campo, lee, conIntro, porIntento, T } from './kit.js';

const rad = (g) => (g * Math.PI) / 180;
const P = (r, a) => [r * Math.cos(rad(a)), -r * Math.sin(rad(a))]; // ángulos en sentido antihorario, y hacia arriba
const f1 = (x) => x.toFixed(1);
const porFallos = (f) => (f === 0 ? 3 : f === 1 ? 2 : f <= 3 ? 1 : 0);
const sector = (r, a0, a1) => { const [x0, y0] = P(r, a0), [x1, y1] = P(r, a1); return `M0 0 L${f1(x0)} ${f1(y0)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${f1(x1)} ${f1(y1)}Z`; };
const arcoP = (r, a0, a1) => { const [x0, y0] = P(r, a0), [x1, y1] = P(r, a1); return `M${f1(x0)} ${f1(y0)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${f1(x1)} ${f1(y1)}`; };
const COL = ['#ff9fbf', '#5ec3ff', '#ffc531', '#9bd84a', '#b79cff', '#ffb054'];

// ---------- dibujos: cada uno con el vértice en (0,0); a = apertura, r = largo de los brazos, g = giro
function abanico(a, r, g, c) {
  const n = Math.max(3, Math.round(a / 14));
  const varillas = Array.from({ length: n + 1 }, (_, i) => { const [x, y] = P(r * 0.96, g + (a * i) / n); return `<path d="M0 0 L${f1(x)} ${f1(y)}" stroke="${T}" stroke-width="2" opacity=".55"/>`; }).join('');
  const pliegues = Array.from({ length: n }, (_, i) => `<path d="${sector(r, g + (a * i) / n, g + (a * (i + 1)) / n)}" fill="${i % 2 ? c : '#fffdf6'}" stroke="none"/>`).join('');
  const [x0, y0] = P(r, g), [x1, y1] = P(r, g + a);
  return `<g>${pliegues}<path d="${sector(r, g, g + a)}" fill="none" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/>${varillas}<path d="M0 0 L${f1(x0)} ${f1(y0)} M0 0 L${f1(x1)} ${f1(y1)}" stroke="#a8743c" stroke-width="5" stroke-linecap="round"/><circle r="7" fill="#e8417a" stroke="${T}" stroke-width="3"/></g>`;
}
function tijeras(a, r, g) {
  const hoja = (dir) => { const [x, y] = P(r, dir), [px, py] = P(9, dir + 90), [qx, qy] = P(5, dir - 90); return `<path d="M${f1(px)} ${f1(py)} L${f1(x)} ${f1(y)} L${f1(qx)} ${f1(qy)}Z" fill="#c9cfdd" stroke="${T}" stroke-width="3" stroke-linejoin="round"/>`; };
  const ojo = (dir, c) => { const [x, y] = P(r * 0.34, dir + 180); return `<path d="M0 0 L${f1(x * 0.6)} ${f1(y * 0.6)}" stroke="${c}" stroke-width="9" stroke-linecap="round"/><ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * 0.12)}" ry="${f1(r * 0.09)}" fill="none" stroke="${c}" stroke-width="7"/>`; };
  return `<g>${ojo(g, '#e8417a')}${ojo(g + a, '#2f5bd3')}${hoja(g)}${hoja(g + a)}<circle r="6" fill="#fffdf6" stroke="${T}" stroke-width="3"/></g>`;
}
function brazos(a, r1, r2, g, { marca = true, color = T } = {}) {
  const [x0, y0] = P(r1, g), [x1, y1] = P(r2, g + a);
  const ra = Math.min(r1, r2, 34) * 0.7;
  const m = !marca ? '' : a === 90 ? (() => { const [ax, ay] = P(ra * 0.6, g), [bx, by] = P(ra * 0.6, g + 90), [cx, cy] = [ax + bx, ay + by]; return `<path d="M${f1(ax)} ${f1(ay)} L${f1(cx)} ${f1(cy)} L${f1(bx)} ${f1(by)}" fill="none" stroke="#e8417a" stroke-width="3"/>`; })()
    : a >= 360 ? `<circle r="${ra}" fill="rgba(232,65,122,.15)" stroke="#e8417a" stroke-width="3"/>` : `<path d="${sector(ra, g, g + a)}" fill="rgba(232,65,122,.18)" stroke="none"/><path d="${arcoP(ra, g, g + a)}" fill="none" stroke="#e8417a" stroke-width="3"/>`;
  return `<g>${m}<path d="M0 0 L${f1(x0)} ${f1(y0)} M0 0 L${f1(x1)} ${f1(y1)}" stroke="${color}" stroke-width="5" stroke-linecap="round"/><circle r="4.5" fill="${color}"/></g>`;
}
const caja = (cuerpo, vb = 86) => `<svg viewBox="${-vb} ${-vb} ${2 * vb} ${2 * vb}" aria-hidden="true" overflow="visible">${cuerpo}</svg>`;
// centra el dibujo de un ángulo en su caja: el vértice se desplaza al contrario de la bisectriz
const centrado = (cuerpo, a, g, r) => { const [bx, by] = P(r * 0.42, g + Math.min(a, 359) / 2); return `<g transform="translate(${f1(-bx)} ${f1(-by)})">${cuerpo}</g>`; };

/* ---------------------------------------------------------------- generar */
const TIPOS = { agudo: [20, 75], recto: [90, 90], obtuso: [105, 165], llano: [180, 180], completo: [360, 360] };
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (d.modo === 'compara') {
    const dif = g.diferencia ?? [25, 40];
    d.pares = Array.from({ length: g.pares ?? 4 }, () => {
      const igual = g.iguales && Math.random() < 0.25;
      const a = azar(30, 140), b = igual ? a : a + (Math.random() < 0.5 ? 1 : -1) * azar(...dif);
      const ab = Math.min(170, Math.max(15, b));
      // el más abierto tiene los brazos más cortos, para que engañe
      const largos = g.engana ? (a > ab ? [58, 100] : [100, 58]) : [azar(70, 95), azar(70, 95)];
      return { objeto: g.objeto === 'mezcla' ? elige(['abanico', 'tijeras', 'brazos']) : g.objeto ?? 'abanico', a: [a, ab], r: largos, giro: [azar(-30, 60), azar(-30, 60)] };
    });
    d.iguales = !!g.iguales;
    return d;
  }
  if (d.modo === 'ordena') {
    const n = g.cantidad ?? 4, sep = g.separacion ?? 18;
    let as; do as = barajar(Array.from({ length: n }, () => azar(20, 160))); while (as.some((x, i) => as.some((y, j) => i !== j && Math.abs(x - y) < sep)));
    d.angulos = as.map((a) => ({ a, r: g.engana ? azar(50, 100) : azar(80, 96), giro: g.girar ? azar(-60, 120) : azar(-10, 20), objeto: g.objeto ?? 'abanico' }));
    d.sentido = g.sentido ?? 'baja';
    return d;
  }
  if (d.modo === 'iguala') { Object.assign(d, { a: azar(...(g.rango ?? [30, 150])), rModelo: azar(...(g.rModelo ?? [60, 90])), rTuyo: azar(...(g.rTuyo ?? [90, 110])), giroModelo: g.girar ? azar(-40, 80) : 0 }); return d; }
  if (d.modo === 'clasifica') {
    const tipos = g.tipos ?? ['agudo', 'recto', 'obtuso'];
    const lista = barajar([...tipos, ...Array.from({ length: (g.cantidad ?? 6) - tipos.length }, () => elige(tipos))]);
    d.tipos = tipos;
    d.cartas = lista.map((t) => ({ t, a: azar(...TIPOS[t]), g: g.girar ? azar(0, 359) : azar(-15, 30), r: [azar(40, 62), azar(40, 62)] }));
    return d;
  }
  if (d.modo === 'busca') { d.banderines = Array.from({ length: g.cantidad ?? 6 }, (_, i) => poligono(i % 2 === 0 ? 'obtuso' : 'sin', g.lados)); d.banderines = barajar(d.banderines); if (!d.banderines.some((b) => b.obtusos.length)) d.banderines[0] = poligono('obtuso', g.lados); return d; }
  if (d.modo === 'parejas') {
    const n = g.parejas ?? 4, set = new Set();
    while (set.size < n) set.add(elige(g.angulos ?? [30, 45, 60, 90, 120, 135, 150]));
    d.cartas = barajar([...set].flatMap((a) => [0, 1].map(() => ({ a, g: azar(0, 359), r: [azar(36, 62), azar(36, 62)] }))));
    return d;
  }
  if (d.modo === 'estima') {
    const vals = g.angulos ?? [30, 45, 60, 90, 120, 135, 150, 180, 270];
    d.ruedas = Array.from({ length: g.cuantas ?? 4 }, () => { const a = elige(vals); const ops = new Set([a]); while (ops.size < 4) ops.add(elige([30, 45, 60, 90, 120, 135, 150, 180, 210, 270].filter((x) => Math.abs(x - a) >= (g.cerca ? 15 : 30)))); return { a, g: g.girar ? azar(0, 359) : 0, ops: [...ops].sort((x, y) => x - y) }; });
    return d;
  }
  if (d.modo === 'dibuja') { d.a = elige(g.angulos ?? [30, 45, 60, 90, 120, 135, 150]); d.izquierda = g.izquierda === 'mezcla' ? Math.random() < 0.5 : !!g.izquierda; return d; }
  if (d.modo === 'mide') { d.a = azar(...(g.rango ?? [15, 165])); if (g.redondo) d.a = Math.round(d.a / 5) * 5; d.izquierda = g.izquierda === 'mezcla' ? Math.random() < 0.5 : !!g.izquierda; return d; }
  return d;
}
// banderines poligonales: con algún ángulo obtuso o sin ninguno (y nunca ángulos dudosos, entre 80 y 100 que no sean rectos)
function poligono(quiere, lados) {
  for (let t = 0; t < 500; t++) {
    const n = lados ? elige(lados) : elige([3, 3, 4, 4, 5]);
    let pts;
    if (quiere === 'sin' && n === 4 && Math.random() < 0.5) { const w = azar(40, 70), h = azar(40, 70); pts = [[-w, -h], [w, -h], [w, h], [-w, h]]; }
    else if (quiere === 'sin' && n === 3 && Math.random() < 0.35) { const w = azar(50, 80), h = azar(50, 80); pts = [[-w / 2, -h / 2], [w / 2, -h / 2], [-w / 2, h / 2]]; }
    else pts = Array.from({ length: n }, (_, i) => { const a = (i * 360) / n + azar(-28, 28) + 90; const r = azar(48, 80); return P(r, a); }).sort((p, q) => Math.atan2(p[1], p[0]) - Math.atan2(q[1], q[0]));
    const angs = pts.map((p, i) => { const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n]; const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]]; return (Math.acos((u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))) * 180) / Math.PI; });
    const suma = angs.reduce((x, y) => x + y, 0);
    if (Math.abs(suma - (n - 2) * 180) > 1) continue; // no convexo
    if (angs.some((x) => (x > 78 && x < 102 && Math.abs(x - 90) > 0.5) || x < 22)) continue;
    const obt = angs.map((x, i) => (x > 100 ? i : -1)).filter((i) => i >= 0);
    if ((quiere === 'obtuso') !== obt.length > 0) continue;
    const giro = azar(0, 359), c = Math.cos(rad(giro)), s = Math.sin(rad(giro));
    return { pts: pts.map(([x, y]) => [x * c - y * s, x * s + y * c]), angs, obtusos: obt, rectos: angs.map((x, i) => (Math.abs(x - 90) < 0.6 ? i : -1)).filter((i) => i >= 0) };
  }
  return { pts: [[-60, -40], [60, -40], [0, 50]], angs: [60, 60, 60], obtusos: [], rectos: [] };
}
export function ronda(d, ctx) { return ({ compara, ordena, iguala, clasifica, busca, parejas, estima, dibuja: dibujaAng, mide })[d.modo](d, ctx); }

const dibujo = (o, a, r, g, k = 0) => (o === 'tijeras' ? tijeras(a, r, g) : o === 'brazos' ? brazos(a, r, r * 0.8, g) : abanico(a, r, g, COL[k % COL.length]));

/* ================================================================ comparar */
function compara(d, ctx) {
  const N = d.pares.length;
  ctx.reto(d.texto ?? '¿Cuál está **más abierto**?');
  ctx.pista(d.pista ?? 'Lo que cuenta es lo que se abren, no lo largos que son. Toca el más abierto.');
  const marcador = el('div', { class: 'marcador-rapido' }, d.pares.map(() => el('i')));
  const mesa = el('div', { class: 'mesa-compara' });
  const zona = el('div', { class: 'caseta-abanicos' }, marcador, mesa);
  ctx.escenario.append(zona);
  let n = 0, fallos = 0, ocupado = false;
  const muestra = () => {
    const p = d.pares[n];
    const lados = [0, 1].map((k) => el('button', { type: 'button', class: 'pieza-angulo', 'aria-label': `Opción ${'AB'[k]}`, html: caja(centrado(dibujo(p.objeto, p.a[k], p.r[k], p.giro[k], k + n), p.a[k], p.giro[k], p.r[k])) }, el('span', { class: 'letra-opcion', text: 'AB'[k] })));
    lados.forEach((b, k) => (b.onclick = () => responde(k)));
    mesa.replaceChildren(lados[0], lados[1], d.iguales && el('button', { type: 'button', class: 'tecla boton-iguales', text: 'Iguales', onclick: () => responde(2) }));
    gsap.from(lados, { scale: 0.6, rotation: (i) => (i ? 12 : -12), opacity: 0, duration: 0.35, ease: 'back.out(2)', stagger: 0.08 });
  };
  const responde = async (k) => {
    if (ocupado) return; ocupado = true;
    const p = d.pares[n];
    const bueno = p.a[0] === p.a[1] ? 2 : p.a[0] > p.a[1] ? 0 : 1;
    const ok = k === bueno;
    marcador.children[n].classList.add(ok ? 'bien' : 'mal');
    // se superponen los dos para que se vea
    const piezas = mesa.querySelectorAll('.pieza-angulo');
    piezas.forEach((b, j) => b.append(el('span', { class: 'grados-pieza', text: `${p.a[j]}°` })));
    if (ok) { suena('estrella', n); chispasEn(piezas[bueno === 2 ? 0 : bueno] ?? piezas[0], 10, '#ffc531'); } else { fallos++; suena('mal'); temblor(mesa, 5); ctx.aviso(bueno === 2 ? 'Estaban igual de abiertos: los brazos largos engañan.' : `El más abierto era el ${'AB'[bueno]}. ${p.r[bueno] < p.r[1 - bueno] ? 'Aunque tenga los brazos más cortos.' : ''}`, true); }
    await espera(ok ? 900 : 2200); ctx.aviso('');
    n++;
    if (n >= N) return ctx.fin(porFallos(fallos), fallos ? `${N - fallos} de ${N}. Para comparar, fíjate en **el hueco entre los dos brazos**, no en lo largos que son.` : '**¡Todos bien!** No te han engañado los brazos largos.');
    muestra(); ocupado = false;
  };
  muestra();
  ctx.pistas([{ texto: 'Imagina que cierras los dos: ¿cuál tiene que girar más para cerrarse? Ese está más abierto.' }, { texto: 'Los brazos largos no hacen más grande el ángulo. Un ángulo mide **cuánto gira** un brazo respecto al otro.' }]);
}

/* ================================================================ ordenar */
function ordena(d, ctx) {
  const N = d.angulos.length, baja = d.sentido !== 'sube';
  const bien = d.angulos.map((x, i) => i).sort((i, j) => (baja ? d.angulos[j].a - d.angulos[i].a : d.angulos[i].a - d.angulos[j].a));
  ctx.reto(d.texto ?? (baja ? 'Ordena de **más abierto a menos abierto**' : 'Ordena de **menos abierto a más abierto**'));
  ctx.pista(d.pista ?? 'Arrastra cada uno a un hueco del mostrador. Se cambian de sitio si te equivocas.');
  const huecos = bien.map((_, i) => el('div', { class: 'hueco-angulo', 'data-i': i }, el('small', { text: i === 0 ? (baja ? 'Más abierto' : 'Menos abierto') : i === N - 1 ? (baja ? 'Menos abierto' : 'Más abierto') : String(i + 1) })));
  const M = mesaDeCartas({ valores: d.angulos.map((_, i) => i), huecos, clase: 'pieza-angulo carta-angulo', etiqueta: (v) => `Pieza ${+v + 1}`, contenido: (v) => { const o = d.angulos[v]; return el('span', { class: 'dibujo-angulo', html: caja(centrado(dibujo(o.objeto, o.a, o.r, o.giro, v), o.a, o.giro, o.r)) }); }, alCambiar: () => (boton.disabled = huecos.some((h) => M.valor(h) == null)) });
  ctx.escenario.append(el('div', { class: 'caseta-abanicos' }, el('div', { class: 'fila-huecos-angulo' }, huecos), M.mazo));
  let intento = 0, hecho = false;
  const boton = ctx.boton('Comprobar', async () => {
    if (hecho) return;
    intento++;
    const malos = huecos.filter((h, i) => +M.valor(h) !== bien[i]);
    if (!malos.length) {
      hecho = true; boton.disabled = true; M.bloquea();
      huecos.forEach((h, i) => h.append(el('span', { class: 'grados-pieza', text: `${d.angulos[bien[i]].a}°` })));
      chispasEn(huecos[0], 14, '#ffc531'); suena('selloBien');
      return ctx.fin(porIntento(intento), `**¡En orden!** ${bien.map((i) => d.angulos[i].a + '°').join(baja ? ' > ' : ' < ')}.`);
    }
    suena('mal'); malos.forEach((h) => { const c = M.de(h); c.classList.add('mal'); setTimeout(() => c.classList.remove('mal'), 900); });
    temblor(huecos[0].parentNode, 5);
    if (intento >= 3) { hecho = true; boton.disabled = true; M.bloquea(); bien.forEach((v, i) => M.pon(M.cartas[v], huecos[i])); huecos.forEach((h, i) => h.append(el('span', { class: 'grados-pieza', text: `${d.angulos[bien[i]].a}°` }))); return ctx.fin(0, 'Así quedaban. Mira el hueco que dejan los brazos, aunque estén girados o sean de distinto largo.'); }
    ctx.aviso(`Hay ${malos.length} fuera de su sitio (se han puesto en rojo).`, true);
  });
  boton.disabled = true;
  if (ctx.primera) demuestra(M.cartas[0], huecos[0], { demora: 1300 });
  ctx.pistas([{ texto: 'Busca primero el **más abierto** de todos y ponlo en su sitio. Luego el siguiente.' }, { texto: 'Si dudas entre dos, imagina que los giras hasta que un brazo quede tumbado: así se comparan mejor.' }, { texto: 'Te pongo el primero.', ver: () => M.pon(M.cartas[bien[0]], huecos[0]) }]);
}

/* ================================================================ abrir igual */
function iguala(d, ctx) {
  ctx.reto(d.texto ?? 'Abre tu abanico **igual que el del feriante**');
  ctx.pista(d.pista ?? 'Arrastra la punta de la varilla roja. Tu abanico es más grande, pero tiene que abrirse lo mismo.');
  const modelo = el('div', { class: 'pieza-angulo modelo', html: caja(centrado(abanico(d.a, d.rModelo, d.giroModelo, '#5ec3ff'), d.a, d.giroModelo, d.rModelo)) }, el('span', { class: 'letra-opcion', text: 'Modelo' }));
  const vb = 112;
  const tuyo = el('div', { class: 'pieza-angulo tuyo' });
  ctx.escenario.append(el('div', { class: 'caseta-abanicos' }, el('div', { class: 'mesa-compara' }, modelo, tuyo)));
  let a = 20, hecho = false, movido = false;
  const pinta = () => {
    const [tx, ty] = P(d.rTuyo, a);
    tuyo.innerHTML = `<svg viewBox="${-vb} ${-vb} ${2 * vb} ${2 * vb}" aria-hidden="true" overflow="visible"><g transform="translate(-50 40)">${abanico(a, d.rTuyo, 0, '#ff9fbf')}<circle class="tirador-abanico" cx="${f1(tx)}" cy="${f1(ty)}" r="14" fill="#d7263d" stroke="${T}" stroke-width="3"/></g></svg>`;
  };
  pinta();
  // girar la varilla: el ángulo es el del dedo respecto al vértice
  tuyo.style.touchAction = 'none';
  let arr = false;
  const toma = (e) => { const s = tuyo.querySelector('svg').getBoundingClientRect(); const k = s.width / (2 * vb); const vx = s.left + (vb - 50) * k, vy = s.top + (vb + 40) * k; let g = (Math.atan2(-(e.clientY - vy), e.clientX - vx) * 180) / Math.PI; if (g < -30) g += 360; a = Math.max(5, Math.min(175, Math.round(g))); pinta(); };
  tuyo.addEventListener('pointerdown', (e) => { if (hecho) return; arr = true; tuyo.setPointerCapture?.(e.pointerId); toma(e); suena('coge'); });
  tuyo.addEventListener('pointermove', (e) => arr && toma(e));
  const suelta = () => { if (!arr) return; arr = false; movido = true; boton.disabled = false; suena('pon'); };
  tuyo.addEventListener('pointerup', suelta); tuyo.addEventListener('pointercancel', suelta);
  if (ctx.primera) mano(tuyo, { tipo: 'arrastra', dx: 0.75, demora: 1600 });
  const boton = ctx.boton('Ya está', () => {
    if (hecho || !movido) return;
    hecho = true; boton.disabled = true;
    const dif = Math.abs(a - d.a), e = dif <= 5 ? 3 : dif <= 10 ? 2 : dif <= 18 ? 1 : 0;
    // el modelo se pone encima del tuyo, a su tamaño
    tuyo.querySelector('g').insertAdjacentHTML('beforeend', `<path d="${sector(d.rTuyo * 0.85, 0, d.a)}" fill="none" stroke="#1b8f4e" stroke-width="5" stroke-dasharray="8 6"/>`);
    if (e === 3) chispasEn(tuyo, 14, '#ffc531');
    ctx.fin(e, `El modelo se abría **${d.a}°** y el tuyo, ${a}°. ${dif <= 5 ? '¡Calcado!' : dif <= 10 ? 'Muy cerca.' : `Te ${a > d.a ? 'has pasado' : 'has quedado corto'}: ${dif}° de diferencia.`}`);
  });
  boton.disabled = true;
  ctx.pistas([{ texto: 'Fíjate en el **hueco** entre las dos varillas del modelo. El tamaño del abanico no importa.' }, { texto: d.a > 90 ? 'El modelo se abre **más que una esquina** de folio.' : d.a < 90 ? 'El modelo se abre **menos que una esquina** de folio.' : 'El modelo se abre **justo como una esquina** de folio.' }]);
}

/* ================================================================ clasificar */
const NOMBRE = { agudo: 'Agudo', recto: 'Recto', obtuso: 'Obtuso', llano: 'Llano', completo: 'Completo' };
const ayuda = { agudo: 'menos que una esquina', recto: 'una esquina justa', obtuso: 'más que una esquina y menos que media vuelta', llano: 'media vuelta: los brazos en línea', completo: 'una vuelta entera' };
function clasifica(d, ctx) {
  ctx.reto(d.texto ?? 'Mete cada banderín en **su cubo**');
  ctx.pista(d.pista ?? 'Arrastra cada ángulo al cubo de su tipo (o tócalo y luego toca el cubo).');
  const cubos = d.tipos.map((t) => el('div', { class: 'cubo-angulo', 'data-t': t }, el('div', { class: 'etiqueta-cubo' }, el('b', { text: NOMBRE[t] }), el('small', { text: ayuda[t] })), el('div', { class: 'dentro-cubo' })));
  const mazo = el('div', { class: 'mazo-cartas' });
  const cartas = d.cartas.map((c, i) => el('div', { class: 'carta-angulo pieza-angulo', tabindex: 0, role: 'button', 'aria-label': `Ángulo ${i + 1}`, 'data-i': i, html: caja(centrado(brazos(c.a, c.r[0], c.r[1], c.g), c.a, c.g, Math.max(...c.r)), 62) }));
  mazo.append(...cartas);
  ctx.escenario.append(el('div', { class: 'caseta-banderolas' }, el('div', { class: 'fila-cubos' }, cubos), mazo));
  const donde = new Map();
  let elegida = null, intento = 0, hecho = false;
  const mete = (c, cubo) => { if (cubo) { cubo.querySelector('.dentro-cubo').append(c); donde.set(c, cubo.dataset.t); } else { mazo.append(c); donde.delete(c); } boton.disabled = donde.size < cartas.length; };
  const marca = (c) => { elegida?.classList.remove('elegida'); elegida = elegida === c ? null : c; elegida?.classList.add('elegida'); suena('clic'); };
  cartas.forEach((c) => arrastra(c, { puede: () => !hecho, destinos: () => [...cubos, mazo], alSoltar: (dest) => { elegida?.classList.remove('elegida'); elegida = null; mete(c, dest === mazo ? null : dest); return c; }, alTocar: () => { if (hecho) return; if (elegida && elegida !== c && donde.has(c)) { const e = elegida; marca(e); mete(e, cubos.find((cu) => cu.dataset.t === donde.get(c))); aterriza(e); return; } marca(c); } }));
  cubos.forEach((cu) => cu.addEventListener('click', (e) => { if (!elegida || hecho || e.target.closest('.carta-angulo') === elegida) return; const c = elegida; marca(c); mete(c, cu); aterriza(c); }));
  const boton = ctx.boton('Comprobar', async () => {
    if (hecho) return;
    intento++;
    const malas = cartas.filter((c) => donde.get(c) !== d.cartas[+c.dataset.i].t);
    if (!malas.length) { hecho = true; boton.disabled = true; cartas.forEach((c) => c.classList.add('bien')); suena('selloBien'); chispasEn(cubos[0], 12, '#ffc531'); return ctx.fin(porIntento(intento), '**¡Cada uno en su cubo!**'); }
    suena('mal');
    if (intento >= 3) { hecho = true; boton.disabled = true; malas.forEach((c) => { mete(c, cubos.find((cu) => cu.dataset.t === d.cartas[+c.dataset.i].t)); c.classList.add('mal'); }); return ctx.fin(0, 'Los rojos estaban en otro cubo. La clave es comparar con **una esquina** (un ángulo recto).'); }
    for (const c of malas) { c.classList.add('mal'); await espera(120); }
    await espera(700);
    malas.forEach((c) => { c.classList.remove('mal'); mete(c, null); });
    ctx.aviso(`${malas.length === 1 ? 'Uno ha vuelto' : `${malas.length} han vuelto`} al montón: no ${malas.length === 1 ? 'era' : 'eran'} de ese cubo.`, true);
  });
  boton.disabled = true;
  if (ctx.primera) demuestra(cartas[0], cubos.find((cu) => cu.dataset.t === d.cartas[0].t), { demora: 1300 });
  ctx.pistas([{ texto: 'Compara cada ángulo con la **esquina de un folio**: si cabe dentro, agudo; si es justo, recto; si sobra, obtuso.', ver: () => cartas.forEach((c) => c.classList.add('con-esquina')) }, { texto: 'Si los dos brazos forman una **línea recta**, es llano. Si dan **la vuelta entera**, completo.' }]);
}

/* ================================================================ banderines con obtuso */
function busca(d, ctx) {
  ctx.reto(d.texto ?? 'Toca los banderines que tienen **algún ángulo obtuso**');
  ctx.pista(d.pista ?? 'Basta con una esquina más abierta que la de un folio. Puede haber varios, o ninguno de un tipo.');
  const cuerda = el('div', { class: 'cuerda-banderines' });
  const bs = d.banderines.map((b, i) => {
    const path = 'M' + b.pts.map(([x, y]) => `${f1(x)} ${f1(y)}`).join(' L') + 'Z';
    const n = el('button', { type: 'button', class: 'banderin', 'aria-pressed': 'false', 'aria-label': `Banderín ${i + 1}`, html: `<svg viewBox="-95 -95 190 190" aria-hidden="true"><path d="${path}" fill="${COL[i % COL.length]}" stroke="${T}" stroke-width="5" stroke-linejoin="round"/><g class="marcas-angulos"></g></svg>` });
    n.onclick = () => { if (hecho) return; const v = n.getAttribute('aria-pressed') !== 'true'; n.setAttribute('aria-pressed', String(v)); suena(v ? 'pon' : 'quita'); bote(n, 6); };
    cuerda.append(n); return n;
  });
  ctx.escenario.append(el('div', { class: 'caseta-banderolas' }, cuerda));
  let hecho = false, intento = 0;
  const pintaAngulos = (b, nodo, todos) => {
    const g = nodo.querySelector('.marcas-angulos'); let h = '';
    b.pts.forEach((p, i) => {
      if (!todos && !b.obtusos.includes(i)) return;
      const n = b.pts.length, a = b.pts[(i + n - 1) % n], c = b.pts[(i + 1) % n];
      const a0 = (Math.atan2(-(a[1] - p[1]), a[0] - p[0]) * 180) / Math.PI, a1 = (Math.atan2(-(c[1] - p[1]), c[0] - p[0]) * 180) / Math.PI;
      let s = a0, e = a1; let dlt = ((e - s) % 360 + 360) % 360; if (dlt > 180) { [s, e] = [e, s]; dlt = 360 - dlt; }
      h += `<g transform="translate(${f1(p[0])} ${f1(p[1])})"><path d="${sector(16, s, s + dlt)}" fill="${b.obtusos.includes(i) ? '#d7263d' : '#fffdf6'}" opacity=".85" stroke="${T}" stroke-width="2"/></g>`;
    });
    g.innerHTML = h;
  };
  const boton = ctx.boton('Comprobar', () => {
    if (hecho) return;
    intento++;
    const errores = bs.filter((n, i) => (n.getAttribute('aria-pressed') === 'true') !== d.banderines[i].obtusos.length > 0);
    if (!errores.length || intento >= 2) {
      hecho = true; boton.disabled = true;
      bs.forEach((n, i) => { pintaAngulos(d.banderines[i], n, true); n.classList.add(d.banderines[i].obtusos.length ? 'tiene' : 'no-tiene'); });
      if (!errores.length) { suena('selloBien'); chispasEn(cuerda, 18, '#ffc531'); }
      return ctx.fin(errores.length ? 0 : porIntento(intento), errores.length ? `Los obtusos están marcados en rojo. ${errores.length === 1 ? 'Uno' : errores.length} estaba${errores.length === 1 ? '' : 'n'} mal.` : '**¡Bien visto!** Los ángulos obtusos están marcados en rojo.');
    }
    suena('mal'); temblor(cuerda, 4);
    ctx.aviso(`Hay ${errores.length} ${errores.length === 1 ? 'banderín' : 'banderines'} mal. Repasa sus esquinas una a una.`, true);
  });
  ctx.pistas([{ texto: 'Mira las esquinas una a una. Si alguna se abre **más que la esquina de un folio**, ese banderín vale.' }, { texto: 'Un triángulo puede tener **como mucho un** ángulo obtuso. Los rectángulos y los cuadrados, ninguno.' }, { texto: 'Te marco las esquinas de uno.', ver: () => { const i = d.banderines.findIndex((b) => b.obtusos.length); if (i >= 0) pintaAngulos(d.banderines[i], bs[i], true); } }]);
}

/* ================================================================ parejas de ángulos iguales */
function parejas(d, ctx) {
  ctx.reto(d.texto ?? 'Junta las **parejas de ángulos iguales**');
  ctx.pista(d.pista ?? 'Toca dos que midan lo mismo. Están girados y tienen los brazos de distinto largo, para despistar.');
  const tablero = el('div', { class: 'tablero-parejas' });
  const cs = d.cartas.map((c, i) => { const b = el('button', { type: 'button', class: 'carta-angulo pieza-angulo', 'aria-label': `Ángulo ${i + 1}`, html: caja(centrado(brazos(c.a, c.r[0], c.r[1], c.g), c.a, c.g, Math.max(...c.r)), 62) }); b.onclick = () => toca(i); tablero.append(b); return b; });
  ctx.escenario.append(el('div', { class: 'caseta-banderolas' }, tablero));
  let primero = null, fallos = 0, hechas = 0, ocupado = false;
  const toca = async (i) => {
    if (ocupado || cs[i].classList.contains('emparejada')) return;
    if (primero === i) { cs[i].classList.remove('elegida'); primero = null; return; }
    cs[i].classList.add('elegida'); suena('clic');
    if (primero == null) { primero = i; return; }
    ocupado = true;
    const j = primero; primero = null;
    if (d.cartas[i].a === d.cartas[j].a) {
      [i, j].forEach((k) => { cs[k].classList.remove('elegida'); cs[k].classList.add('emparejada', 'p' + hechas); cs[k].append(el('span', { class: 'grados-pieza', text: `${d.cartas[k].a}°` })); });
      hechas++; suena('estrella', hechas); chispasEn(cs[i], 8, '#ffc531');
      if (hechas * 2 >= cs.length) { ocupado = false; return ctx.fin(porFallos(Math.max(0, fallos - 1)), fallos ? `Todas las parejas, con ${fallos} ${fallos === 1 ? 'intento fallido' : 'intentos fallidos'}. Girar un ángulo **no lo cambia**.` : '**¡Sin un fallo!** Ni el giro ni el largo de los brazos te han engañado.'); }
    } else {
      fallos++; suena('mal'); temblor(cs[i], 5); temblor(cs[j], 5);
      await espera(600); cs[i].classList.remove('elegida'); cs[j].classList.remove('elegida');
    }
    ocupado = false;
  };
  ctx.pistas([{ texto: 'Gira la cabeza (o la tablet): ¿se parecen dos cuando los pones con un brazo tumbado?' }, { texto: 'Sepáralos en montones: los que son **menos que una esquina**, los que son **una esquina** y los que son **más**.' }]);
}

/* ================================================================ la ruleta: estimar */
function ruedaRuleta(a, g, R = 100) {
  const gajos = Array.from({ length: 12 }, (_, i) => `<path d="${sector(R, i * 30, i * 30 + 30)}" fill="${i % 2 ? '#fffdf6' : '#f3ecdf'}" stroke="${T}" stroke-width="1.5" opacity=".9"/>`).join('');
  return `${gajos}<path d="${sector(R, g, g + a)}" fill="#e8417a" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><circle r="${R}" fill="none" stroke="${T}" stroke-width="5"/><circle r="9" fill="${T}"/>`;
}
function estima(d, ctx) {
  const N = d.ruedas.length;
  ctx.reto(d.texto ?? '¿Cuánto mide el **trozo rojo** de la ruleta?');
  ctx.pista(d.pista ?? 'A ojo. Piensa en la esquina de un folio (90°) y en media vuelta (180°).');
  const marcador = el('div', { class: 'marcador-rapido' }, d.ruedas.map(() => el('i')));
  const rueda = el('div', { class: 'ruleta-feria' });
  const ops = el('div', { class: 'opciones-ruleta' });
  ctx.escenario.append(el('div', { class: 'caseta-ruleta' }, marcador, rueda, ops));
  let n = 0, fallos = 0, ocupado = false;
  const muestra = () => {
    const r = d.ruedas[n];
    rueda.innerHTML = `<svg viewBox="-120 -120 240 240" aria-hidden="true"><g class="gira-ruleta">${ruedaRuleta(r.a, r.g)}</g><path d="M0 -118 l-10 -16 h20z" fill="#ffc531" stroke="${T}" stroke-width="3"/></svg>`;
    gsap.from(rueda.querySelector('.gira-ruleta'), { rotation: -720, svgOrigin: '0 0', duration: 1.1, ease: 'power3.out' });
    suena('cremallera');
    ops.replaceChildren(...r.ops.map((v) => el('button', { type: 'button', class: 'tecla grande', text: `${v}°`, onclick: () => responde(v) })));
  };
  const responde = async (v) => {
    if (ocupado) return; ocupado = true;
    const r = d.ruedas[n], ok = v === r.a;
    marcador.children[n].classList.add(ok ? 'bien' : 'mal');
    [...ops.children].forEach((b) => { if (b.textContent === `${r.a}°`) b.classList.add('correcta'); else if (b.textContent === `${v}°`) b.classList.add('fallada'); b.disabled = true; });
    if (ok) suena('estrella', n); else { fallos++; suena('mal'); temblor(rueda, 5); }
    await espera(ok ? 900 : 1800);
    n++;
    if (n >= N) return ctx.fin(porFallos(fallos), fallos ? `${N - fallos} de ${N}. Usa de referencia **90°** (una esquina) y **180°** (media vuelta).` : '**¡Ojo de ruletero!** Todas bien.');
    muestra(); ocupado = false;
  };
  muestra();
  ctx.pistas([{ texto: 'Cada gajo de la ruleta mide **30°**. Cuenta los gajos que ocupa el trozo rojo.', ver: () => rueda.classList.add('marca-gajos') }, { texto: '45° es la mitad de una esquina. 135° es una esquina y media.' }]);
}

/* ================================================================ el medidor: dibujar y medir */
function transportador(izq) {
  let t = '';
  for (let k = 0; k <= 180; k += 1) {
    const r1 = 120, r2 = k % 10 === 0 ? 104 : k % 5 === 0 ? 110 : 114;
    const [x1, y1] = P(r1, k), [x2, y2] = P(r2, k);
    t += `<path d="M${f1(x1)} ${f1(y1)} L${f1(x2)} ${f1(y2)}" stroke="${T}" stroke-width="${k % 10 ? 0.8 : 1.6}"/>`;
    if (k % 10 === 0) { const [tx, ty] = P(94, k), [ux, uy] = P(76, k); t += `<text x="${f1(tx)}" y="${f1(ty + 3)}" text-anchor="middle" font-size="8.5" font-weight="800" font-family="Rotulo,sans-serif" fill="${T}">${k}</text><text x="${f1(ux)}" y="${f1(uy + 3)}" text-anchor="middle" font-size="7" font-weight="700" font-family="Rotulo,sans-serif" fill="#d7263d">${180 - k}</text>`; }
  }
  return `<g class="medidor"><path d="M-124 0 A124 124 0 0 1 124 0 Z" fill="rgba(94,195,255,.28)" stroke="${T}" stroke-width="2.5"/><path d="M-62 0 A62 62 0 0 1 62 0" fill="none" stroke="${T}" stroke-width="1.2"/>${t}<path d="M-124 0 H124" stroke="${T}" stroke-width="2"/><circle r="3.5" fill="${T}"/></g>`;
}
function dibujaAng(d, ctx) { return medidor(d, ctx, true); }
function mide(d, ctx) { return medidor(d, ctx, false); }
function medidor(d, ctx, dibujar) {
  const izq = d.izquierda;
  ctx.reto(d.texto ?? (dibujar ? `Dibuja un ángulo de **${d.a}°** con el medidor` : '¿Cuánto mide este ángulo? **Mídelo con el medidor**'));
  ctx.pista(d.pista ?? (dibujar ? `Un brazo ya está puesto${izq ? ', hacia la izquierda' : ''}. Arrastra la punta del otro hasta los ${d.a}°. ¡Ojo con qué fila de números lees!` : `Cuenta desde el 0 del brazo ${izq ? 'de la izquierda' : 'tumbado'}. Hay dos filas de números: lee la buena.`));
  const lienzo = el('div', { class: 'lienzo-medidor' });
  const zona = el('div', { class: 'caseta-ruleta' }, lienzo);
  ctx.escenario.append(zona);
  const base = izq ? 180 : 0;
  let a = dibujar ? 15 : d.a, hecho = false, movido = false;
  const pinta = (extra = '') => {
    const dir = izq ? 180 - a : a;
    const [bx, by] = P(140, base), [x, y] = P(140, dir);
    lienzo.innerHTML = `<svg viewBox="-160 -150 320 170" aria-hidden="true">${transportador(izq)}<path d="M0 0 L${f1(bx)} ${f1(by)}" stroke="${T}" stroke-width="5" stroke-linecap="round"/><path d="M0 0 L${f1(x)} ${f1(y)}" stroke="${dibujar ? '#d7263d' : T}" stroke-width="5" stroke-linecap="round"/>${dibujar ? `<circle cx="${f1(x)}" cy="${f1(y)}" r="11" fill="#d7263d" stroke="${T}" stroke-width="3"/>` : ''}${extra}</svg>`;
  };
  pinta();
  if (dibujar) {
    lienzo.style.touchAction = 'none';
    let arr = false;
    const toma = (e) => { const s = lienzo.querySelector('svg').getBoundingClientRect(); const k = s.width / 320; const vx = s.left + 160 * k, vy = s.top + 150 * k; let g = (Math.atan2(-(e.clientY - vy), e.clientX - vx) * 180) / Math.PI; if (g < -90) g += 360; g = Math.max(0, Math.min(180, g)); a = Math.round(izq ? 180 - g : g); pinta(); };
    lienzo.addEventListener('pointerdown', (e) => { if (hecho) return; arr = true; lienzo.setPointerCapture?.(e.pointerId); toma(e); suena('coge'); });
    lienzo.addEventListener('pointermove', (e) => arr && toma(e));
    const suelta = () => { if (!arr) return; arr = false; movido = true; boton.disabled = false; suena('pon'); };
    lienzo.addEventListener('pointerup', suelta); lienzo.addEventListener('pointercancel', suelta);
    if (ctx.primera) mano(lienzo, { tipo: 'arrastra', dx: 0.85, demora: 1600 });
    const boton = ctx.boton('Ya está', () => {
      if (hecho || !movido) return;
      hecho = true; boton.disabled = true;
      const dif = Math.abs(a - d.a), e = dif <= 2 ? 3 : dif <= 5 ? 2 : dif <= 10 ? 1 : 0;
      const dir = izq ? 180 - d.a : d.a; const [gx, gy] = P(140, dir);
      pinta(`<path d="M0 0 L${f1(gx)} ${f1(gy)}" stroke="#1b8f4e" stroke-width="4" stroke-dasharray="7 5"/>`);
      const confundido = Math.abs(a - (180 - d.a)) <= 3 && dif > 10;
      if (e === 3) chispasEn(lienzo, 14, '#ffc531');
      ctx.fin(e, `Has dibujado **${a}°**${dif <= 2 ? ': ¡exacto!' : `, y eran ${d.a}° (la línea verde).`} ${confundido ? 'Has leído la otra fila de números: empieza a contar desde el 0 de **tu** brazo.' : ''}`);
    });
    boton.disabled = true;
  } else {
    const i = campo('Grados', 4);
    zona.append(el('label', { class: 'prediccion' }, el('span', { text: 'Mide' }), i, el('span', { text: 'grados' })));
    let intento = 0;
    const boton = ctx.boton('Comprobar', () => {
      if (hecho) return;
      const v = lee(i); if (v == null) return ctx.aviso('Escribe los grados.', true);
      intento++;
      const dif = Math.abs(v - d.a);
      if (dif <= 2) { hecho = true; boton.disabled = true; i.classList.add('bien'); chispasEn(i, 10, '#ffc531'); return ctx.fin(porIntento(intento), `**${d.a}°**. ${dif ? `Tú has dicho ${v}°: casi exacto.` : '¡Exacto!'}`); }
      i.classList.add('mal'); temblor(i, 5); suena('mal');
      if (Math.abs(v - (180 - d.a)) <= 2) ctx.aviso(`${v}° es lo que pone en la otra fila. ¿Es un ángulo ${d.a < 90 ? 'agudo o obtuso' : 'obtuso o agudo'}? Mira bien.`, true);
      else ctx.aviso('No es eso. Busca dónde corta el brazo y lee desde el 0 del otro brazo.', true);
      if (intento >= 3) { hecho = true; boton.disabled = true; ctx.fin(0, `Medía **${d.a}°**. Truco: antes de leer, mira si es más o menos que 90°.`); }
    });
    conIntro(i, () => boton.click());
  }
  ctx.pistas([
    { texto: '¿Es **más o menos que una esquina** (90°)? Eso te dice qué fila de números es la buena.' },
    { texto: izq ? 'Tu brazo fijo va hacia la **izquierda**: cuenta con los números **rojos de dentro**, que empiezan en 0 por ese lado.' : 'Tu brazo fijo va hacia la **derecha**: cuenta con los números **negros de fuera**, que empiezan en 0 por ese lado.' },
    { texto: dibujar ? `Entre el ${Math.floor(d.a / 10) * 10} y el ${Math.floor(d.a / 10) * 10 + 10} hay 10 rayitas: cada una es 1 grado.` : `Está entre ${Math.floor(d.a / 10) * 10}° y ${Math.floor(d.a / 10) * 10 + 10}°.` },
  ]);
}
