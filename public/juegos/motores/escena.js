// Escenarios con vida, viñetas de historia y teclado en pantalla.
// Los escenarios son datos: cada bloque futuro puede añadir los suyos aquí sin tocar los juegos.
const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const h = (tag, cls, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = html; return n; };

/* ---------------------------------------------------------------- fondos */
const FONDOS = {
  // el estuche de cremallera: tela rosa, cremallera turquesa, lápices en sus gomas
  // la mesa de manualidades: sobre la alfombrilla, recortes de cartulina, unas tijeras y un lápiz (solo en los bordes)
  estuche: `
    <defs><filter id="sombra-mesa" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="7" dy="12" stdDeviation="7" flood-color="#06180f" flood-opacity=".45"/></filter></defs>
    <g filter="url(#sombra-mesa)" stroke="#1b1e3a" stroke-width="4" stroke-linejoin="round">
      <path d="M-20 870 L120 820 L60 960 Z" fill="#ffc531"/>
      <path d="M1480 40 L1640 -10 L1640 150 L1560 120 Z" fill="#e8417a"/>
      <path d="M1520 930 l70 -110 l60 40 l-20 110z" fill="#5ec3ff"/>
      <path d="M150 1010 q30 -70 90 -60 q-10 50 -40 90z" fill="#9bd84a"/>
      <g transform="translate(1385 820) rotate(-32)">
        <rect x="0" y="0" width="300" height="34" rx="4" fill="#ffc531"/><path d="M0 0 L-46 17 L0 34Z" fill="#f4d9a8"/><path d="M-30 11 L-46 17 L-30 23Z" fill="#1b1e3a"/>
        <rect x="300" y="-2" width="34" height="38" rx="6" fill="#e8417a"/><path d="M30 10 h240" stroke="#fff" stroke-opacity=".6" stroke-width="5" stroke-linecap="round"/>
      </g>
      <g transform="translate(-40 300) rotate(18)">
        <path d="M60 30 L330 70 L330 82 L60 60Z" fill="#cfd6e6"/><path d="M60 90 L330 86 L330 96 L60 120Z" fill="#b9c2d6"/>
        <circle cx="40" cy="40" r="34" fill="#2f5bd3"/><circle cx="40" cy="40" r="15" fill="#2e7d5b"/>
        <circle cx="40" cy="112" r="34" fill="#2f5bd3"/><circle cx="40" cy="112" r="15" fill="#2e7d5b"/>
        <circle cx="96" cy="76" r="7" fill="#fff"/>
      </g>
    </g>
    <g fill="#f3ecdf" stroke="#1b1e3a" stroke-width="2.5"><path d="M1470 760 q14 -10 20 4 q-12 10 -20 -4z"/><path d="M1440 790 q10 -14 20 -2 q-8 12 -20 2z"/><path d="M1500 800 q14 -4 14 10 q-14 4 -14 -10z"/></g>`,
  // fondo del cajón de madera: para cualquier compartimento sin escenario propio
  cajon: `
    <defs><filter id="sombra-cajon" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="6" flood-color="#3a2208" flood-opacity=".45"/></filter></defs>
    <g filter="url(#sombra-cajon)" stroke="#1b1e3a" stroke-linejoin="round">
      <g fill="none" stroke="#8d97a8" stroke-width="7" stroke-linecap="round"><path d="M1460 880 h70 a16 16 0 0 0 0 -32 h-80 a10 10 0 0 0 0 20 h60"/><path d="M90 150 h60 a14 14 0 0 1 0 28 h-70 a9 9 0 0 1 0 -18 h52"/></g>
      <g transform="translate(1500 300) rotate(84)" stroke-width="4"><rect width="260" height="30" rx="5" fill="#2f5bd3"/><path d="M0 0 L-40 15 L0 30Z" fill="#f4d9a8"/><path d="M-26 10 L-40 15 L-26 20Z" fill="#1b1e3a"/><rect x="250" y="-2" width="30" height="34" rx="5" fill="#ff7fae"/></g>
      <g transform="translate(1440 560) rotate(-12)" stroke-width="4"><rect width="150" height="70" rx="12" fill="#fff1cf"/><rect x="90" width="60" height="70" rx="0" fill="#2f5bd3"/><path d="M90 0 v70" /></g>
      <circle cx="1540" cy="960" r="26" fill="#ffc531" stroke-width="4"/><circle cx="1540" cy="960" r="10" fill="#c98f00" stroke-width="3"/>
    </g>`,
  // la mesa del puzle: tapete violeta con piezas sueltas en los bordes
  puzle: `
    <defs><filter id="sombra-puzle" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="6" flood-color="#0a0020" flood-opacity=".5"/></filter>
      <path id="pz" d="M0 0 h40 q-8 -22 12 -22 q20 0 12 22 h40 v40 q22 -8 22 12 q0 20 -22 12 v40 h-104z"/></defs>
    <g filter="url(#sombra-puzle)" stroke="#1b1e3a" stroke-width="4" stroke-linejoin="round">
      <use href="#pz" transform="translate(-30 760) rotate(-18)" fill="#ffc531"/>
      <use href="#pz" transform="translate(1480 60) rotate(24)" fill="#ff7fae"/>
      <use href="#pz" transform="translate(1500 820) rotate(-40) scale(.8)" fill="#5ec3ff"/>
      <use href="#pz" transform="translate(60 120) rotate(140) scale(.7)" fill="#9bd84a"/>
    </g>`,
  // el patio visto desde arriba: baldosas de barro y setos en las esquinas
  patio: `
    <defs><filter id="sombra-patio" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="6" flood-color="#2a1000" flood-opacity=".45"/></filter></defs>
    <g filter="url(#sombra-patio)" stroke="#1b1e3a" stroke-width="4">
      <circle cx="40" cy="960" r="120" fill="#6fbf3a"/><circle cx="150" cy="1010" r="80" fill="#5aa82c"/><circle cx="1580" cy="60" r="130" fill="#6fbf3a"/><circle cx="1470" cy="-10" r="80" fill="#5aa82c"/>
      <g transform="translate(1500 880)"><circle r="34" fill="#fffdf6"/><path d="M-34 0 h68 M0 -34 v68" stroke-width="3"/><circle r="12" fill="#e8417a" stroke-width="3"/></g>
    </g>`,
  // el almacén de clips: suelo de hormigón con líneas pintadas y cajas apiladas
  almacen: `
    <defs><filter id="sombra-alm" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="7" dy="12" stdDeviation="7" flood-color="#0a1626" flood-opacity=".5"/></filter></defs>
    <path d="M0 940 H1600 M0 900 H1600" stroke="#ffc531" stroke-width="10" stroke-dasharray="60 40" opacity=".55"/>
    <g filter="url(#sombra-alm)" stroke="#1b1e3a" stroke-width="4" stroke-linejoin="round">
      <rect x="-20" y="760" width="170" height="130" fill="#d39a5c"/><path d="M-20 790 h170" stroke="#a8743c" stroke-width="10"/><rect x="40" y="640" width="130" height="120" fill="#e0ad70"/><path d="M40 668 h130" stroke="#a8743c" stroke-width="9"/>
      <rect x="1460" y="80" width="170" height="130" fill="#d39a5c"/><path d="M1460 110 h170" stroke="#a8743c" stroke-width="10"/>
      <g transform="translate(1470 820)"><rect width="140" height="20" fill="#c9cfdd"/><rect y="-90" width="40" height="90" fill="#2f5bd3"/><circle cx="20" cy="34" r="14" fill="#1b1e3a"/><circle cx="120" cy="34" r="14" fill="#1b1e3a"/></g>
    </g>`,
  // la merienda: mantel de cuadros con un vaso y galletas en los bordes
  merienda: `
    <defs><filter id="sombra-mer" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="6" dy="10" stdDeviation="6" flood-color="#3a0a00" flood-opacity=".4"/></filter></defs>
    <g filter="url(#sombra-mer)" stroke="#1b1e3a" stroke-width="4">
      <circle cx="1520" cy="120" r="80" fill="#fffdf6"/><circle cx="1520" cy="120" r="58" fill="#ff9f45"/><circle cx="1500" cy="104" r="8" fill="#7a3d10" stroke-width="2"/><circle cx="1540" cy="130" r="8" fill="#7a3d10" stroke-width="2"/><circle cx="1512" cy="148" r="7" fill="#7a3d10" stroke-width="2"/>
      <circle cx="60" cy="900" r="90" fill="#d9e8ff" opacity=".9"/><circle cx="60" cy="900" r="66" fill="#fffdf6" opacity=".9"/>
      <circle cx="1460" cy="900" r="46" fill="#e0ad70"/><circle cx="1560" cy="950" r="40" fill="#e0ad70"/>
    </g>`,
  corcho: `
    <defs><pattern id="corcho" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#c99658"/><circle cx="8" cy="9" r="2" fill="#b07f45"/><circle cx="27" cy="21" r="2.6" fill="#ddb07a"/><circle cx="16" cy="32" r="1.8" fill="#a8763d"/><circle cx="35" cy="5" r="1.6" fill="#b07f45"/></pattern></defs>
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
