import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Pages CMS guarda los campos vacíos como "" o null: los convertimos en «no hay».
const texto = z
  .string()
  .nullish()
  .transform((v) => (v && v.trim() ? v.trim() : undefined));
const numero = z
  .union([z.number(), z.string()])
  .nullish()
  .transform((v) => {
    if (v === null || v === undefined || v === '') return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  });

const temas = defineCollection({
  loader: glob({ pattern: '*.yml', base: './src/content/temas' }),
  schema: z.object({
    titulo: z.string(),
    area: z.string(),
    subtitulo: texto,
    curso: texto,
    orden: numero,
  }),
});

const materiales = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/materiales' }),
  schema: z.object({
    titulo: z.string(),
    tema: z.string(),
    tipo: z.enum(['juego', 'video', 'comic', 'ficha', 'web', 'herramienta']),
    resumen: z.string(),
    fecha: z.coerce.date(),
    portada: texto,
    enlace: texto,
    codigo: texto,
    video: texto,
    archivo: texto,
    duracion: texto,
    paginas: numero,
    cambiaria: texto,
    ia: texto,
    relacionados: z
      .array(z.string())
      .nullish()
      .transform((v) => v ?? []),
    orden: numero,
    borrador: z.boolean().nullish().transform((v) => !!v),
  }),
});

export const collections = { temas, materiales };
