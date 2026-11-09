// Motor «linea»: dos atracciones para estimar sobre una recta.
//   martillo → el martillo de fuerza: una torre de 0 a 10 000. Se marca a ojo hasta dónde llegará
//              el resultado de una cuenta (o se elige el globo más cercano) y luego se da el golpe.
//   tirolina → un cable de 0 a 10 000 (o a un millón): llevar a Goma hasta un número, o leer dónde se ha parado.
import { el, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, chispasEn, temblor, bote, mano } from './efectos.js';
import { dibuja, POSES } from './personaje.js';
import { campo, lee, conIntro } from './kit.js';

const redo = (v, p) => Math.round(v / p) * p;
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  d.max ??= g.max ?? 10000;
  if (d.modo === 'martillo') {
    const op = g.op === 'mezcla' ? elige(['suma', 'resta']) : g.op ?? 'suma';
    let a, b;
    do {
      a = azar(...(g.a ?? [1000, 8999])); b = azar(...(g.b ?? [100, 3999]));
      if (op === 'resta' && b > a) [a, b] = [b, a];
    } while ((op === 'suma' ? a + b : a - b) > d.max * 0.97 || (op === 'suma' ? a + b : a - b) < d.max * 0.05);
    Object.assign(d, { a, b, op, resultado: op === 'suma' ? a + b : a - b });
    if (d.elige) { const c = redo(d.resultado, 100); const k = azar(0, 3); d.opciones = [0, 1, 2, 3].map((i) => c + (i - k) * 100); }
    return d;
  }
  if (d.modo === 'tirolina') {
    d.valor = redo(azar(Math.round(d.max * 0.04), Math.round(d.max * 0.96)), g.redondeo ?? 1);
    if (g.evitar && Math.abs(d.valor - d.max / 2) < d.max * 0.08) d.valor = redo(d.valor + d.max * 0.2, g.redondeo ?? 1);
    return d;
  }
  return d;
}
export function ronda(d, ctx) { return d.modo === 'tirolina' ? tirolina(d, ctx) : martillo(d, ctx); }
const nota = (err, max) => { const e = err / max; return e <= 0.04 ? 3 : e <= 0.08 ? 2 : e <= 0.14 ? 1 : 0; };

/* ================================================================ el martillo de fuerza */
function martillo(d, ctx) {
  const max = d.max, signo = d.op === 'suma' ? '+' : '−';
  ctx.reto(d.texto ?? (d.elige ? `¿Qué globo está **más cerca** de ${num(d.a)} ${signo} ${num(d.b)}?` : `¿Hasta dónde subirá ${num(d.a)} ${signo} ${num(d.b)}? **Márcalo a ojo**`));
  ctx.pista(d.pista ?? (d.elige ? 'No hace falta la cuenta exacta: redondea y elige. Luego, ¡golpe!' : 'Sube la anilla por la torre hasta donde creas que llegará. No hace falta hacer la cuenta exacta.'));
  const marcas = d.marcas ?? [0, max];
  const torre = el('div', { class: 'torre-martillo' },
    el('div', { class: 'campana', 'aria-hidden': 'true', html: '<svg viewBox="0 0 60 50"><path d="M8 44 Q8 8 30 6 Q52 8 52 44Z" fill="#ffc531" stroke="#1b1e3a" stroke-width="4" stroke-linejoin="round"/><path d="M4 44 h52" stroke="#1b1e3a" stroke-width="6" stroke-linecap="round"/><circle cx="30" cy="48" r="5" fill="#1b1e3a"/><path d="M20 16 q-4 10 -3 20" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/></svg>' }),
    el('div', { class: 'carril' }, marcas.map((m) => el('span', { class: 'marca-torre' + (m === 0 || m === max ? ' grande' : ''), style: { bottom: (m / max) * 100 + '%' } }, el('b', { text: num(m) })))));
  const carril = torre.querySelector('.carril');
  const disco = el('div', { class: 'disco-martillo', 'aria-hidden': 'true' });
  carril.append(disco);
  const base = el('div', { class: 'base-martillo' }, el('div', { class: 'diana-martillo' }), el('div', { class: 'mazo', 'aria-hidden': 'true', html: '<svg viewBox="0 0 120 60"><rect x="4" y="26" width="84" height="10" rx="4" fill="#d39a5c" stroke="#1b1e3a" stroke-width="3.5"/><rect x="82" y="4" width="34" height="54" rx="8" fill="#e8417a" stroke="#1b1e3a" stroke-width="4"/><path d="M90 10 v42" stroke="#fff" stroke-width="3" opacity=".5"/></svg>' }));
  const cartel = el('div', { class: 'cartel-cuenta' }, el('small', { text: 'La cuenta' }), el('b', { text: `${num(d.a)} ${signo} ${num(d.b)}` }));
  const zona = el('div', { class: 'caseta-martillo' }, el('div', { class: 'torre-y-base' }, torre, base), cartel);
  ctx.escenario.append(zona);
  const alto = () => carril.getBoundingClientRect().height;
  let hecho = false;
  const golpe = async (est) => {
    hecho = true; acciones(); suena('coge');
    const mazo = base.querySelector('.mazo');
    await gsap.timeline().to(mazo, { rotation: -50, transformOrigin: '6% 50%', duration: 0.25, ease: 'power2.out' }).to(mazo, { rotation: 18, duration: 0.12, ease: 'power3.in' });
    suena('sello'); temblor(base, 6);
    const f = d.resultado / max;
    await gsap.fromTo(disco, { bottom: '0%' }, { bottom: f * 100 + '%', duration: 0.5 + f * 0.6, ease: 'power3.out' });
    gsap.to(mazo, { rotation: 0, duration: 0.4 });
    disco.append(el('span', { class: 'valor-disco', text: num(d.resultado) }));
    gsap.from(disco.lastChild, { scale: 0.3, opacity: 0, duration: 0.3, ease: 'back.out(2)' });
    return f;
  };
  if (d.elige) {
    const globos = d.opciones.map((v, i) => {
      const g = el('button', { type: 'button', class: 'globo-feria', style: { bottom: (v / max) * 100 + '%', '--c': ['#e8417a', '#5ec3ff', '#9bd84a', '#ffb054'][i] } }, el('span', { text: num(v) }));
      g.onclick = async () => {
        if (hecho) return;
        globos.forEach((x) => x.classList.toggle('elegido', x === g)); suena('clic');
        await golpe();
        const mejor = d.opciones.reduce((a, b) => (Math.abs(b - d.resultado) < Math.abs(a - d.resultado) ? b : a));
        const gm = globos[d.opciones.indexOf(mejor)];
        await espera(250);
        gsap.to(gm, { scale: 1.6, opacity: 0, duration: 0.25, onComplete: () => gm.classList.add('pinchado') }); suena('estrella'); chispasEn(gm, 14, '#ffc531');
        const ok = v === mejor;
        ctx.fin(ok ? 3 : 0, `${num(d.a)} ${signo} ${num(d.b)} = **${num(d.resultado)}**. ${ok ? '¡Globo pinchado!' : `El más cercano era el **${num(mejor)}**.`} Redondeando: ${num(redo(d.a, 100))} ${signo} ${num(redo(d.b, 100))} = ${num(d.op === 'suma' ? redo(d.a, 100) + redo(d.b, 100) : redo(d.a, 100) - redo(d.b, 100))}.`);
      };
      return g;
    });
    carril.append(...globos);
    gsap.from(globos, { y: 30, opacity: 0, duration: 0.4, stagger: 0.08, ease: 'back.out(2)' });
    globos.forEach((g, i) => gsap.to(g, { y: -5, duration: 1 + i * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
    var acciones = () => {};
  } else {
    // la anilla: se arrastra por la torre, sin número (es a ojo)
    let f = 0.04;
    const anilla = el('div', { class: 'anilla-martillo', tabindex: 0, role: 'slider', 'aria-label': 'Tu estimación', style: { bottom: f * 100 + '%' } }, el('span', { class: 'flecha-anilla', text: 'Aquí' }));
    carril.append(anilla);
    const pon = (y) => { const r = carril.getBoundingClientRect(); f = Math.min(1, Math.max(0, (r.bottom - y) / r.height)); anilla.style.bottom = f * 100 + '%'; };
    let arr = false;
    anilla.style.touchAction = 'none'; carril.style.touchAction = 'none';
    carril.addEventListener('pointerdown', (e) => { if (hecho) return; arr = true; carril.setPointerCapture?.(e.pointerId); pon(e.clientY); suena('coge'); anilla.classList.add('moviendo'); });
    carril.addEventListener('pointermove', (e) => arr && pon(e.clientY));
    const suelta = () => { if (!arr) return; arr = false; anilla.classList.remove('moviendo'); suena('pon'); movido = true; boton.disabled = false; };
    carril.addEventListener('pointerup', suelta); carril.addEventListener('pointercancel', suelta);
    anilla.addEventListener('keydown', (e) => { if (hecho) return; if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); f = Math.min(1, Math.max(0, f + (e.key === 'ArrowUp' ? 0.01 : -0.01))); anilla.style.bottom = f * 100 + '%'; movido = true; boton.disabled = false; } });
    let movido = false;
    const boton = ctx.boton('¡Golpe!', async () => {
      if (hecho || !movido) return;
      const est = f * max;
      await golpe();
      const err = Math.abs(est - d.resultado), e = nota(err, max);
      if (e === 3) { suena('selloBien'); const c = torre.querySelector('.campana'); gsap.fromTo(c, { rotation: -14 }, { rotation: 0, duration: 0.8, ease: 'elastic.out(1.4,0.2)' }); chispasEn(c, 16, '#ffc531'); }
      anilla.querySelector('.flecha-anilla').textContent = `≈ ${num(redo(est, 100))}`;
      ctx.fin(e, `${num(d.a)} ${signo} ${num(d.b)} = **${num(d.resultado)}**. ${e === 3 ? '¡Ha sonado la campana! ' : e ? 'Cerca. ' : 'Lejos. '}Para estimar: ${num(redo(d.a, 1000))} ${signo} ${num(redo(d.b, 1000))} = ${num(d.op === 'suma' ? redo(d.a, 1000) + redo(d.b, 1000) : redo(d.a, 1000) - redo(d.b, 1000))}, más o menos.`);
    });
    boton.disabled = true;
    acciones = () => (boton.disabled = true);
    if (ctx.primera) mano(carril, { tipo: 'arrastra', dx: 0.5, demora: 1800 });
  }
  ctx.pistas([
    { texto: `Redondea a los **millares**: ${num(d.a)} es casi ${num(redo(d.a, 1000))}, y ${num(d.b)} es casi ${num(redo(d.b, 1000))}.` },
    { texto: `${num(redo(d.a, 1000))} ${signo} ${num(redo(d.b, 1000))} = ${num(d.op === 'suma' ? redo(d.a, 1000) + redo(d.b, 1000) : redo(d.a, 1000) - redo(d.b, 1000))}. ¿Y si redondeas a las **centenas**?` },
    { texto: 'La mitad de la torre es el **5 000**. Te la marco.', ver: () => { if (!carril.querySelector('.marca-ayuda')) carril.append(el('span', { class: 'marca-torre marca-ayuda', style: { bottom: '50%' } }, el('b', { text: num(max / 2) }))); } },
  ]);
}

/* ================================================================ la tirolina */
function tirolina(d, ctx) {
  const max = d.max, lee_ = d.lee;
  ctx.reto(d.texto ?? (lee_ ? '**¿Por qué número va Goma?** Escríbelo a ojo' : `Lleva a Goma por el cable hasta el **${num(d.valor)}**`));
  ctx.pista(d.pista ?? (lee_ ? 'Fíjate en qué parte del cable está: ¿pasa de la mitad? ¿De un cuarto?' : 'Arrastra la polea por el cable y suéltala donde creas que va el número.'));
  const marcas = d.marcas ?? [0, max];
  const cable = el('div', { class: 'cable-tirolina' }, marcas.map((m) => el('span', { class: 'marca-cable' + (m === 0 || m === max ? ' grande' : ''), style: { left: (m / max) * 100 + '%' } }, el('b', { text: num(m) }))));
  const polea = el('div', { class: 'polea', tabindex: lee_ ? -1 : 0, role: lee_ ? 'img' : 'slider', 'aria-label': lee_ ? 'Goma en el cable' : 'Polea con Goma' },
    el('span', { class: 'rueda-polea', 'aria-hidden': 'true' }), el('span', { class: 'mini-goma', html: dibuja('goma', POSES[lee_ ? 'quieto' : 'celebra']) }));
  cable.append(polea);
  const zona = el('div', { class: 'caseta-tirolina' }, el('div', { class: 'torre-tirolina izq' }), cable, el('div', { class: 'torre-tirolina der' }));
  ctx.escenario.append(zona);
  let f = lee_ ? d.valor / max : 0.02, hecho = false, movido = false;
  polea.style.left = f * 100 + '%';
  const revela = (est) => {
    const bandera = el('span', { class: 'bandera-cable', style: { left: (d.valor / max) * 100 + '%' } }, el('b', { text: num(d.valor) }));
    cable.append(bandera);
    // las diez partes del cable aparecen para ver dónde estaba
    for (let k = 1; k < 10; k++) cable.append(el('span', { class: 'decima-cable', style: { left: k * 10 + '%' } }));
    gsap.from(cable.querySelectorAll('.decima-cable'), { scaleY: 0, duration: 0.3, stagger: 0.03 });
    gsap.from(bandera, { y: -40, opacity: 0, duration: 0.4, ease: 'bounce.out' });
    const e = nota(Math.abs(est - d.valor), max * 0.75);
    if (e === 3) chispasEn(bandera, 14, '#ffc531');
    return e;
  };
  if (lee_) {
    const i = campo('Tu estimación', 9);
    zona.append(el('label', { class: 'prediccion' }, el('span', { text: 'Va por el' }), i));
    const boton = ctx.boton('Comprobar', () => {
      if (hecho) return;
      const v = lee(i); if (v == null) return ctx.aviso('Escribe un número.', true);
      if (v > max) return ctx.aviso(`El cable termina en ${num(max)}.`, true);
      hecho = true; boton.disabled = true; i.readOnly = true;
      const e = revela(v);
      i.classList.add(e >= 2 ? 'bien' : 'mal');
      ctx.fin(e, `Iba por el **${num(d.valor)}**. Tú dijiste ${num(v)}: ${e === 3 ? '¡casi clavado!' : e ? 'bastante cerca.' : 'lejos.'} ${Math.abs(v - d.valor) > max / 10 ? 'Parte el cable en mitades y cuartos para afinar.' : ''}`);
    });
    conIntro(i, () => boton.click());
  } else {
    gsap.from(polea, { left: '-10%', duration: 0.6, ease: 'power2.out' });
    const pon = (x) => { const r = cable.getBoundingClientRect(); f = Math.min(1, Math.max(0, (x - r.left) / r.width)); polea.style.left = f * 100 + '%'; };
    let arr = false;
    cable.style.touchAction = 'none';
    cable.addEventListener('pointerdown', (e) => { if (hecho) return; arr = true; cable.setPointerCapture?.(e.pointerId); pon(e.clientX); polea.classList.add('moviendo'); suena('coge'); });
    cable.addEventListener('pointermove', (e) => arr && pon(e.clientX));
    const suelta = () => { if (!arr) return; arr = false; polea.classList.remove('moviendo'); suena('pon'); movido = true; boton.disabled = false; gsap.fromTo(polea.querySelector('.mini-goma'), { rotation: 18 }, { rotation: 0, duration: 0.9, ease: 'elastic.out(1.2,0.25)', transformOrigin: '50% 0%' }); };
    cable.addEventListener('pointerup', suelta); cable.addEventListener('pointercancel', suelta);
    polea.addEventListener('keydown', (e) => { if (hecho) return; if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); f = Math.min(1, Math.max(0, f + (e.key === 'ArrowRight' ? 0.01 : -0.01))); polea.style.left = f * 100 + '%'; movido = true; boton.disabled = false; } });
    const boton = ctx.boton('¡Aquí!', () => {
      if (hecho || !movido) return;
      hecho = true; boton.disabled = true;
      const est = f * max, e = revela(est);
      ctx.fin(e, `El **${num(d.valor)}** estaba en la bandera. Tu Goma se paró por el ${num(redo(est, max / 100))}: ${e === 3 ? '¡casi encima!' : e ? 'cerca.' : 'lejos.'}`);
    });
    boton.disabled = true;
    if (ctx.primera) mano(cable, { tipo: 'arrastra', dx: 0.05, demora: 1800 });
  }
  const mitad = () => { if (!cable.querySelector('.marca-ayuda')) cable.append(el('span', { class: 'marca-cable marca-ayuda', style: { left: '50%' } }, el('b', { text: num(max / 2) }))); };
  const cuartos = () => [0.25, 0.75].forEach((q) => cable.append(el('span', { class: 'marca-cable marca-ayuda', style: { left: q * 100 + '%' } }, el('b', { text: num(max * q) }))));
  ctx.pistas([
    { texto: `La mitad del cable es el **${num(max / 2)}**. ${lee_ ? '¿Goma está antes o después?' : `¿El ${num(d.valor)} va antes o después?`}`, ver: mitad },
    { texto: `Y los cuartos: **${num(max / 4)}** y **${num((3 * max) / 4)}**.`, ver: cuartos },
    { texto: lee_ ? `Está entre el ${num(Math.floor((d.valor / max) * 10) * (max / 10))} y el ${num((Math.floor((d.valor / max) * 10) + 1) * (max / 10))}.` : `El ${num(d.valor)} está entre el ${num(Math.floor((d.valor / max) * 10) * (max / 10))} y el ${num((Math.floor((d.valor / max) * 10) + 1) * (max / 10))}.` },
  ]);
}
