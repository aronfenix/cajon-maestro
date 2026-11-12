// Tras construir la web: cada juego pide los motores con su versión (?v=huella del archivo).
// Así, cuando se actualiza un motor, ninguna tablet mezcla una página nueva con un motor viejo guardado en caché.
// - Mapa de importaciones (importmap) con todos los .js de juegos/motores/, en rutas relativas a cada página.
// - El <script src> de arranque y el <link> de base.css, con su ?v=.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const DIST = 'dist/juegos';
const MOTORES = join(DIST, 'motores');
if (!existsSync(MOTORES)) process.exit(0);

const huella = (f) => createHash('sha1').update(readFileSync(f)).digest('hex').slice(0, 8);
const todos = (dir) => readdirSync(dir).flatMap((n) => { const p = join(dir, n); return statSync(p).isDirectory() ? todos(p) : [p]; });
const js = todos(MOTORES).filter((f) => f.endsWith('.js'));
const css = todos(MOTORES).filter((f) => f.endsWith('.css'));
// la hoja base importa las demás: su versión depende de todas
const vCss = createHash('sha1').update(css.map(huella).join('')).digest('hex').slice(0, 8);

// dentro de base.css, cada @import también con su versión
const base = join(MOTORES, 'base.css');
writeFileSync(base, readFileSync(base, 'utf8').replace(/@import url\('([^')]+\.css)'\)/g, (m, f) => `@import url('${f}?v=${huella(join(MOTORES, f))}')`));

let n = 0;
for (const carpeta of readdirSync(DIST)) {
  const pagina = join(DIST, carpeta, 'index.html');
  if (carpeta === 'motores' || !existsSync(pagina)) continue;
  let html = readFileSync(pagina, 'utf8');
  if (!html.includes('../motores/') || html.includes('type="importmap"')) continue;
  const imports = Object.fromEntries(js.map((f) => { const r = '../' + relative(DIST, f).replaceAll('\\', '/'); return [r, `${r}?v=${huella(f)}`]; }));
  const mapa = `<script type="importmap">${JSON.stringify({ imports })}</script>\n`;
  html = html.replace('<script type="module"', mapa + '<script type="module"');
  html = html.replace('src="../motores/arranque.js"', `src="../motores/arranque.js?v=${huella(join(MOTORES, 'arranque.js'))}"`);
  html = html.replace('href="../motores/base.css"', `href="../motores/base.css?v=${vCss}"`);
  writeFileSync(pagina, html);
  n++;
}
console.log(`versiona-juegos: ${n} páginas con los motores versionados`);
