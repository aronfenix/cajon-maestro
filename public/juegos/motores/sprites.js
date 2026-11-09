// Los personajes dibujados: una tira de fotogramas por acción (personajes/<quien>-<accion>.webp, celdas de 256 × 256).
// sprite(quien, accion) → cadena HTML. Un único reloj anima todos los .sprite de la página.
// Las acciones «de una vez» (celebrar, saludar, idea…) vuelven solas a reposo (o a lo que diga data-luego="hablar:2").
const BASE = new URL('./personajes/', import.meta.url).href;
const GESTO = [125, 125, 125, 125, 125, 125];
export const DUR = { reposo: [1600, 400, 90, 130, 100, 680], baile: Array(12).fill(100) };
export const ACCIONES = ['reposo', 'hablar', 'pensar', 'pista', 'revisar', 'animar', 'celebrar', 'saludar', 'baile', 'escuchar', 'idea', 'esperar', 'sorpresa', 'senalar_izquierda', 'senalar_abajo'];
const UNA_VEZ = new Set(['celebrar', 'saludar', 'idea', 'sorpresa', 'senalar_izquierda', 'senalar_abajo', 'animar', 'revisar']);
// fotograma que se enseña quieto si el sistema pide menos movimiento
const QUIETO = { celebrar: 2, saludar: 2, idea: 3, sorpresa: 2, baile: 3, pista: 3, animar: 2 };
const dur = (a) => DUR[a] ?? GESTO;
export const url = (quien, accion) => `${BASE}${quien}-${accion}.webp`;
const lento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function sprite(quien, accion = 'reposo', { veces, luego, cls = '' } = {}) {
  if (!ACCIONES.includes(accion)) accion = 'reposo';
  const n = dur(accion).length;
  return `<span class="sprite ${cls}" aria-hidden="true" data-quien="${quien}" data-accion="${accion}"${veces ? ` data-veces="${veces}"` : ''}${luego ? ` data-luego="${luego}"` : ''} style="background-image:url('${url(quien, accion)}');--n:${n}"></span>`;
}
// cambiar la acción de un sprite que ya está en la página
export function actua(nodo, accion, { veces, luego } = {}) {
  const s = nodo?.classList?.contains('sprite') ? nodo : nodo?.querySelector?.('.sprite');
  if (!s) return;
  s.dataset.accion = accion; s._t0 = null; s._f = -1;
  if (veces) s.dataset.veces = veces; else delete s.dataset.veces;
  if (luego) s.dataset.luego = luego; else delete s.dataset.luego;
  s.style.backgroundImage = `url('${url(s.dataset.quien, accion)}')`;
  s.style.setProperty('--n', dur(accion).length);
}
const cargadas = new Set();
export function precarga(quien, acciones = ['reposo', 'hablar', 'pista', 'celebrar', 'animar', 'sorpresa', 'pensar', 'idea', 'saludar', 'baile']) {
  return Promise.all(acciones.map((a) => { const u = url(quien, a); if (cargadas.has(u)) return null; cargadas.add(u); return new Promise((ok) => { const i = new Image(); i.onload = i.onerror = ok; i.src = u; }); }));
}

const todos = document.getElementsByClassName('sprite');
function pinta(s, f) {
  if (s._f === f) return;
  s._f = f;
  const n = dur(s.dataset.accion).length;
  s.style.backgroundPositionX = n > 1 ? (f / (n - 1)) * 100 + '%' : '0%';
}
function reloj(t) {
  if (!document.hidden) {
    const quieto = lento();
    for (const s of todos) {
      const a = s.dataset.accion, d = dur(a), ciclo = d.reduce((x, y) => x + y, 0);
      if (quieto) { pinta(s, QUIETO[a] ?? 0); continue; }
      if (s._t0 == null) s._t0 = t;
      let e = t - s._t0;
      const veces = +(s.dataset.veces || (UNA_VEZ.has(a) ? 1 : 0));
      if (veces && e >= ciclo * veces) {
        const [sig, v] = (s.dataset.luego || 'reposo').split(':');
        actua(s, sig, { veces: v });
        continue;
      }
      e %= ciclo;
      let f = 0; while (e >= d[f]) { e -= d[f]; f++; }
      pinta(s, f);
    }
  }
  requestAnimationFrame(reloj);
}
requestAnimationFrame(reloj);
