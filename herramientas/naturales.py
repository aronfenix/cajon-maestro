# Genera los juegos de Naturales (tema 1, «El maniquí de Ciencias») con el motor «vida», su mapa y sus fichas del catálogo.
# Uso: python3 naturales.py      (después: python3 tapas_todas.py <slugs> para las tapas)
import json, os
BASE = '/home/claude/cajon/public/juegos'
FICHAS = '/home/claude/cajon/src/content/materiales'
MAPA = 'el-maniqui-de-ciencias'
VOLVER = f'../{MAPA}/'
FECHA = '2026-11-12'
T = True

PLANTILLA = open(__file__.replace('naturales.py', 'juegos.py')).read().split("PLANTILLA = '''")[1].split("'''")[0]

def escribe(slug, desc, cfg, orden, resumen, cuerpo):
    cfg = {'motor': 'vida', 'area': 'naturales', 'escena': 'laboratorio', 'volver': VOLVER, **cfg}
    os.makedirs(f'{BASE}/{slug}', exist_ok=True)
    with open(f'{BASE}/{slug}/index.html', 'w') as f:
        f.write(PLANTILLA.format(titulo=cfg['titulo'], desc=desc, config=json.dumps(cfg, ensure_ascii=False, indent=2)))
    ficha(slug, cfg['titulo'], resumen, orden, cuerpo)

def ficha(slug, titulo, resumen, orden, cuerpo):
    q = lambda t: json.dumps(t, ensure_ascii=False)
    with open(f'{FICHAS}/{slug}.md', 'w') as f:
        f.write(f'---\ntitulo: {q(titulo)}\ntema: naturales-tema-1\ntipo: juego\nresumen: {q(resumen)}\nfecha: {FECHA}\nportada: /src/media/portadas/{slug}.jpg\nenlace: /juegos/{slug}/\norden: {orden}\n---\n\n{cuerpo}\n')

H = lambda quien, pose, texto: {'quien': quien, 'pose': pose, 'texto': texto}

# ------------------------------------------------------------------ 1. la membrana
escribe('el-portero-de-la-celula', 'Eres la membrana de una célula: decide qué entra y qué sale, y averigua qué parte falla por sus síntomas.', {
  'titulo': 'El portero de la célula', 'personaje': 'goma',
  'subtitulo': 'La membrana decide qué entra en la célula y qué sale. Hoy la membrana eres tú.',
  'portada': {'objetivo': 'Deja pasar lo que la célula necesita, echa lo que le sobra y averigua qué parte falla cuando algo va mal.', 'frase': 'Aquí no entra cualquiera.', 'dibujo': 'celula', 'piezas': ['virus', 'oxigeno'], 'rotulo': 'CÉLULA'},
  'historia': [H('goma', 'seguro', 'Antes de montar nada, lo más pequeño: una célula. Tiene una puerta muy exigente.'), H('goma', 'pista', 'Se llama membrana. Deja pasar lo que hace falta y nada más. A ver qué tal se te da.')],
  'saludo': 'Lo que **necesita**, dentro. Lo que **le sobra**, fuera.',
  'observa': 'Si la membrana dejara pasar todo, ¿qué le pasaría a la célula? ¿Y si no dejara pasar nada?',
  'niveles': [
    {'modo': 'portero', 'generar': {'lados': ['fuera'], 'n': 4}},
    {'modo': 'averia', 'generar': {'sistema': 'celula', 'f': 1}},
    {'modo': 'portero', 'generar': {'lados': ['dentro'], 'n': 4}},
    {'modo': 'averia', 'generar': {'sistema': 'celula', 'f': 2}},
    {'modo': 'portero', 'generar': {'n': 6}},
    {'modo': 'averia', 'generar': {'sistema': 'celula', 'f': 3, 'min': 2}},
  ]}, 1, 'Eres la membrana: dejas pasar o no lo que llega a la célula. Y, por los síntomas, encuentras qué parte falla: membrana, citoplasma, núcleo u orgánulos.',
  'Dos mecánicas. En la primera, el alumno hace de membrana: llegan oxígeno, nutrientes, agua, virus y desechos, por fuera o por dentro, y decide si pasan. En la segunda, la célula tiene un problema («tiene oxígeno de sobra pero no saca energía») y hay que encontrar la parte culpable descartando las que sí funcionan.')

# ------------------------------------------------------------------ 2. unicelulares y pluricelulares
escribe('una-o-muchas', 'Cuenta cuántos seres vivos y cuántas células hay: unicelulares, pluricelulares y alguna trampa.', {
  'titulo': '¿Una o muchas?', 'personaje': 'fosforito',
  'subtitulo': 'Hay seres vivos de una sola célula y seres vivos de muchísimas. Cuéntalos bien.',
  'portada': {'objetivo': 'Cuenta cuántos seres vivos y cuántas células hay en cada lámina del microscopio.', 'frase': '¡Todo es importante! Hasta lo que no se ve.', 'dibujo': 'ameba', 'piezas': ['bacteria', 'paramecio'], 'rotulo': 'MICROSCOPIO'},
  'historia': [H('fosforito', 'celebra', '¡He encontrado el microscopio del laboratorio! ¡Hay bichos diminutos en el agua del florero!'), H('goma', 'piensa', 'Bichos no. Seres vivos de una sola célula. Y no todo lo que se ve ahí está vivo.')],
  'saludo': 'Una ameba es **una célula** y **un ser vivo**. Las dos cosas a la vez.',
  'observa': '¿Puede una célula de tu cuerpo vivir sola en una charca, como una ameba? ¿Por qué?',
  'niveles': [
    {'modo': 'cuenta', 'generar': {'f': 1}},
    {'modo': 'cuenta', 'generar': {'f': 2}},
    {'modo': 'cuenta', 'generar': {'f': 2, 'min': 2}},
    {'modo': 'cuenta', 'generar': {'f': 3, 'min': 2}},
    {'modo': 'cuenta', 'generar': {'f': 3, 'min': 3}},
  ]}, 2, 'Láminas de microscopio: ¿cuántos seres vivos hay y cuántas células? Amebas que se dividen, una hormiga, una célula de tu piel en el suelo, el cigoto…',
  'Cada lámina obliga a separar dos ideas que se suelen confundir: célula y ser vivo. Una ameba es las dos cosas; una célula de la piel en el suelo no es ningún ser vivo; una hormiga es uno solo con muchísimas células. Al final aparece el cigoto, un pluricelular que todavía es una sola célula.')

# ------------------------------------------------------------------ 3. niveles de organización
escribe('la-lupa', 'Acerca y aleja una lupa por los niveles de organización (célula, tejido, órgano, aparato, organismo) y ordena cadenas.', {
  'titulo': 'La lupa', 'personaje': 'goma',
  'subtitulo': 'De una persona a una de sus células hay cinco niveles. La lupa los recorre todos.',
  'portada': {'objetivo': 'Acerca y aleja la lupa hasta el nivel que se describe, y ordena cada cadena desde la célula hasta el organismo.', 'frase': 'Mira de qué está hecho.', 'dibujo': 'lupa', 'piezas': ['neurona', 'corazon'], 'rotulo': 'NIVELES'},
  'historia': [H('boli', 'asombro', 'Esta pieza del maniquí es el corazón. ¿Y esta otra? Un trozo de corazón. ¿Y esta? Un trozo del trozo.'), H('goma', 'seguro', 'Para eso está la lupa. Cada nivel está hecho del anterior. Hasta llegar a la célula.')],
  'saludo': 'Célula, tejido, órgano, aparato, organismo. **Cada uno está hecho del anterior.**',
  'observa': '¿Por qué el corazón es un órgano y no un tejido? ¿Qué le faltaría para ser un aparato?',
  'niveles': [
    {'modo': 'cadena', 'generar': {'tema': 'niveles', 'intrusos': False}},
    {'modo': 'zoom', 'generar': {'niveles': ['celula', 'organismo', 'tejido']}},
    {'modo': 'zoom', 'generar': {'niveles': ['tejido', 'organo']}},
    {'modo': 'cadena', 'generar': {'tema': 'niveles', 'intrusos': True}},
    {'modo': 'zoom', 'generar': {'niveles': ['organo', 'aparato']}},
    {'modo': 'zoom', 'generar': T},
  ]}, 3, 'Una lupa que acerca y aleja: de una persona a su aparato, su órgano, su tejido y su célula. Hay que parar en el nivel que se describe y ordenar cadenas.',
  'La lupa no lleva etiquetas: el reto describe el nivel por lo que es («una sola pieza con varios tejidos distintos») y hay que reconocerlo en la imagen. Cuatro cadenas: sistema nervioso, aparato circulatorio, digestivo y locomotor.')

# ------------------------------------------------------------------ 4. el viaje
escribe('la-miga-perdida', 'Lleva una miga, una bocanada de aire o un desecho por el cuerpo, parada a parada. Si te equivocas, verás qué pasaría.', {
  'titulo': 'La miga perdida', 'personaje': 'boli',
  'subtitulo': 'Una miga, una bocanada de aire, un desecho: cada uno tiene su camino por el cuerpo, y su salida.',
  'portada': {'objetivo': 'Lleva cada cosa por su tramo, ordena los tubos y averigua por dónde sale del cuerpo cada cosa.', 'frase': 'Por la tráquea, no. Créeme.', 'dibujo': 'miga', 'piezas': ['estomago', 'pulmones'], 'rotulo': 'NUTRICIÓN'},
  'historia': [H('fosforito', 'asombro', '¡Se le ha caído una miga dentro al maniquí! ¿Por dónde va?'), H('boli', 'seguro', 'Por donde tiene que ir. Y hay un cruce donde mucha gente se equivoca.')],
  'saludo': 'Cada cosa tiene **su camino**. Los atajos acaban en tos.',
  'observa': '¿Por qué tosemos cuando «se nos va por el otro lado»? ¿Qué dos caminos se cruzan en la faringe?',
  'niveles': [
    {'modo': 'ruta', 'generar': {'rutas': ['miga'], 'tramo': 3}},
    {'modo': 'salida', 'generar': {'f': 1, 'n': 3}},
    {'modo': 'ruta', 'generar': {'rutas': ['aire', 'desecho'], 'tramo': 3}},
    {'modo': 'cadena', 'generar': {'tema': 'nutricion', 'intrusos': False}},
    {'modo': 'salida', 'generar': {'f': 2, 'n': 4}},
    {'modo': 'ruta', 'generar': {'rutas': ['resto', 'co2', 'aire'], 'tramo': 4}},
    {'modo': 'cadena', 'generar': {'tema': 'nutricion', 'intrusos': True}},
    {'modo': 'salida', 'generar': {'f': 3, 'min': 2, 'n': 4}},
  ]}, 4, 'La nutrición como un viaje: llevar una miga, el aire o un desecho por su tramo del cuerpo, ordenar los tubos y decidir por dónde sale cada cosa (orina, sudor, restos de comida, dióxido de carbono).',
  'Los cuatro aparatos de la nutrición trabajando juntos, con tres mecánicas que se alternan. En los tramos, cada parada ofrece tres caminos y los equivocados están elegidos a propósito: la tráquea en vez del esófago, el estómago en vez del intestino para pasar a la sangre. En «¿por dónde sale?» aparece una confusión clásica: los restos de comida no son excreción, porque nunca llegaron a la sangre.')

# ------------------------------------------------------------------ 5. la consulta
escribe('la-consulta', 'Pacientes con síntomas: descarta lo que sí funciona y encuentra el aparato de la nutrición que falla.', {
  'titulo': 'La consulta', 'personaje': 'boli',
  'subtitulo': 'Llegan pacientes con síntomas raros. Por lo que les pasa, averigua qué aparato no funciona.',
  'portada': {'objetivo': 'Lee los síntomas, descarta lo que sí funciona y encuentra el aparato que falla.', 'frase': 'Siguiente paciente. Que pase.', 'dibujo': 'estetoscopio', 'piezas': ['rinones', 'corazon'], 'rotulo': 'CONSULTA'},
  'historia': [H('boli', 'seguro', 'He abierto consulta. Yo corrijo exámenes; esto es parecido: buscar dónde está el fallo.'), H('goma', 'pista', 'Truco de veterana: primero tacha lo que sí funciona. Lo que queda, es.')],
  'saludo': 'Primero, **lo que sí funciona**. Eso se tacha.',
  'observa': 'Si falla el aparato circulatorio, ¿por qué acaban notándolo todos los demás?',
  'niveles': [
    {'modo': 'averia', 'generar': {'sistema': 'nutricion', 'f': 1}},
    {'modo': 'averia', 'generar': {'sistema': 'nutricion', 'f': 2, 'min': 2}},
    {'modo': 'averia', 'generar': {'sistema': 'nutricion', 'f': 2}},
    {'modo': 'averia', 'generar': {'sistema': 'nutricion', 'f': 3, 'min': 3}},
    {'modo': 'averia', 'generar': {'sistema': 'nutricion', 'f': 3, 'min': 2}},
  ]}, 5, 'Una consulta médica: cada paciente trae un síntoma y hay que encontrar qué aparato falla (digestivo, respiratorio, circulatorio o excretor).',
  'Los síntomas están escritos para que haya que pensar en qué hace cada aparato, no en su nombre: «respira bien y le entra oxígeno… pero no le llega a los pies». Cada respuesta equivocada explica por qué ese aparato no es el culpable.')

# ------------------------------------------------------------------ 6. la relación
escribe('la-cadena-del-balon', 'Ordena la cadena de la función de relación (sentidos, nervios, encéfalo, músculos) y encuentra el eslabón que falla.', {
  'titulo': 'La cadena del balón', 'personaje': 'fosforito',
  'subtitulo': 'Ver, decidir, moverse: entre que ves venir el balón y lo coges pasan muchas cosas en muy poco tiempo.',
  'portada': {'objetivo': 'Ordena la cadena de cada respuesta y averigua qué eslabón falla cuando algo sale mal.', 'frase': '¡Cógelo! Bueno, primero míralo.', 'dibujo': 'balon', 'piezas': ['ojo', 'encefalo'], 'rotulo': 'RELACIÓN'},
  'historia': [H('fosforito', 'celebra', '¡Le he lanzado el balón al maniquí y no lo ha cogido!'), H('boli', 'seguro', 'Porque le falta media cadena. Para coger un balón hacen falta los ojos, los nervios, el encéfalo y los músculos. En ese orden.')],
  'saludo': 'Primero se **capta**, luego se **decide**, al final se **mueve**.',
  'observa': '¿Qué parte de la cadena entrena un portero para ser más rápido?',
  'niveles': [
    {'modo': 'cadena', 'generar': {'tema': 'relacion', 'intrusos': False}},
    {'modo': 'averia', 'generar': {'sistema': 'relacion', 'f': 1}},
    {'modo': 'cadena', 'generar': {'tema': 'relacion', 'intrusos': True}},
    {'modo': 'averia', 'generar': {'sistema': 'relacion', 'f': 2, 'min': 2}},
    {'modo': 'averia', 'generar': {'sistema': 'relacion', 'f': 3, 'min': 3}},
    {'modo': 'cadena', 'generar': {'tema': 'relacion', 'intrusos': True}},
  ]}, 6, 'La función de relación como una cadena: ordenar qué pasa desde que ves el balón hasta que lo coges, y encontrar el eslabón roto cuando algo falla.',
  'Tres situaciones (un balón, alguien que dice tu nombre y el olor a bizcocho) para ordenar con una tarjeta intrusa, y averías en la cadena: lo ve pero no entiende qué es, la orden no llega al brazo, se pincha un dedo y no siente nada solo en ese dedo…')

# ------------------------------------------------------------------ 7. aparato locomotor
escribe('tira-y-afloja', 'Contrae y relaja dos músculos para mover el brazo y la pierna, y elige qué articulaciones mueves en cada gesto.', {
  'titulo': 'Tira y afloja', 'personaje': 'goma',
  'subtitulo': 'Los músculos solo saben tirar. Para mover un hueso hacia un lado y hacia el otro hacen falta dos.',
  'portada': {'objetivo': 'Contrae y relaja los músculos para mover el brazo y la pierna, y encuentra qué articulaciones mueves en cada gesto.', 'frase': 'Aquí nadie empuja. Todos tiran.', 'dibujo': 'musculo', 'piezas': ['hueso', 'balon'], 'rotulo': 'LOCOMOTOR'},
  'historia': [H('boli', 'piensa', 'El brazo del maniquí se dobla, pero no se estira solo. ¿Le falta un músculo que empuje?'), H('goma', 'seguro', 'Ningún músculo empuja. Le falta el de detrás, que tira hacia el otro lado.')],
  'saludo': 'Un músculo **contraído** se acorta y **tira**. Uno relajado se deja estirar.',
  'observa': 'Si los músculos solo tiran, ¿cómo estiras el brazo? ¿Cuántos músculos hacen falta para mover un hueso adelante y atrás?',
  'niveles': [
    {'modo': 'musculo', 'generar': {'partes': ['brazo'], 'objetivos': ['dobla', 'estira']}},
    {'modo': 'articulacion', 'generar': {'f': 1}},
    {'modo': 'musculo', 'generar': {'partes': ['brazo']}},
    {'modo': 'articulacion', 'generar': {'f': 2, 'min': 2}},
    {'modo': 'musculo', 'generar': {'partes': ['pierna']}},
    {'modo': 'articulacion', 'generar': {'f': 3, 'min': 3}},
    {'modo': 'musculo', 'generar': {'partes': ['brazo', 'pierna']}},
  ]}, 7, 'Un brazo y una pierna de cartulina con dos músculos cada uno: se decide cuál se contrae y cuál se relaja, y se prueba. También, qué articulaciones mueves para chutar, masticar o sentarte.',
  'El error que ataca es muy común: creer que los músculos empujan. Aquí cada músculo solo puede contraerse (tira) o relajarse, y el alumno lo comprueba moviendo el brazo: bíceps y tríceps, cuádriceps e isquiotibiales. Incluye las articulaciones fijas (el cráneo) y las móviles.')

# ------------------------------------------------------------------ 8. reproducción
escribe('la-primera-celula', 'Del cigoto al bebé: predice cuántas células salen al dividirse y ordena fecundación, embarazo y parto.', {
  'titulo': 'La primera célula', 'personaje': 'fosforito',
  'subtitulo': 'Todos empezamos siendo una sola célula. Luego, a dividirse.',
  'portada': {'objetivo': 'Predice cuántas células salen de cada división y ordena el camino desde la fecundación hasta el parto.', 'frase': '¡Una! ¡Dos! ¡Cuatro! ¡Esto no para!', 'dibujo': 'cigoto', 'piezas': ['ovulo', 'bebe'], 'rotulo': 'REPRODUCCIÓN'},
  'historia': [H('goma', 'seguro', 'Cada célula sale de la división de otra. Entonces, ¿de dónde sale la primera?'), H('fosforito', 'pista', '¡De la unión de un óvulo y un espermatozoide! Se llama cigoto. ¡Y luego se divide sin parar!')],
  'saludo': 'Cada vez que se divide, **todas** las células se parten en dos.',
  'observa': 'Si cada célula procede de la división de otra, ¿de dónde salió la primera célula de tu cuerpo?',
  'niveles': [
    {'modo': 'divide', 'generar': {'n': [1, 2]}},
    {'modo': 'divide', 'generar': {'n': [3]}},
    {'modo': 'cadena', 'generar': {'tema': 'reproduccion', 'intrusos': False}},
    {'modo': 'divide', 'generar': {'n': [4, 5]}},
    {'modo': 'cadena', 'generar': {'tema': 'reproduccion', 'intrusos': True}},
    {'modo': 'divide', 'generar': {'n': [3, 4, 5], 'inverso': True}},
    {'modo': 'divide', 'generar': {'n': [6]}},
  ]}, 8, 'El cigoto se divide: predecir cuántas células habrá después de cada división y ordenar el camino de la fecundación al parto, con tarjetas trampa.',
  'Une la reproducción con la idea de que cada célula procede de otra. Primero se predice y luego se comprueba viendo cómo se duplican. La cadena de la fecundación al parto lleva dos tarjetas con errores frecuentes: que el bebé crece en el estómago o que los óvulos se fabrican en los testículos.')

# ------------------------------------------------------------------ 9. el examen
escribe('el-examen-del-maniqui', 'Repaso de todo el tema 1 de Naturales mezclando los juegos del maniquí.', {
  'titulo': 'El examen del maniquí', 'personaje': 'boli',
  'subtitulo': 'El maniquí ya está montado. Ahora el profe va a preguntar por cada pieza.',
  'portada': {'objetivo': 'Un poco de todo: la célula, los niveles, la nutrición, la relación y la reproducción.', 'frase': 'Pregunta el profe. Corrijo yo.', 'dibujo': 'maniqui', 'piezas': ['celula', 'corazon'], 'rotulo': 'EXAMEN'},
  'historia': [H('boli', 'seguro', 'Lunes. El maniquí está en su sitio. El profe ha sacado su libreta.'), H('fosforito', 'asombro', '¡Va a preguntar por cada pieza! ¿Y si no me acuerdo?'), H('goma', 'animo', 'Te acuerdas. Lo has montado tú.')],
  'saludo': 'De todo un poco. **Sin prisa.**',
  'observa': '¿Qué parte del tema te ha costado más? ¿Qué juego volverías a jugar antes del control?',
  'niveles': [
    {'modo': 'cuenta', 'generar': {'f': 2}},
    {'modo': 'portero', 'generar': {'n': 5}},
    {'modo': 'zoom', 'generar': T},
    {'modo': 'ruta', 'generar': {'rutas': ['miga', 'aire'], 'tramo': 4}},
    {'modo': 'salida', 'generar': {'f': 2, 'n': 3}},
    {'modo': 'averia', 'generar': {'sistema': 'nutricion', 'f': 2, 'min': 2}},
    {'modo': 'cadena', 'generar': {'tema': 'relacion', 'intrusos': True}},
    {'modo': 'musculo', 'generar': {'partes': ['brazo', 'pierna']}},
    {'modo': 'divide', 'generar': {'n': [4, 5]}},
    {'modo': 'averia', 'generar': {'sistema': 'celula', 'f': 3, 'min': 2}},
  ]}, 9, 'El final de la aventura: retos de todos los juegos del maniquí mezclados, para repasar el tema 1 antes del control.',
  'Se abre en el mapa cuando el maniquí está montado, aunque se puede jugar suelto en cualquier momento.')

# ------------------------------------------------------------------ el mapa
mapa = {
  'titulo': 'El maniquí de Ciencias',
  'subtitulo': 'El maniquí del laboratorio se ha caído del armario y tiene las piezas por toda la clase. Para montarlo hay que saber qué hace cada una. Se puede jugar en orden o empezar por cualquiera.',
  'escena': 'laboratorio', 'volver': '../../naturales/',
  'textos': {'sello': 'MONTADO', 'hechos': 'montadas', 'icono': 'el-examen-del-maniqui', 'listo': 'El maniquí está entero. Ya puedes hacer el examen.', 'boton': 'Hacer el examen', 'repetir': 'Repetir el examen'},
  'historia': [
    {'nota': 'EL LUNES NECESITO EL MANIQUÍ DE CIENCIAS PARA EXPLICAR EL CUERPO HUMANO. ENTERO.', 'firma': 'El profe'},
    H('boli', 'asombro', '¿Entero? Tiene el corazón debajo del radiador y un pulmón en la papelera.'),
    H('fosforito', 'pista', '¡No vale encajar a lo loco! Si sabemos qué hace cada pieza, sabremos dónde va.'),
    H('goma', 'seguro', 'Empezamos por lo más pequeño. Lo grande ya vendrá.'),
  ],
  'compartimentos': [
    {'nombre': 'Lo más pequeño', 'material': 'lab', 'quien': 'goma', 'color': '#ffb3c7', 'juegos': [{'slug': 'el-portero-de-la-celula', 'titulo': 'El portero de la célula'}, {'slug': 'una-o-muchas', 'titulo': '¿Una o muchas?'}, {'slug': 'la-lupa', 'titulo': 'La lupa'}]},
    {'nombre': 'Comer y respirar', 'material': 'lab', 'quien': 'boli', 'color': '#ff8a1f', 'juegos': [{'slug': 'la-miga-perdida', 'titulo': 'La miga perdida'}]},
    {'nombre': 'La consulta', 'material': 'lab', 'quien': 'boli', 'color': '#ffc531', 'juegos': [{'slug': 'la-consulta', 'titulo': 'La consulta'}]},
    {'nombre': 'Ver y decidir', 'material': 'lab', 'quien': 'fosforito', 'color': '#5ec3ff', 'juegos': [{'slug': 'la-cadena-del-balon', 'titulo': 'La cadena del balón'}]},
    {'nombre': 'Moverse', 'material': 'lab', 'quien': 'goma', 'color': '#9bd84a', 'juegos': [{'slug': 'tira-y-afloja', 'titulo': 'Tira y afloja'}]},
    {'nombre': 'La primera célula', 'material': 'lab', 'quien': 'fosforito', 'color': '#cda8ff', 'juegos': [{'slug': 'la-primera-celula', 'titulo': 'La primera célula'}]},
  ],
  'final': {'nombre': 'El examen del maniquí', 'slug': 'el-examen-del-maniqui', 'cerrado': 'Se abre cuando el maniquí esté entero.', 'abierto': 'Montado. El profe lo ha mirado dos veces.',
    'historia': [H('boli', 'seguro', 'Lunes. El profe ha abierto el armario. El maniquí estaba entero, con el corazón en su sitio.'), H('fosforito', 'celebra', '¡Ha dicho «qué bien lo habéis montado»! ¡Lo subrayo!'), H('goma', 'animo', 'Lo difícil no era encajarlo. Era saber qué hace cada pieza.')]},
}
os.makedirs(f'{BASE}/{MAPA}', exist_ok=True)
with open(f'{BASE}/{MAPA}/index.html', 'w') as f:
    f.write(f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{mapa['titulo']} · La cajonera</title>
<meta name="description" content="Aventura de Naturales: el maniquí del laboratorio se ha caído y hay que montarlo sabiendo qué hace cada pieza. Célula, niveles de organización, nutrición, relación y reproducción.">
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../motores/base.css">
</head>
<body data-area="naturales">
<!-- Mapa de una aventura. Para otro bloque: copiar esta carpeta y cambiar los compartimentos. -->
<script type="application/json" id="mapa">
{json.dumps(mapa, ensure_ascii=False, indent=2)}
</script>
<script type="module">
import {{ montaMapa }} from '../motores/mapa.js';
montaMapa(JSON.parse(document.getElementById('mapa').textContent));
</script>
</body>
</html>
''')
ficha(MAPA, mapa['titulo'], 'Aventura del tema 1: el maniquí del laboratorio se ha caído y hay que montarlo sabiendo qué hace cada pieza. Nueve juegos sobre la célula, los niveles de organización, la nutrición, la relación y la reproducción.', 0,
  'El mapa de la aventura: seis bandejas de laboratorio con las piezas del maniquí. Cada bandeja agrupa uno o dos juegos y se marca como «montada» cuando están hechos en esa tablet. No bloquea nada: cada juego se puede jugar suelto. Al final, el examen mezcla un poco de todo.')
print('ok')
