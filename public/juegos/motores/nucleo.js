// Núcleo común de los motores: barra, rondas, pegatinas, corrección, sonido y pantalla final.
// Cada motor exporta { generar(spec), ronda(datos, ctx) }. ronda() pinta en ctx.escenario y,
// cuando el alumno comprueba, llama a ctx.fin(estrellas, mensaje).

export const $ = (s, r = document) => r.querySelector(s);
const SVGNS = 'http://www.w3.org/2000/svg';

export function el(tag, attrs = {}, ...hijos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (k === 'html') n.innerHTML = v;
    else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') for (const [p, x] of Object.entries(v)) p.startsWith('--') ? n.style.setProperty(p, x) : (n.style[p] = x);
    else n.setAttribute(k, v === true ? '' : v);
  }
  for (const h of hijos.flat()) if (h != null && h !== false) n.append(h.nodeType ? h : String(h));
  return n;
}
export function svg(viewBox, html, attrs = {}) {
  const s = document.createElementNS(SVGNS, 'svg');
  s.setAttribute('viewBox', viewBox); s.setAttribute('aria-hidden', 'true');
  for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v);
  s.innerHTML = html;
  return s;
}

// Números como en el libro y en Innovamat: 4 717, 12 500, 3,25
export function num(v, decimales) {
  if (typeof v !== 'number' || !isFinite(v)) return String(v);
  const neg = v < 0;
  const txt = decimales == null ? String(Math.abs(v)) : Math.abs(v).toFixed(decimales);
  let [ent, dec] = txt.split('.');
  if (ent.length >= 4) ent = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (neg ? '−' : '') + ent + (dec ? ',' + dec : '');
}
export const azar = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
export const elige = (arr) => arr[Math.floor(Math.random() * arr.length)];
export function barajar(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
export function redondea(v, paso = 1) {
  const r = Math.round(v / paso) * paso;
  const d = (String(paso).split('.')[1] || '').length;
  return +r.toFixed(d);
}
export function marca(txt) {
  const n = document.createDocumentFragment();
  String(txt).split(/\*\*(.+?)\*\*/g).forEach((t, i) => n.append(i % 2 ? el('span', { class: 'marca', text: t }) : t));
  return n;
}

/* ---------- sonido: unos pitidos sintetizados, sin archivos ---------- */
let ac = null;
let sonidoOn = (() => { try { return localStorage.getItem('cajon-sonido') !== 'no'; } catch { return true; } })();
function nota(f, t, dur, tipo = 'sine', vol = 0.07, hasta) {
  const o = ac.createOscillator(), g = ac.createGain();
  o.type = tipo; o.frequency.setValueAtTime(f, t);
  if (hasta) o.frequency.exponentialRampToValueAtTime(hasta, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(ac.destination); o.start(t); o.stop(t + dur + 0.02);
}
export function suena(que) {
  if (!sonidoOn) return;
  try {
    ac ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.01;
    const s = {
      pon: () => nota(520, t, 0.08, 'triangle', 0.09, 780),
      quita: () => nota(500, t, 0.08, 'triangle', 0.06, 300),
      salto: () => nota(300, t, 0.2, 'sine', 0.08, 900),
      atras: () => nota(700, t, 0.2, 'sine', 0.07, 260),
      clic: () => nota(1400, t, 0.03, 'square', 0.025),
      sello: () => { nota(120, t, 0.12, 'square', 0.06, 60); },
      estrella: () => nota(1320, t, 0.12, 'triangle', 0.06, 1760),
      bien: () => [523, 659, 784, 1046].forEach((f, i) => nota(f, t + i * 0.08, 0.22, 'triangle', 0.07)),
      regular: () => [523, 659].forEach((f, i) => nota(f, t + i * 0.1, 0.2, 'triangle', 0.06)),
      mal: () => { nota(220, t, 0.18, 'sawtooth', 0.04, 160); nota(165, t + 0.16, 0.26, 'sawtooth', 0.04, 120); },
    }[que];
    s?.();
  } catch { /* sin audio: no pasa nada */ }
}

/* ---------- pegatinas y estrellas ---------- */
const COLOR = ['#c9cfca', '#d98c4a', '#b8c3cc', '#f6b81a']; // 0 nada, 1 bronce, 2 plata, 3 oro
export function pegatina(n) {
  const c = COLOR[n];
  const puntas = [];
  for (let i = 0; i < 24; i++) { const r = i % 2 ? 44 : 49; const a = (i / 24) * Math.PI * 2; puntas.push(`${50 + r * Math.cos(a)},${50 + r * Math.sin(a)}`); }
  let estrellas = '';
  const pos = n === 1 ? [[50, 52]] : n === 2 ? [[37, 52], [63, 52]] : n === 3 ? [[50, 36], [33, 62], [67, 62]] : [];
  for (const [x, y] of pos) estrellas += `<path transform="translate(${x} ${y}) scale(${n === 1 ? 1.5 : 1})" d="${estrellaD(13)}" fill="#fff" stroke="rgba(0,0,0,.35)" stroke-width="1.5"/>`;
  return svg('0 0 100 100', `<polygon points="${puntas.join(' ')}" fill="#fff"/><circle cx="50" cy="50" r="40" fill="${c}"/><circle cx="50" cy="50" r="40" fill="url(#brillo)" opacity=".5"/>${estrellas}${n === 0 ? '<path d="M36 50h28" stroke="#fff" stroke-width="7" stroke-linecap="round"/>' : ''}<defs><radialGradient id="brillo" cx=".32" cy=".28" r=".7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>`, { class: 'pegatina' });
}
function estrellaD(r) {
  let d = '';
  for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * 0.45 : r; const a = -Math.PI / 2 + (i * Math.PI) / 5; d += (i ? 'L' : 'M') + (rr * Math.cos(a)).toFixed(2) + ' ' + (rr * Math.sin(a)).toFixed(2); }
  return d + 'Z';
}
function estrellasNodo(n) {
  const p = el('p', { class: 'estrellas', role: 'img', 'aria-label': `${n} de 3 estrellas` });
  for (let i = 0; i < 3; i++) {
    p.append(svg('-20 -20 40 40', `<path d="${estrellaD(17)}" fill="${i < n ? 'var(--oro)' : 'rgba(0,0,0,.1)'}" stroke="${i < n ? '#a8740a' : 'none'}" stroke-width="1.5" stroke-linejoin="round"/>`, { class: i < n ? 'si' : '' }));
  }
  return p;
}
const SELLOS = ['Otra vez será', 'Por poco', '¡Muy bien!', '¡Perfecto!'];

/* ---------- arranque ---------- */
export async function arrancar(config, motor) {
  document.title = `${config.titulo} · Cajón maestro`;
  if (config.area) document.body.dataset.area = config.area;
  const pizarraInicial = new URLSearchParams(location.search).has('pizarra');

  const btnReto = el('button', { type: 'button', 'aria-pressed': String(!pizarraInicial), text: 'Reto' });
  const btnPiz = el('button', { type: 'button', 'aria-pressed': String(pizarraInicial), text: 'Pizarra' });
  const btnSon = el('button', { type: 'button', class: 'icono', 'aria-pressed': String(sonidoOn), 'aria-label': 'Sonido', title: 'Sonido' },
    svg('0 0 24 24', '<path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><g class="ondas" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 9.5a4 4 0 0 1 0 5"/><path d="M18.5 7a7.5 7.5 0 0 1 0 10"/></g><g class="cruz" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 9l5 6M21 9l-5 6"/></g>', { width: 24, height: 24 }));
  btnSon.onclick = () => {
    sonidoOn = !sonidoOn; btnSon.setAttribute('aria-pressed', String(sonidoOn));
    try { localStorage.setItem('cajon-sonido', sonidoOn ? 'si' : 'no'); } catch {}
    suena('clic');
  };
  const pegatinas = el('ol', { class: 'pegatinas', 'aria-label': 'Pegatinas de cada ronda' });
  const reto = el('h2', { class: 'reto', 'aria-live': 'polite' });
  const pista = el('p', { class: 'pista' });
  const escenario = el('div', { class: 'escenario' });
  const acciones = el('div', { class: 'acciones' });
  const aviso = el('p', { class: 'aviso', role: 'status' });
  const correccion = el('div', { class: 'correccion', hidden: true });
  const zona = el('div', {}, reto, pista, escenario, acciones, aviso, correccion);
  const final = el('section', { class: 'final', hidden: true, 'aria-live': 'polite' });

  document.body.prepend(
    el('header', { class: 'barra-juego' },
      el('a', { class: 'volver', href: config.volver || '../../' },
        svg('0 0 24 24', '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', { width: 22, height: 22 }), 'Cajón maestro'),
      el('h1', { text: config.titulo }),
      el('div', { class: 'controles' }, el('div', { class: 'interruptor', role: 'group', 'aria-label': 'Modo' }, btnReto, btnPiz), btnSon),
      pegatinas),
    el('main', { class: 'mesa-juego' }, config.subtitulo && el('p', { class: 'pista', style: { marginTop: '4px' }, text: config.subtitulo }), zona, final));

  let pizarra = pizarraInicial;
  document.body.classList.toggle('pizarra', pizarra);
  const ponerModo = (p) => {
    pizarra = p;
    btnReto.setAttribute('aria-pressed', String(!p)); btnPiz.setAttribute('aria-pressed', String(p));
    document.body.classList.toggle('pizarra', p);
    const u = new URL(location.href); p ? u.searchParams.set('pizarra', '') : u.searchParams.delete('pizarra');
    history.replaceState(null, '', u.toString().replace('pizarra=', 'pizarra'));
    partida();
  };
  btnReto.onclick = () => pizarra && ponerModo(false);
  btnPiz.onclick = () => pizarra || ponerModo(true);

  let token = 0;
  async function partida() {
    const mio = ++token;
    final.hidden = true; zona.hidden = false;
    const rondas = [];
    for (const r of config.rondas) for (let i = 0; i < (r.repetir || 1); i++) rondas.push(r.generar ? motor.generar(r) : structuredClone(r));
    const logros = [];
    const huecos = rondas.map((_, i) => el('li', { text: i + 1 }));
    const totalTxt = el('span', { class: 'total' });
    pegatinas.replaceChildren(...huecos, totalTxt);

    for (let i = 0; i < rondas.length; i++) {
      if (mio !== token) return;
      huecos.forEach((h, j) => h.classList.toggle('ahora', j === i));
      totalTxt.textContent = `Ronda ${i + 1} de ${rondas.length}`;
      reto.replaceChildren(); pista.replaceChildren(); escenario.replaceChildren(); acciones.replaceChildren();
      aviso.textContent = ''; aviso.className = 'aviso'; correccion.hidden = true; correccion.replaceChildren();
      const r = await new Promise((resolver) => {
        const ctx = {
          pizarra, escenario, acciones, datos: rondas[i], num, el, suena,
          reto: (t) => reto.replaceChildren(marca(t)),
          pista: (t) => pista.replaceChildren(marca(t)),
          aviso: (t, mal = false) => { aviso.textContent = t || ''; aviso.className = 'aviso' + (mal ? ' mal' : ''); },
          boton: (texto, fn, sec = false) => {
            const b = el('button', { type: 'button', class: 'tecla' + (sec ? '' : ' primaria grande'), text: texto, onclick: fn });
            acciones.append(b); return b;
          },
          fin: (estrellas, mensaje) => {
            acciones.replaceChildren(); aviso.textContent = '';
            const ultima = i + 1 === rondas.length;
            const sig = el('button', { type: 'button', class: 'tecla primaria grande', text: ultima ? 'Ver mis pegatinas' : 'Siguiente ronda' });
            sig.onclick = () => resolver({ estrellas: pizarra ? 0 : estrellas, mensaje });
            correccion.replaceChildren(
              el('div', { class: 'sello' + (estrellas === 0 ? ' gris' : ''), 'aria-hidden': 'true', text: SELLOS[estrellas] }),
              el('div', { class: 'texto' }, el('p', {}, marca(mensaje)), estrellasNodo(estrellas)),
              sig);
            correccion.hidden = false;
            if (!pizarra) {
              suena('sello');
              setTimeout(() => suena(estrellas === 3 ? 'bien' : estrellas >= 1 ? 'regular' : 'mal'), 160);
              const h = huecos[i];
              h.replaceChildren(pegatina(estrellas)); h.classList.add('puesta'); h.classList.remove('ahora');
              h.style.setProperty('--giro', (Math.random() * 30 - 15).toFixed(0) + 'deg');
              h.setAttribute('aria-label', `Ronda ${i + 1}: ${estrellas} estrellas`);
            }
            sig.focus({ preventScroll: true });
            correccion.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          },
        };
        motor.ronda(rondas[i], ctx);
      });
      if (mio !== token) return;
      logros.push(r);
    }
    const total = logros.reduce((a, b) => a + b.estrellas, 0);
    const posibles = rondas.length * 3;
    zona.hidden = true;
    huecos.forEach((h) => h.classList.remove('ahora'));
    final.replaceChildren(
      el('h2', { text: pizarra ? 'Fin de la pizarra' : total === posibles ? '¡Hoja completa!' : total >= posibles * 0.7 ? 'Muy buena hoja' : total >= posibles * 0.4 ? 'Vas bien' : 'Mañana, otra' }),
      !pizarra && el('p', { class: 'total' }, el('strong', { text: total }), ` estrellas de ${posibles}.`),
      !pizarra && el('div', { class: 'hoja' }, logros.map((l, i) => el('figure', {}, pegatina(l.estrellas), el('figcaption', { text: `Ronda ${i + 1}` })))),
      config.observa && el('div', { class: 'posit' }, el('strong', { text: '¿Qué observas?' }), marca(config.observa)),
      el('div', { class: 'acciones' },
        el('button', { type: 'button', class: 'tecla primaria grande', text: 'Jugar otra partida', onclick: partida }),
        el('a', { class: 'tecla grande', href: config.volver || '../../', text: 'Volver al cajón' })));
    final.hidden = false;
    if (!pizarra && total >= posibles * 0.7) suena('bien');
  }
  partida();
}
