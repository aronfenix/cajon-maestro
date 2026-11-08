import { getCollection, render, type CollectionEntry } from 'astro:content';
import type { ImageMetadata } from 'astro';
import { AREAS, areaPorId, type Area, type Tipo } from '../data/areas';
import { ruta } from './rutas';

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
  entrada: CollectionEntry<'materiales'>;
}

export interface Grupo {
  tema: Tema;
  materiales: Material[];
}

let cache: { temas: Map<string, Tema>; materiales: Material[] } | undefined;

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
      enlace: d.enlace,
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

  cache = { temas, materiales };
  return cache;
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
