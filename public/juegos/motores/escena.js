// Escenarios con vida, viñetas de historia y teclado en pantalla.
// Los escenarios son datos: cada bloque futuro puede añadir los suyos aquí sin tocar los juegos.
const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const h = (tag, cls, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = html; return n; };

/* ---------------------------------------------------------------- fondos */
const FONDOS = {
  // el estuche de cremallera: tela rosa, cremallera turquesa, lápices en sus gomas
  estuche: `
    <defs>
      <pattern id="tela" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="#ffc9df"/><path d="M0 7h14" stroke="#ffb8d4" stroke-width="3"/></pattern>
      <pattern id="dientes" width="22" height="26" patternUnits="userSpaceOnUse"><rect x="3" y="0" width="16" height="12" rx="3" fill="#0e8f86"/><rect x="14" y="13" width="16" height="12" rx="3" fill="#0e8f86"/><rect x="-8" y="13" width="16" height="12" rx="3" fill="#0e8f86"/></pattern>
    </defs>
    <rect width="1600" height="1000" fill="url(#tela)"/>
    <rect y="0" width="1600" height="70" fill="#1fb5a9"/><rect y="22" width="1600" height="26" fill="url(#dientes)"/>
    <path d="M30 100 H1570 V960 H30Z" fill="none" stroke="#ff8fbd" stroke-width="4" stroke-dasharray="14 12"/>
    <g opacity=".9">
      <rect x="1500" y="180" width="34" height="520" rx="6" fill="#ffd23f" stroke="#000" stroke-width="4"/><path d="M1500 180 L1517 120 L1534 180Z" fill="#f6e0b5" stroke="#000" stroke-width="4"/><path d="M1511 140 L1517 120 L1523 140Z" fill="#000"/>
      <rect x="1546" y="260" width="34" height="480" rx="6" fill="#2f6be0" stroke="#000" stroke-width="4"/><path d="M1546 260 L1563 205 L1580 260Z" fill="#f6e0b5" stroke="#000" stroke-width="4"/>
      <rect x="1488" y="430" width="104" height="44" rx="10" fill="#1fb5a9" stroke="#000" stroke-width="4"/>
      <rect x="40" y="620" width="30" height="340" rx="6" fill="#ff7a1a" stroke="#000" stroke-width="4"/><path d="M40 620 L55 570 L70 620Z" fill="#f6e0b5" stroke="#000" stroke-width="4"/>
      <rect x="26" y="760" width="58" height="40" rx="10" fill="#1fb5a9" stroke="#000" stroke-width="4"/>
    </g>`,
  // fondo del cajón de madera: para cualquier compartimento sin escenario propio
  cajon: `
    <defs><pattern id="veta" width="600" height="80" patternUnits="userSpaceOnUse"><rect width="600" height="80" fill="#e6c08c"/><path d="M0 20 C150 10 300 34 600 18 M0 54 C200 64 380 40 600 58" stroke="#d4a868" stroke-width="3" fill="none"/></pattern></defs>
    <rect width="1600" height="1000" fill="url(#veta)"/>
    <rect width="1600" height="40" fill="#b9874a"/><rect y="960" width="1600" height="40" fill="#b9874a"/>
    <g stroke="#7d868c" stroke-width="7" fill="none" stroke-linecap="round" opacity=".8"><path d="M1460 880 h70 a16 16 0 0 0 0 -32 h-80 a10 10 0 0 0 0 20 h60"/><path d="M90 140 h60 a14 14 0 0 1 0 28 h-70 a9 9 0 0 1 0 -18 h52"/></g>`,
  corcho: `
    <defs><pattern id="corcho" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#c99658"/><circle cx="8" cy="9" r="2" fill="#b07f45"/><circle cx="27" cy="21" r="2.6" fill="#ddb07a"/><circle cx="16" cy="32" r="1.8" fill="#a8763d"/><circle cx="35" cy="5" r="1.6" fill="#b07f45"/></pattern></defs>
    <rect width="1600" height="1000" fill="url(#corcho)"/>
    <rect x="1400" y="120" width="150" height="150" fill="#fff27a" transform="rotate(5 1475 195)"/><circle cx="1475" cy="132" r="12" fill="#c8201a" stroke="#000" stroke-width="3"/>
    <rect x="60" y="760" width="170" height="120" fill="#fff" transform="rotate(-4 145 820)"/><circle cx="145" cy="768" r="12" fill="#1fb5a9" stroke="#000" stroke-width="3"/>`,
};

const CLIP = `<svg viewBox="0 0 120 60" width="120" height="60"><path d="M10 30 h80 a14 14 0 0 0 0 -28 h-74 a9 9 0 0 0 0 18 h62" fill="none" stroke="#7d868c" stroke-width="6" stroke-linecap="round"/><circle cx="96" cy="12" r="5" fill="#fff" stroke="#000" stroke-width="2"/><circle cx="97" cy="12" r="2.4"/><path d="M30 32 l-6 22 M50 32 l6 22 M70 32 l-6 22" stroke="#000" stroke-width="3" stroke-linecap="round" class="patas"/></svg>`;
const MANO = `<svg viewBox="0 0 400 520" width="400" height="520"><path d="M150 0 h120 v190 c0 0 40 -40 70 -10 c30 30 -20 90 -50 150 c-30 60 -80 150 -140 170 c-60 20 -120 -40 -120 -120 c0 -60 10 -120 30 -170 l40 -90z" fill="rgba(20,20,40,.32)"/><path d="M170 200 v120 M220 190 v130 M120 230 v100" stroke="rgba(20,20,40,.25)" stroke-width="40" stroke-linecap="round"/></svg>`;

export function montaEscena(nombre = 'cajon', { reacciona } = {}) {
  const capa = h('div', 'fondo-escena ' + nombre, `<svg viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${FONDOS[nombre] || FONDOS.cajon}</svg>`);
  document.body.prepend(capa);
  document.body.dataset.escena = nombre;
  if (quieto()) return { pausa() {}, sigue() {} };
  // cosas que pasan cuando nadie está pensando: tras un rato sin tocar nada o entre retos
  let ultimo = Date.now(), pausado = false;
  ['pointerdown', 'keydown'].forEach((e) => addEventListener(e, () => (ultimo = Date.now()), true));
  const pasa = (tipo) => {
    if (tipo === 'clip') {
      const c = h('div', 'paseante', CLIP);
      document.body.append(c);
      c.animate([{ transform: 'translateX(-160px)' }, { transform: `translateX(${innerWidth + 40}px)` }], { duration: 9000, easing: 'linear' }).onfinish = () => c.remove();
    } else if (tipo === 'luz') {
      const l = h('div', 'rayo-luz');
      document.body.append(l);
      l.animate([{ opacity: 0 }, { opacity: 1, offset: 0.3 }, { opacity: 1, offset: 0.7 }, { opacity: 0 }], { duration: 5000 }).onfinish = () => l.remove();
    } else if (tipo === 'mano') {
      const m = h('div', 'sombra-mano', MANO);
      document.body.append(m);
      reacciona?.('mano');
      m.animate([{ transform: 'translate(10vw,-110%)' }, { transform: 'translate(30vw,-30%)', offset: 0.35 }, { transform: 'translate(34vw,-28%)', offset: 0.6 }, { transform: 'translate(60vw,-120%)' }], { duration: 5200, easing: 'ease-in-out' }).onfinish = () => { m.remove(); reacciona?.('mano-fuera'); };
    }
  };
  setInterval(() => {
    if (pausado || document.hidden || Date.now() - ultimo < 9000) return;
    const r = Math.random();
    if (r < 0.12) pasa('mano'); else if (r < 0.55) pasa('clip'); else pasa('luz');
    ultimo = Date.now();
  }, 7000);
  return { pausa: () => (pausado = true), sigue: () => { pausado = false; }, pasa };
}

/* ---------------------------------------------------------------- viñetas */
// paneles: [{ quien: 'boli', pose: 'piensa', texto: '…' } | { nota: 'EL VIERNES ORDENO…', firma: 'El profe' }]
export function vineta(paneles, dibuja, POSES, titulo) {
  return new Promise((listo) => {
    const capa = h('div', 'vineta-capa');
    capa.setAttribute('role', 'dialog'); capa.setAttribute('aria-modal', 'true'); capa.setAttribute('aria-label', titulo || 'Historia');
    const caja = h('div', 'vineta');
    const sig = h('button', 'tecla primaria grande'), saltar = h('button', 'tecla');
    saltar.textContent = 'Saltar';
    capa.append(caja);
    let i = 0;
    const pinta = () => {
      const p = paneles[i];
      caja.innerHTML = '';
      if (p.nota) {
        caja.append(h('div', 'nota-profe', `<p>${p.nota}</p><span>— ${p.firma ?? 'El profe'}</span>`));
      } else {
        const fig = h('div', 'vineta-figura ' + p.quien, dibuja(p.quien, POSES[p.pose] || POSES.quieto));
        const bo = h('div', 'vineta-bocadillo');
        bo.textContent = p.texto;
        caja.append(h('div', 'vineta-panel ' + (i % 2 ? 'der' : 'izq')), '');
        caja.firstChild.append(fig, bo);
      }
      sig.textContent = i < paneles.length - 1 ? 'Siguiente' : '¡A jugar!';
      const botones = h('div', 'vineta-botones');
      botones.append(saltar, sig);
      caja.append(botones);
      caja.animate?.([{ transform: 'scale(.94) rotate(-1deg)', opacity: 0.3 }, { transform: 'none', opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      sig.focus({ preventScroll: true });
    };
    const cierra = () => { capa.remove(); listo(); };
    sig.onclick = () => (++i < paneles.length ? pinta() : cierra());
    saltar.onclick = cierra;
    document.body.append(capa);
    pinta();
  });
}

/* ---------------------------------------------------------------- teclado en pantalla */
// Cualquier input.campo-num usa este teclado (data-coma="1" añade la coma; data-ops="1" añade + − × :).
export function montaTeclado() {
  const t = h('div', 'teclado');
  t.setAttribute('role', 'group'); t.setAttribute('aria-label', 'Teclado');
  t.hidden = true;
  let campo = null;
  const tecla = (txt, val, cls = '') => { const b = h('button', 'tecla tecla-num ' + cls); b.type = 'button'; b.textContent = txt; b.dataset.v = val; return b; };
  const pinta = () => {
    t.innerHTML = '';
    const nums = h('div', 'teclado-nums');
    for (const k of ['7', '8', '9', '4', '5', '6', '1', '2', '3']) nums.append(tecla(k, k));
    nums.append(tecla(campo?.dataset.coma ? ',' : '', campo?.dataset.coma ? ',' : '', campo?.dataset.coma ? '' : 'vacia'), tecla('0', '0'), tecla('⌫', 'borra', 'borra'));
    t.append(nums);
    const lado = h('div', 'teclado-lado');
    if (campo?.dataset.ops) for (const o of ['+', '−', '×', ':']) lado.append(tecla(o, o, 'op'));
    lado.append(tecla('✓', 'ok', 'ok primaria'));
    t.append(lado);
  };
  t.addEventListener('pointerdown', (e) => e.preventDefault()); // que el campo no pierda el foco
  t.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b || !campo) return;
    const v = b.dataset.v;
    if (!v) return;
    if (v === 'borra') campo.value = campo.value.slice(0, -1);
    else if (v === 'ok') { campo.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); return; }
    else if ((campo.maxLength < 0 || campo.value.length < campo.maxLength)) campo.value += v;
    campo.dispatchEvent(new Event('input', { bubbles: true }));
    campo.animate?.([{ transform: 'scale(1.06)' }, { transform: 'none' }], { duration: 120 });
  });
  addEventListener('focusin', (e) => {
    const c = e.target.closest?.('input.campo-num');
    if (!c || c.readOnly) return;
    campo = c; pinta(); t.hidden = false; document.body.classList.add('con-teclado');
    c.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  });
  addEventListener('focusout', (e) => {
    if (!e.target.closest?.('input.campo-num')) return;
    setTimeout(() => { if (!document.activeElement?.matches?.('input.campo-num:not([readonly])')) { t.hidden = true; document.body.classList.remove('con-teclado'); campo = null; } }, 60);
  });
  document.body.append(t);
  // los campos no abren el teclado del sistema en tablet
  new MutationObserver(() => document.querySelectorAll('input.campo-num:not([inputmode="none"])').forEach((i) => i.setAttribute('inputmode', 'none'))).observe(document.body, { childList: true, subtree: true });
  return t;
}
