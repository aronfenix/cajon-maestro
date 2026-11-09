// Piezas comunes de las casetas de la feria: campos numéricos, cifras sueltas y cuentas de intentos.
import { el, num } from './nucleo.js';

export const T = '#1b1e3a';
export const lee = (input) => { const t = String(input.value).replace(/[\s.]/g, ''); return t === '' || !/^\d+$/.test(t) ? null : Number(t); };
export function campo(etiqueta, ancho = 6, extra = {}) {
  const i = el('input', { class: 'campo-num', inputmode: 'numeric', autocomplete: 'off', 'aria-label': etiqueta, maxlength: 9, style: { width: ancho + 'ch' }, ...extra });
  i.addEventListener('input', () => { i.value = i.value.replace(/[^\d]/g, ''); i.classList.remove('mal', 'bien'); });
  return i;
}
// el número partido en cifras, para poder resaltar la primera, la segunda…
export function cifras(n, cls = 'cifra') {
  const s = String(n);
  return s.split('').map((c, k) => el('span', { class: cls + (s.length >= 4 && k === s.length - 3 ? ' miles' : ''), 'data-k': k, 'data-p': s.length - 1 - k, text: c }));
}
// 1.º intento → 3 estrellas, 2.º → 2, 3.º → 1
export const porIntento = (n) => Math.max(0, 4 - n);
export const dist = (a, b) => Math.abs(a - b);
export { num };
// todas las ordenaciones de k cifras de una lista (sin empezar por 0)
export function numerosCon(lista, k = lista.length) {
  const out = new Set();
  const va = (resto, pref) => {
    if (pref.length === k) { if (pref[0] !== 0) out.add(Number(pref.join(''))); return; }
    resto.forEach((c, i) => va(resto.filter((_, j) => j !== i), [...pref, c]));
  };
  va(lista, []);
  return [...out].sort((a, b) => a - b);
}
// al pulsar Intro en un campo, dispara el botón
export const conIntro = (input, fn) => input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); fn(); } });
