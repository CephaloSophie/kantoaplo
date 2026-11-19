/**
 * Mantis — records the demo data.
 *
 *   node record.js <web-url> <out/demo-data.json> [maxPages]
 *
 * The Angular dev server must proxy /api to a Mantis API running on a throwaway
 * database filled by `seed-demo.ts` (see README.md). Logs in, then walks every
 * internal link breadth-first (reports, dimensions, visitors, experiments,
 * settings…) and tries each period of the date picker on the main reports.
 * Non-JSON API answers (logos, images of the appearance studio) are saved
 * next to the data and replayed as files.
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const { createRecorder, keyOf } = require('../lib/recorder');

const BASE = (process.argv[2] || 'http://localhost:4710').replace(/\/$/, '');
const OUT = process.argv[3] || path.join(__dirname, 'demo-data.json');
const MAX = Number(process.argv[4] || 220);
const FILES = path.join(path.dirname(OUT), 'api-files');

(async () => {
  const rec = createRecorder({ apiPrefix: '/api/v1', skip: [/^\/collect/, /\/export/] });
  const files = {};
  fs.mkdirSync(FILES, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.setDefaultTimeout(8000);
  rec.attach(page);
  page.on('response', async (res) => {
    const url = res.url();
    if (!url.includes('/api/v1/') || res.request().method() !== 'GET') return;
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('json') || res.status() !== 200) return;
    try {
      const buf = await res.body();
      const { key } = keyOf('GET', url, '/api/v1', null, []);
      const name = `f${Object.keys(files).length + 1}${path.extname(new URL(url).pathname) || ''}`;
      fs.writeFileSync(path.join(FILES, name), buf);
      files[key] = { file: name, type: ct };
    } catch {
      /* streamed or aborted */
    }
  });

  const settle = async (ms = 1500) => {
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(ms);
  };

  await page.goto(`${BASE}/login`);
  await settle(800);
  await page.locator('input').first().fill('demo@kantoaplo.com');
  await page.locator('input[type=password]').fill('Mantis2026!');
  await page.keyboard.press('Enter');
  await settle(2500);

  const seen = new Set();
  const queue = ['/projects'];
  const visitorPages = { n: 0 };
  while (queue.length && seen.size < MAX) {
    const href = queue.shift();
    if (seen.has(href)) continue;
    seen.add(href);
    try {
      await page.goto(BASE + href);
      await settle(1800);
      // scroll to trigger lazily loaded widgets
      for (let y = 0; y < 4; y++) {
        await page.mouse.wheel(0, 900);
        await page.waitForTimeout(350);
      }
      await settle(600);
    } catch (e) {
      console.log('skip', href, e.message.split('\n')[0]);
      continue;
    }
    const links = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
    for (const l of links) {
      if (!l || !l.startsWith('/') || l.startsWith('//') || l.startsWith('/api') || l.startsWith('/demo')) continue;
      if (l.includes('/visitors/')) {
        if (visitorPages.n >= 40) continue;
        visitorPages.n += 1;
      }
      if (!seen.has(l) && !queue.includes(l)) queue.push(l);
    }
    console.log(seen.size, href, '→ queue', queue.length, 'keys', Object.keys(rec.entries).length);
  }

  // every period of the date picker on the dashboard and two reports
  const project = [...seen].map((h) => /^\/projects\/([0-9a-f]{24})\//.exec(h)).find(Boolean);
  if (project) {
    for (const p of ['dashboard', 'reports/audience', 'reports/acquisition', 'reports/behaviour', 'goals']) {
      await page.goto(`${BASE}/projects/${project[1]}/${p}`);
      await settle(1200);
      const picker = page.locator('button, [role=button]').filter({ hasText: /derniers jours|Aujourd|Hier|mois|semaine/ }).first();
      const labels = ['Aujourd’hui', 'Hier', '7 derniers jours', '90 derniers jours', 'Ce mois', 'Mois dernier', 'Cette année', '12 derniers mois'];
      for (const label of labels) {
        try {
          await picker.click({ timeout: 3000 });
          await page.waitForTimeout(400);
          await page.getByText(label, { exact: true }).first().click({ timeout: 2000 });
          await settle(1500);
        } catch {
          await page.keyboard.press('Escape').catch(() => {});
        }
      }
    }
  }

  const info = rec.save(OUT, { app: 'mantis', files });
  console.log(info, 'files', Object.keys(files).length);
  await browser.close();
})();
