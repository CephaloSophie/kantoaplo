/* ═══════════════════════════════════════════════════════════════════════
   Pinax demo — behaviour of the board API that the generic shim cannot
   guess: task lists filtered like the server does, task edits with history,
   creation with the next "KEY-123" id, comments, reactions, bulk edits,
   sprint / version lifecycle, notifications.
   Everything is stored through the shim (localStorage), never sent anywhere.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var TRACKED = ['title', 'status', 'priority', 'assignee', 'sprint', 'version', 'type', 'category', 'techno', 'area', 'complexity', 'labels', 'parent', 'dueDate', 'estimate', 'duration'];
  var FILTER_FIELDS = ['status', 'priority', 'type', 'category', 'techno', 'version', 'sprint', 'area', 'assignee', 'labels', 'reporter', 'parent'];

  function ok(body, status) { return { status: status || 200, body: body }; }
  function idOf(o) { return o && typeof o === 'object' ? String(o._id || o.id || '') : o == null ? null : String(o); }
  function userRef(api, id) {
    if (!id) return null;
    var u = api.entity(id);
    return u ? { _id: idOf(u), username: u.username, displayName: u.displayName, color: u.color } : null;
  }
  function project(api, K) {
    var r = api.serve('GET', '/projects/' + K, new URLSearchParams(), null);
    return r && r.body && r.body.project;
  }
  function categories(api, K) {
    var r = api.serve('GET', '/projects/' + K + '/taxonomies', new URLSearchParams(), null);
    var map = {};
    ((r && r.body && r.body.taxonomies) || []).forEach(function (t) { if (t.kind === 'status') map[t.key] = (t.meta && t.meta.category) || 'todo'; });
    return map;
  }
  function baseTasks(api, K, summary) {
    var p = new URLSearchParams(summary ? 'fields=summary' : '');
    var r = api.serve('GET', '/projects/' + K + '/tasks', p, null);
    var list = (r && r.body && r.body.tasks) || [];
    // tasks created by the visitor are stored under the collection path
    var created = api.createdIn('/projects/' + K + '/tasks').map(function (t) { return api.entity(t._id); });
    var seen = {};
    return created.concat(list).filter(function (t) { if (!t || seen[t.taskId]) return false; seen[t.taskId] = 1; return true; });
  }

  function filterTasks(api, K, tasks, params) {
    var me = api.me();
    var meId = me && idOf(me);
    var proj = project(api, K) || {};
    var cats = categories(api, K);
    var wants = {};
    FILTER_FIELDS.concat(['statusCategory']).forEach(function (f) {
      var vals = [];
      params.getAll(f).forEach(function (v) { String(v).split(',').forEach(function (x) { if (x) vals.push(x); }); });
      if (vals.length) wants[f] = vals;
    });
    var q = (params.get('q') || params.get('search') || '').trim().toLowerCase();
    var ids = params.get('taskIds') ? params.get('taskIds').toUpperCase().split(',') : null;
    return tasks.filter(function (t) {
      if (ids && ids.indexOf(t.taskId) < 0) return false;
      for (var f in wants) {
        var vals = wants[f];
        if (f === 'statusCategory') {
          var c = cats[t.status] || 'todo';
          var okc = vals.some(function (v) { return v === c || (v === '@open' && c !== 'done'); });
          if (!okc) return false;
          continue;
        }
        var raw = t[f];
        var vs = Array.isArray(raw) ? raw.map(idOf) : [raw && typeof raw === 'object' ? idOf(raw) : raw == null ? null : String(raw)];
        var match = vals.some(function (v) {
          if (v === '@none') return vs.length === 0 || vs[0] == null || vs[0] === '';
          if (v === '@me') return vs.indexOf(meId) >= 0;
          if (v === '@current') return vs.indexOf(proj.currentSprint) >= 0 || (f === 'version' && vs.indexOf(proj.currentVersion) >= 0);
          if (v === '@unreleased') return true;
          return vs.indexOf(v) >= 0;
        });
        if (!match) return false;
      }
      if (q) {
        var hay = (t.taskId + ' ' + t.title + ' ' + (t.description || '').replace(/<[^>]+>/g, ' ')).toLowerCase();
        if (q.split(/\s+/).some(function (w) { return hay.indexOf(w) < 0; })) return false;
      }
      return true;
    });
  }

  function applyTaskPatch(api, K, taskId, data, note) {
    var t = api.entity(taskId);
    if (!t) return null;
    var me = api.me();
    var now = api.now();
    var cats = categories(api, K);
    var history = (t.history || []).slice();
    var changes = {};
    for (var f in data) {
      if (f === 'note') continue;
      var after = data[f];
      if (TRACKED.indexOf(f) >= 0) {
        var before = t[f] && typeof t[f] === 'object' && !Array.isArray(t[f]) ? idOf(t[f]) : t[f];
        var cmpAfter = after && typeof after === 'object' && !Array.isArray(after) ? idOf(after) : after;
        if (JSON.stringify(before == null ? null : before) === JSON.stringify(cmpAfter == null ? null : cmpAfter)) continue;
        history.push({ _id: api.newId(), at: now, by: me && { _id: idOf(me), username: me.username, displayName: me.displayName, color: me.color }, byLabel: me && me.displayName, field: f, from: before == null ? null : before, to: cmpAfter == null ? null : cmpAfter, note: note || undefined });
      }
      changes[f] = f === 'assignee' || f === 'reporter' ? userRef(api, after) : after;
      if (f === 'status') {
        changes.statusChangedAt = now;
        changes.resolvedAt = cats[after] === 'done' ? now : null;
      }
    }
    changes.history = history;
    changes.updatedAt = now;
    return api.patch(taskId, changes);
  }

  function nextTaskId(api, K) {
    var max = 0;
    baseTasks(api, K, true).forEach(function (t) { var m = /(\d+)$/.exec(t.taskId); if (m) max = Math.max(max, +m[1]); });
    return K + '-' + String(max + 1).padStart(3, '0');
  }

  function comments(api, K, taskId, fn) {
    var t = api.entity(taskId);
    if (!t) return ok({ error: 'Tâche introuvable.' }, 404);
    var list = (t.comments || []).slice();
    var extra = fn(list) || {};
    var saved = api.patch(taskId, { comments: list, updatedAt: api.now() });
    return ok(Object.assign({ comments: saved.comments }, extra));
  }

  function sprintRow(api, K, key) {
    var r = api.serve('GET', '/projects/' + K + '/sprints', new URLSearchParams(), null);
    return ((r && r.body && r.body.sprints) || []).filter(function (s) { return s.key === key; })[0];
  }
  function versionRow(api, K, key) {
    var r = api.serve('GET', '/projects/' + K + '/versions', new URLSearchParams(), null);
    return ((r && r.body && r.body.versions) || []).filter(function (v) { return v.key === key || v.label === key; })[0];
  }

  var R = [];
  function route(method, re, fn) { R.push({ method: method, path: re, handle: fn }); }

  /* task list, filtered like GET /tasks */
  route('GET', /^\/projects\/([^/]+)\/tasks$/, function (ctx, m, api) {
    var list = baseTasks(api, m[1], ctx.params.get('fields') === 'summary');
    return ok({ tasks: filterTasks(api, m[1], list, ctx.params), warnings: [] });
  });
  route('POST', /^\/projects\/([^/]+)\/analytics\/tasks$/, function (ctx, m, api) {
    var rec = api.serve('POST', ctx.path, ctx.params, ctx.body);
    return rec;
  });

  /* create a task */
  route('POST', /^\/projects\/([^/]+)\/tasks$/, function (ctx, m, api) {
    var K = m[1];
    var b = ctx.body || {};
    if (!b.title || !String(b.title).trim()) return ok({ error: 'Le titre est obligatoire.', field: 'title' }, 400);
    var proj = project(api, K) || {};
    var me = api.me();
    var now = api.now();
    var taskId = nextTaskId(api, K);
    var by = me && { _id: idOf(me), username: me.username, displayName: me.displayName, color: me.color };
    var task = Object.assign({
      project: proj._id, taskId: taskId, description: '', status: (proj.defaults && proj.defaults.status) || 'pending',
      priority: (proj.defaults && proj.defaults.priority) || 'P2', type: (proj.defaults && proj.defaults.type) || 'feature',
      labels: [], parent: null, sprint: null, version: null, complexity: 0, instructions: [], acceptance: [], dueDate: null,
      comments: [], resolvedAt: null, statusChangedAt: null
    }, b, {
      _id: api.newId(), taskId: taskId,
      assignee: userRef(api, b.assignee), reporter: by,
      history: [{ _id: api.newId(), at: now, by: by, byLabel: me && me.displayName, field: 'created', from: null, to: b.title }],
      createdAt: now, updatedAt: now
    });
    return ok({ task: api.create('/projects/' + K + '/tasks', task) }, 201);
  });

  route('POST', /^\/projects\/([^/]+)\/tasks\/bulk$/, function (ctx, m, api) {
    var b = ctx.body || {};
    var updated = 0, notFound = [];
    (b.taskIds || []).forEach(function (id) {
      if (applyTaskPatch(api, m[1], String(id).toUpperCase(), b.patch || {}, b.note)) updated++; else notFound.push(id);
    });
    return ok({ updated: updated, unchanged: 0, notFound: notFound });
  });

  route('PATCH', /^\/projects\/([^/]+)\/tasks\/([^/]+)$/, function (ctx, m, api) {
    var t = applyTaskPatch(api, m[1], m[2], ctx.body || {}, ctx.body && ctx.body.note);
    return t ? ok({ task: t }) : ok({ error: 'Tâche introuvable.' }, 404);
  });

  /* comments */
  route('POST', /^\/projects\/([^/]+)\/tasks\/([^/]+)\/comments$/, function (ctx, m, api) {
    var me = api.me();
    var id = api.newId();
    return comments(api, m[1], m[2], function (list) {
      var now = api.now();
      list.push({ _id: id, author: me && { _id: idOf(me), username: me.username, displayName: me.displayName, color: me.color }, text: (ctx.body && ctx.body.text) || '', parent: (ctx.body && ctx.body.parent) || null, createdAt: now, updatedAt: now });
      return { commentId: id };
    });
  });
  route('PATCH', /^\/projects\/([^/]+)\/tasks\/([^/]+)\/comments\/([^/]+)$/, function (ctx, m, api) {
    return comments(api, m[1], m[2], function (list) {
      list.forEach(function (c) { if (idOf(c) === m[3]) { c.text = ctx.body && ctx.body.text; c.editedAt = api.now(); } });
    });
  });
  route('DELETE', /^\/projects\/([^/]+)\/tasks\/([^/]+)\/comments\/([^/]+)$/, function (ctx, m, api) {
    var removed = 0;
    var res = comments(api, m[1], m[2], function (list) {
      for (var i = list.length - 1; i >= 0; i--) if (idOf(list[i]) === m[3] || idOf(list[i].parent) === m[3]) { list.splice(i, 1); removed++; }
    });
    res.body.ok = true;
    res.body.removed = removed;
    return res;
  });
  route('POST', /^\/projects\/([^/]+)\/tasks\/([^/]+)\/comments\/([^/]+)\/reactions$/, function (ctx, m, api) {
    var me = api.me();
    var meId = idOf(me);
    var added = false;
    var res = comments(api, m[1], m[2], function (list) {
      list.forEach(function (c) {
        if (idOf(c) !== m[3]) return;
        var emoji = ctx.body && ctx.body.emoji;
        c.reactions = c.reactions || [];
        var r = c.reactions.filter(function (x) { return x.emoji === emoji; })[0];
        if (!r) { r = { emoji: emoji, users: [] }; c.reactions.push(r); }
        var users = r.users.map(idOf);
        if (users.indexOf(meId) >= 0) r.users = r.users.filter(function (u) { return idOf(u) !== meId; });
        else { r.users.push(meId); added = true; }
        c.reactions = c.reactions.filter(function (x) { return x.users.length; });
      });
    });
    res.body.added = added;
    return res;
  });

  /* sprints & versions lifecycle */
  route('POST', /^\/projects\/([^/]+)\/sprints\/([^/]+)\/(start|close|reopen|ready|draft)$/, function (ctx, m, api) {
    var row = sprintRow(api, m[1], decodeURIComponent(m[2]));
    if (!row) return ok({ error: 'Sprint introuvable.' }, 404);
    var next = { start: 'active', close: 'finished', reopen: 'active', ready: 'ready', draft: 'draft' }[m[3]];
    var meta = Object.assign({}, row.meta || {}, { status: next });
    if (m[3] === 'start') meta.startedAt = api.now();
    if (m[3] === 'close') meta.closedAt = api.now();
    var patch = { meta: meta, status: next };
    var saved = api.patch(row._id, patch);
    if (m[3] === 'start' || m[3] === 'close') {
      var proj = project(api, m[1]);
      if (proj && m[3] === 'start') api.patch(proj._id, { currentSprint: row.key });
    }
    return ok(m[3] === 'close' ? { sprint: saved, carriedOver: 0, retroEventId: null } : { sprint: saved });
  });
  route('POST', /^\/projects\/([^/]+)\/versions\/([^/]+)\/(release|unrelease)$/, function (ctx, m, api) {
    var row = versionRow(api, m[1], decodeURIComponent(m[2]));
    if (!row) return ok({ error: 'Version introuvable.' }, 404);
    var status = m[3] === 'release' ? 'released' : 'unreleased';
    var saved = api.patch(row._id, { status: status, meta: Object.assign({}, row.meta || {}, { status: status, releasedAt: m[3] === 'release' ? api.now() : null }) });
    return ok(m[3] === 'release' ? { version: saved, moved: 0 } : { version: saved });
  });
  route('PATCH', /^\/projects\/([^/]+)\/sprints\/current$/, function (ctx, m, api) {
    var proj = project(api, m[1]);
    if (proj) api.patch(proj._id, { currentSprint: ctx.body && ctx.body.currentSprint });
    return ok({ currentSprint: ctx.body && ctx.body.currentSprint });
  });

  /* notifications */
  route('GET', /^\/notifications$/, function (ctx, m, api) {
    var r = api.serve('GET', '/notifications', ctx.params, null);
    if (!r) return ok({ notifications: [], unread: 0 });
    var list = (r.body.notifications || []).filter(function (n) { return !api.S.custom.clearedRead || !n.read; });
    r.body.notifications = list;
    r.body.unread = list.filter(function (n) { return !n.read; }).length;
    return r;
  });
  route('POST', /^\/notifications\/read$/, function (ctx, m, api) {
    var r = api.serve('GET', '/notifications', new URLSearchParams('limit=60'), null);
    var list = (r && r.body.notifications) || [];
    var b = ctx.body || {};
    list.forEach(function (n) { if (b.all || (b.ids || []).indexOf(n._id) >= 0) api.patch(n._id, { read: true, readAt: api.now() }); });
    var unread = list.filter(function (n) { return !n.read && !(b.all || (b.ids || []).indexOf(n._id) >= 0); }).length;
    return ok({ unread: unread });
  });
  route('DELETE', /^\/notifications\/read$/, function (ctx, m, api) {
    api.S.custom.clearedRead = true;
    api.save();
    return ok({ deleted: 1 });
  });

  /* attachments and imports stay disabled in the demo */
  route('POST', /^\/projects\/([^/]+)\/(attachments|import\/.*)$/, function () {
    return ok({ error: 'Cette action est désactivée dans la démo.', code: 'DEMO_READONLY' }, 403);
  });

  window.DEMO_RULES = { routes: R };
})();
