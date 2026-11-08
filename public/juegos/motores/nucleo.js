// Núcleo común de los motores: barra, rondas, pegatinas, corrección, sonido y pantalla final.
// Cada motor exporta { generar(spec), ronda(datos, ctx) }. ronda() pinta en ctx.escenario y,
// cuando el alumno comprueba, llama a ctx.fin(estrellas, mensaje).

import * as fx from './efectos.js';
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
  const reto = el('h2', { class: 'reto', 'aria-live': 'polite' });
  const pista = el('p', { class: 'pista' });
  const escenario = el('div', { class: 'escenario' });
  const acciones = el('div', { class: 'acciones' });
  const aviso = el('p', { class: 'aviso', role: 'status' });
  const correccion = el('div', { class: 'correccion', hidden: true });
  const zona = el('div', {}, reto, pista, escenario, acciones, aviso, correccion);
  const final = el('section', { class: 'final', hidden: true, 'aria-live': 'polite' });

  // barra de progreso: avanza por objetivos conseguidos, no por número de pantallas
  const relleno = el('span', { class: 'relleno' }, el('span', { class: 'punta-barra' }));
  const barra = el('div', { class: 'progreso', role: 'progressbar', 'aria-label': 'Progreso del taller', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' }, relleno);
  const nivelUI = el('span', { class: 'nivel', role: 'img' });
  const racha = el('span', { class: 'racha', hidden: true });
  const estado = el('div', { class: 'estado' }, barra, nivelUI, racha);

  // el asistente: de momento una bombilla con bocadillo; el personaje irá aquí
  const bocadillo = el('div', { class: 'bocadillo', role: 'status', 'aria-live': 'polite', hidden: true });
  const figura = el('div', { class: 'figura', 'aria-hidden': 'true' },
    svg('0 0 64 64', '<circle cx="32" cy="27" r="19" fill="var(--oro)" stroke="#000" stroke-width="3"/><path d="M24 44h16v8a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4z" fill="#c9cfca" stroke="#000" stroke-width="3"/><path d="M26 49h12" stroke="#000" stroke-width="2.5"/><path d="M27 30q5 6 10 0" fill="none" stroke="#000" stroke-width="3" stroke-linecap="round"/><circle cx="26" cy="23" r="2.6"/><circle cx="38" cy="23" r="2.6"/>', { width: 64, height: 64 }));
  const asistente = el('aside', { class: 'asistente', 'aria-label': 'Ayudante' }, bocadillo, figura);
  let callaT = null;
  const di = (texto, tipo = 'pista', ms = 0) => {
    clearTimeout(callaT);
    bocadillo.className = 'bocadillo ' + tipo;
    bocadillo.replaceChildren(marca(texto));
    bocadillo.hidden = false;
    bocadillo.classList.remove('entra'); void bocadillo.offsetWidth; bocadillo.classList.add('entra');
    figura.classList.remove('habla'); void figura.offsetWidth; figura.classList.add('habla');
    if (ms) callaT = setTimeout(() => (bocadillo.hidden = true), ms);
  };
  const calla = () => { clearTimeout(callaT); bocadillo.hidden = true; };
  bocadillo.addEventListener('click', calla);

  document.body.prepend(
    el('header', { class: 'barra-juego' },
      el('a', { class: 'volver', href: config.volver || '../../' },
        svg('0 0 24 24', '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', { width: 22, height: 22 }), 'Cajón maestro'),
      el('h1', { text: config.titulo }),
      el('div', { class: 'controles' }, el('div', { class: 'interruptor', role: 'group', 'aria-label': 'Modo' }, btnReto, btnPiz), btnSon),
      estado),
    el('main', { class: 'mesa-juego' }, config.subtitulo && el('p', { class: 'pista', style: { marginTop: '4px' }, text: config.subtitulo }), zona, final),
    asistente);

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
  let primeraPartida = true;

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
    if (chispa) setTimeout(() => fx.chispasEn(relleno.querySelector('.punta-barra'), 10, css('--acento')), 450);
  };
  const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim();

  let token = 0;
  // Juega un reto. Devuelve { estrellas, pistas, intento, reintentar }
  function jugar(datos, { n, intento, mio }) {
    return new Promise(async (resolver) => {
      if (zona.animate && (n > 0 || intento > 1)) await zona.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateX(-60px)', opacity: 0 }], { duration: 200, easing: 'ease-in' }).finished.catch(() => {});
      if (mio !== token) return;
      reto.replaceChildren(); pista.replaceChildren(); escenario.replaceChildren(); acciones.replaceChildren();
      aviso.textContent = ''; aviso.className = 'aviso'; correccion.hidden = true; correccion.replaceChildren();
      calla();
      if (intento === 1) {
        cartel.replaceChildren(...[el('b', { text: `Reto ${n + 1}` }), !adaptativo && el('span', { text: `de ${fijas().length}` })].filter(Boolean));
        cartel.classList.remove('sale'); void cartel.offsetWidth; cartel.classList.add('sale');
      }
      zona.classList.remove('zona-entra'); void zona.offsetWidth; zona.classList.add('zona-entra');
      let pistas = [], usadas = 0, btnPista = null;
      const darPista = () => {
        if (usadas >= pistas.length) return;
        const p = pistas[usadas++];
        di(typeof p === 'string' ? p : p.texto, 'pista');
        if (typeof p === 'object' && p.ver) try { p.ver(); } catch (e) { console.error(e); }
        suena('clic');
        if (btnPista) {
          btnPista.lastChild.textContent = usadas < pistas.length ? `Pista ${usadas + 1}` : 'No hay más pistas';
          btnPista.disabled = usadas >= pistas.length;
        }
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
          btnPista ? acciones.insertBefore(b, btnPista) : acciones.append(b); return b;
        },
        fin: (estrellas, mensaje) => {
          acciones.replaceChildren(); aviso.textContent = '';
          calla();
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
          correccion.hidden = false;
          if (!pizarra) {
            const sello = correccion.querySelector('.sello');
            suena('sello'); fx.vibra(estrellas ? 25 : [40, 60, 40]);
            correccion.querySelectorAll('.estrellas .si').forEach((s, k) => setTimeout(() => { suena('estrella'); fx.chispasEn(s, 8); }, 260 + k * 140));
            setTimeout(() => suena(estrellas === 3 ? 'bien' : estrellas >= 1 ? 'regular' : 'mal'), 300 + estrellas * 140);
            if (estrellas === 3) setTimeout(() => fx.confetiEn(sello, 70), 380);
            if (estrellas === 0) fx.temblor(escenario, 10);
            if (puedeReintentar) setTimeout(() => di(estrellas ? 'Casi. Mira la corrección y prueba otra vez: **te doy una pista** al empezar.' : 'No pasa nada. Mira dónde estaba y vuelve a intentarlo: **te ayudo un poco**.', 'animo', 6000), 900);
            else if (intento === 2 && estrellas >= 2) setTimeout(() => di('¿Ves? A la segunda ha salido.', 'bien', 3500), 900);
          }
          opciones[0].focus({ preventScroll: true });
          correccion.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        },
      };
      motor.ronda(datos, ctx);
      if (pistas.length) {
        btnPista = el('button', { type: 'button', class: 'tecla pista-btn', onclick: darPista },
          svg('0 0 24 24', '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" fill="var(--oro)" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>', { width: 22, height: 22 }),
          el('span', { text: 'Pista 1' }));
        acciones.append(btnPista);
        if (intento === 2) setTimeout(darPista, 650);
      }
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
    if (progreso > 0 && primeraPartida) setTimeout(() => di('Seguimos donde lo dejaste.', 'saludo', 3500), 1100);
    nivelUI.hidden = !adaptativo; racha.hidden = true;
    if (primeraPartida && config.saludo && !enPizarra) setTimeout(() => di(config.saludo, 'saludo', 6000), 1100);

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
      if (L > antes) { fx.bote(nivelUI, 8); setTimeout(() => di(L === TOP ? 'Este es **de los difíciles**.' : 'Sube un poco la dificultad.', 'bien', 2600), 300); }
      else if (L < antes) setTimeout(() => di('Vamos con uno **un poco más sencillo**.', 'animo', 2800), 300);
      else if (progreso >= 78 && L < objetivo && techo === 78) setTimeout(() => di('Para completar el taller hay que llegar a retos **un poco más difíciles**.', 'animo', 3500), 300);
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
    zona.hidden = true;
    const completo = progreso >= 100;
    const sinAyuda = historial.filter((h) => h.estrellas >= 2 && !h.ayuda).length;
    const conAyuda = historial.filter((h) => h.estrellas >= 2 && h.ayuda).length;
    const previo = leeRecord();
    if (!enPizarra && adaptativo && completo && (!previo?.retos || n < previo.retos)) try { localStorage.setItem(claveRecord, JSON.stringify({ retos: n })); } catch {}
    final.replaceChildren(...[
      el('h2', { text: enPizarra ? 'Fin de la pizarra' : !adaptativo ? 'Hoja terminada' : completo ? '¡Taller completado!' : 'Por hoy, suficiente' }),
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
        el('a', { class: 'tecla grande', href: config.volver || '../../', text: 'Volver al cajón' }))].filter((x) => x && x.nodeType));
    final.hidden = false;
    if (!enPizarra) {
      final.querySelectorAll('.hoja figure').forEach((f, k) => { f.style.animationDelay = k * 90 + 'ms'; setTimeout(() => suena('pon'), k * 90); });
      if (completo || !adaptativo) setTimeout(() => { suena('bien'); fx.confeti(innerWidth / 2, innerHeight * 0.35, 140); }, 300);
      setTimeout(() => di(completo ? 'Taller completado. **Bien pensado.**' : adaptativo ? 'Lo dejamos aquí. La próxima vez, seguimos.' : '¡Hecho!', 'bien', 6000), 700);
    }
  }
  partida();
}
