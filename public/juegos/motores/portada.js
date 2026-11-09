// Portada de cada juego: ilustración del escenario, título que se monta letra a letra, el personaje,
// el objetivo en una frase y «Jugar». Al pulsar, la ilustración «se abre» y empieza el juego.
// Además, ese primer toque desbloquea el sonido del navegador.
// Config opcional: "portada": { "arte": "estuche" | "cajon", "objetivo": "…", "frase": "…" }
import { gsap } from './vendor/gsap.js';

const h = (tag, cls, html = '') => { const n = document.createElement(tag); if (cls) n.className = cls; n.innerHTML = html; return n; };
const T = '#1b1e3a';

// ---------- ilustraciones ----------
const FIGS = [
  ['M0 -34 L34 26 L-34 26Z', '#5ec3ff', '#2b88c4'],
  ['M-26 -26 H26 V26 H-26Z', '#9bd84a', '#5e9a1c'],
  ['M-30 -18 L10 -30 L32 14 L-8 30Z', '#ff7fae', '#c4417a'],
  ['M-34 0 L-12 -28 L34 -28 L12 0Z', '#ff9f45', '#c76512'],
];
const pieza = (k, x, y, r, cls = '') => { const [d, c, o] = FIGS[k]; return `<g class="pieza ${cls}" transform="translate(${x} ${y}) rotate(${r})"><path d="${d}" transform="translate(0 6)" fill="${o}" stroke="${T}" stroke-width="4" stroke-linejoin="round"/><path d="${d}" fill="${c}" stroke="${T}" stroke-width="4" stroke-linejoin="round"/></g>`; };

const ARTE = {
  // estuche cerrado, con la cremallera un poco abierta por la derecha y figuras asomando
  estuche: (r) => `<svg viewBox="0 0 640 400" class="arte arte-estuche" aria-hidden="true">
    <defs>
      <pattern id="p-lona" width="128" height="128" patternUnits="userSpaceOnUse"><image href="../motores/tex/lona.webp" width="128" height="128"/></pattern>
      <pattern id="p-dientes" width="10" height="20" patternUnits="userSpaceOnUse"><rect x="1.5" y="3" width="7" height="14" rx="2.5" fill="#e6e9f2" stroke="${T}" stroke-width="1.6"/></pattern>
      <filter id="p-sombra" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="20" stdDeviation="12" flood-color="#04140d" flood-opacity=".55"/></filter>
      <clipPath id="p-boca"><path d="M120 150 Q320 118 540 150 L540 172 Q320 140 120 172Z"/></clipPath>
    </defs>
    <g class="estuche-cuerpo" filter="url(#p-sombra)">
      <path d="M70 170 Q60 110 120 104 L520 104 Q580 110 570 170 L560 300 Q556 346 500 350 L140 350 Q84 346 80 300Z" fill="#ffc531" stroke="${T}" stroke-width="5" stroke-linejoin="round"/>
    </g>
    <path d="M70 170 Q60 110 120 104 L520 104 Q580 110 570 170 L560 300 Q556 346 500 350 L140 350 Q84 346 80 300Z" fill="url(#p-lona)" style="mix-blend-mode:multiply" opacity=".85"/>
    <path d="M86 300 Q90 338 140 340 L500 340 Q550 338 554 300" fill="none" stroke="${T}" stroke-opacity=".35" stroke-width="3" stroke-dasharray="10 8"/>
    <path d="M100 160 Q320 128 540 160" fill="none" stroke="#1c3a96" stroke-width="30" stroke-linecap="round"/>
    <path d="M100 160 Q320 128 540 160" fill="none" stroke="url(#p-dientes)" stroke-width="12"/>
    <path d="M100 160 Q320 128 540 160" fill="none" stroke="#e6e9f2" stroke-width="10" stroke-dasharray="5 4"/>
    <g class="abertura">${pieza(0, 470, 128, 14)}${pieza(2, 512, 136, -18)}</g>
    <g class="tirador-portada" transform="translate(150 146)"><rect x="-22" y="-14" width="44" height="28" rx="8" fill="#c9cfdd" stroke="${T}" stroke-width="4"/><rect x="-11" y="8" width="22" height="58" rx="10" fill="#e8417a" stroke="${T}" stroke-width="4"/><circle cx="0" cy="52" r="5" fill="#ffc531" stroke="${T}" stroke-width="3"/></g>
    ${r ? `<g transform="rotate(-4 320 250)"><rect x="${320 - (r.length * 11 + 36)}" y="220" width="${2 * (r.length * 11 + 36)}" height="54" rx="6" fill="#fffaf0" stroke="${T}" stroke-width="4"/><path d="M${320 - (r.length * 11 + 22)} 232 v30 M${320 + (r.length * 11 + 22)} 232 v30" stroke="#e8417a" stroke-width="4" stroke-dasharray="5 5" stroke-linecap="round"/><text x="320" y="258" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="28" fill="${T}">${r}</text></g>` : ''}
    <g class="sueltas">${pieza(1, 96, 372, -12)}${pieza(3, 600, 360, 20)}</g>
  </svg>`,
  // frente de un cajón de madera con su tirador y su tarjetero
  cajon: (r) => `<svg viewBox="0 0 640 400" class="arte arte-cajon" aria-hidden="true">
    <defs>
      <pattern id="p-madera" width="512" height="256" patternUnits="userSpaceOnUse"><image href="../motores/tex/madera.webp" width="512" height="256"/></pattern>
      <filter id="p-sombra2" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="20" stdDeviation="12" flood-color="#2a1500" flood-opacity=".5"/></filter>
    </defs>
    <g class="cajon-frente" filter="url(#p-sombra2)"><rect x="60" y="90" width="520" height="250" rx="18" fill="#d9ad72" stroke="${T}" stroke-width="5"/></g>
    <rect x="60" y="90" width="520" height="250" rx="18" fill="url(#p-madera)" style="mix-blend-mode:multiply"/>
    <rect x="80" y="110" width="480" height="210" rx="10" fill="none" stroke="${T}" stroke-opacity=".3" stroke-width="4"/>
    <g transform="translate(320 170)"><rect x="-80" y="-30" width="160" height="60" rx="6" fill="#c9cfdd" stroke="${T}" stroke-width="4"/><rect x="-66" y="-18" width="132" height="36" rx="3" fill="#fffaf0" stroke="${T}" stroke-width="3"/><text y="9" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="${r.length > 6 ? 18 : 24}" fill="${T}">${r}</text></g>
    <g transform="translate(320 262)"><path d="M-70 0 q0 -26 26 -26 h88 q26 0 26 26" fill="none" stroke="${T}" stroke-width="14" stroke-linecap="round"/><path d="M-70 0 q0 -26 26 -26 h88 q26 0 26 26" fill="none" stroke="#ffc531" stroke-width="8" stroke-linecap="round"/></g>
    <g class="abertura">${pieza(0, 150, 84, -10)}${pieza(2, 480, 80, 16)}${pieza(1, 420, 76, -6)}</g>
    <g class="sueltas">${pieza(3, 100, 372, -12)}${pieza(1, 586, 356, 18)}</g>
  </svg>`,
  // bandeja de puzle con un hueco y la pieza encima, a punto de girar
  puzle: () => `<svg viewBox="0 0 640 400" class="arte arte-puzle" aria-hidden="true">
    <defs><pattern id="p-carton" width="128" height="128" patternUnits="userSpaceOnUse"><image href="../motores/tex/cartulina.webp" width="128" height="128"/></pattern>
      <filter id="p-sombra3" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="18" stdDeviation="12" flood-color="#0a0020" flood-opacity=".55"/></filter>
      <clipPath id="p-h1"><path d="M140 170 h120 v60 h-60 v120 h-60z"/></clipPath><clipPath id="p-h2"><path d="M330 160 h180 v60 h-120 v60 h-60z"/></clipPath></defs>
    <g filter="url(#p-sombra3)"><rect x="80" y="100" width="480" height="280" rx="26" fill="#c99a63" stroke="${T}" stroke-width="5"/></g>
    <rect x="80" y="100" width="480" height="280" rx="26" fill="url(#p-carton)" style="mix-blend-mode:multiply"/>
    <path d="M140 170 h120 v60 h-60 v120 h-60z" fill="#3a2412"/><g clip-path="url(#p-h1)"><path d="M140 170 h120 v60 h-60 v120 h-60z" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="18" transform="translate(6 8)"/></g><path d="M140 170 h120 v60 h-60 v120 h-60z" fill="none" stroke="${T}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M330 160 h180 v60 h-120 v60 h-60z" fill="#3a2412"/><g clip-path="url(#p-h2)"><path d="M330 160 h180 v60 h-120 v60 h-60z" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="18" transform="translate(6 8)"/></g><path d="M330 160 h180 v60 h-120 v60 h-60z" fill="none" stroke="${T}" stroke-width="5" stroke-linejoin="round"/>
    <g class="pieza-portada" transform="translate(556 92)"><g class="gira-portada"><g transform="translate(-60 -90)"><path d="M0 0 h60 v120 h60 v60 h-120z" fill="#c4417a" transform="translate(0 7)" stroke="${T}" stroke-width="5" stroke-linejoin="round"/><path d="M0 0 h60 v120 h60 v60 h-120z" fill="#ff7fae" stroke="${T}" stroke-width="5" stroke-linejoin="round"/></g></g></g>
    <g class="sueltas">${pieza(0, 110, 70, -12)}${pieza(1, 60, 380, 18)}</g>
  </svg>`,
  // corcho con la chincheta clavada, la pieza y su sombra, y el arco que recorrerá
  corcho: () => `<svg viewBox="0 0 640 400" class="arte arte-corcho" aria-hidden="true">
    <defs><pattern id="p-corcho" width="160" height="160" patternUnits="userSpaceOnUse"><image href="../motores/tex/corcho.webp" width="160" height="160"/></pattern>
      <filter id="p-sombra4" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="18" stdDeviation="12" flood-color="#2a1500" flood-opacity=".5"/></filter></defs>
    <g filter="url(#p-sombra4)"><rect x="60" y="40" width="520" height="340" rx="18" fill="#8a5a26" stroke="${T}" stroke-width="5"/></g>
    <rect x="80" y="60" width="480" height="300" rx="8" fill="url(#p-corcho)" stroke="${T}" stroke-width="4"/>
    <path d="M360 140 h80 v40 h-40 v80 h-40z" fill="rgba(40,15,0,.38)" stroke="rgba(40,15,0,.6)" stroke-width="4" stroke-dasharray="10 7"/>
    <path d="M300 220 a80 80 0 0 1 60 -80" fill="none" stroke="#fffdf6" stroke-width="5" stroke-dasharray="3 9" stroke-linecap="round"/>
    <g class="pieza-portada"><g class="gira-portada"><path d="M220 180 h40 v80 h40 v40 h-80z" fill="#5e9a1c" transform="translate(0 6)" stroke="${T}" stroke-width="5" stroke-linejoin="round"/><path d="M220 180 h40 v80 h40 v40 h-80z" fill="#9bd84a" stroke="${T}" stroke-width="5" stroke-linejoin="round"/></g></g>
    <g class="pin-portada" transform="translate(300 220)"><ellipse cx="6" cy="8" rx="16" ry="8" fill="rgba(30,10,0,.35)"/><circle r="17" fill="#d7263d" stroke="${T}" stroke-width="4"/><circle cx="-5" cy="-5" r="5" fill="#fff" opacity=".7"/></g>
    <g class="sueltas">${pieza(2, 600, 360, 16)}</g>
  </svg>`,
  // el patio: baldosas vistas desde arriba y una que falta, flotando
  patio: () => {
    let t = '';
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (!(x === 3 && y === 1)) t += `<rect x="${170 + x * 60}" y="${70 + y * 60}" width="56" height="56" rx="6" fill="${(x + y) % 2 ? '#d9824f' : '#c66a3d'}" stroke="${T}" stroke-width="3"/>`;
    return `<svg viewBox="0 0 640 400" class="arte arte-patio" aria-hidden="true"><defs><filter id="p-sp" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="18" stdDeviation="12" flood-color="#2a1000" flood-opacity=".5"/></filter></defs>
    <g filter="url(#p-sp)"><rect x="150" y="50" width="340" height="340" rx="16" fill="#6fbf3a" stroke="${T}" stroke-width="5"/></g>${t}
    <rect x="350" y="130" width="56" height="56" rx="6" fill="#3a2412"/>
    <g class="abertura"><g class="pieza"><rect x="430" y="10" width="56" height="56" rx="6" fill="#d9824f" stroke="${T}" stroke-width="4" transform="rotate(14 458 38)"/></g></g>
    <g class="sueltas">${pieza(1, 90, 360, -12)}${pieza(3, 580, 360, 18)}</g></svg>`;
  },
  // el almacén: cajas de clips apiladas con su etiqueta
  almacen: () => {
    const caja = (x, y, w, h, txt) => `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#d39a5c" stroke="${T}" stroke-width="4"/><path d="M${x} ${y + 18} h${w}" stroke="#a8743c" stroke-width="9"/><rect x="${x + w / 2 - 44}" y="${y + h / 2 - 8}" width="88" height="30" rx="4" fill="#fffdf6" stroke="${T}" stroke-width="3"/><text x="${x + w / 2}" y="${y + h / 2 + 13}" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="18" fill="${T}">${txt}</text></g>`;
    const clips = [0, 1, 2].map((i) => `<g class="pieza"><path d="M${400 + i * 46} ${150 - i * 10} h26 a10 10 0 0 0 0 -20 h-30 a6 6 0 0 0 0 12 h22" fill="none" stroke="#c9cfdd" stroke-width="7" stroke-linecap="round"/></g>`).join('');
    return `<svg viewBox="0 0 640 400" class="arte arte-almacen" aria-hidden="true"><defs><filter id="p-sa" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="18" stdDeviation="12" flood-color="#0a1626" flood-opacity=".55"/></filter></defs>
    <g filter="url(#p-sa)">${caja(120, 230, 200, 140, '×10')}${caja(330, 250, 170, 120, 'CLIPS')}${caja(170, 110, 150, 120, '×100')}</g>
    <g class="abertura">${clips}</g>
    <g class="sueltas">${pieza(0, 560, 360, 14)}</g></svg>`;
  },
  // la merienda: una bandeja con caramelos y la calculadora del Sacapuntas
  merienda: () => {
    const car = (x, y, c, cls) => `<g class="${cls}" transform="translate(${x} ${y})"><path d="M-14 0 L-26 -10 L-24 12Z M14 0 L26 -10 L24 12Z" fill="${c}" stroke="${T}" stroke-width="3"/><ellipse rx="16" ry="13" fill="${c}" stroke="${T}" stroke-width="3.5"/></g>`;
    const col = ['#ff7fae', '#ffc531', '#5ec3ff', '#9bd84a', '#ff9f45', '#b79cff'];
    let cs = '';
    for (let i = 0; i < 6; i++) cs += car(180 + (i % 3) * 64, 210 + Math.floor(i / 3) * 52, col[i], 'caramelo-portada');
    return `<svg viewBox="0 0 640 400" class="arte arte-merienda" aria-hidden="true"><defs><filter id="p-sm" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="18" stdDeviation="12" flood-color="#3a0a00" flood-opacity=".45"/></filter></defs>
    <g filter="url(#p-sm)"><rect x="130" y="170" width="250" height="150" rx="22" fill="#5ec3ff" stroke="${T}" stroke-width="5"/><g transform="rotate(8 500 210)"><rect x="430" y="100" width="140" height="190" rx="18" fill="#3b3f63" stroke="${T}" stroke-width="5"/><rect x="448" y="120" width="104" height="44" rx="6" fill="#b9d8a8" stroke="${T}" stroke-width="3"/><text x="544" y="152" text-anchor="end" font-family="Rotulo,sans-serif" font-weight="900" font-size="26" fill="#1b2a12">17,46</text></g></g>
    ${cs}<g class="abertura">${car(260, 120, '#ff7fae', 'pieza')}${car(330, 100, '#ffc531', 'pieza')}</g>
    <g class="sueltas">${pieza(2, 90, 370, -12)}</g></svg>`;
  },
  // una caseta de feria: toldo de rayas con festón, rótulo con bombillas y premios en el mostrador
  caseta: (r) => {
    const fest = Array.from({ length: 8 }, (_, i) => `<path d="M${80 + i * 60} 150 q30 40 60 0" fill="${i % 2 ? '#fffdf6' : '#e8417a'}" stroke="${T}" stroke-width="4"/>`).join('');
    const rayas = Array.from({ length: 8 }, (_, i) => `<path d="M${80 + i * 60} 150 L${150 + i * 50} 70 L${200 + i * 50} 70 L${140 + i * 60} 150Z" fill="${i % 2 ? '#fffdf6' : '#e8417a'}"/>`).join('');
    const bomb = (n, x0, x1, y) => Array.from({ length: n }, (_, i) => `<circle class="bombilla-portada" cx="${x0 + ((x1 - x0) * i) / (n - 1)}" cy="${y}" r="7" fill="#fff6cf" stroke="${T}" stroke-width="2.5"/>`).join('');
    const ancho = Math.max(150, (r || '').length * 22 + 50);
    const premio = (x, y, c, k) => k === 0
      ? `<g class="pieza" transform="translate(${x} ${y})"><circle r="26" fill="${c}" stroke="${T}" stroke-width="4"/><circle cx="-16" cy="-20" r="10" fill="${c}" stroke="${T}" stroke-width="4"/><circle cx="16" cy="-20" r="10" fill="${c}" stroke="${T}" stroke-width="4"/><circle cx="-8" cy="-4" r="3.5" fill="${T}"/><circle cx="8" cy="-4" r="3.5" fill="${T}"/><ellipse cy="8" rx="7" ry="5" fill="#fffdf6" stroke="${T}" stroke-width="2.5"/></g>`
      : k === 1 ? `<g class="pieza" transform="translate(${x} ${y})"><path d="M0 34 V-6" stroke="${T}" stroke-width="3"/><ellipse cy="-28" rx="22" ry="26" fill="${c}" stroke="${T}" stroke-width="4"/><path d="M-8 -40 q-6 8 -4 18" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/></g>`
      : `<g class="pieza" transform="translate(${x} ${y}) rotate(-8)"><rect x="-30" y="-16" width="60" height="32" rx="4" fill="${c}" stroke="${T}" stroke-width="4"/><path d="M-16 -16 v32" stroke="${T}" stroke-width="2.5" stroke-dasharray="4 3"/></g>`;
    return `<svg viewBox="0 0 640 400" class="arte arte-caseta" aria-hidden="true">
    <defs><filter id="p-sc" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="18" stdDeviation="12" flood-color="#05061a" flood-opacity=".6"/></filter>
      <pattern id="p-cart" width="128" height="128" patternUnits="userSpaceOnUse"><image href="../motores/tex/cartulina.webp" width="128" height="128"/></pattern></defs>
    <g filter="url(#p-sc)"><rect x="96" y="140" width="448" height="230" rx="10" fill="#2f5bd3" stroke="${T}" stroke-width="5"/></g>
    <rect x="96" y="140" width="448" height="230" rx="10" fill="url(#p-cart)" style="mix-blend-mode:multiply" opacity=".8"/>
    <rect x="128" y="186" width="384" height="104" rx="8" fill="#1c2150" stroke="${T}" stroke-width="4"/>
    <path d="M128 290 h384 v26 h-384z" fill="#ffc531" stroke="${T}" stroke-width="4"/><path d="M110 316 h420 v20 h-420z" fill="#c98f00" stroke="${T}" stroke-width="4"/>
    <g stroke="${T}" stroke-width="4" stroke-linejoin="round"><path d="M80 150 L150 70 H490 L560 150Z" fill="#e8417a"/>${rayas}</g>${fest}
    <path d="M150 70 H490" stroke="${T}" stroke-width="4"/>
    <g transform="rotate(-3 320 40)"><rect x="${320 - ancho / 2}" y="8" width="${ancho}" height="58" rx="10" fill="#fffdf6" stroke="${T}" stroke-width="5"/>${bomb(Math.max(5, Math.round(ancho / 28)), 320 - ancho / 2 + 14, 320 + ancho / 2 - 14, 16)}
      <text x="320" y="54" text-anchor="middle" font-family="Rotulo,sans-serif" font-weight="900" font-size="30" fill="${T}">${r || 'FERIA'}</text></g>
    <g class="abertura">${premio(200, 262, '#ff9fbf', 0)}${premio(320, 262, '#5ec3ff', 1)}${premio(440, 270, '#ffc531', 2)}</g>
    <g class="sueltas">${premio(80, 372, '#9bd84a', 2)}${premio(584, 360, '#b79cff', 1)}</g>
  </svg>`;
  },
  // recortables: un papel doblado con agujeros y, al otro lado, dónde saldrán
  papel: () => `<svg viewBox="0 0 640 400" class="arte arte-papel" aria-hidden="true"><defs><filter id="p-spp" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="10" dy="18" stdDeviation="12" flood-color="#0a0020" flood-opacity=".5"/></filter></defs>
    <g filter="url(#p-spp)"><path d="M160 70 H320 V350 H160Z" fill="#f3ecdc" stroke="${T}" stroke-width="5"/><path d="M320 70 L470 100 V330 L320 350Z" fill="#fffdf6" stroke="${T}" stroke-width="5"/></g>
    <line x1="320" y1="70" x2="320" y2="350" stroke="${T}" stroke-width="4" stroke-dasharray="12 8"/>
    <circle cx="220" cy="140" r="18" fill="#4b3a8c" stroke="${T}" stroke-width="4"/><circle cx="270" cy="250" r="18" fill="#4b3a8c" stroke="${T}" stroke-width="4"/>
    <g class="abertura"><g class="pieza"><circle cx="420" cy="150" r="18" fill="none" stroke="#e8417a" stroke-width="5" stroke-dasharray="6 5"/></g><g class="pieza"><circle cx="370" cy="255" r="18" fill="none" stroke="#e8417a" stroke-width="5" stroke-dasharray="6 5"/></g></g>
    <g class="sueltas">${pieza(1, 560, 360, 18)}</g></svg>`,
};

// casetas ilustradas de la feria: la caseta recortada y sus objetos sueltos (que saltan al pulsar «Jugar»)
const FER = new URL('./feria/', import.meta.url).href;
const CASETAS = { 'la-tombola': ['tombola', 2], 'el-candado-de-la-taquilla': ['taquilla', 3], 'la-caja-registradora': ['caja', 2], 'la-noria': ['noria', 2] };
const casetaIlustrada = ([n, piezas], titulo) => `<div class="arte arte-caseta-img" aria-hidden="true"><img class="caseta-img" src="${FER}caseta-${n}.webp" alt="" draggable="false">
    <div class="abertura">${Array.from({ length: piezas }, (_, i) => `<img class="pieza pz${i + 1}" src="${FER}pieza-${n}-${i + 1}.webp" alt="" draggable="false">`).join('')}</div></div>`;

export function portada(config, { dibuja, POSES, quien, progreso = 0, record = null, sonar = () => {}, frase: fraseHola = '¿Jugamos?', volver = '../../' }) {
  return new Promise((listo) => {
    const lento = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tipo = config.portada?.arte || ({ estuche: 'estuche', puzle: 'puzle', corcho: 'corcho', patio: 'patio', almacen: 'almacen', merienda: 'merienda', feria: 'caseta' }[config.escena] ?? 'cajon');
    const capa = h('div', 'portada-capa');
    capa.setAttribute('role', 'dialog'); capa.setAttribute('aria-modal', 'true'); capa.setAttribute('aria-label', config.titulo);
    // título letra a letra (las palabras no se parten)
    const titulo = h('h2', 'portada-titulo');
    titulo.setAttribute('aria-label', config.titulo);
    for (const [i, pal] of config.titulo.split(' ').entries()) {
      if (i) titulo.append(' ');
      const w = h('span', 'palabra'); w.setAttribute('aria-hidden', 'true');
      for (const c of pal) { const l = h('span', 'letra'); l.textContent = c; w.append(l); }
      titulo.append(w);
    }
    const etiqueta = h('div', 'portada-etiqueta'); etiqueta.append(titulo);
    const objetivo = h('p', 'portada-objetivo'); objetivo.textContent = config.portada?.objetivo || config.subtitulo || '';
    const jugar = h('button', 'tecla primaria grande portada-jugar');
    jugar.type = 'button'; jugar.textContent = progreso > 0 ? 'Seguir jugando' : 'Jugar';
    const estado = h('p', 'portada-estado');
    if (progreso > 0) estado.innerHTML = `<span class="mini-regla"><i style="width:${Math.max(4, progreso)}%"></i></span> Llevas un ${Math.round(progreso)} %`;
    else if (record) estado.textContent = `Tu récord en esta tablet: ${record} retos`;
    const texto = h('div', 'portada-texto'); texto.append(etiqueta, objetivo, jugar, estado);
    const AREA = { matematicas: 'MATES', lengua: 'LENGUA', naturales: 'NATURALES', sociales: 'SOCIALES' };
    const rotulo = config.portada?.rotulo ?? (tipo === 'cajon' ? AREA[config.area] || 'CAJÓN' : '');
    const caseta = config.escena === 'feria' && CASETAS[location.pathname.split('/').filter(Boolean).pop()];
    const arte = h('div', 'portada-arte', caseta ? casetaIlustrada(caseta) : (ARTE[tipo] || ARTE.cajon)(rotulo));
    const fig = h('div', 'portada-figura figura ' + quien, dibuja(quien, 'saluda', { veces: 2, luego: 'reposo' }));
    const frase = h('div', 'portada-bocadillo bocadillo');
    frase.textContent = config.portada?.frase || fraseHola;
    const pj = h('div', 'portada-personaje'); pj.append(frase, fig);
    const salir = h('a', 'volver con-texto portada-volver', '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Menú</span>');
    salir.href = volver; salir.title = 'Volver al menú';
    capa.append(arte, texto, pj, salir);
    document.body.append(capa);
    // después de saludar, señala el botón de Jugar (a la derecha o a la izquierda, según dónde quede)
    requestAnimationFrame(() => {
      const sp = fig.querySelector('.sprite'), a = fig.getBoundingClientRect(), b = jugar.getBoundingClientRect();
      if (sp && a.width) sp.dataset.luego = b.left + b.width / 2 > a.left + a.width / 2 ? 'senalar_derecha:2' : 'senalar_izquierda:2';
    });

    if (!lento) {
      const letras = titulo.querySelectorAll('.letra');
      const tl = gsap.timeline();
      tl.from(arte, { x: 220, rotation: 9, opacity: 0, duration: 0.7, ease: 'back.out(1.3)' })
        .from(etiqueta, { y: -40, rotation: -8, opacity: 0, duration: 0.45, ease: 'back.out(2)' }, 0.1)
        .from(letras, { y: -70, rotation: () => gsap.utils.random(-40, 40), opacity: 0, duration: 0.5, ease: 'back.out(2.2)', stagger: 0.035 }, 0.25)
        .from(objetivo, { y: 16, opacity: 0, duration: 0.4 }, '-=0.25')
        .from(jugar, { scale: 0.4, opacity: 0, duration: 0.45, ease: 'back.out(2.4)' }, '-=0.2')
        .from(estado, { opacity: 0, duration: 0.3 }, '<')
        .from(fig, { y: 180, duration: 0.6, ease: 'back.out(1.6)' }, 0.5)
        .from(frase, { scale: 0.3, opacity: 0, transformOrigin: '85% 100%', duration: 0.35, ease: 'back.out(2)' }, 1.05)
        .from(arte.querySelectorAll('.abertura .pieza'), { y: 40, opacity: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.12 }, 0.7);
      // las piezas que asoman se mueven un poco y el botón respira: algo pasa aunque no toques nada
      tl.add(() => {
        gsap.to(arte.querySelectorAll('.abertura .pieza'), { y: '-=8', duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: 0.3 });
        gsap.fromTo(jugar, { scale: 1 }, { scale: 1.05, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      });
    }

    jugar.onclick = () => {
      sonar('clic');
      gsap.killTweensOf(jugar); gsap.set(jugar, { scale: 0.96 });
      if (lento) { capa.remove(); return listo(); }
      jugar.style.pointerEvents = 'none';
      const tl = gsap.timeline({ onComplete: () => { capa.remove(); listo(); } });
      if (tipo === 'estuche') {
        // la cremallera corre, las figuras saltan fuera y el estuche se acerca
        const tir = arte.querySelector('.tirador-portada');
        tl.add(() => sonar('cremallera'))
          .to(tir, { x: 330, duration: 0.55, ease: 'power2.inOut' })
          .to(arte.querySelectorAll('.abertura .pieza'), { y: -260, x: () => gsap.utils.random(-200, 200), rotation: () => gsap.utils.random(-200, 200), opacity: 0, duration: 0.6, ease: 'power2.in', stagger: 0.06 }, '-=0.15');
      } else if (tipo === 'puzle') {
        // la pieza gira un cuarto y cae en su hueco
        tl.to(arte.querySelector('.gira-portada'), { rotation: 90, svgOrigin: '0 0', duration: 0.45, ease: 'back.out(1.6)', onStart: () => sonar('clic') })
          .to(arte.querySelector('.pieza-portada'), { x: -100, y: 80, duration: 0.4, ease: 'power2.in', onComplete: () => sonar('pon') });
      } else if (tipo === 'corcho') {
        tl.to(arte.querySelector('.gira-portada'), { rotation: 90, svgOrigin: '300 220', duration: 0.8, ease: 'power2.inOut', onStart: () => sonar('clic'), onComplete: () => sonar('pon') });
      } else if (caseta) {
        // la caseta se ilumina y sus objetos saltan del mostrador
        tl.to(arte.querySelector('.caseta-img'), { filter: 'brightness(1.3) saturate(1.15)', duration: 0.18, yoyo: true, repeat: 1, onStart: () => sonar('clic') })
          .to(arte.querySelectorAll('.abertura .pieza'), { y: -260, x: () => gsap.utils.random(-120, 120), rotation: () => gsap.utils.random(-160, 160), opacity: 0, duration: 0.6, ease: 'power2.in', stagger: 0.06 });
      } else if (tipo === 'caseta') {
        // se encienden las bombillas del rótulo, una detrás de otra, y salen volando los premios
        tl.to(arte.querySelectorAll('.bombilla-portada'), { fill: '#ffd23f', duration: 0.05, stagger: 0.05, onStart: () => sonar('clic') })
          .to(arte.querySelectorAll('.abertura .pieza'), { y: -240, rotation: () => gsap.utils.random(-160, 160), opacity: 0, duration: 0.55, ease: 'power2.in', stagger: 0.05 });
      } else {
        tl.to(arte, { y: 20, duration: 0.15, ease: 'power1.in' })
          .to(arte.querySelectorAll('.abertura .pieza'), { y: -240, rotation: () => gsap.utils.random(-160, 160), opacity: 0, duration: 0.55, ease: 'power2.in', stagger: 0.05 });
      }
      tl.to(texto, { x: -120, opacity: 0, duration: 0.35, ease: 'power2.in' }, '-=0.45')
        .to(pj, { y: 220, duration: 0.35, ease: 'power2.in' }, '<')
        .to(arte, { scale: 1.7, opacity: 0, duration: 0.45, ease: 'power2.in' }, '-=0.15')
        .to(capa, { opacity: 0, duration: 0.25 }, '-=0.2');
    };
  });
}
