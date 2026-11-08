// Motor «ceros»: la máquina de ceros del almacén.
//   prever    → los diales están puestos (7 y 8) y las palancas también (×10, ×100): ¿qué saldrá? Primero se predice, luego se tira.
//   consigue  → hay que conseguir un número (5 600) bajando las palancas que hagan falta. Vale cualquier forma.
//   ascensor  → el ascensor aguanta un peso: ¿cuántas cajas como máximo? Se prueba con la máquina y se acota.
import { el, svg, num, azar, elige, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, bote, chispasEn, temblor } from './efectos.js';

const T = '#1b1e3a';
const lee = (input) => { const t = String(input.value).replace(/[\s.]/g, ''); return t === '' || !/^\d+$/.test(t) ? null : Number(t); };
function campo(etiqueta, ancho = 7) {
  const i = el('input', { class: 'campo-num', inputmode: 'numeric', autocomplete: 'off', 'aria-label': etiqueta, maxlength: 9, style: { width: ancho + 'ch' } });
  i.addEventListener('input', () => { i.value = i.value.replace(/[^\d]/g, ''); i.classList.remove('mal', 'bien'); });
  return i;
}

export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  const a = azar(...(g.a ?? [2, 9])), b = azar(...(g.b ?? [2, 9]));
  const max = g.ceros ?? 2;
  if (d.modo === 'prever') { Object.assign(d, { a, b, pa: azar(0, max), pb: azar(0, max) }); if (!d.pa && !d.pb) d.pa = 1; return d; }
  if (d.modo === 'consigue') { const pa = azar(0, max), pb = azar(0, max); Object.assign(d, { a, b, objetivo: a * b * 10 ** Math.max(1, pa + pb) }); return d; }
  if (d.modo === 'ascensor') { const peso = elige(g.pesos ?? [20, 30, 40, 50, 60, 70, 80, 90]); const limite = elige(g.limites ?? [1000, 1500, 2000, 2500, 3000, 4500, 5000]); Object.assign(d, { peso, limite }); return d; }
  return d;
}
export function ronda(d, ctx) {
  return d.modo === 'ascensor' ? ascensor(d, ctx) : maquina(d, ctx);
}

// la máquina: dos diales con su palanca de ×10 y una ventana de salida
function construye(d) {
  const dial = (k) => {
    const cifras = el('div', { class: 'ventana-dial' });
    const palanca = el('button', { type: 'button', class: 'palanca', 'aria-label': `Palanca del número ${k + 1}: ×10` }, el('span', { class: 'mango' }));
    const quita = el('button', { type: 'button', class: 'quita-cero', 'aria-label': 'Quitar un cero', text: '↶' });
    const caja = el('div', { class: 'dial' }, el('small', { text: k ? 'Segundo número' : 'Primer número' }), cifras, el('div', { class: 'mandos-dial' }, palanca, quita));
    return { caja, cifras, palanca, quita };
  };
  const A = dial(0), B = dial(1);
  const salida = el('div', { class: 'ventana-salida', 'aria-live': 'polite' });
  const luz = el('span', { class: 'luz-maquina' });
  const cuerpo = el('div', { class: 'maquina-ceros' },
    el('div', { class: 'placa-maquina' }, el('span', { text: 'Máquina de ceros' }), luz),
    el('div', { class: 'diales' }, A.caja, el('b', { class: 'por', text: '×' }), B.caja),
    el('div', { class: 'tubo', 'aria-hidden': 'true' }),
    el('div', { class: 'salida' }, el('small', { text: 'Sale' }), salida));
  return { cuerpo, A, B, salida, luz };
}
const fichas = (n) => String(n).split('').map((c, i, arr) => el('span', { class: 'ficha-cero' + (c === '0' && i > 0 && arr.slice(i).every((x) => x === '0') ? ' cero' : ''), text: c }));

function maquina(d, ctx) {
  const prever = d.modo === 'prever';
  const M = construye(d);
  const estado = { pa: prever ? d.pa : 0, pb: prever ? d.pb : 0 };
  const valor = (k) => (k ? d.b * 10 ** estado.pb : d.a * 10 ** estado.pa);
  const pinta = () => {
    [M.A, M.B].forEach((D, k) => { D.cifras.replaceChildren(...fichas(valor(k))); D.palanca.disabled = prever || hecho || (k ? estado.pb : estado.pa) >= 3; D.quita.disabled = prever || hecho || !(k ? estado.pb : estado.pa); D.quita.hidden = prever; });
  };
  let hecho = false, tirada = false;
  ctx.reto(d.texto ?? (prever ? `Las palancas ya están bajadas. **¿Qué número saldrá?**` : `Consigue que salga **${num(d.objetivo)}** con el ${d.a} y el ${d.b}`));
  ctx.pista(d.pista ?? (prever ? 'Escribe tu predicción y luego tira de la manivela.' : 'Cada palanca le pone un cero a su número. Baja las que hagan falta y tira.'));
  const pred = prever && campo('Lo que crees que saldrá');
  const zona = el('div', { class: 'rincon-ceros' }, M.cuerpo, prever && el('label', { class: 'prediccion' }, el('span', { text: 'Creo que saldrá' }), pred));
  ctx.escenario.append(zona);
  pinta();
  const bajaPalanca = async (k) => {
    if (hecho || prever) return;
    if (k) estado.pb++; else estado.pa++;
    const D = k ? M.B : M.A;
    gsap.fromTo(D.palanca.querySelector('.mango'), { rotation: 0 }, { rotation: 55, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.in', transformOrigin: '50% 100%' });
    suena('clic'); pinta();
    const ultimo = D.cifras.lastElementChild; if (ultimo) gsap.from(ultimo, { x: 30, opacity: 0, duration: 0.3, ease: 'back.out(2)' });
  };
  M.A.palanca.onclick = () => bajaPalanca(0); M.B.palanca.onclick = () => bajaPalanca(1);
  M.A.quita.onclick = () => { if (estado.pa) { estado.pa--; suena('quita'); pinta(); } };
  M.B.quita.onclick = () => { if (estado.pb) { estado.pb--; suena('quita'); pinta(); } };
  const tira = async () => {
    const r = valor(0) * valor(1);
    M.luz.classList.add('on'); M.cuerpo.classList.add('trabaja');
    for (let i = 0; i < 6; i++) { suena('clic'); await espera(90); }
    M.cuerpo.classList.remove('trabaja');
    M.salida.replaceChildren(...fichas(r));
    gsap.from(M.salida.children, { y: -30, opacity: 0, duration: 0.3, ease: 'back.out(2)', stagger: 0.06 });
    suena('pon'); await espera(300 + String(r).length * 60);
    M.luz.classList.remove('on');
    return r;
  };
  if (prever) {
    const boton = ctx.boton('Tirar de la manivela', async () => {
      if (hecho) return;
      const p = lee(pred); if (p == null) return ctx.aviso('Primero escribe lo que crees que saldrá.', true);
      hecho = true; boton.disabled = true; pinta();
      const r = await tira();
      const ok = p === r;
      pred.classList.add(ok ? 'bien' : 'mal');
      ctx.fin(ok ? 3 : 0, (ok ? `**${num(r)}, justo.** ` : `Salió **${num(r)}**. `) + `${d.a} × ${d.b} = ${d.a * d.b} y luego se añaden los ${estado.pa + estado.pb} ceros de las palancas.`);
    });
  } else {
    let intentos = 0;
    const boton = ctx.boton('Tirar de la manivela', async () => {
      if (hecho || tirada) return;
      tirada = true; boton.disabled = true;
      const r = await tira(); intentos++;
      if (r === d.objetivo) {
        hecho = true; pinta();
        chispasEn(M.salida, 14, '#ffc531'); suena('bien');
        const otra = estado.pa && estado.pb ? `${d.a * 10 ** (estado.pa + estado.pb)} × ${d.b}` : `${d.a * 10} × ${d.b * 10 ** Math.max(0, estado.pa + estado.pb - 1)}`;
        return ctx.fin(intentos === 1 ? 3 : intentos === 2 ? 2 : 1, `**¡${num(r)}!** ${num(valor(0))} × ${num(valor(1))}. También valdría ${otra}: lo que cuenta es **cuántos ceros en total**.`);
      }
      ctx.aviso(r > d.objetivo ? `Ha salido ${num(r)}: te sobran ceros.` : `Ha salido ${num(r)}: te faltan ceros.`, true); temblor(M.cuerpo, 4);
      tirada = false; boton.disabled = false;
    });
  }
  ctx.pistas([
    { texto: d.pistas?.[0] ?? `Primero, ${d.a} × ${d.b} sin ceros. Luego, los ceros.` },
    { texto: d.pistas?.[1] ?? `${d.a} × ${d.b} = ${d.a * d.b}. ${prever ? 'Cuenta cuántos ceros llevan los dos números juntos.' : `¿Cuántos ceros tiene ${num(d.objetivo ?? 0)} después del ${d.a * d.b}?`}` },
    { texto: d.pistas?.[2] ?? (prever ? `Tienen ${estado.pa + estado.pb} ceros entre los dos.` : `Hacen falta ${Math.round(Math.log10((d.objetivo ?? 1) / (d.a * d.b)))} ceros en total, repartidos como quieras.`) },
  ]);
}

/* ================================================================ el ascensor de carga */
function ascensor(d, ctx) {
  const { peso, limite } = d;
  const max = Math.floor(limite / peso);
  ctx.reto(d.texto ?? `El ascensor aguanta **${num(limite)} kg**. Cada caja pesa **${peso} kg**. ¿Cuántas cajas caben **como máximo**?`);
  ctx.pista(d.pista ?? 'Prueba con números redondos para acercarte: 10 cajas, 50 cajas… y luego afina.');
  const cajas = el('div', { class: 'cabina-cajas' });
  const indicador = el('div', { class: 'indicador-peso' }, el('span', { class: 'aguja' }));
  const peso1 = el('b', { class: 'lectura-peso', text: '0 kg' });
  const prueba = campo('Cajas para probar', 5);
  const cabina = el('div', { class: 'ascensor' }, el('div', { class: 'cabecera-ascensor' }, el('span', { text: `Máximo ${num(limite)} kg` }), indicador, peso1), cajas);
  const resp = campo('Máximo de cajas', 5);
  ctx.escenario.append(el('div', { class: 'rincon-ceros' }, cabina, el('div', { class: 'panel-ascensor' },
    el('label', {}, el('span', { text: 'Probar con' }), prueba, el('span', { text: 'cajas' })),
    el('button', { type: 'button', class: 'tecla', text: 'Cargar', onclick: () => carga() }),
    el('p', { class: 'historial-ascensor', 'aria-live': 'polite' }),
    el('label', { class: 'respuesta-ascensor' }, el('span', { text: 'Como máximo' }), resp, el('span', { text: 'cajas' })))));
  const hist = ctx.escenario.querySelector('.historial-ascensor');
  const pruebas = [];
  let hecho = false;
  function carga() {
    if (hecho) return;
    const n = lee(prueba); if (n == null) return ctx.aviso('Escribe cuántas cajas quieres probar.', true);
    const kg = n * peso; pruebas.push(n);
    const frac = Math.min(1.15, kg / limite);
    gsap.to(indicador.querySelector('.aguja'), { rotation: -80 + frac * 140, duration: 0.6, ease: 'elastic.out(1,0.5)' });
    peso1.textContent = `${num(kg)} kg`;
    cajas.replaceChildren(...Array.from({ length: Math.min(n, 40) }, () => el('span', { class: 'caja-asc' })));
    const pasa = kg > limite;
    cabina.classList.toggle('pasado', pasa);
    if (pasa) { suena('mal'); temblor(cabina, 6); } else suena('pon');
    hist.append(el('span', { class: pasa ? 'no' : 'si', text: `${n} → ${num(kg)} kg ${pasa ? '✗' : '✓'}` }));
    ctx.aviso(pasa ? '¡Demasiado! El ascensor no arranca.' : kg === limite ? 'Justo en el límite.' : 'El ascensor sube. ¿Cabría alguna más?', pasa);
  }
  ctx.boton('Comprobar', async () => {
    if (hecho) return;
    const r = lee(resp); if (r == null) return ctx.aviso('Escribe cuántas cajas como máximo.', true);
    hecho = true;
    const ok = r === max;
    resp.classList.add(ok ? 'bien' : 'mal');
    const estrellas = ok ? (pruebas.length <= 4 ? 3 : 2) : 0;
    ctx.fin(estrellas, (ok ? `**${max} cajas.** ` : `Caben **${max} cajas**. `) + `${max} × ${peso} = ${num(max * peso)} kg, y con una más serían ${num((max + 1) * peso)} kg: se pasa.` + (ok && pruebas.length > 4 ? ' Con menos pruebas también se puede: empieza por decenas.' : ''));
  });
  ctx.pistas([
    { texto: `Prueba primero con **10 cajas**: ${peso} × 10 es fácil.` },
    { texto: `Y con **100 cajas** serían ${num(peso * 100)} kg. ¿Te pasas o no llegas? Entre 10 y 100, prueba decenas.` },
    { texto: `Entre ${Math.floor(max / 10) * 10} y ${Math.floor(max / 10) * 10 + 10} cajas está la respuesta.` },
  ]);
}
