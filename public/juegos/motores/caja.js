// Motor «caja»: la caja registradora de la feria. Sumas y restas de cuatro cifras.
//   caja      → con fichas de feria: cajas de 1 000, tacos de 100, tiras de 10 y sueltas. Sumar es juntar y
//               cambiar 10 por 1; restar es sacar, y cuando no llega, romper uno de la izquierda en 10.
//   columnas  → la cuenta escrita en su papel, con casillas para lo que te llevas.
//               Con "colocar": el segundo número llega torcido y hay que ponerlo en su sitio antes.
import { el, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, chispasEn, temblor, bote } from './efectos.js';
import { porIntento } from './kit.js';

const NOMBRES = [['sueltas', 'suelta'], ['tiras de 10', 'tira'], ['tacos de 100', 'taco'], ['cajas de 1 000', 'caja']];
const digs = (n, k = 4) => String(n).padStart(k, '0').split('').reverse().map(Number); // unidades primero

export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  const op = g.op ?? 'suma', cb = g.cifrasB ?? 4, ll = g.llevadas ?? 1;
  // qué columnas llevan (0 = unidades). Nunca las unidades de millar
  const cols = barajar([0, 1, 2].slice(0, Math.min(3, cb))).slice(0, ll);
  let a, b, n = 0;
  do {
    n++;
    const A = [], B = [];
    let c = 0;
    for (let k = 0; k < 4; k++) {
      const quiere = cols.includes(k);
      let x, y, ok;
      let t = 0;
      do {
        t++;
        x = k === 3 ? azar(op === 'suma' ? 1 : 2, op === 'suma' ? 6 : 9) : azar(0, 9);
        y = k >= cb ? 0 : k === 3 ? azar(1, op === 'suma' ? 8 - x : x - 1) : azar(k === cb - 1 ? 1 : 0, 9);
        if (op === 'suma') ok = k === 3 ? x + y + c <= 9 && y >= (k < cb ? 1 : 0) : (x + y + c >= 10) === quiere;
        else ok = k === 3 ? x - y - c >= (cb === 4 ? 1 : 0) && y >= (k < cb ? 1 : 0) : (x - c < y) === quiere;
        if (g.ceros && op === 'resta' && k > 0 && k < 3) { x = 0; ok = (x - c < y) === quiere || k >= cb; }
      } while (!ok && t < 60);
      A.push(x); B.push(y);
      c = op === 'suma' ? (x + y + c >= 10 ? 1 : 0) : (x - c < y ? 1 : 0);
    }
    a = Number(A.reverse().join('')); b = Number(B.reverse().join(''));
  } while ((op === 'suma' ? a + b > 9999 : a - b < 0) && n < 50);
  Object.assign(d, { a, b, op, resultado: op === 'suma' ? a + b : a - b, cifrasB: cb });
  return d;
}
export function ronda(d, ctx) { return d.modo === 'columnas' ? columnas(d, ctx) : caja(d, ctx); }

/* ================================================================ con fichas */
const icono = (k) => el('i', { class: 'pieza-caja p' + k, 'aria-hidden': 'true' });
function caja(d, ctx) {
  const suma = d.op === 'suma';
  ctx.reto(d.texto ?? (suma ? `La taquilla vendió **${num(d.a)}** fichas el sábado y **${num(d.b)}** el domingo. ¿Cuántas en total?` : `En la caja hay **${num(d.a)}** fichas. Hay que sacar **${num(d.b)}** para la noria. ¿Cuántas quedan?`));
  ctx.pista(d.pista ?? (suma ? 'Cuando un cajón tenga 10 o más, cámbialos por 1 del cajón de la izquierda. Luego escribe arriba lo que hay en cada cajón.' : 'Saca lo que pide cada cajón. Si no hay bastantes, rompe uno del cajón de la izquierda: se convierte en 10.'));
  const cuenta = digs(d.a).map((x) => x);
  const quitar = digs(d.b);
  const pantallas = [], cajones = [], botones = [];
  const panel = el('div', { class: 'pantalla-caja' });
  const fila = el('div', { class: 'cajones-caja' });
  for (let k = 3; k >= 0; k--) {
    const inp = el('input', { class: 'campo-num cifra-caja', inputmode: 'numeric', maxlength: 1, 'aria-label': `Cifra de las ${NOMBRES[k][0]}`, autocomplete: 'off' });
    inp.addEventListener('input', () => { inp.value = inp.value.replace(/\D/g, '').slice(-1); inp.classList.remove('mal', 'bien'); if (inp.value && k > 0) pantallas[k - 1]?.focus(); });
    inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); boton.click(); } });
    pantallas[k] = inp;
    const montón = el('div', { class: 'monton-caja' });
    const accion = el('button', { type: 'button', class: 'tecla accion-caja', hidden: true });
    const cab = el('div', { class: 'cab-caja' }, el('b', { text: NOMBRES[k][0] }), el('span', { class: 'cuantas' }));
    const caj = el('div', { class: 'cajon-caja c' + k }, cab, montón, accion, !suma && el('span', { class: 'saca-caja', text: quitar[k] ? `Saca ${quitar[k]}` : 'No hay que sacar' }));
    cajones[k] = { caj, montón, accion, cab };
    fila.append(caj);
  }
  panel.append(el('span', { class: 'rotulo-pantalla', text: suma ? 'Total' : 'Quedan' }), ...[3, 2, 1, 0].map((k) => pantallas[k]));
  const recibos = el('div', { class: 'recibos' }, el('div', { class: 'recibo' }, el('small', { text: suma ? 'Sábado' : 'En la caja' }), el('b', { text: num(d.a) })), el('div', { class: 'recibo' }, el('small', { text: suma ? 'Domingo' : 'Para la noria' }), el('b', { text: (suma ? '+ ' : '− ') + num(d.b) })));
  const zona = el('div', { class: 'caseta-caja' }, recibos, el('div', { class: 'registradora' }, panel, fila));
  ctx.escenario.append(zona);
  const sacados = [0, 0, 0, 0];
  const pinta = () => {
    for (let k = 0; k < 4; k++) {
      const C = cajones[k];
      C.montón.replaceChildren(...Array.from({ length: cuenta[k] }, () => icono(k)));
      C.cab.querySelector('.cuantas').textContent = cuenta[k];
      C.caj.classList.toggle('lleno', cuenta[k] >= 10);
      if (suma) {
        C.accion.hidden = !(cuenta[k] >= 10 && k < 3);
        C.accion.textContent = `Cambiar 10 por 1 ${NOMBRES[k + 1]?.[1] ?? ''}`;
      } else {
        const falta = quitar[k] - sacados[k];
        C.accion.hidden = falta <= 0;
        C.accion.textContent = `Sacar ${falta}`;
        C.caj.querySelector('.saca-caja').classList.toggle('hecho', falta <= 0);
        // romper: siempre que haya algo y no sea el de las sueltas
        let r = C.caj.querySelector('.romper-caja');
        if (k > 0 && cuenta[k] > 0 && !r) { r = el('button', { type: 'button', class: 'romper-caja', text: `Romper 1 en 10 →` }); r.onclick = () => romper(k); C.caj.append(r); }
        if (r) r.hidden = cuenta[k] === 0;
      }
    }
  };
  let ocupado = false;
  const cambia = async (k) => {
    if (ocupado || cuenta[k] < 10) return;
    ocupado = true; suena('coge');
    const piezas = [...cajones[k].montón.children].slice(0, 10);
    const destino = cajones[k + 1].montón;
    await gsap.to(piezas, { x: (i) => -40 - i * 3, y: -30, scale: 0.6, opacity: 0, duration: 0.45, stagger: 0.03, ease: 'power2.in' });
    cuenta[k] -= 10; cuenta[k + 1] += 1; pinta();
    const nueva = destino.lastElementChild;
    if (nueva) { gsap.from(nueva, { scale: 2, rotation: -30, duration: 0.4, ease: 'back.out(2)' }); chispasEn(nueva, 8, '#ffc531'); }
    suena('pon'); ocupado = false;
  };
  const romper = async (k) => {
    if (ocupado || cuenta[k] < 1) return;
    ocupado = true; suena('quita');
    const p = cajones[k].montón.lastElementChild;
    await gsap.to(p, { scale: 1.4, rotation: 20, opacity: 0, duration: 0.25 });
    cuenta[k] -= 1; cuenta[k - 1] += 10; pinta();
    const nuevas = [...cajones[k - 1].montón.children].slice(-10);
    gsap.from(nuevas, { x: 40, opacity: 0, duration: 0.35, stagger: 0.025, ease: 'back.out(2)' });
    suena('pon'); ocupado = false;
  };
  const saca = async (k) => {
    if (ocupado) return;
    const falta = quitar[k] - sacados[k];
    if (cuenta[k] < falta) {
      ctx.aviso(`En el cajón de las ${NOMBRES[k][0]} hay ${cuenta[k]} y hay que sacar ${falta}. Rompe uno del cajón de la izquierda.`, true);
      temblor(cajones[k].caj, 5); suena('mal');
      const r = cajones[k + 1]?.caj.querySelector('.romper-caja'); if (r) bote(r, 8);
      return;
    }
    ocupado = true; ctx.aviso('');
    const piezas = [...cajones[k].montón.children].slice(-falta);
    await gsap.to(piezas, { y: 60, opacity: 0, duration: 0.35, stagger: 0.03, ease: 'power2.in' });
    cuenta[k] -= falta; sacados[k] += falta; pinta(); suena('pon'); ocupado = false;
  };
  for (let k = 0; k < 4; k++) cajones[k].accion.onclick = () => (suma ? cambia(k) : saca(k));
  // al empezar: entran las fichas (en la suma, primero un pedido y luego el otro)
  pinta();
  if (suma) {
    (async () => {
      await espera(500);
      const b = digs(d.b);
      for (let k = 0; k < 4; k++) {
        if (!b[k]) continue;
        cuenta[k] += b[k]; pinta();
        const nuevas = [...cajones[k].montón.children].slice(-b[k]);
        nuevas.forEach((n) => n.classList.add('nueva'));
        gsap.from(nuevas, { y: -50, opacity: 0, duration: 0.35, stagger: 0.03, ease: 'back.out(1.8)' });
        suena('pon', k); await espera(160);
      }
    })();
  }
  let intento = 0, hecho = false;
  const boton = ctx.boton('Cobrar', () => {
    if (hecho) return;
    const vals = [3, 2, 1, 0].map((k) => pantallas[k].value);
    if (vals.some((v) => v === '')) return ctx.aviso('Escribe una cifra en cada casilla de la pantalla (si no hay nada, un 0).', true);
    if (!suma && quitar.some((q, k) => sacados[k] < q)) return ctx.aviso('Primero saca todo lo que pide cada cajón.', true);
    intento++;
    const v = Number(vals.join(''));
    const bien = digs(d.resultado);
    [3, 2, 1, 0].forEach((k) => pantallas[k].classList.toggle('mal', +pantallas[k].value !== bien[k]));
    if (v === d.resultado) {
      hecho = true; boton.disabled = true;
      [0, 1, 2, 3].forEach((k) => { pantallas[k].classList.add('bien'); pantallas[k].readOnly = true; });
      suena('cremallera'); chispasEn(panel, 18, '#9bd84a');
      const ll = suma ? digs(d.a).filter((x, k) => x + digs(d.b)[k] + (k && digs(d.a)[k - 1] + digs(d.b)[k - 1] >= 10 ? 1 : 0) >= 10).length : 0;
      return ctx.fin(porIntento(intento), `${num(d.a)} ${suma ? '+' : '−'} ${num(d.b)} = **${num(d.resultado)}**. ${suma ? 'Cada vez que cambias 10 por 1 es una **llevada**.' : 'Cada vez que rompes 1 en 10 es lo que en la cuenta escrita llamamos **llevarse una**.'}`);
    }
    suena('mal'); temblor(panel, 6);
    if (suma && cuenta.some((c) => c >= 10)) ctx.aviso('Hay un cajón con 10 o más: no cabe en una cifra. Cámbialo antes.', true);
    else ctx.aviso('La pantalla no coincide con lo que hay en los cajones. Cuenta otra vez los marcados en rojo.', true);
    if (intento >= 3) { hecho = true; boton.disabled = true; ctx.fin(0, `Eran **${num(d.resultado)}**. Mira lo que queda en cada cajón: esa es cada cifra.`); }
  });
  ctx.pistas([
    { texto: suma ? 'Empieza por la derecha, por las **sueltas**. Si hay 10 o más, cambia 10 por una tira.' : 'Empieza por la derecha, por las **sueltas**. Si no hay bastantes, rompe una tira: son 10 sueltas.' },
    { texto: 'Cuando acabes, cada cajón tiene que tener **menos de 10**. Lo que hay en cada uno es una cifra de la pantalla.' },
    { texto: `La cifra de las sueltas es el **${digs(d.resultado)[0]}**.`, ver: () => { pantallas[0].value = digs(d.resultado)[0]; pantallas[0].classList.add('bien'); } },
  ]);
}

/* ================================================================ la cuenta escrita */
function columnas(d, ctx) {
  const suma = d.op === 'suma';
  const A = digs(d.a), B = digs(d.b), R = digs(d.resultado);
  ctx.reto(d.texto ?? (suma ? `Haz la suma: **${num(d.a)} + ${num(d.b)}**` : `Haz la resta: **${num(d.a)} − ${num(d.b)}**`));
  ctx.pista(d.pista ?? (d.colocar ? 'El segundo número está mal colocado. Muévelo con las flechas hasta que las unidades queden debajo de las unidades.' : 'Escribe el resultado empezando por la derecha. Las casillas pequeñas de arriba son para lo que te llevas.'));
  const C = 4;
  const hoja = el('div', { class: 'hoja-cuenta' + (d.colocar ? ' colocando' : '') });
  const celda = (txt, cls = '') => el('span', { class: 'celda-cuenta ' + cls, text: txt });
  const llev = [], res = [];
  // cabecera de valores
  const cab = el('div', { class: 'fila-cuenta cab' }, celda(''), ...['UM', 'C', 'D', 'U'].map((t) => celda(t, 'valor')));
  const filaLl = el('div', { class: 'fila-cuenta llevadas' }, celda(''), ...[3, 2, 1, 0].map((k) => { const i = el('input', { class: 'campo-num llevada', maxlength: 1, inputmode: 'numeric', 'aria-label': `Me llevo, columna ${k + 1}`, autocomplete: 'off' }); i.addEventListener('input', () => (i.value = i.value.replace(/\D/g, '').slice(-1))); llev[k] = i; return el('span', { class: 'celda-cuenta' }, k < 3 ? i : ''); }));
  const filaA = el('div', { class: 'fila-cuenta' }, celda(''), ...[3, 2, 1, 0].map((k) => celda(d.a >= 10 ** k || k === 0 ? A[k] : '')));
  let desplaza = d.colocar ? 4 - String(d.b).length : 0; // con colocar: empieza pegado a la izquierda
  const filaB = el('div', { class: 'fila-cuenta movil' }, celda(suma ? '+' : '−', 'signo'));
  const pintaB = () => {
    filaB.replaceChildren(celda(suma ? '+' : '−', 'signo'));
    const s = String(d.b), k0 = 4 - s.length - (d.colocar ? (4 - s.length) - desplaza : 0);
    for (let c = 0; c < C; c++) { const i = c - (d.colocar ? (4 - s.length) - desplaza : 4 - s.length); filaB.append(celda(i >= 0 && i < s.length ? s[i] : '')); }
  };
  // en «colocar», desplaza = columnas vacías a la DERECHA del número (0 = bien colocado)
  if (d.colocar) desplaza = 4 - String(d.b).length;
  const pintaB2 = () => {
    filaB.replaceChildren(celda(suma ? '+' : '−', 'signo'));
    const s = String(d.b);
    const inicio = 4 - s.length - desplaza;
    for (let c = 0; c < C; c++) { const i = c - inicio; filaB.append(celda(i >= 0 && i < s.length ? s[i] : '', i >= 0 && i < s.length ? 'cifra-b' : '')); }
  };
  pintaB2();
  const raya = el('div', { class: 'raya-cuenta' });
  const filaR = el('div', { class: 'fila-cuenta resultado' }, celda(''), ...[3, 2, 1, 0].map((k) => {
    const i = el('input', { class: 'campo-num cifra-res', maxlength: 1, inputmode: 'numeric', 'aria-label': `Resultado, ${['unidades', 'decenas', 'centenas', 'unidades de millar'][k]}`, autocomplete: 'off' });
    i.addEventListener('input', () => { i.value = i.value.replace(/\D/g, '').slice(-1); i.classList.remove('mal', 'bien'); if (i.value) (llev[k] && !llev[k].value && k < 3 && !d.sinLlevadas ? llev[k] : res[k + 1])?.focus(); });
    i.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); boton.click(); } });
    res[k] = i; return el('span', { class: 'celda-cuenta' }, i);
  }));
  // tras la llevada, el foco va a la siguiente cifra del resultado
  llev.forEach((i, k) => i?.addEventListener('input', () => { if (i.value) res[k + 1]?.focus(); }));
  hoja.append(cab, filaLl, filaA, filaB, raya, filaR);
  const flechas = d.colocar && el('div', { class: 'mover-fila' },
    el('button', { type: 'button', class: 'tecla', text: '◀', 'aria-label': 'Mover a la izquierda', onclick: () => { if (desplaza < 4 - String(d.b).length) { desplaza++; pintaB2(); suena('clic'); } } }),
    el('button', { type: 'button', class: 'tecla', text: '▶', 'aria-label': 'Mover a la derecha', onclick: () => { if (desplaza > 0) { desplaza--; pintaB2(); suena('clic'); } } }));
  const zona = el('div', { class: 'caseta-cuenta' }, el('div', { class: 'papel-cuenta' }, hoja), flechas);
  ctx.escenario.append(zona);
  let colocado = !d.colocar, intento = 0, hecho = false;
  res.forEach((r) => (r.disabled = !colocado));
  const ponerColocado = () => { colocado = true; hoja.classList.remove('colocando'); flechas?.remove(); res.forEach((r) => (r.disabled = false)); res[0].focus(); boton.textContent = 'Comprobar'; };
  const boton = ctx.boton(d.colocar ? 'Ya está colocado' : 'Comprobar', () => {
    if (hecho) return;
    if (!colocado) {
      if (desplaza === 0) { suena('pon'); ctx.aviso(''); return ponerColocado(); }
      intento++; temblor(filaB, 6); suena('mal');
      return ctx.aviso('Todavía no: las **unidades** tienen que ir debajo de las unidades. Fíjate en la última cifra.', true);
    }
    const vals = [3, 2, 1, 0].map((k) => res[k].value);
    const necesarias = String(d.resultado).length;
    if ([0, 1, 2, 3].slice(0, necesarias).some((k) => res[k].value === '')) return ctx.aviso('Te faltan cifras del resultado.', true);
    intento++;
    let ok = true;
    for (let k = 0; k < 4; k++) {
      const v = res[k].value === '' ? 0 : +res[k].value;
      const b = R[k];
      const mal = v !== b || (k >= necesarias && res[k].value !== '' && +res[k].value !== 0);
      res[k].classList.toggle('mal', mal); if (mal) ok = false;
    }
    if (ok) {
      hecho = true; boton.disabled = true; res.forEach((r) => { r.classList.add('bien'); r.readOnly = true; });
      chispasEn(hoja, 16, '#ffc531');
      return ctx.fin(porIntento(intento), `**${num(d.a)} ${suma ? '+' : '−'} ${num(d.b)} = ${num(d.resultado)}.** ${d.colocar ? 'Primero, bien colocados: unidades con unidades.' : '¡Cuentas claras!'}`);
    }
    suena('mal'); temblor(hoja, 5);
    if (intento >= 3) { hecho = true; boton.disabled = true; [0, 1, 2, 3].forEach((k) => { if (k < necesarias) res[k].value = R[k]; }); return ctx.fin(0, `El resultado era **${num(d.resultado)}**. Columna a columna, de derecha a izquierda, sin olvidar lo que te llevas.`); }
    ctx.aviso('Las casillas en rojo no están bien. Repasa esas columnas.', true);
  });
  // la pista: explica la primera columna donde algo pasa
  const explica = () => {
    let c = 0; const pasos = [];
    for (let k = 0; k < String(d.resultado).length || k < 4 && (A[k] || B[k]); k++) {
      if (suma) { const s = A[k] + B[k] + c; pasos.push(`${['Unidades', 'Decenas', 'Centenas', 'Unidades de millar'][k]}: ${A[k]} + ${B[k]}${c ? ' + 1' : ''} = ${s}${s >= 10 ? `. Escribes ${s - 10} y **te llevas 1**` : ''}.`); c = s >= 10 ? 1 : 0; }
      else { const x = A[k] - c, y = B[k]; pasos.push(x < y ? `${['Unidades', 'Decenas', 'Centenas', 'Unidades de millar'][k]}: a ${A[k]}${c ? ' (menos 1 que debes)' : ''} no le puedes quitar ${y}. Rompe uno de la izquierda: ${x + 10} − ${y} = ${x + 10 - y}, y **te llevas 1**.` : `${['Unidades', 'Decenas', 'Centenas', 'Unidades de millar'][k]}: ${A[k]}${c ? ' − 1' : ''} − ${y} = ${x - y}.`); c = x < y ? 1 : 0; }
    }
    return pasos;
  };
  const pasos = explica();
  const dificil = pasos.findIndex((p) => p.includes('llevas'));
  ctx.pistas([
    d.colocar && { texto: 'Mira la **última cifra** de cada número: esas son las unidades. Tienen que quedar una debajo de otra.' },
    { texto: pasos[0] },
    { texto: pasos[dificil >= 0 ? dificil : 1] ?? pasos[1] },
    { texto: `El resultado empieza por **${String(d.resultado)[0]}**.` },
  ]);
}
