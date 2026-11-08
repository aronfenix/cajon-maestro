// Motor «cifras»: una máquina con huecos y un montón de cifras.
// Hay que formar el número que cumple el reto (el mayor, el menor, el más cercano a…, par, impar, múltiplo de…).
// Con "aCiegas": true las cifras salen de una en una y hay que decidir dónde va cada una sin poder cambiarla.
import { el, num, barajar, azar, suena } from './nucleo.js';
import { vuela, espera, mano, chispasEn, temblor, arrastra, bote } from './efectos.js';

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
    : `Arrastra cada cifra a su hueco (o tócala y toca el hueco). ${d.cifras.length > k ? 'Sobran cifras: no hace falta usarlas todas.' : ''}`));

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

  let hecho = false, fichasRef = [];
  const pintaHueco = (h) => {
    h.b.replaceChildren(h.cifra != null ? el('span', { class: 'ficha-cifra', 'aria-hidden': 'true', text: h.cifra }) : '');
    h.b.classList.toggle('lleno', h.cifra != null);
    h.b.setAttribute('aria-label', `Hueco de las ${h.nombre}, ${h.cifra ?? 'vacío'}`);
  };

  if (d.aCiegas) {
    const orden = barajar(d.cifras).slice(0, k);
    let paso = 0, ocupado = false;
    const ponEn = (h, volando) => {
      if (hecho || h.cifra != null || ocupado) return false;
      ocupado = true;
      const origen = sale.querySelector('.ficha-cifra');
      const fin = () => {
        h.cifra = orden[paso]; pintaHueco(h); suena('pon'); bote(h.b, 5); paso++; ocupado = false;
        if (paso === k) { sale.replaceChildren(); huecos.forEach((x) => x.b.classList.remove('espera')); revisar(); } else muestra();
      };
      if (origen && volando) { const c = origen.cloneNode(true); origen.style.visibility = 'hidden'; vuela(origen, h.b, c, { ms: 340, escala: 'ajusta', alFinal: fin }); }
      else { if (origen) origen.style.visibility = 'hidden'; fin(); }
    };
    const muestra = () => {
      huecos.forEach((h) => h.b.classList.toggle('espera', h.cifra == null));
      suena('clic');
      const ficha = el('span', { class: 'ficha-cifra arrastrable', text: orden[paso] });
      arrastra(ficha, {
        puede: () => !hecho && !ocupado,
        destinos: () => huecos.filter((h) => h.cifra == null).map((h) => h.b),
        alSoltar: (dest) => { const h = huecos.find((x) => x.b === dest); if (!h || ponEn(h, false) === false) return false; return h.b; },
      });
      sale.replaceChildren(ficha,
        el('div', {}, el('p', {}, 'Sale el ', el('strong', { text: orden[paso] }), '. ¿En qué hueco lo pones?'),
          el('p', { class: 'quedan', text: k - paso - 1 ? `Quedan ${k - paso - 1} por salir.` : 'Es la última.' })));
    };
    huecos.forEach((h) => (h.b.onclick = () => ponEn(h, true)));
    muestra();
  } else {
    let elegida = null;
    const huecoDe = (nodo) => huecos.find((h) => h.b === nodo);
    // coloca la cifra i en el hueco h (si el hueco estaba lleno, la anterior vuelve al tapete)
    const colocar = (h, i, volando) => {
      if (h.origen != null) fichas[h.origen].classList.remove('usada');
      const f = fichas[i];
      h.cifra = d.cifras[i]; h.origen = i;
      f.setAttribute('aria-pressed', 'false'); f.classList.add('usada');
      elegida = null; listo();
      if (volando) {
        const c = f.cloneNode(true); c.removeAttribute('aria-pressed');
        h.b.replaceChildren(); h.b.classList.add('lleno');
        vuela(f, h.b, c, { ms: 300, escala: 'ajusta', alFinal: () => { pintaHueco(h); suena('pon'); bote(h.b, 5); } });
      } else { pintaHueco(h); suena('pon'); }
    };
    const vaciar = (h) => { if (h.origen != null) fichas[h.origen].classList.remove('usada'); h.cifra = h.origen = null; pintaHueco(h); };
    const fichas = fichasRef = d.cifras.map((c, i) => {
      const b = el('button', { type: 'button', class: 'ficha-cifra', 'aria-pressed': 'false', text: c });
      arrastra(b, {
        puede: () => !hecho && !b.classList.contains('usada'),
        destinos: () => huecos.map((h) => h.b),
        alSoltar: (dest) => { const h = huecoDe(dest); if (!h) return false; colocar(h, i, false); return h.b; },
        alTocar: () => {
          if (hecho || b.classList.contains('usada')) return;
          fichas.forEach((f) => f.setAttribute('aria-pressed', 'false'));
          elegida = elegida === i ? null : i;
          if (elegida != null) {
            b.setAttribute('aria-pressed', 'true'); suena('clic');
            // si solo queda un hueco vacío, va directa
            const vacios = huecos.filter((h) => h.cifra == null);
            if (vacios.length === 1 && d.cifras.length === k) colocar(vacios[0], i, true);
          }
        },
      });
      monton.append(b);
      return b;
    });
    huecos.forEach((h) => {
      // una cifra ya puesta se puede arrastrar a otro hueco (se intercambian) o devolver al tapete
      arrastra(h.b, {
        puede: () => !hecho && h.cifra != null,
        destinos: () => [...huecos.filter((x) => x !== h).map((x) => x.b), monton],
        alSoltar: (dest) => {
          const otro = huecoDe(dest);
          if (!otro) { const f = fichas[h.origen]; vaciar(h); suena('quita'); listo(); return f; }
          const a = h.origen, bo = otro.origen;
          vaciar(h); vaciar(otro);
          colocar(otro, a, false);
          if (bo != null) colocar(h, bo, false);
          listo(); return otro.b;
        },
        alTocar: () => {
          if (hecho) return;
          if (elegida != null) return colocar(h, elegida, true);
          if (h.cifra != null) { vaciar(h); suena('quita'); listo(); }
        },
      });
    });
    if (ctx.primera) mano(fichas[0], { tipo: 'arrastra', dx: 0.5, hasta: huecos[0].b });
    const comprobar = ctx.boton('Comprobar', revisar);
    comprobar.disabled = true;
    ctx.boton('Vaciar', () => { huecos.forEach(vaciar); listo(); }, true);
    function listo() { comprobar.disabled = huecos.some((h) => h.cifra == null); }
  }

  // pistas: la condición, la posición decisiva y, si hace falta, la primera cifra
  const mejorDe = () => {
    const posibles = todas(d.cifras, k, dec, d.ceroDelante);
    const val = [...posibles.keys()].filter((x) => cumple(d.condicion, x));
    const cal = objetivo === 'max' ? (x) => -x : objetivo === 'min' ? (x) => x : (x) => Math.abs(x - d.valor);
    val.sort((a, b) => cal(a) - cal(b));
    return posibles.get(val[0]);
  };
  const p1 = d.condicion === 'par' ? 'Para que sea par, **la última cifra** tiene que ser 0, 2, 4, 6 u 8.'
    : d.condicion === 'impar' ? 'Para que sea impar, **la última cifra** tiene que ser 1, 3, 5, 7 o 9.'
    : String(d.condicion || '').startsWith('multiplo:5') ? 'Los múltiplos de 5 acaban en **0 o en 5**.'
    : objetivo === 'max' ? 'La cifra de **la izquierda** es la que más vale: ahí va la más grande que puedas.'
    : objetivo === 'min' ? 'A la izquierda va la más pequeña… pero **el 0 no puede ir delante**.'
    : `Fíjate en cómo empieza el ${num(d.valor)}: tu número debería empezar por **una cifra parecida**.`;
  const p2 = d.aCiegas ? 'Si sale una cifra grande, guárdala para **la izquierda**; si es pequeña, para **la derecha**.'
    : d.condicion ? 'Primero asegura la última cifra; luego ordena las demás de izquierda a derecha.'
    : 'Este es el hueco que más importa. Decide primero qué cifra va ahí.';
  ctx.pistas([
    { texto: d.pistas?.[0] ?? p1 },
    { texto: d.pistas?.[1] ?? p2, ver: () => huecos[d.condicion ? k - 1 : 0].caja.classList.add('pista-hueco') },
    d.aCiegas ? { texto: d.pistas?.[2] ?? `Una cifra de las que no han salido puede cambiarlo todo. Si ahora sale una grande, ¿dónde te conviene?` }
      : { texto: d.pistas?.[2] ?? 'Te pongo la primera cifra. Termina tú.', ver: () => {
        const m = mejorDe(); if (!m || hecho) return;
        const h0 = huecos[0];
        if (h0.cifra === m[0]) return;
        if (h0.origen != null) { fichasRef[h0.origen].classList.remove('usada'); h0.cifra = h0.origen = null; pintaHueco(h0); }
        const idx = d.cifras.findIndex((c, j) => c === m[0] && !fichasRef[j].classList.contains('usada'));
        if (idx >= 0) { fichasRef[idx].click(); if (fichasRef[idx].getAttribute('aria-pressed') === 'true') h0.b.click(); }
      } },
  ]);

  async function revisar() {
    if (hecho) return;
    hecho = true;
    ctx.acciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
    maquina.classList.add('piensa');
    for (let t = 0; t < 6; t++) setTimeout(() => suena('clic'), t * 120);
    await espera(780);
    maquina.classList.remove('piensa');
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
    luces.forEach((l, j) => j < estrellas && setTimeout(() => l.classList.add('on'), 60 + j * 140));
    if (estrellas === 3) setTimeout(() => chispasEn(maquina, 22), 420);
    if (estrellas === 0) temblor(maquina, 9);
    comparar.replaceChildren();
    if (estrellas < 3 && mejor != null) comparar.append('El mejor: ', el('b', { text: mejorTxt }));
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}
