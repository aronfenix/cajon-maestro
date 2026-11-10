import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const [,, ...slugs] = process.argv;
for (const [w, h, t] of [[1280, 800, 'pc'], [390, 844, 'mv']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: t === 'mv' });
  const p = await ctx.newPage(); const err = []; p.on('pageerror', (e) => err.push(e.message));
  for (const s of slugs) {
    await p.goto(`http://localhost:8765/juegos/${s}/`); await p.waitForTimeout(2600);
    await p.screenshot({ path: `/tmp/lp-${s}-${t}.png` });
  }
  if (err.length) console.log(t, err);
  await ctx.close();
}
await b.close();
