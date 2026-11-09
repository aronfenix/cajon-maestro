// Motor «numeros»: casetas de la feria con números de cuatro cifras.
//   tendedero → la tómbola: colgar los boletos en la cuerda, en orden (de menor a mayor o al revés)
//   candado   → la taquilla: un candado de ruedas que solo tiene unas cifras. Se abre con el mayor,
//               el menor, uno mayor (o menor) que el del cartel, o el que va justo detrás.
import { el, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { arrastra, aterriza, espera, temblor, chispasEn, demuestra } from './efectos.js';
import { cifras, porIntento, numerosCon } from './kit.js';

const COLORES = ['#ffc531', '#5ec3ff', '#ff9fbf', '#9bd84a', '#ffb054', '#b79cff'];

export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (d.modo === 'tendedero') {
    const n = g.cantidad ?? 5, set = new Set();
    const parecido = g.parecido ?? 0;
    if (g.mismas) {
      // las mismas cuatro cifras, colocadas de formas distintas
      let cs; do cs = barajar([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4); while (cs.filter((c) => c).length < 3);
      const todos = numerosCon(cs);
      barajar(todos).slice(0, n).forEach((x) => set.add(x));
    } else {
      const m = azar(1, 8), c = azar(0, 9);
      const millares = barajar([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      const cent = barajar([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let k = 0;
      while (set.size < n && k < 500) {
        k++;
        let x;
        if (parecido === 0) x = millares[set.size % 9] * 1000 + azar(0, 999);
        else if (parecido === 1) x = m * 1000 + cent[set.size % 10] * 100 + azar(0, 99);
        else x = m * 1000 + c * 100 + azar(0, 99); // mismas dos primeras: desempatan decenas y unidades
        if (g.mezcla && set.size % 2) x = (parecido ? m : millares[0]) * 1000 + azar(0, 999);
        set.add(x);
      }
      if (g.tres) { const v = [...set]; v[0] = azar(9, 9) * 100 + azar(50, 99); v[1] = 1000 + azar(0, 99); set.clear(); v.forEach((x) => set.add(x)); }
    }
    d.numeros = barajar([...set]);
    d.orden ??= g.orden ?? 'sube';
    return d;
  }
  if (d.modo === 'candado') {
    const k = g.ruedas ?? 4, n = g.disponibles ?? k;
    let cs;
    do { cs = barajar([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, n); } while ((!g.cero && cs.includes(0)) || (g.cero && !cs.includes(0)) || cs.filter((c) => c).length < k);
    d.cifras = cs.sort((a, b) => a - b);
    d.ruedas = k;
    d.tipo ??= g.tipo ?? 'mayor';
    const todos = numerosCon(d.cifras, k);
    if (['mayorQue', 'menorQue', 'justoEncima', 'justoDebajo'].includes(d.tipo)) {
      // el número del cartel cae por el medio de los que se pueden formar, y no se puede formar él mismo
      let x;
      do {
        const a = todos[Math.floor(todos.length * (0.25 + Math.random() * 0.5))];
        x = a + (Math.random() < 0.5 ? 1 : -1) * azar(1, 40);
      } while (todos.includes(x) || x < 10 ** (k - 1) || x >= 10 ** k);
      d.cartel = x;
    }
    return d;
  }
  return d;
}
export function ronda(d, ctx) { return d.modo === 'candado' ? candado(d, ctx) : tendedero(d, ctx); }

/* ================================================================ la tómbola: el tendedero de boletos */
function boleto(n, i) {
  return el('div', { class: 'boleto', tabindex: 0, role: 'button', 'aria-label': `Boleto ${num(n)}`, 'data-n': n, style: { '--c': COLORES[i % COLORES.length], '--r': ((i % 2 ? 1 : -1) * (2 + (i % 3))) + 'deg' } },
    el('small', { text: 'Nº' }), el('b', {}, cifras(n)));
}
function tendedero(d, ctx) {
  const N = d.numeros.length, sube = d.orden !== 'baja';
  const bien = [...d.numeros].sort((a, b) => (sube ? a - b : b - a));
  ctx.reto(d.texto ?? (sube ? 'Cuelga los boletos de **menor a mayor**' : 'Cuelga los boletos de **mayor a menor**'));
  ctx.pista(d.pista ?? 'Arrastra cada boleto a una pinza. Si te equivocas de pinza, arrástralo a otra: se cambian de sitio.');
  const cuerda = el('div', { class: 'cuerda-tombola', style: { '--n': N } });
  const sag = 34;
  cuerda.append(el('div', { class: 'cuerda-svg', html: `<svg viewBox="0 0 1000 120" preserveAspectRatio="none" aria-hidden="true"><path d="M0 18 Q500 ${18 + 2 * sag * 2.2} 1000 18" fill="none" stroke="#1b1e3a" stroke-width="7" vector-effect="non-scaling-stroke"/><path d="M0 18 Q500 ${18 + 2 * sag * 2.2} 1000 18" fill="none" stroke="#e8d3a6" stroke-width="3.5" stroke-dasharray="8 6" vector-effect="non-scaling-stroke"/></svg>` }));
  const poste = (lado, txt) => el('div', { class: 'poste-tombola ' + lado }, el('span', { class: 'cartel-poste', text: txt }));
  cuerda.append(poste('izq', sube ? 'MENOR' : 'MAYOR'), poste('der', sube ? 'MAYOR' : 'MENOR'));
  const huecos = bien.map((_, i) => {
    const t = (i + 1) / (N + 1);
    const h = el('div', { class: 'hueco-boleto', 'data-i': i, style: { left: t * 100 + '%', top: 18 + sag * 4 * t * (1 - t) * 1.1 + 'px' } }, el('span', { class: 'pinza', 'aria-hidden': 'true' }));
    cuerda.append(h); return h;
  });
  const cesta = el('div', { class: 'cesta-tombola', 'aria-label': 'Cesta de boletos' });
  const boletos = d.numeros.map((n, i) => boleto(n, i));
  cesta.append(...boletos);
  const zona = el('div', { class: 'caseta-tombola' }, cuerda, el('div', { class: 'mostrador' }, el('span', { class: 'rotulo-cesta', text: 'Cesta' }), cesta));
  ctx.escenario.append(zona);

  const sitio = new Map(); // boleto → índice de hueco
  let elegido = null, comprobando = false, intento = 0;
  const ocupante = (i) => boletos.find((b) => sitio.get(b) === i);
  const listo = () => (boton.disabled = sitio.size < N || comprobando);
  const coloca = (b, i) => {
    const otro = ocupante(i);
    const antes = sitio.get(b);
    if (otro && otro !== b) {
      if (antes != null) { sitio.set(otro, antes); huecos[antes].append(otro); aterriza(otro); }
      else { sitio.delete(otro); cesta.append(otro); }
    }
    sitio.set(b, i); huecos[i].append(b);
    b.classList.remove('mal');
    listo();
  };
  const quita = (b) => { sitio.delete(b); cesta.append(b); listo(); };
  const elige = (b) => { elegido?.classList.remove('elegida'); elegido = elegido === b ? null : b; elegido?.classList.add('elegida'); suena('clic'); };
  boletos.forEach((b) => {
    arrastra(b, {
      puede: () => !comprobando,
      destinos: () => [...huecos, cesta],
      alSoltar: (dest) => { elegido?.classList.remove('elegida'); elegido = null; if (dest === cesta) quita(b); else coloca(b, +dest.dataset.i); return b; },
      alTocar: () => { if (!comprobando) elige(b); },
    });
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); elige(b); } });
  });
  huecos.forEach((h, i) => h.addEventListener('click', (e) => { if (!elegido || comprobando || e.target.closest('.boleto') === elegido) return; const b = elegido; elige(b); coloca(b, i); aterriza(b); }));
  cesta.addEventListener('click', (e) => { if (elegido && !e.target.closest('.boleto')) { const b = elegido; elige(b); quita(b); aterriza(b); } });

  const boton = ctx.boton('Comprobar', async () => {
    if (comprobando || sitio.size < N) return;
    comprobando = true; listo(); intento++;
    const malos = boletos.filter((b) => +b.dataset.n !== bien[sitio.get(b)]);
    // la cuerda se tensa y los boletos se balancean, de izquierda a derecha
    for (const h of huecos) { const b = ocupante(h.dataset.i * 1); gsap.fromTo(b, { rotation: -10 }, { rotation: 0, duration: 0.6, ease: 'elastic.out(1.2,0.35)' }); suena('clic'); await espera(90); }
    if (!malos.length) {
      huecos.forEach((h) => ocupante(+h.dataset.i).classList.add('bien'));
      chispasEn(cuerda, 22, '#ffc531');
      return ctx.fin(porIntento(intento), intento === 1 ? `**¡Todos en su sitio!** ${bien.map((v) => num(v)).join(sube ? ' < ' : ' > ')}` : `Ahora sí: ${bien.map((v) => num(v)).join(sube ? ' < ' : ' > ')}.`);
    }
    malos.forEach((b) => b.classList.add('mal'));
    suena('mal'); temblor(cuerda, 5);
    await espera(700);
    if (intento >= 3) {
      // se enseña el orden bueno
      boletos.forEach((b) => { sitio.set(b, bien.indexOf(+b.dataset.n)); huecos[sitio.get(b)].append(b); b.classList.remove('mal'); });
      return ctx.fin(0, `El orden era ${bien.map((v) => num(v)).join(sube ? ' < ' : ' > ')}. Se compara **cifra a cifra desde la izquierda**: la primera que cambia decide.`);
    }
    // los que estaban mal se descuelgan y caen a la cesta
    for (const b of malos) {
      await gsap.to(b, { y: 80, rotation: gsap.utils.random(-50, 50), opacity: 0, duration: 0.35, ease: 'power2.in' });
      quita(b); gsap.set(b, { y: 0, rotation: 0, opacity: 1 }); b.classList.remove('mal'); aterriza(b);
    }
    ctx.aviso(`${malos.length === 1 ? 'Se ha caído un boleto' : `Se han caído ${malos.length} boletos`}: no estaba${malos.length === 1 ? '' : 'n'} en su sitio. Los demás están bien.`, true);
    comprobando = false; listo();
  });
  listo();
  if (ctx.primera) demuestra(boletos[0], huecos[0], { demora: 1300 });
  ctx.pistas([
    { texto: d.numeros.some((n) => n < 1000) ? '¡Ojo! Hay un boleto con **tres cifras**. Es más pequeño que cualquiera de cuatro.' : 'Mira solo la **primera cifra** de cada boleto: es la que más vale.', ver: () => zona.classList.add('mira-0') },
    { texto: 'Si dos boletos empiezan igual, desempata **la siguiente cifra**. Y si también es igual, la siguiente.', ver: () => zona.classList.add('mira-1') },
    { texto: 'Te cuelgo el primero en su sitio.', ver: () => { const b = boletos.find((x) => +x.dataset.n === bien[0]); coloca(b, 0); aterriza(b); } },
  ]);
}

/* ================================================================ la taquilla: el candado de ruedas */
const TEXTOS = {
  mayor: () => 'Se abre con el número **más grande** que se pueda hacer',
  menor: () => 'Se abre con el número **más pequeño** que se pueda hacer',
  mayorQue: (x) => `Se abre con cualquier número **mayor que ${num(x)}**`,
  menorQue: (x) => `Se abre con cualquier número **menor que ${num(x)}**`,
  justoEncima: (x) => `Se abre con el **más pequeño** de los que son **mayores que ${num(x)}**`,
  justoDebajo: (x) => `Se abre con el **más grande** de los que son **menores que ${num(x)}**`,
};
function candado(d, ctx) {
  const K = d.ruedas, x = d.cartel;
  const todos = numerosCon(d.cifras, K);
  const vale = {
    mayor: (v) => v === todos.at(-1), menor: (v) => v === todos[0],
    mayorQue: (v) => v > x, menorQue: (v) => v < x,
    justoEncima: (v) => v === todos.find((t) => t > x), justoDebajo: (v) => v === [...todos].reverse().find((t) => t < x),
  }[d.tipo];
  const meta = { mayor: todos.at(-1), menor: todos[0], justoEncima: todos.find((t) => t > x), justoDebajo: [...todos].reverse().find((t) => t < x) }[d.tipo];
  ctx.reto(d.texto ?? TEXTOS[d.tipo](x));
  ctx.pista(d.pista ?? `Gira las ruedas (o toca una rueda y luego una ficha). Cada cifra de las fichas se puede usar **una vez**${d.cifras.length > K ? `, y sobran ${d.cifras.length - K}` : ''}.`);

  const valores = Array(K).fill(null);
  let activa = 0, intento = 0, abierto = false;
  const fichas = d.cifras.map((c) => el('button', { type: 'button', class: 'ficha-candado', 'data-c': c, text: c, 'aria-label': `Cifra ${c}` }));
  const ruedas = valores.map((_, k) => {
    const ventana = el('div', { class: 'ventana-rueda', tabindex: 0, role: 'spinbutton', 'aria-label': `Rueda ${k + 1}` }, el('span', { class: 'cifra-rueda', text: '·' }));
    const arriba = el('button', { type: 'button', class: 'flecha-rueda', 'aria-label': 'Subir', html: '<svg viewBox="0 0 24 16"><path d="M3 13 L12 4 L21 13" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' });
    const abajo = el('button', { type: 'button', class: 'flecha-rueda', 'aria-label': 'Bajar', html: '<svg viewBox="0 0 24 16"><path d="M3 3 L12 12 L21 3" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>' });
    const r = el('div', { class: 'rueda', 'data-k': k, 'data-valor': K - 1 - k }, arriba, ventana, abajo, el('small', { class: 'valor-rueda', text: ['U', 'D', 'C', 'UM', 'DM'][K - 1 - k] }));
    arriba.onclick = () => gira(k, 1); abajo.onclick = () => gira(k, -1);
    ventana.onclick = () => activa_(k);
    ventana.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp') { e.preventDefault(); gira(k, 1); } else if (e.key === 'ArrowDown') { e.preventDefault(); gira(k, -1); } else if (/^\d$/.test(e.key) && d.cifras.includes(+e.key)) pon(k, +e.key); });
    // deslizar el dedo arriba o abajo hace girar la rueda
    let y0 = null;
    ventana.addEventListener('pointerdown', (e) => { y0 = e.clientY; ventana.setPointerCapture?.(e.pointerId); });
    ventana.addEventListener('pointermove', (e) => { if (y0 == null) return; const dy = e.clientY - y0; if (Math.abs(dy) > 26) { gira(k, dy < 0 ? 1 : -1); y0 = e.clientY; } });
    ventana.addEventListener('pointerup', () => (y0 = null)); ventana.addEventListener('pointercancel', () => (y0 = null));
    ventana.style.touchAction = 'none';
    return { r, ventana };
  });
  const arco = el('div', { class: 'arco-candado', 'aria-hidden': 'true' });
  const cuerpo = el('div', { class: 'cuerpo-candado' }, el('div', { class: 'ruedas-candado' }, ruedas.map((w) => w.r)), el('span', { class: 'ojo-llave', 'aria-hidden': 'true' }));
  const etiqueta = el('div', { class: 'etiqueta-candado' }, el('small', { text: x != null ? 'El cartel' : 'La regla' }), el('b', { text: x != null ? num(x) : d.tipo === 'mayor' ? 'EL MAYOR' : 'EL MENOR' }));
  const zona = el('div', { class: 'caseta-candado' },
    el('div', { class: 'reja-taquilla' }, el('div', { class: 'candado' }, arco, cuerpo, etiqueta)),
    el('div', { class: 'bandeja-fichas' }, el('small', { text: 'Fichas' }), el('div', { class: 'fichas' }, fichas)));
  ctx.escenario.append(zona);

  const usadas = () => { const m = new Map(); valores.forEach((v) => v != null && m.set(v, (m.get(v) || 0) + 1)); return m; };
  const pinta = () => {
    const u = usadas();
    ruedas.forEach((w, k) => {
      w.ventana.firstChild.textContent = valores[k] ?? '·';
      w.r.classList.toggle('repetida', valores[k] != null && u.get(valores[k]) > 1);
      w.r.classList.toggle('activa', k === activa && !abierto);
    });
    fichas.forEach((f) => { f.classList.toggle('usada', u.has(+f.dataset.c)); f.disabled = abierto; });
    boton.disabled = abierto || valores.some((v) => v == null);
  };
  const rueda = (k, dir) => { const s = ruedas[k].ventana.firstChild; gsap.fromTo(s, { y: dir * 26, opacity: 0 }, { y: 0, opacity: 1, duration: 0.18, ease: 'power2.out' }); suena('clic', dir > 0 ? 2 : 0); };
  function gira(k, dir) {
    if (abierto) return;
    const i = valores[k] == null ? (dir > 0 ? -1 : d.cifras.length) : d.cifras.indexOf(valores[k]);
    valores[k] = d.cifras[(i + dir + d.cifras.length) % d.cifras.length];
    activa = k; ctx.aviso(''); pinta(); rueda(k, dir);
  }
  function pon(k, c) { if (abierto) return; valores[k] = c; activa = Math.min(K - 1, k + 1); ctx.aviso(''); pinta(); rueda(k, 1); }
  function activa_(k) { activa = k; pinta(); }
  fichas.forEach((f) => (f.onclick = () => { const c = +f.dataset.c; const k = valores[activa] == null ? activa : valores.findIndex((v) => v == null) >= 0 ? valores.findIndex((v) => v == null) : activa; pon(k, c); }));

  const intenta = async () => {
    if (abierto || valores.some((v) => v == null)) return;
    const u = usadas();
    if ([...u.values()].some((n) => n > 1)) { ctx.aviso('Hay una cifra repetida, y cada ficha solo se puede usar una vez.', true); temblor(cuerpo, 5); return; }
    const v = Number(valores.join(''));
    if (valores[0] === 0) { intento++; ctx.aviso(`Un número no empieza por 0: «${valores.join('')}» sería un número de ${K - 1} cifras.`, true); temblor(cuerpo, 6); suena('mal'); return fallo(); }
    intento++;
    // la llave gira y el candado decide
    gsap.fromTo(cuerpo.querySelector('.ojo-llave'), { rotation: 0 }, { rotation: 90, duration: 0.25, yoyo: true, repeat: 1 });
    await espera(320);
    if (vale(v)) {
      abierto = true; pinta();
      suena('cremallera');
      await gsap.to(arco, { y: -34, duration: 0.35, ease: 'back.out(3)' });
      gsap.to(arco, { rotation: -24, transformOrigin: '18% 100%', duration: 0.4, ease: 'back.out(2)' });
      chispasEn(cuerpo, 20, '#ffc531');
      const extra = meta == null ? (d.tipo === 'mayorQue' ? ` Valían todos los que pasan de ${num(x)}; el más grande era ${num(todos.at(-1))}.` : ` Valían todos los que no llegan a ${num(x)}; el más pequeño era ${num(todos[0])}.`) : '';
      return ctx.fin(porIntento(intento), `**¡Abierto con ${num(v)}!**` + extra + (d.tipo === 'mayor' ? ' Las cifras grandes, a la izquierda.' : d.tipo === 'menor' ? (d.cifras.includes(0) ? ' El 0 no puede ir el primero, pero sí el segundo.' : ' Las cifras pequeñas, a la izquierda.') : ''));
    }
    suena('mal'); temblor(cuerpo, 8);
    const dif = meta != null ? String(meta).split('').findIndex((c, k) => +c !== valores[k]) : -1;
    ctx.aviso({
      mayor: `${num(v)} no es el mayor. ¿Puedes poner algo más grande en ${dif === 0 ? 'la primera rueda' : 'alguna rueda de la izquierda'}?`,
      menor: `${num(v)} no es el menor. ¿Puedes poner algo más pequeño en ${dif === 0 ? 'la primera rueda' : 'alguna rueda de la izquierda'}?`,
      mayorQue: `${num(v)} no es mayor que ${num(x)}.`, menorQue: `${num(v)} no es menor que ${num(x)}.`,
      justoEncima: v > x ? `${num(v)} sí es mayor que ${num(x)}, pero hay otro más pequeño que también lo es.` : `${num(v)} no es mayor que ${num(x)}.`,
      justoDebajo: v < x ? `${num(v)} sí es menor que ${num(x)}, pero hay otro más grande que también lo es.` : `${num(v)} no es menor que ${num(x)}.`,
    }[d.tipo], true);
    fallo();
  };
  const fallo = () => {
    if (intento < 3) return;
    abierto = true;
    const sol = meta ?? (d.tipo === 'mayorQue' ? todos.find((t) => t > x) : [...todos].reverse().find((t) => t < x));
    String(sol).split('').forEach((c, k) => (valores[k] = +c)); pinta();
    ctx.fin(0, `Se abría, por ejemplo, con **${num(sol)}**. Para comparar números se mira **la primera cifra**; si es igual, la segunda…`);
  };
  const boton = ctx.boton('Abrir el candado', intenta);
  pinta();
  ctx.pistas([
    { texto: d.tipo === 'menor' || d.tipo === 'menorQue' || d.tipo === 'justoDebajo' ? 'La rueda de la **izquierda** es la que más vale: decide casi todo.' : 'La rueda de la **izquierda** es la que más vale: empieza por ella.', ver: () => ruedas[0].r.classList.add('brilla') },
    { texto: d.tipo === 'mayor' ? 'Pon las cifras de **mayor a menor**, de izquierda a derecha.' : d.tipo === 'menor' ? (d.cifras.includes(0) ? 'De **menor a mayor**… pero el 0 no puede ir el primero. ¿Y de segundo?' : 'Pon las cifras de **menor a mayor**, de izquierda a derecha.') : `Compara con ${num(x ?? 0)} cifra a cifra desde la izquierda. La primera cifra en que cambien decide.` },
    { texto: meta != null ? `La primera rueda va con el **${String(meta)[0]}**.` : `Por ejemplo, empieza por el **${String(d.tipo === 'mayorQue' ? todos.at(-1) : todos[0])[0]}**.`, ver: () => pon(0, +String(meta ?? (d.tipo === 'mayorQue' ? todos.at(-1) : todos[0]))[0]) },
  ]);
}
