// Motor «tablas»: el rincón de las tablas de la feria.
//   farolillos → encender los múltiplos del 7 o del 9 en una guirnalda de cien farolillos, y ver qué dibujo forman
//   manzanas   → ¿cuántas manzanas de caramelo hay en la bandeja? Filas por columnas, con huecos o en dos trozos
//   tiras      → tiras de tickets: el factor que falta (120 = 4 × ?) estirando un rectángulo, y × 10, × 100
//   cartas     → tres o cuatro cartas: el producto más grande (o más pequeño), contra Fosforito
//   chapas     → multiplicar por una cifra, por partes (7 × 144 = 700 + 280 + 28) o en columna
//   encargos   → problemas de la feria: elegir la operación, poner los datos y resolver
import { el, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, chispasEn, temblor, bote, demuestra, mano } from './efectos.js';
import { mesaDeCartas } from './mental.js';
import { dibuja, POSES } from './personaje.js';
import { campo, lee, conIntro, porIntento, T } from './kit.js';

const porFallos = (f) => (f === 0 ? 3 : f <= 2 ? 2 : f <= 4 ? 1 : 0);

/* ---------------------------------------------------------------- problemas */
const PROBLEMAS = {
  suma: [
    (a, b) => ({ t: `El sábado entraron **${num(a)}** personas a la feria y el domingo **${num(b)}**. ¿Cuántas personas entraron entre los dos días?`, u: 'personas' }),
    (a, b) => ({ t: `En la tómbola hay **${num(a)}** boletos azules y **${num(b)}** boletos rojos. ¿Cuántos boletos hay?`, u: 'boletos' }),
    (a, b) => ({ t: `Para montar la feria se usaron **${num(a)}** bombillas amarillas y **${num(b)}** rosas. ¿Cuántas bombillas se usaron?`, u: 'bombillas' }),
  ],
  resta: [
    (a, b) => ({ t: `En la caseta de los patitos había **${num(a)}** fichas y se han gastado **${num(b)}**. ¿Cuántas fichas quedan?`, u: 'fichas' }),
    (a, b) => ({ t: `En la caseta de tiro había **${num(a)}** corchos y ya se han disparado **${num(b)}**. ¿Cuántos corchos quedan?`, u: 'corchos' }),
    (a, b) => ({ t: `Esta noche caben **${num(a)}** personas en el concierto de la feria y ya hay **${num(b)}** entradas vendidas. ¿Cuántas entradas quedan por vender?`, u: 'entradas' }),
  ],
  compara: [
    (a, b) => ({ t: `La tirolina mide **${num(a)}** centímetros y el tobogán **${num(b)}**. ¿Cuántos centímetros más mide la tirolina que el tobogán?`, u: 'cm' }),
    (a, b) => ({ t: `La noria pesa **${num(a)}** kilos y el tiovivo **${num(b)}**. ¿Cuántos kilos pesa menos el tiovivo?`, u: 'kilos' }),
  ],
  multiplica: [
    (a, b) => ({ t: `En el puesto de chapas hay **${num(b)}** cajas con **${num(a)}** chapas cada una. ¿Cuántas chapas hay?`, u: 'chapas' }),
    (a, b) => ({ t: `Cada vuelta de la noria lleva **${num(a)}** personas y hoy ha dado **${num(b)}** vueltas. ¿Cuántas personas han subido?`, u: 'personas' }),
  ],
  oculto: [
    (a, b) => ({ t: `En la carrera de triciclos de la feria participan **${num(a)}** niños, cada uno con su triciclo. ¿Cuántas ruedas hay en la carrera?`, u: 'ruedas', datos: [a, 3], op: '×' }),
    (a, b) => ({ t: `Fosforito ha comprado **${num(a)}** hueveras de **media docena** de huevos para hacer churros. ¿Cuántos huevos ha comprado?`, u: 'huevos', datos: [a, 6], op: '×' }),
    (a, b) => ({ t: `En la caseta de las bicis hay **${num(a)}** bicicletas aparcadas. ¿Cuántas ruedas hay?`, u: 'ruedas', datos: [a, 2], op: '×' }),
  ],
};
const OPS = { suma: '+', resta: '−', compara: '−', multiplica: '×' };

export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (d.modo === 'farolillos') { d.tabla ??= g.tabla ?? 7; d.hasta ??= g.hasta ?? 100; d.ancho ??= g.ancho ?? 10; return d; }
  if (d.modo === 'manzanas') {
    const tipo = elige(g.tipos ?? ['lleno']);
    const f = azar(...(g.filas ?? [3, 6])), c = azar(...(g.columnas ?? [4, 8]));
    const hay = Array.from({ length: f }, () => Array(c).fill(1));
    let total = f * c, extra = null;
    if (tipo === 'huecos') { const k = azar(2, Math.min(5, Math.floor(total / 6))); const ps = barajar(Array.from({ length: total }, (_, i) => i)).slice(0, k); ps.forEach((p) => (hay[Math.floor(p / c)][p % c] = 0)); total -= k; extra = { quitan: k }; }
    if (tipo === 'fila') { const k = azar(1, c - 1); hay.push(Array.from({ length: c }, (_, i) => (i < k ? 1 : 0))); total += k; extra = { sobran: k }; }
    if (tipo === 'dos') { const f2 = azar(2, f), c2 = azar(2, 5); hay.forEach((r, i) => r.push(0, ...Array(c2).fill(i < f2 ? 1 : 0))); total += f2 * c2; extra = { f2, c2 }; }
    Object.assign(d, { hay, total, tipo, f, c, extra });
    return d;
  }
  if (d.modo === 'tiras') {
    const tipo = g.tipo ?? 'falta';
    if (tipo === 'falta') {
      const filas = azar(...(g.filas ?? [3, 9])), por = g.decenas ? azar(2, 9) * 10 : azar(...(g.por ?? [3, 9]));
      Object.assign(d, { filas, por, total: filas * por, quePreguntar: g.preguntar ?? 'por', decenas: !!g.decenas });
    } else {
      d.parejas = Array.from({ length: g.parejas ?? 2 }, () => { const a = azar(2, 9), b = azar(2, 9), k = elige(g.potencias ?? [10, 100]); return Math.random() < 0.5 ? [[a, b], [a * k, b]] : [[a, b], [a, b * k]]; });
    }
    d.tipo = tipo;
    return d;
  }
  if (d.modo === 'cartas') {
    const n = g.cartas ?? 3;
    let cs; do cs = Array.from({ length: n }, () => azar(g.cero ? 0 : 1, 9)); while (new Set(cs).size < n);
    Object.assign(d, { cartas: cs, objetivo: g.objetivo ?? 'mayor', listo: g.listo ?? 0.5 });
    return d;
  }
  if (d.modo === 'chapas') {
    let a; do a = azar(...(g.a ?? [12, 98])); while (String(a).split('').filter((c) => c !== '0').length < 2);
    const b = azar(...(g.b ?? [3, 9]));
    Object.assign(d, { a, b, forma: g.forma ?? 'partes' });
    return d;
  }
  if (d.modo === 'encargos') {
    const tipo = elige(g.tipos ?? ['suma', 'resta']);
    let a, b;
    if (tipo === 'multiplica') { a = azar(...(g.a ?? [12, 150])); b = azar(3, 9); }
    else if (tipo === 'oculto') { a = azar(4, 15); b = 0; }
    else { a = azar(...(g.rango ?? [1200, 8999])); b = azar(...(g.rango2 ?? [300, 4000])); if (tipo !== 'suma' && b > a) [a, b] = [b, a]; if (tipo === 'suma' && a + b > 9999) b = 9999 - a - azar(0, 300); }
    const p = elige(PROBLEMAS[tipo])(a, b);
    const datos = p.datos ?? [a, b], op = p.op ?? OPS[tipo];
    const res = op === '+' ? datos[0] + datos[1] : op === '−' ? datos[0] - datos[1] : datos[0] * datos[1];
    Object.assign(d, { texto: p.t, unidad: p.u, datos, op, res, tipoProblema: tipo });
    return d;
  }
  return d;
}
export function ronda(d, ctx) { return ({ farolillos, manzanas, tiras, cartas, chapas, encargos })[d.modo](d, ctx); }

/* ================================================================ los farolillos */
const FAROL = (c) => `<svg viewBox="0 0 40 52" aria-hidden="true"><path d="M20 0 v6" stroke="${T}" stroke-width="2.5"/><rect x="13" y="5" width="14" height="5" rx="1.5" fill="${T}"/><ellipse cx="20" cy="28" rx="16" ry="18" fill="${c}" stroke="${T}" stroke-width="2.5"/><path d="M10 15 q10 13 0 26 M30 15 q-10 13 0 26" fill="none" stroke="${T}" stroke-width="1.6" opacity=".55"/><rect x="14" y="45" width="12" height="5" rx="1.5" fill="${T}"/></svg>`;
function farolillos(d, ctx) {
  const k = d.tabla, N = d.hasta, W = d.ancho;
  ctx.reto(d.texto ?? `Enciende los farolillos de la **tabla del ${k}**`);
  ctx.pista(d.pista ?? `Toca los números que salen al contar de ${k} en ${k}. Si te equivocas, vuelve a tocarlo para apagarlo.`);
  const guirnalda = el('div', { class: 'guirnalda', style: { '--w': W } });
  const color = k === 7 ? '#ff8a1f' : k === 9 ? '#5ec3ff' : '#ff9fbf';
  const faroles = Array.from({ length: N }, (_, i) => {
    const n = i + 1;
    const b = el('button', { type: 'button', class: 'farol', 'aria-pressed': 'false', 'aria-label': `Farolillo ${n}`, 'data-n': n, style: { '--c': color } }, el('span', { class: 'dib', html: FAROL('#fffdf6') }), el('b', { text: n }));
    b.onclick = () => { if (hecho) return; const v = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(v)); b.querySelector('.dib').innerHTML = FAROL(v ? color : '#fffdf6'); suena(v ? 'pon' : 'quita', v ? Math.min(6, Math.floor(n / 15)) : 0); if (v) gsap.fromTo(b, { rotation: -14 }, { rotation: 0, duration: 0.7, ease: 'elastic.out(1.3,0.3)', transformOrigin: '50% 0%' }); };
    guirnalda.append(b); return b;
  });
  ctx.escenario.append(el('div', { class: 'caseta-farolillos' }, guirnalda));
  let hecho = false, intento = 0;
  const preguntaDibujo = async () => {
    // qué dibujo forman: se elige entre tres
    const ops = W === k ? ['Una columna', 'Una diagonal', 'Saltos sin orden'] : k === 9 ? ['Una diagonal', 'Una columna', 'Un cuadrado'] : null;
    if (!ops) return true;
    return new Promise((ok) => {
      const caja = el('div', { class: 'pregunta-dibujo' }, el('b', { text: '¿Qué dibujo forman los farolillos encendidos?' }), el('div', { class: 'opciones-ruleta' }, barajar(ops).map((o) => el('button', { type: 'button', class: 'tecla', text: o, onclick: () => { caja.remove(); ok(o === ops[0]); } }))));
      ctx.escenario.append(caja); caja.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  };
  const boton = ctx.boton('Comprobar', async () => {
    if (hecho) return;
    intento++;
    const malos = faroles.filter((b) => (b.getAttribute('aria-pressed') === 'true') !== (+b.dataset.n % k === 0));
    if (!malos.length || intento >= 2) {
      hecho = true; boton.disabled = true;
      faroles.forEach((b) => { const m = +b.dataset.n % k === 0; b.classList.toggle('es-multiplo', m); if (m) b.querySelector('.dib').innerHTML = FAROL(color); b.classList.toggle('fallado', malos.includes(b)); });
      if (malos.length) return ctx.fin(intento >= 2 && malos.length <= 2 ? 1 : 0, `Los de la tabla del ${k} quedan encendidos; los rodeados en rojo eran los fallos. ${k === 9 ? 'Mira: en cada fila, el 9 va una casilla más a la izquierda.' : `Van de ${k} en ${k}.`}`);
      suena('selloBien'); chispasEn(guirnalda, 22, color);
      const bienDibujo = await preguntaDibujo();
      return ctx.fin(porIntento(intento) - (bienDibujo ? 0 : 1), `**¡Todos encendidos!** ${faroles.filter((b) => +b.dataset.n % k === 0).map((b) => b.dataset.n).join(', ')}. ${W === k ? 'En una guirnalda de ' + k + ' en ' + k + ', la tabla del ' + k + ' forma una columna.' : k === 9 ? 'Los del 9 forman una diagonal: cada vez, una decena más y una unidad menos.' : ''}`);
    }
    suena('mal'); temblor(guirnalda, 4);
    const sobran = malos.filter((b) => b.getAttribute('aria-pressed') === 'true').length, faltan = malos.length - sobran;
    ctx.aviso(`${faltan ? `Faltan ${faltan} por encender` : ''}${faltan && sobran ? ' y ' : ''}${sobran ? `${sobran} ${sobran === 1 ? 'sobra' : 'sobran'}` : ''}. Revísalos.`, true);
  });
  ctx.pistas([
    { texto: `Empieza en el ${k} y cuenta ${k} más cada vez: ${k}, ${2 * k}, ${3 * k}…` },
    { texto: k === 9 ? 'Truco del 9: sumar 9 es sumar 10 y quitar 1. Por eso cada farolillo está una fila más abajo y una casilla más a la izquierda.' : `Si te pierdes, dice la tabla: ${k} × 4 = ${4 * k}, ${k} × 5 = ${5 * k}…` },
    { texto: `Te enciendo los tres primeros.`, ver: () => faroles.filter((b) => +b.dataset.n % k === 0).slice(0, 3).forEach((b) => b.getAttribute('aria-pressed') !== 'true' && b.click()) },
  ]);
}

/* ================================================================ las manzanas de caramelo */
const MANZANA = `<svg viewBox="0 0 30 38" aria-hidden="true"><path d="M15 0 v12" stroke="#d39a5c" stroke-width="3.5" stroke-linecap="round"/><circle cx="15" cy="24" r="12" fill="#d7263d" stroke="${T}" stroke-width="2.5"/><path d="M8 21 q3 -6 8 -6" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".6"/></svg>`;
function manzanas(d, ctx) {
  ctx.reto(d.texto ?? '¿Cuántas **manzanas de caramelo** hay en la bandeja?');
  ctx.pista(d.pista ?? 'Sin contar de una en una: filas por columnas, y luego arregla lo que falte o sobre.');
  const bandeja = el('div', { class: 'bandeja-manzanas', style: { '--c': d.hay[0].length } });
  d.hay.forEach((fila, i) => fila.forEach((v, j) => bandeja.append(el('span', { class: 'sitio-manzana' + (v ? '' : ' vacio'), 'data-f': i, 'data-c': j, html: v ? MANZANA : '' }))));
  const i = campo('Manzanas', 5);
  ctx.escenario.append(el('div', { class: 'caseta-manzanas' }, bandeja, el('label', { class: 'prediccion' }, el('span', { text: 'Hay' }), i, el('span', { text: 'manzanas' }))));
  let intento = 0, hecho = false;
  const explica = () => d.tipo === 'huecos' ? `${d.f} × ${d.c} = ${d.f * d.c}, menos los ${d.extra.quitan} huecos: ${d.total}.` : d.tipo === 'fila' ? `${d.f} × ${d.c} = ${d.f * d.c}, más las ${d.extra.sobran} de la fila incompleta: ${d.total}.` : d.tipo === 'dos' ? `${d.f} × ${d.c} = ${d.f * d.c} y ${d.extra.f2} × ${d.extra.c2} = ${d.extra.f2 * d.extra.c2}: ${d.total}.` : `${d.f} filas de ${d.c}: ${d.f} × ${d.c} = ${d.total}.`;
  const boton = ctx.boton('Comprobar', () => {
    if (hecho) return;
    const v = lee(i); if (v == null) return ctx.aviso('Escribe cuántas hay.', true);
    intento++;
    if (v === d.total) { hecho = true; boton.disabled = true; i.classList.add('bien'); gsap.from(bandeja.querySelectorAll('.sitio-manzana:not(.vacio)'), { scale: 1.3, duration: 0.3, stagger: 0.008 }); suena('selloBien'); return ctx.fin(porIntento(intento), `**${d.total} manzanas.** ${explica()}`); }
    i.classList.add('mal'); temblor(i, 5); suena('mal');
    if (intento >= 3) { hecho = true; boton.disabled = true; return ctx.fin(0, `Había **${d.total}**. ${explica()}`); }
    ctx.aviso(v === d.f * d.c && d.tipo !== 'lleno' ? `${v} es si la bandeja estuviera llena. ¿Y los huecos?` : 'No. Cuenta las filas, cuenta las columnas y multiplica.', true);
  });
  conIntro(i, () => boton.click());
  ctx.pistas([
    { texto: `¿Cuántas filas hay? ¿Cuántas en cada fila? Te las marco.`, ver: () => bandeja.classList.add('marca-filas') },
    { texto: d.tipo === 'dos' ? 'Son **dos bandejas juntas**. Cuenta cada una por separado y suma.' : d.tipo === 'huecos' ? `Si estuviera llena serían ${d.f} × ${d.c}. Luego, quita los huecos.` : d.tipo === 'fila' ? `Las filas completas son ${d.f} × ${d.c}. Luego, suma las de la última fila.` : `${d.f} × ${d.c}.` },
  ]);
}

/* ================================================================ las tiras de tickets */
function tiras(d, ctx) { return d.tipo === 'decenas' ? tirasDecenas(d, ctx) : tirasFalta(d, ctx); }
function tirasFalta(d, ctx) {
  const unidad = d.decenas ? 10 : 1; // con decenas, cada pieza es un taco de 10
  const pregFilas = d.quePreguntar === 'filas';
  ctx.reto(d.texto ?? (pregFilas ? `Hay **${num(d.total)}** tickets en filas de **${num(d.por)}**. ¿Cuántas filas?` : `Hay **${num(d.total)}** tickets en **${d.filas}** filas iguales. ¿Cuántos en cada fila?`));
  ctx.pista(d.pista ?? `Estira el rectángulo desde la esquina hasta que tenga ${num(d.total)} tickets. ${d.decenas ? 'Cada cuadrito es un taco de 10.' : ''}`);
  const maxC = pregFilas ? d.por / unidad : Math.min(12, Math.ceil((d.por / unidad) * 1.6) + 1), maxF = pregFilas ? Math.min(12, d.filas + 4) : d.filas;
  let cols = pregFilas ? d.por / unidad : 1, filas = pregFilas ? 1 : d.filas;
  const rej = el('div', { class: 'rejilla-tickets' + (d.decenas ? ' tacos' : '') });
  const tirador = el('div', { class: 'tirador-tickets', role: 'slider', tabindex: 0, 'aria-label': 'Estirar' });
  const cuenta = el('div', { class: 'cuenta-tickets' });
  const marco = el('div', { class: 'marco-tickets' }, rej, tirador);
  ctx.escenario.append(el('div', { class: 'caseta-tiras' }, cuenta, marco));
  const celda = 34;
  const pinta = () => {
    rej.style.gridTemplateColumns = `repeat(${cols}, ${celda}px)`;
    rej.replaceChildren(...Array.from({ length: filas * cols }, () => el('i', { text: d.decenas ? '10' : '' })));
    tirador.style.left = cols * (celda + 3) + 4 + 'px'; tirador.style.top = filas * (celda + 3) + 4 + 'px';
    const tot = filas * cols * unidad;
    cuenta.replaceChildren(el('b', { text: `${filas} × ${num(cols * unidad)} = ${num(tot)}` }), el('span', { class: tot === d.total ? 'justo' : tot > d.total ? 'pasa' : 'falta', text: tot === d.total ? '¡justo!' : tot > d.total ? 'te pasas' : `faltan ${num(d.total - tot)}` }));
    marco.style.width = maxC * (celda + 3) + 30 + 'px'; marco.style.height = maxF * (celda + 3) + 30 + 'px';
  };
  pinta();
  let arr = false, movido = false;
  marco.style.touchAction = 'none';
  const toma = (e) => { const r = rej.getBoundingClientRect(); const c = Math.round((e.clientX - r.left) / (celda + 3)), f = Math.round((e.clientY - r.top) / (celda + 3)); const nc = pregFilas ? cols : Math.max(1, Math.min(maxC, c)), nf = pregFilas ? Math.max(1, Math.min(maxF, f)) : filas; if (nc !== cols || nf !== filas) { cols = nc; filas = nf; pinta(); suena('clic', Math.min(6, cols + filas)); } };
  marco.addEventListener('pointerdown', (e) => { if (hecho) return; arr = true; marco.setPointerCapture?.(e.pointerId); toma(e); });
  marco.addEventListener('pointermove', (e) => arr && toma(e));
  const suelta = () => { if (!arr) return; arr = false; movido = true; };
  marco.addEventListener('pointerup', suelta); marco.addEventListener('pointercancel', suelta);
  tirador.addEventListener('keydown', (e) => { if (hecho) return; const dx = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0, dy = e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0; if (!dx && !dy) return; e.preventDefault(); if (!pregFilas) cols = Math.max(1, Math.min(maxC, cols + dx)); else filas = Math.max(1, Math.min(maxF, filas + dy)); pinta(); });
  if (ctx.primera) mano(tirador, { tipo: 'arrastra', dx: 0.5, demora: 1500 });
  const i = campo(pregFilas ? 'Filas' : 'Tickets por fila', 5);
  const frase = el('label', { class: 'prediccion' }, el('span', { text: pregFilas ? `${num(d.total)} = ` : `${num(d.total)} = ${d.filas} × ` }), i, el('span', { text: pregFilas ? ` × ${num(d.por)}` : '' }));
  ctx.escenario.querySelector('.caseta-tiras').append(frase);
  let intento = 0, hecho = false;
  const sol = pregFilas ? d.filas : d.por;
  const boton = ctx.boton('Cortar las tiras', () => {
    if (hecho) return;
    const v = lee(i); if (v == null) return ctx.aviso('Escribe el número que falta (te ayuda estirar el rectángulo).', true);
    intento++;
    if (v === sol) { hecho = true; boton.disabled = true; i.classList.add('bien'); if (!pregFilas) cols = d.por / unidad; else filas = d.filas; pinta(); suena('selloBien'); chispasEn(rej, 16, '#ffc531'); return ctx.fin(porIntento(intento), `**${num(d.total)} = ${d.filas} × ${num(d.por)}.** ${d.decenas ? `Como ${d.filas} × ${d.por / 10} = ${d.total / 10}, ${d.filas} × ${d.por} = ${d.total}.` : ''}`); }
    i.classList.add('mal'); temblor(i, 5); suena('mal');
    if (intento >= 3) { hecho = true; boton.disabled = true; i.value = sol; return ctx.fin(0, `Era **${num(sol)}**: ${d.filas} × ${num(d.por)} = ${num(d.total)}.`); }
    ctx.aviso(`${pregFilas ? `${v} × ${num(d.por)}` : `${d.filas} × ${num(v)}`} = ${num(pregFilas ? v * d.por : d.filas * v)}, no ${num(d.total)}.`, true);
  });
  conIntro(i, () => boton.click());
  ctx.pistas([
    { texto: `Es buscar el número que falta en la tabla: ${pregFilas ? `¿cuántas veces ${num(d.por)}` : `${d.filas} por cuánto`} da ${num(d.total)}?` },
    { texto: d.decenas ? `Quita el cero: ${num(d.total / 10)} = ${pregFilas ? `? × ${d.por / 10}` : `${d.filas} × ?`}. Luego vuelve a ponerlo.` : 'Estira el rectángulo hasta que diga «¡justo!».' },
  ]);
}
function tirasDecenas(d, ctx) {
  ctx.reto(d.texto ?? 'Cada pareja se parece. **Haz la primera y úsala para la segunda**');
  ctx.pista(d.pista ?? 'Un taco de 10 tickets vale lo mismo que 10 tickets sueltos.');
  const lista = el('div', { class: 'parejas-tiras' });
  const campos = [];
  d.parejas.forEach(([p1, p2], k) => {
    const fila = el('div', { class: 'pareja-tira' });
    [p1, p2].forEach(([a, b], j) => { const inp = campo(`${a} × ${b}`, 6); campos.push({ inp, val: a * b }); fila.append(el('label', { class: 'cuenta-tira' + (j ? ' segunda' : '') }, el('b', { text: `${num(a)} × ${num(b)} =` }), inp)); });
    lista.append(fila);
  });
  ctx.escenario.append(el('div', { class: 'caseta-tiras' }, lista));
  campos.forEach((c, n) => conIntro(c.inp, () => (campos[n + 1] ? campos[n + 1].inp.focus() : boton.click())));
  let intento = 0, hecho = false;
  const boton = ctx.boton('Comprobar', () => {
    if (hecho) return;
    if (campos.some((c) => lee(c.inp) == null)) return ctx.aviso('Rellena todas.', true);
    intento++;
    const malos = campos.filter((c) => lee(c.inp) !== c.val);
    campos.forEach((c) => c.inp.classList.toggle('mal', lee(c.inp) !== c.val));
    if (!malos.length) { hecho = true; boton.disabled = true; campos.forEach((c) => c.inp.classList.add('bien')); suena('selloBien'); return ctx.fin(porIntento(intento), '**¡Todas!** Si un número lleva ceros, haces la tabla y luego pones los ceros.'); }
    suena('mal');
    if (intento >= 3) { hecho = true; boton.disabled = true; campos.forEach((c) => (c.inp.value = c.val)); return ctx.fin(0, 'Primero la tabla, sin ceros. Luego, los ceros que haya.'); }
    ctx.aviso(`Hay ${malos.length} mal (en rojo).`, true);
  });
  ctx.pistas([{ texto: '90 × 7 son 9 × 7 tacos de 10: 63 tacos, es decir, 630.' }, { texto: '2 × 900 son 2 × 9 centenas: 18 centenas, es decir, 1 800.' }]);
}

/* ================================================================ las tres cartas */
const producto = (cs, forma) => { const k = forma.length - 1; return Number(cs.slice(0, k).join('')) * cs[k]; };
function cartas(d, ctx) {
  const n = d.cartas.length, mayor = d.objetivo === 'mayor';
  const forma = n === 3 ? ['dd', 'd'] : ['ddd', 'd'];
  // todas las colocaciones
  const todas = [];
  const va = (resto, pref) => { if (!resto.length) { if (pref[0] !== 0) todas.push({ cs: pref, p: producto(pref, forma.join('')) }); return; } resto.forEach((c, i) => va(resto.filter((_, j) => j !== i), [...pref, c])); };
  va(d.cartas, []);
  todas.sort((a, b) => (mayor ? b.p - a.p : a.p - b.p));
  const mejor = todas[0];
  ctx.reto(d.texto ?? `Coloca las cartas para que el producto sea el **más ${mayor ? 'grande' : 'pequeño'}** posible`);
  ctx.pista(d.pista ?? 'Fosforito también juega con las mismas cartas. Gana el que consiga el mejor producto.');
  const huecos = [], fila = el('div', { class: 'fila-bascula' });
  forma.forEach((f, k) => { if (k) fila.append(el('b', { class: 'op-pares', text: '×' })); const g = el('div', { class: 'numero-bascula' }); for (const _ of f) { const h = el('div', { class: 'mano-carta' }); huecos.push(h); g.append(h); } fila.append(g); });
  const M = mesaDeCartas({ valores: d.cartas, huecos, alCambiar: () => (boton.disabled = huecos.some((h) => M.valor(h) == null)) });
  const rival = el('div', { class: 'rival-cartas' }, el('span', { class: 'mini-goma', html: dibuja('fosforito', POSES.piensa) }), el('div', { class: 'jugada-rival', text: 'Fosforito está pensando…' }));
  ctx.escenario.append(el('div', { class: 'caseta-pares' }, rival, el('div', { class: 'mesa-pares' }, fila), M.mazo));
  let hecho = false;
  const boton = ctx.boton('¡Destapar!', async () => {
    if (hecho) return;
    hecho = true; boton.disabled = true; M.bloquea();
    const mias = huecos.map((h) => +M.valor(h));
    if (mias[0] === 0) { hecho = false; boton.disabled = false; M.bloquea(false); return ctx.aviso('Un número no puede empezar por 0.', true); }
    const pm = producto(mias, forma.join(''));
    // Fosforito: a veces lo hace perfecto, a veces se le escapa la segunda mejor
    const suyo = Math.random() < d.listo ? mejor : todas[Math.min(todas.length - 1, azar(1, 2))];
    const txt = (cs) => `${cs.slice(0, forma[0].length).join('')} × ${cs.at(-1)}`;
    rival.querySelector('.jugada-rival').replaceChildren(el('small', { text: 'Fosforito:' }), el('b', { text: `${txt(suyo.cs)} = ${num(suyo.p)}` }));
    gsap.from(rival, { scale: 0.8, duration: 0.3, ease: 'back.out(2)' });
    suena('pon'); await espera(500);
    fila.after(el('div', { class: 'resultado-pares ' + (pm === mejor.p ? 'bien' : 'mal') }, el('span', { text: num(pm) })));
    const gano = mayor ? pm >= suyo.p : pm <= suyo.p;
    const exacto = pm === mejor.p;
    // la tabla de todas las colocaciones
    const tabla = el('ol', { class: 'tabla-cartas' }, todas.slice(0, 6).map((t) => el('li', { class: t.p === pm ? 'tuya' : '' }, `${txt(t.cs)} = ${num(t.p)}`)));
    ctx.escenario.querySelector('.caseta-pares').append(el('div', { class: 'todas-cartas' }, el('b', { text: `Todas las formas, de más ${mayor ? 'grande' : 'pequeña'} a más ${mayor ? 'pequeña' : 'grande'}:` }), tabla));
    if (exacto) { suena('selloBien'); chispasEn(fila, 16, '#ffc531'); }
    else suena(gano ? 'regular' : 'mal');
    ctx.fin(exacto ? 3 : gano ? 1 : 0, exacto ? `**¡${num(pm)}, el ${mayor ? 'mayor' : 'menor'} posible!** ${gano && pm === suyo.p ? 'Empate con Fosforito.' : 'Fosforito pierde.'} ${mayor ? 'La cifra más grande va **sola**, multiplicando: así multiplica a todas las demás.' : 'La cifra más pequeña va sola, multiplicando.'}` : `${gano ? 'Le ganas a Fosforito, pero' : 'Fosforito gana:'} el ${mayor ? 'mayor' : 'menor'} era **${txt(mejor.cs)} = ${num(mejor.p)}**.`);
  });
  boton.disabled = true;
  ctx.pistas([
    { texto: mayor ? 'La carta que va **sola** multiplica a todo el otro número. ¿Cuál conviene que vaya sola?' : 'La carta que va sola multiplica a todo. Para que salga poco, ¿cuál conviene?' },
    { texto: 'Prueba dos colocaciones en tu cabeza y compara. Por ejemplo, cambiando la carta sola.' },
  ]);
}

/* ================================================================ el puesto de chapas */
function chapas(d, ctx) {
  const { a, b } = d, r = a * b;
  const partes = String(a).split('').map((c, i, arr) => +c * 10 ** (arr.length - 1 - i)).filter((x) => x > 0);
  ctx.reto(d.texto ?? `**${b}** cajas con **${num(a)}** chapas cada una. ¿Cuántas chapas?`);
  ctx.pista(d.pista ?? (d.forma === 'partes' ? `Parte ${num(a)} en ${partes.map((x) => num(x)).join(' + ')} y multiplica cada parte por ${b}.` : 'Multiplica de derecha a izquierda. Lo que te llevas, en la casilla pequeña.'));
  const zona = el('div', { class: 'caseta-chapas' });
  ctx.escenario.append(zona);
  const campos = [];
  if (d.forma === 'partes') {
    const cajas = el('div', { class: 'cajas-chapas' }, partes.map((p) => {
      const inp = campo(`${b} × ${p}`, 6); campos.push({ inp, val: b * p });
      return el('div', { class: 'caja-chapas' }, el('div', { class: 'tapa-chapas', text: num(p) }), el('div', { class: 'chapas-dib', 'aria-hidden': 'true' }, Array.from({ length: Math.min(b, 9) }, () => el('i'))), el('label', {}, el('span', { text: `${b} × ${num(p)} =` }), inp));
    }));
    const total = campo('Total', 7); campos.push({ inp: total, val: r, total: true });
    zona.append(el('div', { class: 'descompone' }, el('b', { text: `${num(a)} = ${partes.map((x) => num(x)).join(' + ')}` })), cajas, el('label', { class: 'prediccion' }, el('span', { text: `${b} × ${num(a)} =` }), total));
  } else {
    // en columna
    const s = String(a), L = String(r).length, C = Math.max(L, s.length + 1);
    const celdas = (txt) => Array.from({ length: C }, (_, k) => el('span', { class: 'celda-cuenta', text: txt[k - (C - txt.length)] ?? '' }));
    const res = [];
    const filaR = el('div', { class: 'fila-cuenta resultado', style: { gridTemplateColumns: `repeat(${C + 1}, clamp(46px,11vw,60px))` } }, el('span', { class: 'celda-cuenta' }), ...Array.from({ length: C }, (_, k) => { const p = C - 1 - k; const i = el('input', { class: 'campo-num cifra-res', maxlength: 1, inputmode: 'numeric', autocomplete: 'off', 'aria-label': `Cifra ${p + 1} del resultado` }); i.addEventListener('input', () => { i.value = i.value.replace(/\D/g, '').slice(-1); i.classList.remove('mal', 'bien'); if (i.value) res[p + 1]?.focus(); }); res[p] = i; return el('span', { class: 'celda-cuenta' }, i); }));
    const ll = Array.from({ length: C }, (_, k) => el('span', { class: 'celda-cuenta' }, k > 0 && k < C ? (() => { const i = el('input', { class: 'campo-num llevada', maxlength: 1, inputmode: 'numeric', autocomplete: 'off', 'aria-label': 'Me llevo' }); i.addEventListener('input', () => (i.value = i.value.replace(/\D/g, '').slice(-1))); return i; })() : ''));
    const g = { gridTemplateColumns: `repeat(${C + 1}, clamp(46px,11vw,60px))` };
    const hoja = el('div', { class: 'hoja-cuenta' },
      el('div', { class: 'fila-cuenta llevadas', style: g }, el('span', { class: 'celda-cuenta' }), ...ll),
      el('div', { class: 'fila-cuenta', style: g }, el('span', { class: 'celda-cuenta' }), ...celdas(s)),
      el('div', { class: 'fila-cuenta', style: g }, el('span', { class: 'celda-cuenta signo', text: '×' }), ...celdas(String(b))),
      el('div', { class: 'raya-cuenta' }), filaR);
    zona.append(el('div', { class: 'papel-cuenta' }, hoja));
    res.forEach((i) => i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); boton.click(); } }));
    campos.push({ cifras: res, val: r });
  }
  campos.forEach((c, n) => c.inp && conIntro(c.inp, () => (campos[n + 1]?.inp ? campos[n + 1].inp.focus() : boton.click())));
  let intento = 0, hecho = false;
  const boton = ctx.boton('Comprobar', () => {
    if (hecho) return;
    intento++;
    let ok = true;
    if (d.forma === 'partes') {
      if (campos.some((c) => lee(c.inp) == null)) { intento--; return ctx.aviso('Rellena todas las casillas.', true); }
      campos.forEach((c) => { const m = lee(c.inp) !== c.val; c.inp.classList.toggle('mal', m); if (m) ok = false; });
    } else {
      const v = Number(campos[0].cifras.slice().reverse().map((i) => i.value || '0').join(''));
      const R = String(r).split('').reverse();
      campos[0].cifras.forEach((i, p) => { const m = (+i.value || 0) !== +(R[p] ?? 0); i.classList.toggle('mal', m); });
      ok = v === r;
    }
    if (ok) { hecho = true; boton.disabled = true; suena('selloBien'); chispasEn(zona, 16, '#ffc531'); return ctx.fin(porIntento(intento), `**${b} × ${num(a)} = ${num(r)} chapas.** ${partes.map((p) => num(b * p)).join(' + ')} = ${num(r)}.`); }
    suena('mal'); temblor(zona, 4);
    if (intento >= 3) { hecho = true; boton.disabled = true; return ctx.fin(0, `Eran **${num(r)}**: ${partes.map((p) => `${b} × ${num(p)} = ${num(b * p)}`).join('; ')}. Y se suma todo.`); }
    ctx.aviso('Lo que está en rojo no está bien. Repásalo.', true);
  });
  ctx.pistas([
    { texto: `Empieza por la parte más fácil: ${b} × ${partes.at(-1)} = ${b * partes.at(-1)}.` },
    { texto: `${b} × ${num(partes[0])}: haz ${b} × ${String(partes[0])[0]} y añade los ceros.` },
    { texto: `Las partes son ${partes.map((p) => num(b * p)).join(', ')}. Ahora, súmalas.` },
  ]);
}

/* ================================================================ los encargos */
function encargos(d, ctx) {
  ctx.reto('Un encargo para la feria');
  ctx.pista('Lee el encargo. Elige la operación, pon los datos y resuelve.');
  const hoja = el('div', { class: 'encargo' }, el('div', { class: 'texto-encargo' }));
  hoja.querySelector('.texto-encargo').append(...(() => { const f = document.createDocumentFragment(); String(d.texto).split(/\*\*(.+?)\*\*/g).forEach((t, i) => f.append(i % 2 ? el('span', { class: 'dato-encargo', text: t }) : t)); return [f]; })());
  const ops = ['+', '−', '×'];
  let op = null;
  const botonesOp = ops.map((o) => el('button', { type: 'button', class: 'tecla op-encargo', text: o, 'aria-pressed': 'false', onclick: () => { op = o; botonesOp.forEach((b) => b.setAttribute('aria-pressed', String(b.textContent === o))); suena('clic'); } }));
  const a = campo('Primer dato', 6), b = campo('Segundo dato', 6), r = campo('Resultado', 7);
  const cuenta = el('div', { class: 'cuenta-encargo' }, a, el('div', { class: 'ops-encargo' }, botonesOp), b, el('b', { text: '=' }), r, el('span', { class: 'unidad-encargo', text: d.unidad }));
  ctx.escenario.append(el('div', { class: 'caseta-encargos' }, hoja, cuenta));
  [a, b, r].forEach((x, n, arr) => conIntro(x, () => (arr[n + 1] ? arr[n + 1].focus() : boton.click())));
  let intento = 0, hecho = false;
  const boton = ctx.boton('Entregar', () => {
    if (hecho) return;
    const va = lee(a), vb = lee(b), vr = lee(r);
    if (va == null || vb == null || vr == null || !op) return ctx.aviso('Pon los dos datos, la operación y el resultado.', true);
    intento++;
    const opOk = op === d.op;
    const datosOk = opOk && (d.op === '−' ? va === d.datos[0] && vb === d.datos[1] : (va === d.datos[0] && vb === d.datos[1]) || (va === d.datos[1] && vb === d.datos[0]));
    const calcula = op === '+' ? va + vb : op === '−' ? va - vb : va * vb;
    const resOk = vr === d.res;
    if (opOk && datosOk && resOk) { hecho = true; boton.disabled = true; [a, b, r].forEach((x) => x.classList.add('bien')); suena('selloBien'); chispasEn(hoja, 14, '#ffc531'); return ctx.fin(porIntento(intento), `**${num(d.res)} ${d.unidad}.** ${num(d.datos[0])} ${d.op} ${num(d.datos[1])} = ${num(d.res)}.`); }
    suena('mal'); temblor(cuenta, 5);
    if (intento >= 3) { hecho = true; boton.disabled = true; return ctx.fin(0, `Era **${num(d.datos[0])} ${d.op} ${num(d.datos[1])} = ${num(d.res)} ${d.unidad}**. ${d.tipoProblema === 'compara' ? 'Para saber «cuántos más» se resta.' : d.tipoProblema === 'oculto' ? 'Había un dato escondido en las palabras.' : ''}`); }
    if (!opOk) ctx.aviso(d.tipoProblema === 'compara' ? '«¿Cuántos más?» o «¿cuántos menos?»: ¿qué operación compara dos cantidades?' : '¿Seguro que es esa operación? Piensa si junta, quita o repite.', true);
    else if (!datosOk) ctx.aviso(d.tipoProblema === 'oculto' ? 'Falta un dato que no está escrito con número. ¿Cuántas ruedas tiene un triciclo? ¿Cuántos huevos hay en media docena?' : 'Revisa los datos: ¿son los del encargo?' + (op === '−' ? ' En la resta, el grande va primero.' : ''), true);
    else ctx.aviso(calcula === vr ? 'Mmm… la operación está bien pero el resultado no. ¡Repasa la cuenta!' : 'La cuenta no da eso. Repásala.', true);
  });
  ctx.pistas([
    { texto: d.tipoProblema === 'suma' ? 'Se **juntan** dos cantidades.' : d.tipoProblema === 'resta' ? 'Se **quita** una cantidad de otra.' : d.tipoProblema === 'compara' ? 'Se **comparan** dos cantidades: la diferencia se calcula restando.' : 'Se **repite** la misma cantidad varias veces.' },
    { texto: d.tipoProblema === 'oculto' ? `El dato escondido: ${d.datos[1] === 3 ? 'un triciclo tiene **3** ruedas' : d.datos[1] === 6 ? 'media docena son **6**' : 'una bici tiene **2** ruedas'}.` : `La operación es **${d.op}**.` },
  ]);
}
