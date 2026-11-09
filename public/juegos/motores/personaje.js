import { sprite } from './sprites.js';
// Personaje con esqueleto: el cuerpo, la cara y los brazos son parámetros, no dibujos.
// Una pose es un objeto; cualquier mezcla de parámetros es una viñeta nueva y se puede animar entre poses.
// dibuja(tipo, pose) → cadena SVG (viewBox 0 0 200 250)

const T = '#000';
const CUERPOS = {
  goma: {
    ancho: 100, alto: 122, hombro: 0.66, cara: 0.25, boca: 19,
    pinta: (w, h, x, y, p) => `
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="#f3ede1" stroke="${T}" stroke-width="4"/>
      <path d="M${x + w - 18} ${y + 3} q 12 2 15 15" fill="none" stroke="#d9cfbd" stroke-width="5" stroke-linecap="round"/>
      <path d="M${x} ${y + h * 0.56} h${w} v${h * 0.44 - 16} a16 16 0 0 1 -16 16 h${-(w - 32)} a16 16 0 0 1 -16 -16z" fill="var(--c1,#1e3fb0)" stroke="${T}" stroke-width="4"/>
      <path d="M${x} ${y + h * 0.56 + 12} h${w}" stroke="#fff" stroke-width="5"/>
      <path d="M${x} ${y + h * 0.56 + 22} h${w}" stroke="var(--c2,#c8201a)" stroke-width="5"/>
      <text x="${x + w / 2}" y="${y + h - 16}" text-anchor="middle" font-family="Rotulo,Impact,sans-serif" font-weight="800" font-size="17" fill="#fff">GOMA</text>
      ${p.miga ? `<circle cx="${x + w + 8}" cy="${y + h - 4}" r="3" fill="#e6dccb" stroke="${T}" stroke-width="1.5"/><circle cx="${x + w + 16}" cy="${y + h}" r="2" fill="#e6dccb" stroke="${T}" stroke-width="1.5"/>` : ''}`,
  },
  boli: {
    ancho: 66, alto: 168, hombro: 0.55, cara: 0.42,
    pinta: (w, h, x, y) => `
      <path d="M${x + 8} ${y + h - 18} L${x + w / 2} ${y + h + 14} L${x + w - 8} ${y + h - 18}Z" fill="#e8e1d2" stroke="${T}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M${x + w / 2 - 4} ${y + h + 6} L${x + w / 2} ${y + h + 15} L${x + w / 2 + 4} ${y + h + 6}Z" fill="${T}"/>
      <rect x="${x}" y="${y + 30}" width="${w}" height="${h - 44}" rx="12" fill="#f5f7f6" stroke="${T}" stroke-width="4"/>
      <rect x="${x + w / 2 - 5}" y="${y + 36}" width="10" height="${h - 58}" rx="5" fill="var(--c2,#c8201a)" opacity=".28"/>
      <rect x="${x - 3}" y="${y}" width="${w + 6}" height="44" rx="14" fill="var(--c2,#c8201a)" stroke="${T}" stroke-width="4"/>
      <path d="M${x + w - 6} ${y + 8} h12 v${h * 0.42} q0 8 -7 8" fill="none" stroke="${T}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M${x + 8} ${y + 9} h18" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".6"/>`,
  },
  fosforito: {
    ancho: 92, alto: 150, hombro: 0.58, cara: 0.47,
    pinta: (w, h, x, y) => `
      <path d="M${x + 14} ${y + h - 6} L${x + 24} ${y + h + 16} L${x + w - 24} ${y + h + 16} L${x + w - 14} ${y + h - 6}Z" fill="var(--c1,#ffd23f)" stroke="${T}" stroke-width="4" stroke-linejoin="round"/>
      <rect x="${x}" y="${y + 26}" width="${w}" height="${h - 26}" rx="18" fill="#f4f5f1" stroke="${T}" stroke-width="4"/>
      <rect x="${x + 10}" y="${y + h - 36}" width="${w - 20}" height="14" rx="4" fill="var(--c1,#ffd23f)" stroke="${T}" stroke-width="3"/>
      <rect x="${x - 2}" y="${y}" width="${w + 4}" height="46" rx="16" fill="var(--c1,#ffd23f)" stroke="${T}" stroke-width="4"/>
      <path d="M${x + 12} ${y + 10} h22" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".55"/>`,
  },
};

const BOCAS = {
  sonrisa: (x, y) => `<path d="M${x - 14} ${y} q14 12 28 0" fill="none" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`,
  ladeada: (x, y) => `<path d="M${x - 13} ${y + 3} q12 5 26 -5" fill="none" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`,
  plana: (x, y) => `<path d="M${x - 11} ${y + 2} h22" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`,
  o: (x, y) => `<ellipse cx="${x}" cy="${y + 3}" rx="7" ry="8" fill="#7a1010" stroke="${T}" stroke-width="3.5"/>`,
  grande: (x, y) => `<path d="M${x - 17} ${y - 2} q17 26 34 0z" fill="#7a1010" stroke="${T}" stroke-width="3.5" stroke-linejoin="round"/><path d="M${x - 8} ${y + 8} q8 5 16 0" fill="#ff8ab0"/>`,
  mueca: (x, y) => `<path d="M${x - 14} ${y + 4} q7 -7 14 0 q7 7 14 0" fill="none" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`,
};

function ojo(cx, cy, p, lado) {
  const tipo = p.ojos ?? 'normal';
  if (tipo === 'feliz') return `<path d="M${cx - 10} ${cy + 3} q10 -14 20 0" fill="none" stroke="${T}" stroke-width="4.5" stroke-linecap="round"/>`;
  if (tipo === 'cerrado') return `<path d="M${cx - 10} ${cy} h20" stroke="${T}" stroke-width="4.5" stroke-linecap="round"/>`;
  const rx = tipo === 'grande' ? 13 : 11, ry = tipo === 'grande' ? 15 : 13;
  const mx = (p.mira?.[0] ?? 0) * 5, my = (p.mira?.[1] ?? 0) * 5;
  const parpado = p.parpado ?? 0; // 0 abierto, 1 cerrado
  let s = `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#fff" stroke="${T}" stroke-width="4"/>`;
  s += `<g class="pupila"><circle cx="${cx + mx}" cy="${cy + my + 1}" r="${tipo === 'grande' ? 6.5 : 5.5}" fill="${T}"/><circle cx="${cx + mx - 2}" cy="${cy + my - 2}" r="1.8" fill="#fff"/></g>`;
  if (parpado > 0) s += `<path d="M${cx - rx - 2} ${cy - ry - 2} h${2 * rx + 4} v${(2 * ry + 4) * parpado} h${-(2 * rx + 4)}z" fill="var(--piel,#f3ede1)" stroke="none"/><path d="M${cx - rx} ${cy - ry + (2 * ry) * parpado} h${2 * rx}" stroke="${T}" stroke-width="4" stroke-linecap="round"/>`;
  return s;
}
function ceja(cx, cy, ang, alto, lado) {
  const a = ((lado === 'i' ? -ang : ang) * Math.PI) / 180;
  const dx = Math.cos(a) * 11, dy = Math.sin(a) * 11;
  const y = cy - alto;
  return `<path d="M${cx - dx} ${y + dy} L${cx + dx} ${y - dy}" stroke="${T}" stroke-width="5" stroke-linecap="round"/>`;
}
// Brazo de goma: del hombro a la mano con una curva; la mano es un guante
function brazo(sx, sy, ang, largo, curva, lado, guante = '#fff') {
  const a = (ang * Math.PI) / 180;
  const hx = sx + Math.cos(a) * largo * (lado === 'i' ? -1 : 1), hy = sy - Math.sin(a) * largo;
  const mx = (sx + hx) / 2 + curva * (lado === 'i' ? -1 : 1) * Math.sin(a) * 0.6, my = (sy + hy) / 2 + curva * Math.cos(a) * 0.6;
  return `<path d="M${sx} ${sy} Q${mx} ${my} ${hx} ${hy}" fill="none" stroke="${T}" stroke-width="5" stroke-linecap="round"/>
    <circle cx="${hx}" cy="${hy}" r="10" fill="${guante}" stroke="${T}" stroke-width="4"/>`;
}

export const POSES = {
  baile: { brazos: [[64, 52, -14], [64, 52, -14]], ojos: 'feliz', boca: 'grande', salto: 12 },
  saluda: { brazos: [[-70, 44, 8], [64, 52, -14]], ojos: 'feliz', boca: 'sonrisa' },
  idea: { brazos: [[-70, 44, 8], [70, 40, -30]], ojos: 'grande', boca: 'o', alto: 6 },
  habla: { brazos: [[-60, 44, 6], [20, 50, -6]], ojos: 'normal', boca: 'sonrisa' },
  quieto: { brazos: [[-70, 44, 8], [-70, 44, 8]], ojos: 'normal', mira: [0.3, 0], cejas: [4, 4], boca: 'ladeada' },
  pista: { brazos: [[-60, 44, 6], [62, 56, -10]], ojos: 'grande', mira: [0.6, -0.6], cejas: [-8, -8], alto: 4, boca: 'o', lean: 4 },
  celebra: { brazos: [[64, 52, -14], [64, 52, -14]], ojos: 'feliz', cejas: [-12, -12], boca: 'grande', salto: 12, estira: 1.05 },
  seguro: { brazos: [[-20, 30, 30], [-20, 30, 30]], ojos: 'normal', mira: [0, 0], parpado: 0.38, cejas: [12, -14], boca: 'plana', lean: -3 },
  piensa: { brazos: [[-70, 44, 8], [30, 34, 40]], ojos: 'normal', mira: [0.7, -0.8], cejas: [-6, 10], boca: 'mueca', lean: 3 },
  animo: { brazos: [[-66, 44, 8], [20, 50, -6]], ojos: 'feliz', cejas: [-4, -4], boca: 'sonrisa', miga: false },
  asombro: { brazos: [[40, 44, -20], [40, 44, -20]], ojos: 'grande', mira: [0, 0], cejas: [-16, -16], alto: 8, boca: 'o', salto: 4 },
  borra: { brazos: [[-10, 50, 10], [-10, 50, 10]], ojos: 'cerrado', cejas: [8, 8], boca: 'mueca', lean: 10, miga: true },
};
POSES.izquierda = POSES.derecha = POSES.abajo = POSES.espera = POSES.escucha = POSES.seguro;

// Las poses de siempre, traducidas a las acciones de los personajes dibujados
const ACCION_DE = { quieto: 'reposo', pista: 'pista', celebra: 'celebrar', seguro: 'hablar', piensa: 'pensar', animo: 'animar', asombro: 'sorpresa', borra: 'revisar', baile: 'baile', saluda: 'saludar', idea: 'idea', habla: 'hablar', escucha: 'escuchar', espera: 'esperar', revisa: 'revisar', abajo: 'senalar_abajo', izquierda: 'senalar_izquierda', derecha: 'senalar_derecha' };
export function dibuja(tipo, pose = POSES.quieto, opciones) {
  const nombre = typeof pose === 'string' ? pose : Object.keys(POSES).find((k) => POSES[k] === pose) ?? 'quieto';
  return sprite(tipo, ACCION_DE[nombre] ?? nombre, opciones);
}
// el esqueleto paramétrico de antes (ya no se usa, pero se queda por si hace falta un dibujo vectorial)
export function dibujaSVG(tipo, pose = POSES.quieto) {
  const c = CUERPOS[tipo];
  const p = { ...POSES.quieto, ...pose };
  const est = p.estira ?? 1;
  const w = c.ancho / Math.sqrt(est), h = c.alto * est;
  const x = 100 - w / 2, y = 205 - h - (p.salto ?? 0) - (tipo === 'boli' ? 16 : tipo === 'fosforito' ? 16 : 0);
  const sy = y + h * c.hombro, cy = y + h * c.cara;
  const ex = w * 0.22;
  const piel = tipo === 'goma' ? '#f3ede1' : '#f5f7f6';
  const guante = '#fff';
  const [bi, bd] = p.brazos;
  const cuerpo = `<g transform="rotate(${p.lean ?? 0} 100 205)" style="--piel:${piel}">
    ${brazo(x + 3, sy, bi[0], bi[1], bi[2], 'i', guante)}
    ${brazo(x + w - 3, sy, bd[0], bd[1], bd[2], 'd', guante)}
    <path d="M${100 - 16} ${205 - (p.salto ?? 0) - 2} v${(p.salto ?? 0) ? 6 : 16} M${100 + 16} ${205 - (p.salto ?? 0) - 2} v${(p.salto ?? 0) ? 6 : 16}" stroke="${T}" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="${100 - 22}" cy="${223 - ((p.salto ?? 0) ? p.salto + 8 : 0)}" rx="13" ry="7" fill="${T}"/><ellipse cx="${100 + 22}" cy="${223 - ((p.salto ?? 0) ? p.salto + 8 : 0)}" rx="13" ry="7" fill="${T}"/>
    ${c.pinta(w, h, x, y, p)}
    <g class="ojo">${ojo(100 - ex, cy, p, 'i')}</g><g class="ojo">${ojo(100 + ex, cy, p, 'd')}</g>
    ${ceja(100 - ex, cy, p.cejas[0], 22 + (p.alto ?? 0), 'i')}${ceja(100 + ex, cy, p.cejas[1], 22 + (p.alto ?? 0), 'd')}
    ${(BOCAS[p.boca] || BOCAS.sonrisa)(100, cy + (c.boca ?? 26))}
  </g>`;
  return `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="232" rx="${52 - (p.salto ?? 0)}" ry="8" fill="rgba(0,0,0,.16)"/>${cuerpo}</svg>`;
}
