/* ═══════════════════════════════════════════════════════════════════════
   KANTO APLO — figures musicales en mouvement (décor de fond)
   ───────────────────────────────────────────────────────────────────────
   Un lanceur crée sans cesse des « corps » qui traversent l'écran :
     · une figure seule (note, silence, altération) ;
     · un système simple : une figure centrale et ses planètes en orbite ;
     · un système étendu : des planètes qui ont elles-mêmes leurs lunes.
   Chaque corps reçoit un trajet aléatoire (courbe de Bézier d'un bord à
   l'autre, dans n'importe quel sens), une vitesse, une taille, une rotation.
   Les satellites tournent autour de leur parent sur des ellipses inclinées,
   et le parent les emporte avec lui.
   Un seul canvas, dessiné à la main (aucune police requise pour les glyphes).
   Mis en pause quand l'onglet est caché ; absent si l'utilisateur demande
   moins d'animations.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var canvas = document.getElementById('figures');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var TAU = Math.PI * 2;
  var W = 0, H = 0, dpr = 1, small = false;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function weighted(table) {
    var total = 0, k;
    for (k in table) total += table[k];
    var r = Math.random() * total;
    for (k in table) { r -= table[k]; if (r <= 0) return k; }
    return k;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = window.innerWidth; H = window.innerHeight;
    small = W < 720;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ════════════════ Glyphes (unité = taille de la figure, centre = 0,0) ════════════════ */
  function head(s, x, y, hollow) {
    ctx.save();
    ctx.translate(x * s, y * s);
    ctx.rotate(-0.38);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.2, s * 0.14, 0, 0, TAU);
    if (hollow) { ctx.lineWidth = s * 0.055; ctx.stroke(); } else ctx.fill();
    ctx.restore();
  }
  function stem(s, x, y1, y2) { ctx.fillRect(x * s - s * 0.024, y2 * s, s * 0.048, (y1 - y2) * s); }
  function beam(s, x1, y1, x2, y2, t) {
    ctx.beginPath();
    ctx.moveTo(x1 * s, y1 * s); ctx.lineTo(x2 * s, y2 * s);
    ctx.lineTo(x2 * s, (y2 + t) * s); ctx.lineTo(x1 * s, (y1 + t) * s);
    ctx.closePath(); ctx.fill();
  }
  function line(s, pts, w) {
    ctx.beginPath();
    ctx.moveTo(pts[0] * s, pts[1] * s);
    for (var i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i] * s, pts[i + 1] * s);
    ctx.lineWidth = w * s; ctx.stroke();
  }

  var GLYPHS = {
    quarter: function (s) { head(s, -0.04, 0.3); stem(s, 0.135, 0.28, -0.56); },
    eighth: function (s) {
      head(s, -0.04, 0.3); stem(s, 0.135, 0.28, -0.56);
      ctx.beginPath(); ctx.moveTo(0.135 * s, -0.56 * s);
      ctx.bezierCurveTo(0.17 * s, -0.36 * s, 0.46 * s, -0.3 * s, 0.34 * s, -0.02 * s);
      ctx.lineWidth = s * 0.07; ctx.stroke();
    },
    beamed: function (s) {
      head(s, -0.3, 0.32); head(s, 0.3, 0.22);
      stem(s, -0.125, 0.3, -0.5); stem(s, 0.475, 0.2, -0.6);
      beam(s, -0.15, -0.5, 0.5, -0.6, 0.11);
    },
    sixteenth: function (s) {
      head(s, -0.3, 0.32); head(s, 0.3, 0.22);
      stem(s, -0.125, 0.3, -0.5); stem(s, 0.475, 0.2, -0.6);
      beam(s, -0.15, -0.5, 0.5, -0.6, 0.1); beam(s, -0.15, -0.33, 0.5, -0.43, 0.1);
    },
    half: function (s) { head(s, -0.04, 0.3, true); stem(s, 0.135, 0.28, -0.56); },
    whole: function (s) {
      ctx.beginPath();
      ctx.ellipse(0, 0, s * 0.27, s * 0.18, 0, 0, TAU);
      ctx.ellipse(0, 0, s * 0.12, s * 0.085, 0.75, 0, TAU);
      ctx.fill('evenodd');
    },
    /* Silences */
    quarterRest: function (s) {
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      line(s, [-0.06, -0.55, 0.13, -0.3, -0.1, -0.06, 0.13, 0.2], 0.09);
      ctx.beginPath(); ctx.moveTo(0.13 * s, 0.2 * s);
      ctx.quadraticCurveTo(-0.2 * s, 0.12 * s, -0.02 * s, 0.52 * s);
      ctx.lineWidth = 0.08 * s; ctx.stroke();
    },
    eighthRest: function (s) {
      ctx.beginPath(); ctx.arc(-0.1 * s, -0.22 * s, 0.085 * s, 0, TAU); ctx.fill();
      ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-0.1 * s, -0.15 * s);
      ctx.quadraticCurveTo(0.06 * s, -0.12 * s, 0.18 * s, -0.3 * s);
      ctx.lineTo(-0.02 * s, 0.42 * s);
      ctx.lineWidth = 0.06 * s; ctx.stroke();
    },
    halfRest: function (s) {
      ctx.fillRect(-0.22 * s, -0.12 * s, 0.44 * s, 0.14 * s);
      ctx.fillRect(-0.34 * s, 0.02 * s, 0.68 * s, 0.035 * s);
    },
    wholeRest: function (s) {
      ctx.fillRect(-0.34 * s, -0.12 * s, 0.68 * s, 0.035 * s);
      ctx.fillRect(-0.22 * s, -0.085 * s, 0.44 * s, 0.14 * s);
    },
    /* Altérations */
    sharp: function (s) {
      ctx.lineCap = 'butt';
      line(s, [-0.08, -0.42, -0.08, 0.46], 0.045);
      line(s, [0.09, -0.48, 0.09, 0.4], 0.045);
      beam(s, -0.22, -0.08, 0.23, -0.2, 0.09);
      beam(s, -0.22, 0.17, 0.23, 0.05, 0.09);
    },
    flat: function (s) {
      ctx.lineCap = 'round';
      line(s, [-0.12, -0.55, -0.12, 0.34], 0.05);
      ctx.beginPath(); ctx.moveTo(-0.12 * s, 0.34 * s);
      ctx.bezierCurveTo(0.32 * s, 0.08 * s, 0.22 * s, -0.2 * s, -0.12 * s, 0.02 * s);
      ctx.lineWidth = 0.06 * s; ctx.stroke();
    }
  };

  /* Fréquence de chaque glyphe selon son rôle dans un corps. */
  var SOLO = { quarter: 5, eighth: 5, beamed: 4, sixteenth: 3, half: 3, whole: 2, quarterRest: 3, eighthRest: 3, halfRest: 2, wholeRest: 1, sharp: 2, flat: 2 };
  var CENTER = { whole: 4, beamed: 3, sixteenth: 2, half: 2, quarter: 1, sharp: 1 };
  var ORBITER = { quarter: 4, eighth: 4, half: 2, eighthRest: 3, quarterRest: 3, halfRest: 1, sharp: 1, flat: 1, whole: 1 };

  /* Couleurs : or de la marque, ivoire, et la couleur de l'éditeur en cours. */
  var accent = '#C9963A';
  function readAccent() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--acc').trim();
    if (v) accent = v;
  }
  function pickColor() {
    var k = weighted({ gold: 5, ivory: 3, accent: 3 });
    return k === 'accent' ? accent : k === 'gold' ? '#C9963A' : '#E6D6A8';
  }

  /* ════════════════ Trajets ════════════════
     Un sens au hasard (de bas en haut, de droite à gauche, en diagonale…),
     départ hors écran du côté opposé, arrivée hors écran, et deux points de
     contrôle décalés pour une courbe douce, jamais deux fois la même. */
  function makePath(margin) {
    var ang = rand(0, TAU);
    var dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx;
    var cx = W / 2, cy = H / 2;
    var R = Math.sqrt(W * W + H * H) / 2 + margin;
    var o1 = rand(-0.45, 0.45) * R, o2 = rand(-0.45, 0.45) * R;
    var p0 = [cx - dx * R + px * o1, cy - dy * R + py * o1];
    var p3 = [cx + dx * R + px * o2, cy + dy * R + py * o2];
    function ctrl(t) {
      var bend = rand(-0.5, 0.5) * R;
      return [p0[0] + (p3[0] - p0[0]) * t + px * bend, p0[1] + (p3[1] - p0[1]) * t + py * bend];
    }
    var p1 = ctrl(1 / 3), p2 = ctrl(2 / 3);
    var len = Math.hypot(p3[0] - p0[0], p3[1] - p0[1]);
    return { p: [p0, p1, p2, p3], len: len };
  }
  function bezier(path, u) {
    var p = path.p, v = 1 - u;
    var a = v * v * v, b = 3 * v * v * u, c = 3 * v * u * u, d = u * u * u;
    return [a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0], a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1]];
  }

  /* ════════════════ Corps : figure seule ou système en orbite ════════════════ */
  function orbiter(glyphTable, size, radius, depth) {
    var o = {
      glyph: weighted(glyphTable), size: size, color: pickColor(),
      r: radius, ry: rand(0.35, 0.95), tilt: rand(0, Math.PI),
      speed: rand(0.35, 1.1) * (Math.random() < 0.5 ? -1 : 1), phase: rand(0, TAU),
      spin: rand(-0.6, 0.6), moons: []
    };
    if (depth > 0) {
      var n = Math.random() < 0.6 ? 1 : 2;
      for (var i = 0; i < n; i++) o.moons.push(orbiter(ORBITER, size * rand(0.5, 0.65), size * rand(0.9, 1.4) + i * size * 0.5, 0));
    }
    return o;
  }
  function count(o) { return 1 + o.moons.reduce(function (n, m) { return n + count(m); }, 0); }

  function spawn() {
    var kind = weighted(small ? { single: 7, system: 3, extended: 1 } : { single: 6, system: 3, extended: 1.6 });
    var scale = small ? 0.78 : 1;
    var body;
    if (kind === 'single') {
      body = { center: orbiter(SOLO, rand(18, 34) * scale, 0, 0), speed: rand(28, 70) };
    } else {
      var size = rand(26, 42) * scale;
      var center = orbiter(CENTER, size, 0, 0);
      var n = kind === 'system' ? (Math.random() < 0.5 ? 2 : 3) : (Math.random() < 0.5 ? 3 : 4);
      var r = size * 1.25;
      for (var i = 0; i < n; i++) {
        r += size * rand(0.55, 0.9);
        var extended = kind === 'extended' && (i === n - 1 || Math.random() < 0.45);
        center.moons.push(orbiter(ORBITER, rand(14, 22) * scale, r, extended ? 1 : 0));
        if (extended) r += size * 0.6;
      }
      body = { center: center, speed: rand(16, 38), orbits: true };
    }
    body.reach = maxReach(body.center);
    body.path = makePath(body.reach + 40);
    body.dur = body.path.len / body.speed;
    body.t = 0;
    body.alpha = rand(0.22, 0.5);
    body.figures = count(body.center);
    return body;
  }
  function maxReach(o) {
    var m = o.size;
    o.moons.forEach(function (c) { m = Math.max(m, c.r + maxReach(c)); });
    return m;
  }

  /* ════════════════ Dessin ════════════════ */
  function drawGlyph(o, x, y, rot, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.fillStyle = ctx.strokeStyle = o.color;
    GLYPHS[o.glyph](o.size);
    ctx.restore();
  }
  function drawSystem(o, x, y, t, alpha, orbits) {
    o.moons.forEach(function (m) {
      var a = m.phase + m.speed * t;
      var lx = Math.cos(a) * m.r, ly = Math.sin(a) * m.r * m.ry;
      var cs = Math.cos(m.tilt), sn = Math.sin(m.tilt);
      var mx = x + lx * cs - ly * sn, my = y + lx * sn + ly * cs;
      if (orbits) {
        ctx.save();
        ctx.globalAlpha = alpha * 0.22;
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 0.7;
        ctx.setLineDash([2, 5]);
        ctx.beginPath();
        ctx.ellipse(x, y, m.r, m.r * m.ry, m.tilt, 0, TAU);
        ctx.stroke();
        ctx.restore();
      }
      drawSystem(m, mx, my, t, alpha * 0.92, orbits);
    });
    drawGlyph(o, x, y, Math.sin(t * 0.7 + o.phase) * 0.25 + o.spin * t * 0.2, alpha);
  }

  var bodies = [], last = 0, nextSpawn = 0, accentTimer = 0;
  function budget() { return small ? 18 : 36; }
  function used() { return bodies.reduce(function (n, b) { return n + b.figures; }, 0); }

  // Un premier tirage déjà en route, pour ne pas commencer sur un écran vide.
  (function seed() {
    for (var i = 0; i < (small ? 5 : 9); i++) {
      var b = spawn();
      if (used() + b.figures > budget()) continue;
      b.t = rand(0.15, 0.7) * b.dur;
      bodies.push(b);
    }
  })();

  function frame(now) {
    var dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    accentTimer -= dt;
    if (accentTimer <= 0) { readAccent(); accentTimer = 1; }

    nextSpawn -= dt;
    if (nextSpawn <= 0) {
      var b = spawn();
      if (used() + b.figures <= budget()) bodies.push(b);
      nextSpawn = rand(0.6, 1.8);
    }

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (var i = bodies.length - 1; i >= 0; i--) {
      var body = bodies[i];
      body.t += dt;
      var u = body.t / body.dur;
      if (u >= 1) { bodies.splice(i, 1); continue; }
      var fade = Math.min(1, u / 0.06, (1 - u) / 0.06);
      var pos = bezier(body.path, u);
      drawSystem(body.center, pos[0], pos[1], body.t, body.alpha * fade, body.orbits);
    }
    if (!document.hidden) requestAnimationFrame(frame);
  }
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) { last = 0; requestAnimationFrame(frame); }
  });
  requestAnimationFrame(frame);
})();
