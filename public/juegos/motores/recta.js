// Motor «recta»: tres modos sobre una recta numérica.
//   estimar  → coloca un valor en una recta que solo tiene marcados algunos números
//   ordenar  → cuelga varias tarjetas en su sitio (ordenar + estimar a la vez)
//   saltos   → llega de un número a otro con el menor número de saltos
import { el, num, azar, barajar, redondea } from './nucleo.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (d, v) => num(v, d.decimales) + (d.unidad ? ' ' + d.unidad : '');

function pasoBonito(rango, objetivo = 10) {
  const bruto = rango / objetivo;
  const p10 = 10 ** Math.floor(Math.log10(bruto));
  for (const m of [1, 2, 5, 10]) if (m * p10 >= bruto) return m * p10;
  return 10 * p10;
}

// Dibuja la recta: devuelve el nodo y funciones para pasar de valor a % y de píxel a valor.
function hazRecta({ min, max, marcas, divisiones, decimales }) {
  const nodo = el('div', { class: 'recta' }, el('div', { class: 'eje' }));
  const pc = (v) => ((v - min) / (max - min)) * 100;
  if (divisiones) for (let i = 1; i < divisiones; i++) nodo.append(el('span', { class: 'tic menor', style: { left: (i / divisiones) * 100 + '%' } }));
  for (const m of marcas ?? [min, max]) {
    nodo.append(el('span', { class: 'tic', style: { left: pc(m) + '%' } }));
    nodo.append(el('span', { class: 'num', style: { left: pc(m) + '%' }, text: num(m, decimales) }));
  }
  const valorEn = (clientX) => {
    const r = nodo.getBoundingClientRect();
    return min + clamp((clientX - r.left) / r.width, 0, 1) * (max - min);
  };
  return { nodo, pc, valorEn };
}

function pin(clase, rotulo) {
  return el('div', { class: 'pin ' + clase }, el('span', { class: 'palo' }), el('span', { class: 'cabeza' }), rotulo && el('span', { class: 'rotulo', text: rotulo }));
}

// Puntúa un error en % del largo de la recta
const estrellasError = (pct, tol) => (pct <= tol[0] ? 3 : pct <= tol[1] ? 2 : pct <= tol[2] ? 1 : 0);
const pctTxt = (p) => (p < 1 ? p.toFixed(1).replace('.', ',') : Math.round(p)) + ' %';

/* ---------------------------------------------------------------- estimar */
function estimar(d, ctx) {
  const tol = d.tolerancia ?? [2, 5, 10];
  const R = hazRecta(d);
  ctx.reto(d.texto ?? `¿Dónde está el **${fmt(d, d.valor)}**?`);
  ctx.pista(d.pista ?? 'Toca la recta o arrastra la chincheta. Con las flechas del teclado se afina.');
  ctx.escenario.append(R.nodo);

  let g = null;
  const mio = pin('tuyo');
  mio.tabIndex = 0;
  mio.setAttribute('role', 'slider');
  mio.setAttribute('aria-label', 'Tu chincheta');
  mio.setAttribute('aria-valuemin', '0'); mio.setAttribute('aria-valuemax', '100');
  mio.hidden = true;
  R.nodo.append(mio);
  const comprobar = ctx.boton(ctx.pizarra ? 'Ver dónde está' : 'Comprobar', revisar);
  comprobar.disabled = true;

  const mueve = (v) => {
    g = clamp(v, d.min, d.max);
    mio.hidden = false;
    mio.style.left = R.pc(g) + '%';
    mio.setAttribute('aria-valuenow', String(Math.round(R.pc(g))));
    mio.setAttribute('aria-valuetext', `${Math.round(R.pc(g))} % del camino`);
    comprobar.disabled = false;
  };
  let hecho = false;
  R.nodo.addEventListener('pointerdown', (e) => {
    if (hecho) return;
    R.nodo.setPointerCapture(e.pointerId);
    mueve(R.valorEn(e.clientX));
    const mover = (ev) => mueve(R.valorEn(ev.clientX));
    const soltar = () => { R.nodo.removeEventListener('pointermove', mover); R.nodo.removeEventListener('pointerup', soltar); mio.focus({ preventScroll: true }); };
    R.nodo.addEventListener('pointermove', mover);
    R.nodo.addEventListener('pointerup', soltar);
  });
  mio.addEventListener('keydown', (e) => {
    if (hecho) return;
    const paso = (d.max - d.min) / (e.shiftKey ? 10 : 100);
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { mueve((g ?? d.min) + paso); e.preventDefault(); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { mueve((g ?? d.min) - paso); e.preventDefault(); }
    if (e.key === 'Enter' && g != null) revisar();
  });
  // sin ratón: se puede empezar desde el teclado
  R.nodo.tabIndex = -1;
  ctx.boton('Poner la chincheta en el centro', () => { mueve((d.min + d.max) / 2); mio.focus(); }, true).classList.add('sr');

  function revisar() {
    if (g == null) return;
    hecho = true;
    const err = Math.abs(g - d.valor);
    const pct = (err / (d.max - d.min)) * 100;
    const zona = el('span', { class: 'zona', style: { left: R.pc(Math.max(d.min, d.valor - (tol[0] / 100) * (d.max - d.min))) + '%', width: (2 * tol[0]) + '%' } });
    const a = Math.min(g, d.valor), b = Math.max(g, d.valor);
    const hueco = el('span', { class: 'hueco', style: { left: R.pc(a) + '%', width: R.pc(b) - R.pc(a) + '%' } });
    const bueno = pin('bueno', d.etiqueta ? `${d.etiqueta} · ${fmt(d, d.valor)}` : fmt(d, d.valor));
    bueno.style.left = R.pc(d.valor) + '%';
    R.nodo.append(zona, hueco, bueno);
    mio.removeAttribute('tabindex');
    const tuyo = redondea(g, d.paso ?? (d.max - d.min >= 1000 ? 10 : 1));
    const mensaje = pct < 0.6 ? `**¡Clavado!** Tu chincheta está en el ${fmt(d, tuyo)}.`
      : `Tu chincheta está más o menos en el ${fmt(d, tuyo)}: a ${fmt(d, redondea(err, d.paso ?? 1))} del bueno, un ${pctTxt(pct)} de la recta.`;
    ctx.fin(estrellasError(pct, tol), mensaje + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- ordenar */
function ordenar(d, ctx) {
  const tol = d.tolerancia ?? [3, 6, 12];
  const R = hazRecta(d);
  R.nodo.classList.add('alta');
  ctx.reto(d.texto ?? 'Cuelga cada tarjeta **en su sitio** de la recta');
  ctx.pista(d.pista ?? 'Arrastra cada tarjeta hasta la recta, o tócala y luego toca la recta. Se pueden mover hasta que compruebes.');
  const bandeja = el('div', { class: 'bandeja', 'aria-label': 'Tarjetas por colocar' });
  ctx.escenario.append(bandeja, R.nodo);

  const tarjetas = barajar(d.tarjetas).map((t, i) => {
    const valor = typeof t === 'number' ? t : t.valor;
    const texto = typeof t === 'number' ? fmt(d, t) : t.texto;
    const sub = typeof t === 'object' && d.mostrarValor !== false && t.texto ? fmt(d, valor) : null;
    const nodo = el('button', { type: 'button', class: 'tarjeta' }, texto, sub && el('small', { text: sub }));
    return { i, valor, texto, nodo, g: null, cuelga: null };
  });
  tarjetas.forEach((t) => bandeja.append(t.nodo));
  const comprobar = ctx.boton(ctx.pizarra ? 'Ver dónde van' : 'Comprobar', revisar);
  comprobar.disabled = true;

  let elegida = null, hecho = false;
  const elegir = (t) => {
    tarjetas.forEach((x) => x.nodo.classList.remove('elegida'));
    elegida = elegida === t ? null : t;
    if (elegida) elegida.nodo.classList.add('elegida');
    ctx.aviso(elegida ? `Ahora toca en la recta dónde va «${t.texto}».` : '');
  };

  function colocar(t, v) {
    t.g = clamp(v, d.min, d.max);
    if (!t.cuelga) {
      t.cuelga = el('div', { class: 'colgada' });
      t.cuerda = el('span', { class: 'cuerda' });
      t.punto = el('span', { class: 'punto' });
      R.nodo.append(t.cuerda, t.punto, t.cuelga);
    }
    t.cuelga.append(t.nodo);
    t.nodo.classList.remove('elegida');
    elegida = null; ctx.aviso('');
    recolocar();
  }
  function aBandeja(t) {
    t.g = null;
    bandeja.append(t.nodo);
    t.cuelga?.remove(); t.cuerda?.remove(); t.punto?.remove();
    t.cuelga = t.cuerda = t.punto = null;
    recolocar();
  }
  // Reparte las tarjetas colgadas en pisos para que no se pisen
  function recolocar() {
    const ancho = R.nodo.clientWidth || 800;
    const puestas = tarjetas.filter((t) => t.g != null).sort((a, b) => a.g - b.g);
    const finPiso = [];
    for (const t of puestas) {
      const w = t.nodo.offsetWidth || 90;
      const x = (R.pc(t.g) / 100) * ancho;
      let piso = 0;
      while (finPiso[piso] != null && finPiso[piso] > x - w / 2 - 6) piso++;
      finPiso[piso] = x + w / 2;
      t.piso = piso;
    }
    const pisos = Math.max(1, finPiso.length);
    R.nodo.style.setProperty('--alto', 44 + 34 + pisos * 58 + 'px');
    for (const t of puestas) {
      const izq = R.pc(t.g) + '%';
      t.cuelga.style.left = izq; t.cuelga.style.bottom = 44 + 30 + t.piso * 58 + 'px';
      t.cuerda.style.left = izq; t.cuerda.style.bottom = '48px'; t.cuerda.style.height = 28 + t.piso * 58 + 'px';
      t.punto.style.left = izq;
    }
    comprobar.disabled = tarjetas.some((t) => t.g == null);
  }
  window.addEventListener('resize', () => !hecho && recolocar());

  // Arrastrar o tocar
  for (const t of tarjetas) {
    t.nodo.addEventListener('pointerdown', (e) => {
      if (hecho) return;
      e.preventDefault();
      const x0 = e.clientX, y0 = e.clientY;
      let fantasma = null;
      const mover = (ev) => {
        if (!fantasma && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) {
          fantasma = t.nodo.cloneNode(true);
          fantasma.classList.add('arrastrando');
          document.body.append(fantasma);
          t.nodo.style.opacity = '.25';
        }
        if (fantasma) { fantasma.style.left = ev.clientX - fantasma.offsetWidth / 2 + 'px'; fantasma.style.top = ev.clientY - 24 + 'px'; }
      };
      const soltar = (ev) => {
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', soltar);
        if (!fantasma) return elegir(t);
        fantasma.remove(); t.nodo.style.opacity = '';
        const r = R.nodo.getBoundingClientRect();
        const dentro = ev.clientY > r.top - 40 && ev.clientY < r.bottom + 30 && ev.clientX > r.left - 30 && ev.clientX < r.right + 30;
        if (dentro) colocar(t, R.valorEn(ev.clientX));
        else if (t.g != null && ev.clientY < r.top - 40) aBandeja(t);
      };
      window.addEventListener('pointermove', mover);
      window.addEventListener('pointerup', soltar);
    });
    t.nodo.addEventListener('keydown', (e) => {
      if (hecho || t.g == null) return;
      const paso = (d.max - d.min) / (e.shiftKey ? 10 : 100);
      if (e.key === 'ArrowRight') { colocar(t, t.g + paso); t.nodo.focus(); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { colocar(t, t.g - paso); t.nodo.focus(); e.preventDefault(); }
    });
  }
  R.nodo.addEventListener('pointerdown', (e) => {
    if (hecho || !elegida || e.target.closest('.tarjeta')) return;
    const t = elegida; colocar(t, R.valorEn(e.clientX)); t.nodo.focus({ preventScroll: true });
  });

  function revisar() {
    hecho = true;
    const orden = [...tarjetas].sort((a, b) => a.g - b.g);
    let cambiadas = 0;
    for (let i = 0; i < orden.length; i++) for (let j = i + 1; j < orden.length; j++) if (orden[i].valor > orden[j].valor) cambiadas++;
    let suma = 0;
    for (const t of tarjetas) {
      const pct = (Math.abs(t.g - t.valor) / (d.max - d.min)) * 100;
      suma += pct;
      const a = Math.min(t.g, t.valor), b = Math.max(t.g, t.valor);
      R.nodo.append(el('span', { class: 'enlace', style: { left: R.pc(a) + '%', width: R.pc(b) - R.pc(a) + '%' } }),
        el('span', { class: 'punto bueno', style: { left: R.pc(t.valor) + '%' }, title: `${t.texto}: ${fmt(d, t.valor)}` }));
      t.cuelga.classList.add(pct <= tol[1] ? 'bien' : 'mal');
      if (d.mostrarValor === false || !t.nodo.querySelector('small')) {
        if (typeof d.tarjetas[0] === 'object') t.nodo.append(el('small', { text: fmt(d, t.valor) }));
      }
    }
    const medio = suma / tarjetas.length;
    const estrellas = cambiadas === 0 ? (medio <= tol[0] ? 3 : 2) : cambiadas === 1 ? 1 : 0;
    const txtOrden = cambiadas === 0 ? '**Orden perfecto.**' : `Hay ${cambiadas} ${cambiadas === 1 ? 'pareja cambiada' : 'parejas cambiadas'} de orden.`;
    ctx.fin(estrellas, `${txtOrden} Los puntos azules marcan el sitio exacto; de media te has desviado un ${pctTxt(medio)} de la recta.` + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- saltos */
function caminoMinimo(inicio, meta, saltos, restar) {
  const movs = restar ? saltos.flatMap((s) => [s, -s]) : saltos;
  const maxS = Math.max(...saltos);
  const lo = Math.min(inicio, meta) - 2 * maxS, hi = Math.max(inicio, meta) + 2 * maxS;
  const previo = new Map([[inicio, null]]);
  let capa = [inicio];
  while (capa.length && !previo.has(meta)) {
    const sig = [];
    for (const v of capa) for (const m of movs) {
      const w = v + m;
      if (w < lo || w > hi || previo.has(w)) continue;
      previo.set(w, [v, m]); sig.push(w);
    }
    capa = sig;
  }
  if (!previo.has(meta)) return null;
  const pasos = [];
  for (let v = meta; previo.get(v); v = previo.get(v)[0]) pasos.unshift(previo.get(v)[1]);
  return pasos;
}
const signo = (m) => (m > 0 ? `+${num(m)}` : `−${num(-m)}`);
function agrupa(pasos) {
  const g = [];
  pasos = [...pasos].sort((a, b) => Math.abs(b) - Math.abs(a) || b - a);
  for (const m of pasos) { const u = g.at(-1); if (u && u.m === m) u.n++; else g.push({ m, n: 1 }); }
  return g.map((x) => (x.n > 1 ? `${signo(x.m)} (×${x.n})` : signo(x.m))).join(', ');
}

function saltar(d, ctx) {
  const saltos = d.saltos ?? [1, 10, 100];
  const restar = d.restar !== false;
  const optimo = caminoMinimo(d.inicio, d.meta, saltos, restar);
  ctx.reto(d.texto ?? `Del **${num(d.inicio)}** al **${num(d.meta)}** con los menos saltos posibles`);
  ctx.pista(d.pista ?? (restar ? 'Se puede saltar hacia delante y hacia atrás. A veces pasarse y volver sale más corto.' : 'Solo se salta hacia delante.'));

  const recta = el('div', { class: 'recta alta', style: { '--alto': '230px', cursor: 'default' } });
  const cuenta = el('p', { class: 'cuenta', 'aria-live': 'polite' });
  const botones = el('div', { class: 'saltos', role: 'group', 'aria-label': 'Saltos' });
  ctx.escenario.append(recta, cuenta, botones);

  const pos = [d.inicio];
  let hecho = false;
  for (const s of [...saltos].sort((a, b) => b - a)) {
    botones.append(el('button', { type: 'button', class: 'btn-sec', text: '+' + num(s), 'aria-label': `Saltar ${s} hacia delante`, onclick: () => salta(s) }));
  }
  if (restar) for (const s of [...saltos].sort((a, b) => b - a)) {
    botones.append(el('button', { type: 'button', class: 'btn-sec menos', text: '−' + num(s), 'aria-label': `Saltar ${s} hacia atrás`, onclick: () => salta(-s) }));
  }
  const deshacer = ctx.boton('Deshacer', () => { if (pos.length > 1) { pos.pop(); pinta(false); } }, true);
  ctx.boton('Empezar otra vez', () => { pos.length = 1; pinta(false); }, true);
  if (ctx.pizarra) ctx.boton('Ver el camino más corto', () => { pos.length = 1; optimo.forEach((m) => pos.push(pos.at(-1) + m)); pinta(true); acabar(); });

  function salta(m) {
    if (hecho) return;
    if (pos.length > 40) return ctx.aviso('Demasiados saltos. Prueba a deshacer o a empezar otra vez.', true);
    pos.push(pos.at(-1) + m);
    pinta(true);
    if (pos.at(-1) === d.meta) acabar();
  }

  function pinta(nuevo) {
    deshacer.disabled = pos.length < 2;
    const lo0 = Math.min(...pos, d.meta), hi0 = Math.max(...pos, d.meta);
    const margen = Math.max((hi0 - lo0) * 0.07, 2);
    const min = lo0 - margen, max = hi0 + margen;
    const paso = pasoBonito(max - min, 8);
    const ancho = recta.clientWidth || 900;
    const alto = 230, ejeY = alto - 44;
    const X = (v) => ((v - min) / (max - min)) * ancho;
    recta.replaceChildren(el('div', { class: 'eje' }));
    for (let v = Math.ceil(min / paso) * paso; v <= max; v += paso) {
      recta.append(el('span', { class: 'tic menor', style: { left: (X(v) / ancho) * 100 + '%' } }));
    }
    for (const v of [d.inicio, d.meta]) {
      recta.append(el('span', { class: 'tic', style: { left: (X(v) / ancho) * 100 + '%' } }), el('span', { class: 'num', style: { left: (X(v) / ancho) * 100 + '%' }, text: num(v) }));
    }
    recta.append(el('span', { class: 'meta', style: { left: (X(d.meta) / ancho) * 100 + '%' }, title: 'Meta' }));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'arcos'); svg.setAttribute('viewBox', `0 0 ${ancho} ${alto}`); svg.setAttribute('aria-hidden', 'true');
    const maxSalto = Math.max(...pos.slice(1).map((p, i) => Math.abs(p - pos[i])), 1);
    let h = '';
    for (let i = 1; i < pos.length; i++) {
      const a = X(pos[i - 1]), b = X(pos[i]), m = pos[i] - pos[i - 1];
      const dx = Math.abs(b - a);
      const subir = 26 + 120 * Math.sqrt(Math.abs(m) / maxSalto);
      const yTop = ejeY - Math.min(subir, ejeY - 26, 26 + dx * 0.9);
      const cls = (m < 0 ? 'atras' : '') + (nuevo && i === pos.length - 1 ? ' nuevo' : '');
      const largo = Math.round(dx + 2 * (ejeY - yTop));
      h += `<path class="${cls}" style="--l:${largo};stroke-dasharray:${m < 0 ? '6 6' : largo}" d="M${a} ${ejeY - 4} C ${a} ${yTop}, ${b} ${yTop}, ${b} ${ejeY - 4}"/>`;
      h += `<text class="${m < 0 ? 'atras' : ''}" x="${(a + b) / 2}" y="${(ejeY + 3 * yTop) / 4 - 6}">${signo(m)}</text>`;
    }
    svg.innerHTML = h;
    recta.append(svg, el('span', { class: 'ficha', style: { left: (X(pos.at(-1)) / ancho) * 100 + '%' } }));
    const partes = [el('span', { text: num(d.inicio) })];
    for (let i = 1; i < pos.length; i++) {
      const m = pos[i] - pos[i - 1];
      partes.push(el('span', { class: m < 0 ? 'atras' : '', text: m < 0 ? ` − ${num(-m)}` : ` + ${num(m)}` }));
    }
    partes.push(` = ${num(pos.at(-1))}`);
    cuenta.replaceChildren(...partes, el('span', { class: 'sr', text: pos.at(-1) === d.meta ? '. Has llegado.' : `. Faltan ${d.meta - pos.at(-1)}.` }));
  }
  window.addEventListener('resize', () => pinta(false));
  requestAnimationFrame(() => pinta(false));

  function acabar() {
    hecho = true;
    botones.querySelectorAll('button').forEach((b) => (b.disabled = true));
    const n = pos.length - 1;
    const o = optimo.length;
    const estrellas = n <= o ? 3 : n === o + 1 ? 2 : 1;
    const msg = n <= o ? `**${n} ${n === 1 ? 'salto' : 'saltos'}.** No se puede con menos.`
      : `Has llegado en ${n} saltos. Se podía en ${o}: ${agrupa(optimo)}.`;
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- generadores */
export function generar(spec) {
  const g = typeof spec.generar === 'object' ? spec.generar : spec;
  const modo = spec.modo;
  const d = structuredClone(spec);
  delete d.generar;
  if (modo === 'estimar') {
    const r = d.max - d.min;
    d.valor = redondea(d.min + r * 0.04 + Math.random() * r * 0.92, g.redondeo ?? 1);
  } else if (modo === 'ordenar') {
    const vistos = new Set(), r = d.max - d.min;
    while (vistos.size < (g.cantidad ?? 5)) vistos.add(redondea(d.min + r * 0.03 + Math.random() * r * 0.94, g.redondeo ?? 1));
    d.tarjetas = [...vistos];
  } else if (modo === 'saltos') {
    const [a, b] = g.inicio ?? [10, 99];
    const [c, e] = g.distancia ?? [20, 150];
    d.inicio = azar(a, b);
    d.meta = d.inicio + azar(c, e) * (g.haciaAtras && Math.random() < 0.5 ? -1 : 1);
  }
  return d;
}

export function ronda(d, ctx) {
  if (d.modo === 'ordenar') return ordenar(d, ctx);
  if (d.modo === 'saltos') return saltar(d, ctx);
  return estimar(d, ctx);
}
