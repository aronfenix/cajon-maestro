# Herramientas de trabajo (no forman parte de la web)

Generadores y pruebas que se usan al construir los juegos. Suponen el repo en `/home/claude/cajon` y esta carpeta en `/home/claude/herramientas` (hay rutas absolutas: ajústalas o crea esos enlaces).

- `juegos.py`, `feria.py`: escriben el `index.html` (config JSON) de cada juego. No edites esos HTML a mano.
- `feria_catalogo.py`: fichas del catálogo y portadas (usa `portadas4.mjs`).
- `feria_arte.py`, `feria_portadas2.py`, `recorta_casetas.py`, `cajon_arte.py`: pasan las entregas de imágenes a WebP.
- Pruebas (Playwright + Chrome del sistema; `npm i playwright` aquí): `. ./srv.sh` sirve `public/` en :8765; `auditoria.mjs` (J=slugs T=pc,mov), `fshot.mjs`, `festante.mjs`, `fsitio2.mjs` (sirve `dist/` en :8791).

## Antes de publicar
`npm run build` y luego `node herramientas/humo.mjs` (desde la carpeta con Playwright). Revisa portada, área, ficha, aventuras y 404 en pc, tablet táctil horizontal y vertical y móvil: errores de consola, recursos 404, desborde horizontal, transiciones con nombre repetido, animaciones de scroll vivas, todos los enlaces internos y que los 53 juegos arranquen. Sale con código 1 si algo falla.
