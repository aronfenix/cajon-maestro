import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/usr/bin/google-chrome' });
const p = await b.newPage({ viewport: { width: 1200, height: 750 } });
await p.goto('http://localhost:8765/_tapa-maniqui.html'); await p.waitForTimeout(1200);
await p.screenshot({ path: '/tmp/tapa-maniqui.png' }); await b.close();
