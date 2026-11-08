// Mapa de una aventura: compartimentos con sus juegos. Es solo una portada: los juegos se pueden jugar sueltos.
// Cada bloque futuro es otra carpeta con otro mapa (otro cajón, otro mueble) y su propia configuración.
import { el, svg } from './nucleo.js';
import { dibuja, POSES } from './personaje.js';
import { montaEscena, vineta } from './escena.js';
import { gomets } from './efectos.js';

const hecho = (slug) => { try { return !!localStorage.getItem('cajon-hecho:' + new URL(`../${slug}/`, location.href).pathname); } catch { return false; } };

export async function montaMapa(c) {
  document.title = `${c.titulo} · Cajón maestro`;
  montaEscena(c.escena || 'cajon');
  const visto = (() => { try { return localStorage.getItem('cajon-mapa:' + location.pathname); } catch { return null; } })();
  const comp = c.compartimentos.map((k) => ({ ...k, total: k.juegos.filter((j) => j.slug).length, hechos: k.juegos.filter((j) => j.slug && hecho(j.slug)).length }));
  const todo = comp.every((k) => k.listo !== false && k.hechos === k.total);
  // con ?abrir en la dirección, el profe abre el final aunque no esté todo hecho
  const abierto = todo || new URLSearchParams(location.search).has('abrir');
  const cajon = el('div', { class: 'cajon-mapa' });
  for (const k of comp) {
    const terminado = k.total > 0 && k.hechos === k.total;
    const caja = el('section', { class: 'compartimento' + (k.listo === false ? ' en-obras' : '') + (terminado ? ' ordenado' : ''), style: { '--c': k.color } },
      el('div', { class: 'cab-comp' },
        el('div', { class: 'icono-comp', html: dibuja(k.quien, POSES[terminado ? 'celebra' : 'quieto']) }),
        el('div', {}, el('h2', { text: k.nombre }), el('p', { text: k.listo === false ? 'En obras' : `${k.hechos} de ${k.total}` + (k.juegos.some((j) => !j.slug) ? ' (y vienen más)' : '') }))),
      el('ul', {}, k.juegos.map((j) => el('li', {}, j.slug && k.listo !== false
        ? el('a', { class: 'tecla juego-mapa' + (hecho(j.slug) ? ' hecho' : ''), href: `../${j.slug}/` }, j.titulo, hecho(j.slug) && el('span', { class: 'tic-hecho', 'aria-label': 'hecho', text: '✓' }))
        : el('span', { class: 'juego-mapa futuro', text: j.titulo })))),
      terminado && el('span', { class: 'sello-ordenado', text: 'ORDENADO' }));
    cajon.append(caja);
  }
  document.body.prepend(
    el('header', { class: 'barra-juego' },
      el('a', { class: 'volver', href: c.volver || '../../' }, svg('0 0 24 24', '<path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>', { width: 22, height: 22 }), 'Cajón maestro'),
      el('h1', { text: c.titulo }),
      el('div', { class: 'controles' }, el('button', { type: 'button', class: 'tecla', text: 'Ver la historia', onclick: () => vineta(c.historia, dibuja, POSES, c.titulo) }))),
    el('main', { class: 'mesa-juego mapa' },
      el('p', { class: 'pista', text: c.subtitulo }),
      cajon,
      c.final && el('section', { class: 'final-mapa' + (abierto ? ' abierto' : '') }, el('h2', { text: c.final.nombre }), el('p', { text: todo ? c.final.abierto : abierto ? 'Abierto por el profe para probarlo.' : c.final.cerrado }), abierto && c.final.slug && el('a', { class: 'tecla primaria grande', href: `../${c.final.slug}/`, text: hecho(c.final.slug) ? 'Repetir el examen' : 'Hacer el examen' }))));
  if (!visto && c.historia) { await vineta(c.historia, dibuja, POSES, c.titulo); try { localStorage.setItem('cajon-mapa:' + location.pathname, '1'); } catch {} }
  if (todo && c.final?.historia) { await vineta(c.final.historia, dibuja, POSES, c.final.nombre); gomets(40); }
}
