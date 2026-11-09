# La Feria de Otoño: juegos de repaso (números, cálculo, medida, ángulos y tablas). python3 feria.py
import json, os
exec(open('/home/claude/herramientas/juegos.py').read().split("PERSONAJES =")[0])
def escribe(slug, desc, cfg, quien='goma'):
    cfg = {"area": "matematicas", "escena": "feria", "volver": VOLVER, **cfg, 'personaje': quien}
    os.makedirs(f'{BASE}/{slug}', exist_ok=True)
    with open(f'{BASE}/{slug}/index.html', 'w') as f:
        f.write(PLANTILLA.format(titulo=cfg['titulo'], desc=desc, config=json.dumps(cfg, ensure_ascii=False, indent=2)))
VOLVER = '../la-feria-de-otono/'
T = True
CARTEL = {"nota": "LOS FERIANTES HAN IDO A CENAR. VUELVEN A LAS NUEVE. NO TOQUÉIS NADA.", "firma": "La organización"}

escribe('la-tombola', 'Ordenar números de cuatro cifras colgando boletos de la tómbola en una cuerda, de menor a mayor o de mayor a menor.', {
  "motor": "numeros", "titulo": "La tómbola",
  "subtitulo": "Los boletos de la tómbola se han caído a la cesta. Hay que volver a colgarlos, cada uno en su pinza y en orden.",
  "portada": {"rotulo": "TÓMBOLA", "objetivo": "Cuelga los boletos en la cuerda, en orden. Si alguno está mal, se cae.", "frase": "¡Se han soltado todos los boletos!"},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "asombro", "texto": "¡No toquéis nada! …Uy. Ya se han caído todos los boletos de la tómbola."},
    {"quien": "fosforito", "pose": "pista", "texto": "Van colgados en orden. Si los cuelgas mal, la gente se lleva el premio de otro."}],
  "observa": "¿Qué cifra miras primero para saber qué boleto es más pequeño? ¿Y si dos boletos empiezan por la misma cifra?",
  "niveles": [
    {"modo": "tendedero", "generar": {"cantidad": 4, "parecido": 0}},
    {"modo": "tendedero", "generar": {"cantidad": 5, "parecido": 0, "orden": "baja"}},
    {"modo": "tendedero", "generar": {"cantidad": 5, "parecido": 1}},
    {"modo": "tendedero", "generar": {"cantidad": 6, "parecido": 1, "orden": "baja"}},
    {"modo": "tendedero", "generar": {"cantidad": 5, "parecido": 2}},
    {"modo": "tendedero", "generar": {"cantidad": 6, "mismas": T}, "texto": "Todos tienen **las mismas cifras**. Cuélgalos de **menor a mayor**"},
    {"modo": "tendedero", "generar": {"cantidad": 6, "parecido": 0, "tres": T}},
    {"modo": "tendedero", "generar": {"cantidad": 6, "mismas": T, "orden": "baja"}, "texto": "Las mismas cifras, colocadas de otra forma. De **mayor a menor**"}
  ]
}, 'fosforito')

escribe('el-candado-de-la-taquilla', 'Formar con unas cifras el mayor número, el menor, uno mayor o menor que otro dado, o el más cercano por encima, girando las ruedas de un candado.', {
  "motor": "numeros", "titulo": "El candado de la taquilla",
  "subtitulo": "La caja del dinero tiene un candado de ruedas, y solo se abre con el número que dice la regla.",
  "portada": {"rotulo": "TAQUILLA", "objetivo": "Gira las ruedas del candado con las cifras que hay. Cada cifra, una vez.", "frase": "La combinación no la sé. Pero sé cómo pensarla."},
  "historia": [CARTEL,
    {"quien": "boli", "pose": "piensa", "texto": "La caja de la taquilla está cerrada con candado. Y la combinación no la ha dejado nadie apuntada."},
    {"quien": "boli", "pose": "seguro", "texto": "Pero el candado tiene sus reglas. Con las cifras que hay y un poco de cabeza, se abre."}],
  "observa": "Para el **mayor** número, ¿dónde pones la cifra más grande? ¿Y para el **menor**, qué pasa con el 0?",
  "niveles": [
    {"modo": "candado", "generar": {"tipo": "mayor"}},
    {"modo": "candado", "generar": {"tipo": "menor"}},
    {"modo": "candado", "generar": {"tipo": "menor", "cero": T}},
    {"modo": "candado", "generar": {"tipo": "mayorQue"}},
    {"modo": "candado", "generar": {"tipo": "menorQue", "disponibles": 5}},
    {"modo": "candado", "generar": {"tipo": "mayor", "disponibles": 6, "cero": T}},
    {"modo": "candado", "generar": {"tipo": "menor", "disponibles": 6, "cero": T}},
    {"modo": "candado", "generar": {"tipo": "justoEncima"}},
    {"modo": "candado", "generar": {"tipo": "justoDebajo", "disponibles": 5, "cero": T}}
  ]
}, 'boli')

escribe('la-caseta-de-los-records', 'Medir objetos en centímetros con una regla que se arrastra, con una regla rota que no empieza en 0, y calcular cuántos centímetros más mide uno que otro.', {
  "motor": "medida", "titulo": "La caseta de los récords",
  "subtitulo": "Aquí se apuntan los récords de la feria: el churro más largo, la piruleta más larga… Pero hay que medirlos bien.",
  "portada": {"rotulo": "RÉCORDS", "objetivo": "Mide con la regla. Ojo: no siempre está en su sitio, y a veces está rota.", "frase": "¿Récord? Eso hay que medirlo."},
  "historia": [CARTEL,
    {"quien": "goma", "pose": "seguro", "texto": "En esta caseta se apuntan récords. Y hay gente muy lista que pone la regla donde le conviene."},
    {"quien": "goma", "pose": "pista", "texto": "Mira dónde **empieza** y dónde **acaba**. Lo que mide es lo que hay entre medias."}],
  "observa": "Si la regla no empieza en 0, ¿cómo sabes lo que mide? ¿Hace falta mover la regla?",
  "niveles": [
    {"modo": "mide", "fija": T, "generar": T},
    {"modo": "mide", "generar": T},
    {"modo": "mide", "guias": False, "generar": T},
    {"modo": "rota", "generar": T},
    {"modo": "diferencia", "generar": T},
    {"modo": "rota", "guias": False, "generar": T},
    {"modo": "diferencia", "guias": False, "generar": T}
  ]
}, 'goma')

escribe('el-martillo-de-fuerza', 'Estimar el resultado de sumas y restas con números de cuatro cifras marcándolo en una recta vertical de 0 a 10 000, o eligiendo la opción más cercana.', {
  "motor": "linea", "titulo": "El martillo de fuerza",
  "subtitulo": "Cuanto más grande es el resultado de la cuenta, más sube el disco. Antes del golpe, marca hasta dónde crees que llegará.",
  "portada": {"rotulo": "¡DING!", "objetivo": "Estima el resultado y márcalo en la torre. Si te acercas, suena la campana.", "frase": "No hace falta la cuenta exacta. Hace falta buen ojo."},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "celebra", "texto": "¡El martillo de fuerza! Aquí no gana el que más fuerza tiene, gana el que mejor calcula a ojo."},
    {"quien": "fosforito", "pose": "pista", "texto": "Redondea los números y haz la cuenta fácil. Luego marca en la torre."}],
  "observa": "¿Cómo redondeas para estimar? ¿Es mejor redondear a los millares o a las centenas?",
  "niveles": [
    {"modo": "martillo", "generar": {"op": "suma", "a": [1000, 6999], "b": [1000, 2999]}, "marcas": [0, 5000, 10000]},
    {"modo": "martillo", "elige": T, "generar": {"op": "suma", "a": [1000, 5999], "b": [1000, 3999]}},
    {"modo": "martillo", "generar": {"op": "suma", "a": [1000, 8999], "b": [100, 999]}},
    {"modo": "martillo", "generar": {"op": "resta", "a": [3000, 9999], "b": [100, 3999]}, "marcas": [0, 5000, 10000]},
    {"modo": "martillo", "elige": T, "generar": {"op": "resta", "a": [5000, 9999], "b": [200, 3999]}},
    {"modo": "martillo", "generar": {"op": "mezcla", "a": [1000, 9999], "b": [100, 3999]}},
    {"modo": "martillo", "elige": T, "generar": {"op": "mezcla", "a": [1000, 9999], "b": [100, 3999]}}
  ]
}, 'fosforito')

escribe('la-tirolina', 'Estimar la posición de números en una recta de 0 a 10 000 y de 0 a un millón: colocar un número en su sitio y leer el número de una posición.', {
  "motor": "linea", "titulo": "La tirolina",
  "subtitulo": "Un cable va del 0 a la torre de enfrente. Goma se tira por él y hay que saber dónde va a parar.",
  "portada": {"rotulo": "TIROLINA", "objetivo": "Lleva a Goma por el cable hasta el número, o di a ojo por dónde va.", "frase": "Yo me tiro. Tú calculas."},
  "historia": [CARTEL,
    {"quien": "boli", "pose": "piensa", "texto": "Goma quiere tirarse por la tirolina. Yo no subo ahí ni loco."},
    {"quien": "boli", "pose": "seguro", "texto": "Mi trabajo es decirle dónde parar. El cable tiene números, aunque no estén escritos."}],
  "observa": "¿Qué número está en la mitad del cable? ¿Y en un cuarto? ¿Cómo te ayuda eso a colocar los demás?",
  "niveles": [
    {"modo": "tirolina", "max": 10000, "marcas": [0, 5000, 10000], "generar": {"redondeo": 1}},
    {"modo": "tirolina", "max": 10000, "generar": {"redondeo": 1, "evitar": T}},
    {"modo": "tirolina", "max": 10000, "lee": T, "marcas": [0, 5000, 10000], "generar": {"redondeo": 100}},
    {"modo": "tirolina", "max": 10000, "lee": T, "generar": {"redondeo": 10}},
    {"modo": "tirolina", "max": 1000000, "marcas": [0, 500000, 1000000], "generar": {"redondeo": 1}},
    {"modo": "tirolina", "max": 1000000, "generar": {"redondeo": 1, "evitar": T}},
    {"modo": "tirolina", "max": 1000000, "lee": T, "generar": {"redondeo": 1000}}
  ]
}, 'boli')
print('feria ok')

escribe('la-caja-registradora', 'Sumas de cuatro cifras con llevadas: primero juntando fichas de feria y cambiando 10 por 1, luego con la cuenta escrita y colocando bien los números.', {
  "motor": "caja", "titulo": "La caja registradora",
  "subtitulo": "Hay que cuadrar la caja de la taquilla. Cuando un cajón llega a 10, se cambia por uno del cajón de al lado.",
  "portada": {"rotulo": "TAQUILLA", "objetivo": "Junta las fichas, cambia 10 por 1 cuando haga falta y escribe el total.", "frase": "¡Diez sueltas no caben en una cifra!"},
  "historia": [CARTEL,
    {"quien": "boli", "pose": "seguro", "texto": "Alguien tiene que hacer la caja de la taquilla. Y ese alguien soy yo, que soy el que corrige."},
    {"quien": "boli", "pose": "pista", "texto": "Regla de oro: ningún cajón puede tener 10. Si llega a 10, se cambian por uno del cajón de la izquierda."}],
  "observa": "¿Qué tiene que ver cambiar 10 tiras por un taco con **llevarse una** en la cuenta escrita?",
  "niveles": [
    {"modo": "caja", "generar": {"op": "suma", "llevadas": 0}},
    {"modo": "caja", "generar": {"op": "suma", "llevadas": 1}},
    {"modo": "caja", "generar": {"op": "suma", "llevadas": 2}},
    {"modo": "columnas", "generar": {"op": "suma", "llevadas": 1}},
    {"modo": "columnas", "generar": {"op": "suma", "llevadas": 2}},
    {"modo": "columnas", "colocar": T, "generar": {"op": "suma", "llevadas": 2, "cifrasB": 3}},
    {"modo": "columnas", "generar": {"op": "suma", "llevadas": 3}},
    {"modo": "columnas", "colocar": T, "generar": {"op": "suma", "llevadas": 3, "cifrasB": 3}}
  ]
}, 'boli')

escribe('el-cambio', 'Restas de cuatro cifras con llevadas: sacar fichas de la caja rompiendo una de la izquierda en diez cuando no llegan, y luego la cuenta escrita, también con ceros.', {
  "motor": "caja", "titulo": "El cambio",
  "subtitulo": "La noria necesita fichas y hay que sacarlas de la caja. Cuando en un cajón no hay bastantes, se rompe una del cajón de la izquierda.",
  "portada": {"rotulo": "CAMBIO", "objetivo": "Saca las fichas que piden. Si no llegan, rompe una de la izquierda en diez.", "frase": "¿No hay bastantes? Se rompe una."},
  "historia": [CARTEL,
    {"quien": "goma", "pose": "seguro", "texto": "La noria pide fichas. Hay que sacarlas de la caja sin que se descuadre."},
    {"quien": "goma", "pose": "pista", "texto": "Si un cajón se queda corto, coges un taco del de al lado y lo deshaces en diez tiras. Nada se pierde."}],
  "observa": "Cuando rompes un taco en 10 tiras, ¿tienes más fichas o las mismas? ¿Y qué pasa cuando el cajón de al lado está vacío?",
  "niveles": [
    {"modo": "caja", "generar": {"op": "resta", "llevadas": 0}},
    {"modo": "caja", "generar": {"op": "resta", "llevadas": 1}},
    {"modo": "caja", "generar": {"op": "resta", "llevadas": 2}},
    {"modo": "columnas", "generar": {"op": "resta", "llevadas": 1}},
    {"modo": "columnas", "generar": {"op": "resta", "llevadas": 2}},
    {"modo": "columnas", "colocar": T, "generar": {"op": "resta", "llevadas": 2, "cifrasB": 3}},
    {"modo": "caja", "generar": {"op": "resta", "llevadas": 2, "ceros": T}},
    {"modo": "columnas", "generar": {"op": "resta", "llevadas": 3}},
    {"modo": "columnas", "generar": {"op": "resta", "llevadas": 2, "ceros": T}}
  ]
}, 'goma')

escribe('la-noria', 'Cálculo mental por parejas: 6 − 4 y 600 − 400, 830 − 300 y 830 − 290, 600 + 130 + 7, sumas de millares y completar centenas.', {
  "motor": "mental", "titulo": "La noria",
  "subtitulo": "Seis cabinas, seis cuentas de cabeza. Las cuentas vienen de dos en dos, y la primera ayuda a hacer la segunda.",
  "portada": {"rotulo": "NORIA", "objetivo": "Haz cada cuenta de cabeza. La de antes te da una pista para la siguiente.", "frase": "Sube, que no muerde."},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "celebra", "texto": "¡La noria! Cada cabina lleva una cuenta pegada. Si la aciertas, la cabina sube."},
    {"quien": "fosforito", "pose": "pista", "texto": "Van por parejas. Si sabes 830 − 300, la de 830 − 290 es casi regalada."}],
  "observa": "¿Por qué restar 290 es lo mismo que restar 300 y luego sumar 10?",
  "niveles": [
    {"modo": "noria", "generar": {"tipos": ["decenas"]}},
    {"modo": "noria", "generar": {"tipos": ["millares", "decenas"]}},
    {"modo": "noria", "generar": {"tipos": ["redondos", "decenas"]}},
    {"modo": "noria", "generar": {"tipos": ["compuestas"]}},
    {"modo": "noria", "generar": {"tipos": ["compensar"]}},
    {"modo": "noria", "generar": {"tipos": ["compensar", "compuestas", "redondos"]}},
    {"modo": "noria", "generar": {"tipos": ["mezcla"]}}
  ]
}, 'fosforito')

escribe('los-patitos', 'El número oculto: completar sumas y restas con el número que falta (45 − ? = 24, ? − 18 = 27), pescando el patito correcto.', {
  "motor": "mental", "titulo": "Los patitos",
  "subtitulo": "Cada cuenta tiene un hueco, y en el estanque nada el número que falta. Solo uno de los patitos es el bueno.",
  "portada": {"rotulo": "PATITOS", "objetivo": "Pesca el patito que completa la cuenta. Si fallas, el patito se va al agua.", "frase": "Todos los patitos parecen buenos. Solo uno lo es."},
  "historia": [CARTEL,
    {"quien": "goma", "pose": "piensa", "texto": "A las cuentas de esta caseta se les ha caído un número al agua."},
    {"quien": "goma", "pose": "pista", "texto": "Antes de pescar, prueba en tu cabeza: pon el número en el hueco y mira si la cuenta sale."}],
  "observa": "En **45 − ? = 24**, ¿por qué no vale 69, si 45 + 24 = 69?",
  "niveles": [
    {"modo": "patitos", "generar": {"tipos": ["sumaMedio"], "rango": [10, 40], "patos": 4}},
    {"modo": "patitos", "generar": {"tipos": ["restaMedio"], "rango": [10, 50], "patos": 4}},
    {"modo": "patitos", "generar": {"tipos": ["restaMedio", "sumaPrimero"], "rango": [20, 60]}},
    {"modo": "patitos", "generar": {"tipos": ["restaPrimero"], "rango": [20, 70]}},
    {"modo": "patitos", "generar": {"tipos": ["mezcla"], "rango": [20, 99]}},
    {"modo": "patitos", "generar": {"tipos": ["mezcla"], "rango": [100, 400], "patos": 6}}
  ]
}, 'goma')

escribe('las-colchonetas', 'Saltos de 10 y de 100 hacia delante y hacia atrás desde números de cuatro cifras, cruzando centenas y millares, y averiguar de cuánto es cada salto.', {
  "motor": "mental", "titulo": "Las colchonetas",
  "subtitulo": "Una fila de camas elásticas. Fosforito salta de una a otra, y cada salto suma (o resta) siempre lo mismo… o casi.",
  "portada": {"rotulo": "¡BOING!", "objetivo": "Escribe dónde cae Fosforito en cada colchoneta. Si te equivocas, se pega un tortazo.", "frase": "¡Yo salto, tú cuentas!"},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "celebra", "texto": "¡Las colchonetas! Cada una tiene un número, y yo salto de una a la siguiente."},
    {"quien": "fosforito", "pose": "asombro", "texto": "Pero los carteles se han borrado. Si no sabes dónde caigo, no sé dónde poner los pies."}],
  "observa": "Al saltar de 10 en 10, ¿qué cifra cambia? ¿Qué pasa cuando esa cifra es un 9?",
  "niveles": [
    {"modo": "colchonetas", "generar": {"saltos": [10, 10, 10]}},
    {"modo": "colchonetas", "generar": {"saltos": [100, 100, 100]}},
    {"modo": "colchonetas", "generar": {"saltos": [10, 10, 10, 10], "cruzar": T}},
    {"modo": "colchonetas", "generar": {"saltos": [10, 10, 10], "atras": T}},
    {"modo": "colchonetas", "generar": {"saltos": [100, 100, 100, 100], "cruzar": T}},
    {"modo": "colchonetas", "generar": {"saltos": [100, 100, 100], "atras": T, "cruzar": T}},
    {"modo": "colchonetas", "generar": {"saltos": [1000, 100, 10, 1], "barajar": T}},
    {"modo": "colchonetas", "generar": {"saltos": [2000, 400, 10, 2], "barajar": T, "pregunta": "salto"}},
    {"modo": "colchonetas", "generar": {"saltos": [3000, 500, 30, 8], "barajar": T, "pregunta": "mixto"}}
  ]
}, 'fosforito')

escribe('pares-y-nones', 'Sumas y restas pares o impares: colocar números para que el resultado sea par o impar, y decidirlo sin hacer la cuenta mirando la última cifra.', {
  "motor": "mental", "titulo": "Pares y nones",
  "subtitulo": "El juego de toda la vida, con cartas: ¿saldrá par o impar? Hay un truco para saberlo sin hacer la cuenta.",
  "portada": {"rotulo": "¿PAR?", "objetivo": "Pon dos cartas para que salga lo que pide el cartel. Y luego, el truco.", "frase": "¿Pares o nones? Yo nones. Bueno, depende."},
  "historia": [CARTEL,
    {"quien": "boli", "pose": "piensa", "texto": "En esta caseta se apuesta a pares o nones. Yo siempre gano, porque hago trampa."},
    {"quien": "boli", "pose": "seguro", "texto": "La trampa es legal: solo miro **la última cifra**. Descúbrela tú."}],
  "observa": "¿Qué sale al sumar dos impares? ¿Y al restarlos? ¿Pasa lo mismo con números enormes?",
  "niveles": [
    {"modo": "pares", "generar": {"op": "+", "quiere": "par", "rango": [11, 49]}},
    {"modo": "pares", "generar": {"op": "+", "quiere": "impar", "rango": [11, 99]}},
    {"modo": "pares", "generar": {"op": "−", "quiere": "impar", "rango": [11, 99], "cartas": 5}},
    {"modo": "pares", "rapido": T, "generar": {"ops": ["+"], "rango": [10, 999]}},
    {"modo": "pares", "generar": {"op": "−", "quiere": "par", "rango": [101, 999], "cartas": 5}},
    {"modo": "pares", "rapido": T, "generar": {"rango": [1000, 9999]}}
  ]
}, 'boli')

escribe('la-bascula', 'Colocar cifras en una suma o una resta para que el resultado quede entre dos números, con una báscula que marca la zona buena.', {
  "motor": "mental", "titulo": "La báscula",
  "subtitulo": "La báscula de «adivina el peso» marca en verde la zona buena. Coloca las cifras para que la aguja caiga ahí.",
  "portada": {"rotulo": "BÁSCULA", "objetivo": "Coloca las cifras para que la aguja caiga en la zona verde. Cada pesada te dice si te pasas.", "frase": "Ni mucho ni poco. Justo."},
  "historia": [CARTEL,
    {"quien": "goma", "pose": "seguro", "texto": "La báscula de la feria no pesa cosas: pesa cuentas."},
    {"quien": "goma", "pose": "pista", "texto": "Antes de colocar, piensa qué cifras dan un número grande y cuáles uno pequeño. Las de la izquierda mandan."}],
  "observa": "¿Qué cifras cambias primero cuando te pasas mucho? ¿Y cuando te pasas solo un poquito?",
  "niveles": [
    {"modo": "bascula", "generar": {"forma": ["d", "+", "d"], "cifras": 4, "ancho": 3, "maxFraccion": 0.35}},
    {"modo": "bascula", "generar": {"forma": ["dd", "+", "d"], "ancho": 10}},
    {"modo": "bascula", "generar": {"forma": ["dd", "−", "d"], "ancho": 8}},
    {"modo": "bascula", "generar": {"forma": ["dd", "+", "dd"], "ancho": 14}},
    {"modo": "bascula", "generar": {"forma": ["dd", "−", "dd"], "ancho": 10, "cifras": 5}},
    {"modo": "bascula", "generar": {"forma": ["ddd", "+", "dd"], "ancho": 40, "maxFraccion": 0.2}},
    {"modo": "bascula", "generar": {"forma": ["ddd", "−", "dd"], "ancho": 30, "cifras": 6, "maxFraccion": 0.15}}
  ]
}, 'goma')
print('tanda 2 ok')

escribe('tijeras-y-abanicos', 'Comparar y ordenar ángulos por su abertura aunque los brazos tengan distinto largo o estén girados, y abrir un abanico igual que otro.', {
  "motor": "angulos", "titulo": "Tijeras y abanicos",
  "subtitulo": "En el puesto de los abanicos hay de todos los tamaños. Pero lo que importa no es lo grandes que son, sino lo que se abren.",
  "portada": {"rotulo": "ABANICOS", "objetivo": "¿Cuál está más abierto? Ojo: los brazos largos engañan.", "frase": "El grande no siempre es el más abierto."},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "asombro", "texto": "¡Abanicos gigantes y abanicos enanos! El feriante dice que el más caro es el que más se abre."},
    {"quien": "fosforito", "pose": "pista", "texto": "No te fijes en lo largo de las varillas. Fíjate en el hueco que dejan entre ellas."}],
  "observa": "Si alargas los brazos de un ángulo, ¿se hace más grande el ángulo?",
  "niveles": [
    {"modo": "compara", "generar": {"objeto": "abanico", "diferencia": [35, 60]}},
    {"modo": "compara", "generar": {"objeto": "tijeras", "diferencia": [25, 45]}},
    {"modo": "ordena", "generar": {"cantidad": 4, "separacion": 25}},
    {"modo": "compara", "generar": {"objeto": "mezcla", "diferencia": [15, 30], "engana": T}},
    {"modo": "iguala", "generar": {"rango": [30, 150]}},
    {"modo": "ordena", "generar": {"cantidad": 5, "separacion": 15, "objeto": "brazos", "girar": T, "engana": T, "sentido": "baja"}},
    {"modo": "compara", "generar": {"objeto": "brazos", "diferencia": [8, 18], "engana": T, "iguales": T}},
    {"modo": "iguala", "generar": {"rango": [20, 165], "girar": T, "rModelo": [50, 70], "rTuyo": [100, 110]}}
  ]
}, 'fosforito')

escribe('las-banderolas', 'Tipos de ángulos: clasificar en agudo, recto, obtuso, llano y completo, encontrar polígonos con algún ángulo obtuso y emparejar ángulos iguales aunque estén girados.', {
  "motor": "angulos", "titulo": "Las banderolas",
  "subtitulo": "Las guirnaldas de banderines se han mezclado. Hay que separar los ángulos por tipos y encontrar los banderines con esquinas obtusas.",
  "portada": {"rotulo": "BANDEROLAS", "objetivo": "Agudo, recto, obtuso, llano o completo. Compara siempre con la esquina de un folio.", "frase": "¡Qué lío de banderines!"},
  "historia": [CARTEL,
    {"quien": "goma", "pose": "seguro", "texto": "Las banderolas van por tipos, y se han mezclado todas con el viento."},
    {"quien": "goma", "pose": "pista", "texto": "Mi truco: la esquina de un folio. Si el ángulo cabe dentro, es agudo; si sobra, obtuso."}],
  "observa": "¿Puede un triángulo tener dos ángulos obtusos? ¿Por qué no?",
  "niveles": [
    {"modo": "clasifica", "generar": {"tipos": ["agudo", "recto", "obtuso"], "cantidad": 6}},
    {"modo": "clasifica", "generar": {"tipos": ["agudo", "recto", "obtuso", "llano"], "cantidad": 7, "girar": T}},
    {"modo": "busca", "generar": {"cantidad": 6, "lados": [3]}},
    {"modo": "parejas", "generar": {"parejas": 4, "angulos": [30, 60, 90, 135, 150]}},
    {"modo": "clasifica", "generar": {"tipos": ["agudo", "recto", "obtuso", "llano", "completo"], "cantidad": 8, "girar": T}},
    {"modo": "busca", "generar": {"cantidad": 6}},
    {"modo": "parejas", "generar": {"parejas": 6, "angulos": [30, 45, 60, 90, 120, 135, 150]}}
  ]
}, 'goma')

escribe('la-ruleta', 'Estimar la medida de ángulos en una ruleta, dibujar ángulos con el medidor (también con el brazo hacia la izquierda) y medirlos leyendo la escala buena.', {
  "motor": "angulos", "titulo": "La ruleta",
  "subtitulo": "La ruleta de la feria reparte premios por gajos. Para saber cuánto toca, hay que saber cuánto mide cada trozo.",
  "portada": {"rotulo": "RULETA", "objetivo": "Estima, dibuja y mide ángulos con el medidor. Ojo con las dos filas de números.", "frase": "¡Gira, gira, gira!"},
  "historia": [CARTEL,
    {"quien": "boli", "pose": "seguro", "texto": "La ruleta paga según el trozo donde cae. El feriante dice que el rojo mide 90°. Yo no me fío."},
    {"quien": "boli", "pose": "pista", "texto": "El medidor tiene dos filas de números. La buena es la que empieza en 0 por el lado de tu brazo."}],
  "observa": "¿Cómo sabes qué fila de números del medidor tienes que leer antes de mirar los números?",
  "niveles": [
    {"modo": "estima", "generar": {"angulos": [45, 90, 180, 270], "cuantas": 4}},
    {"modo": "estima", "generar": {"angulos": [30, 60, 90, 120, 150], "girar": T}},
    {"modo": "dibuja", "generar": {"angulos": [30, 60, 90, 120, 150]}},
    {"modo": "mide", "generar": {"rango": [20, 160], "redondo": T}},
    {"modo": "dibuja", "generar": {"angulos": [45, 135, 60, 150], "izquierda": T}},
    {"modo": "estima", "generar": {"angulos": [30, 45, 60, 120, 135, 150], "girar": T, "cerca": T}},
    {"modo": "mide", "generar": {"rango": [15, 165], "izquierda": "mezcla"}},
    {"modo": "dibuja", "generar": {"angulos": [35, 75, 105, 125, 165], "izquierda": "mezcla"}}
  ]
}, 'boli')
print('tanda 3 ok')

escribe('los-farolillos', 'Las tablas del 7 y del 9 en una guirnalda de cien farolillos: encender los múltiplos y descubrir el dibujo que forman.', {
  "motor": "tablas", "titulo": "Los farolillos",
  "subtitulo": "Una guirnalda de farolillos numerados. Solo se encienden los de una tabla, y al final forman un dibujo.",
  "portada": {"rotulo": "FAROLILLOS", "objetivo": "Enciende los farolillos de la tabla. Luego, mira qué dibujo forman.", "frase": "¡Que se vea la feria desde la luna!"},
  "historia": [CARTEL,
    {"quien": "goma", "pose": "seguro", "texto": "Los farolillos de esta calle no se encienden todos. Solo los de la tabla que toca."},
    {"quien": "goma", "pose": "pista", "texto": "Y si los enciendes bien, hacen un dibujo. Fíjate en él."}],
  "observa": "¿Por qué los del 9 hacen una diagonal en una guirnalda de 10 en 10? ¿Y qué pasa con los del 7 si la guirnalda es de 7 en 7?",
  "niveles": [
    {"modo": "farolillos", "generar": {"tabla": 7, "hasta": 70}},
    {"modo": "farolillos", "generar": {"tabla": 9, "hasta": 90}},
    {"modo": "farolillos", "generar": {"tabla": 7, "hasta": 70, "ancho": 7}},
    {"modo": "farolillos", "generar": {"tabla": 7, "hasta": 100}},
    {"modo": "farolillos", "generar": {"tabla": 9, "hasta": 100}},
    {"modo": "farolillos", "generar": {"tabla": 9, "hasta": 90, "ancho": 9}}
  ]
}, 'goma')

escribe('las-manzanas-de-caramelo', 'Contar elementos en disposiciones rectangulares con multiplicaciones: bandejas llenas, con huecos, con una fila incompleta o formadas por dos rectángulos.', {
  "motor": "tablas", "titulo": "Las manzanas de caramelo",
  "subtitulo": "Las bandejas de manzanas de caramelo hay que contarlas rápido, sin ir una por una.",
  "portada": {"rotulo": "MANZANAS", "objetivo": "Cuenta las manzanas sin ir de una en una: filas por columnas.", "frase": "Una, dos, tres… ¡no! Así no."},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "asombro", "texto": "¡Manzanas de caramelo! Hay que apuntar cuántas quedan en cada bandeja."},
    {"quien": "fosforito", "pose": "pista", "texto": "Si las cuentas de una en una se derrite el caramelo. Filas por columnas, y listo."}],
  "observa": "Si faltan manzanas en la bandeja, ¿es más rápido contar las que hay o calcular las de la bandeja llena y quitar las que faltan?",
  "niveles": [
    {"modo": "manzanas", "generar": {"tipos": ["lleno"], "filas": [3, 5], "columnas": [3, 6]}},
    {"modo": "manzanas", "generar": {"tipos": ["lleno"], "filas": [5, 9], "columnas": [6, 9]}},
    {"modo": "manzanas", "generar": {"tipos": ["fila"], "filas": [4, 7], "columnas": [5, 8]}},
    {"modo": "manzanas", "generar": {"tipos": ["huecos"], "filas": [4, 7], "columnas": [5, 9]}},
    {"modo": "manzanas", "generar": {"tipos": ["dos"], "filas": [3, 6], "columnas": [4, 7]}},
    {"modo": "manzanas", "generar": {"tipos": ["huecos", "dos", "fila"], "filas": [6, 9], "columnas": [7, 10]}}
  ]
}, 'fosforito')

escribe('las-tiras-de-tickets', 'Hechos multiplicativos: el factor que falta (120 = 4 × ?) estirando un rectángulo de tickets, y multiplicar por decenas y centenas a partir de la tabla.', {
  "motor": "tablas", "titulo": "Las tiras de tickets",
  "subtitulo": "La taquilla tiene los tickets en tiras. Para repartirlos en filas iguales, hay que saber cuántos van en cada una.",
  "portada": {"rotulo": "TICKETS", "objetivo": "Estira el rectángulo de tickets hasta el total y averigua el número que falta.", "frase": "¿Cuántos por fila? Estira y verás."},
  "historia": [CARTEL,
    {"quien": "boli", "pose": "seguro", "texto": "Los tickets van en filas iguales. Sé cuántos hay y cuántas filas. Me falta un número."},
    {"quien": "boli", "pose": "pista", "texto": "Es una multiplicación con un hueco. Estira el rectángulo hasta que dé el total."}],
  "observa": "Si sabes que 4 × 3 = 12, ¿qué sabes de 4 × 30? ¿Y de 40 × 30?",
  "niveles": [
    {"modo": "tiras", "generar": {"tipo": "falta", "filas": [2, 5], "por": [3, 7]}},
    {"modo": "tiras", "generar": {"tipo": "falta", "filas": [4, 8], "por": [4, 9]}},
    {"modo": "tiras", "generar": {"tipo": "decenas", "parejas": 2, "potencias": [10]}},
    {"modo": "tiras", "generar": {"tipo": "falta", "filas": [3, 7], "decenas": T}},
    {"modo": "tiras", "generar": {"tipo": "falta", "filas": [4, 9], "por": [3, 8], "preguntar": "filas"}},
    {"modo": "tiras", "generar": {"tipo": "decenas", "parejas": 3, "potencias": [10, 100]}},
    {"modo": "tiras", "generar": {"tipo": "falta", "filas": [4, 9], "decenas": T, "preguntar": "filas"}}
  ]
}, 'boli')

escribe('las-tres-cartas', 'Colocar cifras para conseguir el producto más grande o más pequeño en una multiplicación de dos o tres cifras por una, compitiendo con Fosforito.', {
  "motor": "tablas", "titulo": "Las tres cartas",
  "subtitulo": "Un juego de cartas de la feria: con las mismas cartas, gana quien consiga el producto más grande. O el más pequeño.",
  "portada": {"rotulo": "CARTAS", "objetivo": "Coloca las cartas para el mejor producto. Fosforito juega con las mismas.", "frase": "¡Te reto! Con las mismas cartas."},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "celebra", "texto": "En esta caseta se juega a las tres cartas. Pero sin trampas: con mates."},
    {"quien": "fosforito", "pose": "seguro", "texto": "Tú y yo, las mismas cartas. A ver quién consigue la multiplicación más grande."}],
  "observa": "¿Dónde pones la cifra más grande para que el producto sea el mayor posible? ¿Por qué?",
  "niveles": [
    {"modo": "cartas", "generar": {"cartas": 3, "objetivo": "mayor", "listo": 0.3}},
    {"modo": "cartas", "generar": {"cartas": 3, "objetivo": "menor", "listo": 0.3}},
    {"modo": "cartas", "generar": {"cartas": 3, "objetivo": "mayor", "listo": 0.6}},
    {"modo": "cartas", "generar": {"cartas": 4, "objetivo": "mayor", "listo": 0.5}},
    {"modo": "cartas", "generar": {"cartas": 4, "objetivo": "menor", "cero": T, "listo": 0.6}},
    {"modo": "cartas", "generar": {"cartas": 4, "objetivo": "mayor", "listo": 0.85}}
  ]
}, 'fosforito')

escribe('el-puesto-de-chapas', 'Multiplicar un número de dos o tres cifras por una cifra: por partes (7 × 144 = 700 + 280 + 28) y con la cuenta en columna.', {
  "motor": "tablas", "titulo": "El puesto de chapas",
  "subtitulo": "Las chapas de la feria vienen en cajas iguales. Para saber cuántas hay, se multiplica… por partes.",
  "portada": {"rotulo": "CHAPAS", "objetivo": "Multiplica por partes: primero las centenas, luego las decenas, luego las unidades. Y suma.", "frase": "¡Chapas para todos!"},
  "historia": [CARTEL,
    {"quien": "boli", "pose": "seguro", "texto": "Han llegado cajas de chapas. Muchas. Hay que apuntar cuántas en total."},
    {"quien": "boli", "pose": "pista", "texto": "Truco: se parte el número en trozos fáciles, se multiplica cada trozo y se suma."}],
  "observa": "¿Qué tiene que ver multiplicar por partes con lo que te llevas en la cuenta en columna?",
  "niveles": [
    {"modo": "chapas", "generar": {"a": [12, 49], "b": [2, 5], "forma": "partes"}},
    {"modo": "chapas", "generar": {"a": [23, 98], "b": [3, 9], "forma": "partes"}},
    {"modo": "chapas", "generar": {"a": [112, 499], "b": [3, 7], "forma": "partes"}},
    {"modo": "chapas", "generar": {"a": [23, 98], "b": [3, 9], "forma": "columna"}},
    {"modo": "chapas", "generar": {"a": [123, 899], "b": [4, 9], "forma": "partes"}},
    {"modo": "chapas", "generar": {"a": [123, 899], "b": [4, 9], "forma": "columna"}}
  ]
}, 'boli')

escribe('los-encargos', 'Problemas de la feria de suma, resta, comparación y multiplicación (también con datos escondidos, como media docena): elegir la operación, poner los datos y resolver.', {
  "motor": "tablas", "titulo": "Los encargos",
  "subtitulo": "A la oficina de la feria llegan encargos. Para cada uno hay que decidir qué cuenta se hace y hacerla bien.",
  "portada": {"rotulo": "ENCARGOS", "objetivo": "Lee cada encargo, elige la operación, pon los datos y resuelve.", "frase": "¡Encargo urgente!"},
  "historia": [CARTEL,
    {"quien": "goma", "pose": "seguro", "texto": "A la oficina de la feria llegan encargos con preguntas. Algunas tienen trampa."},
    {"quien": "goma", "pose": "pista", "texto": "Antes de calcular, piensa: ¿se junta, se quita, se compara o se repite?"}],
  "observa": "«¿Cuántos más?» se resuelve restando, aunque diga «más». ¿Por qué?",
  "niveles": [
    {"modo": "encargos", "generar": {"tipos": ["suma"], "rango": [1200, 5999], "rango2": [300, 3000]}},
    {"modo": "encargos", "generar": {"tipos": ["resta"]}},
    {"modo": "encargos", "generar": {"tipos": ["suma", "resta"]}},
    {"modo": "encargos", "generar": {"tipos": ["compara"]}},
    {"modo": "encargos", "generar": {"tipos": ["multiplica"], "a": [12, 99]}},
    {"modo": "encargos", "generar": {"tipos": ["oculto"]}},
    {"modo": "encargos", "generar": {"tipos": ["suma", "resta", "compara", "multiplica", "oculto"], "a": [25, 250]}}
  ]
}, 'goma')

escribe('el-gran-concurso', 'El final de la Feria de Otoño: un reto de cada caseta, de los números de cuatro cifras a los ángulos y las tablas.', {
  "motor": "examen", "titulo": "El gran concurso",
  "subtitulo": "Los feriantes vuelven a las nueve. Antes, el gran concurso: un reto de cada calle de la feria.",
  "portada": {"rotulo": "CONCURSO", "objetivo": "Un reto de cada caseta de la feria. Si los superas, la noria da la vuelta grande.", "frase": "Último repaso. Y esta vez, con público."},
  "textoFinal": "¡Feria encendida!",
  "historia": [
    {"nota": "SON LAS NUEVE MENOS CUARTO. EMPIEZA EL GRAN CONCURSO.", "firma": "La organización"},
    {"quien": "boli", "pose": "seguro", "texto": "Un reto de cada caseta, uno detrás de otro. Sin prisa, pero sin pausa."},
    {"quien": "goma", "pose": "pista", "texto": "Todo esto ya lo has hecho. Solo hay que acordarse."}],
  "observa": "¿Qué caseta te ha costado más? ¿Qué harías distinto si volvieras a jugarla?",
  "rondas": [
    {"motor": "numeros", "modo": "tendedero", "generar": {"cantidad": 5, "parecido": 1}},
    {"motor": "numeros", "modo": "candado", "generar": {"tipo": "menor", "cero": T}},
    {"motor": "caja", "modo": "columnas", "generar": {"op": "suma", "llevadas": 2}},
    {"motor": "caja", "modo": "columnas", "generar": {"op": "resta", "llevadas": 2}},
    {"motor": "mental", "modo": "patitos", "generar": {"tipos": ["mezcla"], "rango": [20, 99]}},
    {"motor": "mental", "modo": "colchonetas", "generar": {"saltos": [100, 100, 100, 100], "cruzar": T}},
    {"motor": "linea", "modo": "martillo", "elige": T, "generar": {"op": "mezcla", "a": [1000, 9999], "b": [100, 3999]}},
    {"motor": "medida", "modo": "rota", "generar": T},
    {"motor": "angulos", "modo": "clasifica", "generar": {"tipos": ["agudo", "recto", "obtuso", "llano"], "cantidad": 6, "girar": T}},
    {"motor": "angulos", "modo": "dibuja", "generar": {"angulos": [45, 120, 135, 60], "izquierda": "mezcla"}},
    {"motor": "tablas", "modo": "manzanas", "generar": {"tipos": ["huecos", "dos"], "filas": [5, 8], "columnas": [6, 9]}},
    {"motor": "tablas", "modo": "cartas", "generar": {"cartas": 3, "objetivo": "mayor", "listo": 0.7}},
    {"motor": "tablas", "modo": "chapas", "generar": {"a": [112, 499], "b": [3, 7], "forma": "partes"}},
    {"motor": "tablas", "modo": "encargos", "generar": {"tipos": ["compara", "oculto", "multiplica"], "a": [25, 120]}}
  ]
}, 'boli')
print('tanda 4 ok')

# ---------------------------------------------------------------- el mapa de la feria
HECHOS = set(os.listdir(BASE))
def j(slug, titulo): return {"slug": slug, "titulo": titulo} if slug in HECHOS else {"titulo": titulo}
MAPA = {
  "titulo": "La Feria de Otoño",
  "subtitulo": "Esta noche el patio es una feria. Cada caseta se enciende cuando funciona bien. Se puede jugar en orden o empezar por cualquiera.",
  "escena": "feria", "estilo": "feria", "volver": "../../matematicas/",
  "textos": {"sello": "¡ENCENDIDA!", "hechos": "casetas encendidas", "album": "Premios", "albumTitulo": "Mis premios de la feria", "albumTexto": "Cada caseta terminada, un premio.", "icono": "el-gran-concurso", "listo": "Todas las casetas encendidas. Empieza el gran concurso.", "boton": "Al concurso", "repetir": "Repetir el concurso"},
  "historia": [CARTEL,
    {"quien": "fosforito", "pose": "asombro", "texto": "¡Nos han dejado la feria! ¡La feria entera!"},
    {"quien": "boli", "pose": "seguro", "texto": "Nos la han dejado apagada. Cada caseta se enciende cuando funciona bien. Y para que funcione, hay que hacer números."},
    {"quien": "goma", "pose": "animo", "texto": "Tranquilos: todo esto ya lo hicimos en septiembre. Es repasar. Pero de noche, y con churros."}],
  "compartimentos": [
    {"nombre": "La calle de los números", "quien": "fosforito", "color": "#e8417a", "juegos": [j('la-tombola', 'La tómbola'), j('el-candado-de-la-taquilla', 'El candado de la taquilla')]},
    {"nombre": "El paseo de las cuentas", "quien": "boli", "color": "#2f5bd3", "juegos": [j('la-caja-registradora', 'La caja registradora'), j('el-cambio', 'El cambio'), j('la-noria', 'La noria'), j('los-patitos', 'Los patitos')]},
    {"nombre": "Las atracciones", "quien": "fosforito", "color": "#1b8f4e", "juegos": [j('las-colchonetas', 'Las colchonetas'), j('pares-y-nones', 'Pares y nones'), j('la-bascula', 'La báscula')]},
    {"nombre": "A ojo de buen cubero", "quien": "boli", "color": "#ff8a1f", "juegos": [j('el-martillo-de-fuerza', 'El martillo de fuerza'), j('la-tirolina', 'La tirolina')]},
    {"nombre": "Medidas y ángulos", "quien": "goma", "color": "#7b5cd6", "juegos": [j('la-caseta-de-los-records', 'La caseta de los récords'), j('tijeras-y-abanicos', 'Tijeras y abanicos'), j('las-banderolas', 'Las banderolas'), j('la-ruleta', 'La ruleta')]},
    {"nombre": "El rincón de las tablas", "quien": "goma", "color": "#d7263d", "juegos": [j('los-farolillos', 'Los farolillos'), j('las-manzanas-de-caramelo', 'Las manzanas de caramelo'), j('las-tiras-de-tickets', 'Las tiras de tickets'), j('las-tres-cartas', 'Las tres cartas'), j('el-puesto-de-chapas', 'El puesto de chapas'), j('los-encargos', 'Los encargos')]}
  ],
  "final": {
    "nombre": "El gran concurso", "slug": "el-gran-concurso" if 'el-gran-concurso' in HECHOS else None,
    "cerrado": "Se abre cuando todas las casetas estén encendidas.",
    "abierto": "Los feriantes han vuelto de cenar… y no se lo creen.",
    "historia": [
      {"quien": "boli", "pose": "seguro", "texto": "Las nueve. Los feriantes vuelven de cenar y se quedan mirando."},
      {"quien": "fosforito", "pose": "celebra", "texto": "¡Está todo encendido! ¡Y la noria va a dar la vuelta grande!"},
      {"quien": "goma", "pose": "animo", "texto": "Repasar también era esto: hacerlo otra vez, y hacerlo mejor. Gracias por quedarte."}]
  }
}
os.makedirs(f'{BASE}/la-feria-de-otono', exist_ok=True)
open(f'{BASE}/la-feria-de-otono/index.html', 'w').write(f'''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>La Feria de Otoño · Cajón maestro</title>
<meta name="description" content="Aventura de repaso de matemáticas: la feria del cole se ha quedado apagada y cada caseta se enciende resolviendo números, cuentas, medidas, ángulos y tablas.">
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../motores/base.css">
</head>
<body data-area="matematicas">
<!-- Mapa de una aventura. Se genera con herramientas/feria.py -->
<script type="application/json" id="mapa">
{json.dumps(MAPA, ensure_ascii=False, indent=2)}
</script>
<script type="module">
import {{ montaMapa }} from '../motores/mapa.js';
montaMapa(JSON.parse(document.getElementById('mapa').textContent));
</script>
</body>
</html>
''')
print('mapa ok')
