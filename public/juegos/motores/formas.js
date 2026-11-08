// Motor «formas»: juegos de figuras con mecánicas propias (el estuche).
//   clasificar → meter figuras en cajas: por lados, en el diagrama de cuadriláteros (con inclusiones) o en la cajonera de triángulos
//   goma       → predecir si una goma elástica tocará todo el borde (convexidad) y qué vértices se quedan dentro
//   quien      → ¿quién es quién?: preguntar para adivinar una figura, o elegir las pistas para que otro la adivine
import { el, svg, barajar, azar, elige, suena } from './nucleo.js';
import { espera, mano, temblor, vuela, chispasEn, bote } from './efectos.js';
import { FAM, figuraDe, tablero, camino, notacion, pasaporte, cuadri, tri, convexo, simple, aristas, esc, l2, cruz, area2 } from './geoplano.js';

const N = 6;
const mini = (P, cls = '') => { const T = tablero(N); return svg(`0 0 ${T.w} ${T.h}`, `${T.pins}<path d="${camino(P, T.X, T.Y)}" class="fig"/>`, { class: 'geo ' + cls }); };
const bloquea = (ctx) => ctx.acciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
const distintas = (lista) => { const vistos = new Set(); return lista.filter((P) => { const k = JSON.stringify(P); if (vistos.has(k)) return false; vistos.add(k); return true; }); };

/* ================================================================ clasificar */
const ZONAS = {
  lados: { nombres: { 3: '3 lados', 4: '4 lados', 5: '5 lados', 6: '6 o más' }, de: (P) => String(Math.min(P.length, 6)) },
  triangulos: {
    filas: ['isosceles', 'escaleno'], cols: ['acutangulo', 'rectangulo', 'obtusangulo'],
    nf: { isosceles: 'Isósceles', escaleno: 'Escaleno' }, nc: { acutangulo: 'Acutángulo', rectangulo: 'Rectángulo', obtusangulo: 'Obtusángulo' },
    de: (P) => { const t = tri(P); return `${t.isosceles ? 'isosceles' : 'escaleno'}-${t.rectangulo ? 'rectangulo' : t.obtusangulo ? 'obtusangulo' : 'acutangulo'}`; },
  },
};
// cuadriláteros: zona según lo que el diagrama tenga dibujado en ese nivel
function zonaCuadri(P, partes) {
  const q = cuadri(P);
  if (!q.paralelogramo) return 'otros';
  if (partes >= 3 && q.cuadrado) return 'cuadrado';
  if (partes >= 2 && q.rectangulo) return 'rectangulo';
  if (partes >= 3 && q.rombo) return 'rombo';
  return 'paralelogramo';
}
const NOMBRE_ZONA = { otros: 'otros cuadriláteros', paralelogramo: 'paralelogramos', rectangulo: 'rectángulos', rombo: 'rombos', cuadrado: 'cuadrados (rectángulo y rombo a la vez)' };

function clasificar(d, ctx) {
  const tipo = d.tipo;
  ctx.reto(d.texto ?? (tipo === 'lados' ? 'Cada figura, **a su caja** según sus lados' : tipo === 'triangulos' ? 'Cada triángulo, **a su cajón**: por lados y por ángulos' : 'Cada cuadrilátero, **a su sitio** del estuche'));
  ctx.pista(d.pista ?? 'Toca una figura de la cola y después el sitio donde va. Si te equivocas, tócala otra vez para sacarla.');
  const cola = el('div', { class: 'cola-figuras', role: 'group', 'aria-label': 'Figuras por colocar' });
  const zona = el('div', { class: 'zona-clasificar ' + tipo });
  ctx.escenario.append(cola, zona);
  let hecho = false, elegida = null;
  const items = d.figuras.map((P, i) => {
    const b = el('button', { type: 'button', class: 'pasajero', 'aria-label': `Figura ${i + 1}` }, mini(P));
    const it = { P, b, en: null, bueno: tipo === 'cuadri' ? zonaCuadri(P, d.partes) : ZONAS[tipo].de(P) };
    b.onclick = () => {
      if (hecho) return;
      if (it.en) { it.en = null; cola.append(b); b.classList.remove('colocada'); b.style.cssText = ''; suena('quita'); }
      elegir(it);
    };
    cola.append(b);
    return it;
  });
  const elegir = (it) => { items.forEach((x) => x.b.classList.toggle('elegida', x === it)); elegida = it; if (it) suena('clic'); comprobar.disabled = items.some((x) => !x.en); };
  const pon = (key, cont, x, y) => {
    if (hecho || !elegida) { if (!elegida) ctx.aviso('Primero toca una figura de la cola.'); return; }
    const it = elegida, origen = it.b.getBoundingClientRect();
    it.en = key;
    cont.append(it.b);
    it.b.classList.add('colocada'); it.b.classList.remove('elegida');
    if (x != null) Object.assign(it.b.style, { position: 'absolute', left: x + '%', top: y + '%' });
    it.b.animate?.([{ transform: `translate(${origen.left - it.b.getBoundingClientRect().left}px, ${origen.top - it.b.getBoundingClientRect().top}px) scale(1.3)` }, { transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.3,1.3,.5,1)' });
    suena('pon'); ctx.aviso('');
    elegida = null;
    elegir(items.find((x) => !x.en) || null);
  };

  if (tipo === 'cuadri') {
    // diagrama: caja grande de paralelogramos; dentro, rectángulos y rombos que se solapan; el solape son los cuadrados
    const p = d.partes;
    const dib = svg('0 0 1000 560', `
      <rect x="6" y="6" width="988" height="548" rx="28" class="z-otros"/>
      <text x="30" y="46" class="z-nombre">Otros cuadriláteros</text>
      <rect x="240" y="70" width="730" height="460" rx="26" class="z-par"/>
      <text x="262" y="110" class="z-nombre">Paralelogramos</text>
      ${p >= 2 ? '<ellipse cx="520" cy="320" rx="230" ry="160" class="z-rect"/><text x="330" y="190" class="z-nombre">Rectángulos</text>' : ''}
      ${p >= 3 ? '<ellipse cx="760" cy="320" rx="200" ry="160" class="z-rombo"/><text x="830" y="190" class="z-nombre">Rombos</text><text x="640" y="470" class="z-nombre peq" text-anchor="middle">Cuadrados</text>' : ''}`, { class: 'diagrama' });
    const caja = el('div', { class: 'diagrama-caja' }, dib);
    zona.append(caja);
    const dentroE = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    caja.addEventListener('click', (e) => {
      if (e.target.closest('.pasajero')) return;
      const r = caja.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 1000, y = ((e.clientY - r.top) / r.height) * 560;
      const enP = x >= 240 && x <= 970 && y >= 70 && y <= 530;
      const enR = p >= 2 && dentroE(x, y, 520, 320, 230, 160), enRo = p >= 3 && dentroE(x, y, 760, 320, 200, 160);
      const key = !enP ? 'otros' : enR && enRo ? 'cuadrado' : enR ? 'rectangulo' : enRo ? 'rombo' : 'paralelogramo';
      pon(key, caja, Math.min(92, (x / 1000) * 100 - 4), Math.min(86, (y / 560) * 100 - 7));
    });
  } else if (tipo === 'lados') {
    for (const [k, nombre] of Object.entries(ZONAS.lados.nombres)) {
      const c = el('div', { class: 'cajita-lados', role: 'button', tabindex: '0', 'aria-label': `Caja de ${nombre}` }, el('b', { text: nombre }));
      c.addEventListener('click', (e) => { if (!e.target.closest('.pasajero')) pon(k, c); });
      zona.append(c);
    }
  } else {
    const Z = ZONAS.triangulos;
    zona.append(el('span'), ...Z.cols.map((c) => el('b', { class: 'cab-cajon', text: Z.nc[c] })));
    for (const f of Z.filas) {
      zona.append(el('b', { class: 'cab-cajon fila', text: Z.nf[f] }));
      for (const c of Z.cols) {
        const k = `${f}-${c}`;
        const cel = el('div', { class: 'cajon-tri', role: 'button', tabindex: '0', 'aria-label': `${Z.nf[f]} y ${Z.nc[c]}` });
        cel.addEventListener('click', (e) => { if (!e.target.closest('.pasajero')) pon(k, cel); });
        zona.append(cel);
      }
    }
  }
  const comprobar = ctx.boton('Comprobar', revisar);
  comprobar.disabled = true;
  elegir(items[0]);
  ctx.pistas([
    { texto: d.pistas?.[0] ?? (tipo === 'lados' ? 'Recorre el borde con el dedo y cuenta los lados, no los puntos.' : tipo === 'triangulos' ? 'Cada triángulo tiene dos nombres: uno por los lados (fila) y otro por los ángulos (columna).' : 'Un rectángulo tiene cuatro ángulos rectos; un rombo, cuatro lados iguales. Un cuadrado tiene las dos cosas: por eso va **donde se juntan**.') },
    { texto: d.pistas?.[1] ?? 'Te marco los lados iguales, los paralelos y los ángulos rectos de todas.', ver: () => items.forEach((it) => { const s = it.b.querySelector('svg'); const T = tablero(N); s.insertAdjacentHTML('beforeend', `<g class="notas">${notacion(it.P, T.X, T.Y, tipo === 'lados' ? { iguales: false, paralelos: false, rectos: false } : {})}</g>`); }) },
    { texto: d.pistas?.[2] ?? 'Te coloco una bien. Fíjate en por qué va ahí.', ver: () => { const it = items.find((x) => x.en !== x.bueno); if (!it) return; if (it.en) { it.en = null; cola.append(it.b); it.b.style.cssText = ''; } elegir(it); const z = tipo === 'cuadri' ? null : [...zona.querySelectorAll('.cajita-lados, .cajon-tri')].find((c) => c.getAttribute('aria-label').toLowerCase().includes(tipo === 'lados' ? ZONAS.lados.nombres[it.bueno] : ZONAS.triangulos.nc[it.bueno.split('-')[1]].toLowerCase()) && (tipo === 'lados' || c.getAttribute('aria-label').toLowerCase().includes(ZONAS.triangulos.nf[it.bueno.split('-')[0]].toLowerCase()))); if (z) z.click(); else { const P = { otros: [10, 50], paralelogramo: [30, 85], rectangulo: [42, 55], rombo: [84, 55], cuadrado: [64, 58] }[it.bueno]; const caja = zona.querySelector('.diagrama-caja'); pon(it.bueno, caja, P[0] - 4, P[1] - 7); } } },
  ]);
  if (ctx.primera) mano(items[0].b, { dx: 0.5 });

  async function revisar() {
    if (hecho) return; hecho = true; bloquea(ctx);
    let malas = 0;
    for (const it of items) {
      await espera(140);
      const ok = it.en === it.bueno;
      it.b.classList.add(ok ? 'bien' : 'mal');
      it.b.append(el('span', { class: 'pasaporte-mini', text: pasaporte(it.P).join(', ') }));
      if (!ok) malas++;
      suena(ok ? 'pon' : 'quita');
    }
    await espera(250);
    const estrellas = malas === 0 ? 3 : malas === 1 ? 2 : malas === 2 ? 1 : 0;
    const mal = items.find((it) => it.en !== it.bueno);
    let msg = malas === 0 ? '**Todo en su sitio.**' : `${malas === 1 ? 'Hay una figura' : `Hay ${malas} figuras`} en un sitio que no es el suyo.`;
    if (mal && tipo === 'cuadri') msg += ` Por ejemplo, la marcada en rojo va en ${NOMBRE_ZONA[mal.bueno]}.`;
    if (tipo === 'triangulos') { const vacios = [...zona.querySelectorAll('.cajon-tri')].filter((c) => !c.querySelector('.pasajero')).length; if (vacios) msg += ` ${vacios === 1 ? 'Un cajón se ha quedado vacío' : `${vacios} cajones se han quedado vacíos`}: ¿existen triángulos así?`; }
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ================================================================ goma */
function envolvente(P) {
  const pts = [...P].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const lado = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of pts) { while (lo.length >= 2 && lado(lo.at(-2), lo.at(-1), p) <= 0) lo.pop(); lo.push(p); }
  for (const p of [...pts].reverse()) { while (hi.length >= 2 && lado(hi.at(-2), hi.at(-1), p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}
const sobreBorde = (p, H) => H.some((a, i) => { const b = H[(i + 1) % H.length]; return cruz([b[0] - a[0], b[1] - a[1]], [p[0] - a[0], p[1] - a[1]]) === 0 && Math.min(a[0], b[0]) <= p[0] && p[0] <= Math.max(a[0], b[0]) && Math.min(a[1], b[1]) <= p[1] && p[1] <= Math.max(a[1], b[1]); });

function goma(d, ctx) {
  const P = d.figura, H = envolvente(P);
  const sueltos = P.map((p, i) => i).filter((i) => !sobreBorde(P[i], H));
  const T = tablero(8, 7, { tam: 70, margen: 40 });
  ctx.reto(d.texto ?? (d.marcar ? 'Toca los vértices que **la goma no tocará**' : '¿La goma tocará **todo el borde** de la figura?'));
  ctx.pista(d.pista ?? 'Imagina una goma elástica muy grande que se suelta alrededor de las chinchetas y se ajusta sola.');
  const dib = svg(`0 0 ${T.w} ${T.h}`, '', { class: 'geo grande corcho-goma' });
  ctx.escenario.append(el('div', { class: 'tablero-corcho' }, dib));
  const marcados = new Set();
  let resp = null, hecho = false, banda = null;
  const pinta = (extra = '') => {
    let s = `<path d="${camino(P, T.X, T.Y)}" class="fig figura-goma"/>` + extra;
    P.forEach((p, i) => (s += `<g class="chincheta-v${marcados.has(i) ? ' marcada' : ''}" data-i="${i}"><circle cx="${T.X(p[0])}" cy="${T.Y(p[1])}" r="13" class="cabeza-ch"/><circle cx="${T.X(p[0]) - 4}" cy="${T.Y(p[1]) - 4}" r="4" fill="#fff" opacity=".7"/><circle cx="${T.X(p[0])}" cy="${T.Y(p[1])}" r="30" class="toque-v"/></g>`));
    dib.innerHTML = s + (banda ?? '');
  };
  pinta();
  if (d.marcar) {
    dib.addEventListener('click', (e) => {
      const g = e.target.closest('.chincheta-v'); if (!g || hecho) return;
      const i = +g.dataset.i; marcados.has(i) ? marcados.delete(i) : marcados.add(i); suena(marcados.has(i) ? 'pon' : 'quita'); pinta();
    });
    ctx.boton('Soltar la goma', revisar);
    ctx.boton('Ninguno: la toca entera', () => { marcados.clear(); revisar(); }, true);
  } else {
    ctx.boton('Sí, todo el borde', () => { resp = true; revisar(); });
    ctx.boton('No, quedan huecos', () => { resp = false; revisar(); });
  }
  ctx.pistas([
    { texto: d.pistas?.[0] ?? 'La goma va siempre en línea recta de una chincheta a otra. Si el borde **se mete hacia dentro**, la goma no entra.' },
    { texto: d.pistas?.[1] ?? 'Te marco las esquinas que se meten hacia dentro.', ver: () => pinta(`<g class="notas">${notacion(P, T.X, T.Y, { iguales: false, paralelos: false, rectos: false, entrante: true })}</g>`) },
    { texto: d.pistas?.[2] ?? 'Te dibujo un trozo de goma entre dos chinchetas. ¿Toca el borde por ahí?', ver: () => { const i = H.findIndex((a, k) => { const b = H[(k + 1) % H.length]; return P.some((q) => !sobreBorde(q, [a, b]) && false) || true; }); const a = H[i], b = H[(i + 1) % H.length]; pinta(`<path d="M${T.X(a[0])} ${T.Y(a[1])} L${T.X(b[0])} ${T.Y(b[1])}" class="goma-pista"/>`); } },
  ]);
  if (ctx.primera && d.marcar) setTimeout(() => { const g = dib.querySelector('.chincheta-v'); if (g) mano(g, { dx: 0.5 }); }, 50);

  async function revisar() {
    if (hecho) return; hecho = true; bloquea(ctx);
    // la goma se encoge desde lejos hasta la envolvente
    const cx = P.reduce((s, p) => s + p[0], 0) / P.length, cy = P.reduce((s, p) => s + p[1], 0) / P.length;
    const t0 = performance.now(), dur = matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 900;
    suena('salto');
    await new Promise((fin) => {
      const paso = (t) => {
        const f = Math.min(1, (t - t0) / dur), k = 1 + 1.6 * (1 - f) ** 2 - 0.08 * Math.sin(f * Math.PI) * (1 - f);
        const Q = H.map(([x, y]) => [cx + (x - cx) * k, cy + (y - cy) * k]);
        banda = `<path d="${camino(Q, T.X, T.Y)}" class="banda"/>`;
        pinta(f === 1 ? `<path d="${camino(H, T.X, T.Y)}" class="aire"/>` : '');
        f < 1 ? requestAnimationFrame(paso) : fin();
      };
      requestAnimationFrame(paso);
    });
    suena('pon');
    const esConvexa = convexo(P);
    let estrellas, msg;
    if (!d.marcar) {
      const ok = resp === esConvexa;
      estrellas = ok ? 3 : 0;
      msg = esConvexa ? (ok ? '**La goma toca todo el borde.** No hay entrantes: la figura es convexa.' : 'Pues la goma toca todo el borde: no hay ningún entrante, así que la figura es **convexa**.')
        : (ok ? `**Quedan huecos:** el aire azul son los entrantes. La figura no es convexa.` : 'Mira el aire azul: la goma no entra en los entrantes. La figura **no es convexa**.');
    } else {
      const bien = sueltos.filter((i) => marcados.has(i)).length, sobra = [...marcados].filter((i) => !sueltos.includes(i)).length, falta = sueltos.length - bien;
      const err = sobra + falta;
      estrellas = err === 0 ? 3 : err === 1 ? 2 : err === 2 ? 1 : 0;
      msg = err === 0 ? (sueltos.length ? `**Exacto.** ${sueltos.length === 1 ? 'Ese vértice se queda' : 'Esos vértices se quedan'} dentro: la figura no es convexa.` : '**Exacto:** la goma toca todos los vértices. Es convexa.')
        : `La goma deja dentro ${sueltos.length === 1 ? '1 vértice' : `${sueltos.length} vértices`}. ${falta ? `Te ${falta === 1 ? 'ha faltado 1' : `han faltado ${falta}`}. ` : ''}${sobra ? `${sobra === 1 ? 'Has marcado 1 que sí toca' : `Has marcado ${sobra} que sí tocan`}.` : ''}`;
      P.forEach((p, i) => { if (sueltos.includes(i) !== marcados.has(i)) dib.insertAdjacentHTML('beforeend', `<circle cx="${T.X(p[0])}" cy="${T.Y(p[1])}" r="24" class="nota-entrante"/>`); });
    }
    if (!estrellas) temblor(dib, 6);
    await espera(300);
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}

/* ================================================================ ¿quién es quién? */
const PREG = {
  tri: ['¿Es un triángulo?', 'Es un triángulo', 'No es un triángulo', (P) => P.length === 3],
  lados4: ['¿Tiene 4 lados?', 'Tiene 4 lados', 'No tiene 4 lados', (P) => P.length === 4],
  masDe4: ['¿Tiene más de 4 lados?', 'Tiene más de 4 lados', 'No tiene más de 4 lados', (P) => P.length > 4],
  convexa: ['¿Es convexa?', 'Es convexa', 'No es convexa', (P) => convexo(P)],
  recto: ['¿Tiene algún ángulo recto?', 'Tiene algún ángulo recto', 'No tiene ningún ángulo recto', (P) => { const E = aristas(P); return E.some((e, i) => esc(E[(i - 1 + E.length) % E.length], e) === 0); }],
  iguales: ['¿Tiene todos los lados iguales?', 'Tiene todos los lados iguales', 'No tiene todos los lados iguales', (P) => new Set(aristas(P).map(l2)).size === 1],
  dosIguales: ['¿Tiene al menos dos lados iguales?', 'Tiene al menos dos lados iguales', 'Tiene todos los lados distintos', (P) => { const s = aristas(P).map(l2); return new Set(s).size < s.length; }],
  paralelos: ['¿Tiene algún par de lados paralelos?', 'Tiene lados paralelos', 'No tiene lados paralelos', (P) => { const E = aristas(P); for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) if (cruz(E[i], E[j]) === 0) return true; return false; }],
};
const perfil = (P, claves) => claves.map((k) => PREG[k][3](P) ? 1 : 0).join('');
// número de preguntas que hace falta como poco, eligiendo siempre la pregunta que mejor parte el grupo
function preguntasOptimas(figs, secreto, claves) {
  let grupo = figs.map((_, i) => i), n = 0;
  while (grupo.length > 1 && n < 10) {
    let mejor = null, peor = Infinity;
    for (const k of claves) { const si = grupo.filter((i) => PREG[k][3](figs[i])).length; const m = Math.max(si, grupo.length - si); if (m < peor && si > 0 && si < grupo.length) { peor = m; mejor = k; } }
    if (!mejor) break;
    const v = PREG[mejor][3](figs[secreto]);
    grupo = grupo.filter((i) => PREG[mejor][3](figs[i]) === v); n++;
  }
  return n;
}

function quien(d, ctx) {
  const figs = d.figuras, sec = d.secreta, claves = d.preguntas;
  const inverso = d.modo2 === 'pistas';
  ctx.reto(d.texto ?? (inverso ? 'Elige **las pistas justas** para que se adivine la figura marcada' : 'Boli ha pensado una figura. **¿Cuál es?**'));
  ctx.pista(d.pista ?? (inverso ? 'Toca las pistas que quieras dar. Gana quien lo consiga con las menos pistas posibles.' : 'Haz preguntas, tumba las figuras que ya no pueden ser y, cuando lo sepas, pulsa «¡Ya lo sé!» y toca la figura.'));
  const tablero = el('div', { class: 'tablero-quien', role: 'group', 'aria-label': 'Figuras' });
  const cartas = figs.map((P, i) => {
    const b = el('button', { type: 'button', class: 'carta-quien' + (inverso && i === sec ? ' objetivo' : ''), 'aria-label': `Figura ${i + 1}` }, mini(P));
    tablero.append(b);
    return { P, b, i, tumbada: false };
  });
  const panel = el('div', { class: 'panel-preguntas' });
  const historial = el('ol', { class: 'historial-quien', 'aria-live': 'polite' });
  ctx.escenario.append(tablero, panel, historial);
  let hecho = false, adivinando = false, hechas = 0;
  const elegidas = new Set();
  const optimo = preguntasOptimas(figs, sec, claves);

  if (!inverso) {
    for (const k of claves) {
      const b = el('button', { type: 'button', class: 'pregunta', text: PREG[k][0] });
      b.onclick = () => {
        if (hecho || b.disabled) return;
        b.disabled = true; hechas++;
        const si = PREG[k][3](figs[sec]);
        historial.append(el('li', {}, PREG[k][0] + ' ', el('b', { class: si ? 'si' : 'no', text: si ? 'Sí' : 'No' })));
        ctx.di(si ? 'Sí.' : 'No.', 'saludo', 1800);
        suena(si ? 'pon' : 'quita');
      };
      panel.append(b);
    }
    cartas.forEach((c) => (c.b.onclick = () => {
      if (hecho) return;
      if (adivinando) return adivina(c);
      c.tumbada = !c.tumbada; c.b.classList.toggle('tumbada', c.tumbada); suena(c.tumbada ? 'quita' : 'pon');
    }));
    ctx.boton('¡Ya lo sé!', () => { if (hecho) return; adivinando = true; ctx.aviso('Toca la figura que crees que es.'); tablero.classList.add('adivinando'); });
  } else {
    for (const k of claves) {
      const vale = PREG[k][3](figs[sec]);
      const b = el('button', { type: 'button', class: 'pregunta pista-chip', 'aria-pressed': 'false', text: vale ? PREG[k][1] : PREG[k][2] });
      b.onclick = () => { if (hecho) return; elegidas.has(k) ? elegidas.delete(k) : elegidas.add(k); b.setAttribute('aria-pressed', String(elegidas.has(k))); suena('clic'); };
      panel.append(b);
    }
    ctx.boton('Que adivine Fosforito', revisarInverso);
  }
  ctx.pistas(inverso ? [
    { texto: 'Una buena pista deja fuera **muchas** figuras de golpe.' },
    { texto: 'Mira qué tiene la figura marcada que casi ninguna otra tenga.' },
    { texto: `Se puede con ${optimo === 1 ? 'una sola pista' : `${optimo} pistas`}.` },
  ] : [
    { texto: 'Empieza por una pregunta que parta el grupo **por la mitad**, más o menos.' },
    { texto: 'Después de cada respuesta, tumba todas las figuras que ya no pueden ser.' },
    { texto: `Se puede adivinar con ${optimo === 1 ? 'una sola pregunta' : `${optimo} preguntas`}.` },
  ]);
  if (ctx.primera) mano(panel.firstChild, { dx: 0.5 });

  async function adivina(c) {
    hecho = true; bloquea(ctx); tablero.classList.remove('adivinando');
    const ok = c.i === sec;
    cartas[sec].b.classList.add('secreta');
    c.b.classList.add(ok ? 'bien' : 'mal');
    // tumbadas que no debían: con lo que se ha respondido, seguían siendo posibles
    const respondidas = [...panel.querySelectorAll('.pregunta:disabled')].map((b) => claves.find((k) => PREG[k][0] === b.textContent));
    const malTumbadas = cartas.filter((x) => x.tumbada && respondidas.every((k) => PREG[k][3](x.P) === PREG[k][3](figs[sec]))).length;
    await espera(400);
    let estrellas = ok ? (hechas <= optimo + 1 && !malTumbadas ? 3 : 2) : 0;
    let msg = ok ? `**¡Era esa!** Con ${hechas} ${hechas === 1 ? 'pregunta' : 'preguntas'}${hechas <= optimo ? ', imposible con menos.' : `. Se podía con ${optimo}.`}` : 'No era esa. La de borde azul es la que pensó Boli.';
    if (ok && malTumbadas) msg += ` Ojo: ${malTumbadas === 1 ? 'tumbaste una figura que' : `tumbaste ${malTumbadas} figuras que`} aún podía ser.`;
    if (!ok) { const k = respondidas.find((k) => PREG[k][3](c.P) !== PREG[k][3](figs[sec])); if (k) msg += ` La que elegiste no encaja con «${PREG[k][0]}».`; else msg += ' Con las preguntas hechas aún quedaban varias posibles: hacía falta alguna pregunta más.'; }
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
  async function revisarInverso() {
    if (hecho) return;
    if (!elegidas.size) return ctx.aviso('Elige al menos una pista.', true);
    hecho = true; bloquea(ctx);
    const quedan = cartas.filter((c) => [...elegidas].every((k) => PREG[k][3](c.P) === PREG[k][3](figs[sec])));
    for (const c of cartas) { await espera(90); if (!quedan.includes(c)) { c.b.classList.add('tumbada'); suena('quita'); } }
    await espera(300);
    const n = elegidas.size, unica = quedan.length === 1;
    const estrellas = unica ? (n <= optimo ? 3 : n === optimo + 1 ? 2 : 1) : 0;
    const msg = unica ? `**Fosforito la ha adivinado** con ${n} ${n === 1 ? 'pista' : 'pistas'}${n <= optimo ? '. Imposible con menos.' : `. Se podía con ${optimo}.`}` : `Con esas pistas aún quedan ${quedan.length} figuras posibles: Fosforito no puede saber cuál es. Hace falta una pista que las separe.`;
    ctx.fin(estrellas, msg);
  }
}

/* ================================================================ generadores */
const FAM_CUADRI = ['cuadradoRecto', 'cuadradoInclinado', 'rectanguloRecto', 'rectanguloInclinado', 'rombo', 'romboide', 'trapecio', 'trapecioRecto', 'cuadrilatero', 'dardo'];
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  if (d.modo === 'clasificar') {
    const fams = g.familias ?? (d.tipo === 'lados' ? ['tri', 'triRectangulo', 'cuadrilatero', 'trapecio', 'pent', 'convexo5', 'concavo5', 'hex', 'convexo6'] : d.tipo === 'triangulos' ? ['tri', 'triRectangulo', 'triIsosceles', 'triObtuso'] : FAM_CUADRI);
    const out = [];
    let t = 0;
    while (out.length < (g.cantidad ?? 8) && t++ < 400) { const P = figuraDe(elige(fams), N, g.girar !== false); if (P) out.push(P); }
    d.figuras = distintas(out);
    return d;
  }
  if (d.modo === 'goma') {
    for (let t = 0; t < 400; t++) {
      const fam = elige(g.familias ?? ['dardo', 'concavo5', 'convexo5', 'rectanguloRecto', 'trapecio']);
      const P = figuraDe(fam, 7, true);
      if (!P || P.length < (g.minVertices ?? 3)) continue;
      if (g.concava && convexo(P)) continue;
      return { ...d, figura: P };
    }
  }
  if (d.modo === 'quien') {
    const claves = d.preguntas ?? Object.keys(PREG);
    for (let t = 0; t < 300; t++) {
      const fams = g.familias ?? ['cuadradoRecto', 'rectanguloRecto', 'rombo', 'romboide', 'trapecio', 'dardo', 'triRectangulo', 'triIsosceles', 'tri', 'pent', 'concavo5', 'hex'];
      const figs = distintas(barajar(fams).slice(0, g.cantidad ?? 8).map((f) => figuraDe(f, N, true)).filter(Boolean));
      if (figs.length < (g.cantidad ?? 8) - 1) continue;
      const perfiles = figs.map((P) => perfil(P, claves));
      const unicas = figs.map((_, i) => i).filter((i) => perfiles.filter((p) => p === perfiles[i]).length === 1);
      if (!unicas.length) continue;
      return { ...d, figuras: figs, secreta: elige(unicas), preguntas: claves };
    }
  }
  return d;
}

export function ronda(d, ctx) {
  return { clasificar, goma, quien }[d.modo](d, ctx);
}
