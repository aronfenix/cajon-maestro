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
};

export function portada(config, { dibuja, POSES, quien, progreso = 0, record = null, sonar = () => {}, frase: fraseHola = '¿Jugamos?' }) {
  return new Promise((listo) => {
    const lento = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tipo = config.portada?.arte || (config.escena === 'estuche' ? 'estuche' : 'cajon');
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
    const arte = h('div', 'portada-arte', (ARTE[tipo] || ARTE.cajon)(rotulo));
    const fig = h('div', 'portada-figura figura ' + quien, dibuja(quien, POSES.asombro || POSES.quieto));
    const frase = h('div', 'portada-bocadillo bocadillo');
    frase.textContent = config.portada?.frase || fraseHola;
    const pj = h('div', 'portada-personaje'); pj.append(frase, fig);
    capa.append(arte, texto, pj);
    document.body.append(capa);

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
