// Motor «giros»: el rincón del puzle.
//   puzle      → ¿cuántos ¼ de vuelta necesita la pieza para encajar en su hueco? (o «no encaja nunca»: es su reflejo)
//                con "libre": true, varias piezas y varios huecos con un número limitado de giros
//   chincheta  → elegir dónde clavar la chincheta para que la pieza, al girar, caiga en su sombra (centro de giro)
// Geometría exacta en la trama de puntos: girar ¼ de vuelta alrededor de un punto de la trama lleva puntos a puntos.
import { el, svg, barajar, azar, elige, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, bote, chispasEn, temblor, arrastra, demuestra } from './efectos.js';
import { camino, rota, espejo, normaliza } from './geoplano.js';
import { recorte } from './formas.js';

const T = '#1b1e3a';
const PASO = 40, MARGEN = 22;
const X = (x) => MARGEN + x * PASO, Y = (y) => MARGEN + y * PASO;
const COLORES = [['#ffc531', '#c98f00'], ['#5ec3ff', '#2b88c4'], ['#ff7fae', '#c4417a'], ['#9bd84a', '#5e9a1c'], ['#ff9f45', '#c76512'], ['#b79cff', '#7b5ad6']];

// piezas con «quiralidad»: sus cuatro giros son distintos y su reflejo no se consigue girando
const PIEZAS = {
  ele: [[0, 0], [1, 0], [1, 2], [2, 2], [2, 3], [0, 3]],
  pe: [[0, 0], [2, 0], [2, 2], [1, 2], [1, 3], [0, 3]],
  bandera: [[0, 0], [3, 0], [2, 1], [3, 2], [1, 2], [1, 3], [0, 3]],
  trapecio: [[0, 0], [2, 0], [3, 2], [0, 2]],
  efe: [[1, 0], [3, 0], [3, 1], [2, 1], [2, 3], [1, 3], [1, 2], [0, 2], [0, 1], [1, 1]],
  escuadra: [[0, 0], [3, 0], [0, 2]],
  bota: [[0, 0], [1, 0], [1, 2], [3, 2], [3, 3], [0, 3]],
  cometa: [[0, 0], [3, 1], [2, 3], [0, 2]],
  zapato: [[0, 0], [2, 0], [2, 1], [3, 1], [3, 2], [0, 2]],
  rampa: [[0, 1], [1, 0], [3, 0], [3, 2], [0, 2]],
};
const clave = (P) => normaliza(P).map(String).sort().join(';');
const valida = (P) => { const k = [0, 1, 2, 3].map((r) => clave(rota(P, r))); return new Set(k).size === 4 && !k.includes(clave(espejo(P))); };
const NOMBRES = Object.keys(PIEZAS).filter((n) => valida(PIEZAS[n]));
const bbox = (P) => { const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]); return { x0: Math.min(...xs), y0: Math.min(...ys), x1: Math.max(...xs), y1: Math.max(...ys) }; };
// giro de ¼ en el sentido de las agujas del reloj (con la y hacia abajo) alrededor de c, k veces
const giraEn = (P, [cx, cy], k) => P.map(([x, y]) => { for (let i = 0; i < ((k % 4) + 4) % 4; i++) [x, y] = [cx - (y - cy), cy + (x - cx)]; return [x, y]; });
const mismaPos = (A, B) => A.map(String).sort().join(';') === B.map(String).sort().join(';');
const FLECHA = { horario: '↻', antihorario: '↺' };
const CUARTOS = ['', '¼ de vuelta', 'media vuelta', '¾ de vuelta'];

/* ================================================================ generar */
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  const nombres = g.piezas ?? NOMBRES;
  if (d.modo === 'puzle' && d.libre) {
    const elegidas = barajar(nombres).slice(0, g.cantidad ?? 2);
    d.piezas = elegidas.map((n) => normaliza(rota(PIEZAS[n], azar(0, 3))));
    d.giros = d.piezas.map(() => elige(g.cuartos ?? [1, 2, 3]));
    d.huecos = d.piezas.map((P, i) => normaliza(rota(P, d.giros[i])));
    return d;
  }
  if (d.modo === 'puzle') {
    const P = normaliza(rota(PIEZAS[elige(nombres)], azar(0, 3)));
    const k = elige(g.cuartos ?? [1, 2, 3]);
    const esp = Math.random() < (g.espejo ?? 0);
    d.pieza = P;
    d.espejo = esp;
    d.espejoPosible = (g.espejo ?? 0) > 0;
    d.color = azar(0, 5);
    d.cuartos = k;
    d.hueco = normaliza(esp ? espejo(rota(P, k)) : rota(P, k));
    return d;
  }
  if (d.modo === 'chincheta') {
    const N = d.ancho ?? 10, M = d.alto ?? 7;
    for (let t = 0; t < 500; t++) {
      const base = normaliza(rota(PIEZAS[elige(nombres)], azar(0, 3)));
      const b = bbox(base);
      const ox = azar(0, N - 1 - b.x1), oy = azar(0, M - 1 - b.y1);
      const P = base.map(([x, y]) => [x + ox, y + oy]);
      const k = elige(g.cuartos ?? [1]);
      const c = [azar(0, N - 1), azar(0, M - 1)];
      const Q = giraEn(P, c, k);
      if (Q.some(([x, y]) => x < 0 || y < 0 || x > N - 1 || y > M - 1)) continue;
      const bp = bbox(P), bq = bbox(Q);
      const solapa = bp.x0 < bq.x1 && bq.x0 < bp.x1 && bp.y0 < bq.y1 && bq.y0 < bp.y1;
      if (solapa && !g.solapar) continue;
      const dist = Math.hypot(c[0] - (bp.x0 + bp.x1) / 2, c[1] - (bp.y0 + bp.y1) / 2);
      if (dist < (g.distMin ?? 1.5)) continue;
      Object.assign(d, { ancho: N, alto: M, pieza: P, sombra: Q, centro: c, cuartos: k });
      return d;
    }
  }
  throw new Error('No he podido generar el reto de giros');
}

export function ronda(d, ctx) {
  if (d.modo === 'chincheta') return chincheta(d, ctx);
  return d.libre ? puzleLibre(d, ctx) : puzle(d, ctx);
}

/* ================================================================ piezas y huecos */
// escala común: los píxeles por unidad de la trama son los mismos en el tablero y en las piezas sueltas
const escala = () => (innerWidth < 760 ? 0.78 : innerWidth < 1100 ? 1 : 1.15);
function piezaSuelta(P, k, s) {
  const sv = recorte(P, k);
  const [, , w] = sv.getAttribute('viewBox').split(' ').map(Number);
  sv.style.width = sv.style.height = w * s + 'px';
  sv.classList.add('gira');
  const b = el('button', { type: 'button', class: 'pieza-giro', 'aria-label': 'Pieza del puzle' }, sv);
  return { b, sv, P, giros: 0 };
}
// bandeja de cartón con huecos recortados (en unidades de la trama)
function bandeja(huecos, posiciones, ancho, alto, s) {
  const W = (ancho - 1) * PASO + 2 * MARGEN, H = (alto - 1) * PASO + 2 * MARGEN;
  let defs = '', cuerpo = '';
  huecos.forEach((Hh, i) => {
    const [ox, oy] = posiciones[i];
    const d = camino(Hh.map(([x, y]) => [x + ox, y + oy]), X, Y);
    defs += `<clipPath id="corte${i}"><path d="${d}"/></clipPath>`;
    cuerpo += `<g class="hueco" data-i="${i}"><path d="${d}" class="fondo-hueco"/><g clip-path="url(#corte${i})"><path d="${d}" class="sombra-hueco" transform="translate(5 7)"/></g><path d="${d}" class="borde-hueco"/></g>`;
  });
  const sv = svg(`0 0 ${W} ${H}`, `<defs>${defs}<pattern id="carton" width="128" height="128" patternUnits="userSpaceOnUse"><image href="../motores/tex/cartulina.webp" width="128" height="128"/></pattern>
    <filter id="sombra-bandeja" x="-10%" y="-10%" width="125%" height="130%"><feDropShadow dx="6" dy="12" stdDeviation="8" flood-color="#120826" flood-opacity=".55"/></filter></defs>
    <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="22" class="carton" filter="url(#sombra-bandeja)"/>
    <rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="22" fill="url(#carton)" class="textura"/>
    <rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="14" class="filo"/>
    ${cuerpo}<g class="encajadas"></g><g class="marcas"></g>`, { class: 'bandeja-puzle' });
  sv.style.width = W * s + 'px';
  return sv;
}
const centroDe = (n) => { const r = n.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
// la pieza ya encajada se dibuja dentro de la bandeja, en su hueco
function encaja(sv, Hh, [ox, oy], k) {
  const [c, o] = COLORES[k % COLORES.length];
  const d = camino(Hh.map(([x, y]) => [x + ox, y + oy]), X, Y);
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'encajada');
  g.innerHTML = `<path d="${d}" fill="${o}" transform="translate(0 3)" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><path d="${d}" fill="${c}" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/>`;
  sv.querySelector('.encajadas').append(g);
  gsap.fromTo(g, { scale: 1.12, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2,0.45)' });
  return g;
}
const giraVisual = (p, n = 1) => { p.giros += n; p.sv.style.rotate = p.giros * 90 + 'deg'; };

/* ================================================================ puzle: predecir */
function puzle(d, ctx) {
  const anti = d.sentido === 'antihorario';
  ctx.reto(d.texto ?? `¿Cuántos **cuartos de vuelta ${FLECHA[d.sentido ?? 'horario']}** necesita la pieza para encajar en su hueco?`);
  ctx.pista(d.pista ?? `Gira la pieza en tu cabeza${anti ? ', en contra de las agujas del reloj' : ', como las agujas del reloj'}. No vale darle la vuelta.`);
  const s = escala();
  const hb = bbox(d.hueco);
  const ancho = hb.x1 + 5, alto = hb.y1 + 5;
  const tab = bandeja([d.hueco], [[2, 2]], ancho, alto, s);
  const color = d.color ?? 0;
  const p = piezaSuelta(d.pieza, color, s);
  const mesa = el('div', { class: 'mesa-pieza' }, el('span', { class: 'giro-icono', 'aria-hidden': 'true', text: FLECHA[d.sentido ?? 'horario'] }), p.b);
  ctx.escenario.append(el('div', { class: 'rincon-puzle' }, tab, mesa));
  let hecho = false;
  const opciones = [1, 2, 3].map((n) => ctx.boton(CUARTOS[n], () => responde(n), true));
  if (d.espejoPosible) opciones.push(ctx.boton('No encaja nunca', () => responde('no'), true));
  opciones.forEach((b) => b.classList.add('opcion-giro'));
  // la respuesta, contada en el sentido pedido
  const buena = d.espejo ? 'no' : anti ? (4 - d.cuartos) % 4 : d.cuartos;
  entrada(tab, [p.b]);

  const hueco = () => tab.querySelector('.hueco .borde-hueco');
  const vuelaAlHueco = async (encajar) => {
    const [ax, ay] = centroDe(p.sv), [bx, by] = centroDe(hueco());
    await gsap.to(p.b, { x: `+=${bx - ax}`, y: `+=${by - ay}`, duration: 0.5, ease: 'power2.inOut' });
    if (encajar) { suena('pon'); p.b.style.visibility = 'hidden'; encaja(tab, d.hueco, [2, 2], color); chispasEn(hueco(), 12, '#ffc531'); }
    else { suena('quita'); await gsap.fromTo(p.b, { rotation: 0 }, { rotation: 7, duration: 0.07, yoyo: true, repeat: 5, ease: 'sine.inOut' }); }
  };
  const gira = async (n, signo = anti ? -1 : 1) => { for (let i = 0; i < n; i++) { giraVisual(p, signo); suena('clic'); await espera(420); } };
  async function responde(r) {
    if (hecho) return; hecho = true;
    opciones.forEach((b) => (b.disabled = true));
    ctx.aviso('');
    const ok = r === buena;
    if (r !== 'no') {
      await gira(r);
      await vuelaAlHueco(ok && !d.espejo);
      if (!ok) {
        await espera(350);
        await gsap.to(p.b, { x: 0, y: 0, duration: 0.45, ease: 'power2.inOut' });
        await gira(4 - r);
        await espera(250);
        if (d.espejo) await demuestraEspejo();
        else { await gira(buena); await vuelaAlHueco(true); }
      }
    } else if (d.espejo) await demuestraEspejo();
    else { await gira(buena); await vuelaAlHueco(true); }
    await espera(300);
    const nombre = (n) => (n === 'no' ? '«no encaja nunca»' : CUARTOS[n]);
    ctx.fin(ok ? 3 : 0, ok
      ? (d.espejo ? '**Bien visto: no hay giro que valga.** El hueco es su reflejo; solo encajaría dándole la vuelta, y eso no es girar.' : `**${CUARTOS[buena][0].toUpperCase() + CUARTOS[buena].slice(1)}, justo.** Al girar, la forma no cambia: solo cambia hacia dónde mira.`)
      : (d.espejo ? 'Ningún giro la mete en el hueco: es su **reflejo**, como en un espejo. Para encajarla habría que darle la vuelta.' : `Hacían falta **${nombre(buena)}**, no ${nombre(r)}.`) + (d.explica ? ' ' + d.explica : ''));
  }
  // las cuatro posiciones y ninguna vale; luego se le da la vuelta y sí
  async function demuestraEspejo() {
    const [ax, ay] = centroDe(p.sv), [bx, by] = centroDe(hueco());
    await gsap.to(p.b, { x: `+=${bx - ax}`, y: `+=${by - ay - 10}`, duration: 0.45, ease: 'power2.inOut' });
    p.b.classList.add('probando');
    for (let i = 0; i < 4; i++) { giraVisual(p, 1); suena('clic'); await espera(380); temblor(p.b, 4); }
    ctx.aviso('Ningún giro encaja…');
    await espera(300);
    await gsap.to(p.sv, { scaleX: -1, duration: 0.5, ease: 'power2.inOut' });
    suena('pon');
    p.b.classList.add('volteada');
    ctx.aviso('…pero dándole la vuelta, sí. Eso es un reflejo, no un giro.');
  }
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'Busca un detalle que se vea bien, como un pico o un escalón, y mira hacia dónde apunta en la pieza y en el hueco.' },
    { texto: d.pistas?.[1] ?? 'Te marco la misma esquina en la pieza y en el hueco. Sigue esa esquina mientras giras en tu cabeza.', ver: () => marcaEsquina() },
    { texto: d.pistas?.[2] ?? 'Te dibujo junto al hueco la pieza girada ¼, ½ y ¾. ¿Cuál coincide?', ver: () => fantasmas() },
  ]);
  function marcaEsquina() {
    const j = 0, n = d.pieza.length;
    // dónde acaba la esquina j en el hueco
    const R = d.espejo ? espejo(rota(d.pieza, d.cuartos)) : rota(d.pieza, d.cuartos);
    const jj = d.espejo ? n - 1 - j : j;
    const mx = Math.min(...R.map((q) => q[0])), my = Math.min(...R.map((q) => q[1]));
    const [hx, hy] = [R[jj][0] - mx + 2, R[jj][1] - my + 2];
    tab.querySelector('.marcas').innerHTML = `<circle cx="${X(hx)}" cy="${Y(hy)}" r="11" class="marca-esquina"/>`;
    const pv = p.sv.querySelector('.borde');
    pv?.insertAdjacentHTML('afterend', `<circle cx="${X(d.pieza[j][0])}" cy="${Y(d.pieza[j][1])}" r="11" class="marca-esquina"/>`);
  }
  function fantasmas() {
    const g = [1, 2, 3].map((k) => { const P = normaliza(rota(d.pieza, anti ? -k : k)); return `<div class="fantasma-giro"><span>${CUARTOS[k]}</span>${svg('-30 -30 200 200', `<path d="${camino(P, (x) => x * 36, (y) => y * 36)}" class="silueta"/>`).outerHTML}</div>`; });
    mesa.insertAdjacentHTML('beforeend', `<div class="fantasmas-giro">${g.join('')}</div>`);
  }
}

/* ================================================================ puzle libre: varias piezas, giros contados */
function puzleLibre(d, ctx) {
  const minimo = d.giros.reduce((a, b) => a + b, 0);
  ctx.reto(d.texto ?? `Encaja todas las piezas con **${minimo} cuartos de vuelta** ${FLECHA.horario} o menos`);
  ctx.pista(d.pista ?? 'Toca una pieza para girarla ¼. Arrástrala a su hueco: solo entra si está bien girada.');
  const s = escala();
  // los huecos, en fila y con aire entre ellos
  let x = 1.5; const pos = [];
  const hb = d.huecos.map(bbox);
  hb.forEach((b) => { pos.push([x, 1.5]); x += b.x1 + 2; });
  const alto = Math.max(...hb.map((b) => b.y1)) + 4;
  const tab = bandeja(d.huecos, pos.map(([a, b]) => [a, b]), x + 0.5, alto, s);
  const orden = barajar(d.piezas.map((_, i) => i));
  const piezas = orden.map((i) => ({ ...piezaSuelta(d.piezas[i], i, s), i, puesta: false }));
  const bandejaPiezas = el('div', { class: 'piezas-sueltas' }, piezas.map((p) => p.b));
  const contador = el('p', { class: 'contador-giros', 'aria-live': 'polite' });
  const pinta = () => { const g = piezas.reduce((a, p) => a + p.giros, 0); contador.innerHTML = `Giros: <b>${g}</b> de ${minimo}`; contador.classList.toggle('pasado', g > minimo); };
  pinta();
  ctx.escenario.append(el('div', { class: 'rincon-puzle libre' }, tab, el('div', { class: 'mesa-pieza' }, contador, bandejaPiezas)));
  let hecho = false;
  entrada(tab, piezas.map((p) => p.b));
  const huecoN = (i) => tab.querySelector(`.hueco[data-i="${i}"] .borde-hueco`);
  const libres = new Set(d.huecos.map((_, i) => i));
  piezas.forEach((p) => {
    arrastra(p.b, {
      puede: () => !hecho && !p.puesta,
      destinos: () => [...libres].map(huecoN),
      alTocar: () => { if (hecho || p.puesta) return; giraVisual(p, 1); suena('clic'); pinta(); },
      alSoltar: (dest) => {
        const i = +dest.closest('.hueco').dataset.i;
        const actual = rota(p.P, p.giros);
        if (clave(actual) === clave(d.huecos[i])) { coloca(p, i); return dest; }
        const misma = [0, 1, 2, 3].some((r) => clave(rota(p.P, r)) === clave(d.huecos[i]));
        ctx.aviso(misma ? 'Ese es su hueco, pero así no entra: gírala.' : 'Esa pieza no es de ese hueco.', true);
        temblor(dest.closest('.hueco'), 4);
        return false;
      },
    });
  });
  function coloca(p, i) {
    p.puesta = true; libres.delete(i); ctx.aviso('');
    p.b.classList.add('puesta');
    encaja(tab, d.huecos[i], pos[i], p.i);
    chispasEn(huecoN(i), 10, '#ffc531');
    suena('selloBien', piezas.filter((q) => q.puesta).length - 1);
    if (!libres.size) fin();
  }
  async function fin() {
    hecho = true;
    await espera(500);
    const g = piezas.reduce((a, p) => a + p.giros, 0);
    const estrellas = g <= minimo ? 3 : g <= minimo + 2 ? 2 : 1;
    ctx.fin(estrellas, g <= minimo ? `**Con ${g} giros, lo justo.** Has pensado cada giro antes de hacerlo.` : `Encajadas, con **${g} giros**. Se podía con ${minimo}: piensa cuántos cuartos le faltan antes de tocar.`);
  }
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'Antes de tocar, empareja cada pieza con su hueco y cuenta los cuartos que le faltan.' },
    { texto: d.pistas?.[1] ?? 'Te pinto cada hueco del color de su pieza.', ver: () => d.huecos.forEach((_, i) => { const [c] = COLORES[i % COLORES.length]; huecoN(i).style.stroke = c; huecoN(i).style.strokeWidth = '7'; }) },
    { texto: d.pistas?.[2] ?? 'Te encajo una.', ver: () => { const p = piezas.find((q) => !q.puesta); if (!p) return; const falta = (d.giros[p.i] - p.giros % 4 + 8) % 4; giraVisual(p, falta); pinta(); setTimeout(() => { p.b.style.visibility = 'hidden'; coloca(p, p.i); }, 500); } },
  ]);
}

/* ================================================================ chincheta: el centro de giro */
function chincheta(d, ctx) {
  const N = d.ancho, M = d.alto, k = d.cuartos;
  const eligeGiro = d.eligeGiro;
  ctx.reto(d.texto ?? (eligeGiro ? 'Clava la chincheta y elige el giro para que la pieza **caiga en su sombra**' : `Clava la chincheta para que la pieza, al girar **${CUARTOS[k]} ${FLECHA.horario}**, caiga en su sombra`));
  ctx.pista(d.pista ?? 'Toca un agujerito del corcho para clavar la chincheta. Luego, «Girar».');
  const W = (N - 1) * PASO + 2 * MARGEN, H = (M - 1) * PASO + 2 * MARGEN;
  let agujeros = '';
  for (let y = 0; y < M; y++) for (let x = 0; x < N; x++) agujeros += `<circle cx="${X(x)}" cy="${Y(y)}" r="4.5" class="agujero" data-x="${x}" data-y="${y}"/>`;
  const [c1, o1] = COLORES[azar(0, 5)];
  const dP = camino(d.pieza, X, Y), dQ = camino(d.sombra, X, Y);
  const sv = svg(`0 0 ${W} ${H}`, `
    <defs><pattern id="tex-corcho" width="160" height="160" patternUnits="userSpaceOnUse"><image href="../motores/tex/corcho.webp" width="160" height="160"/></pattern>
      <filter id="sombra-pieza" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="3" dy="6" stdDeviation="3" flood-color="#2a1500" flood-opacity=".5"/></filter>
      <clipPath id="marco-corcho"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>
    <rect x="0" y="0" width="${W}" height="${H}" rx="10" fill="url(#tex-corcho)" class="corcho"/>
    <g class="agujeros">${agujeros}</g>
    <path d="${dQ}" class="sombra-pieza-giro"/>
    <g class="ayudas" clip-path="url(#marco-corcho)"></g>
    <g class="rastros"></g>
    <g class="pieza-corcho" filter="url(#sombra-pieza)"><path d="${dP}" fill="${o1}" transform="translate(0 4)" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><path d="${dP}" fill="${c1}" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/></g>
    <g class="chincheta-puesta"></g>`, { class: 'corcho-giro', role: 'img', 'aria-label': 'Corcho con una pieza y su sombra', 'data-c': d.centro.join(',') });
  const s = escala();
  sv.style.width = W * s + 'px';
  const marco = el('div', { class: 'marco-corcho' }, sv);
  ctx.escenario.append(marco);
  let pin = null, giro = eligeGiro ? null : k, intentos = 0, hecho = false, girando = false;
  const capaPin = sv.querySelector('.chincheta-puesta'), pieza = sv.querySelector('.pieza-corcho');
  const ponPin = ([x, y]) => {
    pin = [x, y];
    capaPin.innerHTML = `<g class="chincheta" transform="translate(${X(x)} ${Y(y)})"><ellipse cx="5" cy="6" rx="12" ry="6" fill="rgba(30,10,0,.35)"/><circle r="13" fill="#d7263d" stroke="${T}" stroke-width="3"/><circle cx="-4" cy="-4" r="4" fill="#fff" opacity=".7"/></g>`;
    gsap.from(capaPin.firstChild, { y: -40, scale: 1.6, opacity: 0, duration: 0.35, ease: 'bounce.out' });
    suena('pon'); listo();
  };
  sv.addEventListener('click', (e) => {
    if (hecho || girando) return;
    const pt = sv.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(sv.getScreenCTM().inverse());
    const x = Math.round((q.x - MARGEN) / PASO), y = Math.round((q.y - MARGEN) / PASO);
    if (x < 0 || y < 0 || x >= N || y >= M) return;
    if (Math.hypot(q.x - X(x), q.y - Y(y)) > PASO * 0.45) return;
    ponPin([x, y]);
  });
  const boton = ctx.boton('Girar', girar);
  let chips = [];
  if (eligeGiro) {
    chips = [1, 2, 3].map((n) => { const b = ctx.boton(CUARTOS[n] + ' ' + FLECHA.horario, () => { giro = n; chips.forEach((c) => c.setAttribute('aria-pressed', String(c === b))); suena('clic'); listo(); }, true); b.setAttribute('aria-pressed', 'false'); b.classList.add('opcion-giro'); return b; });
    ctx.acciones.prepend(...chips);
  }
  function listo() { boton.disabled = !pin || !giro || hecho || girando; }
  listo();
  async function girar() {
    if (!pin || !giro || hecho || girando) return;
    girando = true; listo(); ctx.aviso('');
    const [cx, cy] = pin, ang = giro * 90;
    const rastros = sv.querySelector('.rastros');
    rastros.querySelectorAll('.rastro').forEach((r) => r.classList.add('viejo'));
    const lineas = d.pieza.map(() => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'polyline'); p.setAttribute('class', 'rastro'); rastros.append(p); return p; });
    const o = { a: 0 };
    let ultimo = 0;
    await gsap.to(o, { a: ang, duration: 0.5 + giro * 0.35, ease: 'power2.inOut', onUpdate: () => {
      pieza.setAttribute('transform', `rotate(${o.a} ${X(cx)} ${Y(cy)})`);
      d.pieza.forEach(([px, py], i) => {
        const pts = [];
        for (let t = 0; t <= o.a + 0.01; t += 6) { const r = (t * Math.PI) / 180, dx = X(px) - X(cx), dy = Y(py) - Y(cy); pts.push(`${(X(cx) + dx * Math.cos(r) - dy * Math.sin(r)).toFixed(1)},${(Y(cy) + dx * Math.sin(r) + dy * Math.cos(r)).toFixed(1)}`); }
        lineas[i].setAttribute('points', pts.join(' '));
      });
      if (o.a - ultimo >= 30) { ultimo = o.a; suena('clic'); }
    } });
    const final = giraEn(d.pieza, pin, giro);
    intentos++;
    if (mismaPos(final, d.sombra)) {
      hecho = true;
      suena('bien'); chispasEn(sv.querySelector('.sombra-pieza-giro'), 16, '#ffc531');
      sv.querySelector('.sombra-pieza-giro').classList.add('llena');
      gsap.fromTo(pieza, { scale: 1.06, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'elastic.out(1.2,0.4)' });
      await espera(500);
      const estrellas = intentos === 1 ? 3 : intentos === 2 ? 2 : 1;
      return ctx.fin(estrellas, (intentos === 1 ? '**¡A la primera!** ' : `**Conseguido en ${intentos} intentos.** `) + 'La chincheta es el único punto que no se mueve: todas las esquinas giran a su alrededor.' + (d.explica ? ' ' + d.explica : ''));
    }
    suena('quita'); temblor(marco, 5);
    if (intentos >= 3) {
      hecho = true;
      await espera(700);
      pieza.removeAttribute('transform');
      ponPin(d.centro); giro = k; ctx.aviso('Mira dónde iba la chincheta.');
      await espera(600);
      return girarSolucion();
    }
    ctx.aviso(intentos === 1 ? 'Ha caído aquí. Mira el rastro de las esquinas y prueba otra vez.' : 'Casi. Fíjate en qué esquina tiene que acabar dónde.', true);
    await espera(1100);
    await gsap.to(o, { a: 0, duration: 0.5, ease: 'power2.inOut', onUpdate: () => pieza.setAttribute('transform', `rotate(${o.a} ${X(cx)} ${Y(cy)})`) });
    girando = false; listo();
  }
  async function girarSolucion() {
    const [cx, cy] = d.centro, o = { a: 0 };
    girando = true; boton.disabled = true;
    await gsap.to(o, { a: k * 90, duration: 1.2, ease: 'power2.inOut', onUpdate: () => pieza.setAttribute('transform', `rotate(${o.a} ${X(cx)} ${Y(cy)})`) });
    sv.querySelector('.sombra-pieza-giro').classList.add('llena');
    ctx.fin(0, `La chincheta iba en el punto marcado. Desde ahí, cada esquina recorre ${CUARTOS[k]} y cae en su sombra.`);
  }
  // las pistas: la chincheta está a la misma distancia de una esquina y de su sombra (mediatriz)
  const mediatriz = (j, color) => {
    const [ax, ay] = d.pieza[j], [bx, by] = giraEn([d.pieza[j]], d.centro, k)[0];
    const mx = (X(ax) + X(bx)) / 2, my = (Y(ay) + Y(by)) / 2, vx = -(Y(by) - Y(ay)), vy = X(bx) - X(ax), L = 2000 / (Math.hypot(vx, vy) || 1);
    sv.querySelector('.ayudas').insertAdjacentHTML('beforeend', `<g class="mediatriz" style="--c:${color}"><line x1="${mx - vx * L}" y1="${my - vy * L}" x2="${mx + vx * L}" y2="${my + vy * L}"/><circle cx="${X(ax)}" cy="${Y(ay)}" r="10"/><circle cx="${X(bx)}" cy="${Y(by)}" r="10"/><line x1="${X(ax)}" y1="${Y(ay)}" x2="${X(bx)}" y2="${Y(by)}" class="union"/></g>`);
  };
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'La chincheta es el único punto que **no se mueve**. Está igual de lejos de cada esquina que de su sombra.' },
    { texto: d.pistas?.[1] ?? 'Te marco una esquina y su sombra. La chincheta está **en algún punto de la línea discontinua**.', ver: () => mediatriz(0, '#ffc531') },
    { texto: d.pistas?.[2] ?? 'Otra esquina y su línea. ¿Dónde se cruzan las dos?', ver: () => mediatriz(Math.floor(d.pieza.length / 2), '#5ec3ff') },
  ]);
}

/* ================================================================ entrada de cada ronda */
function entrada(tab, piezas) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  gsap.from(tab, { y: 30, rotation: -2, opacity: 0, duration: 0.55, ease: 'back.out(1.6)' });
  gsap.from(piezas, { y: -260, x: () => gsap.utils.random(-80, 80), rotation: () => gsap.utils.random(-90, 90), opacity: 0, duration: 0.6, ease: 'back.out(1.5)', delay: 0.2, stagger: { each: 0.09, onComplete() { suena('pon'); } }, clearProps: 'opacity' });
}
