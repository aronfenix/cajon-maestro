// Mapa de una aventura: el cajón visto desde arriba, con un compartimento por tema y un álbum de pegatinas.
// Es solo una portada: los juegos se pueden jugar sueltos. Cada bloque futuro es otra carpeta con otro mapa.
// Config: { titulo, subtitulo, escena, historia, compartimentos: [{ nombre, quien, material, juegos: [{ slug, titulo }] }], final }
import { el, svg, suena } from './nucleo.js';
import { dibuja, POSES } from './personaje.js';
import { montaEscena, vineta } from './escena.js';
import { gomets, chispasEn, bote } from './efectos.js';
import { gsap } from './vendor/gsap.js';

const T = '#1b1e3a';
const ruta = (slug) => new URL(`../${slug}/`, location.href).pathname;
const lee = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const guarda = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
const hecho = (slug) => !!lee('cajon-hecho:' + ruta(slug));
const lento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

import { DIBUJOS, pegatina } from './pegatinas.js';

export async function montaMapa(c) {
  const X = { sello: 'ORDENADO', hechos: 'ordenados', album: 'Pegatinas', albumTitulo: 'Mis pegatinas', albumTexto: 'Cada juego terminado, una pegatina.', icono: 'el-examen-del-viernes', listo: 'Todo ordenado. Ya puedes hacer el examen.', boton: 'Hacer el examen', repetir: 'Repetir el examen', ...(c.textos || {}) };
  const feria = c.estilo === 'feria';
  document.title = `${c.titulo} · Cajón maestro`;
  document.body.classList.add('juego', 'mapa-cajon');
  const escena = montaEscena(c.escena || 'cajon');
  const visto = lee('cajon-mapa:' + location.pathname);
  const comp = c.compartimentos.map((k) => ({ ...k, conSlug: k.juegos.filter((j) => j.slug), hechos: k.juegos.filter((j) => j.slug && hecho(j.slug)).length }));
  comp.forEach((k) => (k.terminado = k.conSlug.length > 0 && k.hechos === k.conSlug.length));
  const todo = comp.every((k) => k.terminado);
  const abierto = todo || new URLSearchParams(location.search).has('abrir');
  const todos = [...comp.flatMap((k) => k.conSlug), ...(c.final?.slug ? [{ slug: c.final.slug, titulo: c.final.nombre }] : [])];
  const conseguidas = todos.filter((j) => hecho(j.slug));
  const nuevas = conseguidas.filter((j) => !lee('cajon-pegada:' + ruta(j.slug)));
  const ordenados = comp.filter((k) => k.terminado).length;

  // ---------- el cajón
  const cajon = el('div', { class: 'cajon-ilustrado' + (feria ? ' estilo-feria' : '') });
  const nodos = comp.map((k, i) => {
    const sello = k.terminado && el('span', { class: 'sello-ordenado', text: X.sello });
    const fig = el('div', { class: 'figura-comp ' + k.quien, html: dibuja(k.quien, POSES[k.terminado ? 'celebra' : 'quieto']) });
    const lista = el('ul', { class: 'tarjetas-juego' }, k.juegos.map((j, n) => el('li', {}, j.slug
      ? el('a', { class: 'tarjeta-juego' + (hecho(j.slug) ? ' hecho' : ''), href: `../${j.slug}/`, style: { '--r': ((n % 2 ? 1 : -1) * (1 + (n % 3))) + 'deg' } }, el('span', { text: j.titulo }), hecho(j.slug) && pegatina(j.slug, 'mini'))
      : el('span', { class: 'tarjeta-juego futuro', text: j.titulo }))));
    const caja = el('section', { class: `compartimento-cajon mat-${k.material ?? 'cajon'}` + (k.terminado ? ' ordenado' : ''), style: { '--c': k.color } },
      feria && el('div', { class: 'toldo-caseta', 'aria-hidden': 'true' }, el('div', { class: 'bombillas' }, Array.from({ length: 9 }, () => el('i')))),
      el('div', { class: 'cab-comp' }, fig, el('div', { class: 'etiqueta-comp' }, el('h2', { text: k.nombre }), el('p', { text: k.conSlug.length ? `${k.hechos} de ${k.conSlug.length}` : 'En obras' }))),
      lista, sello);
    cajon.append(caja);
    return { k, caja, fig, sello };
  });
  const tirador = el('div', { class: 'tirador-cajon', 'aria-hidden': 'true' });

  // ---------- el final
  const finalHecho = c.final?.slug && hecho(c.final.slug);
  const final = c.final && el('section', { class: 'final-cajon' + (abierto ? ' abierto' : '') + (finalHecho ? ' hecho' : '') },
    el('div', { class: 'nota-final' }, el('h2', { text: c.final.nombre }), el('p', { text: finalHecho ? c.final.abierto : todo ? X.listo : abierto ? 'Abierto por el profe para probarlo.' : c.final.cerrado })),
    abierto && c.final.slug && el('a', { class: 'tecla primaria grande', href: `../${c.final.slug}/`, text: finalHecho ? X.repetir : X.boton }));

  // ---------- cabecera: progreso y álbum
  const regla = el('div', { class: 'progreso', role: 'progressbar', 'aria-label': 'Progreso de la aventura', 'aria-valuemin': '0', 'aria-valuemax': String(comp.length), 'aria-valuenow': String(ordenados) }, el('span', { class: 'relleno', style: { width: Math.max(3, (ordenados / comp.length) * 100) + '%' } }, el('span', { class: 'punta-barra' })));
  const contador = el('b', { text: `${conseguidas.length} de ${todos.length}` });
  const botonAlbum = el('button', { type: 'button', class: 'tecla boton-album', onclick: () => album() }, el('span', { class: 'icono-album', html: DIBUJOS[X.icono] }), el('span', {}, X.album + ' ', contador));
  document.body.prepend(
    el('header', { class: 'barra-juego' },
      el('a', { class: 'volver con-texto', href: c.volver || '../../', title: 'Volver al Cajón maestro' }, svg('0 0 24 24', '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>', { width: 22, height: 22 }), el('span', { text: 'Cajón maestro' })),
      el('h1', { text: c.titulo }),
      el('div', { class: 'estado' }, regla, el('span', { class: 'texto-progreso', text: `${ordenados} de ${comp.length} ${X.hechos}` })),
      el('div', { class: 'controles' }, botonAlbum, el('button', { type: 'button', class: 'tecla', text: 'Historia', onclick: () => vineta(c.historia, dibuja, POSES, c.titulo) }))),
    el('main', { class: 'mesa-juego mapa' }, el('div', { class: 'marco-cajon' + (feria ? ' marco-feria' : '') }, cajon, !feria && tirador), final));

  // ---------- el álbum de pegatinas
  function album() {
    suena('coge');
    const capa = el('div', { class: 'vineta-capa album-capa', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Álbum de pegatinas' });
    const hoja = el('div', { class: 'album' },
      el('div', { class: 'cab-album' }, el('h2', { text: X.albumTitulo }), el('p', { text: `${conseguidas.length} de ${todos.length}. ${X.albumTexto}` })),
      el('ul', { class: 'hoja-album' }, todos.map((j) => el('li', { class: hecho(j.slug) ? 'tiene' : 'falta' }, hecho(j.slug) ? pegatina(j.slug) : el('span', { class: 'hueco-pegatina', text: '?' }), el('small', { text: j.titulo })))),
      el('button', { type: 'button', class: 'tecla primaria grande', text: 'Cerrar', onclick: () => { capa.remove(); suena('quita'); } }));
    capa.append(hoja); document.body.append(capa);
    capa.addEventListener('click', (e) => { if (e.target === capa) capa.remove(); });
    if (!lento()) {
      gsap.from(hoja, { y: 60, rotation: -3, opacity: 0, duration: 0.5, ease: 'back.out(1.6)' });
      gsap.from(hoja.querySelectorAll('li.tiene .pegatina-album'), { scale: 2.2, rotation: () => gsap.utils.random(-60, 60), opacity: 0, duration: 0.45, ease: 'back.out(2)', stagger: 0.06, delay: 0.25, onStart: () => suena('pon') });
    }
  }

  // ---------- entrada: el cajón se abre y los compartimentos se asientan
  if (!lento()) {
    const tl = gsap.timeline();
    tl.from(cajon.parentNode, { y: -60, opacity: 0, duration: 0.6, ease: 'power3.out' })
      .from(nodos.map((n) => n.caja), { y: 24, opacity: 0, duration: 0.45, ease: 'back.out(1.6)', stagger: 0.07 }, '-=0.25')
      .from(cajon.querySelectorAll('.tarjeta-juego'), { y: -14, rotation: () => gsap.utils.random(-12, 12), opacity: 0, duration: 0.35, ease: 'back.out(2)', stagger: 0.03 }, '-=0.3');
    // los personajes respiran y, de vez en cuando, uno salta
    nodos.forEach((n, i) => gsap.to(n.fig, { y: -4, duration: 1.4 + i * 0.13, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: i * 0.2 }));
    setInterval(() => { if (document.hidden) return; const n = nodos[Math.floor(Math.random() * nodos.length)]; gsap.fromTo(n.fig, { y: 0 }, { y: -18, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 }); }, 5200);
  }

  if (!visto && c.historia) { escena.pausa?.(); await vineta(c.historia, dibuja, POSES, c.titulo); guarda('cajon-mapa:' + location.pathname, '1'); escena.sigue?.(); }

  // ---------- compartimentos recién ordenados: el sello cae ahora
  for (const n of nodos) {
    const clave = 'cajon-sellado:' + location.pathname + ':' + n.k.nombre;
    if (n.k.terminado && !lee(clave)) {
      guarda(clave, '1');
      if (lento()) continue;
      await new Promise((r) => setTimeout(r, 700));
      n.caja.scrollIntoView({ block: 'center', behavior: 'smooth' });
      if (feria) { const bs = n.caja.querySelectorAll('.bombillas i'); n.caja.classList.remove('ordenado'); for (const b of bs) { b.classList.add('apagada'); } n.caja.classList.add('ordenado'); for (const b of bs) { b.classList.remove('apagada'); suena('clic'); await new Promise((r) => setTimeout(r, 70)); } }
      gsap.fromTo(n.sello, { scale: 3, rotation: -40, opacity: 0 }, { scale: 1, rotation: -12, opacity: 1, duration: 0.45, ease: 'back.out(2.2)', onComplete: () => { suena('sello'); gsap.fromTo(n.caja, { y: 4 }, { y: 0, duration: 0.4, ease: 'elastic.out(1,0.3)' }); chispasEn(n.sello, 16, '#ffc531'); } });
      await new Promise((r) => setTimeout(r, 900));
      suena('bien'); gomets(18);
    }
  }
  // ---------- pegatinas nuevas: vuelan al álbum
  if (nuevas.length && !lento()) {
    await new Promise((r) => setTimeout(r, 600));
    const aviso = el('div', { class: 'aviso-pegatina', role: 'status' }, el('b', { text: feria ? (nuevas.length === 1 ? '¡Premio nuevo!' : `¡${nuevas.length} premios nuevos!`) : nuevas.length === 1 ? '¡Pegatina nueva!' : `¡${nuevas.length} pegatinas nuevas!` }), el('div', { class: 'nuevas' }, nuevas.map((j) => pegatina(j.slug))));
    document.body.append(aviso);
    suena('sube');
    await gsap.from(aviso, { scale: 0.3, rotation: -20, opacity: 0, duration: 0.5, ease: 'back.out(2)' });
    await new Promise((r) => setTimeout(r, 1300));
    const a = aviso.getBoundingClientRect(), b = botonAlbum.getBoundingClientRect();
    await gsap.to(aviso, { x: b.left + b.width / 2 - (a.left + a.width / 2), y: b.top + b.height / 2 - (a.top + a.height / 2), scale: 0.15, opacity: 0.3, duration: 0.6, ease: 'power3.in' });
    aviso.remove(); bote(botonAlbum, 10); suena('pon');
  }
  nuevas.forEach((j) => guarda('cajon-pegada:' + ruta(j.slug), '1'));
  // ---------- el final de la historia
  if (finalHecho && !lee('cajon-final:' + location.pathname) && c.final?.historia) {
    guarda('cajon-final:' + location.pathname, '1');
    await vineta(c.final.historia, dibuja, POSES, c.final.nombre);
    gomets(50); suena('bien');
  }
}
