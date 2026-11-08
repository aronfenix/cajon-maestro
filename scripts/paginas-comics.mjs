// Convierte en imágenes las páginas de los cómics en PDF, para el lector.
// Busca los materiales de tipo «comic» con un PDF en «archivo» y deja las páginas en
// public/comics/<material>/ (p-001.webp, p-002.webp…) con un paginas.json.
// Necesita pdftoppm (paquete poppler-utils). Si no está, avisa y sigue: la web
// se publica igual y el cómic solo tendrá el botón de descarga.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, basename } from 'node:path';
import { tmpdir } from 'node:os';
import { parse } from 'yaml';
import sharp from 'sharp';

const MATERIALES = 'src/content/materiales';
const SALIDA = 'public/comics';
const ANCHO = 1400; // píxeles de ancho de cada página

function frontmatter(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return m ? parse(m[1]) ?? {} : {};
}

function hayPdftoppm() {
  try {
    execFileSync('pdftoppm', ['-v'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

const comics = readdirSync(MATERIALES)
  .filter((f) => f.endsWith('.md'))
  .map((f) => ({ id: basename(f, '.md'), datos: frontmatter(readFileSync(join(MATERIALES, f), 'utf8')) }))
  .filter(({ datos }) => datos.tipo === 'comic' && typeof datos.archivo === 'string' && /\.pdf$/i.test(datos.archivo));

if (!comics.length) process.exit(0);
if (!hayPdftoppm()) {
  console.warn('[cómics] No encuentro pdftoppm: los cómics saldrán sin lector, solo con descarga.');
  process.exit(0);
}

for (const { id, datos } of comics) {
  const pdf = join('public', datos.archivo.replace(/^\//, ''));
  if (!existsSync(pdf)) {
    console.warn(`[cómics] «${datos.titulo}»: no encuentro ${pdf}.`);
    continue;
  }
  const destino = join(SALIDA, id);
  const indice = join(destino, 'paginas.json');
  const huella = `${statSync(pdf).size}-${Math.round(statSync(pdf).mtimeMs)}-${ANCHO}`;
  if (existsSync(indice)) {
    try {
      if (JSON.parse(readFileSync(indice, 'utf8')).huella === huella) {
        console.log(`[cómics] «${datos.titulo}»: ya convertido.`);
        continue;
      }
    } catch {}
  }

  rmSync(destino, { recursive: true, force: true });
  mkdirSync(destino, { recursive: true });
  const tmp = join(tmpdir(), `comic-${id}-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  console.log(`[cómics] «${datos.titulo}»: convirtiendo páginas…`);
  execFileSync('pdftoppm', ['-r', '150', '-png', pdf, join(tmp, 'p')], { stdio: 'inherit' });

  const pngs = readdirSync(tmp).filter((f) => f.endsWith('.png')).sort();
  const paginas = [];
  for (const [i, f] of pngs.entries()) {
    const nombre = `p-${String(i + 1).padStart(3, '0')}.webp`;
    const info = await sharp(join(tmp, f))
      .resize({ width: ANCHO, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(join(destino, nombre));
    paginas.push({ archivo: nombre, ancho: info.width, alto: info.height });
  }
  rmSync(tmp, { recursive: true, force: true });
  writeFileSync(indice, JSON.stringify({ huella, paginas }, null, 2));
  console.log(`[cómics] «${datos.titulo}»: ${paginas.length} páginas.`);
}
