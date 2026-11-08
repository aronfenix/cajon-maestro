// Motor «geoplano»: figuras sobre una retícula de puntos. Todo se decide con coordenadas enteras, nunca con píxeles.
//   seleccionar → marcar todas las figuras que cumplen una propiedad (cuadriláteros, triángulos, convexidad, lados, giros)
//   construir   → unir puntos para hacer una figura (con anclajes limitados, simétrica o trasladada)
import { el, svg, barajar, azar, elige, suena } from './nucleo.js';
import { espera, mano, temblor } from './efectos.js';

/* ================================================================ geometría exacta */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const cruz = (u, v) => u[0] * v[1] - u[1] * v[0];
const esc = (u, v) => u[0] * v[0] + u[1] * v[1];
const l2 = (u) => esc(u, u);
const aristas = (P) => P.map((p, i) => sub(P[(i + 1) % P.length], p));
const area2 = (P) => P.reduce((s, p, i) => s + cruz(p, P[(i + 1) % P.length]), 0);
function cortan(a, b, c, d) {
  const o = (p, q, r) => Math.sign(cruz(sub(q, p), sub(r, p)));
  const o1 = o(a, b, c), o2 = o(a, b, d), o3 = o(c, d, a), o4 = o(c, d, b);
  if (o1 !== o2 && o3 !== o4) return true;
  const sobre = (p, q, r) => Math.min(p[0], r[0]) <= q[0] && q[0] <= Math.max(p[0], r[0]) && Math.min(p[1], r[1]) <= q[1] && q[1] <= Math.max(p[1], r[1]);
  return (o1 === 0 && sobre(a, c, b)) || (o2 === 0 && sobre(a, d, b)) || (o3 === 0 && sobre(c, a, d)) || (o4 === 0 && sobre(c, b, d));
}
export function simple(P) {
  const n = P.length;
  if (n < 3 || area2(P) === 0) return false;
  const E = aristas(P);
  for (let i = 0; i < n; i++) if (cruz(E[i], E[(i + 1) % n]) === 0) return false; // sin vértices alineados
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
    if (j === i + 1 || (i === 0 && j === n - 1)) continue;
    if (cortan(P[i], P[(i + 1) % n], P[j], P[(j + 1) % n])) return false;
  }
  return new Set(P.map(String)).size === n;
}
export const convexo = (P) => { const E = aristas(P); const s = E.map((e, i) => Math.sign(cruz(e, E[(i + 1) % E.length]))); return s.every((x) => x === s[0]); };
// vértices entrantes (ángulo interior mayor de 180°)
const entrantes = (P) => { const o = Math.sign(area2(P)); const E = aristas(P); return P.map((_, i) => i).filter((i) => Math.sign(cruz(E[(i - 1 + P.length) % P.length], E[i])) === -o); };
export function cuadri(P) {
  const E = aristas(P);
  const p1 = cruz(E[0], E[2]) === 0, p2 = cruz(E[1], E[3]) === 0;
  const paralelogramo = p1 && p2 && convexo(P);
  const rectangulo = paralelogramo && esc(E[0], E[1]) === 0;
  const rombo = paralelogramo && l2(E[0]) === l2(E[1]);
  return { paralelogramo, rectangulo, rombo, cuadrado: rectangulo && rombo, trapecio: p1 !== p2 && convexo(P), trapezoide: !p1 && !p2 };
}
export function tri(P) {
  const s = aristas(P).map(l2).sort((a, b) => a - b);
  return { rectangulo: s[0] + s[1] === s[2], obtusangulo: s[0] + s[1] < s[2], acutangulo: s[0] + s[1] > s[2], isosceles: s[0] === s[1] || s[1] === s[2], escaleno: s[0] !== s[1] && s[1] !== s[2] };
}
const rota = (P, k) => P.map(([x, y]) => { for (let i = 0; i < ((k % 4) + 4) % 4; i++) [x, y] = [-y, x]; return [x, y]; });
const espejo = (P) => P.map(([x, y]) => [-x, y]).reverse();
const normaliza = (P) => { const mx = Math.min(...P.map((p) => p[0])), my = Math.min(...P.map((p) => p[1])); return P.map(([x, y]) => [x - mx, y - my]); };
const caja = (P) => [Math.max(...P.map((p) => p[0])) - Math.min(...P.map((p) => p[0])), Math.max(...P.map((p) => p[1])) - Math.min(...P.map((p) => p[1]))];
// misma figura y mismo sitio, empiece por donde empiece y en cualquier sentido
export function igual(A, B) {
  if (A.length !== B.length) return false;
  const k = A.map(String), n = k.length;
  for (const C of [B, [...B].reverse()]) { const c = C.map(String); for (let s = 0; s < n; s++) if (c.every((v, i) => v === k[(i + s) % n])) return true; }
  return false;
}
// misma forma salvo traslación (para giros: probamos las cuatro rotaciones de 90°)
const forma = (P) => normaliza(P);
const congruenteGiro = (A, B) => [0, 1, 2, 3].some((r) => igual(forma(rota(A, r)), forma(B)));

/* ================================================================ propiedades que se pueden pedir */
const NOMBRES_N = { 3: 'triángulo', 4: 'cuadrilátero', 5: 'pentágono', 6: 'hexágono', 7: 'heptágono', 8: 'octógono' };
const PROP = {
  cuadrado: (P) => P.length === 4 && cuadri(P).cuadrado,
  rectangulo: (P) => P.length === 4 && cuadri(P).rectangulo,
  rombo: (P) => P.length === 4 && cuadri(P).rombo,
  paralelogramo: (P) => P.length === 4 && cuadri(P).paralelogramo,
  trapecio: (P) => P.length === 4 && cuadri(P).trapecio,
  convexo: (P) => convexo(P),
  noConvexo: (P) => !convexo(P),
  alMenos2Iguales: (P) => { const s = aristas(P).map(l2); return new Set(s).size < s.length; },
  todosIguales: (P) => new Set(aristas(P).map(l2)).size === 1,
  triRectangulo: (P) => P.length === 3 && tri(P).rectangulo,
  triObtusangulo: (P) => P.length === 3 && tri(P).obtusangulo,
  triAcutangulo: (P) => P.length === 3 && tri(P).acutangulo,
  triIsosceles: (P) => P.length === 3 && tri(P).isosceles,
  triEscaleno: (P) => P.length === 3 && tri(P).escaleno,
};
for (let n = 3; n <= 8; n++) PROP['lados' + n] = (P) => P.length === n;
const cumple = (buscar, P, modelo) => [].concat(buscar).every((b) => (b === 'giro' ? congruenteGiro(modelo, P) : PROP[b](P)));

// El «pasaporte»: todo lo que es una figura, con categorías inclusivas
export function pasaporte(P) {
  const n = P.length, out = [];
  if (n === 3) { const t = tri(P); out.push(t.isosceles ? 'isósceles' : 'escaleno', t.rectangulo ? 'rectángulo' : t.obtusangulo ? 'obtusángulo' : 'acutángulo'); return out; }
  if (n === 4) {
    const q = cuadri(P);
    if (q.cuadrado) out.push('cuadrado');
    if (q.rectangulo) out.push('rectángulo');
    if (q.rombo) out.push('rombo');
    if (q.paralelogramo) out.push('paralelogramo'); else if (q.trapecio) out.push('trapecio'); else out.push('trapezoide');
  } else out.push(NOMBRES_N[n] || `${n} lados`);
  if (!convexo(P)) out.push('no convexo');
  return out;
}

/* ================================================================ familias de figuras */
const PRIM = [[1, 0], [2, 0], [3, 0], [1, 1], [2, 1], [1, 2], [3, 1], [2, 2]];
const perp = ([a, b]) => [-b, a];
const suma = (...vs) => vs.reduce((s, v) => [s[0] + v[0], s[1] + v[1]], [0, 0]);
const mul = ([a, b], k) => [a * k, b * k];
const paral = (v, w) => [[0, 0], v, suma(v, w), w];
const FAM = {
  cuadradoRecto: () => { const s = azar(1, 4); return paral([s, 0], [0, s]); },
  cuadradoInclinado: () => { const v = elige([[1, 1], [2, 1], [1, 2], [2, 2], [3, 1]]); return paral(v, perp(v)); },
  rectanguloRecto: () => { const a = azar(1, 5), b = azar(1, 4); return a === b ? null : paral([a, 0], [0, b]); },
  rectanguloInclinado: () => { const v = elige([[1, 1], [2, 1], [1, 2]]); const k = elige([2, 3]); return paral(v, mul(perp(v), k)); },
  rombo: () => { const [v, w] = elige([[[2, 1], [1, 2]], [[2, 1], [-2, 1]], [[1, 2], [-1, 2]], [[3, 1], [1, 3]], [[2, 1], [2, -1]]]); return [[0, 0], v, suma(v, w), w]; },
  romboide: () => { const v = [azar(2, 3), 0], w = [azar(1, 2), azar(1, 3)]; return paral(v, w); },
  trapecio: () => { const p = azar(2, 5), q = azar(1, 4), h = azar(1, 3), s = azar(0, 2); return p === q ? null : [[0, 0], [p, 0], [s + q, h], [s, h]]; },
  trapecioRecto: () => { const p = azar(2, 5), q = azar(1, 4), h = azar(1, 3); return p === q ? null : [[0, 0], [p, 0], [q, h], [0, h]]; },
  cuadrilatero: () => aleatorio(4),
  dardo: () => { const a = azar(2, 4), h = azar(2, 4), d = azar(1, h - 1); return [[0, 0], [a, h], [0, d], [-a, h]]; },
  tri: () => aleatorio(3, 4),
  triRectangulo: () => { const a = azar(1, 4), b = azar(1, 4); return elige([[[0, 0], [a, 0], [0, b]], (() => { const v = elige([[1, 1], [2, 1], [1, 2]]); return [[0, 0], mul(v, elige([1, 2])), perp(v)]; })()]); },
  triIsosceles: () => { const a = azar(1, 3), h = azar(1, 4); return [[0, 0], [2 * a, 0], [a, h]]; },
  triObtuso: () => { const a = azar(2, 4), h = azar(1, 2), s = azar(a + 1, a + 2); return [[0, 0], [a, 0], [s, h]]; },
  convexo5: () => aleatorio(5, 5, true), convexo6: () => aleatorio(6, 5, true),
  concavo5: () => aleatorio(5, 5, false), concavo6: () => aleatorio(6, 5, false),
  pent: () => aleatorio(5), hex: () => aleatorio(6),
  oct: () => [[1, 0], [2, 0], [3, 1], [3, 2], [2, 3], [1, 3], [0, 2], [0, 1]].map(([x, y]) => (Math.random() < 0.5 ? [x, y] : [x * 1, y + (y > 1 ? 1 : 0)])),
  equilateroLados: () => elige([FAM.cuadradoRecto, FAM.cuadradoInclinado, FAM.rombo])(),
};
// Polígono aleatorio de n vértices en retícula (estrellado respecto a su centro, así es simple)
function aleatorio(n, lado = 5, quiereConvexo, minArea = lado <= 3 ? n * 0.7 : n * 1.3) {
  for (let t = 0; t < 300; t++) {
    const pts = new Set();
    while (pts.size < n) pts.add(`${azar(0, lado)},${azar(0, lado)}`);
    let P = [...pts].map((s) => s.split(',').map(Number));
    const cx = P.reduce((a, p) => a + p[0], 0) / n + 0.01, cy = P.reduce((a, p) => a + p[1], 0) / n + 0.013;
    P.sort((a, b) => Math.atan2(a[1] - cy, a[0] - cx) - Math.atan2(b[1] - cy, b[0] - cx));
    if (!simple(P) || Math.abs(area2(P)) < minArea * 2) continue;
    if (quiereConvexo === true && !convexo(P)) continue;
    if (quiereConvexo === false && convexo(P)) continue;
    return P;
  }
  return null;
}
// Coloca la figura en un tablero de N×N con un giro y una traslación al azar
function coloca(P, N, girar = true) {
  if (!P) return null;
  let Q = normaliza(girar ? rota(P, azar(0, 3)) : P);
  const [w, h] = caja(Q);
  if (w > N - 1 || h > N - 1) return null;
  const dx = azar(0, N - 1 - w), dy = azar(0, N - 1 - h);
  Q = Q.map(([x, y]) => [x + dx, y + dy]);
  return simple(Q) ? Q : null;
}
function figuraDe(fam, N, girar) {
  for (let t = 0; t < 60; t++) { const Q = coloca(FAM[fam](), N, girar); if (Q) return Q; }
  return null;
}

/* ================================================================ dibujo */
const PASO = 40;
function tablero(N, M = N, { tam = PASO, margen = 22 } = {}) {
  const w = (N - 1) * tam + 2 * margen, h = (M - 1) * tam + 2 * margen;
  const X = (x) => margen + x * tam, Y = (y) => margen + y * tam;
  let pins = '';
  for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) pins += `<circle cx="${X(x)}" cy="${Y(y)}" r="${tam > 50 ? 6 : 3.6}" class="pin"/>`;
  return { w, h, X, Y, pins };
}
const camino = (P, X, Y, cerrar = true) => P.map((p, i) => `${i ? 'L' : 'M'}${X(p[0])} ${Y(p[1])}`).join(' ') + (cerrar ? 'Z' : '');
// Notación de geometría: rayitas en lados iguales, flechas en lados paralelos, cuadradito en ángulos rectos
function notacion(P, X, Y, { iguales = true, paralelos = true, rectos = true, entrante = false } = {}) {
  const E = aristas(P), n = P.length;
  let s = '';
  if (rectos) for (let i = 0; i < n; i++) {
    const a = E[(i - 1 + n) % n], b = E[i];
    if (esc(a, b) !== 0) continue;
    const p = P[i], ua = mul(a, -1 / Math.sqrt(l2(a))), ub = mul(b, 1 / Math.sqrt(l2(b))), k = 0.28;
    const q1 = suma(p, mul(ua, k)), q2 = suma(p, mul(ua, k), mul(ub, k)), q3 = suma(p, mul(ub, k));
    s += `<path d="M${X(q1[0])} ${Y(q1[1])} L${X(q2[0])} ${Y(q2[1])} L${X(q3[0])} ${Y(q3[1])}" class="nota-recto"/>`;
  }
  if (iguales) {
    const grupos = new Map();
    E.forEach((e, i) => { const k = l2(e); grupos.set(k, [...(grupos.get(k) || []), i]); });
    let marca = 1;
    for (const [, idx] of [...grupos].filter(([, v]) => v.length > 1)) {
      for (const i of idx) {
        const a = P[i], b = P[(i + 1) % n], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const u = mul(perp(E[i]), 0.12 / Math.sqrt(l2(E[i]))), t = mul(E[i], 0.07 / Math.sqrt(l2(E[i])));
        for (let r = 0; r < marca; r++) { const c = suma(m, mul(t, (r - (marca - 1) / 2) * 1.6)); s += `<path d="M${X(c[0] - u[0])} ${Y(c[1] - u[1])} L${X(c[0] + u[0])} ${Y(c[1] + u[1])}" class="nota-igual"/>`; }
      }
      marca++;
    }
  }
  if (paralelos && n === 4) {
    [[0, 2], [1, 3]].forEach(([i, j], g) => {
      if (cruz(E[i], E[j]) !== 0) return;
      for (const k of [i, j]) {
        const a = P[k], b = P[(k + 1) % n], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], L = Math.sqrt(l2(E[k]));
        const u = mul(E[k], 0.13 / L), v = mul(perp(E[k]), 0.1 / L);
        for (let r = 0; r <= g; r++) { const c = suma(m, mul(u, r * 1.4 - g * 0.7 + 0.5)); s += `<path d="M${X(c[0] - u[0] - v[0])} ${Y(c[1] - u[1] - v[1])} L${X(c[0])} ${Y(c[1])} L${X(c[0] - u[0] + v[0])} ${Y(c[1] - u[1] + v[1])}" class="nota-paralela"/>`; }
      }
    });
  }
  if (entrante) for (const i of entrantes(P)) s += `<circle cx="${X(P[i][0])}" cy="${Y(P[i][1])}" r="9" class="nota-entrante"/>`;
  return s;
}

/* ================================================================ seleccionar */
function seleccionar(d, ctx) {
  const N = d.tam ?? 6;
  ctx.reto(d.texto ?? 'Selecciona **todas** las figuras que cumplen la regla');
  ctx.pista(d.pista ?? 'Toca las figuras para marcarlas. Puede haber varias… o muchas.');
  const modelo = d.modelo;
  if (modelo) {
    const T = tablero(N);
    ctx.escenario.append(el('div', { class: 'modelo-geo' }, el('span', { text: 'Esta es la figura' }),
      svg(`0 0 ${T.w} ${T.h}`, `${T.pins}<path d="${camino(modelo, T.X, T.Y)}" class="fig modelo"/>`, { width: 150, class: 'geo' })));
  }
  const rejilla = el('div', { class: 'cartas-geo', role: 'group', 'aria-label': 'Figuras' });
  const cartas = d.figuras.map((P, i) => {
    const T = tablero(N);
    const dib = svg(`0 0 ${T.w} ${T.h}`, `${T.pins}<path d="${camino(P, T.X, T.Y)}" class="fig"/>`, { class: 'geo' });
    const b = el('button', { type: 'button', class: 'carta-geo', 'aria-pressed': 'false', 'aria-label': `Figura ${i + 1}` }, dib, el('span', { class: 'pasaporte' }));
    b.onclick = () => { if (hecho) return; const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); suena(on ? 'pon' : 'quita'); };
    rejilla.append(b);
    return { P, b, dib, T, bueno: cumple(d.buscar, P, modelo) };
  });
  ctx.escenario.append(rejilla);
  let hecho = false;
  const nota = (opts) => cartas.forEach((c) => c.dib.insertAdjacentHTML('beforeend', `<g class="notas">${notacion(c.P, c.T.X, c.T.Y, opts)}</g>`));
  const busca = [].concat(d.buscar);
  const tipoNota = busca.some((b) => /^tri/.test(b)) ? { paralelos: false } : busca.some((b) => /onvexo/.test(b)) ? { iguales: false, paralelos: false, rectos: false, entrante: true } : busca.some((b) => /Iguales|lados/.test(b)) ? { paralelos: false, rectos: false } : {};
  ctx.pistas([
    { texto: d.pistas?.[0] ?? d.definicion ?? 'Fíjate en los lados y en las esquinas, no en cómo está colocada la figura.' },
    { texto: d.pistas?.[1] ?? (busca.includes('giro') ? 'Gira la figura modelo en tu cabeza: un cuarto de vuelta, media vuelta… Las que están **dadas la vuelta como en un espejo** no valen.' : 'Te marco los lados: **rayitas** en los iguales, **flechas** en los paralelos y un **cuadradito** en los ángulos rectos.'),
      ver: busca.includes('giro') ? null : () => nota(tipoNota) },
    { texto: d.pistas?.[2] ?? 'Te marco una que sí va. ¿En qué se parecen las demás?', ver: () => { const c = cartas.find((c) => c.bueno && c.b.getAttribute('aria-pressed') !== 'true'); c?.b.classList.add('pista-carta'); } },
  ]);
  if (ctx.primera) mano(cartas[0].b, { dx: 0.5 });
  ctx.boton(ctx.pizarra ? 'Ver la solución' : 'Comprobar', revisar);

  async function revisar() {
    if (hecho) return; hecho = true;
    ctx.acciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
    let bien = 0, falta = 0, sobra = 0;
    for (const c of cartas) {
      const puesta = c.b.getAttribute('aria-pressed') === 'true';
      await espera(110);
      c.b.querySelector('.pasaporte').textContent = pasaporte(c.P).join(', ');
      c.b.classList.add('revisada');
      if (c.bueno && puesta) { bien++; c.b.classList.add('bien'); suena('pon'); }
      else if (c.bueno) { falta++; if (ctx.pizarra) c.b.setAttribute('aria-pressed', 'true'); else c.b.classList.add('falta'); suena('quita'); }
      else if (puesta) { sobra++; c.b.classList.add('sobra'); suena('quita'); }
      c.b.disabled = true;
    }
    await espera(300);
    const errores = falta + sobra, total = cartas.filter((c) => c.bueno).length;
    const estrellas = errores === 0 ? 3 : errores === 1 ? 2 : errores === 2 ? 1 : 0;
    const partes = [`Has marcado bien ${bien} de ${total}.`];
    if (falta) partes.push(`${falta === 1 ? 'Faltaba 1' : `Faltaban ${falta}`}.`);
    if (sobra) partes.push(`${sobra === 1 ? 'Sobra 1' : `Sobran ${sobra}`}.`);
    if (!errores) partes.unshift('**Sin un fallo.**');
    partes.push('Debajo de cada figura tienes todo lo que es.');
    ctx.fin(estrellas, partes.join(' ') + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ================================================================ construir */
const QUE = { cuadrado: 'un cuadrado', rectangulo: 'un rectángulo', triRectangulo: 'un triángulo rectángulo', triIsosceles: 'un triángulo isósceles', rombo: 'un rombo', paralelogramo: 'un paralelogramo', trapecio: 'un trapecio' };
function describe(P) { const p = pasaporte(P); return P.length === 3 ? `un triángulo ${p.join(' y ')}` : P.length === 4 ? `un ${p[0]}` : `un ${p.join(' ')}`; }

function construir(d, ctx) {
  const N = d.ancho ?? 9, M = d.alto ?? 7;
  const T = tablero(N, M, { tam: 64, margen: 30 });
  const nodo = el('div', { class: 'geoplano' });
  const dib = svg(`0 0 ${T.w} ${T.h}`, '', { class: 'geo grande' });
  nodo.append(dib);
  const estado = el('p', { class: 'estado-geo', 'aria-live': 'polite' });
  ctx.escenario.append(nodo, estado);
  const P = [];
  let cerrada = false, hecho = false;
  const permitidos = d.permitidos ? new Set(d.permitidos.map(String)) : null;
  const objetivo = d.objetivo; // vértices de la figura que hay que conseguir (simetría, traslación)
  const extra = []; // capas de ayuda
  ctx.reto(d.texto);
  ctx.pista(d.pista ?? 'Toca los puntos uno a uno para poner los vértices. Para cerrar la figura, toca el primero otra vez.');

  function pinta() {
    let s = '';
    if (d.eje != null) s += `<line x1="${T.X(d.eje)}" y1="${T.Y(-0.4)}" x2="${T.X(d.eje)}" y2="${T.Y(M - 0.6)}" class="eje"/>`;
    if (d.modelo) s += `<path d="${camino(d.modelo, T.X, T.Y)}" class="fig modelo"/>`;
    s += extra.join('');
    for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) {
      const ok = !permitidos || permitidos.has(`${x},${y}`);
      s += `<circle cx="${T.X(x)}" cy="${T.Y(y)}" r="${ok && permitidos ? 10 : 6}" class="pin${permitidos ? (ok ? ' anclaje' : ' apagado') : ''}"/>`;
    }
    if (P.length) s += `<path d="${camino(P, T.X, T.Y, cerrada)}" class="${cerrada ? 'fig tuya' : 'trazo-geo'}"/>`;
    P.forEach((p, i) => (s += `<circle cx="${T.X(p[0])}" cy="${T.Y(p[1])}" r="${i === 0 && !cerrada && P.length > 2 ? 13 : 9}" class="vertice${i === 0 && !cerrada && P.length > 2 ? ' cierra' : ''}"/>`));
    for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) s += `<circle cx="${T.X(x)}" cy="${T.Y(y)}" r="${T.w / N / 2.2}" class="toque" data-p="${x},${y}"/>`;
    dib.innerHTML = s;
    comprobar.disabled = !cerrada;
    deshacer.disabled = !P.length || hecho;
    estado.textContent = cerrada ? `Figura cerrada: ${P.length} vértices.` : P.length ? `${P.length} ${P.length === 1 ? 'vértice' : 'vértices'}. ${P.length > 2 ? 'Toca el primero para cerrar.' : ''}` : '';
  }
  dib.addEventListener('click', (e) => {
    const t = e.target.closest('.toque'); if (!t || hecho) return;
    const p = t.dataset.p.split(',').map(Number);
    if (cerrada) return ctx.aviso('La figura ya está cerrada. Deshaz para cambiarla.');
    if (permitidos && !permitidos.has(String(p))) { ctx.aviso('Solo se pueden usar los puntos grandes.', true); suena('quita'); return; }
    if (P.length > 2 && String(p) === String(P[0])) {
      if (!simple(P)) { ctx.aviso('Así los lados se cruzan o hay tres puntos en línea. Deshaz alguno.', true); suena('mal'); return; }
      cerrada = true; suena('bien'); ctx.aviso(''); return pinta();
    }
    if (P.some((q) => String(q) === String(p))) { ctx.aviso('Ese punto ya es un vértice.', true); return; }
    P.push(p); suena('pon'); ctx.aviso(''); pinta();
  });
  const comprobar = ctx.boton(ctx.pizarra ? 'Comprobar' : 'Comprobar', revisar);
  const deshacer = ctx.boton('Deshacer', () => { if (hecho) return; if (cerrada) cerrada = false; else P.pop(); suena('quita'); pinta(); }, true);
  ctx.boton('Borrar', () => { if (hecho) return; P.length = 0; cerrada = false; suena('quita'); pinta(); }, true);

  const objetivoTxt = d.tarea === 'simetria' ? 'Cada vértice nuevo tiene que estar **a la misma distancia del eje** que su pareja, pero al otro lado.'
    : d.tarea === 'traslacion' ? `Todos los vértices se mueven **lo mismo**: ${d.vectorTxt}.`
    : d.definicion ?? `Tienes que hacer ${QUE[d.figura] ?? 'la figura'} usando solo los puntos grandes.`;
  ctx.pistas([
    { texto: d.pistas?.[0] ?? objetivoTxt },
    d.tarea === 'simetria' ? { texto: 'Te marco la distancia de un vértice al eje. Su pareja está igual de lejos, al otro lado.', ver: () => { const v = d.modelo[0], x2 = 2 * d.eje - v[0]; extra.push(`<path d="M${T.X(v[0])} ${T.Y(v[1])} H${T.X(x2)}" class="guia"/><circle cx="${T.X(x2)}" cy="${T.Y(v[1])}" r="12" class="guia-punto"/>`); pinta(); } }
      : d.tarea === 'traslacion' ? { texto: 'Te dibujo la flecha del movimiento desde un vértice.', ver: () => { const v = d.modelo[0], w = objetivo.find((q, i) => i === 0) ?? objetivo[0]; extra.push(`<path d="M${T.X(v[0])} ${T.Y(v[1])} L${T.X(w[0])} ${T.Y(w[1])}" class="guia flecha"/><circle cx="${T.X(w[0])}" cy="${T.Y(w[1])}" r="12" class="guia-punto"/>`); pinta(); } }
      : { texto: d.pistas?.[1] ?? (d.figura === 'triRectangulo' ? 'Busca dos lados que formen una esquina como la de un folio.' : d.figura === 'triIsosceles' ? 'Necesitas dos lados que midan lo mismo. Cuenta cuadraditos en horizontal y en vertical.' : 'Los lados opuestos tienen que ser paralelos. Prueba con lados que sigan las filas y columnas… o no.') },
    { texto: d.pistas?.[2] ?? 'Te pongo un vértice de una solución. Sigue tú.', ver: () => { const v = (objetivo ?? d.solucion)?.[0]; if (!v) return; extra.push(`<circle cx="${T.X(v[0])}" cy="${T.Y(v[1])}" r="15" class="guia-punto fuerte"/>`); pinta(); } },
  ]);
  pinta();
  if (ctx.primera) setTimeout(() => { const t = dib.querySelector('.anclaje') || dib.querySelector('.pin'); if (t) mano(t, { dx: 0.5 }); }, 50);

  async function revisar() {
    if (hecho || !cerrada) return; hecho = true;
    ctx.acciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
    let estrellas = 0, msg = '';
    if (objetivo) {
      if (igual(P, objetivo)) { estrellas = 3; msg = d.tarea === 'simetria' ? '**Simétrica.** Cada vértice está a la misma distancia del eje que su pareja.' : '**Bien trasladada.** Todos los vértices se han movido lo mismo.'; }
      else {
        const aciertan = P.filter((p) => objetivo.some((q) => String(q) === String(p))).length;
        const mov = d.modelo && P.length === d.modelo.length && congruenteGiro(d.modelo, P);
        if (d.tarea === 'simetria' && P.length === d.modelo.length && igual(forma(P), forma(d.modelo))) msg = 'La has copiado, pero **no la has dado la vuelta**: en un espejo, lo que está cerca del eje sigue cerca del eje.';
        else if (d.tarea === 'traslacion' && mov && igual(forma(P), forma(d.modelo))) msg = 'La forma está bien, pero **no se ha movido lo que pedía**. Cuenta los saltos de un vértice.';
        else msg = `${aciertan} de ${objetivo.length} vértices están en su sitio.`;
        estrellas = aciertan >= objetivo.length - 1 && P.length === objetivo.length ? 1 : 0;
      }
      extra.length = 0;
      extra.push(`<path d="${camino(objetivo, T.X, T.Y)}" class="fig solucion"/>`);
    } else {
      const ok = PROP[d.figura](P);
      if (ok) { estrellas = 3; msg = `**Es ${QUE[d.figura]}.** ${pasaporte(P).length > 1 ? `En concreto: ${pasaporte(P).join(', ')}.` : ''}`; }
      else { msg = `Lo que has hecho es ${describe(P)}, no ${QUE[d.figura]}.`; }
      dib.insertAdjacentHTML('beforeend', `<g class="notas">${notacion(P, T.X, T.Y)}</g>`);
    }
    if (objetivo) { pinta(); dib.insertAdjacentHTML('beforeend', `<g class="notas">${notacion(P, T.X, T.Y, { iguales: false, paralelos: false, rectos: false })}</g>`); }
    if (!estrellas) temblor(nodo, 6);
    await espera(400);
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ================================================================ generadores */
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (d.modo === 'seleccionar') {
    const N = d.tam ?? 6;
    if (d.buscar === 'giro' || [].concat(d.buscar).includes('giro')) {
      // una figura asimétrica, sus giros y distractores (espejo, deformada, otro tamaño)
      let base;
      for (let t = 0; t < 200 && !base; t++) { const P = aleatorio(g.vertices ?? 5, (g.vertices ?? 5) >= 6 ? 4 : 3, undefined, (g.vertices ?? 5) * 0.8); if (P && !congruenteGiro(P, espejo(P)) && caja(P)[0] >= 2 && caja(P)[1] >= 2) base = P; }
      d.modelo = coloca(base, N, false) ?? normaliza(base);
      const figs = [];
      const pos = azar(g.positivas?.[0] ?? 2, g.positivas?.[1] ?? 4);
      while (figs.filter((f) => f.ok).length < pos) { const Q = coloca(rota(base, azar(0, 3)), N, false); if (Q) figs.push({ P: Q, ok: true }); }
      const malas = [() => espejo(rota(base, azar(0, 3))), () => { const Q = base.map((p) => [...p]); const i = azar(0, Q.length - 1); Q[i][azar(0, 1)] += elige([-1, 1]); return Q; }, () => rota(base.map(([x, y]) => [x, y + (y > 1 ? 1 : 0)]), azar(0, 3))];
      let t = 0;
      while (figs.length < (g.cantidad ?? 6) && t++ < 300) { const Q = coloca(elige(malas)(), N, false); if (Q && simple(Q) && !congruenteGiro(base, Q)) figs.push({ P: Q, ok: false }); }
      d.figuras = barajar(figs).map((f) => f.P);
      return d;
    }
    const figs = [];
    const quiere = g.cantidad ?? 8;
    const pos = azar(g.positivas?.[0] ?? 2, g.positivas?.[1] ?? 4);
    let t = 0;
    while (figs.filter((P) => cumple(d.buscar, P)).length < pos && t++ < 400) { const P = figuraDe(elige(g.si), N, g.girar !== false); if (P && cumple(d.buscar, P)) figs.push(P); }
    t = 0;
    while (figs.length < quiere && t++ < 600) { const P = figuraDe(elige(g.no), N, g.girar !== false); if (P && !figs.some((Q) => igual(Q, P))) figs.push(P); }
    d.figuras = barajar(figs);
    return d;
  }
  // construir
  const N = d.ancho ?? 9, M = d.alto ?? 7;
  if (d.tarea === 'simetria') {
    const ej = Math.floor(N / 2);
    for (let t = 0; t < 400; t++) {
      const P = aleatorio(g.vertices ?? 4, (g.vertices ?? 4) >= 5 ? 4 : 3);
      if (!P) continue;
      const [w, h] = caja(P);
      if (ej - 1 - w < 0 || M - 1 - h < 0) continue;
      const dx = azar(0, ej - 1 - w), dy = azar(0, M - 1 - h);
      const Q = normaliza(P).map(([x, y]) => [x + dx, y + dy]);
      const R = Q.map(([x, y]) => [2 * ej - x, y]).reverse();
      if (R.some(([x]) => x > N - 1) || !simple(Q) || !simple(R)) continue;
      return { ...d, eje: ej, modelo: Q, objetivo: R, texto: d.texto ?? 'Construye la figura **simétrica** al otro lado del eje' };
    }
  }
  if (d.tarea === 'traslacion') {
    const [vx, vy] = elige(g.vectores ?? [[0, 2], [0, -2], [0, 1], [0, -1]]);
    for (let t = 0; t < 400; t++) {
      const P = aleatorio(g.vertices ?? 4, 3);
      if (!P) continue;
      const [w, h] = caja(P);
      const minx = Math.max(0, -vx), maxx = N - 1 - w - Math.max(0, vx), miny = Math.max(0, -vy), maxy = M - 1 - h - Math.max(0, vy);
      if (maxx < minx || maxy < miny) continue;
      const dx = azar(minx, maxx), dy = azar(miny, maxy);
      const Q = normaliza(P).map(([x, y]) => [x + dx, y + dy]);
      const R = Q.map(([x, y]) => [x + vx, y + vy]);
      const txt = [vx && `${Math.abs(vx)} ${Math.abs(vx) === 1 ? 'punto' : 'puntos'} a la ${vx > 0 ? 'derecha' : 'izquierda'}`, vy && `${Math.abs(vy)} ${Math.abs(vy) === 1 ? 'punto' : 'puntos'} hacia ${vy > 0 ? 'abajo' : 'arriba'}`].filter(Boolean).join(' y ');
      return { ...d, modelo: Q, objetivo: R, vectorTxt: txt, texto: d.texto ?? `Construye la misma figura movida **${txt}**` };
    }
  }
  if (d.figura) {
    // anclajes: una solución escondida entre puntos de sobra
    const fams = { cuadrado: g.inclinado ? ['cuadradoInclinado'] : ['cuadradoRecto'], rectangulo: g.inclinado ? ['rectanguloInclinado'] : ['rectanguloRecto'], triRectangulo: ['triRectangulo'], triIsosceles: ['triIsosceles'], rombo: ['rombo'], paralelogramo: ['romboide'], trapecio: ['trapecio', 'trapecioRecto'] }[d.figura];
    let S = null;
    for (let t = 0; t < 300 && !S; t++) { const P = coloca(FAM[elige(fams)](), Math.min(N, M), true); if (!P || !PROP[d.figura](P)) continue; const k = azar(0, Math.max(0, N - M)); S = P.map(([x, y]) => [x + k, y]); }
    const libres = new Set(S.map(String));
    const sobran = g.sobran ?? 4;
    let t = 0;
    while (libres.size < S.length + sobran && t++ < 200) libres.add(`${azar(0, N - 1)},${azar(0, M - 1)}`);
    return { ...d, permitidos: [...libres].map((s) => s.split(',').map(Number)), solucion: S, texto: d.texto ?? `Construye **${QUE[d.figura]}** usando solo los puntos grandes` };
  }
  return d;
}

export function ronda(d, ctx) {
  if (d.modo === 'construir') return construir(d, ctx);
  return seleccionar(d, ctx);
}

// lo que reutilizan otros motores (formas.js)
export { FAM, figuraDe, aleatorio, tablero, camino, notacion, area2, entrantes, normaliza, caja, rota, espejo, aristas, esc, l2, cruz };
