// Motor «multiplica»: la multiplicación como rectángulo.
//   partir     → trocear un producto por valor posicional y sumar las partes (T2-01)
//   cajita     → la cajita multiplicativa con decenas y centenas, producto o factor oculto (T2-10)
//   cuadrado   → n² como patio cuadrado: calcular, elegir o construir (T2-03)
//   areas      → ordenar parcelas por área cuando el dibujo engaña (T2-04)
//   problemas  → grupos, combinaciones y filas: qué cuenta hay que hacer (T2-16)
import { el, svg, num, azar, elige, barajar, suena } from './nucleo.js';
import { espera, mano, temblor, chispasEn, cuentaArriba } from './efectos.js';

const lee = (input) => { const t = String(input.value).replace(/[\s. ]/g, ''); return t === '' || !/^\d+$/.test(t) ? null : Number(t); };
function campo(etiqueta, ancho = 6) {
  const i = el('input', { class: 'campo-num', inputmode: 'numeric', autocomplete: 'off', 'aria-label': etiqueta, maxlength: 9, style: { width: ancho + 'ch' } });
  i.addEventListener('input', () => { i.value = i.value.replace(/[^\d]/g, ''); i.classList.remove('mal', 'bien'); suena('clic'); });
  return i;
}
const partes = (n) => String(n).split('').map((c, i, a) => Number(c) * 10 ** (a.length - 1 - i)).filter(Boolean);
const enter = (inputs, fn) => inputs.forEach((i) => i.addEventListener('keydown', (e) => e.key === 'Enter' && fn()));
const bloquea = (ctx) => ctx.acciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
const nombrePos = (v) => (v >= 1000 ? 'unidades de millar' : v >= 100 ? 'centenas' : v >= 10 ? 'decenas' : 'unidades');

/* ---------------------------------------------------------------- partir */
function partir(d, ctx) {
  const { a, b } = d;
  const pa = partes(a), pb = partes(b);
  ctx.reto(d.texto ?? `Trocea **${num(a)} × ${num(b)}** y suma los trozos`);
  ctx.pista(d.pista ?? 'Cada rectángulo pequeño es una multiplicación fácil. Escribe cuánto vale cada uno y, abajo, el total.');
  const rect = el('div', { class: 'rect-mult', style: { gridTemplateColumns: `auto ${pa.map((v) => `${Math.max(1, v ** 0.55)}fr`).join(' ')}` } });
  rect.append(el('span', { class: 'esquina', text: '×' }));
  pa.forEach((v) => rect.append(el('span', { class: 'cabeza', text: num(v) })));
  const celdas = [];
  pb.forEach((w, fi) => {
    rect.append(el('span', { class: 'cabeza fila', text: num(w) }));
    pa.forEach((v, ci) => {
      const inp = campo(`${v} por ${w}`, 6);
      const c = el('div', { class: `trozo t${(fi + ci) % 4}`, style: { minHeight: Math.max(64, Math.min(150, 40 + w ** 0.55 * 9)) + 'px' } }, el('small', { class: 'dim', text: `${num(v)} × ${num(w)}` }), inp);
      rect.append(c);
      celdas.push({ v, w, inp, c, bueno: v * w });
    });
  });
  const total = campo('Total', 8);
  const fila = el('p', { class: 'total-mult' }, `${num(a)} × ${num(b)} = `, total);
  ctx.escenario.append(el('div', { class: 'mesa-mult' }, rect), fila);
  ctx.pistas([
    { texto: d.pistas?.[0] ?? `Se parte cada número en ${nombrePos(pa[0])}, decenas y unidades: ${pa.map(num).join(' + ')} y ${pb.map(num).join(' + ')}.` },
    { texto: d.pistas?.[1] ?? 'Te escribo qué multiplicación es cada trozo.', ver: () => rect.classList.add('con-dim') },
    { texto: d.pistas?.[2] ?? 'Te resuelvo el trozo más grande. Fíjate en cuántos ceros tiene.', ver: () => { const c = celdas[0]; c.inp.value = c.bueno; c.inp.classList.add('dado'); } },
  ]);
  if (ctx.primera) mano(celdas[0].inp, { dx: 0.5 });
  const btn = ctx.boton('Comprobar', revisar);
  enter([...celdas.map((c) => c.inp), total], revisar);
  let hecho = false;
  async function revisar() {
    if (hecho) return; hecho = true; bloquea(ctx);
    let malas = 0, ceros = null;
    for (const c of celdas) {
      await espera(120);
      const v = lee(c.inp);
      const ok = v === c.bueno;
      c.inp.classList.add(ok ? 'bien' : 'mal'); c.inp.readOnly = true;
      if (!ok) { malas++; if (v && (v * 10 === c.bueno || v === c.bueno * 10)) ceros = c; c.c.append(el('b', { class: 'corrige', text: num(c.bueno) })); }
      suena(ok ? 'pon' : 'quita');
    }
    await espera(200);
    const vt = lee(total), okT = vt === a * b;
    total.classList.add(okT ? 'bien' : 'mal'); total.readOnly = true;
    if (!okT) fila.append(el('b', { class: 'corrige', text: num(a * b) }));
    const suma = celdas.reduce((s, c) => s + (lee(c.inp) ?? 0), 0);
    const errores = malas + (okT ? 0 : 1);
    const estrellas = errores === 0 ? 3 : errores === 1 ? 2 : errores === 2 ? 1 : 0;
    let msg = errores === 0 ? `**${num(a)} × ${num(b)} = ${num(a * b)}.** Todos los trozos bien.` : '';
    if (ceros) msg += ` Ojo con los ceros: ${num(ceros.v)} × ${num(ceros.w)} son ${num(ceros.bueno)}.`;
    else if (!malas && !okT) msg += ` Los trozos están bien: falla la suma. ${celdas.map((c) => num(c.bueno)).join(' + ')} = ${num(a * b)}.`;
    else if (malas) msg += ` ${malas === 1 ? 'Hay un trozo' : `Hay ${malas} trozos`} mal; te escribo en rojo lo que vale.`;
    if (!okT && malas === 0 && suma === a * b) msg = 'Los trozos están bien, pero el total no coincide con su suma.';
    ctx.fin(estrellas, msg.trim() + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- cajita */
function cajita(d, ctx) {
  const { a, b } = d, p = a * b;
  const oc = d.oculto ?? 'producto';
  const quita0 = (n) => { let k = 1; while (n % 10 === 0 && n > 0) { n /= 10; k *= 10; } return [n, k]; };
  const [a0, ka] = quita0(a), [b0, kb] = quita0(b);
  ctx.reto(d.texto ?? (oc === 'producto' ? 'Completa la **cajita**: ¿cuánto es el producto?' : 'Completa la **cajita**: falta un factor'));
  ctx.pista(d.pista ?? 'Abajo, los dos factores. Arriba, lo que dan al multiplicarse.');
  const inp = campo('Número que falta', 7);
  const caja = (val, rol) => el('div', { class: 'nodo ' + rol }, el('small', { text: rol === 'prod' ? 'producto' : 'factor' }), val == null ? inp : el('b', { text: num(val) }));
  const tri = el('div', { class: 'cajita' },
    svg('0 0 300 200', '<path d="M150 30 L40 170 L260 170Z" fill="#fff" stroke="#000" stroke-width="5" stroke-linejoin="round"/><text x="150" y="128" text-anchor="middle" font-family="Rotulo,Impact" font-weight="900" font-size="54">×</text>', { class: 'tri' }),
    caja(oc === 'producto' ? null : p, 'prod'), caja(oc === 'a' ? null : a, 'fa'), caja(oc === 'b' ? null : b, 'fb'));
  ctx.escenario.append(tri);
  const conocido = oc === 'a' ? b : a;
  ctx.pistas([
    { texto: d.pistas?.[0] ?? (oc === 'producto' ? 'Mira los ceros: ' + [[a, a0, ka], [b, b0, kb]].filter((x) => x[2] > 1).map(([n, n0, k]) => `${num(n)} son ${n0} ${k === 10 ? 'decenas' : 'centenas'}`).join(' y ') + '.' : `¿Qué número multiplicado por ${num(conocido)} da ${num(p)}? Es una división: ${num(p)} : ${num(conocido)}.`) },
    { texto: d.pistas?.[1] ?? `${num(a)} × ${num(b)} es lo mismo que ${a0} × ${b0} × ${num(ka * kb)}.` },
    { texto: d.pistas?.[2] ?? `Primero ${a0} × ${b0} = ${a0 * b0}. Luego, ${oc === 'producto' ? `por ${num(ka * kb)}` : 'busca cuántos ceros faltan'}.` },
  ]);
  if (ctx.primera) mano(inp, { dx: 0.5 });
  setTimeout(() => inp.focus({ preventScroll: true }), 400);
  ctx.boton('Comprobar', revisar); enter([inp], revisar);
  let hecho = false;
  async function revisar() {
    if (hecho) return; hecho = true; bloquea(ctx);
    const v = lee(inp), bueno = oc === 'producto' ? p : oc === 'a' ? a : b;
    const ok = v === bueno;
    inp.classList.add(ok ? 'bien' : 'mal'); inp.readOnly = true;
    if (!ok) tri.append(el('b', { class: 'corrige en-caja ' + (oc === 'producto' ? 'prod' : oc === 'a' ? 'fa' : 'fb'), text: num(bueno) }));
    await espera(300);
    let msg;
    if (ok) msg = `**${num(a)} × ${num(b)} = ${num(p)}.** ${ka > 1 && kb > 1 ? `Dos factores con ceros: ${a0} × ${b0} y ${num(ka * kb)} veces más.` : ''}`;
    else if (v && (v * 10 === bueno || v * 100 === bueno)) msg = `Te faltan ceros: ${num(a)} × ${num(b)} = ${a0} × ${b0} × ${num(ka * kb)} = ${num(p)}.`;
    else if (v && (v === bueno * 10 || v === bueno * 100)) msg = `Te sobran ceros. Era ${num(bueno)}.`;
    else if (v === a + b) msg = `Has sumado los factores. En la cajita se multiplican: ${num(a)} × ${num(b)} = ${num(p)}.`;
    else msg = `Era ${num(bueno)}: ${num(a)} × ${num(b)} = ${num(p)}.`;
    ctx.fin(ok ? 3 : 0, msg.trim() + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- cuadrado */
function patioSVG(lado, total, max = 12) {
  const n = Math.max(lado, 1), t = Math.min(26, 260 / Math.max(n, 1));
  let s = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) s += `<rect x="${x * t + 2}" y="${y * t + 2}" width="${t - 3}" height="${t - 3}" rx="3" class="baldosa"/>`;
  const sobra = total != null ? total - n * n : 0;
  for (let k = 0; k < Math.max(0, sobra); k++) s += `<rect x="${n * t + 12 + (k % 3) * t}" y="${Math.floor(k / 3) * t + 2}" width="${t - 3}" height="${t - 3}" rx="3" class="baldosa sobra"/>`;
  const w = n * t + 14 + (sobra > 0 ? Math.min(3, sobra) * t : 0), h = Math.max(n, Math.ceil(Math.max(0, sobra) / 3)) * t + 4;
  return svg(`0 0 ${w} ${h}`, s, { class: 'patio', width: Math.min(w, 340) });
}
function cuadrado(d, ctx) {
  const tipo = d.tipo ?? 'potencia';
  let hecho = false;
  if (tipo === 'potencia') {
    const n = d.n;
    ctx.reto(d.texto ?? `¿Cuánto es **${n}²**?`);
    ctx.pista(d.pista ?? `Se lee «${n} al cuadrado».`);
    const inp = campo('Resultado', 5);
    const dib = el('div', { class: 'patio-caja' });
    ctx.escenario.append(el('p', { class: 'total-mult' }, `${n}² = `, inp), dib);
    ctx.pistas([
      { texto: d.pistas?.[0] ?? `${n}² no es ${n} × 2: es **${n} × ${n}**.` },
      { texto: d.pistas?.[1] ?? `Es un patio cuadrado de ${n} filas de ${n} baldosas.`, ver: () => dib.replaceChildren(patioSVG(n)) },
      { texto: d.pistas?.[2] ?? `Cuenta las filas de ${n} de ${n} en ${n}.` },
    ]);
    setTimeout(() => inp.focus({ preventScroll: true }), 400);
    ctx.boton('Comprobar', revisar); enter([inp], revisar);
    async function revisar() {
      if (hecho) return; hecho = true; bloquea(ctx);
      const v = lee(inp), ok = v === n * n;
      inp.classList.add(ok ? 'bien' : 'mal'); inp.readOnly = true;
      dib.replaceChildren(patioSVG(n));
      await espera(350);
      ctx.fin(ok ? 3 : 0, ok ? `**${n}² = ${n} × ${n} = ${n * n}.** Un patio de ${n} por ${n}.` : v === 2 * n ? `Eso es ${n} × 2. ${n}² es ${n} × ${n} = ${n * n}.` : `${n}² = ${n} × ${n} = ${n * n}.`);
    }
    return;
  }
  if (tipo === 'elegir') {
    ctx.reto(d.texto ?? '¿Cuál de estos números es **cuadrado**?');
    ctx.pista(d.pista ?? 'Un número es cuadrado si con esas baldosas sale un patio cuadrado sin que sobre ninguna.');
    let elegido = null;
    const ops = el('div', { class: 'opciones-num', role: 'group' });
    const botones = d.opciones.map((v) => { const b = el('button', { type: 'button', class: 'tecla grande op', 'aria-pressed': 'false', text: num(v) }); b.onclick = () => { if (hecho) return; botones.forEach((x) => x.setAttribute('aria-pressed', 'false')); b.setAttribute('aria-pressed', 'true'); elegido = v; suena('pon'); btn.disabled = false; }; ops.append(b); return b; });
    const dib = el('div', { class: 'patios' });
    ctx.escenario.append(ops, dib);
    ctx.pistas([
      { texto: d.pistas?.[0] ?? 'Piensa en 1 × 1, 2 × 2, 3 × 3, 4 × 4… ¿Alguno de esos resultados está aquí? Ojo: el 1 también cuenta.' },
      { texto: d.pistas?.[1] ?? 'Te dibujo el patio más grande que sale con cada número. Mira cuáles dejan baldosas sueltas.', ver: () => pinta(false) },
      { texto: d.pistas?.[2] ?? 'Te descarto uno que no es.', ver: () => { const b = botones.find((x, i) => !Number.isInteger(Math.sqrt(d.opciones[i])) && x.getAttribute('aria-pressed') !== 'true'); if (b) { b.disabled = true; b.classList.add('descartada'); } } },
    ]);
    const pinta = () => dib.replaceChildren(...d.opciones.map((v) => { const r = Math.floor(Math.sqrt(v)); return el('figure', {}, patioSVG(r, v), el('figcaption', { text: v === r * r ? `${num(v)} = ${r} × ${r}` : `${num(v)}: sobran ${v - r * r}` })); }));
    const btn = ctx.boton('Comprobar', revisar); btn.disabled = true;
    async function revisar() {
      if (hecho || elegido == null) return; hecho = true; bloquea(ctx);
      pinta(); await espera(400);
      const ok = Number.isInteger(Math.sqrt(elegido));
      botones.forEach((b, i) => b.classList.add(Number.isInteger(Math.sqrt(d.opciones[i])) ? 'es' : 'no'));
      const r = Math.round(Math.sqrt(elegido));
      ctx.fin(ok ? 3 : 0, ok ? `**${num(elegido)} = ${r} × ${r}.** Sale un patio cuadrado justo.` : `Con ${num(elegido)} baldosas sobran ${elegido - Math.floor(Math.sqrt(elegido)) ** 2}. El cuadrado era el ${d.opciones.filter((v) => Number.isInteger(Math.sqrt(v))).map(num).join(' y el ')}.`);
    }
    return;
  }
  // patio: con N baldosas, ¿sale un patio cuadrado?
  const N = d.n;
  let lado = 1;
  ctx.reto(d.texto ?? `Con **${num(N)} baldosas**, ¿se puede hacer un patio cuadrado sin que sobre ninguna?`);
  ctx.pista(d.pista ?? 'Cambia el lado del patio con los botones. Si encuentras el patio justo, elígelo; si no existe, dilo.');
  const dib = el('div', { class: 'patio-caja' });
  const info = el('p', { class: 'estado-geo', 'aria-live': 'polite' });
  const ctrl = el('div', { class: 'saltos' },
    el('button', { type: 'button', class: 'tecla', text: '− lado', onclick: () => cambia(-1) }),
    el('button', { type: 'button', class: 'tecla', text: '+ lado', onclick: () => cambia(1) }));
  ctx.escenario.append(ctrl, dib, info);
  const cambia = (k) => { if (hecho) return; const nuevo = lado + k; if (nuevo < 1 || nuevo * nuevo > N + 2 * Math.sqrt(N) + 1) return; lado = nuevo; suena(k > 0 ? 'pon' : 'quita'); pinta(); };
  const pinta = () => { dib.replaceChildren(patioSVG(lado, lado * lado <= N ? N : null)); info.textContent = lado * lado <= N ? `Patio de ${lado} × ${lado} = ${lado * lado} baldosas. ${N - lado * lado ? `Sobran ${N - lado * lado}.` : 'No sobra ninguna.'}` : `Patio de ${lado} × ${lado} = ${lado * lado}: faltan ${lado * lado - N} baldosas.`; };
  pinta();
  ctx.pistas([
    { texto: d.pistas?.[0] ?? `Busca un número que multiplicado por sí mismo dé ${num(N)}.` },
    { texto: d.pistas?.[1] ?? `Prueba lados seguidos y mira las baldosas que sobran: si de un lado a otro pasas de sobrar a faltar, no hay patio justo.` },
    { texto: d.pistas?.[2] ?? `${Math.floor(Math.sqrt(N))} × ${Math.floor(Math.sqrt(N))} = ${Math.floor(Math.sqrt(N)) ** 2}. ¿Y el siguiente?` },
  ]);
  ctx.boton('Este es el patio', () => revisar('si'));
  ctx.boton('No se puede sin que sobren', () => revisar('no'), true);
  async function revisar(resp) {
    if (hecho) return; hecho = true; bloquea(ctx); ctrl.querySelectorAll('button').forEach((b) => (b.disabled = true));
    const r = Math.sqrt(N), es = Number.isInteger(r);
    const ok = resp === 'si' ? es && lado * lado === N : !es;
    await espera(250);
    ctx.fin(ok ? 3 : 0, ok ? (es ? `**${num(N)} = ${r} × ${r}.** Patio justo.` : `**Bien visto.** ${Math.floor(r)} × ${Math.floor(r)} = ${Math.floor(r) ** 2} y ${Math.ceil(r)} × ${Math.ceil(r)} = ${Math.ceil(r) ** 2}: ${num(N)} queda en medio.`)
      : resp === 'si' ? (es ? `Ese patio no usa ${num(N)} baldosas. El justo es ${r} × ${r}.` : `Con ${num(N)} no sale patio cuadrado: siempre sobran o faltan.`) : `Sí se puede: ${r} × ${r} = ${num(N)}.`);
  }
}

/* ---------------------------------------------------------------- areas */
function areas(d, ctx) {
  const P = d.parcelas; // [{a, b, cuadrado?}]
  ctx.reto(d.texto ?? 'Ordena las parcelas de **menor a mayor área**');
  ctx.pista(d.pista ?? (d.escala ? 'Toca las parcelas en orden, de la más pequeña a la más grande.' : 'Toca las parcelas en orden, de la más pequeña a la más grande. **Los dibujos no están a escala.**'));
  const orden = [];
  const zona = el('div', { class: 'parcelas' });
  const maxLado = Math.max(...P.flatMap((p) => [p.a, p.b]));
  const cartas = barajar(P).map((p, i) => {
    const area = p.a * p.b;
    // dibujo: a escala o con tamaños inventados que engañan
    const w0 = d.escala ? 30 + (p.a / maxLado) * 150 : azar(60, 170), h0 = d.escala ? 30 + (p.b / maxLado) * 150 : azar(50, 150);
    const fig = el('div', { class: 'parcela-fig', style: { width: w0 + 'px', height: (p.cuadrado ? w0 : h0) + 'px' } },
      el('span', { class: 'lado-h', text: `${p.a} m` }), !p.cuadrado && el('span', { class: 'lado-v', text: `${p.b} m` }));
    const etq = el('span', { class: 'orden-pista', hidden: true });
    const sub = el('small', { class: 'cuenta-area' });
    const b = el('button', { type: 'button', class: 'parcela' }, fig, el('span', { class: 'nombre-parcela', text: p.cuadrado ? `Cuadrado de lado ${p.a} m` : `Rectángulo de ${p.a} m por ${p.b} m` }), sub, etq);
    const c = { p, area, b, fig, etq, sub };
    b.onclick = () => {
      if (hecho) return;
      const k = orden.indexOf(c);
      if (k >= 0) orden.splice(k, 1); else orden.push(c);
      suena(k >= 0 ? 'quita' : 'pon'); marca();
    };
    zona.append(b);
    return c;
  });
  const marca = () => { cartas.forEach((c) => { const k = orden.indexOf(c); c.etq.hidden = k < 0; c.etq.textContent = k + 1; c.b.classList.toggle('elegida', k >= 0); }); btn.disabled = orden.length < cartas.length; };
  ctx.escenario.append(zona);
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'El área es **largo × ancho**. El tamaño del dibujo no cuenta: cuentan los números.' },
    { texto: d.pistas?.[1] ?? 'Te escribo la multiplicación de cada parcela.', ver: () => cartas.forEach((c) => (c.sub.textContent = `${c.p.a} × ${c.p.b} = ?`)) },
    { texto: d.pistas?.[2] ?? 'Te calculo el área de una.', ver: () => { const c = cartas[0]; c.sub.textContent = `${c.p.a} × ${c.p.b} = ${num(c.area)} m²`; } },
  ]);
  if (ctx.primera) mano(cartas[0].b, { dx: 0.5 });
  const btn = ctx.boton('Comprobar', revisar); btn.disabled = true;
  let hecho = false;
  async function revisar() {
    if (hecho) return; hecho = true; bloquea(ctx);
    let inv = 0;
    for (let i = 0; i < orden.length; i++) for (let j = i + 1; j < orden.length; j++) if (orden[i].area > orden[j].area) inv++;
    // revelado: cada parcela pasa a su tamaño real
    const maxA = Math.max(...cartas.flatMap((c) => [c.p.a, c.p.b]));
    for (const c of [...cartas].sort((x, y) => x.area - y.area)) {
      await espera(260);
      c.sub.textContent = `${c.p.a} × ${c.p.b} = ${num(c.area)} m²`;
      c.fig.style.width = 24 + (c.p.a / maxA) * 160 + 'px'; c.fig.style.height = 24 + (c.p.b / maxA) * 160 + 'px';
      c.fig.classList.add('real'); suena('pon');
    }
    const estrellas = inv === 0 ? 3 : inv === 1 ? 2 : inv === 2 ? 1 : 0;
    const per = (c) => 2 * (c.p.a + c.p.b);
    const trampa = cartas.find((x) => cartas.some((y) => y !== x && per(y) === per(x) && y.area !== x.area));
    ctx.fin(estrellas, (inv === 0 ? '**Orden perfecto.** ' : `Hay ${inv} ${inv === 1 ? 'pareja cambiada' : 'parejas cambiadas'}. `) + 'Ahora los dibujos están a escala: mira cuáles engañaban.' + (trampa ? ' Hay dos con el mismo perímetro y distinta área.' : '') + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ---------------------------------------------------------------- problemas */
const HISTORIAS = {
  grupos: [
    (a, b) => [`En cada caja caben **${a} rotuladores**. ¿Cuántos rotuladores hay en **${b} cajas**?`, 'rotuladores'],
    (a, b) => [`Cada autobús de la excursión lleva **${a} asientos**. Van **${b} autobuses**. ¿Cuántos asientos hay en total?`, 'asientos'],
    (a, b) => [`Un sobre trae **${a} cromos**. Si compro **${b} sobres**, ¿cuántos cromos tengo?`, 'cromos'],
  ],
  combinaciones: [
    (a, b) => [`En la heladería hay **${a} sabores** y **${b} toppings**. Cada copa lleva un sabor y un topping. ¿Cuántas copas distintas se pueden pedir?`, 'copas'],
    (a, b) => [`Tengo **${a} camisetas** y **${b} pantalones**. ¿Cuántos conjuntos distintos de camiseta y pantalón puedo hacer?`, 'conjuntos'],
    (a, b) => [`El comedor ofrece **${a} primeros** y **${b} segundos**. ¿Cuántos menús distintos de primero y segundo hay?`, 'menús'],
  ],
  filas: [
    (a, b) => [`El suelo del patio tiene **${a} filas** de **${b} baldosas** cada una. ¿Cuántas baldosas hay?`, 'baldosas'],
    (a, b) => [`En el salón de actos hay **${a} filas** con **${b} butacas** en cada fila. ¿Cuántas butacas hay?`, 'butacas'],
    (a, b) => [`Un huerto tiene **${a} filas** de **${b} lechugas**. ¿Cuántas lechugas hay plantadas?`, 'lechugas'],
  ],
};
function problemas(d, ctx) {
  const { a, b, estructura } = d;
  const [texto, unidad] = HISTORIAS[estructura][d.historia % HISTORIAS[estructura].length](a, b);
  ctx.reto(d.titulo ?? '¿Qué cuenta hay que hacer?');
  ctx.pista('');
  const enunciado = el('p', { class: 'enunciado' });
  enunciado.append(...String(texto).split(/\*\*(.+?)\*\*/g).map((t, i) => (i % 2 ? el('strong', { text: t }) : t)));
  const mayor = Math.max(a, b), menor = Math.min(a, b);
  const cuentas = barajar([{ t: `${a} + ${b}`, ok: false, por: 'suma' }, { t: `${a} × ${b}`, ok: true }, { t: `${mayor} − ${menor}`, ok: false, por: 'resta' }]);
  let elegida = null;
  const ops = el('div', { class: 'opciones-num', role: 'group', 'aria-label': 'Cuenta' });
  const botones = cuentas.map((c) => { const bt = el('button', { type: 'button', class: 'tecla grande op', 'aria-pressed': 'false', text: c.t }); bt.onclick = () => { if (hecho) return; botones.forEach((x) => x.setAttribute('aria-pressed', 'false')); bt.setAttribute('aria-pressed', 'true'); elegida = c; suena('pon'); }; ops.append(bt); return bt; });
  const inp = campo('Resultado', 7);
  const dibujo = el('div', { class: 'esquema' });
  ctx.escenario.append(enunciado, el('p', { class: 'etiqueta-paso', text: '1. Elige la cuenta' }), ops, el('p', { class: 'total-mult' }, el('span', { class: 'etiqueta-paso', text: '2. Resultado: ' }), inp, ` ${unidad}`), dibujo);
  const esquema = () => {
    const fi = Math.min(estructura === 'grupos' ? b : a, 10), co = Math.min(estructura === 'grupos' ? a : b, 12);
    let s = '';
    if (estructura === 'grupos') for (let g = 0; g < Math.min(b, 6); g++) { s += `<rect x="${g * 70 + 2}" y="2" width="62" height="62" rx="10" class="caja-g"/>`; for (let k = 0; k < Math.min(a, 9); k++) s += `<circle cx="${g * 70 + 14 + (k % 3) * 19}" cy="${16 + Math.floor(k / 3) * 19}" r="6" class="punto-g"/>`; }
    else for (let y = 0; y < fi; y++) for (let x = 0; x < co; x++) s += estructura === 'filas' ? `<rect x="${x * 20 + 2}" y="${y * 20 + 2}" width="17" height="17" rx="3" class="baldosa"/>` : `<circle cx="${x * 20 + 12}" cy="${y * 20 + 12}" r="6" class="punto-g"/>`;
    const w = estructura === 'grupos' ? Math.min(b, 6) * 70 : co * 20 + 4, h = estructura === 'grupos' ? 66 : fi * 20 + 4;
    const pie = estructura === 'grupos' ? `${b} grupos de ${a}${b > 6 || a > 9 ? ' (dibujo recortado)' : ''}` : estructura === 'filas' ? `${a} filas de ${b}${a > 10 || b > 12 ? ' (dibujo recortado)' : ''}` : `una tabla de ${a} por ${b}: cada punto es una combinación${a > 10 || b > 12 ? ' (dibujo recortado)' : ''}`;
    dibujo.replaceChildren(svg(`0 0 ${w} ${h}`, s, { width: Math.min(w, 520) }), el('p', { class: 'estado-geo', text: pie }));
  };
  ctx.pistas([
    { texto: d.pistas?.[0] ?? '¿Qué cuenta cada número? Uno dice **cuántos grupos** o filas hay y el otro **cuántos en cada uno**.' },
    { texto: d.pistas?.[1] ?? (estructura === 'combinaciones' ? 'Haz una tabla: una cosa en columnas y la otra en filas. Cada casilla es una combinación.' : estructura === 'filas' ? 'Es un rectángulo: filas por las que hay en cada fila.' : `Son ${b} grupos iguales de ${a}.`), ver: esquema },
    { texto: d.pistas?.[2] ?? `La cuenta es ${a} × ${b}. Ahora calcúlala.`, ver: () => { const bt = botones[cuentas.findIndex((c) => c.ok)]; bt.click(); } },
  ]);
  if (ctx.primera) mano(botones[0], { dx: 0.5 });
  ctx.boton('Comprobar', revisar); enter([inp], revisar);
  let hecho = false;
  async function revisar() {
    if (!elegida) return ctx.aviso('Primero elige la cuenta.', true);
    if (hecho) return; hecho = true; bloquea(ctx);
    const v = lee(inp), okR = v === a * b, okC = elegida.ok;
    botones.forEach((bt, i) => bt.classList.add(cuentas[i].ok ? 'es' : 'no'));
    inp.classList.add(okR ? 'bien' : 'mal'); inp.readOnly = true;
    esquema();
    await espera(400);
    const estrellas = okC && okR ? 3 : okC ? 1 : 0;
    const porque = estructura === 'combinaciones' ? `Cada uno de los ${a} se combina con cada uno de los ${b}: no se suman, se multiplican.` : estructura === 'filas' ? `Son ${a} filas iguales de ${b}.` : `Son ${b} grupos iguales de ${a}.`;
    ctx.fin(estrellas, (okC && okR ? `**${a} × ${b} = ${num(a * b)} ${unidad}.** ` : !okC ? `${elegida.por === 'suma' ? 'Sumar' : 'Restar'} no vale aquí. ` : `La cuenta es esa, pero ${a} × ${b} = ${num(a * b)}. `) + porque);
  }
}

/* ---------------------------------------------------------------- generadores */
const conCifras = (n) => azar(n === 1 ? 2 : 10 ** (n - 1) + 1, 10 ** n - 1);
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (d.modo === 'partir') { d.a = conCifras(g.cifras?.[0] ?? 2); d.b = conCifras(g.cifras?.[1] ?? 2); if (g.ordenar !== false && d.a < d.b) [d.a, d.b] = [d.b, d.a]; }
  if (d.modo === 'cajita') {
    const f = (t) => (t === 'u' ? azar(2, 9) : t === 'd' ? azar(2, 9) * 10 : azar(2, 9) * 100);
    const [ta, tb] = g.tipos ?? ['d', 'u'];
    d.a = f(ta); d.b = f(tb);
    d.oculto = g.oculto ? elige([].concat(g.oculto)) : 'producto';
  }
  if (d.modo === 'cuadrado') {
    if (d.tipo === 'potencia') d.n = azar(...(g.n ?? [2, 9]));
    if (d.tipo === 'elegir') {
      const [lo, hi] = g.n ?? [1, 7];
      const r = azar(lo, hi), q = r * r;
      const cerca = new Set();
      while (cerca.size < 3) { const v = q + elige([-3, -2, -1, 1, 2, 3, 4, 5, 2 * r, -2 * r + 2]) ; if (v > 1 && !Number.isInteger(Math.sqrt(v))) cerca.add(v); if (g.dobles && cerca.size < 3 && !Number.isInteger(Math.sqrt(2 * r))) cerca.add(2 * r); }
      d.opciones = barajar([q, ...cerca]);
    }
    if (d.tipo === 'patio') { const r = azar(...(g.n ?? [3, 9])); d.n = Math.random() < 0.5 ? r * r : r * r + azar(1, 2 * r); }
  }
  if (d.modo === 'areas') {
    const [lo, hi] = g.lados ?? [2, 10];
    const ps = [];
    let t = 0;
    while (ps.length < (g.cantidad ?? 4) && t++ < 300) {
      const cu = g.cuadrados && Math.random() < 0.35;
      const a = azar(lo, hi), b = cu ? a : azar(lo, hi);
      if (ps.some((p) => p.a * p.b === a * b)) continue;
      ps.push({ a, b, cuadrado: cu || undefined });
    }
    if (g.mismoPerimetro) {
      // dos parcelas con el mismo perímetro y distinta área
      const s = azar(Math.max(2 * lo + 3, 8), Math.min(2 * hi - 1, 30));
      const x1 = lo, x2 = Math.max(lo + 1, Math.floor(s / 2) - 1);
      if (x2 < s - x2 && x1 < s - x1 && s - x1 <= hi && s - x2 <= hi) {
        ps[0] = { a: s - x1, b: x1 }; ps[1] = { a: s - x2, b: x2 };
        for (let k = 2; k < ps.length; k++) { let u = 0; while (ps.some((p, j) => j !== k && p.a * p.b === ps[k].a * ps[k].b) && u++ < 50) { const a = azar(lo, hi); ps[k] = { a, b: azar(lo, hi) }; } }
      }
    }
    d.parcelas = ps;
  }
  if (d.modo === 'problemas') {
    d.estructura = elige([].concat(g.estructuras ?? ['grupos']));
    d.a = azar(...(g.a ?? [3, 9])); d.b = azar(...(g.b ?? [3, 9]));
    d.historia = azar(0, 2);
  }
  return d;
}

export function ronda(d, ctx) {
  return { partir, cajita, cuadrado, areas, problemas }[d.modo](d, ctx);
}
