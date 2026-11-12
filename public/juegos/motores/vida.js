// Motor «vida»: Naturales, tema 1 (El maniquí de Ciencias). Cada modo es una mecánica distinta:
//   portero     → eres la membrana: decides qué entra y qué sale de la célula
//   averia      → algo falla (en la célula, en la nutrición o en la relación): por los síntomas, ¿qué parte es?
//   cuenta      → ¿cuántos seres vivos y cuántas células hay? (unicelulares y pluricelulares)
//   zoom        → acercas y alejas la lupa hasta el nivel de organización que se describe
//   cadena      → ordenar un proceso (niveles, la función de relación, la reproducción), con intrusos
//   ruta        → llevar una miga, el aire o un desecho por el cuerpo eligiendo cada parada
//   musculo     → contraer o relajar dos músculos para mover el brazo o la pierna
//   articulacion→ ¿qué articulaciones hay que mover para…?
//   divide      → el cigoto se divide: predecir cuántas células habrá
import { el, svg, num, elige, barajar, suena } from './nucleo.js';
import { gsap } from './vendor/gsap.js';
import { espera, bote, chispasEn, temblor } from './efectos.js';
import { D, dib, tejido } from './vida-dibujos.js';

const lento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const porIntento = (n) => Math.max(0, 4 - n);
const porFallos = (f) => (f === 0 ? 3 : f === 1 ? 2 : f === 2 ? 1 : 0);
const icono = (k, cls = '') => el('span', { class: 'v-icono ' + cls, html: k === 'tejido-x' ? '' : dib(k) });
const may = (t) => t.charAt(0).toUpperCase() + t.slice(1);

// no repetir casos dentro de una partida (se vacía cuando se agota el banco)
const usados = new Map();
function saca(clave, lista, filtro = () => true) {
  const u = usados.get(clave) ?? new Set();
  let libres = lista.filter((x, i) => filtro(x) && !u.has(i));
  if (!libres.length) { u.clear(); libres = lista.filter(filtro); }
  const x = elige(libres);
  u.add(lista.indexOf(x)); usados.set(clave, u);
  return structuredClone(x);
}

/* =========================================================================== bancos */

// ---------- la membrana
const PARTICULAS = {
  oxigeno: { nombre: 'oxígeno' }, nutriente: { nombre: 'un nutriente' }, virus: { nombre: 'un virus' }, agua: { nombre: 'agua' },
  desecho: { nombre: 'un desecho' }, co2: { nombre: 'dióxido de carbono' },
};
const PORTERO = [
  { k: 'oxigeno', lado: 'fuera', pasa: true, por: 'La célula necesita **oxígeno** para sacar energía de los nutrientes.' },
  { k: 'nutriente', lado: 'fuera', pasa: true, por: 'Los **nutrientes** son su comida: materia y energía.' },
  { k: 'agua', lado: 'fuera', pasa: true, por: 'El **agua** también tiene que entrar: el citoplasma es líquido.' },
  { k: 'virus', lado: 'fuera', pasa: false, por: 'Un **virus** no le sirve de nada: si entra, la enferma.' },
  { k: 'desecho', lado: 'fuera', pasa: false, por: 'Es **basura** de fuera. Dentro solo estorbaría.' },
  { k: 'co2', lado: 'dentro', pasa: true, por: 'El **dióxido de carbono** es el desecho de sacar energía. Si no sale, se acumula.' },
  { k: 'desecho', lado: 'dentro', pasa: true, por: 'Los **desechos** tienen que salir: dentro estorban.' },
  { k: 'nutriente', lado: 'dentro', pasa: false, por: 'Es **comida que necesita**. Si la dejas salir, se queda sin.' },
  { k: 'oxigeno', lado: 'dentro', pasa: false, por: 'Es **oxígeno que acaba de entrar** y aún no ha usado. ¡Que no se escape!' },
];

// ---------- averías: el síntoma, la parte culpable y por qué no son las otras
const SISTEMAS = {
  celula: { titulo: 'La célula', partes: [['membrana', 'Membrana'], ['citoplasma', 'Citoplasma'], ['nucleo', 'Núcleo'], ['organulos', 'Orgánulos']] },
  nutricion: { titulo: 'El cuerpo', partes: [['digestivo', 'Aparato digestivo', 'ap-digestivo'], ['respiratorio', 'Aparato respiratorio', 'ap-respiratorio'], ['circulatorio', 'Aparato circulatorio', 'ap-circulatorio'], ['excretor', 'Aparato excretor', 'ap-excretor']] },
  relacion: { titulo: 'La relación', partes: [['sentidos', 'Los sentidos', 'ojo'], ['nervios', 'Los nervios', 'nervio'], ['encefalo', 'El encéfalo', 'encefalo'], ['locomotor', 'Músculos y huesos', 'musculo']] },
};
const AVERIAS = {
  celula: [
    { f: 1, sintoma: 'Entra de todo: **hasta los virus** pasan como si nada.', culpa: 'membrana', por: 'La **membrana** es la que controla qué entra y qué sale. Si falla, la puerta queda abierta.', no: { nucleo: 'El núcleo da las órdenes, pero no vigila la puerta.', citoplasma: 'El citoplasma es el líquido de dentro: no decide qué entra.', organulos: 'Los orgánulos trabajan dentro; la frontera es otra.' } },
    { f: 1, sintoma: 'Tiene oxígeno y nutrientes de sobra… pero **no consigue sacar energía**.', culpa: 'organulos', por: 'Los **orgánulos** (como las mitocondrias) son los que sacan la energía de los nutrientes.', no: { membrana: 'Las cosas ya han entrado: la membrana ha hecho su trabajo.', nucleo: 'El núcleo manda, pero la energía la fabrican los orgánulos.', citoplasma: 'El citoplasma es donde flotan; el trabajo lo hacen ellos.' } },
    { f: 2, sintoma: 'No crece, no se divide, no trabaja: **no sabe qué tiene que hacer**.', culpa: 'nucleo', por: 'El **núcleo** guarda el material genético, las instrucciones que controlan la célula.', no: { membrana: 'La membrana vigila la puerta, no da instrucciones.', organulos: 'Los orgánulos obedecen; el que sabe qué hacer es el núcleo.', citoplasma: 'En el citoplasma no están las instrucciones.' } },
    { f: 2, sintoma: 'Se le están **escapando los nutrientes** que acaba de conseguir.', culpa: 'membrana', por: 'Si se escapan, la **membrana** no está controlando la salida.', no: { nucleo: 'El núcleo no es una puerta.', organulos: 'Los orgánulos usan los nutrientes, no los dejan salir.', citoplasma: 'El citoplasma los contiene, pero quien los deja salir es la frontera.' } },
    { f: 3, sintoma: 'Se ha quedado **sin líquido por dentro**: los orgánulos no flotan y chocan entre sí.', culpa: 'citoplasma', por: 'El **citoplasma** es el líquido que rellena la célula y donde están los orgánulos.', no: { membrana: 'La membrana es la envoltura, no el relleno.', nucleo: 'El núcleo es una parte separada, con su propia membrana.', organulos: 'Los orgánulos están bien; lo que falta es lo que los rodea.' } },
    { f: 3, sintoma: 'Le han **cambiado las instrucciones** y ahora fabrica cosas que no debe.', culpa: 'nucleo', por: 'Las instrucciones están en el **material genético**, dentro del núcleo.', no: { membrana: 'La membrana no guarda instrucciones.', organulos: 'Los orgánulos fabrican lo que les mandan: el fallo viene de quien manda.', citoplasma: 'En el citoplasma flotan los orgánulos, no las instrucciones.' } },
  ],
  nutricion: [
    { f: 1, sintoma: 'Hace mucho calor y **no consigue sudar**.', culpa: 'excretor', por: 'El sudor es una forma de **excreción**: lo sacan las glándulas sudoríparas de la piel.', no: { circulatorio: 'La sangre llega bien a la piel; lo que falla es expulsar.', respiratorio: 'Respirar no tiene que ver con sudar.', digestivo: 'El digestivo trabaja con la comida.' } },
    { f: 1, sintoma: 'Se le acumulan desechos en la sangre y **casi no hace pis**.', culpa: 'excretor', por: 'Los **riñones** filtran la sangre y fabrican la orina: es el aparato excretor.', no: { circulatorio: 'La sangre lleva los desechos, pero no los saca del cuerpo.', digestivo: 'Por el ano salen restos de comida, no los desechos de la sangre.', respiratorio: 'Respirando sale el dióxido de carbono, no estos desechos.' } },
    { f: 2, sintoma: 'Respira bien y le entra oxígeno en los pulmones… pero **no le llega a las células de los pies**.', culpa: 'circulatorio', por: 'El oxígeno ya está en el cuerpo: el que lo **reparte** es el aparato circulatorio.', no: { respiratorio: 'El oxígeno ya ha entrado: el respiratorio ha cumplido.', digestivo: 'El digestivo no reparte oxígeno.', excretor: 'El excretor saca desechos, no reparte nada.' } },
    { f: 2, sintoma: 'La comida se queda **horas en el estómago sin deshacerse**.', culpa: 'digestivo', por: 'Deshacer la comida es la **digestión**, y el estómago es parte del aparato digestivo.', no: { circulatorio: 'La sangre recoge los nutrientes después, cuando ya están deshechos.', excretor: 'El excretor no deshace la comida.', respiratorio: 'El aire no pasa por el estómago.' } },
    { f: 2, sintoma: 'Come bien, pero **los nutrientes no pasan a la sangre**.', culpa: 'digestivo', por: 'Los nutrientes pasan a la sangre en el **intestino delgado**, dentro del aparato digestivo.', no: { circulatorio: 'La sangre los repartiría, pero primero tienen que llegar a ella: eso lo hace el intestino.', excretor: 'El excretor saca cosas, no las mete en la sangre.', respiratorio: 'El respiratorio mete oxígeno, no nutrientes.' } },
    { f: 3, sintoma: 'La sangre llega a los pulmones y **sale igual que entró: sin oxígeno**.', culpa: 'respiratorio', por: 'Coger oxígeno del aire en los pulmones es trabajo del **aparato respiratorio**.', no: { circulatorio: 'La sangre llega bien a los pulmones: el circulatorio funciona.', digestivo: 'El digestivo no da oxígeno.', excretor: 'El excretor no tiene que ver con el oxígeno.' } },
    { f: 3, sintoma: 'Después de correr, la sangre va **cargada de dióxido de carbono** y no consigue soltarlo.', culpa: 'respiratorio', por: 'El dióxido de carbono sale del cuerpo **respirando**: lo expulsan los pulmones.', no: { excretor: 'Los riñones sacan otros desechos, con la orina.', circulatorio: 'La sangre lo lleva hasta los pulmones; soltarlo es cosa de ellos.', digestivo: 'No sale por el aparato digestivo.' } },
    { f: 3, sintoma: 'El corazón late tan flojo que **todo llega tarde** a las células: los nutrientes y el oxígeno.', culpa: 'circulatorio', por: 'El **corazón** empuja la sangre que lo reparte todo: es el aparato circulatorio.', no: { respiratorio: 'El oxígeno entra bien; el problema es repartirlo.', digestivo: 'Los nutrientes llegan a la sangre; lo que falla es llevarlos.', excretor: 'El excretor no reparte.' } },
  ],
  relacion: [
    { f: 1, sintoma: 'Tiene los **ojos tapados**: el balón le da en la cara.', culpa: 'sentidos', por: 'Sin la vista no capta el **estímulo**: el balón. Todo empieza por los sentidos.', no: { encefalo: 'El encéfalo funciona, pero no le llega ningún aviso.', nervios: 'Los nervios no tienen nada que llevar.', locomotor: 'Los brazos podrían moverse, pero nadie les ha dicho cuándo.' } },
    { f: 1, sintoma: 'Está resfriado y **no huele** que se quema la tostada.', culpa: 'sentidos', por: 'El olor lo capta la **nariz**, el órgano del olfato.', no: { encefalo: 'El encéfalo interpretaría el olor si le llegara.', nervios: 'Los nervios llevan el aviso, pero primero alguien lo tiene que captar.', locomotor: 'No hace falta moverse para oler.' } },
    { f: 2, sintoma: 'Ve el balón, ve que viene hacia él… pero **no entiende qué es** ni qué hacer.', culpa: 'encefalo', por: 'El **encéfalo** interpreta la información y decide la respuesta.', no: { sentidos: 'Lo ha visto: los ojos funcionan.', nervios: 'El aviso ha llegado: lo que falta es entenderlo.', locomotor: 'Ni siquiera ha decidido moverse.' } },
    { f: 2, sintoma: 'Se pincha un dedo y **no siente nada en ese dedo**, aunque en los demás sí.', culpa: 'nervios', por: 'Si solo falla un dedo, el aviso no viaja desde ahí: es un **nervio**.', no: { encefalo: 'Si fallara el encéfalo, no sentiría nada en ningún dedo.', sentidos: 'La piel está bien: siente en los demás dedos.', locomotor: 'Sentir no es cosa de músculos.' } },
    { f: 3, sintoma: 'Decide coger el balón, la orden sale del encéfalo… pero **no llega al brazo**, y los músculos están sanos.', culpa: 'nervios', por: 'Las órdenes viajan del encéfalo a los músculos por los **nervios**.', no: { encefalo: 'El encéfalo ha decidido bien.', locomotor: 'Los músculos están sanos: no les llega la orden.', sentidos: 'Ha visto el balón.' } },
    { f: 3, sintoma: 'Lo ve, decide cogerlo, la orden llega… pero **se ha roto el codo** y el brazo no dobla.', culpa: 'locomotor', por: 'Los **huesos, las articulaciones y los músculos** ejecutan la respuesta. El codo es una articulación.', no: { nervios: 'La orden ha llegado.', encefalo: 'Ha decidido bien.', sentidos: 'Lo ha visto.' } },
  ],
};

// ---------- ¿cuántos seres vivos? ¿cuántas células?
const CUENTAS = [
  { f: 1, dibujos: ['ameba', 'ameba'], texto: 'Una **ameba** se parte en dos.', seres: 2, celulas: 2, por: 'Cada ameba es un ser vivo **unicelular**: una célula y, a la vez, un organismo completo.' },
  { f: 1, dibujos: ['hormiga'], texto: 'Una **hormiga** pasa por la mesa.', seres: 1, celulas: 'muchas', por: 'Una hormiga es **pluricelular**: un solo ser vivo hecho de muchísimas células.' },
  { f: 1, dibujos: ['paramecio', 'paramecio', 'paramecio', 'ameba', 'ameba'], texto: 'En una gota de charca hay **3 paramecios y 2 amebas**.', seres: 5, celulas: 5, por: 'Todos son **unicelulares**: tantas células como seres vivos.' },
  { f: 2, dibujos: ['piel'], texto: 'Se te cae **una célula de la piel** al suelo.', seres: 0, celulas: 1, por: 'Esa célula **no es un ser vivo**: es una pieza de uno pluricelular, que eres tú. Sola, no puede vivir.' },
  { f: 2, dibujos: ['medusa', 'seta'], texto: 'Una **medusa** y una **seta**.', seres: 2, celulas: 'muchas', por: 'Las dos son **pluricelulares**: dos seres vivos, muchísimas células.' },
  { f: 2, dibujos: ['bacteria'], texto: 'Una **bacteria** se divide y sus dos hijas **también se dividen**.', seres: 4, celulas: 4, por: '1 → 2 → 4. Cada bacteria es una sola célula y un ser vivo entero.' },
  { f: 3, dibujos: ['cigoto'], texto: 'El **cigoto**: la primera célula de un bebé, justo después de la fecundación.', seres: 1, celulas: 1, por: 'Todos los seres **pluricelulares** empiezan siendo **una sola célula**. Luego se divide muchas veces.' },
  { f: 3, dibujos: ['persona', 'ameba'], texto: 'Tú, mirando una **ameba** por el microscopio.', seres: 2, celulas: 'muchas', por: 'Dos seres vivos: tú (muchísimas células) y la ameba (una).' },
  { f: 3, dibujos: ['bacteria', 'bacteria', 'bacteria'], texto: 'Tres **bacterias** se dividen **una vez cada una**.', seres: 6, celulas: 6, por: 'Cada una se parte en dos: 3 × 2 = 6 bacterias, cada una de una sola célula.' },
];

// ---------- la lupa: niveles de organización
const NIVELES = ['celula', 'tejido', 'organo', 'aparato', 'organismo'];
const NOMBRE_NIVEL = { celula: 'célula', tejido: 'tejido', organo: 'órgano', aparato: 'aparato o sistema', organismo: 'organismo' };
const CADENAS = {
  nervioso: { celula: ['neurona', 'Una neurona'], tejido: ['neurona', 'Tejido nervioso: muchas neuronas'], organo: ['encefalo', 'El encéfalo'], aparato: ['ap-nervioso', 'El sistema nervioso'], organismo: ['persona', 'Una persona'] },
  circulatorio: { celula: ['muscular', 'Una célula muscular del corazón'], tejido: ['muscular', 'Tejido muscular'], organo: ['corazon', 'El corazón'], aparato: ['ap-circulatorio', 'El aparato circulatorio'], organismo: ['persona', 'Una persona'] },
  digestivo: { celula: ['intestinal', 'Una célula del intestino'], tejido: ['intestinal', 'El tejido que tapiza el intestino'], organo: ['intestino-delgado', 'El intestino delgado'], aparato: ['ap-digestivo', 'El aparato digestivo'], organismo: ['persona', 'Una persona'] },
  locomotor: { celula: ['osea', 'Una célula del hueso'], tejido: ['osea', 'Tejido óseo'], organo: ['hueso', 'Un hueso: el fémur'], aparato: ['ap-locomotor', 'El aparato locomotor'], organismo: ['persona', 'Una persona'] },
};
const PISTA_NIVEL = {
  celula: ['Lo más pequeño que **sigue vivo**. Si lo partes, deja de estarlo.', 'Ni un trozo más pequeño: **una sola** unidad de vida.'],
  tejido: ['Muchas células **iguales** haciendo **el mismo trabajo**.', 'Un montón de células **del mismo tipo**, juntas.'],
  organo: ['Una sola pieza hecha de **varios tejidos distintos** que trabajan juntos.', 'Una pieza con forma propia: tiene **tejidos de varias clases**.'],
  aparato: ['**Varios órganos distintos** colaborando en **una misma función**.', 'Un equipo de órganos: ninguno solo podría hacer el trabajo.'],
  organismo: ['**Todo funcionando a la vez**: un ser vivo completo.', 'Todos los aparatos y sistemas juntos, coordinados.'],
};

// ---------- cadenas para ordenar
const ORDENAR = {
  niveles: Object.entries(CADENAS).map(([id, c]) => ({ id, titulo: 'De lo más pequeño a lo más grande', pasos: NIVELES.map((n) => ({ k: c[n][0], t: c[n][1], tej: n === 'tejido' })), intrusos: [{ k: 'rinones', t: 'Los riñones' }, { k: 'pulmones', t: 'Los pulmones' }, { k: 'oxigeno', t: 'Una molécula de oxígeno' }].filter((x) => !Object.values(c).some((v) => v[0] === x.k)).slice(0, 1), por: `Célula → tejido → órgano → aparato → organismo. Cada nivel está hecho del anterior.` })),
  relacion: [
    { id: 'balon', titulo: 'Te lanzan un balón y lo coges', pasos: [{ k: 'ojo', t: 'Los ojos ven venir el balón' }, { k: 'nervio', t: 'Un nervio lleva el aviso al encéfalo' }, { k: 'encefalo', t: 'El encéfalo decide: ¡cógelo!' }, { k: 'nervio', t: 'Otro nervio lleva la orden al brazo' }, { k: 'musculo', t: 'Los músculos del brazo se contraen' }, { k: 'hueso', t: 'Los huesos se mueven y lo coges' }], intrusos: [{ k: 'corazon', t: 'El corazón decide qué hacer' }], por: 'Sentidos → nervios → encéfalo → nervios → músculos → huesos. Primero **captar**, luego **decidir**, luego **moverse**.' },
    { id: 'nombre', titulo: 'Alguien dice tu nombre y giras la cabeza', pasos: [{ k: 'oido', t: 'Los oídos captan el sonido' }, { k: 'nervio', t: 'Un nervio lleva el aviso al encéfalo' }, { k: 'encefalo', t: 'El encéfalo reconoce tu nombre' }, { k: 'nervio', t: 'Otro nervio lleva la orden al cuello' }, { k: 'musculo', t: 'Los músculos del cuello se contraen' }, { k: 'persona', t: 'Giras la cabeza' }], intrusos: [{ k: 'lengua', t: 'La lengua capta el sonido' }], por: 'El sonido lo captan los **oídos**, no otro sentido. Luego, el camino de siempre: nervio, encéfalo, nervio, músculos.' },
    { id: 'bizcocho', titulo: 'Huele a bizcocho y vas a la cocina', pasos: [{ k: 'nariz', t: 'La nariz capta el olor' }, { k: 'nervio', t: 'Un nervio lleva el aviso al encéfalo' }, { k: 'encefalo', t: 'El encéfalo piensa: ¡merienda!' }, { k: 'medula', t: 'La orden baja por la médula espinal' }, { k: 'nervio', t: 'Un nervio la lleva a las piernas' }, { k: 'musculo', t: 'Los músculos de las piernas se contraen y caminas' }], intrusos: [{ k: 'estomago', t: 'El estómago huele el bizcocho' }], por: 'El encéfalo y la **médula espinal** forman el sistema nervioso central. La orden baja por la médula y sale por los nervios.' },
  ],
  reproduccion: [
    { id: 'vida', titulo: 'De dos células a un bebé', pasos: [{ k: 'ovulo', t: 'Un óvulo sale del ovario' }, { k: 'espermatozoide', t: 'Un espermatozoide llega a las trompas de Falopio' }, { k: 'cigoto', t: 'Se unen: es la fecundación. Nace una célula nueva, el cigoto' }, { k: 'cigoto', t: 'El cigoto se divide una y otra vez' }, { k: 'utero', t: 'Embarazo: crece dentro del útero unos nueve meses' }, { k: 'bebe', t: 'Parto: el bebé sale al exterior' }], intrusos: [{ k: 'estomago', t: 'El bebé crece en el estómago de la madre' }, { k: 'ovulo', t: 'Los óvulos se fabrican en los testículos' }], por: 'Óvulo + espermatozoide → **fecundación** → cigoto → divisiones → **embarazo** en el útero → **parto**.' },
  ],
};

// ---------- el viaje: cada parada con sus caminos equivocados y lo que pasaría
const ESTACIONES = {
  boca: 'Boca', nariz: 'Fosas nasales', faringe: 'Faringe', esofago: 'Esófago', laringe: 'Laringe', traquea: 'Tráquea', bronquios: 'Bronquios', pulmones: 'Pulmones',
  estomago: 'Estómago', 'intestino-delgado': 'Intestino delgado', 'intestino-grueso': 'Intestino grueso', ano: 'Recto y ano', sangre: 'Sangre', corazon: 'Corazón', celula: 'Una célula',
  rinones: 'Riñones', ureteres: 'Uréteres', vejiga: 'Vejiga', uretra: 'Uretra', fuera: 'Fuera del cuerpo',
};
const ART = { boca: 'la', nariz: 'las', faringe: 'la', esofago: 'el', laringe: 'la', traquea: 'la', bronquios: 'los', pulmones: 'los', estomago: 'el', 'intestino-delgado': 'el', 'intestino-grueso': 'el', ano: 'el', sangre: 'la', corazon: 'el', rinones: 'los', ureteres: 'los', vejiga: 'la', uretra: 'la' };
const conArt = (k) => (ART[k] ? `${ART[k]} ${k === 'ano' ? 'recto' : ESTACIONES[k].toLowerCase()}` : ESTACIONES[k].toLowerCase());
const RUTAS = {
  miga: { f: 1, gen: 'f', carga: 'miga', nombre: 'una miga de pan', meta: 'que sus nutrientes lleguen a una célula', pasos: [
    ['boca', ['estomago', 'Todavía no: antes de llegar al estómago hay que tragar.'], ['nariz', 'Boca y nariz se juntan en la faringe, pero la comida no sube a la nariz.']],
    ['faringe', ['traquea', '**¡Cof, cof!** Por la tráquea va el aire. Si entra comida, te atragantas: por eso tosemos.'], ['laringe', 'La laringe es el camino del aire. La comida baja por el esófago.']],
    ['esofago', ['pulmones', 'El esófago no va a los pulmones: baja, detrás de la tráquea, hasta el estómago.'], ['intestino-delgado', 'Antes del intestino está el estómago, que deshace la comida.']],
    ['estomago', ['sangre', 'En el estómago la comida se deshace, pero **todavía no pasa a la sangre**: eso ocurre en el intestino delgado.'], ['intestino-grueso', 'Primero va el intestino delgado. Al grueso solo llega lo que no se ha aprovechado.']],
    ['intestino-delgado', ['intestino-grueso', 'Los nutrientes no siguen por el tubo: **pasan a la sangre** en el intestino delgado. Al grueso solo van los restos.'], ['corazon', 'No hay un tubo del intestino al corazón: los nutrientes pasan a la sangre y la sangre los lleva.']],
    ['sangre', ['rinones', 'Los riñones limpian la sangre de desechos. Los nutrientes van a las células.'], ['pulmones', 'A los pulmones la sangre va a por oxígeno. Los nutrientes van a las células.']],
    ['celula'],
  ] },
  aire: { f: 2, gen: 'f', carga: 'oxigeno', nombre: 'una bocanada de aire', meta: 'que su oxígeno llegue a una célula', pasos: [
    ['nariz', ['esofago', 'Antes de separarse, aire y comida pasan los dos por la faringe.'], ['pulmones', 'Todavía no: hay un buen trecho de tubos hasta los pulmones.']],
    ['faringe', ['esofago', 'Por el esófago baja la comida. El aire sigue por la laringe.'], ['estomago', 'El aire no va al estómago (si tragas mucho aire, eructas).']],
    ['laringe', ['bronquios', 'Entre la laringe y los bronquios hay un tubo con anillos: la tráquea.'], ['esofago', 'El esófago es el tubo de la comida.']],
    ['traquea', ['pulmones', 'Casi. Antes, la tráquea **se divide en dos bronquios**, uno para cada pulmón.'], ['corazon', 'El aire no entra en el corazón: va por tubos hasta los pulmones.']],
    ['bronquios', ['sangre', 'El oxígeno pasa a la sangre, pero **dentro de los pulmones**.'], ['estomago', 'Del aparato respiratorio no se pasa al digestivo.']],
    ['pulmones', ['celula', 'El oxígeno no viaja solo hasta las células: lo recoge la **sangre** en los pulmones.'], ['traquea', 'Hacia atrás sale el aire usado, no el oxígeno.']],
    ['sangre', ['celula', 'Casi: primero la sangre pasa por el **corazón**, que la empuja hacia todo el cuerpo.'], ['rinones', 'Los riñones limpian desechos. El oxígeno va al corazón para repartirse.']],
    ['corazon', ['pulmones', 'Ya viene de los pulmones con oxígeno: ahora toca repartirlo.'], ['estomago', 'El oxígeno va a todas las células, no al estómago en especial.']],
    ['celula'],
  ] },
  desecho: { f: 2, gen: 'm', carga: 'desecho', nombre: 'un desecho de una célula', meta: 'que salga del cuerpo', pasos: [
    ['celula', ['vejiga', 'La orina se fabrica en los riñones; para llegar allí, el desecho viaja en la **sangre**.'], ['pulmones', 'Por los pulmones sale el dióxido de carbono, no este desecho.']],
    ['sangre', ['pulmones', 'Por los pulmones sale el dióxido de carbono. Este desecho lo filtran los **riñones**.'], ['intestino-grueso', 'Al intestino grueso van los restos de comida, no los desechos de la sangre.']],
    ['rinones', ['vejiga', 'Casi: entre los riñones y la vejiga hay dos tubos, los **uréteres**.'], ['sangre', 'Hacia atrás no: los riñones acaban de limpiar la sangre.']],
    ['ureteres', ['uretra', 'Antes de salir, la orina se guarda en la **vejiga**.'], ['intestino-grueso', 'Los uréteres no van al intestino.']],
    ['vejiga', ['ano', 'Por el ano salen los restos de la comida. La orina sale por la **uretra**.'], ['ureteres', 'Hacia atrás no.']],
    ['uretra', ['vejiga', 'Hacia atrás no.'], ['rinones', 'Hacia atrás no: ya está saliendo.']],
    ['fuera'],
  ] },
  resto: { f: 3, gen: 'm', carga: 'resto', nombre: 'lo que el cuerpo no aprovecha de la comida', meta: 'que salga del cuerpo', pasos: [
    ['estomago', ['sangre', 'Esto no se aprovecha: no pasa a la sangre.'], ['esofago', 'La comida no vuelve hacia atrás.']],
    ['intestino-delgado', ['sangre', 'Lo que pasa a la sangre son los nutrientes. Esto es lo que **no** sirve: sigue por el tubo.'], ['vejiga', 'La vejiga guarda la orina, que viene de los riñones.']],
    ['intestino-grueso', ['uretra', 'Por la uretra sale la orina. Los restos de comida siguen hasta el recto.'], ['estomago', 'Hacia atrás no.']],
    ['ano', ['uretra', 'Por la uretra sale la orina, no los restos de la comida.'], ['boca', 'Hacia atrás no.']],
    ['fuera'],
  ] },
  co2: { f: 3, gen: 'm', carga: 'co2', nombre: 'el dióxido de carbono de una célula', meta: 'que salga del cuerpo', pasos: [
    ['celula', ['rinones', 'El dióxido de carbono no va directo a ningún órgano: primero lo recoge la **sangre**.'], ['fuera', 'Una célula de dentro del cuerpo no puede echarlo fuera sola.']],
    ['sangre', ['rinones', 'Los riñones sacan otros desechos, con la orina. El dióxido de carbono sale **respirando**.'], ['estomago', 'El dióxido de carbono no sale por el aparato digestivo.']],
    ['corazon', ['rinones', 'Los riñones sacan otros desechos. Este va hacia los **pulmones**.'], ['celula', 'Hacia atrás no: ya salió de la célula.']],
    ['pulmones', ['esofago', 'Por el esófago baja la comida. El aire usado sale por la **tráquea**.'], ['sangre', 'Ya ha salido de la sangre en los pulmones.']],
    ['traquea', ['estomago', 'El aire no va al estómago.'], ['pulmones', 'Hacia atrás no.']],
    ['fuera'],
  ] },
};

// ---------- ¿por dónde sale del cuerpo?
const SALIDAS = { nariz: ['nariz', 'Nariz y boca'], piel: ['mano', 'La piel'], uretra: ['uretra', 'Uretra'], ano: ['ano', 'Ano'] };
const SALE = [
  { f: 1, k: 'co2', t: 'El dióxido de carbono', sale: 'nariz', por: 'El dióxido de carbono sale **respirando**, por la nariz o la boca.' },
  { f: 1, k: 'resto', t: 'Los restos de la comida que no se han aprovechado', sale: 'ano', por: 'Lo que no se digiere sale por el **ano**. Ojo: eso no es excreción, porque nunca llegó a la sangre.' },
  { f: 1, k: 'vejiga', t: 'La orina', sale: 'uretra', por: 'La orina la fabrican los riñones y sale por la **uretra**.' },
  { f: 2, k: 'agua', t: 'El sudor', sale: 'piel', por: 'El sudor lo fabrican las glándulas sudoríparas de la **piel**. También es excreción.' },
  { f: 2, k: 'desecho', t: 'Un desecho que las células han soltado en la sangre', sale: 'uretra', por: 'Los riñones lo sacan de la sangre y lo mandan con la orina, por la **uretra**.' },
  { f: 3, k: 'agua', t: 'El vaho que empaña un cristal cuando le echas el aliento', sale: 'nariz', por: 'Es agua que sale **respirando**: por eso el cristal frío se empaña.' },
  { f: 3, k: 'miga', t: 'Una pipa que te has tragado entera, sin masticar', sale: 'ano', por: 'Si no se digiere, sigue por el tubo y sale por el **ano**, igual que entró.' },
];
ORDENAR.nutricion = [
  { id: 'aire', titulo: 'El camino del aire, de fuera hacia dentro', pasos: ['nariz', 'faringe', 'laringe', 'traquea', 'bronquios', 'pulmones'].map((k) => ({ k, t: ESTACIONES[k] })), intrusos: [{ k: 'esofago', t: 'Esófago' }], por: 'Fosas nasales → faringe → laringe → tráquea → bronquios → pulmones. El esófago es el tubo de la comida.' },
  { id: 'miga', titulo: 'El camino de la comida, de la boca hacia abajo', pasos: ['boca', 'faringe', 'esofago', 'estomago', 'intestino-delgado', 'intestino-grueso'].map((k) => ({ k, t: ESTACIONES[k] })), intrusos: [{ k: 'traquea', t: 'Tráquea' }], por: 'Boca → faringe → esófago → estómago → intestino delgado → intestino grueso. Por la tráquea va el aire.' },
  { id: 'orina', titulo: 'El camino de un desecho de la sangre hasta salir', pasos: ['sangre', 'rinones', 'ureteres', 'vejiga', 'uretra'].map((k) => ({ k, t: ESTACIONES[k] })), intrusos: [{ k: 'intestino-grueso', t: 'Intestino grueso' }], por: 'Sangre → riñones → uréteres → vejiga → uretra. El intestino grueso es de la comida, no de la sangre.' },
];

// ---------- músculos: cada músculo solo sabe tirar
const MOVIMIENTOS = {
  brazo: {
    nombre: 'el brazo', a: ['biceps', 'Bíceps', 'delante'], b: ['triceps', 'Tríceps', 'detrás'],
    objetivos: [
      { id: 'dobla', txt: 'Sube la mano hasta la boca para comerte el bocadillo.', a: true, b: false, por: 'El **bíceps** se contrae y tira del antebrazo hacia arriba; el **tríceps** se relaja y se deja estirar.' },
      { id: 'estira', txt: 'Estira el brazo con fuerza para empujar la puerta.', a: false, b: true, por: 'El **tríceps** se contrae y estira el brazo; el **bíceps** se relaja.' },
      { id: 'firme', txt: 'Aguanta el brazo **doblado y quieto** con la mochila colgando.', a: true, b: true, por: 'Los **dos contraídos** a la vez: cada uno tira hacia su lado y el brazo se queda firme.' },
      { id: 'suelta', txt: 'Deja el brazo **colgando, relajado**, como cuando esperas en la fila.', a: false, b: false, por: 'Los **dos relajados**: ninguno tira y el brazo cuelga solo.' },
    ],
  },
  pierna: {
    nombre: 'la pierna', a: ['cuadriceps', 'Cuádriceps', 'delante'], b: ['isquios', 'Isquiotibiales', 'detrás'],
    objetivos: [
      { id: 'estira', txt: '¡Chuta! Estira la rodilla de golpe para darle al balón.', a: true, b: false, por: 'El **cuádriceps**, delante del muslo, se contrae y estira la rodilla.' },
      { id: 'dobla', txt: 'Dobla la rodilla para llevar el talón hacia atrás.', a: false, b: true, por: 'Los **isquiotibiales**, detrás del muslo, se contraen y doblan la rodilla.' },
      { id: 'firme', txt: 'Aguanta **sin moverte** a medio agachar, como un portero esperando el penalti.', a: true, b: true, por: 'Los **dos contraídos**: la rodilla queda firme.' },
    ],
  },
};
const ARTICULACIONES = [['craneo', 'Cráneo', 50, 9], ['mandibula', 'Mandíbula', 50, 19], ['hombro', 'Hombro', 32, 29], ['codo', 'Codo', 25, 45], ['muneca', 'Muñeca', 20, 60], ['cadera', 'Cadera', 41, 58], ['rodilla', 'Rodilla', 41, 76], ['tobillo', 'Tobillo', 41, 92]];
const TAREAS_ART = [
  { f: 1, txt: '¿Qué articulación mueves para **masticar**?', hay: ['mandibula'], vale: [], por: 'La **mandíbula** es la única parte de la cabeza que se mueve.' },
  { f: 1, txt: '¿Cuál de estas es una articulación **fija**, que no se mueve nunca?', hay: ['craneo'], vale: [], por: 'Los huesos del **cráneo** están soldados: protegen el encéfalo.' },
  { f: 2, txt: 'Para **chutar un balón**, ¿qué articulaciones tienes que mover?', hay: ['cadera', 'rodilla'], vale: ['tobillo'], por: 'La pierna se mueve desde la **cadera** y la **rodilla**; el tobillo ayuda a apuntar.' },
  { f: 2, txt: 'Para **sentarte en una silla**, ¿qué articulaciones doblas?', hay: ['cadera', 'rodilla'], vale: ['tobillo'], por: 'Te doblas por la **cadera** y por la **rodilla**.' },
  { f: 3, txt: 'Para **tocarte la nariz** con el dedo, ¿qué articulaciones del brazo mueves?', hay: ['codo'], vale: ['hombro', 'muneca'], por: 'Sobre todo el **codo**, que dobla el brazo; el hombro y la muñeca ajustan.' },
  { f: 3, txt: 'Para **lanzar una pelota** por encima de la cabeza, ¿qué articulaciones del brazo mueves?', hay: ['hombro', 'codo'], vale: ['muneca'], por: 'El **hombro** sube el brazo y el **codo** lo estira; la muñeca da el último golpe.' },
];

/* =========================================================================== generar */
export function generar(spec) {
  const d = structuredClone(spec);
  const g = typeof d.generar === 'object' ? d.generar : {};
  delete d.generar;
  const f = g.f ?? 3;
  if (d.modo === 'portero') {
    const lados = g.lados ?? ['fuera', 'dentro'];
    const pool = PORTERO.filter((p) => lados.includes(p.lado));
    const n = g.n ?? 5;
    let lista = [];
    while (lista.length < n) lista.push(...barajar(pool.slice()));
    lista = lista.slice(0, n);
    if (!lista.some((p) => !p.pasa)) lista[lista.length - 1] = structuredClone(elige(pool.filter((p) => !p.pasa)));
    d.particulas = lista;
  } else if (d.modo === 'averia') {
    d.sistema = g.sistema ?? 'celula';
    d.caso = saca('av-' + d.sistema, AVERIAS[d.sistema], (c) => c.f <= f && c.f >= (g.min ?? 1));
  } else if (d.modo === 'cuenta') {
    d.caso = saca('cuenta', CUENTAS, (c) => c.f <= f && c.f >= (g.min ?? 1));
  } else if (d.modo === 'zoom') {
    d.cadena = elige(g.cadenas ?? Object.keys(CADENAS));
    d.objetivo = elige(g.niveles ?? NIVELES);
    d.texto = elige(PISTA_NIVEL[d.objetivo]);
    d.inicio = d.objetivo === 'organismo' ? 'celula' : d.objetivo === 'celula' ? 'organismo' : elige(['celula', 'organismo']);
  } else if (d.modo === 'cadena') {
    d.tema = g.tema ?? 'niveles';
    d.cadena = saca('cad-' + d.tema, ORDENAR[d.tema]);
    d.conIntrusos = g.intrusos ?? true;
  } else if (d.modo === 'ruta') {
    const ids = g.rutas ?? Object.keys(RUTAS);
    d.ruta = saca('ruta', ids.map((k) => k));
    if (g.tramo) { const L = RUTAS[d.ruta].pasos.length; const k = Math.min(g.tramo, L - 1); d.desde = Math.floor(Math.random() * (L - k)); d.hasta = d.desde + k; }
  } else if (d.modo === 'salida') {
    const pool = SALE.filter((x) => x.f <= f && x.f >= (g.min ?? 1));
    d.cosas = barajar(pool.slice()).slice(0, g.n ?? 4);
  } else if (d.modo === 'musculo') {
    d.parte = elige(g.partes ?? ['brazo']);
    const objs = MOVIMIENTOS[d.parte].objetivos.filter((o) => !g.objetivos || g.objetivos.includes(o.id));
    d.obj = saca('mus-' + d.parte, objs).id;
  } else if (d.modo === 'articulacion') {
    d.tarea = saca('art', TAREAS_ART, (t) => t.f <= f && t.f >= (g.min ?? 1));
  } else if (d.modo === 'divide') {
    d.n = elige(g.n ?? [2, 3, 4]);
    d.inverso = !!g.inverso;
  }
  return d;
}
export function ronda(d, ctx) {
  const m = { portero, averia, cuenta, zoom, cadena, ruta, salida, musculo, articulacion, divide }[d.modo];
  if (!m) throw new Error(`no encuentro el modo «${d.modo}». Si el juego se acaba de actualizar, recarga la página.`);
  return m(d, ctx);
}

/* =========================================================================== modos */

// ---------------------------------------------------------------- el portero de la célula
function portero(d, ctx) {
  const lista = d.particulas;
  ctx.reto(d.texto ?? 'Eres la **membrana** de esta célula. Decide qué **pasa** y qué **no pasa**.');
  ctx.pista(d.pista ?? 'Pregúntate cada vez: ¿la célula lo necesita, o le sobra?');
  const celula = el('div', { class: 'v-portero-celula', html: dib('celula') });
  const hueco = el('div', { class: 'v-portero-hueco' });
  const fila = el('ol', { class: 'v-portero-fila', 'aria-label': 'Lo que va llegando' }, lista.map((p) => el('li', { html: dib(p.k) })));
  const quien = el('p', { class: 'v-portero-quien', 'aria-live': 'polite' });
  const mesa = el('div', { class: 'v-portero' }, el('div', { class: 'v-portero-escena' }, celula, hueco), quien, fila);
  ctx.escenario.append(mesa);
  let i = 0, fallos = 0;
  const malos = [];
  const pinta = () => {
    const p = lista[i];
    hueco.replaceChildren(el('div', { class: 'v-particula ' + p.lado, html: dib(p.k) }));
    hueco.dataset.lado = p.lado;
    quien.innerHTML = p.lado === 'fuera' ? `Llega <b>${PARTICULAS[p.k].nombre}</b> desde fuera. ¿Lo dejas <b>entrar</b>?` : `Hay <b>${PARTICULAS[p.k].nombre}</b> dentro que quiere salir. ¿Lo dejas <b>salir</b>?`;
    fila.querySelectorAll('li').forEach((li, k) => li.classList.toggle('ahora', k === i));
    if (!lento()) gsap.from(hueco.firstChild, { x: p.lado === 'fuera' ? -80 : 0, scale: p.lado === 'dentro' ? 0.3 : 1, opacity: 0, duration: 0.45, ease: 'back.out(1.8)' });
    ctx.pistas([
      { texto: 'Lo que la célula **necesita** tiene que estar dentro. Lo que **le sobra**, fuera.' },
      { texto: 'Necesita: oxígeno, nutrientes y agua. Le sobran: los desechos, el dióxido de carbono… y los virus.' },
      { texto: `Este es ${PARTICULAS[p.k].nombre} ${p.lado === 'fuera' ? 'de fuera' : 'de dentro'}: ${p.pasa ? '**déjalo pasar**' : '**no lo dejes pasar**'}.` },
    ]);
  };
  const decide = async (pasa) => {
    const p = lista[i];
    const ok = pasa === p.pasa;
    si.disabled = no.disabled = true;
    const bola = hueco.firstChild;
    if (!lento()) {
      if (pasa) await gsap.to(bola, { x: p.lado === 'fuera' ? 130 : -150, scale: p.lado === 'fuera' ? 0.7 : 1, duration: 0.45, ease: 'power2.in' });
      else { await gsap.to(bola, { x: p.lado === 'fuera' ? 40 : -40, duration: 0.18 }); await gsap.to(bola, { x: 0, duration: 0.3, ease: 'back.out(3)' }); }
    }
    suena(ok ? 'bien' : 'mal');
    fila.children[i].classList.add(ok ? 'bien' : 'mal');
    if (!ok) { fallos++; malos.push(p); temblor(celula, 6); celula.classList.add('enfadada'); setTimeout(() => celula.classList.remove('enfadada'), 700); }
    else bote(celula, 6);
    ctx.aviso((ok ? '' : '¡Uy! ') + p.por.replace(/\*\*/g, ''), !ok);
    await espera(ok ? 900 : 1700);
    i++;
    if (i < lista.length) { si.disabled = no.disabled = false; pinta(); return; }
    const resumen = fallos === 0 ? '**Ni un error.** Dentro, lo que la célula necesita; fuera, lo que le sobra: así trabaja la membrana.' : `**${lista.length - fallos} de ${lista.length}.** ` + malos.map((m) => m.por).join(' ');
    ctx.fin(porFallos(fallos), resumen);
  };
  const si = ctx.boton('Dejar pasar', () => decide(true));
  const no = ctx.boton('No dejar pasar', () => decide(false));
  no.classList.add('v-no');
  pinta();
}

// ---------------------------------------------------------------- averías
function averia(d, ctx) {
  const S = SISTEMAS[d.sistema], c = d.caso;
  ctx.reto(d.sistema === 'celula' ? 'Esta célula tiene un problema. **¿Qué parte falla?**' : d.sistema === 'nutricion' ? 'Llega un paciente a la consulta. **¿Qué aparato falla?**' : 'Algo falla en la cadena. **¿Qué eslabón es?**');
  ctx.pista(d.pista ?? 'Busca primero lo que sí funciona según el síntoma: eso no puede ser.');
  let elegido = null, intentos = 0;
  const tachadas = new Set();
  const dibujo = d.sistema === 'celula' ? el('div', { class: 'v-averia-celula', html: dib('celula') }) : null;
  const opciones = el('div', { class: 'v-opciones' + (d.sistema === 'celula' ? ' v-opciones-texto' : '') }, S.partes.map(([id, nombre, icon]) => {
    const b = el('button', { type: 'button', class: 'v-tarjeta', 'data-id': id, 'aria-pressed': 'false', onclick: () => elige_(id) },
      icon && el('span', { class: 'v-tarjeta-dibujo', html: dib(icon) }), el('span', { class: 'v-tarjeta-nombre', text: nombre }));
    return b;
  }));
  const elige_ = (id) => {
    if (tachadas.has(id)) return;
    elegido = id; suena('clic');
    opciones.querySelectorAll('.v-tarjeta').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
    dibujo?.querySelectorAll('[data-parte]').forEach((g) => g.classList.toggle('resalta', g.dataset.parte === id));
    boton.disabled = false;
  };
  dibujo?.querySelectorAll('[data-parte]').forEach((g) => g.addEventListener('click', () => elige_(g.dataset.parte)));
  ctx.escenario.append(el('div', { class: 'v-averia' }, el('div', { class: 'v-sintoma' }, el('span', { class: 'v-sintoma-icono', html: dib(d.sistema === 'celula' ? 'lupa' : d.sistema === 'nutricion' ? 'estetoscopio' : 'balon') }), el('p', { html: c.sintoma.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>') })), dibujo, opciones));
  const boton = ctx.boton('Esta es', () => {
    if (!elegido) return;
    intentos++;
    if (elegido === c.culpa) {
      opciones.querySelector(`[data-id="${elegido}"]`).classList.add('bien');
      return ctx.fin(porIntento(intentos), c.por);
    }
    const b = opciones.querySelector(`[data-id="${elegido}"]`);
    b.classList.add('tachada'); b.disabled = true; tachadas.add(elegido);
    temblor(b, 6); suena('mal');
    ctx.aviso(c.no[elegido] ?? 'Esa no es.', true);
    elegido = null; boton.disabled = true;
    if (intentos >= 3) { opciones.querySelector(`[data-id="${c.culpa}"]`).classList.add('bien'); ctx.fin(0, c.por); }
  });
  boton.disabled = true;
  const otras = S.partes.map((p) => p[0]).filter((x) => x !== c.culpa);
  ctx.pistas([
    { texto: 'Lee el síntoma otra vez: ¿qué cosas **sí funcionan**? Esas partes, descártalas.' },
    { texto: d.sistema === 'celula' ? 'Membrana: la puerta. Citoplasma: el líquido de dentro. Núcleo: las instrucciones. Orgánulos: los que trabajan (sacan energía).' : d.sistema === 'nutricion' ? 'Digestivo: deshace la comida y pasa los nutrientes a la sangre. Respiratorio: oxígeno dentro, dióxido de carbono fuera. Circulatorio: lo reparte todo. Excretor: saca los desechos.' : 'Sentidos: captan. Nervios: llevan los mensajes. Encéfalo: interpreta y decide. Músculos y huesos: se mueven.' },
    { texto: `No es ${otras.slice(0, 2).map((x) => S.partes.find((p) => p[0] === x)[1].toLowerCase()).join(' ni ')}.` },
  ]);
}

// ---------------------------------------------------------------- ¿cuántos seres vivos?
function cuenta(d, ctx) {
  const c = d.caso;
  ctx.reto(c.texto + ' **¿Cuántos seres vivos hay? ¿Y cuántas células?**');
  ctx.pista(d.pista ?? 'Un ser vivo puede ser una sola célula o muchísimas juntas.');
  let seres = 0, celulas = null;
  const marcador = el('output', { class: 'v-num', text: '0' });
  const pon = (v) => { seres = Math.max(0, Math.min(12, v)); marcador.textContent = String(seres); suena('clic'); };
  const stepper = el('div', { class: 'v-stepper' }, el('button', { type: 'button', class: 'tecla', 'aria-label': 'Uno menos', text: '−', onclick: () => pon(seres - 1) }), marcador, el('button', { type: 'button', class: 'tecla', 'aria-label': 'Uno más', text: '+', onclick: () => pon(seres + 1) }));
  const nums = [...new Set([1, 2, 4, 5, 6].concat(typeof c.celulas === 'number' ? [c.celulas] : []))].sort((a, b) => a - b).slice(-5);
  const opCel = el('div', { class: 'v-botones-cel', role: 'radiogroup', 'aria-label': 'Células' }, [...nums.map(String), 'muchas'].map((v) => el('button', { type: 'button', class: 'tecla v-op', role: 'radio', 'aria-checked': 'false', 'data-v': v, text: v === 'muchas' ? 'Muchísimas' : v, onclick: (e) => { celulas = v; suena('clic'); opCel.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b === e.currentTarget))); } })));
  const lamina = el('div', { class: 'v-lamina' }, c.dibujos.map((k, i) => el('span', { class: 'v-ser', style: { '--i': i }, html: dib(k) })));
  ctx.escenario.append(el('div', { class: 'v-cuenta' }, lamina, el('div', { class: 'v-preguntas' },
    el('div', { class: 'v-pregunta' }, el('b', { text: 'Seres vivos' }), stepper),
    el('div', { class: 'v-pregunta' }, el('b', { text: 'Células' }), opCel))));
  if (!lento()) gsap.from(lamina.children, { scale: 0, rotation: -20, duration: 0.5, ease: 'back.out(2)', stagger: 0.08 });
  ctx.boton('Comprobar', () => {
    if (celulas == null) return ctx.aviso('Elige también cuántas células hay.', true);
    const okS = seres === c.seres, okC = String(c.celulas) === celulas;
    const txt = (okS && okC ? '**Exacto.** ' : `Son **${c.seres} ${c.seres === 1 ? 'ser vivo' : 'seres vivos'}** y **${c.celulas === 'muchas' ? 'muchísimas células' : c.celulas + (c.celulas === 1 ? ' célula' : ' células')}**. `) + c.por;
    ctx.fin(okS && okC ? 3 : okS || okC ? 1 : 0, txt);
  });
  ctx.pistas([
    { texto: 'Primero los seres vivos: ¿cuántos **organismos completos**, que viven por su cuenta, hay?' },
    { texto: 'Amebas, paramecios y bacterias son **unicelulares**: cada uno, una célula. Personas, hormigas, medusas y setas son **pluricelulares**.' },
    { texto: `Seres vivos: **${c.seres}**.` },
  ]);
}

// ---------------------------------------------------------------- la lupa
function zoom(d, ctx) {
  const C = CADENAS[d.cadena];
  ctx.reto(`Mueve la lupa y **para** cuando veas esto: ${d.texto}`);
  ctx.pista(d.pista ?? 'Acerca y aleja. Mira de qué está hecho lo que ves.');
  let k = NIVELES.indexOf(d.inicio), intentos = 0;
  const ventana = el('div', { class: 'v-lupa-ventana' });
  const regla = el('div', { class: 'v-lupa-regla', 'aria-hidden': 'true' }, NIVELES.map(() => el('i')));
  const pinta = (dir = 0) => {
    const n = NIVELES[k], [icon, nombre] = C[n];
    const nodo = el('div', { class: 'v-lupa-imagen ' + n, html: n === 'tejido' ? tejido(icon) : dib(icon) });
    ventana.replaceChildren(nodo);
    ventana.setAttribute('aria-label', `Vista ${k + 1} de 5`);
    regla.querySelectorAll('i').forEach((x, j) => x.classList.toggle('on', j === k));
    menos.disabled = k === NIVELES.length - 1; mas.disabled = k === 0;
    if (dir && !lento()) gsap.from(nodo, { scale: dir > 0 ? 0.35 : 2.4, opacity: 0, duration: 0.42, ease: 'power2.out' });
  };
  const mas = el('button', { type: 'button', class: 'tecla v-lupa-boton', onclick: () => { if (k > 0) { k--; suena('clic'); pinta(1); } } }, el('span', { text: '＋' }), ' Acercar');
  const menos = el('button', { type: 'button', class: 'tecla v-lupa-boton', onclick: () => { if (k < NIVELES.length - 1) { k++; suena('clic'); pinta(-1); } } }, el('span', { text: '−' }), ' Alejar');
  ctx.escenario.append(el('div', { class: 'v-lupa' }, el('div', { class: 'v-lupa-marco' }, ventana, el('span', { class: 'v-lupa-mango', 'aria-hidden': 'true' })), el('div', { class: 'v-lupa-mandos' }, mas, regla, menos)));
  pinta();
  ctx.boton('Paro aquí', () => {
    intentos++;
    const n = NIVELES[k];
    const dice = (x) => C[x][1].toLowerCase().includes(NOMBRE_NIVEL[x].split(' ')[0]) ? C[x][1] : `${C[x][1]}: ${x === 'celula' ? 'una' : 'un'} ${NOMBRE_NIVEL[x]}`;
    if (n === d.objetivo) return ctx.fin(porIntento(intentos), `**${dice(n)}.** ` + (n === 'tejido' ? 'Muchas células del mismo tipo, juntas.' : n === 'organo' ? 'Está hecho de varios tejidos distintos.' : n === 'aparato' ? 'Varios órganos que colaboran.' : n === 'celula' ? 'La unidad más pequeña de la vida.' : 'Un ser vivo completo.'));
    temblor(ventana, 6); suena('mal');
    const dir = NIVELES.indexOf(d.objetivo) < k ? 'Acerca un poco más.' : 'Aleja un poco.';
    ctx.aviso(`Eso es ${n === 'organo' || n === 'aparato' || n === 'organismo' || n === 'tejido' ? 'un' : 'una'} **${NOMBRE_NIVEL[n]}**. ${dir}`.replace(/\*\*/g, ''), true);
    if (intentos >= 3) ctx.fin(0, `Era **${dice(d.objetivo).charAt(0).toLowerCase() + dice(d.objetivo).slice(1)}**. ${PISTA_NIVEL[d.objetivo][0]}`);
  });
  ctx.pistas([
    { texto: 'De pequeño a grande: célula → tejido → órgano → aparato → organismo.' },
    { texto: `Lo que buscas es ${d.objetivo === 'organismo' ? 'el nivel más grande' : d.objetivo === 'celula' ? 'el nivel más pequeño' : 'un nivel intermedio'}.` },
    { texto: `Buscas **${NOMBRE_NIVEL[d.objetivo] === 'aparato o sistema' ? 'un aparato o sistema' : (d.objetivo === 'celula' ? 'una ' : 'un ') + NOMBRE_NIVEL[d.objetivo]}**.` },
  ]);
}

// ---------------------------------------------------------------- ordenar una cadena
function cadena(d, ctx) {
  const c = d.cadena;
  const piezas = [...c.pasos.map((p, i) => ({ ...p, pos: i })), ...(d.conIntrusos ? c.intrusos.map((p) => ({ ...p, pos: -1 })) : [])];
  ctx.reto((d.texto ?? `**${c.titulo}.** Ordena los pasos.`) + (d.conIntrusos ? ' Sobra alguna tarjeta.' : ''));
  ctx.pista(d.pista ?? 'Toca una tarjeta para ponerla en el primer hueco libre; toca un hueco para quitarla.');
  const huecos = el('ol', { class: 'v-huecos' }, c.pasos.map((_, i) => el('li', { class: 'v-hueco', 'data-i': i, onclick: () => quita(i) }, el('span', { class: 'v-hueco-num', text: String(i + 1) }))));
  const monton = el('div', { class: 'v-monton' });
  const puesto = Array(c.pasos.length).fill(null);
  const tarjetas = barajar(piezas).map((p, j) => {
    const t = el('button', { type: 'button', class: 'v-ficha', style: { '--r': ((j % 2 ? 1 : -1) * (0.6 + (j % 3) * 0.5)) + 'deg' }, onclick: () => pon(t) }, el('span', { class: 'v-ficha-dibujo', html: p.tej ? tejido(p.k) : dib(p.k) }), el('span', { class: 'v-ficha-texto', text: p.t }));
    t._p = p; monton.append(t); return t;
  });
  const pon = (t) => {
    const i = puesto.indexOf(null);
    if (t.classList.contains('puesta')) return;
    if (i < 0) { ctx.aviso('Ya están todos los huecos llenos. Para cambiar una, toca su hueco y se quita.', true); temblor(t, 4); return; }
    puesto[i] = t; t.classList.add('puesta');
    const h = huecos.children[i]; h.classList.remove('mal', 'bien');
    h.append(t); suena('pon');
    if (!lento()) gsap.from(t, { y: 40, scale: 0.8, duration: 0.3, ease: 'back.out(2)' });
  };
  const quita = (i) => {
    const t = puesto[i]; if (!t) return;
    puesto[i] = null; t.classList.remove('puesta'); huecos.children[i].classList.remove('mal', 'bien');
    monton.append(t); suena('quita');
  };
  ctx.escenario.append(el('div', { class: 'v-cadena' + (c.pasos.length > 5 ? ' larga' : '') }, huecos, monton));
  let intentos = 0;
  ctx.boton('Comprobar', () => {
    if (puesto.includes(null)) return ctx.aviso('Faltan huecos por llenar.', true);
    intentos++;
    let malas = 0;
    puesto.forEach((t, i) => {
      // vale una tarjeta igual a la correcta (por ejemplo, dos nervios con el mismo texto no los hay, pero dos dibujos iguales sí)
      const ok = t._p.pos === i || (t._p.pos >= 0 && c.pasos[i].t === t._p.t);
      huecos.children[i].classList.toggle('bien', ok); huecos.children[i].classList.toggle('mal', !ok);
      if (!ok) malas++;
    });
    if (!malas) return ctx.fin(porIntento(intentos), c.por);
    suena('mal'); temblor(huecos, 5);
    const intruso = puesto.find((t) => t._p.pos < 0);
    ctx.aviso(intruso ? `«${intruso._p.t}» no debería estar: sobra.` : `Hay ${malas} ${malas === 1 ? 'tarjeta' : 'tarjetas'} fuera de su sitio. Las marcadas en rojo.`, true);
    if (intentos >= 3) ctx.fin(0, 'El orden es: ' + c.pasos.map((p) => p.t.charAt(0).toLowerCase() + p.t.slice(1)).join(' → ') + '. ' + c.por);
  });
  ctx.pistas([
    { texto: d.cadena.id === 'vida' ? 'Antes de que haya un bebé tiene que haber **una sola célula**.' : c.titulo.startsWith('De lo más') ? 'Empieza por lo más pequeño: **una sola célula**.' : 'Primero hay que **captar** algo; después, **decidir**; al final, **moverse**.' },
    { texto: `El primer paso es: «${c.pasos[0].t}».` },
    { texto: `El último es: «${c.pasos.at(-1).t}»` + (c.intrusos.length && d.conIntrusos ? `, y sobra «${c.intrusos[0].t}».` : '.') },
  ]);
}

// ---------------------------------------------------------------- el viaje por el cuerpo
function ruta(d, ctx) {
  const R = RUTAS[d.ruta];
  const tramo = d.desde != null;
  const pasos = tramo ? R.pasos.slice(d.desde, d.hasta + 1) : R.pasos;
  const lo = R.gen === 'f' ? 'Llévala' : 'Llévalo';
  ctx.reto(tramo ? `${may(R.nombre)} está en **${conArt(pasos[0][0])}**. ${lo} hasta **${conArt(pasos.at(-1)[0])}**.` : `${lo} hasta ${R.meta}: **${R.nombre}**. ¿Por dónde sigue?`);
  ctx.pista(d.pista ?? 'Elige la siguiente parada. Si te equivocas, verás qué pasaría.');
  let i = 0, fallos = 0;
  const camino = el('ol', { class: 'v-camino', 'aria-label': 'El camino hasta ahora' });
  const ahora = el('div', { class: 'v-ahora' });
  const opciones = el('div', { class: 'v-opciones v-opciones-ruta' });
  ctx.escenario.append(el('div', { class: 'v-ruta' }, camino, ahora, opciones));
  const chip = (k) => el('li', { class: 'v-chip' }, el('span', { html: dib(k) }), el('small', { text: ESTACIONES[k] }));
  const pinta = () => {
    const [est, ...malas] = pasos[i];
    camino.append(chip(est));
    ahora.replaceChildren(el('div', { class: 'v-estacion', html: dib(est) }), el('div', { class: 'v-carga', html: dib(R.carga) }), el('p', {}, 'Estás en: ', el('b', { text: ESTACIONES[est] })));
    if (!lento()) gsap.from(ahora.querySelector('.v-carga'), { x: -60, y: -20, rotation: -40, duration: 0.5, ease: 'back.out(2)' });
    if (i === pasos.length - 1) return acaba();
    const buena = pasos[i + 1][0];
    const ops = barajar([[buena, null], ...malas]);
    opciones.replaceChildren(...ops.map(([k, msg]) => el('button', { type: 'button', class: 'v-tarjeta', onclick: (e) => elige_(e.currentTarget, k, msg) }, el('span', { class: 'v-tarjeta-dibujo', html: dib(k) }), el('span', { class: 'v-tarjeta-nombre', text: ESTACIONES[k] }))));
    ctx.pistas([
      { texto: R.carga === 'miga' || R.carga === 'resto' ? 'La comida va siempre **por el tubo del aparato digestivo**, de arriba abajo.' : R.carga === 'oxigeno' ? 'El aire baja por los tubos del **aparato respiratorio**; luego lo lleva la sangre.' : 'Los desechos los recoge la **sangre** y los saca el órgano que toca.' },
      { texto: `Desde ${ESTACIONES[est].toLowerCase()}, **no** se va a ${ESTACIONES[malas[0][0]].toLowerCase()}.` },
      { texto: `La siguiente parada es **${ESTACIONES[buena].toLowerCase()}**.` },
    ]);
  };
  const elige_ = async (b, k, msg) => {
    if (msg) {
      fallos++; b.classList.add('tachada'); b.disabled = true; temblor(b, 6); suena('mal');
      ctx.aviso(msg.replace(/\*\*/g, ''), true);
      return;
    }
    ctx.aviso('');
    opciones.querySelectorAll('button').forEach((x) => (x.disabled = true));
    b.classList.add('bien'); suena('bien');
    if (!lento()) await gsap.to(ahora.querySelector('.v-carga'), { x: 40, opacity: 0, duration: 0.3 });
    i++; pinta();
  };
  const acaba = () => {
    opciones.replaceChildren();
    chispasEn(ahora, 14);
    const recorrido = pasos.map((p) => ESTACIONES[p[0]].toLowerCase()).join(' → ');
    ctx.fin(porFallos(fallos), (fallos ? `Llegó, con ${fallos} ${fallos === 1 ? 'despiste' : 'despistes'}. ` : '**Sin perderse ni una vez.** ') + `${tramo ? 'El tramo' : 'El camino'}: ${recorrido}.`);
  };
  pinta();
}

// ---------------------------------------------------------------- ¿por dónde sale?
function salida(d, ctx) {
  const lista = d.cosas;
  ctx.reto(d.texto ?? 'Todo lo que el cuerpo echa fuera sale por algún sitio. **¿Por dónde sale cada cosa?**');
  ctx.pista(d.pista ?? 'Piensa de dónde viene: de la comida, de la sangre o del aire.');
  const cosa = el('div', { class: 'v-sintoma v-cosa' });
  const fila = el('ol', { class: 'v-portero-fila', 'aria-label': 'Lo que falta' }, lista.map((c) => el('li', { html: dib(c.k) })));
  const opciones = el('div', { class: 'v-opciones v-opciones-salida' }, Object.entries(SALIDAS).map(([id, [icon, nombre]]) =>
    el('button', { type: 'button', class: 'v-tarjeta', 'data-id': id, onclick: () => decide(id) }, el('span', { class: 'v-tarjeta-dibujo', html: dib(icon) }), el('span', { class: 'v-tarjeta-nombre', text: nombre }))));
  ctx.escenario.append(el('div', { class: 'v-averia' }, cosa, fila, opciones));
  let i = 0, fallos = 0; const malos = [];
  const pinta = () => {
    const c = lista[i];
    cosa.replaceChildren(el('span', { class: 'v-sintoma-icono', html: dib(c.k) }), el('p', {}, el('b', { text: c.t })));
    fila.querySelectorAll('li').forEach((li, k) => li.classList.toggle('ahora', k === i));
    opciones.querySelectorAll('button').forEach((b) => { b.disabled = false; b.classList.remove('bien', 'tachada'); });
    if (!lento()) gsap.from(cosa, { y: -24, opacity: 0, duration: 0.35, ease: 'back.out(2)' });
    ctx.pistas([
      { texto: 'Si viene de la **comida** y no se ha aprovechado, sigue por el tubo digestivo. Si viene de la **sangre**, lo sacan los riñones o la piel. Si es un gas, sale **respirando**.' },
      { texto: `Esto viene ${c.sale === 'ano' ? 'de la comida' : c.sale === 'nariz' ? 'de respirar' : 'de la sangre'}.` },
      { texto: `Sale por: **${SALIDAS[c.sale][1].toLowerCase()}**.` },
    ]);
  };
  const decide = async (id) => {
    const c = lista[i], ok = id === c.sale;
    opciones.querySelectorAll('button').forEach((b) => (b.disabled = true));
    const b = opciones.querySelector(`[data-id="${id}"]`);
    b.classList.add(ok ? 'bien' : 'tachada'); suena(ok ? 'bien' : 'mal');
    if (!ok) { fallos++; malos.push(c); temblor(b, 6); opciones.querySelector(`[data-id="${c.sale}"]`).classList.add('bien'); }
    fila.children[i].classList.add(ok ? 'bien' : 'mal');
    ctx.aviso(c.por.replace(/\*\*/g, ''), !ok);
    await espera(ok ? 900 : 1900);
    i++;
    if (i < lista.length) return pinta();
    ctx.fin(porFallos(fallos), fallos ? `**${lista.length - fallos} de ${lista.length}.** ` + malos.map((m) => m.por).join(' ') : '**Todo por su sitio.** Orina por la uretra, sudor por la piel, gases respirando y restos de comida por el ano.');
  };
  pinta();
}

// ---------------------------------------------------------------- tira y afloja: músculos
function musculo(d, ctx) {
  const M = MOVIMIENTOS[d.parte], o = M.objetivos.find((x) => x.id === d.obj);
  ctx.reto(o.txt + ' **¿Qué hace cada músculo?**');
  ctx.pista(d.pista ?? 'Decide para cada músculo si se contrae (se acorta y tira) o se relaja. Luego, prueba.');
  const estado = { a: null, b: null };
  const rig = el('div', { class: 'v-rig ' + d.parte, html: rigSVG(d.parte) });
  const panel = (lado) => {
    const [id, nombre, donde] = M[lado];
    const g = el('div', { class: 'v-musc', role: 'radiogroup', 'aria-label': nombre }, el('b', { text: nombre }), el('small', { text: donde }),
      ...[['c', 'Se contrae'], ['r', 'Se relaja']].map(([v, t]) => el('button', { type: 'button', class: 'tecla v-op', role: 'radio', 'aria-checked': 'false', 'data-v': v, text: t, onclick: (e) => {
        estado[lado] = v === 'c'; suena('clic');
        g.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', String(x === e.currentTarget)));
        rig.querySelector(`.m-${lado}`)?.classList.toggle('contraido', v === 'c');
      } })));
    return g;
  };
  ctx.escenario.append(el('div', { class: 'v-musculos' }, panel('a'), rig, panel('b')));
  let intentos = 0;
  const pose = (a, b) => (a && b ? 'firme' : a ? (d.parte === 'brazo' ? 'dobla' : 'estira') : b ? (d.parte === 'brazo' ? 'estira' : 'dobla') : 'suelta');
  const DIC = { dobla: d.parte === 'brazo' ? 'el brazo se dobla' : 'la rodilla se dobla', estira: d.parte === 'brazo' ? 'el brazo se estira' : 'la rodilla se estira', firme: 'se queda firme, sin moverse', suelta: 'cuelga suelto, sin fuerza' };
  ctx.boton('Probar', async () => {
    if (estado.a == null || estado.b == null) return ctx.aviso('Decide qué hace cada uno de los dos músculos.', true);
    intentos++;
    const p = pose(estado.a, estado.b);
    rig.dataset.pose = p; suena('coge');
    await espera(650);
    const objetivo = pose(o.a, o.b);
    if (p === objetivo) return ctx.fin(porIntento(intentos), o.por);
    suena('mal');
    ctx.aviso(`Así ${DIC[p]}. Querías que ${DIC[objetivo].replace('se queda', 'se quedara').replace('cuelga', 'colgara').replace('se dobla', 'se doblara').replace('se estira', 'se estirara')}.`, true);
    if (intentos >= 3) ctx.fin(0, o.por);
  });
  ctx.pistas([
    { texto: 'Un músculo **solo sabe tirar**: al contraerse se acorta y tira del hueso. Nunca empuja.' },
    { texto: `El ${M.a[1].toLowerCase()} está ${M.a[2]} y el ${M.b[1].toLowerCase()} ${M.b[2]}. Cada uno tira hacia su lado.` },
    { texto: `El ${M.a[1].toLowerCase()}: **${o.a ? 'se contrae' : 'se relaja'}**.` },
  ]);
}
// el brazo (o la pierna) de cartulina: hueso de arriba fijo, el de abajo gira en la articulación
function rigSVG(parte) {
  const T = '#1b1e3a';
  if (parte === 'brazo') return `<svg viewBox="0 0 220 260" aria-hidden="true">
    <circle cx="70" cy="30" r="20" fill="#f6ead9" stroke="${T}" stroke-width="4"/>
    <rect x="58" y="30" width="24" height="110" rx="12" fill="#f4ead2" stroke="${T}" stroke-width="4"/>
    <g class="m-a"><ellipse class="carne" cx="92" cy="85" rx="12" ry="40" fill="#ff8fa3" stroke="${T}" stroke-width="3.5"/><text x="92" y="89" text-anchor="middle" font-size="12" font-weight="800" fill="${T}">B</text></g>
    <g class="m-b"><ellipse class="carne" cx="48" cy="85" rx="12" ry="40" fill="#ffb3c7" stroke="${T}" stroke-width="3.5"/><text x="48" y="89" text-anchor="middle" font-size="12" font-weight="800" fill="${T}">T</text></g>
    <g class="v-antebrazo"><rect x="60" y="132" width="22" height="100" rx="11" fill="#f4ead2" stroke="${T}" stroke-width="4"/><circle cx="71" cy="246" r="15" fill="#ffcfa8" stroke="${T}" stroke-width="4"/></g>
    <circle cx="71" cy="138" r="9" fill="#ffc531" stroke="${T}" stroke-width="3"/></svg>`;
  return `<svg viewBox="0 0 220 260" aria-hidden="true">
    <rect x="40" y="10" width="80" height="26" rx="10" fill="#f6ead9" stroke="${T}" stroke-width="4"/>
    <rect x="68" y="26" width="24" height="110" rx="12" fill="#f4ead2" stroke="${T}" stroke-width="4"/>
    <g class="m-a"><ellipse class="carne" cx="102" cy="80" rx="13" ry="42" fill="#ff8fa3" stroke="${T}" stroke-width="3.5"/><text x="102" y="84" text-anchor="middle" font-size="12" font-weight="800" fill="${T}">C</text></g>
    <g class="m-b"><ellipse class="carne" cx="58" cy="80" rx="12" ry="40" fill="#ffb3c7" stroke="${T}" stroke-width="3.5"/><text x="58" y="84" text-anchor="middle" font-size="12" font-weight="800" fill="${T}">I</text></g>
    <g class="v-antebrazo"><rect x="70" y="130" width="22" height="100" rx="11" fill="#f4ead2" stroke="${T}" stroke-width="4"/><path d="M68 226 h44 a8 8 0 0 1 0 16 h-44z" fill="#2f5bd3" stroke="${T}" stroke-width="4"/></g>
    <circle cx="81" cy="136" r="9" fill="#ffc531" stroke="${T}" stroke-width="3"/></svg>`;
}

// ---------------------------------------------------------------- articulaciones
function articulacion(d, ctx) {
  const t = d.tarea;
  ctx.reto(t.txt);
  ctx.pista(d.pista ?? (t.hay.length > 1 ? 'Toca todas las que hagan falta. Luego, comprueba.' : 'Toca la articulación y comprueba.'));
  const sel = new Set();
  const figura = el('div', { class: 'v-figura' }, el('span', { class: 'v-figura-dibujo', html: `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="12" r="9" fill="#f6ead9" stroke="#1b1e3a" stroke-width="2.5"/><path d="M50 21 V56 M36 27 H64 M34 28 L26 45 L20 60 M66 28 L74 45 L80 60 M42 57 H58 M42 58 L41 76 L41 92 L35 95 M58 58 L59 76 L59 92 L65 95" fill="none" stroke="#1b1e3a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="M50 21 V56 M36 27 H64 M34 28 L26 45 L20 60 M66 28 L74 45 L80 60 M42 57 H58 M42 58 L41 76 L41 92 L35 95 M58 58 L59 76 L59 92 L65 95" fill="none" stroke="#f4ead2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>` }),
    ARTICULACIONES.map(([id, nombre, x, y]) => el('button', { type: 'button', class: 'v-art', 'data-id': id, 'aria-pressed': 'false', style: { left: x + '%', top: y + '%' }, onclick: (e) => {
      const b = e.currentTarget; b.classList.remove('mal', 'bien');
      sel.has(id) ? sel.delete(id) : sel.add(id); b.setAttribute('aria-pressed', String(sel.has(id))); suena('clic');
    } }, el('span', { class: 'v-art-punto' }), el('span', { class: 'v-art-nombre', text: nombre }))));
  ctx.escenario.append(el('div', { class: 'v-articulaciones' }, figura));
  let intentos = 0;
  ctx.boton('Comprobar', () => {
    if (!sel.size) return ctx.aviso('Toca al menos una articulación.', true);
    intentos++;
    const faltan = t.hay.filter((x) => !sel.has(x)), sobran = [...sel].filter((x) => !t.hay.includes(x) && !t.vale.includes(x));
    figura.querySelectorAll('.v-art').forEach((b) => { const id = b.dataset.id; b.classList.toggle('mal', sobran.includes(id)); b.classList.toggle('bien', sel.has(id) && !sobran.includes(id)); });
    if (!faltan.length && !sobran.length) return ctx.fin(porIntento(intentos), t.por);
    suena('mal');
    const nom = (id) => ARTICULACIONES.find((a) => a[0] === id)[1].toLowerCase();
    ctx.aviso(sobran.length ? `${may(sobran.map(nom).join(' y '))}: ${sobran.length > 1 ? 'no hacen' : 'no hace'} falta.` : `Falta ${faltan.length > 1 ? 'alguna más' : 'una más'}.`, true);
    if (intentos >= 3) ctx.fin(0, t.por);
  });
  ctx.pistas([
    { texto: 'Haz el movimiento tú mismo, despacio. ¿Qué partes de tu cuerpo **se doblan**?' },
    { texto: t.hay.length > 1 ? `Son **${t.hay.length}** las que hacen falta de verdad.` : 'Solo hace falta **una**.' },
    { texto: `Una de ellas es **${ARTICULACIONES.find((a) => a[0] === t.hay[0])[1].toLowerCase()}**.` },
  ]);
}

// ---------------------------------------------------------------- la primera célula: divisiones
function divide(d, ctx) {
  const total = 2 ** d.n;
  ctx.reto(d.inverso ? `Ahora hay **${total} células**. Empezó siendo **una sola**: el cigoto. **¿Cuántas veces se ha dividido?**` : `El **cigoto** es una sola célula. Cada vez que se divide, **cada célula se parte en dos**. **¿Cuántas habrá después de ${d.n} ${d.n === 1 ? 'división' : 'divisiones'}?**`);
  ctx.pista(d.pista ?? 'Primero escribe lo que crees. Luego, compruébalo dividiendo.');
  const placa = el('div', { class: 'v-placa' });
  const pinta = (n) => {
    const c = 2 ** n;
    placa.style.setProperty('--tam', Math.max(14, 92 / Math.ceil(Math.sqrt(c))) + '%');
    placa.replaceChildren(...Array.from({ length: c }, () => el('span', { class: 'v-cel', html: dib('cigoto') })));
  };
  pinta(d.inverso ? d.n : 0);
  const campo = el('input', { class: 'campo-num', inputmode: 'numeric', autocomplete: 'off', maxlength: 4, 'aria-label': d.inverso ? 'Divisiones' : 'Células', style: { width: '5ch' } });
  campo.addEventListener('input', () => (campo.value = campo.value.replace(/\D/g, '')));
  const contador = el('p', { class: 'v-contador', text: d.inverso ? `${total} células` : '1 célula' });
  ctx.escenario.append(el('div', { class: 'v-divide' }, placa, el('div', { class: 'v-divide-lado' }, contador, el('label', { class: 'v-prediccion' }, el('span', { text: d.inverso ? 'Divisiones:' : 'Células:' }), campo))));
  campo.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); boton.click(); } });
  const boton = ctx.boton('Comprobar dividiendo', async () => {
    const v = Number(campo.value);
    if (!campo.value) return ctx.aviso('Escribe primero lo que crees.', true);
    boton.disabled = true; campo.disabled = true;
    if (d.inverso) pinta(0);
    for (let k = 1; k <= d.n; k++) {
      await espera(lento() ? 60 : 520);
      pinta(k); suena('pon', k);
      contador.textContent = `${k} ${k === 1 ? 'división' : 'divisiones'}: ${2 ** k} células`;
      if (!lento()) gsap.from(placa.children, { scale: 0.5, duration: 0.35, ease: 'back.out(2)', stagger: 0.004 });
    }
    const buena = d.inverso ? d.n : total;
    const serie = Array.from({ length: d.n + 1 }, (_, k) => 2 ** k).join(' → ');
    ctx.fin(v === buena ? 3 : Math.abs(v - buena) <= (d.inverso ? 1 : buena / 2) ? 1 : 0, (v === buena ? `**${buena}, exacto.** ` : `Eran **${buena}**. `) + `${serie}: cada vez se **duplica**. Así, de una sola célula salen todas las del cuerpo.`);
  });
  ctx.pistas([
    { texto: 'Todas las células se dividen **a la vez**: si hay 2, salen 4.' },
    { texto: 'Cuenta así: 1, 2, 4, 8… cada número es el doble del anterior.' },
    { texto: d.inverso ? `Va doblando: 1 → 2 → 4 → 8 → 16… ¿cuántos pasos hasta ${total}?` : `Después de ${d.n - 1} divisiones habría ${2 ** (d.n - 1)}. Una más…` },
  ]);
}
