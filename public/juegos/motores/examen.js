// Motor «examen»: El examen del viernes.
//   estrategia → repartir operaciones entre Goma (de cabeza), Boli (en papel) y el Sacapuntas (calculadora).
//                No hay un único reparto bueno, pero algunos no tienen sentido. Lo que va a Goma, se calcula de cabeza.
//   cualquier reto de otro motor → con "motor": "giros" (u otro) en el nivel, la ronda la juega ese motor.
import { el, svg, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, bote, chispasEn, temblor, arrastra } from './efectos.js';
import { dibuja, POSES } from './personaje.js';
import * as formas from './formas.js';
import * as giros from './giros.js';
import * as reparto from './reparto.js';
import * as ceros from './ceros.js';
import * as multiplica from './multiplica.js';
import * as geoplano from './geoplano.js';

const OTROS = { formas, giros, reparto, ceros, multiplica, geoplano };
const lee = (input) => { const t = String(input.value).replace(/[\s.]/g, ''); return t === '' || !/^\d+$/.test(t) ? null : Number(t); };

// cada operación sabe para quién es más razonable: puntos para cabeza, papel y calculadora
const TIPOS = {
  ceros: () => { const a = azar(2, 9) * 10 ** azar(1, 2), b = azar(2, 9) * 10 ** azar(0, 1); return { txt: `${num(a)} × ${num(b)}`, res: a * b, pts: { cabeza: 2, papel: 1, calc: 0 }, por: 'tiene ceros: la tabla y luego los ceros' }; },
  casi: () => elige([
    () => { const a = azar(120, 880); return { txt: `${num(a)} + 999`, res: a + 999, por: '999 es casi 1 000: sumas 1 000 y quitas 1' }; },
    () => { const a = azar(2, 9); return { txt: `1 000 − ${a}`, res: 1000 - a, por: 'quitar tan poco a 1 000 se hace de cabeza' }; },
    () => { const a = azar(2, 9) * 4; return { txt: `25 × ${a}`, res: 25 * a, por: '25 × 4 son 100' }; },
    () => { const a = azar(2, 9) * 2; return { txt: `50 × ${a}`, res: 50 * a, por: '50 es la mitad de 100' }; },
    () => { const a = azar(11, 49); return { txt: `${a} × 10`, res: a * 10, por: 'por 10 es añadir un cero' }; },
  ])(),
  media: () => elige([
    () => { const a = azar(23, 89), b = azar(3, 9); return { txt: `${a} × ${b}`, res: a * b, por: 'se puede de cabeza, pero en papel es más seguro' }; },
    () => { const a = azar(234, 789), b = azar(156, 689); return { txt: `${num(a)} + ${num(b)}`, res: a + b, por: 'con llevadas, en papel no se pierde nada' }; },
    () => { const a = azar(512, 987), b = azar(178, 499); return { txt: `${num(a)} − ${num(b)}`, res: a - b, por: 'resta con llevadas: papel' }; },
  ])(),
  fea: () => elige([
    () => { const a = azar(1234, 9876), b = azar(23, 97); return { txt: `${num(a)} × ${b}`, res: a * b, por: 'números grandes y feos: calculadora' }; },
    () => { const a = azar(12345, 98765), b = azar(23, 89); return { txt: `${num(a)} : ${b}`, res: a / b, por: 'dividir entre un número de dos cifras así de grande: calculadora' }; },
    () => { const a = azar(2345, 8765), b = azar(123, 987); return { txt: `${num(a)} × ${num(b)}`, res: a * b, por: 'cuatro cifras por tres: calculadora' }; },
  ])(),
};
for (const k of ['casi', 'media', 'fea']) { const f = TIPOS[k]; TIPOS[k] = () => ({ ...f(), pts: { casi: { cabeza: 2, papel: 1, calc: 0 }, media: { cabeza: 1, papel: 2, calc: 1 }, fea: { cabeza: 0, papel: 1, calc: 2 } }[k], tipo: k }); }

export function generar(spec) {
  if (spec.motor && spec.motor !== 'examen' && OTROS[spec.motor]) return { ...OTROS[spec.motor].generar(spec), motor: spec.motor };
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  const mezcla = g.tipos ?? ['ceros', 'casi', 'media', 'media', 'fea', 'fea'];
  d.ops = barajar(mezcla.map((t) => ({ tipo: t, ...TIPOS[t]() })));
  return d;
}
export function ronda(d, ctx) {
  if (d.motor && OTROS[d.motor]) return OTROS[d.motor].ronda(d, ctx);
  return estrategia(d, ctx);
}

const CALC = `<svg viewBox="0 0 120 150" aria-hidden="true"><g stroke="#1b1e3a" stroke-width="5" stroke-linejoin="round"><rect x="10" y="8" width="100" height="134" rx="16" fill="#3b3f63"/><rect x="22" y="22" width="76" height="34" rx="6" fill="#b9d8a8"/>${[0, 1, 2].map((r) => [0, 1, 2].map((c) => `<rect x="${24 + c * 26}" y="${68 + r * 24}" width="20" height="16" rx="4" fill="${c === 2 ? '#ffc531' : '#e6e9f2'}" stroke-width="3"/>`).join('')).join('')}</g><g stroke="#1b1e3a" stroke-width="3.5" stroke-linecap="round"><circle cx="46" cy="38" r="3.5" fill="#1b1e3a"/><circle cx="74" cy="38" r="3.5" fill="#1b1e3a"/><path d="M50 48 q10 -6 20 0" fill="none"/></g></svg>`;
const QUIEN = [
  { k: 'cabeza', nombre: 'Goma', papel: 'De cabeza', dibujo: () => dibuja('goma', POSES.piensa) },
  { k: 'papel', nombre: 'Boli', papel: 'En papel', dibujo: () => dibuja('boli', POSES.seguro) },
  { k: 'calc', nombre: 'Sacapuntas', papel: 'Con calculadora', dibujo: () => CALC },
];

function estrategia(d, ctx) {
  ctx.reto(d.texto ?? 'Reparte las cuentas: **¿quién hace cada una?**');
  ctx.pista(d.pista ?? 'Arrastra cada cuenta a quien la haría mejor. Lo que le des a Goma lo tendrás que calcular tú de cabeza.');
  const cola = el('div', { class: 'cola-cuentas', role: 'group', 'aria-label': 'Cuentas por repartir' });
  const mesas = QUIEN.map((q) => {
    const zona = el('div', { class: 'zona-cuentas', role: 'button', tabindex: '0', 'aria-label': `${q.nombre}: ${q.papel}` });
    const m = el('div', { class: 'mesa-quien ' + q.k }, el('div', { class: 'cab-quien' }, el('div', { class: 'cara-quien', html: q.dibujo() }), el('div', {}, el('b', { text: q.nombre }), el('small', { text: q.papel }))), zona);
    zona._k = q.k;
    return { ...q, m, zona };
  });
  ctx.escenario.append(el('div', { class: 'examen-mesa' }, cola, el('div', { class: 'mesas-quien' }, mesas.map((x) => x.m))));
  let hecho = false, fase = 'repartir', elegida = null;
  const cartas = d.ops.map((o, i) => {
    const b = el('button', { type: 'button', class: 'carta-cuenta c' + (i % 6), text: o.txt });
    const c = { o, b, en: null };
    arrastra(b, {
      puede: () => fase === 'repartir',
      destinos: () => [...mesas.map((x) => x.zona), cola],
      alTocar: () => { if (fase !== 'repartir') return; elige1(c); },
      alSoltar: (dest) => { pon(c, dest); return b; },
    });
    cola.append(b);
    return c;
  });
  const elige1 = (c) => { elegida = elegida === c ? null : c; cartas.forEach((x) => x.b.classList.toggle('elegida', x === elegida)); suena('clic'); };
  mesas.forEach((x) => x.zona.addEventListener('click', (e) => { if (fase !== 'repartir' || e.target.closest('.carta-cuenta') || !elegida) return; const c = elegida; elegida = null; c.b.classList.remove('elegida'); pon(c, x.zona); }));
  function pon(c, dest) {
    if (dest === cola) { c.en = null; cola.append(c.b); }
    else { c.en = dest._k; dest.append(c.b); }
    suena('pon'); listo();
  }
  const boton = ctx.boton('Repartir', siguiente);
  const listo = () => { boton.disabled = fase === 'repartir' ? cartas.some((c) => !c.en) : false; };
  listo();
  async function siguiente() {
    if (hecho) return;
    if (fase === 'repartir') {
      fase = 'calcular'; boton.textContent = 'Comprobar';
      // Boli escribe en papel y el Sacapuntas teclea; las de Goma, de cabeza (las calcula el alumno)
      for (const c of cartas) {
        c.b.classList.add('fija');
        if (c.en === 'cabeza') {
          const i = el('input', { class: 'campo-num', inputmode: 'numeric', autocomplete: 'off', 'aria-label': `Resultado de ${c.o.txt}`, style: { width: '7ch' } });
          i.addEventListener('input', () => (i.value = i.value.replace(/[^\d]/g, '')));
          c.input = i;
          c.b.after(el('label', { class: 'calcula-cabeza' }, el('span', { text: '=' }), i));
        } else {
          await espera(220);
          const txt = Number.isInteger(c.o.res) ? num(c.o.res) : num(Math.round(c.o.res * 100) / 100, 2);
          c.b.after(el('span', { class: 'resultado-cuenta ' + c.en, text: '= ' + txt }));
          suena(c.en === 'calc' ? 'clic' : 'quita');
        }
      }
      const de = cartas.filter((c) => c.en === 'cabeza');
      if (de.length) { ctx.di(de.length === 1 ? 'Esa me la has dado a mí. **Calcúlala tú de cabeza**, que yo te miro.' : `Me has dado ${de.length}. **Calcúlalas de cabeza**, sin papel.`, 'pista', 5000); de[0].input.focus({ preventScroll: true }); }
      else return revisar();
      return;
    }
    revisar();
  }
  async function revisar() {
    if (hecho) return;
    const sinCalcular = cartas.filter((c) => c.en === 'cabeza' && lee(c.input) == null);
    if (sinCalcular.length) return ctx.aviso('Te falta calcular alguna de cabeza.', true);
    hecho = true; boton.disabled = true;
    let pts = 0, max = 0, malCalc = 0;
    const comentarios = [];
    for (const c of cartas) {
      const p = c.o.pts[c.en]; pts += p; max += 2;
      c.b.classList.add(p === 2 ? 'buena' : p === 1 ? 'regular' : 'mala');
      if (c.en === 'cabeza') { const ok = lee(c.input) === c.o.res; c.input.classList.add(ok ? 'bien' : 'mal'); if (!ok) malCalc++; }
      if (p === 0) comentarios.push(`${c.o.txt}: ${c.o.por}.`);
      await espera(120); suena(p === 2 ? 'selloBien' : p ? 'pon' : 'selloMal', 0);
    }
    const f = pts / max;
    let estrellas = f >= 0.85 ? 3 : f >= 0.65 ? 2 : f >= 0.45 ? 1 : 0;
    estrellas = Math.max(0, estrellas - malCalc);
    ctx.fin(estrellas, (f >= 0.85 ? '**Buen reparto.** ' : 'Algún reparto no tiene mucho sentido. ') + (comentarios[0] ? comentarios[0] + ' ' : '') + (malCalc ? `Y de cabeza ${malCalc === 1 ? 'una no salió' : `${malCalc} no salieron`}. ` : '') + 'No hay un reparto único: lo que cuenta es elegir la herramienta que menos trabajo da sin equivocarse.');
  }
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'Mira los números antes de calcular: ¿tienen ceros?, ¿están cerca de 100 o de 1 000?, ¿son enormes?' },
    { texto: d.pistas?.[1] ?? 'Las que tienen ceros o salen redondas son para Goma. Las de números enormes, para el Sacapuntas.' },
    { texto: d.pistas?.[2] ?? 'Te coloco una.', ver: () => { const c = cartas.find((x) => !x.en); if (!c) return; const mejor = Object.entries(c.o.pts).sort((a, b) => b[1] - a[1])[0][0]; pon(c, mesas.find((m) => m.k === mejor).zona); } },
  ]);
}
