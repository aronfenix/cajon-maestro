import { getCollection, render, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { AREAS, areaPorId, type Area, type Tipo } from '../data/areas';
import { ruta } from './rutas';
import { existsSync, readFileSync } from 'node:fs';

export interface PaginaComic {
  src: string;
  ancho: number;
  alto: number;
}

// Páginas generadas por scripts/paginas-comics.mjs, si existen.
function paginasComic(id: string): PaginaComic[] | undefined {
  const indice = `public/comics/${id}/paginas.json`;
  if (!existsSync(indice)) return undefined;
  try {
    const { paginas } = JSON.parse(readFileSync(indice, 'utf8'));
    return paginas.map((p: { archivo: string; ancho: number; alto: number }) => ({
      src: ruta(`/comics/${id}/${p.archivo}`),
      ancho: p.ancho,
      alto: p.alto,
    }));
  } catch {
    return undefined;
  }
}

// Todas las imágenes de src/media, para optimizarlas al publicar.
const imagenes = import.meta.glob<{ default: ImageMetadata }>(
  '/src/media/**/*.{jpg,jpeg,png,webp,gif,avif,JPG,JPEG,PNG,WEBP}',
  { eager: true },
);

export function imagen(ruta: string | undefined, quien: string): ImageMetadata | undefined {
  if (!ruta) return undefined;
  const clave = ruta.startsWith('/') ? ruta : `/${ruta}`;
  const img = imagenes[clave]?.default;
  if (!img) {
    throw new Error(
      `«${quien}» apunta a una imagen que no existe: ${ruta}. ¿Se subió a src/media?`,
    );
  }
  return img;
}

// Pages CMS guarda las referencias como ruta del archivo; Astro usa el nombre sin extensión.
export function idDe(ref: string): string {
  const base = ref.split('/').pop() ?? ref;
  return base.replace(/\.(md|ya?ml)$/i, '');
}

export interface Tema {
  id: string;
  titulo: string;
  subtitulo?: string;
  curso?: string;
  orden: number;
  area: Area;
}

export interface Material {
  id: string;
  url: string;
  titulo: string;
  tipo: Tipo;
  resumen: string;
  fecha: Date;
  tema: Tema;
  portada?: ImageMetadata;
  enlace?: string;
  codigo?: string;
  video?: string;
  archivo?: string;
  duracion?: string;
  paginas?: number;
  cambiaria?: string;
  ia?: string;
  relacionados: string[];
  orden: number;
  pendiente: boolean; // le falta el archivo, el vídeo o el enlace
  lector?: PaginaComic[]; // páginas del cómic para leerlo en la web
  juego?: string; // carpeta del juego en /juegos/, si lo es
  aventura?: string; // id del mapa de la aventura a la que pertenece
  entrada: CollectionEntry<'materiales'>;
}

// Una aventura: un mapa (public/juegos/<slug>/ con «compartimentos») y los juegos que contiene, por zonas.
export interface Zona {
  nombre: string;
  color?: string;
  juegos: Material[];
}
export interface Aventura {
  mapa: Material;
  zonas: Zona[];
  final?: Material;
  juegos: Material[];
}

export interface Grupo {
  tema: Tema;
  materiales: Material[];
}

let cache: { temas: Map<string, Tema>; materiales: Material[]; aventuras: Aventura[] } | undefined;

export async function catalogo() {
  if (cache) return cache;
  const temas = new Map<string, Tema>();
  for (const t of await getCollection('temas')) {
    temas.set(t.id, {
      id: t.id,
      titulo: t.data.titulo,
      subtitulo: t.data.subtitulo,
      curso: t.data.curso,
      orden: t.data.orden ?? 99,
      area: areaPorId(t.data.area),
    });
  }

  const materiales: Material[] = [];
  for (const m of await getCollection('materiales')) {
    const d = m.data;
    if (d.borrador) continue;
    const tema = temas.get(idDe(d.tema));
    if (!tema) {
      throw new Error(
        `El material «${d.titulo}» usa el tema «${d.tema}», que no existe en src/content/temas.`,
      );
    }
    const tieneDestino = !!(d.enlace || d.video || d.archivo);
    materiales.push({
      id: m.id,
      url: ruta(`/materiales/${m.id}/`),
      titulo: d.titulo,
      tipo: d.tipo,
      resumen: d.resumen,
      fecha: d.fecha,
      tema,
      portada: imagen(d.portada, d.titulo),
      enlace: d.enlace ? ruta(d.enlace) : undefined,
      codigo: d.codigo,
      video: d.video ? ruta(d.video) : undefined,
      archivo: d.archivo ? ruta(d.archivo) : undefined,
      duracion: d.duracion,
      paginas: d.paginas,
      cambiaria: d.cambiaria,
      ia: d.ia,
      relacionados: d.relacionados.map(idDe),
      orden: d.orden ?? 99,
      pendiente: !tieneDestino,
      lector: d.tipo === 'comic' ? paginasComic(m.id) : undefined,
      juego: d.enlace?.match(/^\/?juegos\/([^/]+)\/?$/)?.[1],
      entrada: m,
    });
  }

  for (const m of materiales) {
    for (const r of m.relacionados) {
      if (!materiales.some((x) => x.id === r)) {
        throw new Error(`«${m.titulo}» enlaza con «${r}», que no existe o es borrador.`);
      }
    }
  }

  // Aventuras: los juegos que son mapas leen su configuración para saber qué juegos llevan dentro.
  const porJuego = new Map(materiales.filter((m) => m.juego).map((m) => [m.juego!, m]));
  const aventuras: Aventura[] = [];
  for (const mapa of materiales) {
    if (!mapa.juego) continue;
    const config = configJuego(mapa.juego);
    if (!config?.compartimentos) continue;
    const zonas: Zona[] = config.compartimentos.map((c: { nombre: string; color?: string; juegos: { slug: string }[] }) => ({
      nombre: c.nombre,
      color: c.color,
      juegos: c.juegos.map((j) => porJuego.get(j.slug)).filter((x): x is Material => !!x),
    }));
    const final = config.final?.slug ? porJuego.get(config.final.slug) : undefined;
    const juegos = [...zonas.flatMap((z) => z.juegos), ...(final ? [final] : [])];
    for (const j of juegos) j.aventura = mapa.id;
    aventuras.push({ mapa, zonas, final, juegos });
  }
  aventuras.sort((a, b) => b.mapa.fecha.getTime() - a.mapa.fecha.getTime());

  cache = { temas, materiales, aventuras };
  return cache;
}

// El bloque JSON de configuración de un juego publicado.
function configJuego(slug: string) {
  const archivo = `public/juegos/${slug}/index.html`;
  if (!existsSync(archivo)) return undefined;
  const m = readFileSync(archivo, 'utf8').match(/<script type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
  try {
    return m ? JSON.parse(m[1]) : undefined;
  } catch {
    return undefined;
  }
}

export async function aventuras(): Promise<Aventura[]> {
  return (await catalogo()).aventuras;
}

export async function aventuraDe(m: Material): Promise<Aventura | undefined> {
  return (await catalogo()).aventuras.find((a) => a.mapa.id === m.id);
}

// Lo último que ha entrado en el cajón, sin las aventuras (que tienen su propia sección) ni sus juegos.
export async function ultimos(n = 4): Promise<Material[]> {
  const { materiales, aventuras } = await catalogo();
  const mapas = new Set(aventuras.map((a) => a.mapa.id));
  const vistos = new Set<string>();
  const lista: Material[] = [];
  const orden = [...materiales].sort((a, b) => b.fecha.getTime() - a.fecha.getTime() || a.orden - b.orden);
  for (const m of orden) {
    if (m.aventura || mapas.has(m.id)) continue;
    const x = m;
    if (vistos.has(x.id)) continue;
    vistos.add(x.id);
    lista.push(x);
    if (lista.length === n) break;
  }
  return lista;
}

const ordenArea = (a: Area) => AREAS.findIndex((x) => x.id === a.id);

export async function grupos(areaId?: string): Promise<Grupo[]> {
  const { materiales } = await catalogo();
  const porTema = new Map<string, Grupo>();
  for (const m of materiales) {
    if (areaId && m.tema.area.id !== areaId) continue;
    let g = porTema.get(m.tema.id);
    if (!g) porTema.set(m.tema.id, (g = { tema: m.tema, materiales: [] }));
    g.materiales.push(m);
  }
  const lista = [...porTema.values()];
  for (const g of lista) {
    g.materiales.sort(
      (a, b) => a.orden - b.orden || a.fecha.getTime() - b.fecha.getTime() || a.titulo.localeCompare(b.titulo, 'es'),
    );
  }
  return lista.sort(
    (a, b) =>
      ordenArea(a.tema.area) - ordenArea(b.tema.area) ||
      a.tema.orden - b.tema.orden ||
      a.tema.titulo.localeCompare(b.tema.titulo, 'es'),
  );
}

export async function relacionadosDe(m: Material): Promise<Material[]> {
  const { materiales } = await catalogo();
  if (m.relacionados.length) {
    return m.relacionados.map((id) => materiales.find((x) => x.id === id)!).filter(Boolean);
  }
  return materiales.filter((x) => x.tema.id === m.tema.id && x.id !== m.id).slice(0, 4);
}

export { render };

// Frase corta de detalle: «4:42», «12 páginas».
export function detalle(m: Material): string | undefined {
  if (m.duracion) return m.duracion;
  if (m.paginas) return m.paginas === 1 ? '1 página' : `${m.paginas} páginas`;
  return undefined;
}

export function normaliza(s: string): string {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}
