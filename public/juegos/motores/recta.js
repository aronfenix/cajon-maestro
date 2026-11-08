// Motor «recta»: una regla de madera con tres modos.
//   estimar  → clavar una chincheta donde va un valor (la regla solo tiene algunos números)
//   ordenar  → colgar etiquetas en su sitio (ordenar + estimar a la vez)
//   saltos   → llevar la rana de un número a otro con el menor número de saltos
import { el, svg, num, azar, barajar, redondea, suena } from './nucleo.js';

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const fmt = (d, v) => num(v, d.decimales) + (d.unidad ? ' ' + d.unidad : '');
const pctTxt = (p) => (p < 1 ? p.toFixed(1).replace('.', ',') : Math.round(p)) + ' %';
const estrellasError = (pct, tol) => (pct <= tol[0] ? 3 : pct <= tol[1] ? 2 : pct <= tol[2] ? 1 : 0);

function pasoBonito(rango, objetivo = 10) {
  const bruto = rango / objetivo;
  const p10 = 10 ** Math.floor(Math.log10(bruto));
  for (const m of [1, 2, 5, 10]) if (m * p10 >= bruto) return m * p10;
  return 10 * p10;
}

// La regla: devuelve el contenedor, la escala (donde se colocan las cosas) y las conversiones.
function hazRegla({ min, max, marcas, divisiones, decimales }, fuertes = []) {
  const escala = el('div', { class: 'escala' });
  const regla = el('div', { class: 'regla' }, escala);
  const nodo = el('div', { class: 'recta' }, regla);
  const pc = (v) => ((v - min) / (max - min)) * 100;
  if (divisiones) for (let i = 1; i < divisiones; i++) escala.append(el('span', { class: 'tic menor', style: { left: (i / divisiones) * 100 + '%' } }));
  for (const m of marcas ?? [min, max]) {
    escala.append(el('span', { class: 'tic', style: { left: pc(m) + '%' } }),
      el('span', { class: 'num' + (fuertes.includes(m) ? ' fuerte' : ''), style: { left: pc(m) + '%' }, text: num(m, decimales) }));
  }
  const valorEn = (clientX) => {
    const r = escala.getBoundingClientRect();
    return min + clamp((clientX - r.left) / r.width, 0, 1) * (max - min);
  };
  return { nodo, regla, escala, pc, valorEn };
}

const CHINCHETA = `
<ellipse cx="22" cy="75" rx="7" ry="2.4" fill="rgba(60,30,0,.35)"/>
<rect x="20.4" y="42" width="3.2" height="34" rx="1.6" fill="#7d868c"/><rect x="21" y="42" width="1" height="32" fill="#e8ecef"/>
<path d="M7 40 Q22 33 37 40 L37 44.5 Q22 51 7 44.5Z" fill="var(--acento)" stroke="var(--acento-osc)" stroke-width="2"/>
<path d="M15 14 L29 14 L27.2 38 L16.8 38Z" fill="var(--acento)" stroke="var(--acento-osc)" stroke-width="2" stroke-linejoin="round"/>
<rect x="5" y="2" width="34" height="14" rx="7" fill="var(--acento)" stroke="var(--acento-osc)" stroke-width="2"/>
<rect x="10" y="5" width="11" height="4" rx="2" fill="#fff" opacity=".75"/><path d="M19 18 L19.6 35" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".55"/>`;

/* ---------------------------------------------------------------- estimar */
function estimar(d, ctx) {
  const tol = d.tolerancia ?? [2, 5, 10];
  const R = hazRegla(d, d.marcas ?? [d.min, d.max]);
  R.nodo.style.setProperty('--arriba', '124px');
  ctx.reto(d.texto ?? `¿Dónde está el **${fmt(d, d.valor)}**?`);
  ctx.pista(d.pista ?? 'Toca la recta para clavar la chincheta y arrástrala para afinar. Con las flechas del teclado también se mueve.');
  ctx.escenario.append(R.nodo);

  let g = null, hecho = false;
  const pin = el('div', { class: 'chincheta', hidden: true }, svg('0 0 44 76', CHINCHETA));
  const mango = el('div', { class: 'mango', tabindex: '0', role: 'slider', 'aria-label': 'Tu chincheta', 'aria-valuemin': '0', 'aria-valuemax': '100' });
  pin.append(mango);
  R.escala.append(pin);
  const comprobar = ctx.boton(ctx.pizarra ? 'Ver dónde está' : 'Comprobar', revisar);
  comprobar.disabled = true;

  const mueve = (v, primera) => {
    g = clamp(v, d.min, d.max);
    if (pin.hidden || primera) { pin.hidden = false; pin.classList.remove('cae'); void pin.offsetWidth; pin.classList.add('cae'); suena('pon'); }
    pin.style.left = R.pc(g) + '%';
    mango.setAttribute('aria-valuenow', String(Math.round(R.pc(g))));
    mango.setAttribute('aria-valuetext', `${Math.round(R.pc(g))} % del camino`);
    comprobar.disabled = false;
  };
  const arrastrar = (e) => {
    if (hecho) return;
    e.preventDefault();
    const sobrePin = e.target === mango;
    if (!sobrePin) mueve(R.valorEn(e.clientX), true);
    pin.classList.add('alzada');
    const mover = (ev) => mueve(R.valorEn(ev.clientX));
    const soltar = () => { pin.classList.remove('alzada'); if (sobrePin) suena('pon'); window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', soltar); };
    window.addEventListener('pointermove', mover);
    window.addEventListener('pointerup', soltar);
  };
  R.regla.addEventListener('pointerdown', arrastrar);
  mango.addEventListener('pointerdown', arrastrar);
  mango.addEventListener('keydown', (e) => {
    if (hecho) return;
    const paso = (d.max - d.min) / (e.shiftKey ? 10 : 100);
    if (['ArrowRight', 'ArrowUp'].includes(e.key)) { mueve((g ?? d.min) + paso); e.preventDefault(); }
    if (['ArrowLeft', 'ArrowDown'].includes(e.key)) { mueve((g ?? d.min) - paso); e.preventDefault(); }
    if (e.key === 'Enter' && g != null) revisar();
  });
  // desde el teclado se empieza con la chincheta en el centro
  mango.addEventListener('focus', () => { if (g == null && !hecho) mueve((d.min + d.max) / 2, true); });

  function revisar() {
    if (g == null) return;
    hecho = true;
    mango.removeAttribute('tabindex'); mango.style.cursor = 'default';
    R.regla.style.cursor = 'default';
    R.nodo.classList.add('con-boli');
    const rango = d.max - d.min;
    const err = Math.abs(g - d.valor);
    const pct = (err / rango) * 100;
    const ini = Math.max(d.min, d.valor - (tol[0] / 100) * rango), fin = Math.min(d.max, d.valor + (tol[0] / 100) * rango);
    R.escala.append(el('span', { class: 'fosforito', style: { left: R.pc(ini) + '%', width: R.pc(fin) - R.pc(ini) + '%' } }));
    if (pct >= 0.6) {
      const a = Math.min(g, d.valor), b = Math.max(g, d.valor);
      R.escala.append(el('span', { class: 'distancia', style: { left: R.pc(a) + '%', width: R.pc(b) - R.pc(a) + '%' } },
        el('b', { text: num(redondea(err, d.paso ?? (rango >= 1000 ? 10 : 1)), d.decimales) })));
    }
    R.escala.append(el('div', { class: 'boli-azul', style: { left: R.pc(d.valor) + '%' } },
      svg('0 0 32 50', '<path class="trazo" pathLength="1" d="M16 48 C 14 34, 18 18, 16 5 M7 15 L16 3 L25 14" stroke="var(--azul)" stroke-width="3.5"/>'),
      el('span', { text: d.etiqueta ? `${d.etiqueta}: ${fmt(d, d.valor)}` : fmt(d, d.valor) })));
    const tuyo = redondea(g, d.paso ?? (rango >= 1000 ? 10 : 1));
    const mensaje = pct < 0.6 ? `**Clavada.** Tu chincheta está justo en el ${fmt(d, tuyo)}.`
      : `Tu chincheta está más o menos en el ${fmt(d, tuyo)}, a ${fmt(d, redondea(err, d.paso ?? 1))} del sitio bueno: un ${pctTxt(pct)} de la recta. La franja de color es la zona de las tres estrellas.`;
    ctx.fin(estrellasError(pct, tol), mensaje + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- ordenar */
function ordenar(d, ctx) {
  const tol = d.tolerancia ?? [3, 6, 12];
  const R = hazRegla(d);
  ctx.reto(d.texto ?? 'Cuelga cada etiqueta **en su sitio** de la recta');
  ctx.pista(d.pista ?? 'Arrastra cada etiqueta hasta la recta, o tócala y luego toca la recta. Se pueden mover hasta que compruebes.');
  const bandeja = el('div', { class: 'bandeja', 'aria-label': 'Etiquetas por colgar' });
  ctx.escenario.append(bandeja, R.nodo);

  const conTexto = typeof d.tarjetas[0] === 'object';
  const tarjetas = barajar(d.tarjetas).map((t, i) => {
    const valor = typeof t === 'number' ? t : t.valor;
    const texto = typeof t === 'number' ? fmt(d, t) : t.texto;
    const sub = conTexto && d.mostrarValor !== false ? fmt(d, valor) : null;
    const nodo = el('button', { type: 'button', class: 'etiqueta', style: { '--g': (i % 2 ? 2 : -2) + 'deg' } }, texto, sub && el('small', { text: sub }));
    return { i, valor, texto, nodo, g: null };
  });
  tarjetas.forEach((t) => bandeja.append(t.nodo));
  const comprobar = ctx.boton(ctx.pizarra ? 'Ver dónde van' : 'Comprobar', revisar);
  comprobar.disabled = true;

  let elegida = null, hecho = false;
  const elegir = (t) => {
    tarjetas.forEach((x) => x.nodo.classList.remove('elegida'));
    elegida = elegida === t ? null : t;
    if (elegida) { elegida.nodo.classList.add('elegida'); suena('clic'); }
    ctx.aviso(elegida ? `Ahora toca en la recta dónde va «${t.texto}».` : '');
  };
  function colocar(t, v) {
    t.g = clamp(v, d.min, d.max);
    if (!t.cuelga) {
      t.cuelga = el('div', { class: 'colgada' });
      t.hilo = el('span', { class: 'hilo' });
      t.punta = el('span', { class: 'punta' });
      R.escala.append(t.hilo, t.punta, t.cuelga);
    }
    t.cuelga.append(t.nodo);
    t.nodo.classList.remove('elegida');
    elegida = null; ctx.aviso('');
    suena('pon');
    recolocar();
  }
  function aBandeja(t) {
    t.g = null;
    bandeja.append(t.nodo);
    t.cuelga?.remove(); t.hilo?.remove(); t.punta?.remove();
    t.cuelga = t.hilo = t.punta = null;
    suena('quita');
    recolocar();
  }
  // Reparte las etiquetas colgadas en pisos para que no se pisen
  function recolocar() {
    const ancho = R.escala.clientWidth || 800;
    const puestas = tarjetas.filter((t) => t.g != null).sort((a, b) => a.g - b.g);
    const finPiso = [];
    for (const t of puestas) {
      const w = t.nodo.offsetWidth || 100;
      const x = (R.pc(t.g) / 100) * ancho;
      let piso = 0;
      while (finPiso[piso] != null && finPiso[piso] > x - w / 2 - 8) piso++;
      finPiso[piso] = x + w / 2;
      t.piso = piso;
    }
    R.nodo.style.setProperty('--arriba', 30 + Math.max(1, finPiso.length) * 70 + 'px');
    for (const t of puestas) {
      const izq = R.pc(t.g) + '%';
      Object.assign(t.cuelga.style, { left: izq, bottom: `calc(100% + ${22 + t.piso * 70}px)` });
      Object.assign(t.hilo.style, { left: izq, bottom: '100%', height: 24 + t.piso * 70 + 'px' });
      t.punta.style.left = izq;
    }
    comprobar.disabled = tarjetas.some((t) => t.g == null);
  }
  window.addEventListener('resize', () => !hecho && recolocar());

  for (const t of tarjetas) {
    t.nodo.addEventListener('pointerdown', (e) => {
      if (hecho) return;
      e.preventDefault();
      const x0 = e.clientX, y0 = e.clientY;
      let fantasma = null;
      const mover = (ev) => {
        if (!fantasma && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) {
          fantasma = t.nodo.cloneNode(true);
          fantasma.classList.add('volando');
          document.body.append(fantasma);
          t.nodo.style.opacity = '.25';
          suena('clic');
        }
        if (fantasma) { fantasma.style.left = ev.clientX - fantasma.offsetWidth / 2 + 'px'; fantasma.style.top = ev.clientY - 28 + 'px'; }
      };
      const soltar = (ev) => {
        window.removeEventListener('pointermove', mover);
        window.removeEventListener('pointerup', soltar);
        if (!fantasma) return elegir(t);
        fantasma.remove(); t.nodo.style.opacity = '';
        const r = R.nodo.getBoundingClientRect();
        const dentro = ev.clientY > r.top - 30 && ev.clientY < r.bottom + 30 && ev.clientX > r.left - 30 && ev.clientX < r.right + 30;
        if (dentro) colocar(t, R.valorEn(ev.clientX));
        else if (t.g != null && ev.clientY < r.top - 30) aBandeja(t);
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
  R.regla.addEventListener('pointerdown', (e) => {
    if (hecho || !elegida) return;
    const t = elegida; colocar(t, R.valorEn(e.clientX)); t.nodo.focus({ preventScroll: true });
  });

  function revisar() {
    hecho = true;
    elegida = null;
    const orden = [...tarjetas].sort((a, b) => a.g - b.g);
    let cambiadas = 0;
    for (let i = 0; i < orden.length; i++) for (let j = i + 1; j < orden.length; j++) if (orden[i].valor > orden[j].valor) cambiadas++;
    let suma = 0;
    for (const t of tarjetas) {
      const pct = (Math.abs(t.g - t.valor) / (d.max - d.min)) * 100;
      suma += pct;
      const a = Math.min(t.g, t.valor), b = Math.max(t.g, t.valor);
      R.escala.append(el('span', { class: 'enlace', style: { left: R.pc(a) + '%', width: R.pc(b) - R.pc(a) + '%' } }),
        el('span', { class: 'punto-bueno', style: { left: R.pc(t.valor) + '%' }, title: `${t.texto}: ${fmt(d, t.valor)}` }));
      t.cuelga.classList.add(pct <= tol[1] ? 'bien' : 'mal');
      if (conTexto && !t.nodo.querySelector('small')) t.nodo.append(el('small', { text: fmt(d, t.valor) }));
      t.nodo.style.cursor = 'default';
    }
    const medio = suma / tarjetas.length;
    const estrellas = cambiadas === 0 ? (medio <= tol[0] ? 3 : 2) : cambiadas === 1 ? 1 : 0;
    const txtOrden = cambiadas === 0 ? '**Orden perfecto.**' : `Hay ${cambiadas} ${cambiadas === 1 ? 'pareja cambiada' : 'parejas cambiadas'} de orden.`;
    ctx.fin(estrellas, `${txtOrden} Los círculos azules marcan el sitio exacto; de media te has desviado un ${pctTxt(medio)} de la recta.` + (d.explica ? ' ' + d.explica : ''));
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
  return g.map((x) => (x.n > 1 ? `${signo(x.m)} (${x.n} veces)` : signo(x.m))).join(', ');
}
const COLORES = [['var(--s1)', '#a88600', '#000'], ['var(--s2)', '#1a3f8f', '#fff'], ['var(--s3)', '#992350', '#fff'], ['var(--s4)', '#0f5e34', '#fff']];
const RANA = `
<ellipse cx="27" cy="46" rx="17" ry="3" fill="rgba(0,0,0,.22)"/>
<path d="M7 44 Q2 36 10 33 L17 42Z M47 44 Q52 36 44 33 L37 42Z" fill="#3f9a26" stroke="#1f5c12" stroke-width="2.5" stroke-linejoin="round"/>
<ellipse cx="27" cy="32" rx="20" ry="13.5" fill="#5bc236" stroke="#1f5c12" stroke-width="2.5"/>
<ellipse cx="27" cy="37" rx="11" ry="5.5" fill="#c3f29e"/>
<circle cx="17" cy="18" r="8" fill="#5bc236" stroke="#1f5c12" stroke-width="2.5"/><circle cx="37" cy="18" r="8" fill="#5bc236" stroke="#1f5c12" stroke-width="2.5"/>
<circle cx="17" cy="18" r="4.6" fill="#fff"/><circle cx="37" cy="18" r="4.6" fill="#fff"/>
<circle cx="18.2" cy="18.4" r="2.5" fill="#000"/><circle cx="38.2" cy="18.4" r="2.5" fill="#000"/>
<path d="M19 30 Q27 36 35 30" fill="none" stroke="#1f5c12" stroke-width="2.5" stroke-linecap="round"/>`;
const BANDERIN = `<rect x="2" y="4" width="3" height="58" rx="1.5" fill="#3b2a12"/><path d="M5 5 L36 13 L5 24Z" fill="var(--rojo)" stroke="#7a120e" stroke-width="2" stroke-linejoin="round"/>`;

function saltar(d, ctx) {
  const saltos = [...(d.saltos ?? [1, 10, 100])].sort((a, b) => a - b);
  const color = (m) => COLORES[Math.min(saltos.indexOf(Math.abs(m)), 3)];
  const restar = d.restar !== false;
  const optimo = caminoMinimo(d.inicio, d.meta, saltos, restar);
  ctx.reto(d.texto ?? `Lleva la rana del **${num(d.inicio)}** al **${num(d.meta)}** con los menos saltos posibles`);
  ctx.pista(d.pista ?? (restar ? 'Puede saltar hacia delante y hacia atrás. A veces pasarse y volver sale más corto.' : 'Solo salta hacia delante.'));

  const H = 190;
  const cuenta = el('p', { class: 'cuenta', 'aria-live': 'polite' });
  const botones = el('div', { class: 'saltos', role: 'group', 'aria-label': 'Saltos' });
  const caja = el('div');
  ctx.escenario.append(caja, botones, cuenta);

  const pos = [d.inicio];
  let hecho = false;
  for (const dir of restar ? [1, -1] : [1]) for (const s of [...saltos].reverse()) {
    const [c, canto, txt] = color(s);
    const estilo = dir > 0 ? { '--c': c, '--c-canto': canto, '--c-txt': txt } : { '--c': '#fff', '--c-canto': canto, '--c-txt': canto };
    botones.append(el('button', { type: 'button', class: 'tecla', style: estilo, text: (dir > 0 ? '+' : '−') + num(s), 'aria-label': `Saltar ${s} hacia ${dir > 0 ? 'delante' : 'atrás'}`, onclick: () => salta(dir * s) }));
  }
  const deshacer = ctx.boton('Deshacer', () => { if (pos.length > 1 && !hecho) { pos.pop(); suena('quita'); pinta(false); } }, true);
  ctx.boton('Empezar otra vez', () => { if (!hecho) { pos.length = 1; suena('quita'); pinta(false); } }, true);
  if (ctx.pizarra) ctx.boton('Ver el camino más corto', () => { pos.length = 1; optimo.forEach((m) => pos.push(pos.at(-1) + m)); pinta(false); acabar(); });

  function salta(m) {
    if (hecho) return;
    if (pos.length > 40) return ctx.aviso('Demasiados saltos. Deshaz alguno o empieza otra vez.', true);
    pos.push(pos.at(-1) + m);
    suena(m > 0 ? 'salto' : 'atras');
    pinta(true);
    if (pos.at(-1) === d.meta) setTimeout(acabar, 380);
  }

  function pinta(nuevo) {
    deshacer.disabled = pos.length < 2 || hecho;
    const lo0 = Math.min(...pos, d.meta), hi0 = Math.max(...pos, d.meta);
    const margen = Math.max((hi0 - lo0) * 0.06, 2);
    const min = lo0 - margen, max = hi0 + margen;
    const R = hazRegla({ min, max, marcas: [d.inicio, d.meta] }, [d.inicio, d.meta]);
    R.nodo.style.setProperty('--arriba', H + 'px');
    R.regla.style.cursor = 'default';
    const paso = pasoBonito(max - min, 10);
    for (let v = Math.ceil(min / paso) * paso; v <= max; v += paso) R.escala.append(el('span', { class: 'tic menor', style: { left: R.pc(v) + '%' } }));
    R.escala.append(el('div', { class: 'banderin', style: { left: R.pc(d.meta) + '%' } }, svg('0 0 40 64', BANDERIN)));
    caja.replaceChildren(R.nodo);
    const ancho = R.escala.clientWidth || 900;
    const X = (v) => (R.pc(v) / 100) * ancho;
    const maxSalto = Math.max(...pos.slice(1).map((p, i) => Math.abs(p - pos[i])), 1);
    let h = '', ultimo = null;
    for (let i = 1; i < pos.length; i++) {
      const a = X(pos[i - 1]), b = X(pos[i]), m = pos[i] - pos[i - 1];
      const dx = Math.abs(b - a);
      const alto = Math.min(30 + 130 * Math.sqrt(Math.abs(m) / maxSalto), H - 30, 26 + dx * 0.9);
      const yTop = H - alto;
      const [c] = color(m);
      const es = nuevo && i === pos.length - 1;
      h += `<path class="${m < 0 ? 'atras ' : ''}${es ? 'nuevo' : ''}" ${m < 0 ? '' : 'pathLength="1"'} style="stroke:${c === 'var(--s1)' ? '#d3a800' : c}" d="M${a} ${H} C ${a} ${yTop}, ${b} ${yTop}, ${b} ${H}"/>`;
      if (dx >= 30) h += `<text x="${(a + b) / 2}" y="${(H + 3 * yTop) / 4 - 8}" style="fill:${c === 'var(--s1)' ? '#8a6d00' : c}">${signo(m)}</text>`;
      if (es) ultimo = { a, b, yTop };
    }
    R.escala.append(svg(`0 0 ${ancho} ${H}`, h, { class: 'arcos', height: H, preserveAspectRatio: 'none' }));
    const rana = el('div', { class: 'rana', style: { left: R.pc(pos.at(-1)) + '%' } }, svg('0 0 54 48', RANA));
    R.escala.append(rana);
    if (ultimo && rana.animate && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const { a, b, yTop } = ultimo;
      const fr = [];
      for (let k = 0; k <= 12; k++) {
        const t = k / 12, u = 1 - t;
        const x = u * u * u * a + 3 * u * u * t * a + 3 * u * t * t * b + t * t * t * b;
        const y = u * u * u * H + 3 * u * u * t * yTop + 3 * u * t * t * yTop + t * t * t * H;
        const aplasta = k === 0 || k === 12 ? ' scale(1.15,.8)' : '';
        fr.push({ transform: `translate(${x - b}px, ${y - H}px)${aplasta}` });
      }
      rana.animate(fr, { duration: 420, easing: 'linear' });
    }
    const partes = [el('span', { text: num(d.inicio) })];
    for (let i = 1; i < pos.length; i++) {
      const m = pos[i] - pos[i - 1];
      const [c, canto, txt] = color(m);
      partes.push(el('span', { class: 'paso' + (m < 0 ? ' atras' : ''), style: m < 0 ? { color: canto, borderColor: canto } : { background: c, color: txt }, text: signo(m) }));
    }
    partes.push(el('span', { text: '= ' + num(pos.at(-1)) }));
    cuenta.replaceChildren(...partes, el('span', { class: 'sr', text: pos.at(-1) === d.meta ? '. Has llegado.' : `. Faltan ${d.meta - pos.at(-1)}.` }));
  }
  window.addEventListener('resize', () => pinta(false));
  requestAnimationFrame(() => pinta(false));

  function acabar() {
    if (hecho && !ctx.pizarra) return;
    hecho = true;
    botones.querySelectorAll('button').forEach((b) => (b.disabled = true));
    const n = pos.length - 1, o = optimo.length;
    const estrellas = n <= o ? 3 : n === o + 1 ? 2 : 1;
    const msg = n <= o ? `**${n} ${n === 1 ? 'salto' : 'saltos'}.** No se puede con menos.`
      : `Has llegado en ${n} saltos. Se podía en ${o}: ${agrupa(optimo)}.`;
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- generadores */
export function generar(spec) {
  const g = typeof spec.generar === 'object' ? spec.generar : spec;
  const d = structuredClone(spec);
  delete d.generar;
  if (d.modo === 'ordenar') {
    const vistos = new Set(), r = d.max - d.min;
    while (vistos.size < (g.cantidad ?? 5)) vistos.add(redondea(d.min + r * 0.03 + Math.random() * r * 0.94, g.redondeo ?? 1));
    d.tarjetas = [...vistos];
  } else if (d.modo === 'saltos') {
    const [a, b] = g.inicio ?? [10, 99];
    const [c, e] = g.distancia ?? [20, 150];
    d.inicio = azar(a, b);
    const dist = azar(c, e);
    d.meta = d.inicio + (g.haciaAtras && Math.random() < 0.5 && d.inicio - dist > 0 ? -dist : dist);
  } else {
    const r = d.max - d.min;
    d.valor = redondea(d.min + r * 0.04 + Math.random() * r * 0.92, g.redondeo ?? 1);
  }
  return d;
}

export function ronda(d, ctx) {
  if (d.modo === 'ordenar') return ordenar(d, ctx);
  if (d.modo === 'saltos') return saltar(d, ctx);
  return estimar(d, ctx);
}
