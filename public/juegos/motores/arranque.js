// Lee la configuración del juego (el bloque <script type="application/json" id="config">) y arranca su motor.
import { arrancar } from './nucleo.js';

const MOTORES = { recta: './recta.js', cifras: './cifras.js', rejilla: './rejilla.js', geoplano: './geoplano.js', multiplica: './multiplica.js', formas: './formas.js', giros: './giros.js' };

try {
  const config = JSON.parse(document.getElementById('config').textContent);
  const ruta = MOTORES[config.motor];
  if (!ruta) throw new Error(`No conozco el motor «${config.motor}». Los que hay: ${Object.keys(MOTORES).join(', ')}.`);
  const motor = await import(ruta);
  await arrancar(config, motor);
} catch (e) {
  document.body.innerHTML = '';
  const p = document.createElement('pre');
  p.style.cssText = 'margin:24px;padding:16px;background:#fff;border-left:8px solid #c8201a;white-space:pre-wrap;font-size:16px';
  p.textContent = 'Este juego tiene un error en su configuración:\n\n' + e.message;
  document.body.append(p);
  console.error(e);
}
