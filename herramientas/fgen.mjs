// node fgen.mjs motor '[specs json]' n → muestra generaciones
import { chromium } from 'playwright';
const [motor, specs, n = 6] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage();
await p.goto('http://localhost:8765/juegos/la-tombola/?sinportada');
const r = await p.evaluate(async ([motor, specs, n]) => {
  const m = await import(`/juegos/motores/${motor}.js`);
  return JSON.parse(specs).map((s) => Array.from({ length: n }, () => { const d = m.generar({ ...s, generar: s.generar ?? true }); delete d.texto; return JSON.stringify(d); }));
}, [motor, specs, +n]);
r.forEach((l, i) => { console.log('--', i); l.forEach((x) => console.log(x.slice(0, 230))); });
await b.close();
