// Motor «cifras»: una máquina con huecos y un montón de cifras.
// Hay que formar el número que cumple el reto (el mayor, el menor, el más cercano a…, par, impar, múltiplo de…).
// Con "aCiegas": true las cifras salen de una en una y hay que decidir dónde va cada una sin poder cambiarla.
import { el, num, barajar, azar, suena } from './nucleo.js';

const NOMBRES_ENT = ['U', 'D', 'C', 'UM', 'DM', 'CM', 'U. millón'];
const NOMBRES_DEC = ['d', 'c', 'm'];

function condicionTxt(c) {
  if (!c) return '';
  if (c === 'par') return 'par ';
  if (c === 'impar') return 'impar ';
  const [t, n] = String(c).split(':');
  if (t === 'multiplo') return `múltiplo de ${n} `;
  return '';
}
function cumple(c, v) {
  if (!c) return true;
  if (c === 'par') return Number.isInteger(v) && v % 2 === 0;
  if (c === 'impar') return Number.isInteger(v) && Math.abs(v % 2) === 1;
  const [t, n] = String(c).split(':');
  if (t === 'multiplo') return Number.isInteger(v) && v % Number(n) === 0;
  return true;
}
function porQueNo(c, v, cifrasTxt) {
  if (c === 'par') return `no es par: acaba en ${cifrasTxt.at(-1)}`;
  if (c === 'impar') return `no es impar: acaba en ${cifrasTxt.at(-1)}`;
  const [t, n] = String(c).split(':');
  if (t === 'multiplo') return `no es múltiplo de ${n}`;
  return 'no cumple el reto';
}

const valorDe = (cifras, dec) => {
  const s = cifras.join('');
  return dec ? Number(s.slice(0, s.length - dec) + '.' + s.slice(s.length - dec)) : Number(s);
};

// Todas las colocaciones posibles (permutaciones de k cifras de n), sin repetir números
function todas(cifras, k, dec, ceroDelante) {
  const res = new Map();
  const usadas = new Array(cifras.length).fill(false);
  const actual = [];
  (function rec() {
    if (actual.length === k) {
      if (!ceroDelante && k - dec > 1 && actual[0] === 0) return;
      const v = valorDe(actual, dec);
      if (!res.has(v)) res.set(v, [...actual]);
      return;
    }
    for (let i = 0; i < cifras.length; i++) {
      if (usadas[i]) continue;
      usadas[i] = true; actual.push(cifras[i]); rec(); actual.pop(); usadas[i] = false;
    }
  })();
  return res;
}

export function generar(spec) {
  const g = typeof spec.generar === 'object' ? spec.generar : {};
  const d = structuredClone(spec);
  delete d.generar;
  const n = g.cantidad ?? d.huecos;
  const base = g.sinRepetir === false ? Array.from({ length: n }, () => azar(0, 9)) : barajar([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n);
  if (g.conCero && !base.includes(0)) base[0] = 0;
  d.cifras = barajar(base);
  if (g.cerca) d.valor = azar(g.cerca[0], g.cerca[1]);
  return d;
}

export function ronda(d, ctx) {
  const k = d.huecos;
  const dec = d.decimales ?? 0;
  const objetivo = d.objetivo ?? 'max';
  const ent = k - dec;
  const condTxt = condicionTxt(d.condicion);
  const retoTxt = objetivo === 'cerca' ? `Forma el número ${condTxt}**más cercano a ${num(d.valor)}**`
    : `Forma el número ${condTxt}**más ${objetivo === 'max' ? 'grande' : 'pequeño'}** posible`;
  ctx.reto(d.texto ?? retoTxt);
  ctx.pista(d.pista ?? (d.aCiegas
    ? `Las cifras salen de una en una y no se pueden mover. Piensa dónde pones cada una: aún no sabes cuáles vendrán.`
    : `Toca una cifra y después el hueco donde va. ${d.cifras.length > k ? 'Sobran cifras: no hace falta usarlas todas.' : ''}`));

  const huecos = [];
  const ventanas = el('div', { class: 'ventanas', role: 'group', 'aria-label': 'Huecos del número' });
  const luces = [0, 1, 2].map(() => el('span', { class: 'luz' }));
  const maquina = el('div', { class: 'maquina' }, el('div', { class: 'placa' }, el('span', { text: 'Máquina de cifras' }), el('span', { class: 'luces', 'aria-hidden': 'true' }, luces)), ventanas);
  for (let i = 0; i < k; i++) {
    if (i === ent && dec) ventanas.append(el('span', { class: 'coma', 'aria-hidden': 'true', text: ',' }));
    const nombre = i < ent ? NOMBRES_ENT[ent - 1 - i] : NOMBRES_DEC[i - ent];
    const b = el('button', { type: 'button', 'aria-label': `Hueco de las ${nombre}, vacío` });
    const caja = el('div', { class: 'hueco-cifra' }, b, el('small', { text: nombre }));
    huecos.push({ b, caja, nombre, cifra: null, origen: null });
    ventanas.append(caja);
  }
  const monton = el('div', { class: 'tapete', role: 'group', 'aria-label': 'Cifras' });
  const sale = el('div', { class: 'saco', 'aria-live': 'assertive' });
  const comparar = el('p', { class: 'comparar' });
  ctx.escenario.append(maquina, d.aCiegas ? sale : monton, comparar);

  let hecho = false;
  const pintaHueco = (h) => {
    h.b.replaceChildren(h.cifra != null ? el('span', { class: 'ficha-cifra', 'aria-hidden': 'true', text: h.cifra }) : '');
    h.b.classList.toggle('lleno', h.cifra != null);
    h.b.setAttribute('aria-label', `Hueco de las ${h.nombre}, ${h.cifra ?? 'vacío'}`);
  };

  if (d.aCiegas) {
    const orden = barajar(d.cifras).slice(0, k);
    let paso = 0;
    const muestra = () => {
      huecos.forEach((h) => h.b.classList.toggle('espera', h.cifra == null));
      suena('clic');
      sale.replaceChildren(el('span', { class: 'ficha-cifra', text: orden[paso] }),
        el('div', {}, el('p', {}, 'Sale el ', el('strong', { text: orden[paso] }), '. ¿En qué hueco lo pones?'),
          el('p', { class: 'quedan', text: k - paso - 1 ? `Quedan ${k - paso - 1} por salir.` : 'Es la última.' })));
    };
    huecos.forEach((h) => (h.b.onclick = () => {
      if (hecho || h.cifra != null) return;
      h.cifra = orden[paso]; pintaHueco(h); suena('pon'); paso++;
      if (paso === k) { sale.replaceChildren(); huecos.forEach((x) => x.b.classList.remove('espera')); revisar(); } else muestra();
    }));
    muestra();
  } else {
    let elegida = null;
    const fichas = d.cifras.map((c, i) => {
      const b = el('button', { type: 'button', class: 'ficha-cifra', 'aria-pressed': 'false', text: c });
      b.onclick = () => {
        if (hecho) return;
        fichas.forEach((f) => f.setAttribute('aria-pressed', 'false'));
        elegida = elegida === i ? null : i;
        if (elegida != null) {
          b.setAttribute('aria-pressed', 'true'); suena('clic');
          // si solo queda un hueco vacío, va directa
          const vacios = huecos.filter((h) => h.cifra == null);
          if (vacios.length === 1 && d.cifras.length === k) poner(vacios[0]);
        }
      };
      monton.append(b);
      return b;
    });
    const poner = (h) => {
      if (h.origen != null) fichas[h.origen].classList.remove('usada');
      h.cifra = d.cifras[elegida]; h.origen = elegida;
      fichas[elegida].classList.add('usada'); fichas[elegida].setAttribute('aria-pressed', 'false');
      elegida = null; pintaHueco(h); suena('pon'); listo();
    };
    huecos.forEach((h) => (h.b.onclick = () => {
      if (hecho) return;
      if (elegida != null) return poner(h);
      if (h.cifra != null) { fichas[h.origen].classList.remove('usada'); h.cifra = null; h.origen = null; pintaHueco(h); suena('quita'); listo(); }
    }));
    const comprobar = ctx.boton('Comprobar', revisar);
    comprobar.disabled = true;
    ctx.boton('Vaciar', () => { huecos.forEach((h) => { if (h.origen != null) fichas[h.origen].classList.remove('usada'); h.cifra = h.origen = null; pintaHueco(h); }); listo(); }, true);
    function listo() { comprobar.disabled = huecos.some((h) => h.cifra == null); }
  }

  function revisar() {
    hecho = true;
    const puestas = huecos.map((h) => h.cifra);
    const v = valorDe(puestas, dec);
    const posibles = todas(d.cifras, k, dec, d.ceroDelante);
    const validos = [...posibles.keys()].filter((x) => cumple(d.condicion, x));
    const calidad = objetivo === 'max' ? (x) => -x : objetivo === 'min' ? (x) => x : (x) => Math.abs(x - d.valor);
    validos.sort((a, b) => calidad(a) - calidad(b));
    const mejor = validos[0];
    const tuTxt = num(v, dec || undefined);
    const mejorTxt = num(mejor, dec || undefined);
    let estrellas, msg;
    if (!d.ceroDelante && ent > 1 && puestas[0] === 0) {
      estrellas = 0; msg = `Empieza por 0, así que en realidad no tiene ${ent} cifras. El mejor era **${mejorTxt}**.`;
    } else if (!cumple(d.condicion, v)) {
      estrellas = 0; msg = `El ${tuTxt} ${porQueNo(d.condicion, v, puestas)}. El mejor era **${mejorTxt}**.`;
    } else {
      const idx = validos.indexOf(v);
      const frac = validos.length > 1 ? idx / (validos.length - 1) : 0;
      estrellas = idx === 0 ? 3 : frac <= (d.aCiegas ? 0.25 : 0.1) ? 2 : 1;
      const extra = objetivo === 'cerca' ? ` (está a ${num(Math.abs(v - d.valor), dec || undefined)})` : '';
      msg = idx === 0
        ? `**${tuTxt}**${extra}. ${d.aCiegas ? 'Con esas cifras no se podía hacer mejor.' : 'Es el mejor posible.'}`
        : `Tu número es el ${tuTxt}${extra}. ${d.aCiegas ? 'Sabiendo las cifras de antemano, lo mejor era' : 'Se podía'} **${mejorTxt}**${objetivo === 'cerca' ? ` (a ${num(Math.abs(mejor - d.valor), dec || undefined)})` : ''}. De ${validos.length} números posibles, el tuyo es el ${idx + 1}.º.`;
    }
    if (estrellas === 3) huecos.forEach((h) => h.caja.classList.add('bien'));
    luces.forEach((l, j) => j < estrellas && setTimeout(() => l.classList.add('on'), 150 + j * 140));
    comparar.replaceChildren();
    if (estrellas < 3 && mejor != null) comparar.append('El mejor: ', el('b', { text: mejorTxt }));
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}
