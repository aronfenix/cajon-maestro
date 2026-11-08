// Pegatinas del álbum: una por juego, un dibujo sencillo que recuerda a lo que se hace en él.
import { el } from './nucleo.js';
const T = '#1b1e3a';
// una pegatina por juego: un dibujo sencillo que recuerda a lo que se hace en él
export const P = (cuerpo, fondo) => `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="#fff" stroke="${T}" stroke-width="3"/><circle cx="50" cy="50" r="39" fill="${fondo}"/>${cuerpo}</svg>`;
export const DIBUJOS = {
  'aduana-del-estuche': P(`<path d="M30 66 L50 30 L70 66Z" fill="#ffc531" stroke="${T}" stroke-width="4" stroke-linejoin="round"/><circle cx="50" cy="56" r="7" fill="none" stroke="#1b8f4e" stroke-width="3.5"/>`, '#ff7fae'),
  'la-goma-elastica': P(`<path d="M30 62 L40 34 L66 40 L70 64Z" fill="none" stroke="#e8417a" stroke-width="7" stroke-linejoin="round"/><circle cx="30" cy="62" r="5" fill="#d7263d" stroke="${T}" stroke-width="2"/><circle cx="40" cy="34" r="5" fill="#d7263d" stroke="${T}" stroke-width="2"/><circle cx="66" cy="40" r="5" fill="#d7263d" stroke="${T}" stroke-width="2"/><circle cx="70" cy="64" r="5" fill="#d7263d" stroke="${T}" stroke-width="2"/>`, '#9bd84a'),
  'quien-es-quien': P(`<text x="50" y="68" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="52" fill="${T}">?</text>`, '#ffc531'),
  'el-puzle-del-rincon': P(`<path d="M30 34 h14 q-3 -9 6 -9 q9 0 6 9 h14 v14 q9 -3 9 6 q0 9 -9 6 v14 h-40z" fill="#ff7fae" stroke="${T}" stroke-width="4" stroke-linejoin="round"/>`, '#b79cff'),
  'la-chincheta-que-gira': P(`<path d="M50 30 a20 20 0 1 1 -18 11" fill="none" stroke="${T}" stroke-width="4" stroke-dasharray="5 5"/><circle cx="50" cy="50" r="10" fill="#d7263d" stroke="${T}" stroke-width="3.5"/>`, '#e0ad70'),
  recortables: P(`<path d="M50 24 V76" stroke="${T}" stroke-width="3" stroke-dasharray="6 4"/><circle cx="38" cy="40" r="7" fill="${T}"/><circle cx="62" cy="40" r="7" fill="${T}"/><circle cx="34" cy="62" r="6" fill="${T}"/><circle cx="66" cy="62" r="6" fill="${T}"/>`, '#fffdf6'),
  'la-mudanza': P(`<path d="M26 50 h36 M50 36 l16 14 l-16 14" fill="none" stroke="${T}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`, '#5ec3ff'),
  'gomas-y-chinchetas': P(`<rect x="30" y="30" width="40" height="40" fill="none" stroke="#e8417a" stroke-width="7"/><circle cx="30" cy="30" r="5" fill="#d7263d"/><circle cx="70" cy="30" r="5" fill="#d7263d"/><circle cx="30" cy="70" r="5" fill="#d7263d"/><circle cx="70" cy="70" r="5" fill="#d7263d"/>`, '#e0ad70'),
  'pedidos-del-almacen': P(`<rect x="28" y="36" width="44" height="34" rx="3" fill="#d39a5c" stroke="${T}" stroke-width="4"/><path d="M28 46 h44" stroke="#a8743c" stroke-width="5"/>`, '#5ec3ff'),
  'la-maquina-de-ceros': P(`<text x="50" y="66" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="38" fill="${T}">×10</text>`, '#ffc531'),
  'las-baldosas-del-recreo': P(`<g stroke="${T}" stroke-width="3">${[0, 1, 2].map((y) => [0, 1, 2].map((x) => `<rect x="${32 + x * 12}" y="${32 + y * 12}" width="12" height="12" fill="${(x + y) % 2 ? '#d9824f' : '#c66a3d'}"/>`).join('')).join('')}</g>`, '#9bd84a'),
  'la-merienda': P(`<path d="M34 50 L22 40 L24 60Z M66 50 L78 40 L76 60Z" fill="#ff7fae" stroke="${T}" stroke-width="3"/><ellipse cx="50" cy="50" rx="18" ry="14" fill="#ff7fae" stroke="${T}" stroke-width="3.5"/>`, '#ffc531'),
  'el-examen-del-viernes': P(`<path d="M50 24 l7 15 l16 2 l-12 11 l3 16 l-14 -8 l-14 8 l3 -16 l-12 -11 l16 -2z" fill="#ffc531" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/>`, '#e8417a'),
};
export const pegatina = (slug, cls = '') => el('span', { class: 'pegatina-album ' + cls, html: DIBUJOS[slug] ?? P('', '#ffc531') });

