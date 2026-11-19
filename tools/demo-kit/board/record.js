/**
 * Pinax (board) — records the demo data.
 *
 *   node record.js <client-url> <out/demo-data.json>
 *
 * The client (Vite dev server) must proxy /api to a server running on the
 * throwaway database filled by seed-demo.js. Browses every screen of every
 * project, then reads each task / event / dashboard / sprint detail directly,
 * so any click in the static demo finds its answer.
 */
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const { createRecorder } = require('../lib/recorder');

const BASE = process.argv[2] || 'http://localhost:7101';
const OUT = process.argv[3] || path.join(__dirname, 'demo-data.json');

(async () => {
  const rec = createRecorder({ apiPrefix: '/api', readPost: [/\/analytics\//], skip: [/\/attachments/] });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  page.setDefaultTimeout(8000);
  rec.attach(page);
  const wait = (ms = 1200) => page.waitForTimeout(ms);
  const go = async (p, ms) => {
    await page.goto(BASE + p);
    await page.waitForLoadState('networkidle').catch(() => {});
    await wait(ms);
  };

  await go('/login', 600);
  await page.locator('input').first().fill('demo');
  await page.locator('input[type=password]').fill('Pinax2026!');
  await page.keyboard.press('Enter');
  await wait(2000);

  const apiGet = (p) =>
    page.evaluate(async (p) => {
      const r = await fetch('/api' + p, { headers: { Authorization: `Bearer ${localStorage.getItem('board.token')}` } });
      return r.ok ? r.json() : null;
    }, p);

  await go('/projects');
  await apiGet('/projects?archived=1');
  await go('/admin/users');
  await page.locator('header button, .bell, [aria-label*=otification]').first().click().catch(() => {});
  await wait(800);

  const { projects } = await apiGet('/projects');
  for (const pr of projects) {
    const K = pr.key;
    console.log('project', K);
    for (const q of ['', '?view=jira', '?view=list', '?groupBy=assignee', '?groupBy=priority', '?groupBy=version', '?groupBy=area', '?groupBy=type', '?groupBy=status', '?groupBy=category', '?groupBy=none']) {
      await go(`/projects/${K}/board${q}`, 700);
    }
    await go(`/projects/${K}/planning`, 1500);
    await go(`/projects/${K}/events`, 1200);
    await go(`/projects/${K}/activity`, 1200);
    for (const tab of ['general', 'sprints', 'members', 'workflow', 'taxonomies', 'import', 'danger']) await go(`/projects/${K}/settings/${tab}`, 900);

    const { dashboards } = (await apiGet(`/projects/${K}/dashboards`)) || { dashboards: [] };
    await go(`/projects/${K}/dashboards`, 2500);
    for (const d of dashboards) await go(`/projects/${K}/dashboards/${d._id || d.id}`, 3000);

    // saved filters applied on the board
    const { filters } = (await apiGet(`/projects/${K}/filters`)) || { filters: [] };
    for (const f of filters) await go(`/projects/${K}/board?filter=${f._id || f.id}`, 900);

    // every detail
    const { tasks } = await apiGet(`/projects/${K}/tasks`);
    for (const t of tasks) await apiGet(`/projects/${K}/tasks/${t.taskId}`);
    const { events } = (await apiGet(`/projects/${K}/events`)) || { events: [] };
    for (const e of events) await apiGet(`/projects/${K}/events/${e._id}`);
    const sp = await apiGet(`/projects/${K}/sprints`);
    for (const s of sp.sprints || []) {
      await apiGet(`/projects/${K}/sprints/${encodeURIComponent(s.key)}/close-preview`);
      await apiGet(`/projects/${K}/sprints/${encodeURIComponent(s.key)}/leftovers`);
      for (const unit of ['points', 'count']) await apiGet(`/projects/${K}/analytics/sprints/${encodeURIComponent(s.key)}/burndown?unit=${unit}`);
    }
    for (const t of tasks.slice(0, 12)) await go(`/projects/${K}/tasks/${t.taskId}`, 700);
    await apiGet(`/projects/${K}/activity?limit=50`);
  }
  await go('/projects', 800);
  await apiGet('/auth/me');
  await wait(1500);
  const info = rec.save(OUT, { app: 'pinax' });
  console.log(info);
  await browser.close();
})();
