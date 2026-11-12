# La cajonera · libro de estilo

Para cualquiera que haga juegos, herramientas o materiales para **La cajonera** (https://aronfenix.github.io/la-cajonera/): ChatGPT, Claude o el propio Álvaro. Léelo entero antes de empezar. Al terminar, pasa la lista del final.

Versión del 12-11-2026. Si algo de aquí choca con lo que ya está publicado y funciona, manda lo publicado. Avisa de la contradicción.

---

## 0. Lo que hay que entender primero

La cajonera es la web de un maestro de 5.º de Primaria en Madrid. Los materiales se usan de verdad, en clase y en casa, con niños de 10–11 años. El grupo es muy heterogéneo: hay alumnos de nivel muy bajo y alumnos de nivel muy alto.

El listón está muy alto: **los mejores juegos en español sobre estos temas en internet**. No basta con que sea correcto. Tiene que dar ganas de jugarlo y obligar a pensar.

Tres ideas por las que se mide todo lo demás:

1. **La mecánica es el contenido.** Lo que haces con el dedo es lo que hay que entender. Si cambias el tema y el juego sigue funcionando igual, el juego está mal.
2. **Se aprende pensando, no recordando.** Cada reto pide predecir, decidir, construir o explicar. Nunca solo reconocer una definición.
3. **Todo pertenece a un mundo.** Hay un aula y un cajón con objetos y tres personajes con carácter. No es una app genérica con tarjetas.

---

## 1. Lo que NO se hace (sacado de un caso real)

«Laboratorio vivo» (`/juegos/laboratorio-vivo/`) es correcto en contenido y está bien programado. Sus fallos de estilo resumen todo lo que este libro quiere evitar:

| Lo que hace | Por qué falla | Qué haría La cajonera |
|---|---|---|
| **Memoria de conceptos**: parejas palabra ↔ definición | Ejercita la memoria visual de dónde estaba la carta, no la biología. Se puede ganar sin entender nada. | «El portero de la célula»: llegan oxígeno, nutrientes, desechos y un virus. Tú decides qué entra y qué sale, y la célula reacciona. *Regular la entrada y salida* se hace, no se lee. |
| **«Biole»**: un Wordle de vocabulario («Así es un ser vivo formado por una sola célula» → UNICELULAR) | La dificultad está en adivinar letras, no en el concepto. Recuerda el término y no lo usa. | «Una ameba se parte en dos. ¿Cuántos seres vivos hay ahora? ¿Y cuántas células?». Y luego: «Se te cae una célula de la piel. ¿Hay un ser vivo más?». Obliga a distinguir *organismo unicelular* de *célula de un pluricelular*. |
| **Sopa de letras con pistas** | Busca letras. El contenido es decorado. | Prohibida. |
| **Circuitos de tuberías** para el recorrido de los nutrientes | La idea de la ruta es buena, pero lo difícil es girar tuberías, no saber por dónde va el oxígeno. | Una ruta con decisiones: «El oxígeno ha entrado por la nariz. ¿Siguiente parada?». Cada error tiene una consecuencia visible y explicada. |
| Portada de *landing page*: «La vida se aprende explorando.», antetítulos en mayúsculas («ELIGE TU PRÓXIMA MISIÓN»), rejilla de tarjetas blancas, «Jugar ↗», «Unos 3 min», lema «PEQUEÑOS RETOS · GRANDES IDEAS» | Parece una plantilla de empresa. Ni es de nadie ni pertenece a un mundo. | El juego empieza en su escenario, con su personaje y un botón de «Jugar». Sin eslóganes. |
| Renders 3D realistas mezclados con iconos planos | No hay dirección de arte. | Ilustración plana con contorno azul marino, en el mundo de la «mesa de manualidades» (ver §5). |
| Motor propio (`core.js`, `games.js`…) | Se queda sin todo lo que ya existe: personajes, portada, pistas, adaptación y progreso. | Usar el núcleo común de `/juegos/motores/` (ver §6). |

**Mecánicas prohibidas como mecánica principal:**
- sopa de letras;
- memoria de parejas;
- Wordle o ahorcado;
- crucigrama de definiciones;
- verdadero/falso;
- test de cuatro opciones en serie;
- «arrastra la palabra a su definición»;
- ruleta de preguntas.

Pueden aparecer como un reto suelto dentro de algo mejor, nunca como el juego entero.

**La prueba de las dos preguntas.** Hazla con cada mecánica antes de programar nada:
1. ¿Se puede ganar **sin saber** el contenido? Si es que sí, rehazla.
2. ¿Se puede **saber** el contenido y perder por culpa del mando (la habilidad con el dedo, la velocidad, la memoria visual)? Si es que sí, rehazla.

---

## 2. Jugabilidad: las reglas

### 2.1 La mecánica modela el concepto
Ejemplos que ya funcionan en la web:
- **La máquina de ceros**: cada palanca añade un cero. Para multiplicar por 10, 100 o 1000 se bajan palancas, y el alumno *ve* que 70 × 80 y 7 × 800 dan lo mismo.
- **La báscula**: hay que conseguir un resultado entre dos límites. Estimar es encontrar el sitio donde la báscula se queda quieta.
- **La goma elástica**: una goma estirada alrededor de las chinchetas se ajusta sola. Si el borde se mete hacia dentro, deja huecos. Así se ven los polígonos cóncavos y convexos.
- **El ascensor de carga**: aguanta un peso. ¿Cuántas cajas caben como máximo? Se prueba con la máquina y se acota. Es la división como problema real.

Para inventar una, pregúntate: *¿qué objeto o situación del mundo real se comporta exactamente como este concepto?* Ese objeto es el juego.

### 2.2 Predecir antes de comprobar
El mejor esquema de reto es: **mira → predice → comprueba → entiende**.
- Primero se escribe o se elige lo que va a pasar.
- Después se tira de la manivela, se suelta la goma o se pone en marcha.
- El resultado se ve, y la corrección explica la diferencia entre lo predicho y lo ocurrido.

### 2.3 Varias soluciones válidas
Siempre que se pueda, el reto admite más de una respuesta correcta («Consigue 5 600 con el 7 y el 8: vale cualquier forma»). Al acertar, la corrección enseña otra forma posible. Eso es pensar, no adivinar la respuesta que tenía el profe en la cabeza.

### 2.4 Retos generados, no listas fijas
Los retos se generan con parámetros (`generar`) para que no se repitan ni se memoricen. Las listas fijas solo valen cuando el contenido lo exige (textos, imágenes concretas). En ese caso hay que dar muchas variantes (`variantes`).

### 2.5 Dificultad adaptativa (ya la hace el núcleo)
- La dificultad va en `niveles`, de más fácil a más difícil, unos 5–8 escalones.
- Tres estrellas sin ayuda suben de nivel; dos se quedan; una o ninguna bajan.
- Diseña los escalones pensando en el grupo heterogéneo: el primero lo tiene que sacar quien va muy flojo, y el último tiene que hacer sudar a quien va muy bien.

### 2.6 Tres pistas graduadas por reto
1. **Orientar la mirada**: dónde fijarse. «Fíjate en cuántos ceros llevan los dos números juntos.»
2. **Mostrar la estructura**: cómo se descompone el problema. «7 × 8 = 56. Ahora, los ceros.»
3. **Dar una parte de la solución**, nunca toda. «Tienen 3 ceros entre los dos.»

Las pistas usan los datos concretos del reto, no frases genéricas. Tras un fallo, el reintento empieza con la primera pista ya dada.

### 2.7 La corrección explica con los datos del alumno
La corrección no dice «¡Incorrecto!». Dice **qué ha pasado y por qué**, con sus números:
- Mal: «Respuesta incorrecta. La respuesta correcta es 5 600.»
- Bien: «Salió **56 000**. 7 × 8 = 56 y luego se añaden los **3** ceros de las palancas. Tú habías puesto 2.»

Al acertar, la corrección también enseña algo: otra forma de hacerlo o el atajo.

### 2.8 Se diseña desde el error
Antes de escribir retos, haz la lista de **errores típicos reales** de un alumno de 10 años con ese contenido. Por ejemplo:
- en puntuación, poner coma entre sujeto y verbo;
- en Naturales, creer que la sangre «se gasta»;
- en Sociales, confundir comunidad autónoma con provincia.

Cada error típico se convierte en una opción tentadora o en una situación del juego. La corrección de esa opción explica justo ese error.

### 2.9 Duración y forma
- Una partida dura unos 8–12 retos, con la barra de progreso por objetivos.
- Retos cortos, con una sola idea cada uno.
- Funciona con el dedo en una tablet: hay que poder arrastrar y también tocar-y-tocar como alternativa.
- Las zonas táctiles miden al menos 44 px.
- Nada depende de la velocidad, salvo que la velocidad sea el contenido (cálculo mental con récord).

### 2.10 Una pregunta para hablar en clase
Cada juego lleva un `observa`, una pregunta para la conversación en clase después de jugar. Por ejemplo: «¿Por qué 70 × 80 y 7 × 800 dan lo mismo?». No tiene respuesta única ni sale en el juego. Es para el profe.

### 2.11 Aventuras
Varios juegos de un mismo bloque pueden formar una **aventura**: un mapa con compartimentos, una pequeña historia en viñetas, pegatinas o premios por juego y un examen final que mezcla motores.

Ejemplos: «La Gran Limpieza del Cajón» y «La Feria de Otoño». Cada juego de una aventura también se puede jugar suelto.

---

## 3. Preguntas y textos

### 3.1 Cómo se elige una pregunta
- Pregunta **lo que hay que pensar**, no lo que hay que recordar. Debe resolverse con la idea, no con la frase del libro.
- La situación es **concreta y verosímil**: el cajón, el aula, el patio, la merienda, el almacén del cole, la feria. Nada de «un objeto X».
- Los números y los ejemplos son creíbles: precios reales, distancias reales, cantidades de una etiqueta de verdad.
- Una idea por reto. Si hacen falta dos, son dos retos.
- Nada de trampas de lectura: si el niño falla, que sea por el contenido, no por un «NO» escondido.
- Las preguntas de sí/no o de elegir entre dos solo valen como paso intermedio. Se prefieren las de llevar cosas a su sitio, ordenar, construir, estimar con margen o predecir un resultado.

### 3.2 Cómo se escribe
- Español de España. Se trata de **tú** al alumno. Frases cortas.
- Vocabulario de 10–11 años. Si un término técnico es el contenido, se usa y se explica con un ejemplo, no con otra definición.
- **Negrita** (con `**…**`) solo para el dato clave del reto o de la corrección, una o dos veces como mucho.
- Nada de exclamaciones vacías, felicitaciones de cartón («¡Muy bien, campeón!», «¡Eres un crack!») ni emojis.
- Nada de lemas, eslóganes ni antetítulos en mayúsculas.
- Los textos modelo (lecturas, fragmentos, noticias) tienen que tener **calidad literaria de verdad**. Mejor un texto real adaptado, o uno corto muy cuidado, que uno largo y plano de IA.

### 3.3 Antes y después (para calibrar)
- Antes: «¿Qué es el citoplasma? a) La envoltura b) El medio interior c) El ADN»
  Después: «Pinchas una célula con una aguja muy fina, sin tocar el núcleo. ¿Qué sale?». Y en la corrección: «El citoplasma: el líquido donde flotan los orgánulos. La membrana era la piel que has pinchado.»
- Antes: «Pon el punto donde corresponda.»
  Después: «Léelo en voz alta. Donde tengas que respirar porque cambia la idea, punto. Donde solo hagas una pausa pequeña, coma.» Al comprobar, el texto se lee con tus pausas y se oye dónde no tenían sentido.
- Antes: «¿Cuántos escaños tiene el Congreso? (350)»
  Después: «En tu provincia hay 5 escaños. El partido Verde tiene el 40 % de los votos. ¿Cuántos escaños crees que saca?». Se predice, se reparte y se discute por qué no sale exactamente 2.

---

## 4. Los personajes y su voz

Hay tres ayudantes, con sprites animados ya hechos (15 acciones cada uno). Se elige uno por juego con `personaje`.

| Personaje | Carácter | Cómo habla |
|---|---|---|
| **Goma** | Veterana y tranquila. Los errores se borran. | «Soy Goma. He borrado cosas peores.» · «Error útil: ahora sabes dónde no está.» · «Ni una miga que borrar.» |
| **Boli** (el boli rojo) | El corrector gruñón, orgulloso en secreto. | «A ver qué tenemos aquí.» · «Casi. Y casi no es sí.» · «Perfecto. No se lo digas a nadie, pero me gusta.» |
| **Fosforito** (el subrayador) | Entusiasta: todo le parece importante. | «¡Yo subrayo, tú piensas!» · «¡Esto va directo al resumen!» |

- Humor **seco y breve**, con mala uva amable. Nunca infantiloide, nunca sarcasmo contra el alumno.
- Los personajes no dan lecciones largas. Una o dos frases, y el contenido lo dice la pista o la corrección.
- Las frases genéricas de cada personaje ya están en `motores/voces.js`. En el juego solo se escriben `saludo`, la `frase` de la portada y la `historia`.
- La `frase` de la portada es corta y con gracia: «Los ceros no se cuentan solos.» · «Estírala y verás.» · «Doblo, pincho… ¿y al abrir?».
- La historia en viñetas tiene de 2 a 4 viñetas, con una nota del profe como gancho («EL VIERNES ORDENO ESTE CAJÓN. LO QUE NO SIRVA, A LA PAPELERA.») y los personajes presentando el problema.

---

## 5. Dirección de arte

### 5.1 Dos ambientes
- **La web** (catálogo, fichas de materiales): un archivador de profe. Papel, fotocopias, pestañas de colores de subrayador por área, rótulo en letra de plantilla (Big Shoulders Stencil) y el cajón ilustrado de la portada. Colores de área:
  - Lengua `#FF8AC4`
  - Matemáticas `#7FD6FF`
  - Naturales `#8DF07D`
  - Sociales `#F5F03C`
  - Plástica `#FFB054`
  - Valores `#CDA8FF`
  - Otros cursos `#C9CCC6`
  - Siempre con texto negro encima.
- **Los juegos**: una **mesa de manualidades**. Cartulina recortada con canto, celo, pegatinas, sellos de tinta, sobre una alfombrilla de corte verde y otros escenarios (corcho, estuche, patio, almacén, merienda, feria de noche).

### 5.2 Paleta y letra de los juegos (en `motores/piel.css`)
- Colores:
  - tinta (contornos y texto) `#1b1e3a`
  - papel `#fffdf6`
  - amarillo `#ffc531`
  - cobalto `#2f5bd3`
  - fucsia `#e8417a`
  - cielo `#5ec3ff`
  - lima `#9bd84a`
  - naranja `#ff8a1f`
  - verde alfombrilla `#2e7d5b`
- Borde: `3px solid #1b1e3a`.
- Sombras **duras y desplazadas** (como cartulina sobre la mesa), no difuminados suaves.
- Letras: **Grandstander** para títulos, botones y bocadillos; **Atkinson Hyperlegible Next** para leer. Están en `motores/fonts/`.
- Ligeras rotaciones (−1,5° a 1,5°) en carteles y etiquetas, como pegados a mano.
- Animación con GSAP (`motores/vendor/gsap.js`): rebotes con muelle, piezas que saltan y sellos que caen.
- Siempre se respeta `prefers-reduced-motion`.

### 5.3 Ilustración
- Plana, con **contorno negro o azul marino**, colores sólidos de la paleta y algo de textura de papel. Objetos escolares y de manualidades.
- Prohibido:
  - renders 3D realistas;
  - fotos de stock;
  - degradados de app;
  - *glassmorphism*;
  - emojis como iconos;
  - ilustraciones «corporativas» de personas sin rostro;
  - personajes de otras marcas.
- Las imágenes para los juegos se entregan con fondo plano de un color conocido y contorno cerrado, para poder recortarlas, o directamente en PNG con transparencia. Cada encargo de imagen lleva su `leer-primero` con medidas, nombres de archivo y qué hace cada pieza.

### 5.4 Pantalla de juego
- **No hay *landing page***. El juego abre con su portada ilustrada (escenario, título letra a letra, objetivo en una frase, personaje saludando, «Jugar»), y eso ya lo hace el núcleo.
- Durante el juego se ven siempre la barra de progreso, el botón de pista (?) y el de «Menú».
- Fuera: menús de navegación de web, pies de página, «Mi progreso» y «Para docentes» dentro del juego.

---

## 6. Parte técnica: cómo se hace un juego que encaje

### 6.1 La regla de oro: usar el núcleo común
Todo juego vive en `public/juegos/<slug>/index.html`, y ese archivo **solo lleva un bloque JSON de configuración**. El núcleo (`/juegos/motores/`) pone:
- la pantalla de carga con el personaje bailando;
- la portada;
- la historia;
- los retos con su barra;
- las pistas;
- la adaptación de dificultad;
- la corrección con sellos y estrellas;
- la pantalla final;
- el progreso guardado en la tablet.

Instrucciones de cada motor: https://aronfenix.github.io/la-cajonera/juegos/motores/

**Camino A, el preferido: escribir la configuración de un motor que ya existe.**
- Matemáticas tiene 17 motores (recta, cifras, rejilla, geoplano, multiplica, formas, giros, reparto, ceros, examen, numeros, linea, medida, caja, mental, angulos, tablas).
- Así se hereda todo el estilo sin programar.

Ejemplo real (abreviado):

```json
{
  "motor": "ceros",
  "area": "matematicas",
  "escena": "almacen",
  "personaje": "boli",
  "titulo": "La máquina de ceros",
  "subtitulo": "En el almacén hay una máquina que multiplica. Cada palanca le añade un cero a su número.",
  "portada": { "objetivo": "Predice qué sale de la máquina…", "frase": "Los ceros no se cuentan solos.", "rotulo": "MÁQUINA" },
  "historia": [
    { "nota": "EL VIERNES ORDENO ESTE CAJÓN. LO QUE NO SIRVA, A LA PAPELERA.", "firma": "El profe" },
    { "quien": "boli", "pose": "seguro", "texto": "Esta es la máquina de ceros. Le das dos números y los multiplica." }
  ],
  "saludo": "Primero la tabla, **luego los ceros**.",
  "observa": "¿Por qué 70 × 80 y 7 × 800 dan lo mismo?",
  "niveles": [
    { "modo": "prever", "generar": { "ceros": 1 } },
    { "modo": "consigue", "generar": { "ceros": 2 } },
    { "modo": "ascensor", "generar": { "pesos": [60, 70, 80, 90], "limites": [2500, 3000, 4500] } }
  ],
  "volver": "../la-gran-limpieza/"
}
```

Campos comunes:
- `motor`, `area`, `escena`, `personaje` (`goma` | `boli` | `fosforito`);
- `titulo`, `subtitulo`, `portada {objetivo, frase, rotulo}`, `historia`, `saludo`, `observa`;
- `niveles` (o `rondas`), y opcionalmente `nivelInicial`, `nivelObjetivo` y `maximo`;
- `volver` (adónde lleva «Menú»).

Escenas: `cajon`, `estuche`, `puzle`, `corcho`, `patio`, `almacen`, `merienda`, `feria`.

**Camino B: un motor nuevo**, para Lengua, Naturales, Sociales… Es un módulo JS en `motores/<nombre>.js` con dos funciones:

```js
import { el, svg, num, azar, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';

// opcional: crea un reto a partir de los parámetros del nivel
export function generar(spec) { const d = structuredClone(spec); /* rellena d */ return d; }

// pinta un reto en ctx.escenario y avisa al núcleo al terminar
export function ronda(d, ctx) {
  ctx.reto('Texto del reto, con **el dato clave** en negrita');
  ctx.pista('Una línea de ayuda visible debajo del reto');
  ctx.pistas([{ texto: 'mirada' }, { texto: 'estructura' }, { texto: 'parte de la solución' }]);
  ctx.escenario.append(/* tu tablero */);
  ctx.boton('Comprobar', () => {
    // ctx.aviso('falta algo', true) → aviso sin terminar el reto
    ctx.fin(3, '**Explicación** con los datos de este reto.'); // 0–3 estrellas + corrección
  });
}
```

En `ctx` también están:
- `ctx.di(texto, tipo, ms)`: bocadillo del personaje;
- `ctx.primera`: es el primer reto de la partida;
- `ctx.pizarra`: modo pizarra digital, sin sonidos ni animaciones de corrección;
- `ctx.intento`: 1 o 2;
- `ctx.fx`: efectos.

Después hay que registrar el motor en `MOTORES` de `motores/arranque.js`. Sus estilos van en una hoja propia importada desde `motores/base.css`, usando las variables de `piel.css`. No se inventa otra paleta.

Si el camino B es demasiado para una entrega, se puede entregar el diseño completo y el contenido, y que Claude lo programe:
- mecánica, niveles, retos, pistas, correcciones y errores típicos;
- en un `.md` más un `.json` con los datos.

**Esto es perfectamente válido y suele ser lo más rentable.**

### 6.2 Restricciones técnicas
- Web estática (GitHub Pages). Nada de servidores, cuentas ni APIs externas en tiempo de ejecución. Nada de CDNs: lo que haga falta, en `vendor/`.
- **Cero datos de alumnos**: ni nombres, ni perfiles, ni respuestas que salgan del dispositivo. Nada de cookies ni analítica.
- El progreso se guarda solo en la tablet, en `localStorage`, con claves que empiezan por `cajon-`.
- Tiene que funcionar en tablets del cole (Chrome/Safari), con el dedo y con el teclado, y aguantar una wifi mala. Peso razonable: un juego ≤ 700 KB antes de poder jugar.
- Imágenes en WebP, servidas al tamaño en que se ven.
- Accesibilidad básica:
  - foco visible;
  - `aria-label` en los controles que solo tengan icono;
  - contraste suficiente;
  - nada que dependa solo del color.

### 6.3 La ficha del catálogo
Cada material tiene una ficha en `src/content/materiales/<slug>.md`:

```yaml
---
titulo: La máquina de ceros
tema: matematicas-gran-limpieza   # id del tema (temas en src/content/temas/)
tipo: juego                       # juego | video | comic | ficha | web | herramienta
resumen: Una frase concreta de qué se hace, sin adjetivos de marketing.
fecha: 2026-11-08
portada: /src/media/portadas/la-maquina-de-ceros.jpg
enlace: /juegos/la-maquina-de-ceros/
orden: 3
---
Uno o dos párrafos en primera persona del profe: qué es y cómo lo uso. Nada de inventar práctica de aula: si no se sabe cómo lo usa Álvaro, se deja en blanco para que lo dicte él.
```

La voz de la web es la de Álvaro, en primera persona, sobria y con algo de humor: «Fichas, juegos, cómics y vídeos que hago para mis clases de Primaria, porque el libro no llega a todo. Los uso yo; si te sirven, llévatelos.»

### 6.4 Cómo se entrega
- Lo nuevo se entrega en una carpeta `para-claude-<nombre>` dentro de `Documents\ChatGPT\Imágenes Cajón del profe\`.
- Dentro va un `leer-primero.md` que dice:
  - qué hay;
  - qué decisiones se han tomado;
  - qué no se ha podido hacer;
  - qué tiene que comprobar o decidir Álvaro.
- Las imágenes van en subcarpetas con nombres en minúsculas y con guiones.
- Claude lo integra en el repositorio (`aronfenix/la-cajonera`), lo prueba y lo publica.
- Si se trabaja directamente en el repositorio, se siguen las rutas de §6.1–6.3. Se comprueba que funciona en local antes de dar nada por terminado.

---

## 7. Límites que no se tocan

- No copiar actividades, nombres, personajes ni maquetas del programa de matemáticas del colegio ni de editoriales. Se cubren los mismos contenidos con formas propias.
- No usar la palabra «tramo» en nada público.
- Nada de datos de alumnos (ver §6.2).
- No publicar correos personales ni paneles de profesor.
- No usar personajes, logotipos ni estética reconocible de marcas, series o videojuegos.
- No gastar créditos de servicios de voz (ElevenLabs) sin que Álvaro lo diga.

---

## 8. Otros materiales (fichas, vídeos, herramientas)

- **Fichas imprimibles**: A4, legibles en fotocopia en blanco y negro (que no dependan del color), con tipografías de la casa y poco texto por actividad. Llevan las soluciones aparte.
- **Herramientas de profe** (por ejemplo, el Registro de lectura): sirven para usarlas en clase, en directo, con una mano. Botones grandes y nada que configurar antes de empezar. Ningún dato de alumno sale del dispositivo; si hacen falta, se usan códigos (alumno 1, alumno 2…).
- **Vídeos**: cada vídeo explica una idea y termina con preguntas de comprobación que no son solo de sí/no o de elegir (por ejemplo, llevar competencias a un lado u otro).

---

## 9. Lista final: pásala antes de entregar

**Juego**
- [ ] He hecho la prueba de las dos preguntas (§1) y la mecánica la pasa.
- [ ] Cada reto pide predecir, decidir, construir o explicar, no reconocer.
- [ ] Hay una lista de errores típicos y cada uno tiene su corrección propia.
- [ ] Los retos se generan o hay muchas variantes; no se memorizan en dos partidas.
- [ ] Hay 5–8 niveles y el primero lo saca un alumno que va muy flojo.
- [ ] Cada reto tiene tres pistas graduadas con los datos de ese reto.
- [ ] Cada corrección explica con los números o palabras del alumno.
- [ ] Hay `observa` (pregunta para clase), `frase` de portada e `historia`.

**Estilo**
- [ ] Nada de *landing page*, eslóganes, antetítulos en mayúsculas ni tarjetas genéricas.
- [ ] Paleta, letras, bordes y sombras de `piel.css`; ilustración plana con contorno.
- [ ] Textos cortos, en español de España, de tú, sin emojis ni felicitaciones vacías.
- [ ] El personaje habla poco y con su carácter.

**Técnica**
- [ ] Usa el núcleo de `/juegos/motores/`, por el camino A, el camino B o con el diseño entregado para que lo programe Claude.
- [ ] Funciona con el dedo y con el teclado en tablet, y respeta «reducir movimiento».
- [ ] No guarda ni envía datos de alumnos, ni usa cookies, analítica o CDNs.
- [ ] Va acompañado de un `leer-primero.md` con lo que falta o hay que decidir.

---

## Anexo A. Ideas de mecánicas para otras áreas (como modelo de nivel)

No son encargos cerrados. Sirven para ver qué significa «la mecánica es el contenido» fuera de Matemáticas.

**Naturales**
- *El viaje de la miga*: arrastras una miga de pan por un mapa del cuerpo y cada parada es una decisión. Si la mandas por mal camino, se ve la consecuencia (tos, atasco) y la corrección explica qué aparato hace qué.
- *El portero de la célula*: llegan sustancias a la membrana y decides qué entra y qué sale. La célula se pone mejor o peor según lo que decides.
- *El zoom*: empiezas viendo a una persona y vas acercándote (aparato, órgano, tejido, célula). En cada salto hay que decir qué estás viendo y por qué ya no es lo anterior.
- *La báscula del azúcar*: los gramos de azúcar de una etiqueta real se convierten en terrones que se apilan. Antes de ver el resultado se predice qué zumo lleva más.
- *La clave de las rocas*: aplicas pruebas (rayar con la uña, con una moneda o con un vidrio; vinagre) para identificar el mineral. Gastar menos pruebas da más estrellas.

**Lengua**
- *El puntuador*: un texto sin puntos ni comas. Colocas los signos pensando en respirar y en el cambio de idea, y al comprobar se lee con tus pausas.
- *La máquina de frases*: núcleo, determinante y adjetivo. Si no concuerdan, la máquina se atasca; al cambiar el núcleo a plural, el resto tiene que ajustarse.
- *El buzón del cole*: repartes textos reales (receta, noticia, instrucciones, carta, anuncio) según **para qué sirven**, con trampas como una noticia escrita como un cuento.

**Sociales**
- *El reparto de escaños*: partidos inventados de colores en una provincia de juguete. Se predice cuántos escaños saca cada uno, se reparte y se ve por qué no es proporcional exacto.
- *¿De qué ciudad es este climograma?*: construyes el climograma con los datos y deduces la ciudad entre varias de climas distintos.
- *El río cuesta abajo*: trazas el recorrido de un río sobre un mapa con relieve. Si lo trazas subiendo, el agua «se queja» y explica por qué.

**Plástica**
- *El visor de planos*: un marco que se mueve y se encoge sobre un cuadro de dominio público para encontrar el plano general, el medio, el primer plano y el detalle que pide el reto.

---

## Anexo B. Texto para empezar una conversación con ChatGPT

> Vas a hacer [juego / herramienta / material] para La cajonera, la web de materiales de un maestro de 5.º de Primaria. Antes de nada, lee el libro de estilo adjunto («libro-de-estilo-la-cajonera.md») y síguelo al pie de la letra, sobre todo el §1 (lo que NO se hace) y el §2 (jugabilidad).
>
> Tema: [contenido curricular concreto].
>
> Primero, **sin programar**, entrégame:
> 1. tres mecánicas candidatas, cada una con la prueba de las dos preguntas;
> 2. la lista de errores típicos de un alumno de 10–11 años con este contenido;
> 3. para la mecánica que recomiendes, los niveles, 3 retos de ejemplo con sus tres pistas y las correcciones de cada error típico.
>
> Cuando lo apruebe, haz la entrega según el §6, en la carpeta `para-claude-[nombre]`, con su `leer-primero.md`.
