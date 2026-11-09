# Herramientas de trabajo (no forman parte de la web)

Generadores y pruebas que se usan al construir los juegos. Suponen el repo en `/home/claude/cajon` y esta carpeta en `/home/claude/herramientas` (hay rutas absolutas: ajústalas o crea esos enlaces).

- `juegos.py`, `feria.py`: escriben el `index.html` (config JSON) de cada juego. No edites esos HTML a mano.
- `feria_catalogo.py`: fichas del catálogo y portadas (usa `portadas4.mjs`).
- `feria_arte.py`, `feria_portadas2.py`, `recorta_casetas.py`, `cajon_arte.py`: pasan las entregas de imágenes a WebP.
- Pruebas (Playwright + Chrome del sistema; `npm i playwright` aquí): `. ./srv.sh` sirve `public/` en :8765; `auditoria.mjs` (J=slugs T=pc,mov), `fshot.mjs`, `festante.mjs`, `fsitio2.mjs` (sirve `dist/` en :8791).
