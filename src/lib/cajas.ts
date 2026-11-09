// Las cajas ilustradas de cada aventura (en public/cajon/): id del mapa → prefijo de sus piezas.
import { ruta } from './rutas';
const CAJAS: Record<string, string> = {
  'la-feria-de-otono': 'la-feria-de-otono',
  'la-gran-limpieza': 'la-gran-limpieza-del-cajon',
};
export function cajaDe(id: string) {
  const p = CAJAS[id];
  if (!p) return undefined;
  const f = (pieza: string) => ruta(`/cajon/${p}-${pieza}.webp`);
  return { tapa: f('tapa'), interior: f('interior'), lomoLargo: f('lomo-largo'), lomoCorto: f('lomo-corto') };
}
