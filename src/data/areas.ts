// Los separadores del archivador. El orden de esta lista es el orden en pantalla.
// Si añades un área aquí, añádela también en .pages.yml (campo «area» de los temas).
export interface Area {
  id: string;
  nombre: string;
  color: string; // color de subrayador; siempre con texto negro encima
  vacio?: string; // frase cuando el área no tiene nada
}

export const AREAS: Area[] = [
  { id: 'lengua', nombre: 'Lengua', color: '#FF8AC4' },
  {
    id: 'matematicas',
    nombre: 'Matemáticas',
    color: '#7FD6FF',
    vacio:
      'En Matemáticas trabajo con Innovamat, así que de momento aquí no hay nada mío. De momento.',
  },
  { id: 'naturales', nombre: 'Naturales', color: '#8DF07D' },
  { id: 'sociales', nombre: 'Sociales', color: '#F5F03C' },
  { id: 'plastica', nombre: 'Plástica', color: '#FFB054' },
  { id: 'valores', nombre: 'Valores', color: '#CDA8FF' },
  { id: 'otros-cursos', nombre: 'Otros cursos', color: '#C9CCC6' },
];

export const TODO = { id: 'todo', nombre: 'Todo', color: '#FFFFFF' };

export const TIPOS = {
  juego: { nombre: 'Juego', plural: 'Juegos', accion: 'Jugar en el navegador' },
  video: { nombre: 'Vídeo', plural: 'Vídeos', accion: 'Ver el vídeo' },
  comic: { nombre: 'Cómic', plural: 'Cómics', accion: 'Leer el cómic' },
  ficha: { nombre: 'Ficha', plural: 'Fichas', accion: 'Descargar' },
  web: { nombre: 'Web', plural: 'Webs', accion: 'Abrir la web' },
  herramienta: { nombre: 'Herramienta', plural: 'Herramientas', accion: 'Abrir la herramienta' },
} as const;

export type Tipo = keyof typeof TIPOS;

export function areaPorId(id: string): Area {
  const a = AREAS.find((x) => x.id === id);
  if (!a) throw new Error(`Área desconocida: «${id}». Revisa src/data/areas.ts`);
  return a;
}
