// Efectos de juego compartidos: partículas, vuelos, temblores, cuentas que suben y la mano que enseña.
const quieto = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- partículas en un canvas que cubre la pantalla ---------- */
let lienzo, c2d, parts = [], vivo = false;
function prepara() {
  if (lienzo) return;
  lienzo = document.createElement('canvas');
  lienzo.setAttribute('aria-hidden', 'true');
  Object.assign(lienzo.style, { position: 'fixed', inset: '0', width: '100%', height: '100%', pointerEvents: 'none', zIndex: 90 });
  document.body.append(lienzo);
  c2d = lienzo.getContext('2d');
  const ajusta = () => { const r = devicePixelRatio || 1; lienzo.width = innerWidth * r; lienzo.height = innerHeight * r; c2d.setTransform(r, 0, 0, r, 0, 0); };
  ajusta(); addEventListener('resize', ajusta);
}
function bucle() {
  vivo = true;
  c2d.clearRect(0, 0, innerWidth, innerHeight);
  const ahora = performance.now();
  parts = parts.filter((p) => ahora - p.t0 < p.vida);
  for (const p of parts) {
    const t = (ahora - p.t0) / p.vida;
    p.vx *= p.roce; p.vy = p.vy * p.roce + p.g;
    p.x += p.vx; p.y += p.vy; p.giro += p.vg;
    c2d.save();
    c2d.globalAlpha = p.tipo === 'confeti' ? Math.min(1, (1 - t) * 3) : 1 - t;
    c2d.translate(p.x, p.y); c2d.rotate(p.giro);
    c2d.fillStyle = p.color;
    if (p.tipo === 'confeti') { c2d.scale(1, Math.cos(p.giro * 3)); c2d.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); }
    else if (p.tipo === 'chispa') { estrella(p.r * (1 - t * 0.5)); c2d.fill(); }
    else { c2d.beginPath(); c2d.arc(0, 0, p.r * (1 + t), 0, Math.PI * 2); c2d.fill(); }
    c2d.restore();
  }
  if (parts.length) requestAnimationFrame(bucle); else { vivo = false; c2d.clearRect(0, 0, innerWidth, innerHeight); }
}
function estrella(r) {
  c2d.beginPath();
  for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.35 : r; const a = (i * Math.PI) / 4; c2d.lineTo(rr * Math.cos(a), rr * Math.sin(a)); }
  c2d.closePath();
}
function lanza(lista) {
  if (quieto()) return;
  prepara();
  const t0 = performance.now();
  for (const p of lista) parts.push({ t0, giro: 0, vg: 0, roce: 0.98, g: 0, ...p });
  if (!vivo) requestAnimationFrame(bucle);
}
const css = (v) => getComputedStyle(document.body).getPropertyValue(v).trim() || v;
const centro = (el) => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };

export function confeti(x = innerWidth / 2, y = innerHeight / 3, n = 90) {
  const colores = [css('--oro'), css('--acento'), css('--azul'), css('--rojo'), css('--s4'), '#fff'];
  lanza(Array.from({ length: n }, () => {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 6 + Math.random() * 9;
    return { tipo: 'confeti', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.32, roce: 0.975, r: 4 + Math.random() * 4, vg: (Math.random() - 0.5) * 0.4, color: colores[(Math.random() * colores.length) | 0], vida: 1600 + Math.random() * 900 };
  }));
}
export function chispas(x, y, n = 14, color) {
  const col = color || css('--oro');
  lanza(Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.3, v = 3 + Math.random() * 4;
    return { tipo: 'chispa', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, roce: 0.9, r: 5 + Math.random() * 5, vg: 0.15, color: col, vida: 650 };
  }));
}
export function polvo(x, y, n = 9) {
  lanza(Array.from({ length: n }, (_, i) => {
    const a = Math.PI + (i / (n - 1)) * Math.PI, v = 1.5 + Math.random() * 2;
    return { tipo: 'polvo', x, y, vx: Math.cos(a) * v * 1.6, vy: Math.sin(a) * v * 0.6, roce: 0.9, r: 3 + Math.random() * 3, color: 'rgba(120,95,60,.45)', vida: 450 };
  }));
}
export const confetiEn = (el, n) => { const [x, y] = centro(el); confeti(x, y, n); };
export const chispasEn = (el, n, color) => { const [x, y] = centro(el); chispas(x, y, n, color); };

/* ---------- movimiento ---------- */
export function temblor(el, fuerza = 8) {
  if (quieto() || !el?.animate) return;
  const f = fuerza;
  el.animate([{ transform: 'translateX(0)' }, { transform: `translateX(${-f}px)` }, { transform: `translateX(${f}px)` }, { transform: `translateX(${-f * 0.6}px)` }, { transform: `translateX(${f * 0.4}px)` }, { transform: 'translateX(0)' }], { duration: 380, easing: 'ease-out' });
}
export function bote(el, alto = 10) {
  if (quieto() || !el?.animate) return;
  el.animate([{ transform: 'translateY(0) scale(1)' }, { transform: `translateY(${-alto}px) scale(1.06)` }, { transform: 'translateY(0) scale(.97,1.03)' }, { transform: 'translateY(0) scale(1)' }], { duration: 360, easing: 'ease-out' });
}
// Un clon vuela de un elemento a otro siguiendo un arco
export function vuela(desde, hasta, nodo, { ms = 520, escala = 1, alFinal } = {}) {
  const a = desde.getBoundingClientRect(), b = hasta.getBoundingClientRect();
  if (quieto() || !nodo.animate) { alFinal?.(); return; }
  Object.assign(nodo.style, { position: 'fixed', left: a.left + 'px', top: a.top + 'px', width: a.width + 'px', height: a.height + 'px', margin: 0, zIndex: 95, pointerEvents: 'none' });
  document.body.append(nodo);
  const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const s = escala === 'ajusta' ? b.width / a.width : escala;
  const anim = nodo.animate([
    { transform: 'translate(0,0) scale(1) rotate(0)' },
    { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 90}px) scale(${(1 + s) / 2 + 0.15}) rotate(-12deg)`, offset: 0.5 },
    { transform: `translate(${dx}px, ${dy}px) scale(${s}) rotate(0)` }], { duration: ms, easing: 'cubic-bezier(.45,0,.3,1)' });
  anim.onfinish = () => { nodo.remove(); alFinal?.(); };
}
export function cuentaArriba(el, de, a, ms = 700) {
  if (quieto()) { el.textContent = a; return; }
  const t0 = performance.now();
  const paso = (t) => {
    const f = Math.min(1, (t - t0) / ms);
    el.textContent = Math.round(de + (a - de) * (1 - (1 - f) ** 3));
    if (f < 1) requestAnimationFrame(paso);
  };
  requestAnimationFrame(paso);
}
export const espera = (ms) => new Promise((r) => setTimeout(r, quieto() ? Math.min(ms, 60) : ms));
export function vibra(patron) { try { navigator.vibrate?.(patron); } catch {} }

/* ---------- la mano que enseña qué hacer si nadie toca nada ---------- */
const MANO = `<svg viewBox="0 0 64 72" width="64" height="72" aria-hidden="true"><path d="M24 6c4 0 6 3 6 7v20l3-1c3-1 6 1 7 3l1 2 3-1c3-1 6 1 7 4l1 2 2-1c3 0 6 2 6 6v9c0 11-8 20-19 20h-6c-7 0-12-3-16-9L6 47c-2-3-1-6 2-8 2-1 5-1 7 1l3 4V13c0-4 2-7 6-7z" fill="#fff" stroke="#000" stroke-width="3" stroke-linejoin="round"/><path d="M33 33v12M44 37v9M54 42v6" stroke="#000" stroke-width="2.5" stroke-linecap="round"/></svg>`;
export function mano(objetivo, { tipo = 'toca', dx = 0.35, demora = 3200, hasta = null } = {}) {
  if (quieto()) return () => {};
  let nodo = null, t = null, cancelado = false;
  const fuera = () => { cancelado = true; clearTimeout(t); nodo?.remove(); removeEventListener('pointerdown', fuera, true); removeEventListener('keydown', fuera, true); };
  addEventListener('pointerdown', fuera, true); addEventListener('keydown', fuera, true);
  t = setTimeout(() => {
    if (cancelado || !objetivo.isConnected) return;
    const r = objetivo.getBoundingClientRect();
    nodo = document.createElement('div');
    nodo.innerHTML = MANO;
    Object.assign(nodo.style, { position: 'absolute', zIndex: 80, pointerEvents: 'none', left: r.left + scrollX + r.width * dx - 24 + 'px', top: r.top + scrollY + r.height * 0.45 + 'px', filter: 'drop-shadow(0 6px 4px rgba(0,0,0,.3))' });
    document.body.append(nodo);
    let mx = r.width * 0.25, my = 4;
    if (hasta?.isConnected) { const q = hasta.getBoundingClientRect(); mx = q.left + q.width / 2 - (r.left + r.width * dx); my = q.top + q.height / 2 - (r.top + r.height * 0.45); }
    const mov = tipo === 'arrastra'
      ? [{ transform: 'translate(0,-30px)', opacity: 0 }, { transform: 'translate(0,0)', opacity: 1, offset: 0.15 }, { transform: 'translate(0,4px) scale(.92)', offset: 0.25 }, { transform: `translate(${mx}px,${my}px) scale(.92)`, offset: 0.75 }, { transform: `translate(${mx}px,${my - 24}px)`, opacity: 0 }]
      : [{ transform: 'translate(0,-30px)', opacity: 0 }, { transform: 'translate(0,0)', opacity: 1, offset: 0.3 }, { transform: 'translate(0,5px) scale(.9)', offset: 0.45 }, { transform: 'translate(0,0)', offset: 0.6 }, { transform: 'translate(0,5px) scale(.9)', offset: 0.75 }, { transform: 'translate(0,-20px)', opacity: 0 }];
    nodo.animate(mov, { duration: hasta ? 2100 : 1700, iterations: 3, easing: 'ease-in-out' }).onfinish = () => nodo?.remove();
  }, demora);
  return fuera;
}

/* ---------- celebraciones de papelería (una por personaje) ---------- */
const capaSVG = (contenido, ms) => {
  const d = document.createElement('div');
  d.className = 'celebra-capa';
  d.innerHTML = `<svg viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">${contenido}</svg>`;
  document.body.append(d);
  setTimeout(() => d.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 }).onfinish = () => d.remove(), ms);
  return d;
};
export function celebra(quien, el) {
  if (quieto()) return;
  if (quien === 'fosforito') {
    // un trazo de fosforito que cruza la pantalla
    const y = 260 + Math.random() * 120;
    capaSVG(`<path class="trazo-celebra" pathLength="1" d="M-20 ${y + 30} C 200 ${y - 40}, 420 ${y + 40}, 620 ${y - 10} S 900 ${y - 30}, 1030 ${y + 10}" stroke="${css('--acento')}" stroke-width="70" stroke-linecap="round" fill="none" opacity=".55" style="mix-blend-mode:multiply"/>`, 900);
    if (el) chispasEn(el, 16, css('--acento'));
  } else if (quien === 'boli') {
    // el tic gigante y un 10 rodeado, como en un examen
    capaSVG(`<path class="trazo-celebra" pathLength="1" d="M330 300 L450 420 L700 140" stroke="#c8201a" stroke-width="34" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
      <g class="sello-diez"><ellipse cx="800" cy="420" rx="110" ry="80" fill="none" stroke="#c8201a" stroke-width="10" transform="rotate(-8 800 420)"/><text x="800" y="452" text-anchor="middle" font-family="Rotulo,Impact" font-weight="900" font-size="100" fill="#c8201a">10</text></g>`, 1000);
  } else {
    // la goma frota y las virutas salen volando convertidas en estrellas
    const r = el?.getBoundingClientRect?.() ?? { left: innerWidth / 2 - 50, top: innerHeight / 2, width: 100, height: 40 };
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    lanza(Array.from({ length: 26 }, () => { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6, v = 3 + Math.random() * 6; return { tipo: 'polvo', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, g: 0.18, roce: 0.97, r: 3 + Math.random() * 3, color: '#efe4cf', vida: 700 }; }));
    setTimeout(() => chispas(x, y - 60, 18, css('--oro')), 380);
  }
}
// lluvia de gomets: pegatinas redondas que caen, se pegan y se despegan
export function gomets(n = 28) {
  if (quieto()) return;
  const colores = ['#ff4f7b', '#ffd23f', '#1fb5a9', '#2f6be0', '#8df07d', '#ff7a1a', '#cda8ff'];
  for (let i = 0; i < n; i++) {
    const g = document.createElement('span');
    g.className = 'gomet';
    const t = 18 + Math.random() * 26;
    Object.assign(g.style, { width: t + 'px', height: t + 'px', left: Math.random() * 100 + 'vw', background: colores[i % colores.length] });
    document.body.append(g);
    const destino = 30 + Math.random() * 60, giro = Math.random() * 360;
    g.animate([{ transform: `translateY(-10vh) rotate(${giro}deg)` }, { transform: `translateY(${destino}vh) rotate(${giro + 200}deg)`, offset: 0.35, easing: 'cubic-bezier(.3,1.6,.5,1)' }, { transform: `translateY(${destino}vh) rotate(${giro + 200}deg) scale(1)`, offset: 0.8 }, { transform: `translateY(${destino}vh) rotate(${giro + 260}deg) scale(.2)`, opacity: 0 }], { duration: 2600 + Math.random() * 900, delay: i * 35, fill: 'both' }).onfinish = () => g.remove();
  }
}

/* ---------- arrastrar con el dedo (y tocar, para quien no pueda arrastrar) ---------- */
// arrastra(nodo, { destinos: () => [elementos], alSoltar(destino, x, y) → true si se queda, alTocar() })
let sonar = () => {};
export const ponSonido = (f) => (sonar = f);
// Arrastrar con el dedo: la pieza se despega del sitio, se inclina según la velocidad (como si colgara del dedo),
// se balancea con un muelle y al soltarla aterriza con un pequeño aplastamiento.
export function arrastra(nodo, { destinos, alSoltar, alTocar, puede = () => true }) {
  nodo.style.touchAction = 'none';
  // el toque (y el teclado) llega como click; tras un arrastre el click se descarta
  nodo.addEventListener('click', (e) => {
    if (nodo._trasArrastre) { nodo._trasArrastre = false; e.stopImmediatePropagation(); e.preventDefault(); return; }
    alTocar?.(e);
  }, true);
  nodo.addEventListener('pointerdown', (e) => {
    if (!puede() || e.button > 0) return;
    e.preventDefault();
    const x0 = e.clientX, y0 = e.clientY, r0 = nodo.getBoundingClientRect();
    let fantasma = null, sobre = null, raf = 0;
    const dx = x0 - r0.left, dy = y0 - r0.top;
    // muelle: ángulo y escala persiguen a su objetivo
    let px = x0, py = y0, vx = 0, ang = 0, vang = 0, esc = 1, vesc = 0, ultimoT = performance.now(), tx = 0, ty = 0;
    try { nodo.setPointerCapture(e.pointerId); } catch {}
    const bajo = (x, y) => { const lista = destinos(); return lista.find((d) => { const r = d.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }) || null; };
    const pinta = () => {
      const objAng = Math.max(-22, Math.min(22, vx * 1.6));
      vang += (objAng - ang) * 0.16; vang *= 0.74; ang += vang;
      const objEsc = sobre ? 1.04 : 1.14;
      vesc += (objEsc - esc) * 0.2; vesc *= 0.7; esc += vesc;
      vx *= 0.86;
      fantasma.style.transform = `translate(${tx}px, ${ty}px) rotate(${ang.toFixed(2)}deg) scale(${esc.toFixed(3)})`;
      raf = requestAnimationFrame(pinta);
    };
    const mover = (ev) => {
      if (!fantasma) {
        if (Math.hypot(ev.clientX - x0, ev.clientY - y0) < 7) return;
        fantasma = nodo.cloneNode(true);
        fantasma.classList.add('fantasma'); fantasma.classList.remove('elegida', 'bien', 'mal'); fantasma.removeAttribute('id');
        Object.assign(fantasma.style, { position: 'fixed', left: 0, top: 0, width: r0.width + 'px', height: r0.height + 'px', margin: 0, zIndex: 99, pointerEvents: 'none', transformOrigin: `${dx}px ${dy}px`, rotate: '0deg', translate: 'none', scale: 'none' });
        document.body.append(fantasma);
        nodo.classList.add('levantado');
        document.body.classList.add('arrastrando');
        sonar('coge');
        if (quieto()) { fantasma.style.transform = `translate(${ev.clientX - dx}px, ${ev.clientY - dy}px)`; } else raf = requestAnimationFrame(pinta);
      }
      const ahora = performance.now(), dt = Math.max(8, ahora - ultimoT);
      vx = vx * 0.5 + ((ev.clientX - px) / dt) * 16 * 0.5;
      px = ev.clientX; py = ev.clientY; ultimoT = ahora;
      tx = ev.clientX - dx; ty = ev.clientY - dy;
      if (quieto()) fantasma.style.transform = `translate(${tx}px, ${ty}px)`;
      const s = bajo(ev.clientX, ev.clientY);
      if (s !== sobre) { sobre?.classList.remove('sobre'); s?.classList.add('sobre'); if (s) sonar('clic'); sobre = s; }
    };
    const soltar = (ev) => {
      nodo.removeEventListener('pointermove', mover); nodo.removeEventListener('pointerup', soltar); nodo.removeEventListener('pointercancel', soltar);
      sobre?.classList.remove('sobre');
      document.body.classList.remove('arrastrando');
      if (!fantasma) return;
      cancelAnimationFrame(raf);
      nodo._trasArrastre = true; setTimeout(() => (nodo._trasArrastre = false), 60);
      const destino = bajo(ev.clientX, ev.clientY);
      const res = destino ? alSoltar(destino, ev.clientX, ev.clientY) : false;
      const queda = res !== false;
      // alSoltar puede devolver el elemento donde «aterriza» la pieza (si no, vuelve a su nodo)
      const pista = res instanceof Element ? res : nodo;
      requestAnimationFrame(() => {
        const desde = fantasma.style.transform;
        const acaba = () => {
          fantasma.remove(); nodo.classList.remove('levantado');
          const n = pista.isConnected ? pista : nodo;
          if (queda) aterriza(n); else sonar('quita');
        };
        if (!pista.isConnected) { fantasma.animate([{ transform: desde, opacity: 1 }, { transform: desde + ' scale(.6)', opacity: 0 }], { duration: 200 }).onfinish = acaba; return; }
        const r = pista.getBoundingClientRect();
        const ox = r.left + r.width / 2 - r0.width / 2, oy = r.top + r.height / 2 - r0.height / 2;
        const anim = fantasma.animate([{ transform: desde }, { transform: `translate(${ox}px, ${oy}px) rotate(0deg) scale(${r.width / r0.width})` }], { duration: queda ? 200 : 380, easing: queda ? 'cubic-bezier(.5,0,.75,0)' : 'cubic-bezier(.3,1.3,.5,1)' });
        anim.onfinish = acaba;
      });
    };
    nodo.addEventListener('pointermove', mover); nodo.addEventListener('pointerup', soltar); nodo.addEventListener('pointercancel', soltar);
  });
}
// al caer sobre la mesa: se aplasta un poco, rebota y levanta polvillo
export function aterriza(n) {
  sonar('pon');
  if (quieto() || !n.animate) return;
  n.animate([{ transform: 'scale(1.12,.84)' }, { transform: 'scale(.95,1.07)', offset: 0.45 }, { transform: 'scale(1.02,.98)', offset: 0.75 }, { transform: 'none' }], { duration: 380, easing: 'ease-out' });
  const r = n.getBoundingClientRect();
  polvo(r.left + r.width / 2, r.top + r.height * 0.85, 6);
}
