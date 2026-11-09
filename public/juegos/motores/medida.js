// Motor «medida»: la caseta de los récords. Golosinas y cachivaches de feria sobre el mostrador, y una regla que se arrastra.
//   mide        → ¿cuánto mide? (la regla puede estar en su sitio o no)
//   rota        → la regla está rota y no empieza en 0
//   diferencia  → dos cosas: ¿cuántos centímetros más mide una que otra?
import { el, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, chispasEn, temblor, mano } from './efectos.js';
import { campo, lee, conIntro, porIntento, T } from './kit.js';

// cada objeto se dibuja con su largo exacto L (en píxeles), de punta a punta
const OBJ = {
  churro: { nombre: 'el churro', h: 30, cm: [8, 15], d: (L, h) => `<path d="M${h / 2} 4 H${L - h / 2} a${h / 2 - 4} ${h / 2 - 4} 0 0 1 0 ${h - 8} H${h / 2} a${h / 2 - 4} ${h / 2 - 4} 0 0 1 0 ${-(h - 8)}Z" fill="#e3a24f" stroke="${T}" stroke-width="3"/>${Array.from({ length: Math.floor(L / 14) }, (_, i) => `<path d="M${10 + i * 14} 8 v${h - 16}" stroke="#b5732a" stroke-width="3" stroke-linecap="round"/>`).join('')}${Array.from({ length: Math.floor(L / 9) }, (_, i) => `<circle cx="${8 + i * 9}" cy="${8 + ((i * 7) % (h - 14))}" r="1.6" fill="#fffdf6"/>`).join('')}<path d="M0 ${h / 2} h4 M${L - 4} ${h / 2} h4" stroke="${T}" stroke-width="2"/>` },
  regaliz: { nombre: 'el regaliz', h: 20, cm: [6, 16], d: (L, h) => `<rect x="1.5" y="3" width="${L - 3}" height="${h - 6}" rx="5" fill="#d7263d" stroke="${T}" stroke-width="3"/>${Array.from({ length: Math.floor(L / 10) }, (_, i) => `<path d="M${6 + i * 10} ${h - 5} l8 ${-(h - 10)}" stroke="#8f1020" stroke-width="2.5"/>`).join('')}` },
  piruleta: { nombre: 'la piruleta', h: 44, cm: [7, 13], d: (L, h) => { const r = h / 2 - 2; return `<rect x="0" y="${h / 2 - 3}" width="${L - 2 * r}" height="6" rx="3" fill="#fffdf6" stroke="${T}" stroke-width="2.5"/><circle cx="${L - r}" cy="${h / 2}" r="${r - 1.5}" fill="#ff7fae" stroke="${T}" stroke-width="3"/><path d="M${L - r} ${h / 2} m-3 0 a3 3 0 1 1 6 0 a7 7 0 1 1 -12 0 a11 11 0 1 1 20 0 a14 14 0 0 1 -6 11" fill="none" stroke="#fffdf6" stroke-width="3.5" stroke-linecap="round"/>`; } },
  lapiz: { nombre: 'el lápiz', h: 24, cm: [5, 15], d: (L, h) => `<path d="M0 ${h / 2} L${h * 0.9} 3 V${h - 3}Z" fill="#f4d9a8" stroke="${T}" stroke-width="2.5" stroke-linejoin="round"/><path d="M0 ${h / 2} L${h * 0.3} ${h / 2 - 3.5} V${h / 2 + 3.5}Z" fill="${T}"/><rect x="${h * 0.9}" y="3" width="${L - h * 0.9 - 14}" height="${h - 6}" fill="#2f5bd3" stroke="${T}" stroke-width="2.5"/><rect x="${L - 14}" y="3" width="12.5" height="${h - 6}" rx="3" fill="#ff7fae" stroke="${T}" stroke-width="2.5"/><path d="M${h} 9 H${L - 18}" stroke="#fff" stroke-width="2.5" opacity=".5"/>` },
  peine: { nombre: 'el peine', h: 30, cm: [6, 14], d: (L, h) => `<rect x="1.5" y="2" width="${L - 3}" height="10" rx="4" fill="#9bd84a" stroke="${T}" stroke-width="2.5"/>${Array.from({ length: Math.floor((L - 8) / 6) }, (_, i) => `<rect x="${5 + i * 6}" y="11" width="3" height="${h - 14}" rx="1.4" fill="#9bd84a" stroke="${T}" stroke-width="1.6"/>`).join('')}` },
  pajita: { nombre: 'la pajita', h: 16, cm: [9, 18], d: (L, h) => `<rect x="1.5" y="3" width="${L - 3}" height="${h - 6}" rx="4" fill="#fffdf6" stroke="${T}" stroke-width="2.5"/>${Array.from({ length: Math.floor(L / 12) }, (_, i) => `<path d="M${4 + i * 12} ${h - 4} l7 ${-(h - 8)}" stroke="#2f5bd3" stroke-width="4"/>`).join('')}` },
  flecha: { nombre: 'la flecha', h: 30, cm: [8, 16], d: (L, h) => `<path d="M0 4 L14 ${h / 2} L0 ${h - 4} M8 4 L22 ${h / 2} L8 ${h - 4}" fill="none" stroke="#e8417a" stroke-width="5" stroke-linejoin="round"/><rect x="8" y="${h / 2 - 2.5}" width="${L - 26}" height="5" fill="#d39a5c" stroke="${T}" stroke-width="2"/><path d="M${L - 20} 5 L${L} ${h / 2} L${L - 20} ${h - 5}Z" fill="#c9cfdd" stroke="${T}" stroke-width="2.5" stroke-linejoin="round"/>` },
  gusanito: { nombre: 'el gusanito', h: 22, cm: [4, 12], d: (L, h) => `<rect x="1.5" y="3" width="${L - 3}" height="${h - 6}" rx="${h / 2 - 3}" fill="#ffc531" stroke="${T}" stroke-width="3"/><rect x="${L / 2}" y="3" width="${L / 2 - 1.5}" height="${h - 6}" rx="${h / 2 - 3}" fill="#e8417a" stroke="${T}" stroke-width="3"/><circle cx="${L - 9}" cy="${h / 2 - 2}" r="2.2" fill="${T}"/>` },
  varita: { nombre: 'la varita', h: 40, cm: [8, 15], d: (L, h) => { const r = h / 2 - 1; const pts = Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, q = i % 2 ? r * 0.45 : r; return `${(L - r + Math.cos(a) * q).toFixed(1)} ${(h / 2 + Math.sin(a) * q).toFixed(1)}`; }); return `<rect x="0" y="${h / 2 - 3}" width="${L - r}" height="6" rx="3" fill="#b79cff" stroke="${T}" stroke-width="2.5"/><path d="M${pts.join(' L')}Z" fill="#ffc531" stroke="${T}" stroke-width="2.5" stroke-linejoin="round"/>`; } },
  tiza: { nombre: 'la tiza', h: 20, cm: [3, 8], d: (L, h) => `<rect x="1.5" y="3" width="${L - 3}" height="${h - 6}" rx="3" fill="#fffdf6" stroke="${T}" stroke-width="2.5"/><path d="M6 8 h${L - 16}" stroke="#d9dbe6" stroke-width="3"/>` },
};
// la puntita del extremo de la estrella no llega del todo al borde: se ajusta para que el largo sea exacto
const largo = (k, cm, px) => cm * px;

export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  const claves = barajar(g.objetos ?? Object.keys(OBJ));
  const toma = (k, evita) => { let c; do c = azar(...OBJ[k].cm); while (c === evita); return c; };
  d.objetos = [{ k: claves[0], cm: toma(claves[0]) }];
  if (d.modo === 'diferencia') { const c2 = toma(claves[1], d.objetos[0].cm); d.objetos.push({ k: claves[1], cm: c2 }); }
  d.inicioRegla = d.modo === 'rota' ? azar(2, 5) : 0;
  return d;
}

export function ronda(d, ctx) {
  const [A, B] = d.objetos;
  const dif = d.modo === 'diferencia';
  const largoA = OBJ[A.k].nombre, largoB = B && OBJ[B.k].nombre;
  const mayor = B && (A.cm >= B.cm ? A : B), menor = B && (A.cm >= B.cm ? B : A);
  const sol = dif ? mayor.cm - menor.cm : A.cm;
  ctx.reto(d.texto ?? (dif ? `¿Cuántos centímetros más mide **${OBJ[mayor.k].nombre}** que **${OBJ[menor.k].nombre}**?` : `¿Cuánto mide **${largoA}**?`));
  ctx.pista(d.pista ?? (d.modo === 'rota' ? 'Esta regla está rota: no empieza en 0. Arrástrala y mira bien dónde empieza y dónde acaba.' : d.fija ? 'La regla ya está puesta. Lee dónde acaba.' : 'Arrastra la regla por debajo para medir. Tú decides dónde ponerla.'));
  const mesa = el('div', { class: 'mostrador-records' });
  const zona = el('div', { class: 'caseta-records' }, el('div', { class: 'pizarra-records' }, el('small', { text: 'Récord de hoy' }), el('b', { text: dif ? 'La diferencia' : OBJ[A.k].nombre.replace(/^(el|la) /, '') })), mesa);
  ctx.escenario.append(zona);
  const ancho = mesa.getBoundingClientRect().width || 600;
  const tramo = d.modo === 'rota' ? 17 : 20; // centímetros que tiene la regla
  const cm = Math.max(14, Math.min(36, Math.floor((ancho - 30) / (tramo + 3))));
  const fila = (o, y) => {
    const L = o.cm * cm, h = OBJ[o.k].h;
    const n = el('div', { class: 'objeto-records', style: { width: L + 'px', height: h + 'px', top: y - h + 'px' }, html: `<svg viewBox="0 0 ${L} ${h}" width="${L}" height="${h}" aria-hidden="true">${OBJ[o.k].d(L, h)}</svg>` });
    mesa.append(n); return n;
  };
  const yRegla = dif ? 132 : 76;
  // dónde empiezan los objetos: nunca en el borde, para que haya que mover la regla
  const libre = ancho - 40 - Math.max(A.cm, B?.cm ?? 0) * cm;
  const xA = 20 + Math.round(Math.random() * Math.max(0, libre) * 0.8 / cm) * cm + (d.fija ? 0 : Math.round(cm * 0.3));
  const xB = B ? 20 + Math.round(Math.random() * Math.max(0, ancho - 40 - B.cm * cm) * 0.8 / cm) * cm + (d.fija ? 0 : Math.round(cm * 0.3)) : 0;
  const nA = fila(A, dif ? 54 : yRegla - 2); nA.style.left = xA + 'px';
  const nB = B && fila(B, yRegla - 2); if (nB) nB.style.left = xB + 'px';
  // las líneas de lectura: del final de cada objeto hasta la regla
  if (d.guias !== false) for (const [o, x, n] of [[A, xA, nA], B && [B, xB, nB]].filter(Boolean)) {
    const top = parseFloat(n.style.top);
    for (const gx of [x, x + o.cm * cm]) mesa.append(el('span', { class: 'guia-records', style: { left: gx + 'px', top: top + 'px', height: yRegla - top + 40 + 'px' } }));
  }
  mesa.style.height = yRegla + 64 + 'px';
  // la regla
  const ini = d.inicioRegla, W = (tramo + 1) * cm;
  let marcas = '';
  for (let m = 0; m <= tramo * 10; m++) { const x = 12 + (m * cm) / 10, alto = m % 10 === 0 ? 20 : m % 5 === 0 ? 14 : 9; marcas += `<path d="M${x.toFixed(1)} 0 v${alto}" stroke="${T}" stroke-width="${m % 10 ? 1.2 : 2}"/>`; if (m % 10 === 0) marcas += `<text x="${x.toFixed(1)}" y="38" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="800" font-size="${Math.min(15, cm * 0.6)}" fill="${T}">${ini + m / 10}</text>`; }
  const borde = d.modo === 'rota' ? `M0 2 L6 12 L1 22 L7 32 L2 46` : '';
  const regla = el('div', { class: 'regla-records' + (d.modo === 'rota' ? ' rota' : ''), tabindex: 0, role: 'slider', 'aria-label': 'Regla', style: { width: W + 24 + 'px', top: yRegla + 'px' }, html: `<svg viewBox="0 0 ${W + 24} 48" width="${W + 24}" height="48" aria-hidden="true"><rect x="1" y="1" width="${W + 22}" height="46" rx="${d.modo === 'rota' ? 2 : 6}" fill="#ffe27a" fill-opacity=".92" stroke="${T}" stroke-width="2.5"/>${borde ? `<path d="${borde}" fill="none" stroke="${T}" stroke-width="3"/>` : ''}${marcas}<text x="${W + 6}" y="40" text-anchor="end" font-family="Rotulo,sans-serif" font-weight="800" font-size="11" fill="${T}" opacity=".6">cm</text></svg>` });
  mesa.append(regla);
  // la regla se coloca: fija (el 0 en el principio del objeto), o fuera de sitio
  const origen = d.fija ? xA - 12 : Math.min(ancho - W - 30, Math.max(-10, xA - 12 + (Math.random() < 0.5 ? -1 : 1) * azar(2, 4) * cm + Math.round(cm * 0.4)));
  let x = d.fija ? origen : origen;
  regla.style.left = x + 'px';
  if (!d.fija) {
    let arr = null;
    regla.style.touchAction = 'none';
    regla.addEventListener('pointerdown', (e) => { if (hecho) return; arr = { x0: e.clientX, l0: x }; regla.setPointerCapture?.(e.pointerId); regla.classList.add('moviendo'); suena('coge'); });
    regla.addEventListener('pointermove', (e) => { if (!arr) return; x = Math.max(-W * 0.6, Math.min(ancho - 40, arr.l0 + e.clientX - arr.x0)); regla.style.left = x + 'px'; });
    const suelta = () => { if (!arr) return; arr = null; regla.classList.remove('moviendo'); suena('pon'); };
    regla.addEventListener('pointerup', suelta); regla.addEventListener('pointercancel', suelta);
    regla.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); x += (e.key === 'ArrowRight' ? 1 : -1) * (cm / 10); regla.style.left = x + 'px'; } });
    if (ctx.primera) mano(regla, { tipo: 'arrastra', dx: 0.3, demora: 2000 });
  }
  // la respuesta
  const i = campo('Centímetros', 4);
  const etiqueta = el('label', { class: 'prediccion' }, el('span', { text: dif ? 'Mide' : 'Mide' }), i, el('span', { text: dif ? 'cm más' : 'cm' }));
  zona.append(etiqueta);
  let hecho = false, intento = 0;
  const llaves = () => {
    // la corrección: una llave sobre lo que mide
    const pon = (o, xo, n) => mesa.append(el('span', { class: 'llave-records', style: { left: xo + 'px', width: o.cm * cm + 'px', top: parseFloat(n.style.top) - 22 + 'px' } }, el('b', { text: o.cm + ' cm' })));
    pon(A, xA, nA); if (B) pon(B, xB, nB);
  };
  const boton = ctx.boton('Comprobar', () => {
    if (hecho) return;
    const v = lee(i); if (v == null) return ctx.aviso('Escribe cuántos centímetros.', true);
    intento++;
    if (v === sol) {
      hecho = true; boton.disabled = true; i.classList.add('bien'); i.readOnly = true;
      llaves(); chispasEn(i, 12, '#ffc531');
      return ctx.fin(porIntento(intento), dif ? `**${sol} cm más.** ${OBJ[mayor.k].nombre} mide ${mayor.cm} cm y ${OBJ[menor.k].nombre}, ${menor.cm} cm: ${mayor.cm} − ${menor.cm} = ${sol}.` : `**${sol} cm.** ${d.modo === 'rota' ? `Empieza en el ${ini + Math.round((xA - x - 12) / cm)} y acaba en el ${ini + Math.round((xA - x - 12) / cm) + sol}: se resta.` : '¡Récord apuntado!'}`);
    }
    i.classList.add('mal'); temblor(i, 5); suena('mal');
    if (intento >= 2) {
      hecho = true; boton.disabled = true; i.readOnly = true; llaves();
      return ctx.fin(0, dif ? `Eran **${sol} cm**. Se mide cada uno y se restan: ${mayor.cm} − ${menor.cm}.` : `Medía **${sol} cm**. ${d.modo === 'rota' || x !== origen ? 'Cuenta los centímetros que hay entre el principio y el final, no el número donde acaba.' : 'Hay que mirar dónde empieza también.'}`);
    }
    const leido = Math.round((xA + A.cm * cm - x - 12) / cm) + ini;
    ctx.aviso(v === leido && v !== sol ? `${v} es el número donde acaba… pero ¿dónde empieza?` : 'No es eso. Coloca bien la regla y vuelve a mirar.', true);
  });
  conIntro(i, () => boton.click());
  ctx.pistas([
    { texto: d.modo === 'rota' ? 'Mira el número donde **empieza** y el número donde **acaba**. Lo que mide es la diferencia.' : 'Pon el **0** de la regla justo donde empieza. Así, donde acaba es lo que mide.' },
    { texto: 'Cuenta los saltos de centímetro, uno a uno, de principio a fin.', ver: () => mesa.classList.add('cuenta-cm') },
    { texto: dif ? `${OBJ[A.k].nombre} mide ${A.cm} cm. Ahora mide ${OBJ[B.k].nombre}.` : `Te coloco la regla.`, ver: () => { if (dif) return; x = xA - 12 - ini * 0; if (d.modo === 'rota') x = xA - 12; gsap.to(regla, { left: x, duration: 0.5, ease: 'power2.out' }); } },
  ]);
}
