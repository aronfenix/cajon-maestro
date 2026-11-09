// Núcleo común de los motores: barra, rondas, pegatinas, corrección, sonido y pantalla final.
// Cada motor exporta { generar(spec), ronda(datos, ctx) }. ronda() pinta en ctx.escenario y,
// cuando el alumno comprueba, llama a ctx.fin(estrellas, mensaje).

import * as fx from './efectos.js';
import { dibuja, POSES } from './personaje.js';
import { VOCES, POSE_DE, una } from './voces.js';
import { montaEscena, vineta, montaTeclado } from './escena.js';
import { portada } from './portada.js';
import { DIBUJOS, pegatina as pegatinaAlbum } from './pegatinas.js';
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

// Números como en el libro: 4 717, 12 500, 3,25
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
let ruidoBuf = null;
// golpe de ruido filtrado: papel, cartón, tinta…
function ruido(t, dur, { f = 1200, q = 0.8, tipo = 'lowpass', vol = 0.1 } = {}) {
  if (!ruidoBuf) { ruidoBuf = ac.createBuffer(1, ac.sampleRate * 0.5, ac.sampleRate); const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const src = ac.createBufferSource(), fil = ac.createBiquadFilter(), g = ac.createGain();
  src.buffer = ruidoBuf; fil.type = tipo; fil.frequency.value = f; fil.Q.value = q;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(fil).connect(g).connect(ac.destination); src.start(t, Math.random() * 0.3); src.stop(t + dur + 0.02);
}
const ESCALA = [523, 587, 659, 698, 784, 880, 988, 1046, 1175, 1318];
export function suena(que, k = 0) {
  if (!sonidoOn) return;
  try {
    ac ??= new (window.AudioContext || window.webkitAudioContext)();
    if (ac.state === 'suspended') ac.resume();
    const t = ac.currentTime + 0.01;
    const s = {
      coge: () => { ruido(t, 0.09, { f: 2600, q: 1.2, tipo: 'bandpass', vol: 0.12 }); nota(330, t, 0.07, 'sine', 0.05, 520); },
      pon: () => { nota(190, t, 0.1, 'sine', 0.16, 110); ruido(t, 0.05, { f: 900, vol: 0.12 }); },
      quita: () => { ruido(t, 0.12, { f: 1800, q: 0.7, tipo: 'bandpass', vol: 0.08 }); nota(420, t, 0.09, 'triangle', 0.04, 260); },
      salto: () => nota(300, t, 0.2, 'sine', 0.08, 900),
      atras: () => nota(700, t, 0.2, 'sine', 0.07, 260),
      clic: () => { nota(1500, t, 0.025, 'square', 0.02); ruido(t, 0.02, { f: 4000, tipo: 'highpass', vol: 0.04 }); },
      sello: () => { ruido(t, 0.16, { f: 380, vol: 0.32 }); nota(95, t, 0.18, 'sine', 0.22, 48); },
      selloBien: () => { ruido(t, 0.12, { f: 420, vol: 0.28 }); nota(100, t, 0.14, 'sine', 0.2, 55); nota(ESCALA[k % ESCALA.length], t + 0.03, 0.22, 'triangle', 0.07); nota(ESCALA[k % ESCALA.length] * 2, t + 0.03, 0.12, 'sine', 0.025); },
      selloMal: () => { ruido(t, 0.14, { f: 300, vol: 0.3 }); nota(90, t, 0.16, 'sine', 0.2, 45); nota(196, t + 0.04, 0.22, 'sawtooth', 0.03, 150); },
      estrella: () => nota(1320, t, 0.12, 'triangle', 0.06, 1760),
      bien: () => [523, 659, 784, 1046].forEach((f, i) => { nota(f, t + i * 0.08, 0.24, 'triangle', 0.07); nota(f * 2, t + i * 0.08, 0.1, 'sine', 0.02); }),
      regular: () => [523, 659].forEach((f, i) => nota(f, t + i * 0.1, 0.2, 'triangle', 0.06)),
      mal: () => { nota(220, t, 0.18, 'sawtooth', 0.035, 160); nota(165, t + 0.16, 0.26, 'sawtooth', 0.035, 120); },
      sube: () => { [392, 523, 659, 784, 1046].forEach((f, i) => { nota(f, t + i * 0.07, 0.3, 'triangle', 0.07); nota(f * 1.5, t + i * 0.07 + 0.02, 0.18, 'sine', 0.02); }); ruido(t + 0.36, 0.5, { f: 6000, tipo: 'highpass', vol: 0.05 }); },
      cremallera: () => { for (let i = 0; i < 14; i++) ruido(t + i * 0.018, 0.02, { f: 3000 + i * 120, q: 2, tipo: 'bandpass', vol: 0.06 }); },
    }[que];
    s?.();
  } catch { /* sin audio: no pasa nada */ }
}
fx.ponSonido(suena);

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
  document.body.classList.add('juego');
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
  const reto = el('h2', { class: 'reto', 'aria-live': 'polite' });
  const pista = el('p', { class: 'pista' });
  const escenario = el('div', { class: 'escenario' });
  const acciones = el('div', { class: 'acciones' });
  const aviso = el('p', { class: 'aviso', role: 'status' });
  const correccion = el('div', { class: 'correccion', hidden: true });
  const zona = el('div', { class: 'zona' }, reto, pista, escenario, acciones, aviso, correccion);
  const final = el('section', { class: 'final', hidden: true, 'aria-live': 'polite' });

  // barra de progreso: avanza por objetivos conseguidos, no por número de pantallas
  const relleno = el('span', { class: 'relleno' }, el('span', { class: 'punta-barra' }));
  const barra = el('div', { class: 'progreso', role: 'progressbar', 'aria-label': 'Progreso del taller', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' }, relleno);
  const nivelUI = el('span', { class: 'nivel', role: 'img' });
  const racha = el('span', { class: 'racha', hidden: true });
  const estado = el('div', { class: 'estado' }, barra, nivelUI, racha);

  // el ayudante: uno de los tres personajes, con poses del esqueleto (se cambiará por sus dibujos definitivos)
  const quien = VOCES[config.personaje] ? config.personaje : 'goma';
  const voz = VOCES[quien];
  const bocadillo = el('div', { class: 'bocadillo', role: 'status', 'aria-live': 'polite', hidden: true });
  const figura = el('div', { class: 'figura ' + quien, 'aria-hidden': 'true', title: voz.nombre });
  let poseT = null;
  const posa = (pose = 'quieto', ms = 0) => {
    figura.innerHTML = dibuja(quien, POSES[pose] || POSES.quieto);
    clearTimeout(poseT);
    if (ms) poseT = setTimeout(() => posa('quieto'), ms);
  };
  posa('quieto');
  // ojos vivos: siguen al dedo (y a la pieza que se arrastra) y parpadean de vez en cuando
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    let mx = innerWidth / 2, my = innerHeight / 2, pendiente = false;
    const mira = () => {
      pendiente = false;
      const r = figura.getBoundingClientRect(); if (!r.width) return;
      const dx = mx - (r.left + r.width / 2), dy = my - (r.top + r.height * 0.35), d = Math.hypot(dx, dy) || 1, k = Math.min(1, d / 260) * 4.2;
      figura.querySelectorAll('.pupila').forEach((p) => (p.style.transform = `translate(${((dx / d) * k).toFixed(2)}px, ${((dy / d) * k).toFixed(2)}px)`));
    };
    addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; if (!pendiente) { pendiente = true; requestAnimationFrame(mira); } }, { passive: true });
    new MutationObserver(() => requestAnimationFrame(mira)).observe(figura, { childList: true });
    const parpadea = () => { figura.classList.remove('parpadea'); void figura.offsetWidth; figura.classList.add('parpadea'); setTimeout(parpadea, 2600 + Math.random() * 3800); };
    setTimeout(parpadea, 2000);
  }
  let ultimaFrase = null;
  figura.addEventListener('click', () => { if (ultimaFrase) di(...ultimaFrase); else posa(una(['celebra', 'asombro', 'piensa']), 1200); suena('clic'); });
  // botón de ayuda: siempre en el mismo sitio, pegado al personaje
  const puntos = el('span', { class: 'puntos-ayuda', 'aria-hidden': 'true' });
  const btnAyuda = el('button', { type: 'button', class: 'boton-ayuda', 'aria-label': 'Pedir una pista', title: 'Pedir una pista', disabled: true }, el('b', { text: '?' }), puntos);
  let pedirPista = null;
  btnAyuda.onclick = () => pedirPista?.();
  const pintaAyuda = (quedan, total) => {
    puntos.replaceChildren(...Array.from({ length: total }, (_, k) => el('i', { class: k < quedan ? 'on' : '' })));
    btnAyuda.disabled = !quedan;
    btnAyuda.setAttribute('aria-label', quedan ? `Pedir una pista (quedan ${quedan})` : 'No quedan pistas');
  };
  const asistente = el('aside', { class: 'asistente', 'aria-label': 'Ayudante' }, bocadillo, el('div', { class: 'pie-asistente' }, btnAyuda, figura));
  let callaT = null;
  const di = (texto, tipo = 'pista', ms = 0) => {
    clearTimeout(callaT);
    ultimaFrase = [texto, tipo, ms];
    bocadillo.className = 'bocadillo ' + tipo;
    bocadillo.replaceChildren(marca(texto));
    bocadillo.hidden = false;
    bocadillo.classList.remove('entra'); void bocadillo.offsetWidth; bocadillo.classList.add('entra');
    figura.classList.remove('habla'); void figura.offsetWidth; figura.classList.add('habla');
    if (ms) callaT = setTimeout(() => (bocadillo.hidden = true), ms);
    posa(POSE_DE[tipo] || 'quieto', Math.max(ms || 0, 2600));
  };
  const dice = (clave, tipo, ms) => di(una(voz[clave]), tipo, ms);
  const calla = () => { clearTimeout(callaT); bocadillo.hidden = true; };
  bocadillo.addEventListener('click', calla);
  // el bocadillo se aparta en cuanto el alumno se pone a jugar (salvo las pistas, que sí quiere leer)
  addEventListener('pointerdown', (e) => { if (bocadillo.hidden || e.target.closest('.asistente') || bocadillo.classList.contains('pista')) return; setTimeout(calla, 250); }, true);

  document.body.prepend(
    el('header', { class: 'barra-juego' },
      el('a', { class: 'volver con-texto', href: config.volver || '../../', title: 'Volver al menú' },
        svg('0 0 24 24', '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>', { width: 22, height: 22 }), el('span', { text: 'Menú' })),
      el('h1', { text: config.titulo }),
      el('div', { class: 'controles' }, el('div', { class: 'interruptor', role: 'group', 'aria-label': 'Modo' }, btnReto, btnPiz), btnSon),
      estado),
    el('main', { class: 'mesa-juego' }, config.subtitulo && el('p', { class: 'pista', style: { marginTop: '4px' }, text: config.subtitulo }), zona, final),
    asistente);

  const escenaViva = montaEscena(config.escena || 'cajon', { reacciona: (que) => { if (que === 'mano') { posa('asombro'); di(una(['¡Quietos todos! ¡La Mano!', 'Shhh… que viene el profe.', 'Nadie se mueve.']), 'animo', 4000); } else posa('quieto'); } });
  montaTeclado();
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

  const cartel = el('div', { class: 'cartel', 'aria-hidden': 'true' });
  document.body.append(cartel);
  const claveRecord = 'cajon-taller:' + location.pathname;
  const leeRecord = () => { try { return JSON.parse(localStorage.getItem(claveRecord)) || null; } catch { return null; } };
  let primeraPartida = true, fallosSeguidos = 0;

  const adaptativo = Array.isArray(config.niveles);
  const NIVELES = adaptativo ? config.niveles : null;
  const TOP = adaptativo ? NIVELES.length - 1 : 0;
  const objetivo = config.nivelObjetivo ?? Math.ceil(TOP / 2); // dificultad mínima para poder completar
  const fijas = () => { const out = []; for (const r of config.rondas) for (let i = 0; i < (r.repetir || 1); i++) out.push(r); return out; };
  const crea = (spec) => (spec.generar ? motor.generar(spec) : structuredClone(spec.variantes ? spec.variantes[Math.floor(Math.random() * spec.variantes.length)] : spec));

  const pintaNivel = (L, total) => {
    nivelUI.replaceChildren(...Array.from({ length: total }, (_, k) => el('i', { class: k <= L ? 'on' : '', style: { height: 6 + (k * 14) / Math.max(1, total - 1) + 'px' } })));
    nivelUI.setAttribute('aria-label', `Dificultad ${L + 1} de ${total}`);
    nivelUI.title = `Dificultad ${L + 1} de ${total}`;
  };
  const pintaBarra = (p, chispa) => {
    relleno.style.width = Math.max(3, p) + '%';
    barra.setAttribute('aria-valuenow', String(Math.round(p)));
    if (chispa) { barra.classList.remove('avanza'); void barra.offsetWidth; barra.classList.add('avanza'); setTimeout(() => fx.chispasEn(relleno.querySelector('.punta-barra'), 10, css('--acento')), 450); }
  };
  const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim();
  // subir de nivel: una placa grande con los escalones, que luego vuela a su sitio en la cabecera
  const subeNivel = async (L, total) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const barras = el('div', { class: 'escalones' }, Array.from({ length: total }, (_, k) => el('i', { class: k < L ? 'on' : k === L ? 'nuevo' : '', style: { height: 14 + (k * 46) / Math.max(1, total - 1) + 'px' } })));
    const placa = el('div', { class: 'placa-nivel', role: 'status' }, el('small', { text: '¡Subes de nivel!' }), el('b', { text: `Nivel ${L + 1}` }), barras);
    document.body.append(placa);
    suena('sube'); fx.vibra(30);
    const { gsap } = await import('./vendor/gsap.js');
    const q = nivelUI.getBoundingClientRect(), r = placa.getBoundingClientRect();
    await gsap.timeline()
      .from(placa, { scale: 0.2, rotation: -20, opacity: 0, duration: 0.5, ease: 'back.out(2)' })
      .from(placa.querySelector('.nuevo'), { scaleY: 0, transformOrigin: '50% 100%', duration: 0.45, ease: 'elastic.out(1.1,0.4)' }, '-=0.1')
      .add(() => fx.chispasEn(placa.querySelector('.nuevo'), 14, '#ffc531'))
      .to(placa, { x: q.left + q.width / 2 - (r.left + r.width / 2), y: q.top + q.height / 2 - (r.top + r.height / 2), scale: 0.15, opacity: 0.2, duration: 0.5, ease: 'power3.in' }, '+=0.55')
      .then();
    placa.remove();
  };

  let token = 0;
  // Juega un reto. Devuelve { estrellas, pistas, intento, reintentar }
  function jugar(datos, { n, intento, mio }) {
    return new Promise(async (resolver) => {
      if (zona.animate && (n > 0 || intento > 1)) await zona.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-60px)', opacity: 0 }], { duration: 200, easing: 'ease-in' }).finished.catch(() => {});
      if (mio !== token) return;
      reto.replaceChildren(); pista.replaceChildren(); escenario.replaceChildren(); acciones.replaceChildren();
      aviso.textContent = ''; aviso.className = 'aviso'; correccion.hidden = true; correccion.replaceChildren(); document.body.classList.remove('corrigiendo');
      calla();
      if (intento === 1) {
        cartel.replaceChildren(...[el('b', { text: `Reto ${n + 1}` }), !adaptativo && el('span', { text: `de ${fijas().length}` })].filter(Boolean));
        cartel.classList.remove('sale'); void cartel.offsetWidth; cartel.classList.add('sale');
      }
      zona.classList.remove('zona-entra'); void zona.offsetWidth; zona.classList.add('zona-entra');
      let pistas = [], usadas = 0;
      const darPista = () => {
        if (usadas >= pistas.length) return;
        const p = pistas[usadas++];
        di(typeof p === 'string' ? p : p.texto, 'pista', 12000);
        if (typeof p === 'object' && p.ver) try { p.ver(); } catch (e) { console.error(e); }
        suena('clic');
        pintaAyuda(pistas.length - usadas, pistas.length);
        fx.bote(btnAyuda, 6);
      };
      const ctx = {
        pizarra, escenario, acciones, datos, num, el, suena, fx, ronda: n, intento, primera: n === 0 && intento === 1 && primeraPartida,
        reto: (t) => reto.replaceChildren(marca(t)),
        pista: (t) => pista.replaceChildren(marca(t)),
        aviso: (t, mal = false) => { aviso.textContent = t || ''; aviso.className = 'aviso' + (mal ? ' mal' : ''); },
        di,
        pistas: (lista) => { pistas = lista.filter(Boolean); },
        boton: (texto, fn, sec = false) => {
          const b = el('button', { type: 'button', class: 'tecla' + (sec ? '' : ' primaria grande'), text: texto, onclick: fn });
          acciones.append(b); return b;
        },
        fin: (estrellas, mensaje) => {
          acciones.replaceChildren(); aviso.textContent = '';
          calla();
          pedirPista = null; pintaAyuda(0, pistas.length || 3);
          fallosSeguidos = estrellas < 2 ? fallosSeguidos + 1 : 0;
          const opciones = [];
          const puedeReintentar = !pizarra && intento === 1 && estrellas < 2;
          if (puedeReintentar) {
            opciones.push(el('button', { type: 'button', class: 'tecla primaria grande', text: 'Volver a intentarlo', onclick: () => resolver({ estrellas, pistas: usadas, intento, reintentar: true }) }));
            opciones.push(el('button', { type: 'button', class: 'tecla', text: 'Pasar al siguiente', onclick: () => resolver({ estrellas, pistas: usadas, intento }) }));
          } else opciones.push(el('button', { type: 'button', class: 'tecla primaria grande', text: 'Siguiente', onclick: () => resolver({ estrellas, pistas: usadas, intento }) }));
          correccion.replaceChildren(
            el('div', { class: 'sello' + (estrellas === 0 ? ' gris' : ''), 'aria-hidden': 'true', text: SELLOS[estrellas] }),
            el('div', { class: 'texto' }, el('p', {}, marca(mensaje)), estrellasNodo(estrellas)),
            el('div', { class: 'opciones' }, opciones));
          correccion.hidden = false; document.body.classList.add('corrigiendo');
          if (!pizarra) {
            const sello = correccion.querySelector('.sello');
            suena('sello'); fx.vibra(estrellas ? 25 : [40, 60, 40]);
            correccion.querySelectorAll('.estrellas .si').forEach((s, k) => setTimeout(() => { suena('estrella'); fx.chispasEn(s, 8); }, 260 + k * 140));
            setTimeout(() => suena(estrellas === 3 ? 'bien' : estrellas >= 1 ? 'regular' : 'mal'), 300 + estrellas * 140);
            if (estrellas === 3) setTimeout(() => fx.celebra(quien, sello), 380);
            if (estrellas === 0) fx.temblor(escenario, 10);
            if (puedeReintentar && fallosSeguidos >= 2) setTimeout(() => di(una(voz.fallo) + ' ¿Te echo una mano? Al repetir te doy una pista, y luego toca la **?** cuando quieras.', 'animo', 7000), 900);
            else if (puedeReintentar) setTimeout(() => di(una(voz[estrellas ? 'casi' : 'fallo']) + ' Si lo repites, **te doy una pista** al empezar.', 'animo', 6000), 900);
            else if (intento === 2 && estrellas >= 2) setTimeout(() => dice('segunda', 'bien', 3500), 900);
            else if (estrellas === 3 && Math.random() < 0.6) setTimeout(() => dice('perfecto', 'perfecto', 3000), 900);
            else if (estrellas === 2 && Math.random() < 0.5) setTimeout(() => dice('bien', 'bien', 3000), 900);
          }
          opciones[0].focus({ preventScroll: true });
          correccion.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        },
      };
      try { motor.ronda(datos, ctx); } catch (e) { console.error(e); aviso.textContent = 'Este reto tiene un error: ' + e.message; }
      pedirPista = pistas.length ? darPista : null;
      pintaAyuda(pistas.length, pistas.length || 3);
      if (pistas.length && intento === 2) setTimeout(darPista, 650);
    });
  }

  async function partida() {
    const mio = ++token;
    final.hidden = true; zona.hidden = false;
    const enPizarra = pizarra;
    const secuencia = !adaptativo ? fijas() : enPizarra ? NIVELES : null; // en pizarra, los niveles en orden
    let L = adaptativo ? Math.min(config.nivelInicial ?? 0, TOP) : 0;
    let progreso = 0, n = 0, seguidas = 0, maxL = L;
    const claveProg = 'cajon-progreso:' + location.pathname;
    if (adaptativo && !enPizarra) try { const g = JSON.parse(localStorage.getItem(claveProg)); if (g && g.progreso < 100) { progreso = g.progreso; L = Math.min(g.nivel, TOP); maxL = L; } } catch {}
    const guarda = () => { try { progreso >= 100 ? localStorage.removeItem(claveProg) : localStorage.setItem(claveProg, JSON.stringify({ progreso, nivel: L })); } catch {} };
    const maximo = config.maximo ?? 24;
    const historial = [];
    pintaBarra(progreso); pintaNivel(L, adaptativo ? TOP + 1 : 1);
    if (progreso > 0 && primeraPartida) setTimeout(() => di('Seguimos donde lo dejaste.', 'saludo', 3500), 8500);
    nivelUI.hidden = !adaptativo; racha.hidden = true;
    if (primeraPartida && !enPizarra) setTimeout(() => di(una(voz.hola) + (config.saludo ? ' ' + config.saludo : ''), 'saludo', 7000), 1100);

    while (mio === token) {
      if (secuencia ? n >= secuencia.length : progreso >= 100 || n >= maximo) break;
      const spec = secuencia ? secuencia[n] : NIVELES[L];
      const datos = crea(spec);
      let r = await jugar(datos, { n, intento: 1, mio });
      if (mio !== token) return;
      if (r.reintentar) { r = await jugar(datos, { n, intento: 2, mio }); if (mio !== token) return; }
      const ayuda = r.pistas > 0 || r.intento === 2;
      historial.push({ nivel: L, estrellas: r.estrellas, ayuda });
      n++;
      if (secuencia) { progreso = (n / secuencia.length) * 100; pintaBarra(progreso, true); continue; }
      // adaptación: lo que cuenta es el objetivo, no el número de pantallas
      let gana = (r.estrellas === 3 ? 1 : r.estrellas === 2 ? 0.6 : 0) * (ayuda ? 0.6 : 1);
      let inc = gana * (8 + (24 * L) / Math.max(1, TOP));
      seguidas = r.estrellas === 3 && !ayuda ? seguidas + 1 : 0;
      if (seguidas >= 3 && inc) inc += 4;
      const techo = L >= objetivo ? 100 : 78;
      progreso = Math.max(progreso, Math.min(techo, progreso + inc));
      const antes = L;
      if (r.estrellas === 3 && !ayuda) L = Math.min(TOP, L + 1);
      else if (r.estrellas <= 1) L = Math.max(0, L - 1);
      maxL = Math.max(maxL, L);
      pintaBarra(progreso, inc > 0);
      pintaNivel(L, TOP + 1);
      if (!enPizarra) guarda();
      if (L > antes) { await subeNivel(L, TOP + 1); fx.bote(nivelUI, 8); setTimeout(() => dice(L === TOP ? 'top' : 'sube', 'sube', 2600), 100); }
      else if (L < antes) setTimeout(() => dice('baja', 'baja', 2800), 300);
      else if (progreso >= 78 && L < objetivo && techo === 78) setTimeout(() => dice('techo', 'animo', 3500), 300);
      else if (seguidas === 3 || seguidas === 6) setTimeout(() => dice('racha', 'perfecto', 2800), 300);
      if (seguidas >= 2) {
        racha.hidden = false;
        racha.replaceChildren(svg('0 0 24 24', '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 0-3 0-5 1-8z" fill="#ff7a1a" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 13c1 2 3 3 3 5a3 3 0 0 1-6 0c0-1 1-2 1-3 1 1 2 0 2-2z" fill="#ffd23f"/>', { width: 22, height: 22 }), `${seguidas} seguidos`);
        fx.bote(racha, 12);
      } else racha.hidden = true;
      await fx.espera(200);
    }
    if (mio !== token) return;

    // final
    calla();
    primeraPartida = false;
    zona.hidden = true; document.body.classList.remove('corrigiendo');
    const completo = progreso >= 100;
    const sinAyuda = historial.filter((h) => h.estrellas >= 2 && !h.ayuda).length;
    const conAyuda = historial.filter((h) => h.estrellas >= 2 && h.ayuda).length;
    const previo = leeRecord();
    if (!enPizarra && adaptativo && completo && (!previo?.retos || n < previo.retos)) try { localStorage.setItem(claveRecord, JSON.stringify({ retos: n })); } catch {}
    final.replaceChildren(...[
      el('h2', { text: enPizarra ? 'Fin de la pizarra' : !adaptativo ? (config.textoFinal ?? 'Hoja terminada') : completo ? '¡Taller completado!' : 'Por hoy, suficiente' }),
      !enPizarra && el('ul', { class: 'resumen' },
        el('li', {}, el('strong', { text: n }), ' retos'),
        el('li', {}, el('strong', { text: sinAyuda }), ' bien a la primera y sin pistas'),
        el('li', {}, el('strong', { text: conAyuda }), ' bien con ayuda'),
        adaptativo && el('li', {}, 'Dificultad más alta: ', el('strong', { text: `${maxL + 1} de ${TOP + 1}` }))),
      !enPizarra && adaptativo && completo && previo?.retos && el('p', { class: 'total' }, n < previo.retos ? el('span', { class: 'record', text: `¡Nuevo récord en esta tablet: ${n} retos!` }) : el('span', { class: 'record viejo', text: `Tu récord en esta tablet: ${previo.retos} retos` })),
      !enPizarra && !completo && adaptativo && el('p', { class: 'total', text: 'La barra se queda guardada en esta tablet: la próxima vez seguirás desde aquí.' }),
      !enPizarra && el('div', { class: 'hoja' }, historial.map((h, i) => el('figure', {}, pegatina(h.estrellas), el('figcaption', {}, String(i + 1), h.ayuda && el('small', { text: 'con ayuda' }))))),
      config.observa && el('div', { class: 'posit' }, el('strong', { text: '¿Qué observas?' }), marca(config.observa)),
      el('div', { class: 'acciones' },
        el('button', { type: 'button', class: 'tecla primaria grande', text: !adaptativo || completo || enPizarra ? 'Empezar otra vez' : 'Seguir', onclick: partida }),
        el('a', { class: 'tecla grande', href: config.volver || '../../', text: 'Volver al menú' }))].filter((x) => x && x.nodeType));
    final.hidden = false;
    if (!enPizarra) {
      final.querySelectorAll('.hoja figure').forEach((f, k) => { f.style.animationDelay = k * 90 + 'ms'; setTimeout(() => suena('pon'), k * 90); });
      if (completo || !adaptativo) {
        let yaLaTenia = false; try { yaLaTenia = !!localStorage.getItem('cajon-hecho:' + location.pathname); } catch {}
        try { localStorage.setItem('cajon-hecho:' + location.pathname, new Date().toISOString().slice(0, 10)); } catch {}
        // la pegatina del álbum de la aventura: se ve aquí y luego vuela al álbum en el mapa
        const slug = location.pathname.split('/').filter(Boolean).pop();
        if (DIBUJOS[slug]) {
          const premio = el('div', { class: 'premio-pegatina' }, pegatinaAlbum(slug), el('div', {}, el('b', { text: yaLaTenia ? (config.volver?.includes('feria') ? 'Tu premio de esta caseta' : 'Tu pegatina de este juego') : config.volver?.includes('feria') ? '¡Premio nuevo de la feria!' : '¡Pegatina nueva para tu álbum!' }), el('small', { text: config.volver?.includes('limpieza') ? 'La verás en el álbum del mapa.' : config.volver?.includes('feria') ? 'La verás en la estantería de premios del mapa.' : 'Ya es tuya.' })));
          final.querySelector('h2').after(premio);
          if (!matchMedia('(prefers-reduced-motion: reduce)').matches) premio.querySelector('.pegatina-album').animate([{ transform: 'scale(3) rotate(-50deg)', opacity: 0 }, { transform: 'scale(.9) rotate(8deg)', opacity: 1, offset: 0.7 }, { transform: 'scale(1) rotate(0)' }], { duration: 650, delay: 400, easing: 'cubic-bezier(.3,1.4,.5,1)', fill: 'both' });
          setTimeout(() => suena('sello'), 850);
        }
        setTimeout(() => { suena('bien'); fx.gomets(34); }, 300);
      }
      setTimeout(() => dice(completo || !adaptativo ? 'finalBien' : 'finalCorto', 'perfecto', 6000), 700);
    }
  }
  const qs = new URLSearchParams(location.search);
  if (!qs.has('sinhistoria') && !qs.has('sinportada')) {
    escenaViva.pausa();
    document.body.classList.add('en-portada');
    let prog = 0; try { prog = JSON.parse(localStorage.getItem('cajon-progreso:' + location.pathname))?.progreso || 0; } catch {}
    await portada(config, { dibuja, POSES, quien, progreso: prog, record: leeRecord()?.retos, sonar: suena, frase: una(voz.hola), volver: config.volver || '../../' });
    document.body.classList.remove('en-portada');
    // la historia, solo la primera vez en esta tablet
    const claveHist = 'cajon-historia:' + location.pathname;
    let vista = false; try { vista = !!localStorage.getItem(claveHist); } catch {}
    if (config.historia?.length && !pizarra && !vista) {
      await vineta(config.historia, dibuja, POSES, config.titulo);
      try { localStorage.setItem(claveHist, '1'); } catch {}
    }
    escenaViva.sigue();
  }
  partida();
}
