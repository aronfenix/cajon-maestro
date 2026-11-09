import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
const p = await ctx.newPage(); await p.goto('http://localhost:8791/'); await p.waitForTimeout(1800);
const top = await p.evaluate(() => document.querySelector('.cajon').getBoundingClientRect().top + scrollY - 10);
await p.evaluate((y) => scrollTo(0, y), top); await p.waitForTimeout(500);
await p.screenshot({ path: '/tmp/movtac.png' }); await b.close();
