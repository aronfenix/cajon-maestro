// Motor «rejilla»: una cuadrícula de casillas (números o palabras) y una regla. Hay que pintar las que la cumplen.
// Con "mantener": true, lo bueno de la ronda anterior se queda rayado debajo, para ver qué casillas coinciden.
import { el, svg, num, barajar, suena } from './nucleo.js';
import { espera, mano } from './efectos.js';

// Marcas de boli rojo, a mano alzada
const CIRCULO = '<path class="trazo" pathLength="1" d="M58 8 C 30 4, 6 20, 8 50 C 10 82, 42 96, 70 88 C 94 80, 98 46, 86 24 C 78 10, 62 4, 44 8"/>';
const ASPA = '<path class="trazo" pathLength="1" d="M20 22 C 40 42, 62 64, 82 82"/><path class="trazo" pathLength="1" style="animation-delay:.18s" d="M80 20 C 60 40, 40 62, 18 84"/>';

const esPrimo = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const esCuadrado = (n) => Number.isInteger(Math.sqrt(n));

function reglaDe(r) {
  if (!r) return null;
  if (r.multiplo) return (n) => n % r.multiplo === 0;
  if (r.divisor) return (n) => r.divisor % n === 0;
  if (r.cuadrado) return esCuadrado;
  if (r.primo) return esPrimo;
  if (r.acabaEn != null) return (n) => Math.abs(n) % 10 === r.acabaEn;
  if (r.lista) { const s = new Set(r.lista.map(String)); return (x) => s.has(String(x)); }
  return null;
}

let anterior = null; // { clave, buenas: Set de textos }

const TILDE = /[áéíóú]/;
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (g.bloques) { const b = g.bloques[Math.floor(Math.random() * g.bloques.length)]; d.desde = b; d.hasta = b + (g.tamano ?? 100) - 1; }
  if (d.banco && d.buscar) {
    // elige palabras del banco asegurando que haya bastantes de las que se buscan
    const [cat, tilde] = d.buscar.split('-');
    const va = (w) => w.cat === cat && (!tilde || TILDE.test(w.t));
    const todas = barajar(Object.entries(d.banco).flatMap(([c, ws]) => ws.map((t) => ({ t, cat: c }))));
    const n = g.cantidad ?? 12;
    const buenas = todas.filter(va).slice(0, Math.max(2, Math.round(n * (g.proporcion ?? 0.35))));
    const resto = todas.filter((w) => !va(w)).slice(0, n - buenas.length);
    d.items = barajar([...buenas, ...resto]).map((w) => ({ t: w.t, si: va(w) }));
    delete d.banco;
    return d;
  }
  if (Array.isArray(d.items) && d.barajar !== false) d.items = barajar(d.items);
  return d;
}

export function ronda(d, ctx) {
  const numeros = !Array.isArray(d.items);
  const items = numeros
    ? Array.from({ length: d.hasta - (d.desde ?? 1) + 1 }, (_, i) => (d.desde ?? 1) + i)
    : d.items.map((x) => (typeof x === 'string' ? { t: x } : x));
  const regla = reglaDe(d.regla);
  const esBuena = (it) => (numeros ? regla(it) : it.si ?? (regla ? regla(it.t) : false));
  const clave = numeros ? `${d.desde}-${d.hasta}` : items.map((x) => x.t).sort().join('|');

  ctx.reto(d.texto ?? 'Pinta las casillas que cumplen la regla');
  ctx.pista(d.pista ?? 'Toca para pintar y vuelve a tocar para borrar. Se puede pintar arrastrando el dedo.');

  const rejilla = el('div', { class: 'rejilla' + (numeros ? '' : ' palabras'), style: { '--cols': d.columnas ?? (numeros ? 10 : 4) }, role: 'group', 'aria-label': 'Casillas' });
  const previas = d.mantener && anterior?.clave === clave ? anterior.buenas : null;
  if (previas && d.colorAntes) rejilla.style.setProperty('--c-antes', d.colorAntes);
  const celdas = items.map((it, i) => {
    const texto = numeros ? num(it) : it.t;
    const b = el('button', { type: 'button', class: 'celda', 'aria-pressed': 'false', text: texto });
    if (previas?.has(String(numeros ? it : it.t))) { b.classList.add('antes'); b.setAttribute('aria-description', 'marcada en la ronda anterior'); }
    rejilla.append(b);
    return { it, b, i };
  });
  const leyenda = el('p', { class: 'leyenda-rejilla' });
  if (previas) leyenda.append(el('span', {}, el('i', { class: 'antes', style: { background: 'repeating-linear-gradient(-45deg,rgba(0,0,0,.35) 0 1.5px,#f1f3f1 1.5px 6px)' } }), d.textoAntes ?? 'Rayadas: las de la ronda anterior'));
  ctx.escenario.append(el('div', { class: 'tablero' }, rejilla), leyenda);

  // pintar arrastrando
  let hecho = false, pintando = null;
  const pinta = (c, valor) => c.b.setAttribute('aria-pressed', String(valor));
  rejilla.addEventListener('pointerdown', (e) => {
    const b = e.target.closest('.celda'); if (!b || hecho) return;
    e.preventDefault();
    const c = celdas.find((x) => x.b === b);
    pintando = b.getAttribute('aria-pressed') !== 'true';
    pinta(c, pintando); suena(pintando ? 'pon' : 'quita');
    const mover = (ev) => {
      const sobre = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('.celda');
      const cc = sobre && celdas.find((x) => x.b === sobre);
      if (cc && (cc.b.getAttribute('aria-pressed') === 'true') !== pintando) { pinta(cc, pintando); suena('clic'); }
    };
    const soltar = () => { pintando = null; window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', soltar); };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
  });
  rejilla.style.touchAction = 'none';
  // teclado: Enter/Espacio (el click sin puntero)
  rejilla.addEventListener('click', (e) => {
    if (e.detail !== 0 || hecho) return; // solo clicks de teclado
    const b = e.target.closest('.celda'); if (!b) return;
    b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
  });

  const r = d.regla || {};
  const p1 = r.multiplo ? `Los múltiplos de ${r.multiplo} salen **contando de ${r.multiplo} en ${r.multiplo}**: ${r.multiplo}, ${2 * r.multiplo}, ${3 * r.multiplo}…`
    : r.cuadrado ? 'Un cuadrado es un número por sí mismo: **1×1, 2×2, 3×3**…' : r.primo ? 'Un primo solo se puede dividir entre 1 y entre él mismo.' : 'Lee cada palabra en voz alta y busca su sílaba más fuerte.';
  const marcaBuenas = (cuantas) => celdas.filter((c) => esBuena(c.it) && c.b.getAttribute('aria-pressed') !== 'true' && !c.b.classList.contains('pista-celda')).slice(0, cuantas).forEach((c) => c.b.classList.add('pista-celda'));
  ctx.pistas([
    { texto: d.pistas?.[0] ?? p1 },
    { texto: d.pistas?.[1] ?? 'Te marco **tres** de las que van. ¿Ves cómo siguen?', ver: () => marcaBuenas(3) },
    { texto: d.pistas?.[2] ?? 'Te marco unas cuantas más. Fíjate en el dibujo que forman.', ver: () => marcaBuenas(Math.ceil(celdas.filter((c) => esBuena(c.it)).length / 2)) },
  ]);
  if (ctx.primera) mano(celdas[Math.min(1, celdas.length - 1)].b, { tipo: 'arrastra', dx: 0.3 });
  ctx.boton(ctx.pizarra ? 'Ver la solución' : 'Comprobar', revisar);
  ctx.boton('Borrar todo', () => celdas.forEach((c) => pinta(c, false)), true);

  async function revisar() {
    if (hecho) return;
    hecho = true;
    ctx.acciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
    let bien = 0, sobra = 0, falta = 0;
    const buenas = new Set();
    const nMarcas = celdas.filter((c) => esBuena(c.it) !== (c.b.getAttribute('aria-pressed') === 'true')).length;
    const pausa = Math.min(70, 1100 / Math.max(1, nMarcas));
    for (const c of celdas) {
      const marca = esBuena(c.it) !== (c.b.getAttribute('aria-pressed') === 'true');
      if (marca && !ctx.pizarra) { await espera(pausa); suena('clic'); }
      const buena = esBuena(c.it);
      const puesta = c.b.getAttribute('aria-pressed') === 'true';
      if (buena) buenas.add(String(numeros ? c.it : c.it.t));
      if (buena && puesta) bien++;
      else if (buena) {
        falta++;
        if (ctx.pizarra) pinta(c, true);
        else { c.b.classList.add('falta'); c.b.append(svg('0 0 100 100', CIRCULO, { class: 'boli', preserveAspectRatio: 'none' })); }
      } else if (puesta) { sobra++; c.b.classList.add('sobra'); c.b.append(svg('0 0 100 100', ASPA, { class: 'boli', preserveAspectRatio: 'none' })); }
      c.b.disabled = true;
      c.b.style.cursor = 'default';
    }
    // ola sobre las buenas para que se vea el dibujo
    celdas.forEach((c) => { if (buenas.has(String(numeros ? c.it : c.it.t))) { c.b.style.animationDelay = (c.i % (d.columnas ?? 10)) * 25 + Math.floor(c.i / (d.columnas ?? 10)) * 35 + 'ms'; c.b.classList.add('ola'); } });
    await espera(500);
    // con «mantener» se van acumulando las rondas (sirve para clasificar por descarte)
    anterior = { clave, buenas: previas ? new Set([...previas, ...buenas]) : buenas };
    leyenda.append(el('span', {}, el('i', { style: { background: 'var(--acento)' } }), 'Bien pintadas'),
      el('span', {}, el('i', { style: { border: '3px solid var(--rojo)', borderRadius: '50%' } }), 'Rodeadas: faltaban'),
      el('span', {}, el('i', { style: { background: 'linear-gradient(45deg,transparent 43%,var(--rojo) 43% 57%,transparent 57%),linear-gradient(-45deg,transparent 43%,var(--rojo) 43% 57%,transparent 57%)' } }), 'Tachadas: no iban'));
    const errores = sobra + falta;
    const total = buenas.size;
    const estrellas = errores === 0 ? 3 : errores <= 2 ? 2 : errores <= 5 ? 1 : 0;
    const partes = [`Has pintado bien ${bien} de ${total}.`];
    if (falta) partes.push(`${falta === 1 ? 'Faltaba 1' : `Faltaban ${falta}`}.`);
    if (sobra) partes.push(`${sobra === 1 ? 'Sobra 1' : `Sobran ${sobra}`}.`);
    if (!errores) partes.unshift('**Sin un fallo.**');
    ctx.fin(estrellas, partes.join(' ') + (d.explica ? ' ' + d.explica : ''));
  }
}
