import json, os, sys
BASE = '/home/claude/cajon/public/juegos'
PLANTILLA = '''<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo} · Cajón maestro</title>
<meta name="description" content="{desc}">
<link rel="icon" href="../../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../motores/base.css">
</head>
<body>
<!--
  Este juego no tiene código propio: todo lo que cambia está en el bloque de abajo.
  Para hacer otro con el mismo motor, copia esta carpeta, cambia el texto y los datos, y listo.
  Instrucciones de cada motor: ../motores/
-->
<script type="application/json" id="config">
{config}
</script>
<script type="module" src="../motores/arranque.js"></script>
<noscript><p style="margin:24px">Este juego necesita JavaScript.</p></noscript>
</body>
</html>
'''
PERSONAJES = {'la-chincheta': 'goma', 'a-saltos': 'fosforito', 'la-maquina-de-cifras': 'boli', 'pinta-la-tabla': 'fosforito', 'picos-en-la-recta': 'goma', 'agudas-llanas-esdrujulas': 'boli',
  'pasaportes-de-cuadrilateros': 'boli', 'cuerdas-interiores': 'fosforito', 'aduana-de-poligonos': 'boli', 'doble-pasaporte-triangular': 'goma', 'museo-de-siluetas': 'fosforito', 'ventanas-espejo': 'goma', 'mudanza-de-figuras': 'fosforito', 'anclajes-disponibles': 'boli',
  'planos-de-produccion': 'boli', 'aduana-del-estuche': 'fosforito', 'la-goma-elastica': 'goma', 'quien-es-quien': 'boli', 'trios-de-almacen': 'boli', 'patios-cuadrados': 'goma', 'parcelas-comparables': 'fosforito', 'feria-de-combinaciones': 'goma', 'el-puzle-del-rincon': 'goma', 'la-chincheta-que-gira': 'goma', 'gomas-y-chinchetas': 'fosforito', 'las-baldosas-del-recreo': 'goma', 'pedidos-del-almacen': 'boli', 'la-merienda': 'goma', 'recortables': 'fosforito', 'la-mudanza': 'boli', 'la-maquina-de-ceros': 'boli', 'el-examen-del-viernes': 'boli'}
def escribe(slug, desc, cfg):
    cfg = {**cfg, 'personaje': PERSONAJES.get(slug, 'goma')}
    os.makedirs(f'{BASE}/{slug}', exist_ok=True)
    txt = json.dumps(cfg, ensure_ascii=False, indent=2)
    with open(f'{BASE}/{slug}/index.html', 'w') as f:
        f.write(PLANTILLA.format(titulo=cfg['titulo'], desc=desc, config=txt))

M = '../../materiales/{}/'
_retirado = lambda *a, **k: None
T = True

escribe('la-chincheta', 'Clava cada número en su sitio de la recta. Estimación adaptativa con números hasta 100 000.', {
  "motor": "recta", "area": "matematicas",
  "titulo": "La chincheta",
  "subtitulo": "Clava la chincheta donde creas que va el número. Si aciertas, la recta se complica; si no, te ayuda.",
  "saludo": "Clava la chincheta donde creas que va el número. Si te atascas, **pídeme una pista**.",
  "volver": M.format('la-chincheta'),
  "observa": "¿Qué número miras primero para colocar la chincheta? ¿Te ayuda pensar en **la mitad** de la recta, o en **los cuartos**?",
  "niveles": [
    {"modo": "estimar", "generar": T, "min": 0, "max": 100, "marcas": [0, 50, 100], "divisiones": 10},
    {"modo": "estimar", "generar": T, "min": 0, "max": 100, "marcas": [0, 100]},
    {"modo": "estimar", "generar": T, "min": 0, "max": 1000, "marcas": [0, 500, 1000]},
    {"modo": "estimar", "generar": T, "min": 0, "max": 1000, "marcas": [0, 1000]},
    {"modo": "estimar", "generar": T, "min": 0, "max": 10000, "marcas": [0, 10000]},
    {"modo": "estimar", "generar": T, "min": 2000, "max": 3000, "marcas": [2000, 3000], "explica": "Ojo: esta recta no empieza en 0."},
    {"modo": "estimar", "generar": {"redondeo": 100}, "min": 0, "max": 100000, "marcas": [0, 100000]}
  ]
})

escribe('a-saltos', 'Llega de un número a otro con el menor número de saltos de 1, 10, 100 y 1 000. Adaptativo.', {
  "motor": "recta", "area": "matematicas",
  "titulo": "A saltos",
  "subtitulo": "Lleva la rana a la meta con los menos saltos posibles. Los retos se ajustan a cómo te va.",
  "saludo": "Cuantos **menos saltos**, mejor. A veces pasarse y volver sale más corto.",
  "volver": M.format('a-saltos'),
  "observa": "¿Cuándo compensa **pasarse y volver hacia atrás**? Busca un ejemplo en el que saltar de más ahorre saltos.",
  "niveles": [
    {"modo": "saltos", "generar": {"inicio": [10, 40], "distancia": [20, 50]}, "saltos": [1, 10], "restar": False},
    {"modo": "saltos", "generar": {"inicio": [10, 60], "distancia": [25, 79]}, "saltos": [1, 10]},
    {"modo": "saltos", "generar": {"inicio": [100, 300], "distancia": [120, 300]}, "saltos": [1, 10, 100]},
    {"modo": "saltos", "generar": {"inicio": [100, 500], "distancia": [150, 480], "haciaAtras": T}, "saltos": [1, 10, 100]},
    {"modo": "saltos", "generar": {"inicio": [1000, 3000], "distancia": [1100, 2900]}, "saltos": [1, 10, 100, 1000]},
    {"modo": "saltos", "generar": {"inicio": [1000, 4000], "distancia": [1500, 3900], "haciaAtras": T}, "saltos": [1, 10, 100, 1000]}
  ]
})

escribe('la-maquina-de-cifras', 'Coloca cifras para formar el mayor, el menor, el más cercano o el par más grande. Adaptativo, con rondas a ciegas.', {
  "motor": "cifras", "area": "matematicas",
  "titulo": "La máquina de cifras",
  "subtitulo": "Cada hueco vale distinto según dónde esté. Los retos se complican cuando los vas clavando.",
  "saludo": "Arrastra cada cifra con el dedo hasta su hueco. **El hueco de la izquierda es el que más vale.**",
  "volver": M.format('la-maquina-de-cifras'),
  "observa": "¿Dónde pones la cifra más grande cuando buscas el número mayor? ¿Y en las rondas **a ciegas**, dónde pones un 5 si es la primera que sale?",
  "niveles": [
    {"generar": T, "huecos": 3, "objetivo": "max"},
    {"generar": T, "huecos": 4, "objetivo": "max"},
    {"generar": {"conCero": T}, "huecos": 4, "objetivo": "min", "explica": "El 0 no puede ir delante: el número dejaría de tener cuatro cifras."},
    {"generar": T, "huecos": 4, "objetivo": "max", "condicion": "par"},
    {"generar": {"conCero": T}, "huecos": 5, "objetivo": "min", "condicion": "impar"},
    {"generar": {"cerca": [3000, 7000]}, "huecos": 4, "objetivo": "cerca"},
    {"generar": {"cantidad": 6}, "huecos": 4, "objetivo": "max", "condicion": "multiplo:5"},
    {"generar": T, "huecos": 4, "objetivo": "max", "aCiegas": T},
    {"generar": {"cantidad": 5, "cerca": [40000, 60000]}, "huecos": 5, "objetivo": "cerca", "aCiegas": T}
  ]
})

B = [1, 101, 201, 301]
escribe('pinta-la-tabla', 'Pinta múltiplos y números cuadrados en tablas de cien y descubre los dibujos que salen. Adaptativo.', {
  "motor": "rejilla", "area": "matematicas",
  "titulo": "Pinta la tabla",
  "subtitulo": "Una tabla de cien números y una regla. Pinta las casillas que la cumplen y fíjate en el dibujo que sale.",
  "saludo": "Toca para pintar o **arrastra el dedo**. Fíjate en el dibujo que va saliendo.",
  "volver": M.format('pinta-la-tabla'),
  "observa": "Los múltiplos de 2 salen en **columnas** y los de 9 en **diagonal**. ¿Por qué cambia el dibujo? Pista: la tabla tiene 10 columnas.",
  "niveles": [
    {"desde": 1, "hasta": 100, "regla": {"multiplo": 10}, "texto": "Pinta los **múltiplos de 10**"},
    {"desde": 1, "hasta": 100, "regla": {"multiplo": 5}, "texto": "Pinta los **múltiplos de 5**", "explica": "Acaban en 0 o en 5: salen dos columnas."},
    {"desde": 1, "hasta": 100, "regla": {"multiplo": 2}, "texto": "Pinta los **múltiplos de 2**", "explica": "Salen columnas enteras: acaban en 0, 2, 4, 6 u 8."},
    {"generar": {"bloques": [1, 101]}, "regla": {"multiplo": 3}, "texto": "Pinta los **múltiplos de 3**"},
    {"generar": {"bloques": B}, "regla": {"multiplo": 4}, "texto": "Pinta los **múltiplos de 4**"},
    {"generar": {"bloques": [1, 101]}, "regla": {"multiplo": 9}, "texto": "Pinta los **múltiplos de 9**", "explica": "Suma las cifras de cada uno: 18 → 1 + 8, 27 → 2 + 7…"},
    {"generar": {"bloques": B}, "regla": {"multiplo": 6}, "texto": "Pinta los **múltiplos de 6**", "explica": "Son a la vez múltiplos de 2 y de 3."},
    {"desde": 1, "hasta": 100, "regla": {"cuadrado": T}, "texto": "Pinta los **números cuadrados**",
     "pista": "Un número cuadrado sale de multiplicar un número por sí mismo: 3 × 3 = 9.",
     "explica": "1, 4, 9, 16, 25… la distancia entre uno y el siguiente crece de 2 en 2."}
  ]
})

escribe('picos-en-la-recta', 'Coloca las montañas más altas de España en una recta de altitudes.', {
  "motor": "recta", "area": "sociales",
  "titulo": "Picos en la recta",
  "subtitulo": "Cada tarjeta es un pico con su altitud. Cuélgalo en su sitio de la recta: primero de 0 a 4 000 metros y luego con lupa.",
  "saludo": "Arrastra cada pico **a su altura**. Si dudas, pídeme una pista.",
  "volver": M.format('picos-en-la-recta'),
  "observa": "En la primera recta los picos salen casi juntos y en la segunda, separados. ¿Han cambiado las montañas o ha cambiado **la recta**?",
  "rondas": [
    {"modo": "ordenar", "min": 0, "max": 4000, "marcas": [0, 1000, 2000, 3000, 4000], "divisiones": 8, "unidad": "m",
     "texto": "Cuelga cada pico **a su altura**",
     "tarjetas": [
       {"texto": "Teide", "valor": 3718}, {"texto": "Aneto", "valor": 3404},
       {"texto": "Peñalara", "valor": 2428}, {"texto": "Moncayo", "valor": 2314}]},
    {"modo": "ordenar", "min": 2000, "max": 4000, "marcas": [2000, 2500, 3000, 3500, 4000], "divisiones": 8, "unidad": "m",
     "texto": "Ahora con lupa: la recta va **de 2 000 a 4 000 m**",
     "explica": "Teide en Tenerife, Mulhacén en Sierra Nevada (Sistema Bético), Aneto en los Pirineos, Torre Cerredo en la Cordillera Cantábrica, Almanzor y Peñalara en el Sistema Central y Moncayo en el Sistema Ibérico.",
     "tarjetas": [
       {"texto": "Teide", "valor": 3718}, {"texto": "Mulhacén", "valor": 3479}, {"texto": "Aneto", "valor": 3404},
       {"texto": "Torre Cerredo", "valor": 2648}, {"texto": "Almanzor", "valor": 2592},
       {"texto": "Peñalara", "valor": 2428}, {"texto": "Moncayo", "valor": 2314}]}
  ]
})

BANCO = {
  "aguda": ["canción", "reloj", "sofá", "papel", "camión", "feliz", "ratón", "café", "pared", "compás", "jabón", "nariz", "balcón", "autobús", "motor", "ciudad", "menú", "salud"],
  "llana": ["árbol", "lápiz", "mesa", "césped", "azúcar", "examen", "móvil", "joven", "cárcel", "casa", "libro", "fácil", "útil", "cráter", "silla", "ventana", "carácter", "dólar"],
  "esdrujula": ["pájaro", "música", "murciélago", "brújula", "sábado", "teléfono", "médico", "lámpara", "plátano", "número", "rápido", "último", "círculo", "sílaba"]
}
PA = "Agudas: la sílaba más fuerte es **la última**, como en can-CIÓN o re-LOJ."
PL = "Llanas: la sílaba más fuerte es **la penúltima**, como en ÁR-bol o ME-sa."
PE = "Esdrújulas: la sílaba más fuerte es **la antepenúltima**, como en PÁ-ja-ro. Todas llevan tilde."
escribe('agudas-llanas-esdrujulas', 'Clasifica palabras en agudas, llanas y esdrújulas. Adaptativo: de ocho palabras a la regla de la tilde.', {
  "motor": "rejilla", "area": "lengua",
  "titulo": "Agudas, llanas y esdrújulas",
  "subtitulo": "Pinta las palabras que pide cada reto. Empieza con pocas y, si vas bien, llegan más y la regla de la tilde.",
  "saludo": "Di cada palabra **en voz alta** y busca la sílaba que suena más fuerte.",
  "volver": M.format('agudas-llanas-esdrujulas'),
  "observa": "Busca las palabras **con tilde** de cada grupo. ¿En qué terminan las agudas que llevan tilde? ¿Y las llanas?",
  "niveles": [
    {"generar": {"cantidad": 8}, "banco": BANCO, "buscar": "aguda", "columnas": 4, "texto": "Pinta las palabras **agudas**", "pistas": [PA]},
    {"generar": {"cantidad": 8}, "banco": BANCO, "buscar": "llana", "columnas": 4, "texto": "Pinta las palabras **llanas**", "pistas": [PL]},
    {"generar": {"cantidad": 10}, "banco": BANCO, "buscar": "esdrujula", "columnas": 5, "texto": "Pinta las **esdrújulas**", "pistas": [PE]},
    {"generar": {"cantidad": 12}, "banco": BANCO, "buscar": "aguda", "columnas": 6, "texto": "Pinta las palabras **agudas**", "pistas": [PA]},
    {"generar": {"cantidad": 12}, "banco": BANCO, "buscar": "llana", "columnas": 6, "texto": "Pinta las palabras **llanas**", "pistas": [PL]},
    {"generar": {"cantidad": 16, "proporcion": 0.3}, "banco": BANCO, "buscar": "aguda-tilde", "columnas": 6, "texto": "Pinta solo las **agudas que llevan tilde**",
     "pistas": ["Primero busca las agudas. Luego quédate con las que tienen tilde.", "Las agudas llevan tilde cuando acaban en **vocal, n o s**."], "explica": "Las agudas llevan tilde si acaban en vocal, n o s: can-ción, so-fá, au-to-bús."},
    {"generar": {"cantidad": 16, "proporcion": 0.3}, "banco": BANCO, "buscar": "llana-tilde", "columnas": 6, "texto": "Pinta solo las **llanas que llevan tilde**",
     "pistas": ["Primero busca las llanas. Luego quédate con las que tienen tilde.", "Las llanas llevan tilde cuando **no** acaban en vocal, n o s."], "explica": "Justo al revés que las agudas: ár-bol, lá-piz, cés-ped."}
  ]
})
print('ok')

# ---------------------------------------------------------------- Bloque 2: geoplano
def sel(buscar, si, no, texto, defin=None, explica=None, cant=8, pos=(2, 4)):
    d = {"modo": "seleccionar", "generar": {"si": si, "no": no, "cantidad": cant, "positivas": list(pos)}, "buscar": buscar, "texto": texto}
    if defin: d["definicion"] = defin
    if explica: d["explica"] = explica
    return d

D_CUA = "Un cuadrado tiene **cuatro lados iguales y cuatro ángulos rectos**. Da igual cómo esté girado."
D_REC = "Un rectángulo tiene **cuatro ángulos rectos**. Sus lados no tienen por qué ser distintos."
D_PAR = "Un paralelogramo tiene **dos parejas de lados paralelos**: cada lado es paralelo al de enfrente."
D_ROM = "Un rombo tiene **cuatro lados iguales**. Los ángulos no tienen por qué ser rectos."
D_TRA = "Un trapecio tiene **solo una pareja** de lados paralelos."
escribe('pasaportes-de-cuadrilateros', 'Selecciona todos los cuadrados, rectángulos, rombos, paralelogramos o trapecios, aunque estén girados.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Pasaportes de cuadriláteros",
  "subtitulo": "Cada figura puede tener varios pasaportes a la vez: un cuadrado también es rectángulo, rombo y paralelogramo.",
  "saludo": "Mira **lados y esquinas**, no cómo está colocada la figura.",
  "volver": M.format('pasaportes-de-cuadrilateros'),
  "observa": "¿Por qué un cuadrado tiene **todos** los pasaportes de los paralelogramos y un rectángulo no tiene el de rombo?",
  "niveles": [
    sel("cuadrado", ["cuadradoRecto"], ["rectanguloRecto", "trapecio", "romboide"], "Selecciona **todos los cuadrados**", D_CUA),
    sel("rectangulo", ["rectanguloRecto", "cuadradoRecto"], ["romboide", "trapecio", "trapecioRecto", "cuadrilatero"], "Selecciona **todos los rectángulos**", D_REC, "Los cuadrados también cuentan: tienen cuatro ángulos rectos."),
    sel("cuadrado", ["cuadradoRecto", "cuadradoInclinado"], ["rombo", "rectanguloRecto", "rectanguloInclinado"], "Selecciona **todos los cuadrados**", D_CUA, "Un cuadrado girado sigue siendo un cuadrado."),
    sel("paralelogramo", ["romboide", "rombo", "rectanguloRecto", "cuadradoInclinado"], ["trapecio", "trapecioRecto", "cuadrilatero", "dardo"], "Selecciona **todos los paralelogramos**", D_PAR),
    sel("rombo", ["rombo", "cuadradoInclinado", "cuadradoRecto"], ["romboide", "rectanguloRecto", "trapecio"], "Selecciona **todos los rombos**", D_ROM, "Los cuadrados también son rombos: tienen los cuatro lados iguales."),
    sel("trapecio", ["trapecio", "trapecioRecto"], ["romboide", "rectanguloRecto", "cuadrilatero", "dardo"], "Selecciona **todos los trapecios**", D_TRA),
    sel("rectangulo", ["rectanguloInclinado", "cuadradoInclinado", "rectanguloRecto"], ["romboide", "rombo", "trapecio", "cuadrilatero"], "Selecciona **todos los rectángulos**", D_REC, "Inclinados también valen: lo que cuenta son los ángulos rectos.")
  ]
})

D_CONV = "Una figura es **convexa** si no tiene ningún entrante: cualquier cuerda entre dos puntos suyos se queda dentro."
escribe('cuerdas-interiores', 'Distingue polígonos convexos y no convexos buscando entrantes.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Cuerdas interiores",
  "subtitulo": "Si puedes tender una cuerda entre dos puntos de la figura y se sale, la figura no es convexa.",
  "saludo": "Busca **entrantes**: esquinas que se meten hacia dentro.",
  "volver": M.format('cuerdas-interiores'),
  "observa": "¿Puede un triángulo no ser convexo? ¿Y un cuadrilátero? Busca uno de cada en tu cabeza.",
  "niveles": [
    sel("noConvexo", ["dardo", "concavo5"], ["cuadradoRecto", "rectanguloRecto", "trapecio", "convexo5"], "Selecciona las figuras **no convexas**", D_CONV),
    sel("convexo", ["convexo5", "trapecio", "romboide", "tri"], ["dardo", "concavo5", "concavo6"], "Selecciona las figuras **convexas**", D_CONV),
    sel("noConvexo", ["concavo5", "concavo6"], ["convexo5", "convexo6", "cuadrilatero"], "Selecciona las figuras **no convexas**", D_CONV),
    sel("convexo", ["convexo6", "convexo5", "cuadrilatero"], ["concavo6", "concavo5", "dardo"], "Selecciona las figuras **convexas**", D_CONV)
  ]
})

escribe('aduana-de-poligonos', 'Clasifica polígonos por su número de lados y por cuántos lados iguales tienen.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Aduana de polígonos",
  "subtitulo": "Cuenta lados, no puntos. Y compara cuánto miden: en el geoplano, un lado inclinado puede ser igual que uno recto… o no.",
  "saludo": "Recorre el borde con el dedo y **cuenta los cambios de dirección**.",
  "volver": M.format('aduana-de-poligonos'),
  "observa": "«Al menos dos lados iguales» y «todos los lados iguales»: ¿cuál de las dos reglas deja pasar más figuras?",
  "niveles": [
    sel("lados4", ["cuadrilatero", "trapecio", "romboide"], ["tri", "pent", "convexo5"], "Selecciona las figuras de **4 lados**", "Cuenta los lados, no los puntos que tocan."),
    sel("lados5", ["pent", "convexo5", "concavo5"], ["cuadrilatero", "hex", "tri"], "Selecciona los **pentágonos** (5 lados)"),
    sel("lados6", ["hex", "convexo6", "concavo6"], ["pent", "cuadrilatero", "oct"], "Selecciona los **hexágonos** (6 lados)"),
    sel("alMenos2Iguales", ["triIsosceles", "rombo", "rectanguloRecto", "trapecio"], ["tri", "cuadrilatero", "pent"], "Selecciona las que tienen **al menos dos lados iguales**", "Un lado inclinado de 1 y 2 mide lo mismo que otro de 2 y 1."),
    sel("todosIguales", ["cuadradoRecto", "cuadradoInclinado", "rombo"], ["rectanguloRecto", "triIsosceles", "romboide", "trapecio"], "Selecciona las que tienen **todos los lados iguales**"),
    sel("lados8", ["oct"], ["hex", "convexo6", "pent"], "Selecciona los **octógonos** (8 lados)", cant=6, pos=(1, 3))
  ]
})

D_TR = "Por los lados: **isósceles** si tiene al menos dos iguales, **escaleno** si son todos distintos. Por los ángulos: **rectángulo** si tiene uno recto, **obtusángulo** si tiene uno mayor que un recto y **acutángulo** si todos son menores."
escribe('doble-pasaporte-triangular', 'Clasifica triángulos por sus lados y por sus ángulos a la vez.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Doble pasaporte triangular",
  "subtitulo": "Cada triángulo lleva dos pasaportes: uno por sus lados y otro por sus ángulos.",
  "saludo": "Un triángulo siempre tiene **dos nombres**: uno por los lados y otro por los ángulos.",
  "volver": M.format('doble-pasaporte-triangular'),
  "observa": "¿Puede un triángulo ser rectángulo **y** obtusángulo a la vez? ¿Y isósceles y rectángulo?",
  "niveles": [
    sel("triRectangulo", ["triRectangulo"], ["tri", "triObtuso", "triIsosceles"], "Selecciona los triángulos **rectángulos**", D_TR),
    sel("triIsosceles", ["triIsosceles"], ["tri", "triObtuso", "triRectangulo"], "Selecciona los triángulos **isósceles**", D_TR),
    sel("triObtusangulo", ["triObtuso"], ["triRectangulo", "triIsosceles", "tri"], "Selecciona los triángulos **obtusángulos**", D_TR),
    sel("triEscaleno", ["tri", "triObtuso"], ["triIsosceles"], "Selecciona los triángulos **escalenos**", D_TR),
    sel("triAcutangulo", ["triIsosceles", "tri"], ["triRectangulo", "triObtuso"], "Selecciona los triángulos **acutángulos**", D_TR),
    sel(["triIsosceles", "triRectangulo"], ["triRectangulo"], ["triIsosceles", "triRectangulo", "tri"], "Selecciona los que son **isósceles y rectángulos** a la vez", D_TR, pos=(1, 3))
  ]
})

escribe('museo-de-siluetas', 'Encuentra las figuras que son la misma silueta girada, y descarta las reflejadas o deformadas.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Museo de siluetas",
  "subtitulo": "Algunas figuras son la misma silueta, solo que girada. Otras parecen iguales pero están reflejadas o deformadas.",
  "saludo": "Gira la silueta **en tu cabeza**. Las que están dadas la vuelta como en un espejo no valen.",
  "volver": M.format('museo-de-siluetas'),
  "observa": "¿Cómo distingues una figura girada de una reflejada? Prueba a recorrer el borde en el mismo sentido en las dos.",
  "niveles": [
    {"modo": "seleccionar", "buscar": "giro", "generar": {"vertices": 4, "cantidad": 5, "positivas": [2, 3]}, "texto": "Selecciona las que son **la misma figura girada**"},
    {"modo": "seleccionar", "buscar": "giro", "generar": {"vertices": 5, "cantidad": 6, "positivas": [2, 3]}, "texto": "Selecciona las que son **la misma figura girada**"},
    {"modo": "seleccionar", "buscar": "giro", "generar": {"vertices": 6, "cantidad": 8, "positivas": [2, 4]}, "texto": "Selecciona las que son **la misma figura girada**"}
  ]
})

escribe('ventanas-espejo', 'Construye en el geoplano la figura simétrica respecto a un eje vertical.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Ventanas espejo",
  "subtitulo": "El eje es un espejo: cada vértice tiene su pareja al otro lado, a la misma distancia.",
  "saludo": "Cuenta **desde el eje**, no desde el borde.",
  "volver": M.format('ventanas-espejo'),
  "observa": "Un vértice pegado al eje, ¿dónde tiene su pareja? ¿Y uno que está a tres puntos?",
  "niveles": [
    {"modo": "construir", "tarea": "simetria", "generar": {"vertices": 3}, "ancho": 11, "alto": 7},
    {"modo": "construir", "tarea": "simetria", "generar": {"vertices": 4}, "ancho": 11, "alto": 7},
    {"modo": "construir", "tarea": "simetria", "generar": {"vertices": 5}, "ancho": 11, "alto": 7},
    {"modo": "construir", "tarea": "simetria", "generar": {"vertices": 6}, "ancho": 11, "alto": 7}
  ]
})

escribe('mudanza-de-figuras', 'Traslada una figura en el geoplano moviendo todos sus vértices lo mismo.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Mudanza de figuras",
  "subtitulo": "Mudarse es mover todos los vértices lo mismo y en la misma dirección. La figura no gira ni cambia de tamaño.",
  "saludo": "Mueve **un vértice** primero y luego haz lo mismo con los demás.",
  "volver": M.format('mudanza-de-figuras'),
  "observa": "Si cuentas los puntos en vez de los saltos entre puntos, ¿cuánto te equivocas?",
  "niveles": [
    {"modo": "construir", "tarea": "traslacion", "generar": {"vertices": 3, "vectores": [[0, 1], [0, -1], [0, 2], [0, -2]]}, "ancho": 9, "alto": 7},
    {"modo": "construir", "tarea": "traslacion", "generar": {"vertices": 4, "vectores": [[0, 2], [0, -2], [0, 1], [0, -1]]}, "ancho": 9, "alto": 7},
    {"modo": "construir", "tarea": "traslacion", "generar": {"vertices": 4, "vectores": [[2, 0], [-2, 0], [3, 0], [-3, 0]]}, "ancho": 9, "alto": 7},
    {"modo": "construir", "tarea": "traslacion", "generar": {"vertices": 4, "vectores": [[2, 1], [-2, 1], [1, -2], [3, -1], [-1, 2]]}, "ancho": 9, "alto": 7}
  ]
})

escribe('anclajes-disponibles', 'Construye rectángulos, cuadrados y triángulos usando solo algunos puntos del geoplano.', {
  "motor": "geoplano", "area": "matematicas",
  "titulo": "Anclajes disponibles",
  "subtitulo": "Solo valen los puntos grandes. Con ellos hay que construir la figura que se pide; a veces está inclinada.",
  "saludo": "Solo puedes usar **los puntos grandes**. Busca primero dos que te sirvan de lado.",
  "volver": M.format('anclajes-disponibles'),
  "observa": "¿Cómo sabes que un cuadrado inclinado tiene los cuatro lados iguales sin medirlos con regla?",
  "niveles": [
    {"modo": "construir", "figura": "rectangulo", "generar": {"sobran": 3}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "cuadrado", "generar": {"sobran": 4}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "triRectangulo", "generar": {"sobran": 4}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "triIsosceles", "generar": {"sobran": 5}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "cuadrado", "generar": {"inclinado": True, "sobran": 5}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "rectangulo", "generar": {"inclinado": True, "sobran": 6}, "ancho": 8, "alto": 6}
  ]
})
print('bloque 2 ok')

# ---------------------------------------------------------------- Bloque 2: multiplicar
escribe('planos-de-produccion', 'Multiplicar troceando los factores por valor posicional y sumando los trozos del rectángulo.', {
  "motor": "multiplica", "area": "matematicas",
  "titulo": "Planos de producción",
  "subtitulo": "Una multiplicación grande es un rectángulo. Partido en trozos, cada trozo es una multiplicación fácil.",
  "saludo": "Cada trozo es una multiplicación fácil. **Cuidado con los ceros.**",
  "volver": M.format('planos-de-produccion'),
  "observa": "¿Por qué 40 × 20 tiene dos ceros y 40 × 7 solo uno? ¿Qué pasa con los trozos cuando un factor tiene un 0 en medio?",
  "niveles": [
    {"modo": "partir", "generar": {"cifras": [2, 1]}},
    {"modo": "partir", "generar": {"cifras": [3, 1]}},
    {"modo": "partir", "generar": {"cifras": [2, 2]}},
    {"modo": "partir", "generar": {"cifras": [3, 2]}},
    {"modo": "partir", "generar": {"cifras": [3, 3]}}
  ]
})

_retirado('trios-de-almacen',  # retirado: reproducía la cajita triangular; ahora es La máquina de ceros
 'Completar cajitas multiplicativas con decenas y centenas, con el producto o un factor oculto.', {
  "motor": "multiplica", "area": "matematicas",
  "titulo": "Tríos de almacén",
  "subtitulo": "Dos factores abajo y el producto arriba. Los ceros no se ponen a ojo: se cuentan.",
  "saludo": "Quita los ceros, multiplica y **devuélvelos todos**.",
  "volver": M.format('trios-de-almacen'),
  "observa": "Si los dos factores son decenas, ¿cuántos ceros tiene el producto? ¿Y si uno es centena y el otro decena?",
  "niveles": [
    {"modo": "cajita", "generar": {"tipos": ["d", "u"]}},
    {"modo": "cajita", "generar": {"tipos": ["d", "d"]}},
    {"modo": "cajita", "generar": {"tipos": ["c", "u"]}},
    {"modo": "cajita", "generar": {"tipos": ["d", "u"], "oculto": ["a", "b"]}},
    {"modo": "cajita", "generar": {"tipos": ["d", "d"], "oculto": ["a", "b"]}},
    {"modo": "cajita", "generar": {"tipos": ["c", "d"]}},
    {"modo": "cajita", "generar": {"tipos": ["c", "d"], "oculto": ["a", "b"]}}
  ]
})

escribe('patios-cuadrados', 'Calcular cuadrados, reconocer números cuadrados y decidir si con unas baldosas sale un patio cuadrado.', {
  "motor": "multiplica", "area": "matematicas",
  "titulo": "Patios cuadrados",
  "subtitulo": "Un número es cuadrado si con esas baldosas sale un patio cuadrado sin que sobre ninguna.",
  "saludo": "Tres al cuadrado **no es tres por dos**. Es un patio de tres por tres.",
  "volver": M.format('patios-cuadrados'),
  "observa": "Entre 25 y 36 hay diez números. ¿Alguno es cuadrado? ¿Por qué los cuadrados están cada vez más separados?",
  "niveles": [
    {"modo": "cuadrado", "tipo": "potencia", "generar": {"n": [2, 5]}},
    {"modo": "cuadrado", "tipo": "elegir", "generar": {"n": [1, 6]}},
    {"modo": "cuadrado", "tipo": "patio", "generar": {"n": [3, 7]}},
    {"modo": "cuadrado", "tipo": "potencia", "generar": {"n": [6, 10]}},
    {"modo": "cuadrado", "tipo": "elegir", "generar": {"n": [4, 10], "dobles": True}},
    {"modo": "cuadrado", "tipo": "patio", "generar": {"n": [6, 10]}}
  ]
})

escribe('parcelas-comparables', 'Ordenar parcelas rectangulares por su área cuando el dibujo no está a escala.', {
  "motor": "multiplica", "area": "matematicas",
  "titulo": "Parcelas comparables",
  "subtitulo": "El área se calcula con los números, no con el tamaño del dibujo. Al comprobar, las parcelas se ponen a escala.",
  "saludo": "**¡El dibujo engaña!** Fíjate en los números.",
  "volver": M.format('parcelas-comparables'),
  "observa": "Dos parcelas con la misma valla alrededor, ¿tienen siempre la misma área?",
  "niveles": [
    {"modo": "areas", "escala": True, "generar": {"lados": [2, 8]}},
    {"modo": "areas", "generar": {"lados": [2, 10]}},
    {"modo": "areas", "generar": {"lados": [3, 20], "cuadrados": True}},
    {"modo": "areas", "generar": {"lados": [4, 25], "mismoPerimetro": True}},
    {"modo": "areas", "generar": {"lados": [4, 39], "cuadrados": True, "mismoPerimetro": True}}
  ]
})

escribe('feria-de-combinaciones', 'Problemas de multiplicar con grupos iguales, combinaciones y filas: elegir la cuenta y resolverla.', {
  "motor": "multiplica", "area": "matematicas",
  "titulo": "Feria de combinaciones",
  "subtitulo": "Grupos iguales, filas y combinaciones: tres historias distintas que acaban en la misma cuenta.",
  "saludo": "Antes de calcular, piensa **qué cuenta cada número**.",
  "volver": M.format('feria-de-combinaciones'),
  "observa": "¿Por qué con 4 sabores y 3 toppings salen 12 copas y no 7?",
  "niveles": [
    {"modo": "problemas", "generar": {"estructuras": ["grupos"], "a": [3, 9], "b": [3, 9]}},
    {"modo": "problemas", "generar": {"estructuras": ["filas"], "a": [3, 9], "b": [3, 9]}},
    {"modo": "problemas", "generar": {"estructuras": ["combinaciones"], "a": [3, 9], "b": [3, 9]}},
    {"modo": "problemas", "generar": {"estructuras": ["grupos", "filas", "combinaciones"], "a": [8, 25], "b": [3, 9]}},
    {"modo": "problemas", "generar": {"estructuras": ["grupos", "filas", "combinaciones"], "a": [8, 35], "b": [8, 35]}}
  ]
})
print('multiplica ok')

# ---------------------------------------------------------------- La Gran Limpieza: el estuche
NOTA = {"nota": "EL VIERNES ORDENO ESTE CAJÓN. LO QUE NO SIRVA, A LA PAPELERA.", "firma": "El profe"}
VOLVER_MAPA = '../la-gran-limpieza/'
escribe('aduana-del-estuche', 'Clasifica figuras metiéndolas en cajas: por lados, en el diagrama de cuadriláteros y en la cajonera de triángulos.', {
  "motor": "formas", "area": "matematicas", "escena": "estuche",
  "titulo": "Aduana del estuche",
  "subtitulo": "Las figuras hacen cola para entrar en el estuche. Cada una tiene que ir a su sitio, y algunas tienen más de un pasaporte.",
  "portada": {"rotulo": "ADUANA", "objetivo": "Mete cada figura en su bolsillo del estuche. Mira sus lados y sus esquinas: algunas tienen más de un pasaporte.", "frase": "¡Se han colado figuras sin pasaporte!"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "fosforito", "pose": "asombro", "texto": "¡Alerta! Las figuras del estuche están revueltas. Si no las ordenamos antes del viernes, a la papelera."},
    {"quien": "fosforito", "pose": "pista", "texto": "Tú decides dónde va cada una. Mira sus lados y sus esquinas, no cómo está colocada."}],
  "observa": "¿Por qué los cuadrados van justo donde se juntan los rectángulos y los rombos? ¿Y por qué hay cajones de triángulos que se quedan siempre vacíos?",
  "niveles": [
    {"modo": "clasificar", "tipo": "lados", "generar": {"cantidad": 6, "familias": ["tri", "triRectangulo", "cuadrilatero", "trapecio", "pent", "hex"]}},
    {"modo": "clasificar", "tipo": "lados", "generar": {"cantidad": 8}},
    {"modo": "clasificar", "tipo": "cuadri", "partes": 1, "generar": {"cantidad": 6, "familias": ["rectanguloRecto", "romboide", "rombo", "trapecio", "cuadrilatero", "dardo"]}, "texto": "¿Es un **paralelogramo** o no?"},
    {"modo": "clasificar", "tipo": "cuadri", "partes": 2, "generar": {"cantidad": 7, "familias": ["rectanguloRecto", "cuadradoRecto", "romboide", "trapecio", "cuadrilatero"]}, "texto": "Paralelogramos y, dentro, **los rectángulos**"},
    {"modo": "clasificar", "tipo": "triangulos", "generar": {"cantidad": 6}},
    {"modo": "clasificar", "tipo": "cuadri", "partes": 3, "generar": {"cantidad": 8, "familias": ["cuadradoRecto", "rectanguloRecto", "rombo", "romboide", "trapecio", "cuadrilatero", "dardo"]}},
    {"modo": "clasificar", "tipo": "triangulos", "generar": {"cantidad": 8}},
    {"modo": "clasificar", "tipo": "cuadri", "partes": 3, "generar": {"cantidad": 9, "familias": ["cuadradoInclinado", "rectanguloInclinado", "rombo", "romboide", "trapecio", "cuadradoRecto", "dardo"]}}
  ]
})

escribe('la-goma-elastica', 'Predice si una goma elástica tocará todo el borde de una figura: convexos y no convexos.', {
  "motor": "formas", "area": "matematicas", "escena": "estuche",
  "titulo": "La goma elástica",
  "portada": {"rotulo": "GOMAS", "frase": "Estírala y verás."},
  "subtitulo": "Una goma estirada alrededor de las chinchetas se ajusta sola. Si el borde se mete hacia dentro, deja huecos.",
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "goma", "pose": "seguro", "texto": "Soy Goma, pero no esa goma. Esta es mi prima, la Elástica: se estira alrededor de las chinchetas."},
    {"quien": "goma", "pose": "pista", "texto": "Antes de soltarla, dime qué va a pasar. Adivinar no vale: hay que pensarlo."}],
  "observa": "Una figura es convexa cuando la goma toca todo el borde. ¿Puede un triángulo dejar huecos? ¿Y un cuadrado?",
  "niveles": [
    {"modo": "goma", "generar": {"familias": ["dardo", "rectanguloRecto", "trapecio", "concavo5", "romboide"]}},
    {"modo": "goma", "generar": {"familias": ["convexo5", "concavo5", "convexo6", "concavo6"]}},
    {"modo": "goma", "marcar": True, "generar": {"familias": ["dardo", "concavo5"], "concava": True}},
    {"modo": "goma", "marcar": True, "generar": {"familias": ["concavo5", "concavo6", "convexo6"]}},
    {"modo": "goma", "marcar": True, "generar": {"familias": ["concavo6", "convexo6"], "minVertices": 6}}
  ]
})

TODAS = ["tri", "lados4", "masDe4", "convexa", "recto", "iguales", "dosIguales", "paralelos"]
escribe('quien-es-quien', 'Adivina la figura secreta con preguntas de sí o no, o elige tú las pistas para que la adivinen.', {
  "motor": "formas", "area": "matematicas", "escena": "estuche",
  "titulo": "¿Quién es quién?",
  "portada": {"rotulo": "SECRETO", "frase": "Tengo un secreto. Y tiene lados."},
  "subtitulo": "Boli ha elegido una figura. Pregunta, descarta y adivina con las menos preguntas posibles.",
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "boli", "pose": "piensa", "texto": "Hay una figura en el estuche que el profe quiere tirar. Yo sé cuál es. Tú no."},
    {"quien": "boli", "pose": "seguro", "texto": "Pregúntame. Solo contesto sí o no. Y no me hagas perder tinta con preguntas inútiles."}],
  "observa": "¿Qué pregunta te ha servido más? ¿Por qué hay preguntas que no sirven para nada aunque la respuesta sea verdad?",
  "niveles": [
    {"modo": "quien", "generar": {"cantidad": 6}, "preguntas": ["tri", "lados4", "convexa", "recto"]},
    {"modo": "quien", "generar": {"cantidad": 8}, "preguntas": ["tri", "lados4", "masDe4", "convexa", "recto", "iguales"]},
    {"modo": "quien", "generar": {"cantidad": 10}, "preguntas": TODAS},
    {"modo": "quien", "modo2": "pistas", "generar": {"cantidad": 6}, "preguntas": ["tri", "lados4", "convexa", "recto", "iguales"]},
    {"modo": "quien", "modo2": "pistas", "generar": {"cantidad": 9}, "preguntas": TODAS},
    {"modo": "quien", "generar": {"cantidad": 12}, "preguntas": TODAS}
  ]
})
print('estuche ok')

# ---------------------------------------------------------------- La Gran Limpieza: el rincón del puzle
escribe('el-puzle-del-rincon', 'Giros de un cuarto de vuelta: predecir cuántos hacen falta para que una pieza encaje, descubrir los huecos en espejo y encajar varias piezas con los giros justos.', {
  "motor": "giros", "area": "matematicas", "escena": "puzle",
  "titulo": "El puzle del rincón",
  "subtitulo": "Las piezas del puzle del rincón están revueltas. Solo se pueden girar, nunca dar la vuelta.",
  "portada": {"arte": "puzle", "objetivo": "Encaja cada pieza en su hueco girándola de cuarto en cuarto. Piensa los giros antes de hacerlos: algunos huecos son una trampa.", "frase": "Girar sí. Dar la vuelta, no."},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "goma", "pose": "seguro", "texto": "El puzle del rincón está desmontado. Si el viernes sigue así, a la papelera con él."},
    {"quien": "goma", "pose": "pista", "texto": "Las piezas solo se pueden girar de cuarto en cuarto, como las agujas del reloj. Piensa antes de girar: los giros están contados."}],
  "saludo": "Antes de girar, **piensa cuántos cuartos** le faltan.",
  "observa": "¿Por qué hay huecos en los que una pieza no entra por mucho que la gires? ¿Qué tendrías que hacerle para que entrara?",
  "niveles": [
    {"modo": "puzle", "generar": {"cuartos": [1, 2]}},
    {"modo": "puzle", "generar": {"cuartos": [1, 2, 3]}},
    {"modo": "puzle", "generar": {"cuartos": [1, 2, 3], "espejo": 0.3}},
    {"modo": "puzle", "libre": True, "generar": {"cantidad": 2}},
    {"modo": "puzle", "sentido": "antihorario", "generar": {"cuartos": [1, 2, 3], "espejo": 0.3}},
    {"modo": "puzle", "libre": True, "generar": {"cantidad": 3}}
  ]
})

escribe('la-chincheta-que-gira', 'Centro de giro: elegir dónde clavar la chincheta para que la pieza, al girar, caiga en su sombra.', {
  "motor": "giros", "area": "matematicas", "escena": "puzle",
  "titulo": "La chincheta que gira",
  "subtitulo": "Las fotos del corcho se han soltado. Hay que clavarlas con una chincheta y girarlas hasta su marca.",
  "portada": {"arte": "corcho", "objetivo": "Clava la chincheta en el punto justo: al girar, la pieza tiene que caer exactamente en su sombra.", "frase": "Una chincheta, un giro, un sitio."},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "goma", "pose": "asombro", "texto": "¡Las piezas del corcho se han soltado! Cada una tiene su sombra marcada, de cuando estaba bien puesta."},
    {"quien": "goma", "pose": "pista", "texto": "Clava la chincheta y gírala. Si la chincheta está bien puesta, la pieza cae justo en su sombra."}],
  "saludo": "La chincheta es el único punto que **no se mueve**.",
  "observa": "Cuando la chincheta está bien puesta, ¿qué tienen en común cada esquina y su sombra?",
  "niveles": [
    {"modo": "chincheta", "generar": {"cuartos": [2]}},
    {"modo": "chincheta", "generar": {"cuartos": [1]}},
    {"modo": "chincheta", "generar": {"cuartos": [1, 3]}},
    {"modo": "chincheta", "generar": {"cuartos": [1, 2, 3], "solapar": True, "distMin": 1}},
    {"modo": "chincheta", "eligeGiro": True, "generar": {"cuartos": [1, 2, 3]}}
  ]
})
print('puzle ok')

# ---------------------------------------------------------------- La Gran Limpieza: corcho, patio y almacén
escribe('gomas-y-chinchetas', 'Construir figuras por encargo con gomas y chinchetas: marcos cuadrados, rectángulos y triángulos, también inclinados.', {
  "motor": "geoplano", "area": "matematicas", "escena": "corcho",
  "titulo": "Gomas y chinchetas",
  "subtitulo": "Los del cajón hacen encargos para el corcho. Hay que construirlos con una goma y las chinchetas que haya.",
  "portada": {"arte": "cajon", "objetivo": "Cada personaje te encarga un marco. Constrúyelo con la goma usando solo las chinchetas clavadas.", "frase": "¿Me haces un marco? Cuadrado, por favor.", "rotulo": "CORCHO"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "fosforito", "pose": "pista", "texto": "En el corcho todo el mundo quiere colgar su foto. Pero el profe solo ha dejado unas pocas chinchetas clavadas."},
    {"quien": "fosforito", "pose": "seguro", "texto": "Tú pones la goma. Cada encargo es una figura: si no cumple, el marco se cae."}],
  "saludo": "Solo valen **las chinchetas clavadas**. Busca primero dos que te sirvan de lado.",
  "observa": "¿Cómo sabes que un marco inclinado tiene los cuatro lados iguales sin medirlo con regla?",
  "niveles": [
    {"modo": "construir", "figura": "rectangulo", "texto": "Goma quiere un **marco rectangular** para su foto", "generar": {"sobran": 3}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "cuadrado", "texto": "Boli quiere un **marco cuadrado**", "generar": {"sobran": 4}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "triRectangulo", "texto": "Un banderín con forma de **triángulo rectángulo**", "generar": {"sobran": 4}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "triIsosceles", "texto": "Un tejado: un **triángulo con dos lados iguales**", "generar": {"sobran": 5}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "cuadrado", "texto": "Fosforito quiere un **marco cuadrado inclinado** (¡es más moderno!)", "generar": {"inclinado": True, "sobran": 5}, "ancho": 8, "alto": 6},
    {"modo": "construir", "figura": "rectangulo", "texto": "Un **rectángulo inclinado** para la nota del profe", "generar": {"inclinado": True, "sobran": 6}, "ancho": 8, "alto": 6}
  ]
})

escribe('las-baldosas-del-recreo', 'Patios cuadrados con un número de baldosas y parcelas del huerto que engañan: área frente a apariencia.', {
  "motor": "multiplica", "area": "matematicas", "escena": "patio",
  "titulo": "Las baldosas del recreo",
  "subtitulo": "Hay que embaldosar el patio y repartir el huerto. El Sacapuntas dibuja las parcelas para que engañen.",
  "portada": {"objetivo": "Decide si con unas baldosas sale un patio cuadrado y ordena las parcelas del huerto por lo que miden de verdad.", "frase": "Las baldosas no mienten. El dibujo, a veces.", "rotulo": "PATIO"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "goma", "pose": "seguro", "texto": "Al patio del cajón le faltan baldosas, y el huerto está sin repartir."},
    {"quien": "goma", "pose": "pista", "texto": "Ojo con el Sacapuntas: dibuja las parcelas grandes pequeñas y las pequeñas grandes. Fíate de los números."}],
  "saludo": "Tres al cuadrado **no es tres por dos**. Es un patio de tres por tres.",
  "observa": "¿Por qué con 24 baldosas no sale un patio cuadrado y con 25 sí? Dos parcelas con la misma valla, ¿tienen siempre la misma área?",
  "niveles": [
    {"modo": "cuadrado", "tipo": "potencia", "generar": {"n": [2, 6]}},
    {"modo": "cuadrado", "tipo": "patio", "generar": {"n": [3, 7]}},
    {"modo": "areas", "escala": True, "generar": {"lados": [2, 8]}},
    {"modo": "cuadrado", "tipo": "elegir", "generar": {"n": [4, 10], "dobles": True}},
    {"modo": "areas", "generar": {"lados": [3, 20], "cuadrados": True}},
    {"modo": "cuadrado", "tipo": "patio", "generar": {"n": [6, 10]}},
    {"modo": "areas", "generar": {"lados": [4, 25], "mismoPerimetro": True}}
  ]
})

escribe('pedidos-del-almacen', 'Multiplicar por partes para servir pedidos grandes y elegir la cuenta en pedidos de grupos, filas y combinaciones.', {
  "motor": "multiplica", "area": "matematicas", "escena": "almacen",
  "titulo": "Pedidos del almacén",
  "subtitulo": "Llegan pedidos enormes al almacén de clips. Boli los parte en trozos fáciles y no deja que nada se descuadre.",
  "portada": {"objetivo": "Sirve cada pedido: parte la multiplicación en trozos fáciles, súmalos y no pierdas ni un clip.", "frase": "Aquí todo cuadra. O se repite.", "rotulo": "ALMACÉN"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "boli", "pose": "seguro", "texto": "Soy el jefe del almacén. Si el viernes falta un solo clip en las cuentas, a la papelera."},
    {"quien": "boli", "pose": "pista", "texto": "Un pedido grande es un rectángulo. Se parte en trozos fáciles y se suman. Y antes de calcular, piensa qué cuenta cada número."}],
  "saludo": "Cada trozo es una multiplicación fácil. **Cuidado con los ceros.**",
  "observa": "¿Por qué 40 × 20 tiene dos ceros y 40 × 7 solo uno? ¿Por qué con 4 sabores y 3 toppings salen 12 copas y no 7?",
  "niveles": [
    {"modo": "partir", "generar": {"cifras": [2, 1]}},
    {"modo": "problemas", "generar": {"estructuras": ["grupos"], "a": [3, 9], "b": [3, 9]}},
    {"modo": "partir", "generar": {"cifras": [3, 1]}},
    {"modo": "problemas", "generar": {"estructuras": ["filas", "combinaciones"], "a": [3, 9], "b": [3, 9]}},
    {"modo": "partir", "generar": {"cifras": [2, 2]}},
    {"modo": "problemas", "generar": {"estructuras": ["grupos", "filas", "combinaciones"], "a": [8, 25], "b": [3, 9]}},
    {"modo": "partir", "generar": {"cifras": [3, 2]}}
  ]
})
print('corcho, patio, almacén ok')

# ---------------------------------------------------------------- La Gran Limpieza: la merienda
escribe('la-merienda', 'División con resto repartiendo golosinas: bandejas llenas y sobras, repartir cajas, bolsas y sueltos abriendo paquetes, y entender lo que dice la calculadora.', {
  "motor": "reparto", "area": "matematicas", "escena": "merienda",
  "titulo": "La merienda",
  "subtitulo": "Goma reparte la merienda del cajón. Las bandejas tienen sitio fijo y lo que sobra también cuenta.",
  "portada": {"objetivo": "Reparte la merienda: llena bandejas, abre cajas y bolsas cuando no lleguen, y no te fíes de la calculadora del Sacapuntas.", "frase": "El resto también es alguien.", "rotulo": "MERIENDA"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "goma", "pose": "seguro", "texto": "Antes de la gran limpieza, merienda. Pero hay que repartirla bien, que luego hay peleas."},
    {"quien": "goma", "pose": "pista", "texto": "Las bandejas tienen sitio fijo. Lo que no cabe, sobra. Y el Sacapuntas ha traído una calculadora… que no entiende de caramelos."}],
  "saludo": "Repartir en bandejas es buscar **cuántas veces cabe**.",
  "observa": "¿Por qué lo que sobra siempre es menos que lo que cabe en una bandeja? ¿Qué significan los decimales de la calculadora?",
  "niveles": [
    {"modo": "bandejas", "manos": True, "generar": {"tam": [3, 5], "llenas": [2, 5]}},
    {"modo": "bandejas", "trozos": True, "generar": {"tam": [4, 7], "llenas": [6, 12]}},
    {"modo": "paquetes", "guiado": True, "generar": {"amigos": [2, 3], "total": [120, 390]}},
    {"modo": "bandejas", "trozos": True, "calcula": True, "generar": {"tam": [5, 9], "llenas": [8, 14]}},
    {"modo": "paquetes", "calcula": True, "generar": {"amigos": [3, 5], "total": [200, 800]}},
    {"modo": "bandejas", "generar": {"tam": [6, 9], "llenas": [4, 9]}},
    {"modo": "calculadora", "generar": {"tam": [4, 5, 8], "llenas": [6, 25]}},
    {"modo": "calculadora", "generar": {"tam": [6, 12, 25], "llenas": [12, 60]}}
  ]
})
print('merienda ok')

# ---------------------------------------------------------------- La Gran Limpieza: recortables, mudanza y máquina de ceros
escribe('recortables', 'Simetría con papel doblado: predecir dónde saldrán los agujeros al desdoblar.', {
  "motor": "giros", "area": "matematicas", "escena": "puzle",
  "titulo": "Recortables",
  "subtitulo": "Fosforito ha hecho agujeros en un papel doblado. Antes de abrirlo, hay que adivinar dónde saldrán.",
  "portada": {"arte": "papel", "objetivo": "El papel está doblado. Marca dónde saldrán los agujeros al otro lado del pliegue y desdóblalo para comprobarlo.", "frase": "Doblo, pincho… ¿y al abrir?", "rotulo": "RECORTABLES"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "fosforito", "pose": "asombro", "texto": "¡He encontrado un papel doblado con agujeros! Si lo abro sin saber qué sale, me pierdo la gracia."},
    {"quien": "fosforito", "pose": "pista", "texto": "Cada agujero tiene su pareja al otro lado del pliegue, igual de lejos. Como en un espejo."}],
  "saludo": "Cada agujero sale **igual de lejos del pliegue**, al otro lado.",
  "observa": "¿Por qué los agujeros que están pegados al pliegue salen pegados también al otro lado?",
  "niveles": [
    {"modo": "doblez", "generar": {"agujeros": [1, 2]}},
    {"modo": "doblez", "generar": {"agujeros": [2, 3]}},
    {"modo": "doblez", "pliegue": "horizontal", "generar": {"agujeros": [2, 3]}},
    {"modo": "doblez", "generar": {"agujeros": [3, 5]}},
    {"modo": "doblez", "pliegue": "horizontal", "generar": {"agujeros": [4, 6]}}
  ]
})

escribe('la-mudanza', 'Traslaciones con tarjetas de flechas: programar el carrito para mover un mueble y, al revés, escribir la tarjeta de una mudanza hecha.', {
  "motor": "giros", "area": "matematicas", "escena": "cajon",
  "titulo": "La mudanza",
  "subtitulo": "Hay que cambiar los muebles del cajón de sitio. Van en un carrito que se programa con tarjetas de flechas.",
  "portada": {"objetivo": "Programa el carrito con tarjetas de flechas para llevar cada mueble a su sitio nuevo, sin girarlo.", "frase": "Flechas exactas o no hay mudanza.", "rotulo": "MUDANZA"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "boli", "pose": "seguro", "texto": "Los muebles del cajón están mal puestos. Se mueven en carrito, y el carrito solo entiende flechas."},
    {"quien": "boli", "pose": "pista", "texto": "Una tarjeta, un cuadrito. Si pones de más, el mueble se pasa. Y no se gira: todo el mueble se mueve igual."}],
  "saludo": "Fíjate en **una esquina** del mueble y en su sitio nuevo.",
  "observa": "Si una esquina se mueve 3 a la derecha y 2 hacia abajo, ¿cuánto se mueven las demás? ¿Por qué?",
  "niveles": [
    {"modo": "mudanza", "generar": {"maximo": [4, 0], "minimo": 2}},
    {"modo": "mudanza", "generar": {"maximo": [3, 3], "minimo": 2, "unEje": True}},
    {"modo": "mudanza", "generar": {"maximo": [4, 3], "minimo": 3}},
    {"modo": "mudanza", "leer": True, "generar": {"maximo": [4, 3], "minimo": 2}},
    {"modo": "mudanza", "generar": {"maximo": [5, 4], "minimo": 5}},
    {"modo": "mudanza", "leer": True, "generar": {"maximo": [5, 4], "minimo": 4}}
  ]
})

escribe('la-maquina-de-ceros', 'Multiplicar por 10, 100 y 1 000 con una máquina de palancas: predecir la salida, conseguir un número y acotar un producto con el ascensor de carga.', {
  "motor": "ceros", "area": "matematicas", "escena": "almacen",
  "titulo": "La máquina de ceros",
  "subtitulo": "En el almacén hay una máquina que multiplica. Cada palanca le añade un cero a su número.",
  "portada": {"objetivo": "Predice qué sale de la máquina, consigue el número que pide Boli y averigua cuántas cajas caben en el ascensor.", "frase": "Los ceros no se cuentan solos.", "rotulo": "MÁQUINA"},
  "volver": VOLVER_MAPA,
  "historia": [NOTA,
    {"quien": "boli", "pose": "seguro", "texto": "Esta es la máquina de ceros. Le das dos números y los multiplica. Cada palanca, un cero más."},
    {"quien": "boli", "pose": "pista", "texto": "Antes de tirar de la manivela, dime qué va a salir. Si aciertas siempre, te dejo llevar el ascensor."}],
  "saludo": "Primero la tabla, **luego los ceros**.",
  "observa": "¿Por qué 70 × 80 y 7 × 800 dan lo mismo? ¿Cuántas formas hay de conseguir 5 600 con el 7 y el 8?",
  "niveles": [
    {"modo": "prever", "generar": {"ceros": 1}},
    {"modo": "consigue", "generar": {"ceros": 1}},
    {"modo": "prever", "generar": {"ceros": 2}},
    {"modo": "consigue", "generar": {"ceros": 2}},
    {"modo": "ascensor", "generar": {"pesos": [20, 30, 40, 50], "limites": [1000, 1500, 2000]}},
    {"modo": "prever", "generar": {"ceros": 3}},
    {"modo": "ascensor", "generar": {"pesos": [60, 70, 80, 90], "limites": [2500, 3000, 4500, 5000]}}
  ]
})
print('recortables, mudanza y ceros ok')

# ---------------------------------------------------------------- La Gran Limpieza: el final
escribe('el-examen-del-viernes', 'El final de la Gran Limpieza: repartir cuentas entre cabeza, papel y calculadora, y un repaso de todos los compartimentos.', {
  "motor": "examen", "area": "matematicas", "escena": "cajon",
  "titulo": "El examen del viernes",
  "subtitulo": "Es viernes. El profe va a abrir el cajón. Último repaso: cada cuenta a quien mejor la haga, y un reto de cada compartimento.",
  "portada": {"objetivo": "Reparte cada cuenta a quien mejor la haría (Goma de cabeza, Boli en papel, el Sacapuntas con calculadora) y supera un reto de cada compartimento.", "frase": "Hoy no se libra nadie. Ni yo.", "rotulo": "VIERNES"},
  "volver": VOLVER_MAPA,
  "textoFinal": "¡Cajón ordenado!",
  "historia": [
    {"nota": "HOY ES VIERNES. A LAS DOCE ABRO EL CAJÓN.", "firma": "El profe"},
    {"quien": "boli", "pose": "seguro", "texto": "Último repaso. Goma calcula de cabeza, yo en papel y el Sacapuntas con su calculadora. Tú decides quién hace cada cuenta."},
    {"quien": "goma", "pose": "pista", "texto": "Y entre cuenta y cuenta, un reto de cada rincón del cajón. Si sale todo, nadie va a la papelera."}],
  "saludo": "Antes de calcular, **mira los números**.",
  "observa": "¿Qué te hace decidir si una cuenta es de cabeza, de papel o de calculadora? ¿Alguna vez es mejor la cabeza que la calculadora?",
  "rondas": [
    {"modo": "estrategia", "generar": {"tipos": ["ceros", "casi", "media", "fea", "fea"]}},
    {"motor": "formas", "modo": "clasificar", "tipo": "cuadri", "partes": 3, "generar": {"cantidad": 7, "familias": ["cuadradoRecto", "rectanguloRecto", "rombo", "romboide", "trapecio", "cuadrilatero"]}},
    {"motor": "giros", "modo": "puzle", "generar": {"cuartos": [1, 2, 3], "espejo": 0.3}},
    {"motor": "reparto", "modo": "bandejas", "generar": {"tam": [6, 9], "llenas": [4, 9]}},
    {"modo": "estrategia", "generar": {"tipos": ["ceros", "casi", "casi", "media", "media", "fea"]}},
    {"motor": "ceros", "modo": "consigue", "generar": {"ceros": 2}},
    {"motor": "giros", "modo": "chincheta", "generar": {"cuartos": [1, 3]}},
    {"motor": "multiplica", "modo": "cuadrado", "tipo": "patio", "generar": {"n": [5, 10]}},
    {"motor": "reparto", "modo": "calculadora", "generar": {"tam": [6, 8, 12], "llenas": [10, 40]}},
    {"modo": "estrategia", "generar": {"tipos": ["ceros", "casi", "media", "media", "fea", "fea"]}}
  ]
})
print('examen ok')
