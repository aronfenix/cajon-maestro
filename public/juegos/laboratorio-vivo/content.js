(function (root) {
  'use strict';
  const games = [
    { id: 'celulas', n: '01', title: 'Micropuzles de células', type: 'Reconstruye imágenes', minutes: '5 min', topic: 'celulas', image: 'epitelial', description: 'Reconstruye cuatro modelos intercambiando piezas y descubre sus partes.' },
    { id: 'parejas', n: '02', title: 'Memoria de conceptos', type: 'Destapa y recuerda', minutes: '3 min', topic: 'conceptos', image: 'neurona', description: 'Encuentra parejas de palabras y definiciones entre cartas ocultas.' },
    { id: 'organizacion', n: '03', title: 'Construye un organismo', type: 'Ordena con imágenes', minutes: '2 min', topic: 'celulas', image: 'corazon', description: 'Coloca las piezas desde una célula hasta una persona completa.' },
    { id: 'nutricion', n: '04', title: 'Circuitos de vida', type: 'Gira y conecta', minutes: '6 min', topic: 'funciones', image: 'circulatorio', description: 'Construye circuitos de tuberías y prueba el recorrido de nutrientes, oxígeno y desechos.' },
    { id: 'relacion', n: '05', title: '¡Atrapa la pelota!', type: 'Arcade de coordinación', minutes: '3 min', topic: 'funciones', image: 'pelota', description: 'Controla la mano, atrapa pelotas y sigue la cadena de la función de relación.' },
    { id: 'reproduccion', n: '06', title: 'El comienzo de una vida', type: 'Completa la historia', minutes: '2 min', topic: 'funciones', image: 'gametos', description: 'Usa las palabras del tema para explicar cómo comienza un nuevo ser.' },
    { id: 'clasificar', n: '07', title: 'Palabras escondidas', type: 'Sopa de letras con pistas', minutes: '5 min', topic: 'celulas', image: 'ameba', description: 'Descifra definiciones y traza palabras sobre seres unicelulares y pluricelulares.' },
    { id: 'reto', n: '08', title: 'Biole: el código de la vida', type: 'Descifra la palabra', minutes: '4 min', topic: 'conceptos', image: 'tejido_cardiaco', description: 'Escribe conceptos del tema y aprovecha las pistas de cada letra para resolverlos.' }
  ];
  const parts = {
    membrana: { name: 'membrana', hint: 'Envuelve la célula y regula la entrada y salida de sustancias.' },
    citoplasma: { name: 'citoplasma', hint: 'Es el medio interior donde se encuentran los orgánulos de la célula.' },
    nucleo: { name: 'núcleo', hint: 'Contiene el ADN, con las instrucciones para el funcionamiento celular.' },
    organulos: { name: 'orgánulos', hint: 'Realizan tareas. En estos modelos puedes localizar, por ejemplo, una mitocondria.' }
  };
  const cells = [
    { id: 'epitelial', name: 'Célula animal', points: { membrana: [.50, .058], citoplasma: [.54, .12], nucleo: [.51, .45], organulos: [.67, .77] } },
    { id: 'cardiaca', name: 'Célula muscular del corazón', points: { membrana: [.23, .33], citoplasma: [.33, .63], nucleo: [.51, .49], organulos: [.66, .465] } },
    { id: 'neurona', name: 'Neurona', points: { membrana: [.242, .313], citoplasma: [.26, .62], nucleo: [.28, .46], organulos: [.37, .51] } },
    { id: 'vegetal', name: 'Célula vegetal', points: { membrana: [.18, .31], citoplasma: [.47, .19], nucleo: [.71, .23], organulos: [.81, .51] } }
  ];
  const pairs = [
    ['celula', 'Célula', 'Unidad básica de los seres vivos.', 'Cada célula procede de la división de otra célula.'],
    ['membrana', 'Membrana', 'Envoltura que regula el intercambio con el exterior.', parts.membrana.hint],
    ['citoplasma', 'Citoplasma', 'Medio interior donde se encuentran los orgánulos.', parts.citoplasma.hint],
    ['nucleo', 'Núcleo', 'Parte que contiene el ADN y sus instrucciones.', parts.nucleo.hint],
    ['organulos', 'Orgánulos', 'Estructuras que realizan tareas dentro de la célula.', 'El núcleo también es un orgánulo, aunque aquí lo estudiamos por separado.'],
    ['tejido', 'Tejido', 'Conjunto de células organizadas para colaborar en una función.', 'Las células musculares del corazón forman tejido muscular cardíaco.'],
    ['organo', 'Órgano', 'Estructura formada por varios tejidos que trabajan juntos.', 'El corazón es un órgano.'],
    ['aparato', 'Aparato o sistema', 'Conjunto de órganos que colaboran en una función.', 'El aparato circulatorio transporta sustancias por el cuerpo.'],
    ['unicelular', 'Unicelular', 'Ser vivo formado por una sola célula.', 'Una ameba es una célula y, al mismo tiempo, un organismo completo.'],
    ['nutricion', 'Nutrición', 'Función que obtiene materia y energía y elimina desechos.', 'En nuestro cuerpo colaboran los aparatos digestivo, respiratorio, circulatorio y excretor.'],
    ['relacion', 'Relación', 'Función que capta información y elabora respuestas.', 'Los sentidos, el sistema nervioso y el aparato locomotor colaboran al coger una pelota.'],
    ['reproduccion', 'Reproducción', 'Función que origina nuevos seres vivos.', 'En la reproducción sexual se unen dos células sexuales.']
  ].map(([id, term, definition, why]) => ({ id, term, definition, why }));
  const levels = [
    { id: 'celula', title: 'Célula', image: 'cardiaca', example: 'Célula muscular cardíaca', why: 'Es una unidad básica especializada en contraerse.' },
    { id: 'tejido', title: 'Tejido', image: 'tejido_cardiaco', example: 'Tejido muscular cardíaco', why: 'Muchas células se organizan para colaborar en la contracción.' },
    { id: 'organo', title: 'Órgano', image: 'corazon', example: 'Corazón', why: 'Varios tejidos forman el corazón y colaboran en su funcionamiento.' },
    { id: 'aparato', title: 'Aparato o sistema', image: 'circulatorio', example: 'Aparato circulatorio', why: 'Varios órganos colaboran para transportar sustancias.' },
    { id: 'organismo', title: 'Organismo', image: 'pelota', example: 'Persona', why: 'Todos los aparatos y sistemas trabajan coordinadamente en un ser vivo completo.' }
  ];
  const stations = [
    { id: 'digestivo', name: 'Digestivo', image: 'digestivo', why: 'Transforma los alimentos para obtener nutrientes sencillos, los absorbe y expulsa los restos no digeridos.' },
    { id: 'respiratorio', name: 'Respiratorio', image: 'respiratorio', why: 'Toma oxígeno del aire y expulsa dióxido de carbono.' },
    { id: 'circulatorio', name: 'Circulatorio', image: 'circulatorio', why: 'Transporta nutrientes y oxígeno a las células y recoge sus desechos.' },
    { id: 'excretor', name: 'Excretor', image: 'urinario', why: 'Elimina desechos principalmente con la orina y regula agua y sales.' },
    { id: 'celulas', name: 'Células', image: 'epitelial', why: 'Usan nutrientes y oxígeno para obtener materia y energía, y producen desechos.' },
    { id: 'exterior', name: 'Exterior', image: null, why: 'Los desechos salen del cuerpo por distintos caminos.' }
  ];
  const routes = [
    { id: 'nutrientes', title: 'La ruta de los nutrientes', cargo: 'Nutrientes', intro: 'Acabamos de comer. Ayuda a que los nutrientes lleguen a las células.', steps: [
      ['digestivo', '¿Qué aparato transforma los alimentos y absorbe nutrientes?', 'El digestivo obtiene nutrientes sencillos y los absorbe.'],
      ['circulatorio', 'Los nutrientes ya se han absorbido. ¿Qué aparato los transporta?', 'La sangre transporta los nutrientes gracias al aparato circulatorio.'],
      ['celulas', '¿Dónde se utilizan los nutrientes para crecer y obtener energía?', 'Las células usan los nutrientes. Son el destino de esta ruta.'] ] },
    { id: 'oxigeno', title: 'La ruta del oxígeno', cargo: 'Oxígeno', intro: 'El oxígeno está en el aire. ¿Cómo llegará al interior del cuerpo?', steps: [
      ['respiratorio', '¿Por qué aparato entra el oxígeno del aire?', 'El aparato respiratorio toma oxígeno del aire.'],
      ['circulatorio', 'El oxígeno pasa a la sangre. ¿Quién lo lleva por el cuerpo?', 'El aparato circulatorio transporta el oxígeno por la sangre.'],
      ['celulas', '¿Quién utiliza el oxígeno para obtener energía de los nutrientes?', 'Las células utilizan oxígeno y nutrientes para obtener energía.'] ] },
    { id: 'desechos', title: 'La ruta de otros desechos', cargo: 'Desechos celulares', intro: 'Las células han producido desechos que se eliminarán con la orina.', steps: [
      ['circulatorio', '¿Qué aparato recoge esos desechos y los transporta?', 'La sangre recoge desechos de las células y los lleva a los órganos que los eliminan.'],
      ['excretor', '¿Qué aparato elimina estos desechos mediante la orina?', 'El aparato excretor elimina desechos mediante la orina.'],
      ['exterior', 'Una vez expulsados con la orina, ¿adónde han ido?', 'Los desechos han salido al exterior del cuerpo.'] ] },
    { id: 'co2', title: 'La vuelta del dióxido de carbono', cargo: 'Dióxido de carbono', intro: 'Las células producen dióxido de carbono. Hay que sacarlo del cuerpo.', steps: [
      ['circulatorio', '¿Quién recoge y transporta el dióxido de carbono de las células?', 'El aparato circulatorio transporta este desecho por la sangre.'],
      ['respiratorio', '¿Qué aparato expulsa el dióxido de carbono al respirar?', 'El aparato respiratorio elimina dióxido de carbono. Los desechos no salen todos por la orina.'],
      ['exterior', 'Al expulsarlo con el aire, ¿adónde va?', 'El dióxido de carbono sale al exterior.'] ] }
  ];
  const responseSteps = [
    { title: 'Primero, detectamos', question: 'La pelota se acerca. ¿Qué órgano permite verla?', options: ['Ojos', 'Músculos', 'Estómago'], answer: 'Ojos', why: 'Los ojos detectan la pelota: es la información del estímulo.' },
    { title: 'La información viaja', question: '¿Qué lleva la información de los ojos al encéfalo?', options: ['Nervios', 'Huesos', 'Alimentos'], answer: 'Nervios', why: 'Los nervios transmiten la información al sistema nervioso central.' },
    { title: 'Coordinamos la respuesta', question: '¿Quién interpreta la información y coordina esta respuesta?', options: ['Encéfalo', 'Membrana', 'Aparato digestivo'], answer: 'Encéfalo', why: 'El encéfalo interpreta la información y envía órdenes. Estas también viajan por los nervios.' },
    { title: 'Nos movemos', question: '¿Qué se contrae para mover los brazos y las manos?', options: ['Músculos', 'Nutrientes', 'Óvulos'], answer: 'Músculos', why: 'Los músculos se contraen y mueven los huesos. Las articulaciones permiten esos movimientos.' }
  ];
  const blanks = [
    { id: 'sexual', answer: 'sexual', why: 'En la reproducción sexual se unen una célula sexual masculina y otra femenina.' },
    { id: 'masculina', answer: 'espermatozoide', why: 'El espermatozoide es la célula sexual masculina humana.' },
    { id: 'femenina', answer: 'óvulo', why: 'El óvulo es la célula sexual femenina humana.' },
    { id: 'union', answer: 'fecundación', why: 'La fecundación es la unión del espermatozoide y el óvulo.' },
    { id: 'primera', answer: 'cigoto', why: 'La fecundación forma una nueva célula llamada cigoto.' },
    { id: 'periodo', answer: 'embarazo', why: 'Durante el embarazo, el embrión y después el feto se desarrollan en el útero.' },
    { id: 'duracion', answer: 'nueve meses', why: 'El embarazo humano dura aproximadamente nueve meses.' },
    { id: 'nacimiento', answer: 'parto', why: 'En el parto, el bebé sale al exterior del cuerpo de la madre.' }
  ];
  const categories = [ { id: 'uni', name: 'Organismo unicelular', sub: 'Una célula es todo el ser vivo.' }, { id: 'pluri', name: 'Organismo pluricelular', sub: 'Muchas células forman el ser vivo.' }, { id: 'parte', name: 'Célula de un pluricelular', sub: 'Es una parte de un ser vivo.' } ];
  const classify = [
    { id: 'ameba', title: 'Una ameba', image: 'ameba', category: 'uni', why: 'Una ameba realiza todas las funciones vitales con una sola célula. Ya es un organismo.' },
    { id: 'bacteria', title: 'Una bacteria', symbol: '1', category: 'uni', why: 'Una bacteria es un ser unicelular. Las bacterias carecen de núcleo delimitado por membrana.' },
    { id: 'persona', title: 'Una persona', image: 'pelota', category: 'pluri', why: 'Nuestro cuerpo está formado por muchas células especializadas que colaboran.' },
    { id: 'arbol', title: 'Un árbol', symbol: '🌳', category: 'pluri', why: 'Un árbol es un ser vivo completo formado por muchas células.' },
    { id: 'neurona', title: 'Una neurona de una persona', image: 'neurona', category: 'parte', why: 'La neurona es una célula especializada que forma parte del cuerpo. No es un organismo unicelular independiente.' },
    { id: 'muscular', title: 'Una célula muscular del corazón', image: 'cardiaca', category: 'parte', why: 'Se especializa en contraerse y contribuye al latido del corazón junto a otras células.' },
    { id: 'vegetal', title: 'Una célula de una hoja', image: 'vegetal', category: 'parte', why: 'Es una célula que forma parte de una planta pluricelular.' },
    { id: 'epitelial', title: 'Una célula epitelial humana', image: 'epitelial', category: 'parte', why: 'Forma parte de un tejido que recubre y protege superficies del organismo.' },
    { id: 'perro', title: 'Un perro', symbol: '🐕', category: 'pluri', why: 'Un perro es un organismo con muchas células que se organizan y especializan.' }
  ];
  const quiz = [
    ['q1','¿Qué parte regula la entrada y salida de sustancias de la célula?',['Membrana','Núcleo','Tejido'],'Membrana',parts.membrana.hint,'celulas'],
    ['q2','¿Dónde se encuentran los orgánulos de la célula?',['En el citoplasma','Fuera del organismo','Solo en la sangre'],'En el citoplasma',parts.citoplasma.hint,'celulas'],
    ['q3','¿Qué parte contiene el ADN?',['Núcleo','Aparato locomotor','Piel'],'Núcleo',parts.nucleo.hint,'celulas'],
    ['q4','Una ameba es…',['Un organismo unicelular','Un tejido humano','Un órgano vegetal'],'Un organismo unicelular','Una sola célula constituye todo el ser vivo.','celulas'],
    ['q5','Una neurona humana aislada es…',['Una célula de un pluricelular','Una bacteria','Un organismo unicelular completo'],'Una célula de un pluricelular','Ser una sola célula no la convierte en un organismo independiente.','celulas'],
    ['q6','Especializarse significa…',['Adaptarse a una función concreta','Convertirse siempre en un organismo','Realizar todas las funciones por sí sola'],'Adaptarse a una función concreta','Por ejemplo, las musculares se contraen y las neuronas transmiten información.','celulas'],
    ['q7','¿Qué forman células organizadas que colaboran en una función?',['Un tejido','Un cigoto','Un aparato completo'],'Un tejido','Un tejido agrupa células que colaboran. Varios tejidos forman un órgano.','organizacion'],
    ['q8','El corazón es…',['Un órgano','Una sola célula','Un organismo completo'],'Un órgano','El corazón está formado por varios tejidos.','organizacion'],
    ['q9','¿Qué nivel va después de órgano en este esquema?',['Aparato o sistema','Célula','Tejido'],'Aparato o sistema','Varios órganos colaboran en un aparato o sistema.','organizacion'],
    ['q10','La nutrición permite…',['Obtener materia y energía y eliminar desechos','Únicamente comer alimentos','Solo moverse'],'Obtener materia y energía y eliminar desechos','La nutrición incorpora nutrientes y oxígeno y elimina desechos celulares.','nutricion'],
    ['q11','¿Qué aparato transforma alimentos y absorbe nutrientes?',['Digestivo','Locomotor','Nervioso'],'Digestivo','El digestivo también expulsa los restos no digeridos como heces.','nutricion'],
    ['q12','¿Qué aparato toma oxígeno del aire?',['Respiratorio','Digestivo','Excretor'],'Respiratorio','El respiratorio toma oxígeno y expulsa dióxido de carbono.','nutricion'],
    ['q13','¿Quién transporta nutrientes y oxígeno hasta las células?',['Aparato circulatorio','Aparato locomotor','Núcleo'],'Aparato circulatorio','La sangre transporta estas sustancias y recoge desechos.','nutricion'],
    ['q14','¿Qué aparato elimina desechos mediante la orina?',['Excretor','Digestivo','Locomotor'],'Excretor','El excretor también regula la cantidad de agua y sales.','nutricion'],
    ['q15','¿Qué diferencia es correcta?',['Las heces son restos no digeridos; la orina elimina desechos celulares','Heces y orina son lo mismo','El dióxido de carbono sale siempre por la orina'],'Las heces son restos no digeridos; la orina elimina desechos celulares','Los desechos no salen todos por el mismo camino: el respiratorio elimina dióxido de carbono.','nutricion'],
    ['q16','La función de relación permite…',['Captar información y responder','Formar nuevos seres vivos','Solo absorber nutrientes'],'Captar información y responder','Participan sentidos, sistema nervioso y, en las respuestas motoras, aparato locomotor.','relacion'],
    ['q17','¿Qué lleva información de los sentidos al sistema nervioso central?',['Nervios','Huesos','Nutrientes'],'Nervios','Los nervios conectan los órganos con el sistema nervioso central.','relacion'],
    ['q18','El sistema nervioso central está formado por…',['Encéfalo y médula espinal','Corazón y vasos','Huesos y articulaciones'],'Encéfalo y médula espinal','Los nervios que conectan con el cuerpo forman el sistema nervioso periférico.','relacion'],
    ['q19','¿Qué se contrae para mover los huesos?',['Músculos','Articulaciones','Óvulos'],'Músculos','Los huesos sostienen y protegen; las articulaciones los unen.','relacion'],
    ['q20','En la reproducción sexual se unen…',['Una célula sexual masculina y otra femenina','Dos tejidos musculares','Un órgano y un aparato'],'Una célula sexual masculina y otra femenina','En los humanos son el espermatozoide y el óvulo.','reproduccion'],
    ['q21','¿Cómo se llama la célula que se forma en la fecundación?',['Cigoto','Tejido','Neurona'],'Cigoto','El cigoto comienza a dividirse e inicia el desarrollo del nuevo ser.','reproduccion'],
    ['q22','¿Cuánto dura aproximadamente el embarazo humano?',['Nueve meses','Nueve días','Tres años'],'Nueve meses','Durante el embarazo, el embrión y después el feto se desarrollan en el útero.','reproduccion'],
    ['q23','¿Qué es el parto?',['La salida del bebé al exterior del cuerpo de la madre','La unión de las células sexuales','La absorción de nutrientes'],'La salida del bebé al exterior del cuerpo de la madre','La fecundación ocurre antes; el embarazo es el periodo de desarrollo.','reproduccion'],
    ['q24','¿Cuáles son las tres funciones vitales?',['Nutrición, relación y reproducción','Digestión, tejido y hueso','Respiración, núcleo y parto'],'Nutrición, relación y reproducción','Todos los seres vivos realizan estas funciones, aunque cada individuo no tiene que reproducirse para vivir.','funciones']
  ].map(([id, question, options, answer, why, topic]) => ({ id, question, options, answer, why, topic }));
  root.LVContent = { games, parts, cells, pairs, levels, stations, routes, responseSteps, blanks, categories, classify, quiz };
})(globalThis);
