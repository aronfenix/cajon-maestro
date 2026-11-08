// Motor «formas»: juegos de figuras con mecánicas propias (el estuche).
//   clasificar → meter figuras en cajas: por lados, en el diagrama de cuadriláteros (con inclusiones) o en la cajonera de triángulos
//   goma       → predecir si una goma elástica tocará todo el borde (convexidad) y qué vértices se quedan dentro
//   quien      → ¿quién es quién?: preguntar para adivinar una figura, o elegir las pistas para que otro la adivine
import { el, svg, barajar, azar, elige, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, mano, demuestra, temblor, vuela, chispasEn, bote, arrastra } from './efectos.js';
import { FAM, figuraDe, tablero, camino, notacion, pasaporte, cuadri, tri, convexo, simple, aristas, esc, l2, cruz, area2 } from './geoplano.js';

const N = 6;
const mini = (P, cls = '') => { const T = tablero(N); return svg(`0 0 ${T.w} ${T.h}`, `${T.pins}<path d="${camino(P, T.X, T.Y)}" class="fig"/>`, { class: 'geo ' + cls }); };
// Figura recortada en cartulina punteada: solo la forma, con canto, puntos de la trama y contorno
const CARTULINAS = [['#ffc531', '#c98f00'], ['#5ec3ff', '#2b88c4'], ['#ff7fae', '#c4417a'], ['#9bd84a', '#5e9a1c'], ['#ff9f45', '#c76512'], ['#b79cff', '#7b5ad6']];
let idRecorte = 0;
export function recorte(P, k = 0) {
  const T = tablero(N);
  const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys), 2.4);
  const half = span * 20 + 14;
  const d = camino(P, T.X, T.Y), id = 'rc' + ++idRecorte;
  const [c, osc] = CARTULINAS[k % CARTULINAS.length];
  let puntos = '';
  for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++) puntos += `<circle cx="${T.X(x)}" cy="${T.Y(y)}" r="3.4"/>`;
  return svg(`${T.X(cx) - half} ${T.Y(cy) - half} ${2 * half} ${2 * half}`, `
    <defs><clipPath id="${id}"><path d="${d}"/></clipPath></defs>
    <path d="${d}" transform="translate(0 5)" fill="${osc}" stroke="#1b1e3a" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="${d}" fill="${c}" class="cara"/>
    <g clip-path="url(#${id})"><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="9" transform="translate(2.5 2.5)"/><g fill="#1b1e3a" fill-opacity=".3">${puntos}</g></g>
    <path d="${d}" fill="none" stroke="#1b1e3a" stroke-width="3.5" stroke-linejoin="round" class="borde"/>`, { class: 'geo recorte' });
}
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
  ctx.reto(d.texto ?? (tipo === 'lados' ? 'Cada figura, **a su bolsillo** según sus lados' : tipo === 'triangulos' ? 'Cada triángulo, **a su cajón**: por lados y por ángulos' : 'Cada cuadrilátero, **a su bolsillo** del estuche'));
  ctx.pista(d.pista ?? 'Arrastra cada figura con el dedo hasta su sitio. También puedes tocarla y después tocar el sitio.');
  const cola = el('div', { class: 'cola-figuras bandeja', role: 'group', 'aria-label': 'Figuras por colocar' });
  const zona = el('div', { class: 'zona-clasificar ' + tipo });
  ctx.escenario.append(el('div', { class: 'mesa-clasificar ' + tipo }, cola, zona));
  let hecho = false, elegida = null;
  const destinos = [];
  const items = d.figuras.map((P, i) => {
    const b = el('button', { type: 'button', class: 'pasajero', 'aria-label': `Figura ${i + 1}`, style: { '--giro': (Math.random() * 10 - 5).toFixed(1) + 'deg' } }, recorte(P, i));
    const it = { P, b, en: null, bueno: tipo === 'cuadri' ? zonaCuadri(P, d.partes) : ZONAS[tipo].de(P) };
    arrastra(b, {
      puede: () => !hecho,
      destinos: () => [...destinos, cola],
      alTocar: () => { if (it.en) { aCola(it); } elegir(it); },
      alSoltar: (dest, x, y) => { if (dest === cola) { aCola(it); return true; } return dest._soltar(it, x, y); },
    });
    cola.append(b);
    return it;
  });
  const aCola = (it) => { it.en = null; it._caja = null; cola.append(it.b); it.b.classList.remove('colocada'); it.b.style.position = it.b.style.left = it.b.style.top = ''; suena('quita'); listo(); };
  const listo = () => { comprobar.disabled = items.some((x) => !x.en); };
  const elegir = (it) => { items.forEach((x) => x.b.classList.toggle('elegida', x === it)); elegida = it; if (it) suena('clic'); };
  // coloca una figura en un sitio; con tocar-tocar, la figura vuela hasta allí
  const pon = (it, key, cont, x, y, volando) => {
    const origen = it.b.getBoundingClientRect();
    it.en = key;
    cont.append(it.b);
    it.b.classList.add('colocada'); it.b.classList.remove('elegida');
    if (x != null) Object.assign(it.b.style, { position: 'absolute', left: x + '%', top: y + '%' }); else it.b.style.position = it.b.style.left = it.b.style.top = '';
    if (volando) { const r = it.b.getBoundingClientRect(); it.b.animate?.([{ transform: `translate(${origen.left - r.left}px, ${origen.top - r.top}px) scale(1.2)` }, { transform: 'none' }], { duration: 360, easing: 'cubic-bezier(.3,1.3,.5,1)' }); }
    cont.animate?.([{ transform: 'scale(1)' }, { transform: 'scale(1.015)' }, { transform: 'scale(1)' }], { duration: 260 });
    suena('pon'); ctx.aviso('');
    if (!elegida || elegida.en) elegir(items.find((x) => !x.en) || null);
    listo();
    return true;
  };
  const tocarSitio = (cont, fn) => cont.addEventListener('click', (e) => { if (e.target.closest('.pasajero') || hecho) return; if (!elegida) return ctx.aviso('Primero toca o arrastra una figura de la cola.'); fn(elegida, e.clientX, e.clientY, true); });

  if (tipo === 'cuadri') {
    // bolsillos del estuche: paralelogramos y, dentro, rectángulos y rombos que se cruzan; el cruce son los cuadrados
    const p = d.partes;
    const R = [290, 176, 390, 344, 64], RO = [500, 176, 400, 344, 64], PA = [226, 62, 720, 488, 44];
    const rr = ([x, y, w, h, r], extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ${extra}/>`;
    const costura = ([x, y, w, h, r], c, m = 13) => `<rect x="${x + m}" y="${y + m}" width="${w - 2 * m}" height="${h - 2 * m}" rx="${Math.max(4, r - m)}" class="costura ${c}"/>`;
    const ETQ = [];
    // etiqueta tejida, cosida con dos puntadas
    const etiqueta = (x, y, txt, c, ancla = 'start', giro = 0) => {
      const w = txt.length * 14.5 + 40; const x0 = ancla === 'end' ? x - w : ancla === 'middle' ? x - w / 2 : x;
      ETQ.push([x0 - 4, y - 30, w + 8, 46]);
      return `<g class="etq ${c}" transform="rotate(${giro} ${x0 + w / 2} ${y - 8})"><rect x="${x0}" y="${y - 27}" width="${w}" height="40" rx="5" class="tejido"/><path d="M${x0 + 9} ${y - 17} v20 M${x0 + w - 9} ${y - 17} v20" class="puntada"/><text x="${x0 + w / 2}" y="${y + 1}" text-anchor="middle">${txt}</text></g>`;
    };
    const bolsillo = (B, clase, borde) => `<g class="bolsillo-svg ${clase}" filter="url(#sombra-tela)">${rr(B, 'class="fondo"')}${rr(B, 'class="malla" fill="url(#malla)"')}<path d="M${B[0] + B[4] * 0.35} ${B[1] + 26} H${B[0] + B[2] - B[4] * 0.35}" class="dobladillo"/>${rr(B, `class="ribete" stroke="${borde}"`)}${costura(B, 'c-' + clase, 9)}</g>`;
    const dib = svg('0 0 1000 600', `
      <defs>
        <pattern id="lona" width="128" height="128" patternUnits="userSpaceOnUse"><image href="../motores/tex/lona.webp" width="128" height="128"/></pattern>
        <pattern id="fieltro" width="160" height="160" patternUnits="userSpaceOnUse"><image href="../motores/tex/fieltro.webp" width="160" height="160"/></pattern>
        <pattern id="malla" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="13" height="13" fill="none"/><circle cx="6.5" cy="6.5" r="4.2" fill="rgba(27,30,58,.2)"/></pattern>
        <pattern id="dientes" width="9" height="16" patternUnits="userSpaceOnUse"><rect x="1" y="2" width="6" height="12" rx="2" fill="#e6e9f2" stroke="#1b1e3a" stroke-width="1.4"/></pattern>
        <filter id="sombra-tela" x="-10%" y="-10%" width="120%" height="125%"><feDropShadow dx="3" dy="6" stdDeviation="4" flood-color="#0b1030" flood-opacity=".45"/></filter>
        <filter id="sombra-estuche" x="-6%" y="-6%" width="112%" height="118%"><feDropShadow dx="8" dy="16" stdDeviation="10" flood-color="#04140d" flood-opacity=".55"/></filter>
        <clipPath id="corte-rect">${rr(R)}</clipPath>
      </defs>
      <g filter="url(#sombra-estuche)"><rect x="3" y="3" width="994" height="594" rx="60" class="exterior"/></g>
      <rect x="3" y="3" width="994" height="594" rx="60" fill="url(#lona)" class="textura"/>
      <rect x="24" y="24" width="952" height="552" rx="44" class="cinta-cremallera"/>
      <rect x="24" y="24" width="952" height="552" rx="44" class="dientes-cremallera"/>
      <rect x="34" y="34" width="932" height="532" rx="36" class="z-otros"/>
      <rect x="34" y="34" width="932" height="532" rx="36" fill="url(#lona)" class="textura forro"/>
      <rect x="34" y="34" width="932" height="532" rx="36" class="sombra-interior"/>
      ${etiqueta(56, 76, 'Otros', 'e-otros', 'start', -3)}
      <g class="bolsillo-svg par" filter="url(#sombra-tela)">${rr(PA, 'class="z-par"')}${rr(PA, 'fill="url(#fieltro)" class="textura"')}<rect x="${PA[0]}" y="${PA[1]}" width="${PA[2]}" height="30" rx="14" class="dobladillo-fieltro"/>${costura(PA, 'c-par')}</g>
      ${etiqueta(PA[0] + 30, PA[1] + 66, 'Paralelogramos', 'e-par', 'start', -2)}
      ${p >= 2 ? bolsillo(R, 'rect', '#1c3a96') : ''}
      ${p >= 3 ? bolsillo(RO, 'rombo', '#a8204f') : ''}
      ${p >= 2 ? etiqueta(R[0] + 22, R[1] + 70, 'Rectángulos', 'e-rect', 'start', -2) : ''}
      ${p >= 3 ? etiqueta(RO[0] + RO[2] - 22, RO[1] + 70, 'Rombos', 'e-rombo', 'end', 2) + etiqueta(RO[0] + (R[0] + R[2] - RO[0]) / 2, R[1] + R[3] - 24, 'Cuadrados', 'e-cuadrado', 'middle', 0) : ''}
      <g class="tirador" transform="translate(850 10)"><rect x="0" y="0" width="46" height="30" rx="8"/><rect x="12" y="24" width="22" height="56" rx="10" class="lengueta"/><circle cx="23" cy="66" r="5" class="agujero"/></g>`, { class: 'diagrama estuche-svg' });
    const caja = el('div', { class: 'diagrama-caja' }, dib);
    zona.append(caja);
    const dentro = (x, y, [rx, ry, w, h, r]) => { if (x < rx || x > rx + w || y < ry || y > ry + h) return false; const cx = Math.max(rx + r, Math.min(x, rx + w - r)), cy = Math.max(ry + r, Math.min(y, ry + h - r)); return (x - cx) ** 2 + (y - cy) ** 2 <= r * r; };
    const zonaEn = (x, y) => { const enP = dentro(x, y, PA), enR = p >= 2 && dentro(x, y, R), enRo = p >= 3 && dentro(x, y, RO); return !enP ? 'otros' : enR && enRo ? 'cuadrado' : enR ? 'rectangulo' : enRo ? 'rombo' : 'paralelogramo'; };
    const choca = (a, b, m = 0) => a[0] < b[0] + b[2] + m && b[0] < a[0] + a[2] + m && a[1] < b[1] + b[3] + m && b[1] < a[1] + a[3] + m;
    // busca, cerca de donde se ha soltado, un hueco de la misma zona que no tape etiquetas ni otras figuras
    const acomoda = (it, x, y, w, h) => {
      const key = zonaEn(x, y);
      const otras = items.filter((o) => o !== it && o.en && o._caja).map((o) => o._caja);
      const vale = (cx, cy, conOtras) => {
        const q = [cx - w / 2, cy - h / 2, w, h];
        if (q[0] < 32 || q[1] < 32 || q[0] + w > 968 || q[1] + h > 568) return false;
        for (const fx of [0, 0.5, 1]) for (const fy of [0, 0.5, 1]) if (zonaEn(q[0] + 4 + fx * (w - 8), q[1] + 4 + fy * (h - 8)) !== key) return false;
        if (ETQ.some((t) => choca(q, t, 4))) return false;
        return !conOtras || !otras.some((o) => choca(q, o, -12));
      };
      // primero sin pisar a nadie; si no cabe, al menos sin tapar etiquetas ni salirse de su zona
      for (const conOtras of [true, false]) for (let rad = 0; rad <= 320; rad += 12) {
        const pasos = rad ? Math.ceil((2 * Math.PI * rad) / 24) : 1;
        for (let k = 0; k < pasos; k++) { const a = (k / pasos) * 2 * Math.PI; const cx = x + rad * Math.cos(a), cy = y + rad * Math.sin(a) * 0.8; if (vale(cx, cy, conOtras)) return [key, cx, cy]; }
      }
      return [key, x, y];
    };
    const soltar = (it, cx, cy, volando) => {
      const r = caja.getBoundingClientRect();
      const lado = innerWidth <= 760 ? 52 : 74; // tamaño de la figura ya dentro del estuche
      const w = (lado / r.width) * 1000, h = (lado / r.height) * 600;
      const [key, x, y] = acomoda(it, ((cx - r.left) / r.width) * 1000, ((cy - r.top) / r.height) * 600, w, h);
      it._caja = [x - w / 2, y - h / 2, w, h];
      return pon(it, key, caja, (x - w / 2) / 10, (y - h / 2) / 6, volando);
    };
    caja._soltar = (it, x, y) => soltar(it, x, y, false);
    tocarSitio(caja, soltar);
    destinos.push(caja);
  } else if (tipo === 'lados') {
    Object.entries(ZONAS.lados.nombres).forEach(([k, nombre], i) => {
      const c = el('div', { class: 'bolsillo b' + i, role: 'button', tabindex: '0', 'aria-label': `Bolsillo de ${nombre}` }, el('span', { class: 'dobladillo-html', 'aria-hidden': 'true' }), el('span', { class: 'etq-html', text: nombre }));
      c._soltar = (it) => pon(it, k, c);
      tocarSitio(c, (it) => pon(it, k, c, null, null, true));
      zona.append(c); destinos.push(c);
    });
  } else {
    const Z = ZONAS.triangulos;
    zona.append(el('span'), ...Z.cols.map((c) => el('b', { class: 'cab-cajon', text: Z.nc[c] })));
    Z.filas.forEach((f, fi) => {
      zona.append(el('b', { class: 'cab-cajon fila', text: Z.nf[f] }));
      for (const c of Z.cols) {
        const k = `${f}-${c}`;
        const cel = el('div', { class: 'cajon-tri f' + fi, role: 'button', tabindex: '0', 'aria-label': `${Z.nf[f]} y ${Z.nc[c]}` });
        cel._soltar = (it) => pon(it, k, cel);
        tocarSitio(cel, (it) => pon(it, k, cel, null, null, true));
        zona.append(cel); destinos.push(cel);
      }
    });
  }
  const comprobar = ctx.boton('Comprobar', revisar);
  comprobar.disabled = true;
  elegir(items[0]);
  ctx.pistas([
    { texto: d.pistas?.[0] ?? (tipo === 'lados' ? 'Recorre el borde con el dedo y cuenta los lados, no los puntos.' : tipo === 'triangulos' ? 'Cada triángulo tiene dos nombres: uno por los lados (fila) y otro por los ángulos (columna).' : 'Un rectángulo tiene cuatro ángulos rectos; un rombo, cuatro lados iguales. Un cuadrado tiene las dos cosas: por eso va **donde se cruzan**.') },
    { texto: d.pistas?.[1] ?? 'Te marco los lados iguales, los paralelos y los ángulos rectos de todas.', ver: () => items.forEach((it) => { const sv = it.b.querySelector('svg'); if (sv.querySelector('.notas')) return; const T = tablero(N); sv.insertAdjacentHTML('beforeend', `<g class="notas">${notacion(it.P, T.X, T.Y, tipo === 'lados' ? { iguales: false, paralelos: false, rectos: false } : {})}</g>`); }) },
    { texto: d.pistas?.[2] ?? 'Te coloco una bien. Fíjate en por qué va ahí.', ver: () => {
      const it = items.find((x) => x.en !== x.bueno); if (!it) return;
      if (tipo === 'cuadri') { const pos = { otros: [11, 50], paralelogramo: [75, 20], rectangulo: [38, 55], rombo: [80, 55], cuadrado: [59, 55] }[it.bueno]; const caja = zona.querySelector('.diagrama-caja'); const r = caja.getBoundingClientRect(); caja._soltar(it, r.left + r.width * pos[0] / 100, r.top + r.height * pos[1] / 100); }
      else { const c = destinos.find((z) => z._clave === it.bueno) ?? destinos[tipo === 'lados' ? Object.keys(ZONAS.lados.nombres).indexOf(it.bueno) : ZONAS.triangulos.filas.indexOf(it.bueno.split('-')[0]) * 3 + ZONAS.triangulos.cols.indexOf(it.bueno.split('-')[1])]; c._soltar(it); }
    } },
  ]);
  entrada(items, zona);
  // la primera vez, en lugar de explicarlo, se enseña: una mano lleva una figura a su sitio (y la devuelve)
  if (ctx.primera) {
    const it = items[0];
    const destino = () => {
      if (tipo === 'cuadri') { const pos = { otros: [11, 50], paralelogramo: [75, 20], rectangulo: [38, 55], rombo: [80, 55], cuadrado: [59, 55] }[it.bueno]; const r = zona.querySelector('.diagrama-caja').getBoundingClientRect(); return { x: r.left + r.width * pos[0] / 100, y: r.top + r.height * pos[1] / 100 }; }
      if (tipo === 'lados') return destinos[Object.keys(ZONAS.lados.nombres).indexOf(it.bueno)];
      const [f, c] = it.bueno.split('-'); return destinos[ZONAS.triangulos.filas.indexOf(f) * 3 + ZONAS.triangulos.cols.indexOf(c)];
    };
    setTimeout(() => { if (!it.en && !hecho) { ctx.di('Mira: **la coges y la llevas** a su sitio. Esta, por ejemplo, va ahí.', 'pista', 4200); demuestra(it.b, destino(), { demora: 200 }); } }, 1500);
  }

  async function revisar() {
    if (hecho) return; hecho = true; bloquea(ctx);
    let malas = 0, buenas = 0;
    const orden = [...items].sort((p, q) => { const a = p.b.getBoundingClientRect(), b = q.b.getBoundingClientRect(); return a.top + a.left * 0.6 - (b.top + b.left * 0.6); });
    const sello = selloAduana();
    for (const [k, it] of orden.entries()) {
      const ok = it.en === it.bueno;
      await sello.estampa(it.b, ok, k, orden.length);
      it.b.classList.add(ok ? 'bien' : 'mal');
      it.b.title = pasaporte(it.P).join(', ');
      if (ok) { buenas++; suena('selloBien', buenas - 1); bote(it.b, 8); }
      else { malas++; suena('selloMal'); it.b.animate?.([{ transform: 'translateX(0)' }, { transform: 'translateX(-7px) rotate(-4deg)' }, { transform: 'translateX(7px) rotate(3deg)' }, { transform: 'none' }], { duration: 320 }); }
    }
    await sello.vete();
    // después de corregir, tocar una figura dice su pasaporte
    items.forEach((it) => { it.b.onclick = () => { const pas = pasaporte(it.P); ctx.di(`Esta figura es **${pas.join(', ')}**.` + (it.en === it.bueno ? '' : ` Su sitio: ${NOMBRE_ZONA[it.bueno] ?? 'otro'}.`), 'pista', 6000); }; });
    await espera(250);
    const estrellas = malas === 0 ? 3 : malas === 1 ? 2 : malas === 2 ? 1 : 0;
    const mal = items.find((it) => it.en !== it.bueno);
    let msg = malas === 0 ? '**Todo en su sitio.**' : `${malas === 1 ? 'Hay una figura' : `Hay ${malas} figuras`} en un sitio que no es el suyo.`;
    if (mal && tipo === 'cuadri') msg += ` Por ejemplo, una de las del sello rojo va en ${NOMBRE_ZONA[mal.bueno]}. Toca cualquier figura para ver su pasaporte.`;
    if (tipo === 'triangulos') { const vacios = destinos.filter((c) => !c.querySelector('.pasajero')).length; if (vacios) msg += ` ${vacios === 1 ? 'Un cajón se ha quedado vacío' : `${vacios} cajones se han quedado vacíos`}: ¿existen triángulos así?`; }
    ctx.fin(estrellas, msg + (d.explica ? ' ' + d.explica : ''));
  }
}

/* el sello de aduana: baja sobre cada figura, deja la marca y sigue (cada vez más rápido) */
const SELLO_SVG = `<svg viewBox="0 0 120 150" width="120" height="150" aria-hidden="true"><g stroke="#1b1e3a" stroke-width="4" stroke-linejoin="round">
  <ellipse cx="60" cy="24" rx="26" ry="22" fill="#e8417a"/><path d="M50 22 q6 -10 16 -6" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="5" stroke-linecap="round"/>
  <path d="M48 44 h24 l6 50 h-36z" fill="#c98a4b"/><path d="M54 52 l-2 36" stroke="#e7b37b" stroke-width="4"/>
  <rect x="14" y="94" width="92" height="30" rx="8" fill="#ffc531"/><rect x="20" y="124" width="80" height="18" rx="4" fill="#3b3f63"/></g></svg>`;
function selloAduana() {
  const n = el('div', { class: 'sello-aduana', html: SELLO_SVG });
  const sombra = el('div', { class: 'sombra-sello' });
  document.body.append(sombra, n);
  const lento = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const W = 150, H = 188, BASE = 178; // la goma del sello está a 178 px de su borde de arriba
  gsap.set(n, { x: innerWidth + 40, y: -60, rotation: 18 });
  gsap.set(sombra, { x: innerWidth + 40, y: 200, opacity: 0 });
  // la sombra crece y se aclara cuanto más alto va el sello
  const sombraEn = (cx, cy, alto, d, ease = 'power2.inOut') => ({ x: cx - 60, y: cy - 16, scale: 1 + alto / 260, opacity: Math.max(0.12, 0.55 - alto / 500), duration: d, ease });
  return {
    estampa: (objetivo, ok, k, total) => new Promise((listo) => {
      const r = objetivo.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const marca = () => { objetivo.querySelector('.marca-tinta')?.remove(); objetivo.append(el('span', { class: 'marca-tinta ' + (ok ? 'si' : 'no'), style: { '--r': (Math.random() * 30 - 22).toFixed(0) + 'deg' }, text: ok ? '✓' : '✗' })); };
      if (lento) { marca(); return setTimeout(listo, 120); }
      const v = Math.max(0.45, 1 - k / Math.max(6, total + 2)); // acelera
      const tl = gsap.timeline({ onComplete: listo });
      tl.to(n, { x: cx - W / 2, y: cy - BASE - 90, rotation: -5, duration: 0.3 * v, ease: 'power2.inOut' })
        .to(sombra, sombraEn(cx, cy, 90, 0.3 * v), '<')
        .to(n, { y: cy - BASE - 110, rotation: 0, duration: 0.09 * v, ease: 'power1.out' })
        .to(sombra, sombraEn(cx, cy, 110, 0.09 * v), '<')
        .to(n, { y: cy - BASE + 4, duration: 0.075, ease: 'power4.in' })
        .to(sombra, { ...sombraEn(cx, cy, 0, 0.075, 'power4.in') }, '<')
        .add(() => {
          marca();
          gsap.fromTo(n, { scaleY: 0.86, scaleX: 1.07, transformOrigin: '50% 100%' }, { scaleY: 1, scaleX: 1, duration: 0.3, ease: 'elastic.out(1.2,0.4)' });
          const z = objetivo.closest('.zona-clasificar,.diagrama-caja'); if (z) gsap.fromTo(z, { y: 4 }, { y: 0, duration: 0.35, ease: 'elastic.out(1,0.3)' });
          chispasEn(objetivo, ok ? 6 : 0, ok ? '#1b8f4e' : undefined);
        })
        .to(n, { y: cy - BASE - 70, duration: 0.14 * v, ease: 'power2.out' }, '+=0.05')
        .to(sombra, sombraEn(cx, cy, 70, 0.14 * v, 'power2.out'), '<');
    }),
    vete: () => new Promise((listo) => {
      if (lento) { n.remove(); sombra.remove(); return listo(); }
      gsap.to(sombra, { opacity: 0, duration: 0.3 });
      gsap.to(n, { x: innerWidth + 80, y: -260, rotation: 30, duration: 0.45, ease: 'power2.in', onComplete: () => { n.remove(); sombra.remove(); listo(); } });
    }),
  };
}
// entrada de cada ronda: las figuras caen en la bandeja una tras otra y el estuche se abre
function entrada(items, zona) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nodos = items.map((it) => it.b);
  gsap.from(nodos, { y: -320, x: () => gsap.utils.random(-140, 60), rotation: () => gsap.utils.random(-70, 70), opacity: 0, duration: 0.6, ease: 'back.out(1.5)', delay: 0.15,
    stagger: { each: 0.07, onComplete() { suena('pon'); } }, clearProps: 'transform,opacity' });
  const tir = zona.querySelector('.tirador');
  if (tir) { gsap.from(tir, { x: -760, duration: 0.8, ease: 'power3.out', delay: 0.1, onStart: () => suena('cremallera') }); }
  const bols = zona.querySelectorAll('.bolsillo,.cajon-tri,.bolsillo-svg');
  if (bols.length) gsap.from(bols, { y: 18, opacity: 0, duration: 0.45, ease: 'back.out(1.7)', stagger: 0.06, delay: 0.25, clearProps: 'transform,opacity' });
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
