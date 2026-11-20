/* ═══════════════════════════════════════════════════════════════════════
   demo-kit — demo-shim.js
   Turns a static build of an API-backed web app into a self-contained demo:
   · fetch() and XMLHttpRequest calls under `apiPrefix` never leave the page;
   · reads are answered from demo-data.json (responses recorded on the real
     app filled with fake data), dates shifted so the data stays "current";
   · the visitor's writes (create / edit / delete) are kept in localStorage
     and merged into every later response, so the demo feels alive;
   · a static login (fake e-mail + password) and a small demo badge.
   Configuration: window.DEMO_CONFIG (demo-config.js), app-specific
   behaviour: window.DEMO_RULES (see board/ and mantis/ folders).
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var CFG = window.DEMO_CONFIG;
  if (!CFG) return;
  var WEEK = 7 * 86400000;
  var realFetch = window.fetch.bind(window);
  var RealXHR = window.XMLHttpRequest;
  var ISO = /^(\d{4}-\d{2}-\d{2})(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;

  /* ── deep links on GitHub Pages: 404.html stored the wanted URL ── */
  try {
    var wanted = sessionStorage.getItem('demo-redirect');
    if (wanted && wanted.indexOf(CFG.basePath) === 0) {
      sessionStorage.removeItem('demo-redirect');
      history.replaceState(null, '', wanted);
    }
  } catch (e) { /* storage blocked */ }

  /* ── persistent overlay (the visitor's own changes) ── */
  var SKEY = CFG.storageKey || 'demo-state';
  function emptyState() { return { v: 1, patches: {}, created: {}, deleted: {}, seq: {}, custom: {} }; }
  var S;
  try { S = JSON.parse(localStorage.getItem(SKEY)) || emptyState(); } catch (e) { S = emptyState(); }
  if (!S.v) S = emptyState();
  function save() { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) { /* quota or private mode */ } }

  /* ── data ── */
  var DATA = null;
  var REG = {};        // canonical id → richest recorded object
  var ALIAS = {};      // alias (taskId…) → canonical id
  var BYPATH = {};     // "METHOD /path" → [keys]
  var OFFSET = 0;
  var loading = null;

  function idOf(o) {
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    var id = o._id != null ? o._id : o.id;
    return typeof id === 'string' || typeof id === 'number' ? String(id) : null;
  }

  function register(node) {
    if (Array.isArray(node)) { for (var i = 0; i < node.length; i++) register(node[i]); return; }
    if (!node || typeof node !== 'object') return;
    var id = idOf(node);
    if (id) {
      var prev = REG[id];
      if (!prev || Object.keys(node).length > Object.keys(prev).length) REG[id] = node;
      // an alias (taskId…) points to the richest object carrying it: the task
      // itself, not an activity entry or a notification that mentions it
      (CFG.idAliases || []).forEach(function (f) {
        if (typeof node[f] !== 'string') return;
        var cur = ALIAS[node[f]];
        if (!cur || Object.keys(REG[id]).length > Object.keys(REG[cur]).length) ALIAS[node[f]] = id;
      });
    }
    for (var k in node) if (node[k] && typeof node[k] === 'object') register(node[k]);
  }

  function load() {
    if (!loading) {
      loading = realFetch(CFG.dataUrl)
        .then(function (r) { return r.json(); })
        .then(function (d) {
          DATA = d;
          Object.keys(d.entries).forEach(function (key) {
            var head = key.split('#')[0].split('?')[0];
            (BYPATH[head] = BYPATH[head] || []).push(key);
            register(d.entries[key].body);
          });
          if (CFG.shiftDates !== false && d.recordedAt) {
            var diff = Date.now() - Date.parse(d.recordedAt);
            OFFSET = diff > 0 ? Math.floor(diff / WEEK) * WEEK : 0;
          }
          return d;
        });
    }
    return loading;
  }

  /* ── helpers ── */
  function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
  function shift(node) {
    if (!OFFSET) return node;
    if (typeof node === 'string') {
      var m = ISO.exec(node);
      if (!m) return node;
      var t = Date.parse(m[2] ? node : m[1] + 'T12:00:00Z');
      if (isNaN(t)) return node;
      var s = new Date(t + OFFSET).toISOString();
      return m[2] ? s : s.slice(0, 10);
    }
    if (Array.isArray(node)) { for (var i = 0; i < node.length; i++) node[i] = shift(node[i]); return node; }
    if (node && typeof node === 'object') { for (var k in node) node[k] = shift(node[k]); }
    return node;
  }
  function stable(v) {
    if (Array.isArray(v)) return '[' + v.map(stable).join(',') + ']';
    if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(function (k) { return JSON.stringify(k) + ':' + stable(v[k]); }).join(',') + '}';
    return JSON.stringify(v);
  }
  function qs(params) {
    var pairs = [];
    params.forEach(function (v, k) { pairs.push([k, v]); });
    pairs.sort(function (a, b) { return (a[0] + a[1]).localeCompare(b[0] + b[1]); });
    return pairs.length ? '?' + pairs.map(function (p) { return encodeURIComponent(p[0]) + '=' + encodeURIComponent(p[1]); }).join('&') : '';
  }
  function hex(n) { var s = ''; while (s.length < n) s += Math.floor(Math.random() * 16).toString(16); return s; }
  function newId() { return Math.floor(Date.now() / 1000).toString(16) + hex(16); }
  function isReadPost(path) { return (CFG.readPost || []).some(function (re) { return new RegExp(re).test(path); }); }
  function deepAssign(target, patch) {
    for (var k in patch) {
      var v = patch[k];
      if (v && typeof v === 'object' && !Array.isArray(v) && target[k] && typeof target[k] === 'object' && !Array.isArray(target[k]) && !idOf(v)) deepAssign(target[k], v);
      else target[k] = clone(v);
    }
    return target;
  }
  function singular(name) {
    var map = CFG.singular || {};
    if (map[name]) return map[name];
    if (/ies$/.test(name)) return name.slice(0, -3) + 'y';
    if (/sses$/.test(name)) return name.slice(0, -2);
    if (/s$/.test(name)) return name.slice(0, -1);
    return name;
  }

  /* ── lookup of a recorded response ── */
  function lookup(method, path, params, body) {
    if (!DATA) return null;
    var bodyKey = body != null && method !== 'GET' ? '#' + stable(body) : '';
    var exact = method + ' ' + path + qs(params);
    var E = DATA.entries;
    if (E[exact + bodyKey]) return E[exact + bodyKey];
    if (E[exact]) return E[exact];
    var cands = BYPATH[method + ' ' + path];
    if (!cands || !cands.length) return null;
    var best = null, bestScore = -1e9;
    cands.forEach(function (key) {
      var q = key.split('#')[0].split('?')[1] || '';
      var rec = new URLSearchParams(q);
      var score = 0;
      params.forEach(function (v, k) {
        if (rec.has(k)) score += rec.getAll(k).indexOf(v) >= 0 ? 3 : (/\d{4}-\d{2}-\d{2}/.test(v) && /\d{4}-\d{2}-\d{2}/.test(rec.get(k)) ? 2 : 1);
        else score -= 1;
      });
      rec.forEach(function (v, k) { if (!params.has(k)) score -= 1; });
      if (bodyKey && key.indexOf('#') > 0) {
        var rb = key.slice(key.indexOf('#') + 1);
        try { var ro = JSON.parse(rb); for (var bk in body) if (stable(ro[bk]) === stable(body[bk])) score += 1; } catch (e) { /* ignore */ }
      }
      if (score > bestScore) { bestScore = score; best = key; }
    });
    return E[best];
  }

  /* ── overlay merge ── */
  function overlay(node) {
    if (Array.isArray(node)) {
      var out = [];
      for (var i = 0; i < node.length; i++) {
        var id = idOf(node[i]);
        if (id && S.deleted[id]) continue;
        out.push(overlay(node[i]));
      }
      return out;
    }
    if (node && typeof node === 'object') {
      var nid = idOf(node);
      if (nid && S.patches[nid]) deepAssign(node, S.patches[nid]);
      for (var k in node) if (node[k] && typeof node[k] === 'object') node[k] = overlay(node[k]);
    }
    return node;
  }
  function createdIn(coll) { return (S.created[coll] || []).filter(function (it) { return !S.deleted[idOf(it)]; }); }
  function appendCreated(body, path) {
    var extra = createdIn(path);
    if (!extra.length) return body;
    var items = extra.map(function (it) { return overlay(clone(it)); });
    if (Array.isArray(body)) return body.concat(items);
    if (body && typeof body === 'object') {
      for (var k in body) if (Array.isArray(body[k])) { body[k] = items.concat(body[k]); return body; }
    }
    return body;
  }
  function findCreated(id) {
    for (var coll in S.created) {
      if (coll === '__ids') continue;
      var list = S.created[coll];
      for (var i = 0; i < list.length; i++) if (idOf(list[i]) === id || (CFG.idAliases || []).some(function (f) { return list[i][f] === id; })) return { coll: coll, item: list[i], index: i };
    }
    return null;
  }

  /* entity(id): the current state of one object (recorded + changes) */
  function entity(id) {
    id = String(id);
    if (S.deleted[id]) return null;
    var c = findCreated(id);
    if (c) return overlay(clone(c.item));
    var cid = REG[id] ? id : ALIAS[id];
    if (!cid || !REG[cid] || S.deleted[cid]) return null;
    return overlay(shift(clone(REG[cid])));
  }
  function canonicalId(id) {
    id = String(id);
    var c = findCreated(id);
    if (c) return idOf(c.item);
    return REG[id] ? id : ALIAS[id] || null;
  }
  function patch(id, fields) {
    var cid = canonicalId(id);
    if (!cid) return null;
    var c = findCreated(cid);
    if (c) { deepAssign(c.item, fields); save(); return entity(cid); }
    S.patches[cid] = deepAssign(S.patches[cid] || {}, fields);
    save();
    return entity(cid);
  }
  function create(coll, item) {
    if (!idOf(item)) item[CFG.idField || '_id'] = newId();
    (S.created[coll] = S.created[coll] || []).push(item);
    save();
    return entity(idOf(item));
  }
  function remove(id) {
    var cid = canonicalId(id) || String(id);
    S.deleted[cid] = 1;
    save();
  }
  /* populate: a field that held an object ({_id, name…}) and receives an id */
  function populate(base, fields) {
    var out = {};
    for (var k in fields) {
      var v = fields[k];
      if (typeof v === 'string' && base && base[k] && typeof base[k] === 'object' && idOf(base[k])) out[k] = entity(v) || v;
      else if (typeof v === 'string' && base && base[k] === null && REG[v]) out[k] = entity(v);
      else out[k] = v;
    }
    return out;
  }

  function serve(method, path, params, body) {
    var e = lookup(method, path, params, body);
    if (!e) return null;
    var out = overlay(shift(clone(e.body)));
    out = appendCreated(out, path);
    return { status: e.status, body: out };
  }

  function nowIso() { return new Date().toISOString(); }
  function me() {
    var login = DATA && DATA.entries[CFG.login && CFG.login.recordKey];
    var u = login && login.body && (login.body.user || login.body.data && login.body.data.user);
    return u ? entity(idOf(u)) || u : null;
  }

  /* ── generic mutations (when no app rule answered) ── */
  function generic(ctx) {
    var segs = ctx.path.split('/').filter(Boolean);
    var k = -1;
    for (var i = segs.length - 1; i >= 0; i--) if (canonicalId(segs[i])) { k = i; break; }
    var m = ctx.method;
    if (k < 0) {
      if (m === 'POST') {
        var collName = segs[segs.length - 1] || 'item';
        var item = Object.assign({}, ctx.body || {}, { createdAt: nowIso(), updatedAt: nowIso() });
        var created = create(ctx.path, item);
        var res = {}; res[singular(collName)] = created;
        return { status: 201, body: res };
      }
      return { status: 200, body: { ok: true } };
    }
    var id = segs[k];
    var name = singular(segs[k - 1] || 'item');
    if (k === segs.length - 1) {
      if (m === 'DELETE') { remove(id); return { status: 200, body: { ok: true } }; }
      if (m === 'PATCH' || m === 'PUT') {
        var base = entity(id);
        var upd = patch(id, Object.assign(populate(base, ctx.body || {}), { updatedAt: nowIso() }));
        var r1 = {}; r1[name] = upd; return { status: 200, body: r1 };
      }
    }
    var r2 = { ok: true }; r2[name] = entity(id); return { status: 200, body: r2 };
  }

  /* ── request handling ── */
  var api = {
    get S() { return S; }, save: save, entity: entity, patch: patch, create: create, remove: remove, populate: populate,
    serve: serve, lookup: lookup, canonicalId: canonicalId, newId: newId, now: nowIso, me: me, clone: clone, shift: shift,
    overlay: overlay, createdIn: createdIn, findCreated: findCreated, generic: generic, singular: singular,
    get data() { return DATA; }, reset: reset
  };

  function login(ctx) {
    var L = CFG.login;
    var b = ctx.body || {};
    var user = String(b[L.userField] || b.username || b.email || '').trim().toLowerCase();
    var pass = String(b[L.passwordField] || b.password || '');
    var ok = L.accept.some(function (a) { return a[0].toLowerCase() === user && a[1] === pass; });
    if (!ok) return { status: 401, body: L.errorBody || { error: 'Identifiants incorrects. Démo : ' + L.accept[L.accept.length - 1][0] + ' / ' + L.accept[0][1] } };
    var rec = DATA.entries[L.recordKey];
    var out = shift(clone(rec.body));
    // a session that never expires during the visit
    if (out && typeof out === 'object' && 'expiresAt' in out) out.expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    return { status: 200, body: out };
  }

  function handle(method, url, bodyText) {
    return load().then(function () {
      var u = new URL(url, location.href);
      var i = u.pathname.indexOf(CFG.apiPrefix);
      var path = decodeURIComponent(u.pathname.slice(i + CFG.apiPrefix.length)) || '/';
      var body = null;
      if (bodyText != null && bodyText !== '') { try { body = JSON.parse(bodyText); } catch (e) { body = bodyText; } }
      var ctx = { method: method, path: path, params: u.searchParams, body: body, url: u };
      if (CFG.login && method === (CFG.login.method || 'POST') && new RegExp(CFG.login.path).test(path)) return login(ctx);
      var rules = (window.DEMO_RULES && window.DEMO_RULES.routes) || [];
      for (var r = 0; r < rules.length; r++) {
        var rule = rules[r];
        if (rule.method !== '*' && rule.method !== method) continue;
        var m = path.match(rule.path);
        if (!m) continue;
        var res = rule.handle(ctx, m, api);
        if (res) return res;
      }
      if (method === 'GET' || method === 'HEAD' || isReadPost(path)) {
        var served = serve(method, path, u.searchParams, body);
        if (served) return served;
        if (method === 'GET') {
          var segs = path.split('/').filter(Boolean);
          var last = segs[segs.length - 1];
          var ent = last && entity(last);
          if (ent) { var w = {}; w[singular(segs[segs.length - 2] || 'item')] = ent; return { status: 200, body: w }; }
        }
        return { status: method === 'GET' ? 404 : 200, body: CFG.notFoundBody || { error: 'Indisponible dans la démo.' } };
      }
      return generic(ctx);
    });
  }

  function latency() { return new Promise(function (r) { setTimeout(r, 40 + Math.random() * 140); }); }
  function isApi(url) {
    try {
      var u = new URL(url, location.href);
      if (u.origin !== location.origin && !(CFG.apiOrigins || []).some(function (o) { return u.origin === o; })) return false;
      return u.pathname.indexOf(CFG.apiPrefix) >= 0 && !(CFG.passthrough || []).some(function (re) { return new RegExp(re).test(u.pathname); });
    } catch (e) { return false; }
  }

  /* ── fetch ── */
  /* recorded binary answers (images, logos…) are plain files next to the data */
  function fileFor(method, url) {
    if (method !== 'GET' || !DATA || !DATA.files) return null;
    var u = new URL(url, location.href);
    var i = u.pathname.indexOf(CFG.apiPrefix);
    var key = 'GET ' + decodeURIComponent(u.pathname.slice(i + CFG.apiPrefix.length)) + qs(u.searchParams);
    var f = DATA.files[key] || DATA.files[key.split('?')[0]];
    return f ? CFG.filesUrl + f.file : null;
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : input && input.url ? input.url : String(input);
    if (!isApi(url)) return realFetch(input, init);
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    if (method === 'GET') {
      return load().then(function () {
        var file = fileFor(method, url);
        return file ? realFetch(file) : demoFetch(input, init, url, method);
      });
    }
    return demoFetch(input, init, url, method);
  };
  function demoFetch(input, init, url, method) {
    var bodyP = init && init.body != null ? Promise.resolve(typeof init.body === 'string' ? init.body : null)
      : input && typeof input === 'object' && input.clone && method !== 'GET' ? input.clone().text() : Promise.resolve(null);
    return bodyP.then(function (bt) { return Promise.all([handle(method, url, bt), latency()]); }).then(function (out) {
      var res = out[0];
      var status = res.status || 200;
      var noBody = status === 204 || status === 304;
      return new Response(noBody ? null : JSON.stringify(res.body), { status: status, headers: Object.assign({ 'content-type': 'application/json; charset=utf-8' }, res.headers || {}) });
    });
  }

  /* ── XMLHttpRequest (Angular, axios…) ── */
  function FakeXHR() {
    this._real = new RealXHR();
    this._mock = false;
    this._listeners = {};
    this._headers = {};
    this.readyState = 0;
    this.status = 0;
    this.statusText = '';
    this.responseType = '';
    this.response = null;
    this.responseText = '';
    this.responseURL = '';
    this.timeout = 0;
    this.withCredentials = false;
    this.upload = this._real.upload;
    var self = this;
    ['onload', 'onerror', 'onreadystatechange', 'onabort', 'ontimeout', 'onloadend', 'onloadstart', 'onprogress'].forEach(function (h) { self[h] = null; });
  }
  FakeXHR.UNSENT = 0; FakeXHR.OPENED = 1; FakeXHR.HEADERS_RECEIVED = 2; FakeXHR.LOADING = 3; FakeXHR.DONE = 4;
  FakeXHR.prototype.open = function (method, url) {
    this._method = String(method).toUpperCase();
    this._url = url;
    this._mock = isApi(url);
    if (!this._mock) {
      var self = this, real = this._real;
      real.open.apply(real, arguments);
      ['readystatechange', 'load', 'error', 'abort', 'timeout', 'loadend', 'loadstart', 'progress'].forEach(function (ev) {
        real.addEventListener(ev, function (e) {
          self.readyState = real.readyState;
          if (real.readyState >= 2) { self.status = real.status; self.statusText = real.statusText; self.responseURL = real.responseURL; }
          if (real.readyState === 4) {
            try { self.response = real.response; } catch (x) { /* ignore */ }
            try { if (real.responseType === '' || real.responseType === 'text') self.responseText = real.responseText; } catch (x) { /* ignore */ }
          }
          self._emit(ev, e);
        });
      });
    }
    this.readyState = 1;
  };
  FakeXHR.prototype.setRequestHeader = function (k, v) { if (this._mock) this._headers[k] = v; else this._real.setRequestHeader(k, v); };
  FakeXHR.prototype.getResponseHeader = function (k) {
    if (!this._mock) return this._real.getResponseHeader(k);
    return /content-type/i.test(k) ? 'application/json; charset=utf-8' : null;
  };
  FakeXHR.prototype.getAllResponseHeaders = function () { return this._mock ? 'content-type: application/json; charset=utf-8\r\n' : this._real.getAllResponseHeaders(); };
  FakeXHR.prototype.overrideMimeType = function (m) { if (!this._mock) this._real.overrideMimeType(m); };
  FakeXHR.prototype.abort = function () { if (!this._mock) this._real.abort(); else { this._aborted = true; this._emit('abort', {}); } };
  FakeXHR.prototype.addEventListener = function (ev, fn) { (this._listeners[ev] = this._listeners[ev] || []).push(fn); };
  FakeXHR.prototype.removeEventListener = function (ev, fn) { var l = this._listeners[ev]; if (l) this._listeners[ev] = l.filter(function (f) { return f !== fn; }); };
  FakeXHR.prototype.dispatchEvent = function (e) { this._emit(e.type, e); return true; };
  FakeXHR.prototype._emit = function (ev, e) {
    var evt = e && e.type ? e : { type: ev, target: this, currentTarget: this, lengthComputable: false, loaded: 0, total: 0 };
    var h = this['on' + ev];
    if (typeof h === 'function') h.call(this, evt);
    (this._listeners[ev] || []).slice().forEach(function (fn) { fn.call(this, evt); }, this);
  };
  FakeXHR.prototype.send = function (body) {
    if (!this._mock) {
      var real = this._real;
      real.responseType = this.responseType;
      real.timeout = this.timeout;
      real.withCredentials = this.withCredentials;
      return real.send(body);
    }
    var self = this;
    this._emit('loadstart');
    Promise.all([handle(this._method, this._url, typeof body === 'string' ? body : null), latency()]).then(function (out) {
      if (self._aborted) return;
      var res = out[0];
      var text = JSON.stringify(res.body);
      self.status = res.status || 200;
      self.statusText = self.status < 400 ? 'OK' : 'Error';
      self.responseURL = new URL(self._url, location.href).href;
      self.readyState = 2; self._emit('readystatechange');
      self.readyState = 3; self._emit('readystatechange');
      self.responseText = text;
      self.response = self.responseType === 'json' ? res.body : self.responseType === 'blob' ? new Blob([text], { type: 'application/json' }) : self.responseType === 'arraybuffer' ? new TextEncoder().encode(text).buffer : text;
      self.readyState = 4;
      self._emit('readystatechange');
      self._emit('progress', { type: 'progress', lengthComputable: true, loaded: text.length, total: text.length, target: self });
      self._emit('load');
      self._emit('loadend');
    }).catch(function (err) {
      console.error('[demo]', err);
      self.status = 0; self.readyState = 4; self._emit('readystatechange'); self._emit('error'); self._emit('loadend');
    });
  };
  window.XMLHttpRequest = FakeXHR;

  /* ── EventSource / WebSocket to the API: silently idle ── */
  if (CFG.muteRealtime !== false) {
    var RealES = window.EventSource;
    if (RealES) {
      window.EventSource = function (url, opts) {
        if (!isApi(url)) return new RealES(url, opts);
        var es = { url: url, readyState: 1, close: function () { this.readyState = 2; }, addEventListener: function () {}, removeEventListener: function () {}, onmessage: null, onerror: null, onopen: null };
        setTimeout(function () { if (typeof es.onopen === 'function') es.onopen({}); }, 50);
        return es;
      };
    }
  }

  /* ── reset + badge + login hint ── */
  function reset() {
    try { localStorage.removeItem(SKEY); (CFG.resetKeys || []).forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { /* ignore */ }
    location.href = CFG.basePath;
  }

  function fillInputs() {
    var c = CFG.ui.credentials;
    var inputs = Array.prototype.slice.call(document.querySelectorAll('input'));
    var userIn = inputs.filter(function (i) { return /email|text|^$/.test(i.type || '') && i.offsetParent; })[0];
    var passIn = inputs.filter(function (i) { return i.type === 'password' && i.offsetParent; })[0];
    function set(el, v) {
      if (!el) return;
      var proto = Object.getPrototypeOf(el);
      var desc = Object.getOwnPropertyDescriptor(proto, 'value') || Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      desc.set.call(el, v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    set(userIn, c.fill || c.email || c.user);
    set(passIn, c.password);
    (passIn || userIn) && (passIn || userIn).focus();
  }

  function ui() {
    if (!CFG.ui || document.getElementById('demo-kit-badge')) return;
    var accent = CFG.ui.accent || '#C9963A';
    var st = document.createElement('style');
    st.textContent =
      '#demo-kit-badge{position:fixed;left:14px;bottom:14px;z-index:2147483000;display:flex;align-items:center;gap:2px;padding:4px;border-radius:999px;background:rgba(10,12,18,.88);border:1px solid rgba(255,255,255,.12);box-shadow:0 10px 30px -10px rgba(0,0,0,.6);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);font:500 12px/1 system-ui,-apple-system,"Segoe UI",sans-serif;color:#e8e6e1}' +
      '#demo-kit-badge a,#demo-kit-badge button{all:unset;cursor:pointer;padding:7px 11px;border-radius:999px;white-space:nowrap;color:inherit}' +
      '#demo-kit-badge a:hover,#demo-kit-badge button:hover{background:rgba(255,255,255,.09)}' +
      '#demo-kit-badge .dk-tag{padding:6px 10px;border-radius:999px;background:' + accent + ';color:#111;font-weight:700;letter-spacing:.08em;font-size:10.5px}' +
      '#demo-kit-badge a:focus-visible,#demo-kit-badge button:focus-visible{outline:2px solid ' + accent + '}' +
      '#demo-kit-login{position:fixed;right:18px;bottom:18px;z-index:2147483000;width:min(320px,calc(100vw - 36px));padding:18px 18px 16px;border-radius:16px;background:rgba(12,14,20,.94);color:#ece9e2;border:1px solid ' + accent + '66;box-shadow:0 24px 60px -18px rgba(0,0,0,.7);font:14px/1.45 system-ui,-apple-system,"Segoe UI",sans-serif;animation:dkIn .5s cubic-bezier(.2,.8,.2,1)}' +
      '#demo-kit-login h4{margin:0 0 4px;font-size:15px;color:#fff}#demo-kit-login p{margin:0 0 12px;color:#aaa6a0;font-size:12.5px}' +
      '#demo-kit-login dl{display:grid;grid-template-columns:auto 1fr;gap:6px 12px;margin:0 0 14px;font-size:13px}#demo-kit-login dt{color:#8d8a85}#demo-kit-login dd{margin:0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;color:#fff;word-break:break-all}' +
      '#demo-kit-login button{all:unset;cursor:pointer;display:block;text-align:center;width:100%;box-sizing:border-box;padding:10px;border-radius:10px;background:' + accent + ';color:#111;font-weight:700}' +
      '#demo-kit-login button:focus-visible{outline:2px solid #fff;outline-offset:2px}' +
      '@keyframes dkIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}' +
      '@media (prefers-reduced-motion:reduce){#demo-kit-login{animation:none}}' +
      '.dk-creds{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin:0 0 16px;padding:10px 12px;border-radius:10px;border:1px dashed ' + accent + ';background:' + accent + '1a;font:12.5px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;color:inherit}' +
      '.dk-creds-t{flex-basis:100%;font-weight:700;letter-spacing:.04em;color:' + accent + '}' +
      '.dk-creds code{font:12px ui-monospace,SFMono-Regular,Menlo,monospace;padding:2px 6px;border-radius:5px;background:rgba(127,127,127,.18);user-select:all}';
    if (CFG.ui.badgeRight) st.textContent += '#demo-kit-badge{left:auto;right:14px}#demo-kit-login{bottom:64px}';
    document.head.appendChild(st);
    var b = document.createElement('div');
    b.id = 'demo-kit-badge';
    b.innerHTML = '<a href="' + (CFG.ui.backUrl || '/') + '" title="Retour à la vitrine">← ' + (CFG.ui.backLabel || 'KANTO APLO') + '</a><span class="dk-tag">DÉMO</span><button type="button" title="Effacer vos modifications et revenir aux données de départ">Réinitialiser</button>';
    b.querySelector('button').addEventListener('click', function () { if (confirm('Effacer vos modifications et recharger les données de démonstration ?')) reset(); });
    document.body.appendChild(b);
    checkLogin();
    setInterval(checkLogin, 700);
  }

  /* Les identifiants de démo, écrits dans le formulaire de connexion lui-même,
     et les champs pré-remplis (une seule fois par formulaire). */
  function inlineCreds() {
    var c = CFG.ui.credentials;
    var pass = document.querySelector('input[type=password]');
    if (!pass || !pass.offsetParent) return;
    var form = pass.form || pass.closest('form') || pass.parentElement.parentElement;
    if (!form || form.querySelector('.dk-creds')) return;
    var box = document.createElement('div');
    box.className = 'dk-creds';
    box.setAttribute('role', 'note');
    box.innerHTML = '<span class="dk-creds-t">♫ Démo · identifiants</span>' +
      (c.email ? '<span>E-mail <code>' + c.email + '</code></span>' : '') +
      (c.user && c.user !== c.email ? '<span>ou identifiant <code>' + c.user + '</code></span>' : '') +
      '<span>Mot de passe <code>' + c.password + '</code></span>';
    form.insertBefore(box, form.firstChild);
    if (!form.dataset.dkFilled) {
      form.dataset.dkFilled = '1';
      setTimeout(fillInputs, 60);
    }
  }

  function checkLogin() {
    var c = CFG.ui && CFG.ui.credentials;
    if (!c) return;
    inlineCreds();
    // la carte flottante ne sert que si les identifiants n'ont pas pu être écrits dans le formulaire
    var onLogin = (new RegExp(CFG.ui.loginPath || 'login').test(location.pathname + location.hash) || !!document.querySelector('input[type=password]')) && !document.querySelector('.dk-creds');
    var card = document.getElementById('demo-kit-login');
    if (onLogin && !card) {
      card = document.createElement('div');
      card.id = 'demo-kit-login';
      card.setAttribute('role', 'note');
      card.innerHTML = '<h4>' + (CFG.ui.title || 'Démo interactive') + '</h4><p>Données fictives. Vos modifications restent dans ce navigateur.</p><dl>' +
        (c.email ? '<dt>E-mail</dt><dd>' + c.email + '</dd>' : '') + (c.user ? '<dt>Identifiant</dt><dd>' + c.user + '</dd>' : '') +
        '<dt>Mot de passe</dt><dd>' + c.password + '</dd></dl><button type="button">Remplir et se connecter</button>';
      card.querySelector('button').addEventListener('click', function () {
        fillInputs();
        setTimeout(function () {
          var form = document.querySelector('input[type=password]') && document.querySelector('input[type=password]').form;
          var btn = form && form.querySelector('button[type=submit], button:not([type])');
          if (btn) btn.click(); else if (form && form.requestSubmit) form.requestSubmit();
        }, 120);
      });
      document.body.appendChild(card);
    } else if (!onLogin && card) card.remove();
  }

  window.DEMO_KIT = api;
  load();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ui); else ui();
})();
