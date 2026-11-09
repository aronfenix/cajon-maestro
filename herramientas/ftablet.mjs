import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
for (const [w, h] of [[1024, 768], [768, 1024]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8791/'); await p.waitForTimeout(1800);
  const top = await p.evaluate(() => document.querySelector('.cajon').getBoundingClientRect().top + scrollY - 10);
  await p.evaluate((y) => scrollTo(0, y), top); await p.waitForTimeout(600);
  await p.screenshot({ path: `/tmp/tab-${w}.png` });
  console.log(w, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll('a.objeto')].map((a) => { const r = a.getBoundingClientRect(); return [a.className.split(' ')[1], Math.round(r.width), Math.round(r.height)]; }).filter((x) => x[1] < 44 || x[2] < 44))), await p.evaluate(() => matchMedia('(hover: none)').matches));
  await ctx.close();
}
await b.close();
