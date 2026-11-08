// Núcleo común de los motores: montaje de la página, rondas, estrellas, planta y pantalla final.
// Cada motor exporta { generar(spec), ronda(datos, ctx) }. ronda() pinta en ctx.escenario y,
// cuando el alumno comprueba, llama a ctx.fin(estrellas, mensaje).

export const $ = (s, r = document) => r.querySelector(s);

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
// Redondea al múltiplo de paso más cercano (paso puede ser 0,1, 0,01…)
export function redondea(v, paso = 1) {
  const r = Math.round(v / paso) * paso;
  const d = (String(paso).split('.')[1] || '').length;
  return +r.toFixed(d);
}
// Texto con **resaltado**
export function marca(txt) {
  const n = document.createDocumentFragment();
  String(txt).split(/\*\*(.+?)\*\*/g).forEach((t, i) => n.append(i % 2 ? el('span', { class: 'marca', text: t }) : t));
  return n;
}

function estrellasNodo(n, max = 3) {
  const p = el('p', { class: 'estrellas', 'aria-label': `${n} de ${max} estrellas` });
  for (let i = 0; i < max; i++) p.append(el('span', { class: i < n ? '' : 'off', 'aria-hidden': 'true', text: '★' }));
  return p;
}

// La planta: un tallo que crece y le salen hojas y, al final, una flor.
function pintaPlanta(svg, logradas, posibles) {
  const f = posibles ? Math.min(1, logradas / posibles) : 0;
  const alto = 16 + f * 170;
  const y0 = 205, y1 = y0 - alto;
  const hojas = Math.floor(f * 6);
  let h = `<rect x="22" y="205" width="76" height="12" fill="#4a4d49"/><path d="M28 205 L34 186 L86 186 L92 205Z" fill="#000"/>`;
  h += `<path class="tallo" d="M60 ${y0} C 54 ${y0 - alto * .35}, 66 ${y0 - alto * .65}, 60 ${y1}" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  for (let i = 0; i < hojas; i++) {
    const y = y0 - (i + 1) * (alto / 7);
    const izq = i % 2 === 0;
    h += `<path class="hoja" style="animation-delay:${i * 40}ms" d="M60 ${y} q ${izq ? -26 : 26} -6 ${izq ? -34 : 34} -22 q ${izq ? 16 : -16} 2 ${izq ? 34 : -34} 22Z" fill="var(--acento)" stroke="#000" stroke-width="2.5" stroke-linejoin="round"/>`;
  }
  if (f >= 0.8) {
    h += `<g class="flor" transform="translate(60 ${y1})">`;
    for (let i = 0; i < 6; i++) h += `<ellipse rx="7" ry="14" transform="rotate(${i * 60}) translate(0 -13)" fill="#fff" stroke="#000" stroke-width="2.5"/>`;
    h += `<circle r="8" fill="#000"/></g>`;
  }
  svg.innerHTML = h;
}

export async function arrancar(config, motor) {
  document.title = `${config.titulo} · Cajón maestro`;
  if (config.area) document.body.dataset.area = config.area;
  const pizarraInicial = new URLSearchParams(location.search).has('pizarra');

  const btnReto = el('button', { type: 'button', class: 'modo', 'aria-pressed': String(!pizarraInicial), text: config.textoReto || 'Reto' });
  const btnPiz = el('button', { type: 'button', class: 'modo', 'aria-pressed': String(pizarraInicial), text: 'Pizarra (sin puntos)' });
  const marcador = el('p', { class: 'marcador' });
  const reto = el('h2', { class: 'reto', 'aria-live': 'polite' });
  const pista = el('p', { class: 'pista' });
  const escenario = el('div', { class: 'escenario' });
  const acciones = el('div', { class: 'acciones' });
  const aviso = el('p', { class: 'aviso', role: 'status' });
  const resultado = el('div', { class: 'resultado', hidden: true });
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 120 220'); svg.setAttribute('aria-hidden', 'true');
  const plantaTxt = el('p', { text: 'Tu planta crece con cada estrella' });
  const planta = el('div', { class: 'planta' }, svg, plantaTxt);
  const zona = el('div', { class: 'zona-ronda' }, reto, pista, escenario, acciones, aviso, resultado);
  const final = el('section', { class: 'final', hidden: true, 'aria-live': 'polite' });

  document.body.prepend(el('div', { class: 'folio' },
    el('header', { class: 'cab' },
      el('div', {},
        el('a', { class: 'volver', href: config.volver || '../../' , text: '← Cajón maestro' }),
        el('h1', { text: config.titulo }),
        config.subtitulo && el('p', { text: config.subtitulo })),
      el('div', { class: 'modos', role: 'group', 'aria-label': 'Modo' }, btnReto, btnPiz)),
    marcador,
    el('div', { class: 'juego' }, el('main', {}, zona, final), planta)));

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
  btnReto.onclick = () => !pizarra || ponerModo(false);
  btnPiz.onclick = () => pizarra || ponerModo(true);

  let token = 0;
  async function partida() {
    const mio = ++token;
    final.hidden = true; zona.hidden = false;
    const rondas = [];
    for (const r of config.rondas) for (let i = 0; i < (r.repetir || 1); i++) rondas.push(r.generar ? motor.generar(r) : structuredClone(r));
    const logros = [];
    const posibles = rondas.length * 3;
    pintaPlanta(svg, 0, posibles); plantaTxt.textContent = 'Tu planta crece con cada estrella';
    for (let i = 0; i < rondas.length; i++) {
      if (mio !== token) return;
      const total = logros.reduce((a, b) => a + b.estrellas, 0);
      marcador.replaceChildren(
        el('span', {}, 'Ronda ', el('strong', { text: i + 1 }), ` de ${rondas.length}`),
        el('span', { class: 'puntos' }, 'Estrellas: ', el('strong', { text: total }), ` de ${posibles}`));
      reto.replaceChildren(); pista.replaceChildren(); escenario.replaceChildren(); acciones.replaceChildren();
      aviso.textContent = ''; aviso.className = 'aviso'; resultado.hidden = true; resultado.replaceChildren();
      const r = await new Promise((resolver) => {
        const ctx = {
          pizarra, escenario, acciones, datos: rondas[i], num, el,
          reto: (t) => reto.replaceChildren(marca(t)),
          pista: (t) => pista.replaceChildren(marca(t)),
          aviso: (t, mal = false) => { aviso.textContent = t || ''; aviso.className = 'aviso' + (mal ? ' mal' : ''); },
          boton: (texto, fn, sec = false) => { const b = el('button', { type: 'button', class: sec ? 'btn-sec' : 'btn', text: texto, onclick: fn }); acciones.append(b); return b; },
          fin: (estrellas, mensaje) => {
            acciones.replaceChildren(); aviso.textContent = '';
            const sig = el('button', { type: 'button', class: 'btn', text: i + 1 < rondas.length ? 'Siguiente →' : 'Ver cómo ha ido' });
            sig.onclick = () => resolver({ estrellas: pizarra ? 0 : estrellas, mensaje });
            resultado.replaceChildren(el('p', {}, marca(mensaje)), estrellasNodo(estrellas), sig);
            resultado.hidden = false;
            if (!pizarra) pintaPlanta(svg, logros.reduce((a, b) => a + b.estrellas, 0) + estrellas, posibles);
            sig.focus({ preventScroll: true });
            resultado.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          },
        };
        motor.ronda(rondas[i], ctx);
      });
      if (mio !== token) return;
      logros.push(r);
    }
    const total = logros.reduce((a, b) => a + b.estrellas, 0);
    zona.hidden = true;
    final.replaceChildren(
      el('h2', { text: pizarra ? 'Fin de la pizarra' : total >= posibles * .8 ? '¡Planta en flor!' : total >= posibles * .5 ? 'Bien encaminado' : 'A seguir regando' }),
      !pizarra && el('p', { class: 'total' }, el('strong', { text: total }), ` estrellas de ${posibles}.`),
      config.observa && el('div', { class: 'observa' }, el('strong', { text: '¿Qué observas?' }), marca(config.observa)),
      el('div', { class: 'acciones' },
        el('button', { type: 'button', class: 'btn', text: 'Otra partida', onclick: partida }),
        el('a', { class: 'btn-sec', href: config.volver || '../../', style: { display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }, text: 'Volver al cajón' })));
    final.hidden = false;
    plantaTxt.textContent = pizarra ? '' : `${total} ★`;
  }
  partida();
}
