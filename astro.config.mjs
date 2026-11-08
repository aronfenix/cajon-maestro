// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL y BASE_PATH los pone el flujo de publicación (.github/workflows/publicar.yml).
// En GitHub Pages: https://aronfenix.github.io + /cajon-maestro
// Con dominio propio: https://tudominio.es + /
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://aronfenix.github.io',
  base: process.env.BASE_PATH ?? '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
