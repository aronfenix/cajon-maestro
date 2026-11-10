// Prefija las rutas internas con la base de la web.
// En GitHub Pages la web vive en /la-cajonera/; con dominio propio, en /.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

export function ruta(p: string): string {
  if (!p.startsWith('/') || p.startsWith('//')) return p; // enlaces externos tal cual
  if (BASE && (p === BASE || p.startsWith(`${BASE}/`))) return p;
  return `${BASE}${p}`;
}
