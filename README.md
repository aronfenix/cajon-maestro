# La cajonera

Web de materiales de Primaria de Álvaro: juegos, vídeos, cómics y fichas. Es una web estática hecha con [Astro](https://astro.build); no tiene cuentas, base de datos ni cookies.

## Subir un material

**Con el formulario (lo normal).** Entra en [app.pagescms.org](https://app.pagescms.org) con tu cuenta de GitHub, abre este repositorio y pulsa *Materiales → Añadir*. Rellena título, tema, tipo, una frase, fecha, portada y el archivo o el enlace. Al guardar, la web se vuelve a publicar sola en uno o dos minutos.

La primera vez, Pages CMS te pedirá instalar su aplicación de GitHub en este repositorio.

**Sin formulario.** En GitHub, *Add file → Create new file* dentro de `src/content/materiales/`, copiando cualquier ficha existente como plantilla. Las imágenes van en `src/media/portadas/` y los PDF en `public/archivos/`.

**Vídeos.** Lo ideal es subir el MP4 a Cloudflare R2 y pegar su dirección en el campo «Vídeo» (ver *Publicación*). De momento también vale subirlo como archivo.

**Temas nuevos.** Antes de subir el primer material de un tema, créalo en *Temas*.

### Antes de publicar cada material

- No aparecen caras, nombres, voces ni trabajos de alumnos.
- No hay páginas, actividades ni ilustraciones del libro de texto.
- Si es un juego, el enlace va a la versión sin datos de alumnos.
- Si lleva imágenes o voces generadas con IA, el campo «Hecho con IA» lo dice.

Si a una ficha le falta el archivo, la web lo avisa en rojo («Falta subir el archivo»). Para esconder algo sin borrarlo, marca «Ocultar (borrador)».

## Dónde está cada cosa

| Qué | Dónde |
| --- | --- |
| Fichas de los materiales | `src/content/materiales/*.md` |
| Temas | `src/content/temas/*.yml` |
| Portadas e imágenes | `src/media/` |
| PDF y descargas | `public/archivos/` |
| Áreas y sus colores | `src/data/areas.ts` |
| Nombre, presentación, licencia, correo | `src/data/sitio.ts` |
| Diseño | `src/styles/global.css` |
| Formulario de Pages CMS | `.pages.yml` |

## Publicación

**Ahora: GitHub Pages.** Cada cambio en `main` (también los que guardas desde Pages CMS) lanza `.github/workflows/publicar.yml`, que construye la web y la publica en https://aronfenix.github.io/cajon-maestro/. Tarda uno o dos minutos; el progreso se ve en la pestaña *Actions* del repositorio. Si algo falla, ahí sale qué material tiene el problema.

**Más adelante: dominio propio en Cloudflare.**

1. Cloudflare → *Workers & Pages* → *Create* → *Import a repository* → este repositorio.
2. Comando de build: `npm run build` con la variable `SITE_URL=https://tudominio.es` (sin `BASE_PATH`). Despliegue: `npx wrangler deploy` (lee `wrangler.jsonc`).
3. En el Worker, *Settings → Domains & Routes* → tu dominio. Después puedes desactivar GitHub Pages.
4. Para vídeos: *R2 → Create bucket* (`cajon-videos`) y conéctale un subdominio (`videos.tudominio.es`) en *Settings → Custom Domains*.

Mientras no haya R2, los vídeos de menos de 100 MB pueden ir en `public/archivos/` y pegarse en «Vídeo» como `/archivos/nombre.mp4`.

## En tu ordenador (opcional)

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # comprueba que todo está bien antes de subir
```

Si falta un campo obligatorio, un tema no existe o una portada no está, `npm run build` falla y dice qué material es.

## Licencia

Los materiales: [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.es). Las imágenes generadas con IA pueden no estar protegidas por derechos de autor.
