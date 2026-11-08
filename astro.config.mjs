// @ts-check
import { defineConfig } from 'astro/config';

// Cuando tengas dominio, cámbialo aquí (sirve para los enlaces al compartir).
export default defineConfig({
  site: 'https://cajondemaestro.example',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
