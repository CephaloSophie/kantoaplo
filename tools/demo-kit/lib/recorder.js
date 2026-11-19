/**
 * demo-kit — API recorder.
 *
 * Attach to a Playwright page while it browses the real application: every
 * JSON response under `apiPrefix` is stored under a stable key
 * ("METHOD /path?sorted=query" + "#body" for read-only POSTs). The result is
 * the `demo-data.json` replayed by demo-shim.js in the static demo.
 */
const fs = require('fs');

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable(value[k])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function queryString(searchParams) {
  const pairs = [...searchParams.entries()].sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
  return pairs.length ? `?${pairs.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&')}` : '';
}

function keyOf(method, url, apiPrefix, bodyText, readPost) {
  const u = new URL(url);
  const i = u.pathname.indexOf(apiPrefix);
  const path = u.pathname.slice(i + apiPrefix.length) || '/';
  let key = `${method} ${decodeURIComponent(path)}${queryString(u.searchParams)}`;
  if (method !== 'GET' && bodyText && readPost.some((re) => re.test(path))) {
    try {
      key += `#${stable(JSON.parse(bodyText))}`;
    } catch {
      /* not JSON */
    }
  }
  return { key, path };
}

function createRecorder({ apiPrefix = '/api', readPost = [], skip = [] } = {}) {
  const entries = {};
  let count = 0;

  function add(method, url, bodyText, status, body) {
    const { key, path } = keyOf(method, url, apiPrefix, bodyText, readPost);
    if (skip.some((re) => re.test(path))) return;
    const isRead = method === 'GET' || readPost.some((re) => re.test(path)) || /\/auth\/(login|me)/.test(path);
    if (!isRead) return; // mutations are simulated by the shim, never replayed
    entries[key] = { status, body };
    count += 1;
  }

  function attach(page) {
    page.on('response', async (res) => {
      const req = res.request();
      const url = req.url();
      if (!new URL(url).pathname.includes(apiPrefix)) return;
      const ct = res.headers()['content-type'] || '';
      if (!ct.includes('json')) return;
      try {
        add(req.method(), url, req.postData(), res.status(), await res.json());
      } catch {
        /* body unavailable (redirect, aborted) */
      }
    });
  }

  function save(file, meta = {}) {
    const out = { recordedAt: new Date().toISOString(), ...meta, entries };
    fs.writeFileSync(file, JSON.stringify(out));
    return { file, keys: Object.keys(entries).length, bytes: fs.statSync(file).size };
  }

  return { attach, add, save, entries, get count() { return count; } };
}

module.exports = { createRecorder, stable, keyOf };
