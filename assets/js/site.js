/* ═══════════════════════════════════════════════════════════════════════
   KANTO APLO — comportement de la vitrine
   Rendu depuis assets/js/data.js : la partition (mur de captures tiré au
   sort), un éditeur par « diapositive » plein écran, la portée latérale,
   les autres projets, la visionneuse. Pas d'écouteur de scroll :
   tout passe par IntersectionObserver.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DATA = window.KANTO;
  var editors = DATA.editors;
  var slogans = DATA.slogans;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
  var NUM_FR = ['Zéro', 'Un', 'Deux', 'Trois', 'Quatre', 'Cinq', 'Six', 'Sept', 'Huit', 'Neuf', 'Dix', 'Onze', 'Douze', 'Treize', 'Quatorze', 'Quinze'];
  var NUM_EN = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen'];
  var NOTES = ['♪', '♫', '♩', '♬'];
  var AUTOPLAY_MS = 5600;

  var $ = function (id) { return document.getElementById(id); };
  var root = document.documentElement;

  /* ── Utilitaires ── */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return 'rgba(' + (n >> 16 & 255) + ',' + (n >> 8 & 255) + ',' + (n & 255) + ',' + a + ')';
  }
  function colorVars(hex) {
    return '--c:' + hex + ';--c-soft:' + rgba(hex, 0.16) + ';--c-line:' + rgba(hex, 0.38) + ';--c-glow:' + rgba(hex, 0.55);
  }
  /* Texte bilingue : les deux langues sont dans le DOM, le CSS masque l'autre. */
  function bi(fr, en, tag) {
    tag = tag || 'span';
    return '<' + tag + ' data-fr>' + esc(fr) + '</' + tag + '><' + tag + ' data-en>' + esc(en) + '</' + tag + '>';
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function base(e) { return '/' + (e.dir || 'assets/editors/') + e.id + '/'; }
  function shot(e, i) { return base(e) + pad(i + 1) + '.webp'; }
  function thumb(e, i) { return base(e) + 'thumbs/' + pad(i + 1) + '.webp'; }
  function caption(e, i, l) {
    var list = e['captions_' + l];
    return list && list[i] ? list[i] : (e.latin + ' — ' + (i + 1));
  }
  function lang() { return root.dataset.lang; }
  function abs(href) { return /^https?:|^\//.test(href) ? href : '/' + href; }
  function initial(e) { return e.latin.charAt(0).toUpperCase(); }
  function shuffle(a) {
    a = a.slice();
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }

  editors.forEach(function (e, i) { e.idx = i; e.num = ROMAN[i] || String(i + 1); });
  var engine = DATA.engine;
  var engineEds = engine ? editors.filter(function (e) { return e.engine; }) : [];
  var count = editors.length;

  /* ════════════════ Mini-portées (logo + avatars) ════════════════ */
  function buildStaff(word1, word2, fontSize) {
    var spacing = Math.round(fontSize * 1.35);
    var noteSpacing = Math.round(fontSize * 1.15);
    var padX = 14;
    var lineGap = Math.round(fontSize * 1.1);
    var topLine = Math.round(fontSize * 0.85);
    var height = topLine + lineGap * 4 + Math.round(fontSize * 1.1);
    var yFrac = [0.06, 0.28, 0.50, 0.10, 0.38, 0.64, 0.24, 0.52, 0.08, 0.36, 0.60, 0.18, 0.46, 0.66, 0.12, 0.40, 0.58, 0.22, 0.48, 0.16, 0.42, 0.62, 0.20, 0.44];
    var usableTop = topLine * 0.35;
    var usableH = height - usableTop - fontSize * 0.4;
    var glyphs = [];
    word1.split('').forEach(function (ch) { glyphs.push({ ch: ch, note: false }); });
    ['♪', '♫', '♩'].forEach(function (ch) { glyphs.push({ ch: ch, note: true }); });
    word2.split('').forEach(function (ch) { glyphs.push({ ch: ch, note: false }); });
    var x = padX, inNotes = false, out = '';
    var groupGap = Math.round(spacing * 0.45);
    glyphs.forEach(function (g, i) {
      if (g.note !== inNotes) { x += groupGap; inNotes = g.note; }
      var y = usableTop + Math.min(0.92, yFrac[i % yFrac.length] + 0.2) * usableH;
      out += '<g class="sf-g ' + (g.note ? 'sf-note' : 'sf-letter') + '" style="animation-delay:' + ((i % 7) * 0.16).toFixed(2) + 's">' +
        '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" style="font-size:' + (g.note ? Math.round(fontSize * 0.85) : fontSize) + 'px">' + g.ch + '</text></g>';
      x += g.note ? noteSpacing : spacing;
    });
    var width = x + padX, lines = '';
    for (var i = 0; i < 5; i++) {
      var ly = topLine + i * lineGap;
      lines += '<line x1="4" y1="' + ly + '" x2="' + (width - 4) + '" y2="' + ly + '"/>';
    }
    return '<svg class="mini-staff-svg" viewBox="0 0 ' + width.toFixed(0) + ' ' + height + '" aria-hidden="true">' + lines + out + '</svg>';
  }
  $('logoStaff').innerHTML = buildStaff('KANTO', 'APLO', 15);

  /* Une mélodie écrite en lettres : chaque lettre est une note posée sur la
     portée, à sa hauteur (sur une ligne ou dans un interligne). Une barre de
     mesure sépare les mots. Une tête de lecture parcourt la mesure en boucle et
     fait « sonner » chaque lettre. */
  function staffWord(words, opt) {
    opt = opt || {};
    var FS = opt.font || 52, GAP = opt.gap || Math.round(FS * 0.58), SP = opt.spacing || Math.round(FS * 1.12);
    var TOP = Math.round(FS * 0.9) + 8;
    var clefW = GAP * 2.5, timeX = 14 + clefW + GAP * 0.8;
    var X0 = Math.round(opt.time ? timeX + GAP * 2.1 : 14 + clefW + GAP * 1.2);
    var lines = [0, 1, 2, 3, 4].map(function (i) { return TOP + i * GAP; });
    var bottom = lines[4];
    var notes = [], x = X0, bars = [], melody = opt.melody || [];
    words.forEach(function (w, wi) {
      var prev = 4;
      Array.from(w).forEach(function (ch, li) {
        var step = melody.length ? melody[notes.length % melody.length]
          : Math.max(2, Math.min(6, prev + ((ch.charCodeAt(0) * 7 + li * 5) % 3) - 1));
        prev = step;
        notes.push({ ch: ch, x: x, y: bottom - step * GAP / 2 });
        x += SP;
      });
      if (wi < words.length - 1) { bars.push(x - SP / 2 + 4); x += Math.round(SP * 0.35); }
    });
    var W = x + 24, H = bottom + Math.round(FS * 0.75) + 10, dur = opt.dur || 7, sweep = 0.42;
    var gid = 'mg-' + (opt.id || 'm');
    var svg = '<svg class="melody" viewBox="0 0 ' + W + ' ' + H + '" style="--dur:' + dur + 's;--w:' + W + 'px">';
    svg += '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf1d6"/><stop offset=".55" stop-color="#e6c97e"/><stop offset="1" stop-color="#C9963A"/></linearGradient></defs>';
    lines.forEach(function (y, i) { svg += '<line class="m-line" x1="8" x2="' + (W - 8) + '" y1="' + y + '" y2="' + y + '" pathLength="1" style="--i:' + i + '"/>'; });
    svg += '<text class="m-clef" x="12" y="' + (bottom + GAP * 0.62) + '" style="font-size:' + Math.round(GAP * 4.4) + 'px">𝄞</text>';
    if (opt.time) svg += '<text class="m-time" x="' + timeX + '" y="' + (lines[2] - GAP * 0.1) + '" style="font-size:' + Math.round(GAP * 1.75) + 'px">' + opt.time[0] + '</text><text class="m-time" x="' + timeX + '" y="' + (bottom - GAP * 0.1) + '" style="font-size:' + Math.round(GAP * 1.75) + 'px">' + opt.time[1] + '</text>';
    bars.forEach(function (bx) { svg += '<line class="m-bar" x1="' + bx + '" x2="' + bx + '" y1="' + lines[0] + '" y2="' + bottom + '"/>'; });
    svg += '<line class="m-bar" x1="' + (W - 22) + '" x2="' + (W - 22) + '" y1="' + lines[0] + '" y2="' + bottom + '"/><line class="m-bar end" x1="' + (W - 14) + '" x2="' + (W - 14) + '" y1="' + lines[0] + '" y2="' + bottom + '"/>';
    notes.forEach(function (n, i) {
      var t = ((n.x / W) * sweep * dur).toFixed(2);
      svg += '<g class="m-note" style="--i:' + i + ';--t:' + t + 's">' +
        '<text class="m-letter" x="' + n.x + '" y="' + n.y + '" dominant-baseline="central" style="font-size:' + FS + 'px" fill="url(#' + gid + ')">' + esc(n.ch) + '</text>' +
        '<text class="m-spark" x="' + (n.x + FS * 0.32) + '" y="' + (n.y - FS * 0.55) + '">♪</text></g>';
    });
    svg += '<line class="m-play" x1="0" x2="0" y1="' + (lines[0] - GAP * 1.6) + '" y2="' + (bottom + GAP * 1.6) + '"/>';
    return svg + '</svg>';
  }
  $('heroStaff').innerHTML = staffWord(['KANTO', 'APLO'], { id: 'kanto', time: ['12', '1'], melody: [2, 4, 6, 3, 5, 7, 4, 2, 5], font: 56, dur: 7.5 });
  $('avatarStaff1').innerHTML = staffWord(['AMEUR', 'HAMDOUNI'], { id: 'ameur', font: 34, spacing: 34, dur: 8 });
  $('avatarStaff2').innerHTML = staffWord(['ABDELHAMID', 'SGHAIER'], { id: 'abdel', font: 31, spacing: 31, dur: 8.6 });

  /* ════════════════ Nombre d'éditeurs, partout où il est écrit ════════════════ */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var word = el.hasAttribute('data-en') ? NUM_EN[count] : NUM_FR[count];
    el.textContent = el.dataset.count === 'lower' ? word.toLowerCase() : word;
  });

  /* ════════════════ Ouverture : chiffres clés ════════════════ */
  var live = editors.filter(function (e) { return e.status === 'ready'; }).length;
  $('stats').innerHTML = [
    [count, 'mouvements', 'movements', 'éditeurs visuels', 'visual editors'],
    [live, 'symphonies à écouter', 'symphonies to hear', 'démos en ligne', 'live demos'],
    [0, 'ligne de code', 'lines of code', 'à écrire', 'to write']
  ].map(function (s) { return '<li><b>' + s[0] + '</b><span>' + bi(s[1], s[2]) + '<small>' + bi(s[3], s[4]) + '</small></span></li>'; }).join('');

  function chip(e) {
    if (e.status === 'ready') return '<span class="chip ready" title="Démo interactive en ligne / Live interactive demo"><i></i>' + bi('En scène · démo live', 'On stage · live demo') + '</span>';
    return '<span class="chip pending" title="En cours de développement / Under development"><i></i>' + bi('En répétition', 'In rehearsal') + (e.version ? ' · ' + esc(e.version) : '') + '</span>';
  }

  /* ════════════════ La partition : mur de captures + index des éditeurs ════════════════
     Toutes les captures de tous les éditeurs, tirées au sort à chaque visite,
     défilent en colonnes inclinées. Régulièrement, une capture « entre en scène » :
     elle s'illumine et son éditeur s'affiche sous le titre. */
  var pool = [];
  editors.forEach(function (e) { for (var i = 0; i < e.shots; i++) pool.push({ e: e, i: i }); });
  pool = shuffle(pool);
  var COLS = window.innerWidth < 720 ? 3 : 4;
  var perCol = Math.max(5, Math.min(9, Math.ceil(pool.length / COLS)));
  var wall = '';
  for (var c = 0; c < COLS; c++) {
    var tiles = '';
    for (var k = 0; k < perCol; k++) {
      var p = pool[(c * perCol + k) % pool.length];
      tiles += '<a class="tile" href="#ed-' + p.e.id + '" tabindex="-1" data-tile="' + p.e.idx + ':' + p.i + '" style="' + colorVars(p.e.accent) + '">' +
        '<img src="' + thumb(p.e, p.i) + '" alt="" loading="lazy" decoding="async" width="560" height="350"/>' +
        '<span class="tile-tag"><b>' + esc(p.e.greek) + '</b><small>' + esc(p.e.latin) + '</small></span></a>';
    }
    // la colonne est dupliquée pour une boucle sans couture
    wall += '<div class="wall-col" style="--dur:' + (46 + c * 9) + 's;--dir:' + (c % 2 ? 'reverse' : 'normal') + '"><div class="wall-run">' + tiles + tiles + '</div></div>';
  }
  $('ovWall').innerHTML = '<div class="wall-plane" style="--cols:' + COLS + '">' + wall + '</div>';

  $('ovIndex').innerHTML = editors.map(function (e, i) {
    return '<li style="--i:' + i + ';' + colorVars(e.accent) + '"><a href="#ed-' + e.id + '" class="seat' + (e.status === 'ready' ? ' is-live' : '') + '" data-seat="' + i + '">' +
      '<span class="seat-disc" aria-hidden="true">' + initial(e) + '</span>' +
      '<span class="seat-tip"><b>' + esc(e.greek) + '</b><small>' + esc(e.latin) + ' · ' + bi(e.role_fr, e.role_en) + '</small>' +
      '<em>' + (e.status === 'ready' ? bi('♫ démo', '♫ demo') : bi('en répétition', 'in rehearsal')) + '</em></span>' +
      '<span class="sr-only">' + esc(e.latin) + '</span></a></li>';
  }).join('');
  var seats = Array.prototype.slice.call(document.querySelectorAll('#ovIndex .seat'));

  /* « En scène » : une capture au hasard s'illumine toutes les 2,8 s. */
  var tilesEls = Array.prototype.slice.call(document.querySelectorAll('#ovWall .tile'));
  var stageLine = $('ovNow');
  var spotTimer = 0;
  function spotlight() {
    var visible = tilesEls.filter(function (t) {
      var r = t.getBoundingClientRect();
      return r.top > 60 && r.bottom < window.innerHeight - 40 && r.left > 0 && r.right < window.innerWidth;
    });
    if (!visible.length) return;
    var t = visible[Math.floor(Math.random() * visible.length)];
    tilesEls.forEach(function (x) { x.classList.remove('lit'); });
    t.classList.add('lit');
    var parts = t.dataset.tile.split(':');
    var e = editors[+parts[0]];
    seats.forEach(function (x, k) { x.classList.toggle('lit', k === +parts[0]); });
    stageLine.style.setProperty('--c', e.accent);
    stageLine.innerHTML = '<span class="now-note" aria-hidden="true">' + NOTES[Math.floor(Math.random() * 4)] + '</span>' +
      '<span class="now-lbl">' + bi('En scène', 'On stage') + '</span>' +
      '<b>' + esc(e.greek) + '</b><span class="now-cap">' + bi(caption(e, +parts[1], 'fr'), caption(e, +parts[1], 'en')) + '</span>';
  }
  var ovEl = $('top');
  new IntersectionObserver(function (en) {
    var on = en[0].isIntersecting;
    ovEl.classList.toggle('playing', on);
    clearInterval(spotTimer);
    if (on && !reduceMotion) { spotlight(); spotTimer = setInterval(spotlight, 2800); }
  }, { threshold: 0.15 }).observe(ovEl);

  /* ════════════════ Les mouvements : un éditeur par diapositive ════════════════ */
  function greekLetters(word) {
    return Array.from(word).map(function (ch, i) { return '<span class="ch" style="--i:' + i + '">' + esc(ch) + '</span>'; }).join('');
  }

  function slide(e, order) {
    var url = e.href ? 'kantoaplo.com/' + e.href.replace(/\/index\.html$/, '').replace(/\/$/, '') : '';
    var epigraph = slogans[order % (slogans.length - 1)];
    var partners = engineEds.filter(function (x) { return x !== e; }).map(function (x) { return x.latin; }).join(', ');
    var feats = (e.features || []).map(function (f, i) { return '<li style="--i:' + i + '">' + bi(f.fr, f.en) + '</li>'; }).join('');
    var actions = '';
    if (e.status === 'ready') {
      actions += '<a class="btn btn-acc btn-listen" href="' + esc(abs(e.href)) + '" target="_blank" rel="noopener" title="' + esc('Ouvrir la démo interactive de ' + e.latin + ' / Open the ' + e.latin + ' interactive demo') + '">' +
        '<span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span>' +
        '<span class="b-main">' + (e.engine ? bi('Écouter l’instrument ' + engine.name, 'Listen to the ' + engine.name + ' instrument') : bi('Écouter la symphonie', 'Listen to the symphony')) + '</span>' +
        '<span class="demo-tag">' + bi('démo', 'demo') + ' ↗</span></a>';
    }
    if (e.shots) actions += '<button type="button" class="btn btn-line" data-zoom title="' + esc('Voir les captures en plein écran / Full-screen screenshots') + '">' + bi('Lire la partition', 'Read the score') + '<span class="b-tech">' + bi('captures', 'screenshots') + '</span></button>';
    var login = e.login
      ? '<p class="sl-login"><span>' + bi('Connexion de démo', 'Demo sign-in') + '</span><code>' + esc(e.login.user) + '</code><code>' + esc(e.login.password) + '</code></p>'
      : '';
    var engineNote = e.engine && partners
      ? '<a class="sl-engine" href="#engine">⚙ ' + bi('Moteur ' + engine.name + ' · partagé avec ' + partners, engine.name + ' engine · shared with ' + partners) + '</a>'
      : '';

    var stage;
    if (e.shots) {
      var strip = '';
      for (var i = 0; i < e.shots; i++) {
        strip += '<button type="button" data-go="' + i + '" aria-label="' + esc(e.latin) + ' — ' + (i + 1) + '"><img src="' + thumb(e, i) + '" alt="" loading="lazy" decoding="async"/></button>';
      }
      // l'album : toutes les captures sont des cartes ; la courante devant,
      // la précédente inclinée à gauche, la suivante inclinée à droite
      var cards = '';
      for (var j = 0; j < e.shots; j++) {
        cards += '<div class="card" data-i="' + j + '" aria-hidden="true">' +
          '<div class="frame-bar"><i></i><i></i><i></i><span class="frame-url">' + esc(url) + '</span><span class="frame-count"><b>' + pad(j + 1) + '</b> / ' + pad(e.shots) + '</span></div>' +
          '<div class="card-view"><img alt="' + esc(caption(e, j, 'fr')) + '" decoding="async"' + (j < 2 || j === e.shots - 1 ? ' src="' + shot(e, j) + '" loading="lazy"' : ' data-src="' + shot(e, j) + '"') + '/></div>' +
          '<span class="card-hint" aria-hidden="true"></span></div>';
      }
      stage = '<div class="stage">' +
        '<div class="deck" role="group" aria-roledescription="album" aria-label="' + esc(e.latin) + ' — ' + bi('captures', 'screenshots') + '">' + cards +
          '<span class="frame-tick" aria-hidden="true"></span>' +
          (e.shots > 1 ? '<button type="button" class="deck-nav prev" data-step="-1" aria-label="Capture précédente / Previous screenshot"></button><button type="button" class="deck-nav next" data-step="1" aria-label="Capture suivante / Next screenshot"></button>' : '') +
          '<button type="button" class="deck-zoom" data-zoom aria-label="' + esc(e.latin) + ' — plein écran / full screen"></button>' +
        '</div>' +
        '<div class="stage-foot">' +
          '<p class="cap" aria-live="polite">' + bi(caption(e, 0, 'fr'), caption(e, 0, 'en')) + '</p>' +
          (e.shots > 1 ? '<div class="frame-ctrl"><button type="button" data-step="-1" aria-label="Précédente / Previous">←</button><button type="button" data-play aria-label="Lecture / pause"><span class="ic-pause" aria-hidden="true"></span></button><button type="button" data-step="1" aria-label="Suivante / Next">→</button></div>' : '') +
        '</div>' +
        (e.shots > 1 ? '<div class="strip">' + strip + '</div>' : '') +
      '</div>';
    } else {
      // pas encore de captures : une composition autour de la lettre
      stage = '<div class="stage stage-soon" aria-hidden="true">' +
        '<svg class="soon-svg" viewBox="0 0 400 400"><defs><radialGradient id="g-' + e.id + '"><stop offset="0" stop-color="' + e.accent + '" stop-opacity=".35"/><stop offset="1" stop-color="' + e.accent + '" stop-opacity="0"/></radialGradient></defs>' +
          '<circle cx="200" cy="200" r="190" fill="url(#g-' + e.id + ')"/>' +
          '<circle class="orbit o1" cx="200" cy="200" r="150"/><circle class="orbit o2" cx="200" cy="200" r="118"/><circle class="orbit o3" cx="200" cy="200" r="178"/>' +
          '<text class="soon-letter" x="200" y="200" text-anchor="middle" dominant-baseline="central">' + esc(e.greek.charAt(0)) + '</text>' +
          '<g class="orb"><text x="200" y="52">♪</text></g><g class="orb b"><text x="200" y="84">♫</text></g><g class="orb c"><text x="200" y="24">♩</text></g>' +
        '</svg>' +
        '<p class="soon-ver">' + bi('En répétition · bientôt en démo', 'In rehearsal · demo coming soon') + (e.version ? ' · ' + esc(e.version) : '') + '</p></div>';
    }

    return '<article class="page slide' + (order % 2 ? ' rev' : '') + (e.shots ? '' : ' is-soon') + '" id="ed-' + e.id + '" data-idx="' + e.idx + '" style="' + colorVars(e.accent) + '" aria-labelledby="t-' + e.id + '">' +
      '<span class="sl-ghost" aria-hidden="true">' + esc(e.greek.charAt(0)) + '</span>' +
      '<div class="wrap sl-grid">' +
        '<div class="sl-info">' +
          '<p class="sl-num"><span>' + bi('Mouvement', 'Movement') + ' ' + e.num + '</span><span class="sl-of">' + pad(e.idx + 1) + ' / ' + pad(count) + '</span>' + chip(e) + '</p>' +
          '<h3 class="sl-greek" id="t-' + e.id + '" aria-label="' + esc(e.greek + ' — ' + e.latin) + '">' + greekLetters(e.greek) + '</h3>' +
          '<p class="sl-latin"><strong>' + esc(e.latin) + '</strong><span class="sl-role">' + bi(e.role_fr, e.role_en) + '</span></p>' +
          '<p class="sl-meaning">' + bi(e.meaning_fr, e.meaning_en) + '</p>' +
          '<p class="sl-pitch"><mark>' + bi(e.pitch_fr, e.pitch_en) + '</mark></p>' +
          (feats ? '<ul class="sl-feats">' + feats + '</ul>' : '') +
          engineNote +
          (actions ? '<div class="sl-actions">' + actions + '</div>' : '') +
          login +
        '</div>' + stage +
      '</div>' +
      '<p class="sl-epigraph" aria-hidden="false"><span class="ep-note" aria-hidden="true">' + NOTES[order % 4] + '</span>' + bi(epigraph.fr, epigraph.en) + '</p>' +
    '</article>';
  }

  /* Le moteur commun : un instrument, plusieurs éditeurs, ouvert à tout domaine. */
  function engineSection() {
    var branches = engineEds.map(function (e) {
      var use = engine.uses[e.id] || { fr: e.role_fr, en: e.role_en };
      return '<a class="eng-branch" href="#ed-' + e.id + '" style="' + colorVars(e.accent) + '">' +
        '<span class="ov-num">' + e.num + '</span><b>' + esc(e.greek) + '</b>' +
        '<span class="eng-latin">' + esc(e.latin) + '</span><span class="eng-use">' + bi(use.fr, use.en) + '</span></a>';
    }).join('') +
      '<div class="eng-branch open"><span class="ov-num">+</span><b>' + bi(engine.open_fr, engine.open_en) + '</b>' +
      '<span class="eng-use">' + bi(engine.open_text_fr, engine.open_text_en) + '</span></div>';
    var n = engineEds.length + 1, wires = '';
    for (var i = 0; i < n; i++) {
      var x = (i + 0.5) * 300 / n;
      var d = 'M150 0 C150 34 ' + x.toFixed(1) + ' 26 ' + x.toFixed(1) + ' 60';
      wires += '<path class="w" d="' + d + '" pathLength="1"' + (i === n - 1 ? ' stroke-dasharray=".02 .03"' : '') + '/>' +
        (i < n - 1 ? '<path class="p" d="' + d + '" pathLength="1" style="animation-delay:' + (i * 0.6) + 's"/>' : '');
    }
    return '<section class="page slide engine" id="engine" style="' + colorVars(engine.accent) + '" aria-labelledby="engineTitle">' +
      '<div class="wrap">' +
        '<header class="section-head">' +
          '<p class="eyebrow">' + bi(engine.eyebrow_fr, engine.eyebrow_en) + '</p>' +
          '<h2 id="engineTitle">' + bi(engine.title_fr, engine.title_en) + '</h2>' +
          '<p class="lead">' + bi(engine.tagline_fr, engine.tagline_en) + '</p></header>' +
        '<div class="eng-map">' +
          '<div class="eng-core"><span class="eng-ring" aria-hidden="true"></span>' +
            '<span class="eng-name">' + esc(engine.name) + '</span>' +
            '<span class="eng-sub">' + bi('blocs · nœuds · workflows', 'blocks · nodes · workflows') + '</span></div>' +
          '<svg class="eng-wires" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">' + wires + '</svg>' +
          '<div class="eng-branches" style="--n:' + n + '">' + branches + '</div>' +
        '</div>' +
        '<div class="eng-foot">' +
          '<p class="eng-text">' + bi(engine.text_fr, engine.text_en) + '</p>' +
          '<ul class="eng-feats">' + engine.features.map(function (f) { return '<li>' + bi(f.fr, f.en) + '</li>'; }).join('') + '</ul>' +
          '<a class="btn btn-acc btn-listen" href="' + esc(abs(engine.href)) + '" target="_blank" rel="noopener"><span class="eq" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="b-main">' + bi('Écouter l’instrument ' + engine.name, 'Listen to the ' + engine.name + ' instrument') + '</span><span class="demo-tag">' + bi('démo', 'demo') + ' ↗</span></a>' +
        '</div>' +
      '</div></section>';
  }

  var html = '';
  editors.forEach(function (e, i) {
    if (engineEds.length > 1 && e === engineEds[1]) html += engineSection();
    html += slide(e, i);
  });
  $('movementsBody').innerHTML = html;
  var seoStatic = $('seoEditors');
  if (seoStatic) seoStatic.remove();
  var last = slogans[slogans.length - 1];
  if (last) $('finale').innerHTML = bi(last.fr, last.en);

  /* ════════════════ Autres projets Cephalo Sophie ════════════════ */
  $('projectsList').innerHTML = (DATA.projects || []).map(function (pr) {
    pr.dir = 'assets/projects/';
    var shots = '';
    for (var i = 0; i < pr.shots; i++) shots += '<img src="' + thumb(pr, i) + '" alt="" loading="lazy" decoding="async" style="--i:' + i + '"/>';
    return '<a class="proj" href="' + esc(pr.href) + '" target="_blank" rel="noopener" data-anim style="' + colorVars(pr.accent) + '">' +
      '<div class="proj-media" aria-hidden="true">' + shots + '</div>' +
      '<div class="proj-body">' +
        '<p class="proj-greek">' + esc(pr.greek) + ' <em>' + bi(pr.meaning_fr, pr.meaning_en) + '</em></p>' +
        '<h3>' + esc(pr.latin) + '</h3>' +
        '<p class="proj-tag">' + bi(pr.tagline_fr, pr.tagline_en) + '</p>' +
        '<p class="proj-pitch">' + bi(pr.pitch_fr, pr.pitch_en) + '</p>' +
        '<ul class="proj-tags">' + (pr.tags || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<span class="proj-link">' + esc(pr.label) + ' <span aria-hidden="true">↗</span></span>' +
      '</div></a>';
  }).join('');

  /* ════════════════ Menu, portée latérale, pastille mobile ════════════════ */
  $('menuList').innerHTML = editors.map(function (e, i) {
    return '<li style="--i:' + i + '"><a href="#ed-' + e.id + '" data-idx="' + i + '" style="--c:' + e.accent + '">' +
      '<span class="mi-num">' + e.num + '</span><span class="mi-greek">' + esc(e.greek) + '</span><span class="mi-dot"></span>' +
      '<span class="mi-sub">' + esc(e.latin) + ' · ' + bi(e.role_fr, e.role_en) + (e.status === 'ready' ? ' <em class="mi-demo">♫ ' + bi('démo', 'demo') + '</em>' : ' <em class="mi-reh">' + bi('en répétition', 'in rehearsal') + '</em>') + '</span></a></li>';
  }).join('');


  /* ════════════════ Bandeau clients ════════════════ */
  var clientsHTML = DATA.clients.map(function (c, i) {
    return '<span class="cl">' + esc(c) + '</span><span class="cl-note" aria-hidden="true">' + NOTES[i % NOTES.length] + '</span>';
  }).join('');
  $('trustTrack').innerHTML = clientsHTML + '<span class="dup" aria-hidden="true" style="display:contents">' + clientsHTML + '</span>';

  /* ════════════════ Apparitions au défilement ════════════════ */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      revealIO.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
  document.querySelectorAll('[data-reveal]').forEach(function (el) {
    if (reduceMotion) el.classList.add('in'); else revealIO.observe(el);
  });

  /* ════════════════ Les pages ════════════════
     Tout le site est une présentation : chaque section est une page plein écran
     (aimantation CSS sur grand écran). La page qui occupe le centre de l'écran est
     « active » : son contenu entre en scène, les pages d'avant sortent par le haut.
     Le halo prend sa couleur, la navigation (en-tête, portée latérale, numéro de
     page) suit. */
  var auraLayers = [$('auraA'), $('auraB')];
  var auraCur = 0;
  var pages = Array.prototype.slice.call(document.querySelectorAll('.page'));
  var slides = pages;
  var score = $('score'), np = $('np'), npName = $('npName');
  var GOLD = '#C9963A';

  function pageInfo(el) {
    if (el.dataset.idx != null) {
      var e = editors[+el.dataset.idx];
      return { key: 'editors', accent: e.accent, glyph: initial(e), fr: e.greek, en: e.greek, subFr: e.num + ' · ' + e.latin + ' · ' + e.role_fr, subEn: e.num + ' · ' + e.latin + ' · ' + e.role_en, editor: e };
    }
    if (el.id === 'engine') return { key: 'editors', accent: engine.accent, glyph: '⚙', fr: engine.name, en: engine.name, subFr: "l'instrument commun", subEn: 'the shared instrument' };
    var key = { top: 'home', solfege: 'solfege', faq: 'faq', orchestra: 'team', contact: 'contact' }[el.id] || '';
    return { key: key, accent: el.dataset.navColor || GOLD, glyph: el.dataset.navGlyph || '♪', fr: el.dataset.navFr, en: el.dataset.navEn, subFr: el.dataset.navSubFr, subEn: el.dataset.navSubEn };
  }
  var infos = pages.map(pageInfo);

  /* Portée latérale : un disque par page */
  $('scoreList').innerHTML = pages.map(function (el, i) {
    var p = infos[i];
    return '<li style="--i:' + i + '"><a href="#' + el.id + '" data-page="' + i + '" class="' + (p.editor ? 'is-ed' : 'is-sec') + '" style="' + colorVars(p.accent) + '" aria-label="' + esc((p.fr || '') + ' — ' + (p.subFr || '')) + '">' +
      '<span class="sc-lbl"><b>' + bi(p.fr || '', p.en || '') + '</b><small>' + bi(p.subFr || '', p.subEn || '') + '</small></span>' +
      '<span class="sc-disc"><span>' + esc(p.glyph) + '</span></span></a></li>';
  }).join('');
  var scoreLinks = Array.prototype.slice.call(document.querySelectorAll('#scoreList a'));
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll('#menuList a'));

  /* Numéro de page, comme une diapositive */
  var pageNo = document.createElement('div');
  pageNo.className = 'page-no';
  pageNo.setAttribute('aria-hidden', 'true');
  document.body.appendChild(pageNo);

  /* En-tête : la tête de lecture glisse sous la rubrique en cours */
  var hdrNav = $('hdrNav'), ink = hdrNav.querySelector('.hn-ink');
  var navLinks = Array.prototype.slice.call(hdrNav.querySelectorAll('a[data-key]'));
  function placeInk(key) {
    var a = navLinks.filter(function (l) { return l.dataset.key === key; })[0];
    navLinks.forEach(function (l) { l.classList.toggle('on', l === a); });
    if (!a) { ink.classList.remove('show'); return; }
    ink.style.width = a.offsetWidth + 'px';
    ink.style.transform = 'translateX(' + a.offsetLeft + 'px)';
    ink.classList.add('show');
  }
  window.addEventListener('resize', function () { if (current) placeInk(infos[pages.indexOf(current)].key); });
  document.getElementById('langToggle').addEventListener('click', function () { setTimeout(function () { if (current) placeInk(infos[pages.indexOf(current)].key); }, 30); });

  function setAura(hex) {
    var next = auraLayers[1 - auraCur];
    next.style.setProperty('--c1', hex ? rgba(hex, 0.16) : 'rgba(201,150,58,.06)');
    next.style.setProperty('--c2', hex ? rgba(hex, 0.09) : 'transparent');
    auraLayers[auraCur].classList.remove('on');
    next.classList.add('on');
    auraCur = 1 - auraCur;
  }

  var current = null;
  function activate(el) {
    if (!el || el === current) return;
    current = el;
    var pos = pages.indexOf(el), p = infos[pos];
    el.classList.add('in');
    pages.forEach(function (s, i) {
      s.classList.toggle('is-active', i === pos);
      s.classList.toggle('is-past', i < pos);
    });
    root.dataset.page = el.id;
    setAura(p.accent);
    root.style.setProperty('--acc', p.accent);
    root.style.setProperty('--acc-soft', rgba(p.accent, 0.16));
    root.style.setProperty('--acc-line', rgba(p.accent, 0.38));
    score.classList.add('show');
    score.style.setProperty('--p', (pos / (pages.length - 1)).toFixed(4));
    score.style.setProperty('--acc', p.accent);
    scoreLinks.forEach(function (a, i) { a.classList.toggle('on', i === pos); a.classList.toggle('near', Math.abs(i - pos) === 1); });
    menuLinks.forEach(function (a, i) { a.classList.toggle('on', !!p.editor && i === p.editor.idx); });
    np.classList.toggle('show', pos > 0);
    npName.innerHTML = '<span><span class="n">' + pad(pos + 1) + '</span><span class="g">' + bi(p.fr || '', p.en || '') + '</span></span>';
    $('npPrev').disabled = pos <= 0;
    $('npNext').disabled = pos >= pages.length - 1;
    pageNo.innerHTML = '<b>' + pad(pos + 1) + '</b><i></i>' + pad(pages.length) + '<span>' + bi(p.fr || '', p.en || '') + '</span>';
    pageNo.style.setProperty('--c', p.accent);
    placeInk(p.key);
    galleries.forEach(function (g) { if (g.el === el) g.play(); else { g.stop(); clearTimeout(g.resume); } });
  }

  var visiblePages = new Set();
  var activeIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) visiblePages.add(en.target); else visiblePages.delete(en.target); });
    var el = null;
    pages.forEach(function (s) { if (visiblePages.has(s)) el = s; });
    if (el) activate(el);
  }, { rootMargin: '-48% 0px -48% 0px' });
  pages.forEach(function (s) { activeIO.observe(s); });
  setAura(null);

  function goPage(d) {
    var pos = Math.max(0, pages.indexOf(current));
    var t = pages[Math.max(0, Math.min(pages.length - 1, pos + d))];
    if (t) t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  var goSlide = goPage;

  /* Les liens internes mènent toujours au début d'une page entière. */
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('a[href^="#"]');
    if (!a || ev.defaultPrevented || ev.ctrlKey || ev.metaKey) return;
    var id = a.getAttribute('href').slice(1);
    var t = id && document.getElementById(id);
    var pg = t && (t.classList.contains('page') ? t : t.closest('.page') || (t.querySelector && t.querySelector('.page')));
    if (!pg) return;
    ev.preventDefault();
    pg.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    try { history.replaceState(null, '', '#' + pg.id); } catch (e) { /* file:// */ }
  });

  /* Molette et pavé tactile : un geste = une page, jamais d'arrêt au milieu.
     Un verrou couvre l'animation ; l'inertie du pavé tactile le prolonge
     au lieu de déclencher une deuxième page. */
  var pagesMQ = window.matchMedia('(min-width: 980px) and (min-height: 620px)');
  var wheelLock = 0, wheelAcc = 0, wheelQuiet = 0;
  window.addEventListener('wheel', function (ev) {
    if (!pagesMQ.matches || ev.ctrlKey || !lb.hidden || !menu.hidden) return;
    if (Math.abs(ev.deltaX) > Math.abs(ev.deltaY)) return;
    if (ev.target.closest && ev.target.closest('.strip')) return;
    ev.preventDefault();
    var now = Date.now();
    if (now < wheelLock) { wheelLock = Math.max(wheelLock, now + 220); return; }
    clearTimeout(wheelQuiet);
    wheelQuiet = setTimeout(function () { wheelAcc = 0; }, 200);
    wheelAcc += ev.deltaMode === 1 ? ev.deltaY * 30 : ev.deltaY;
    if (Math.abs(wheelAcc) < 28) return;
    var d = wheelAcc > 0 ? 1 : -1;
    wheelAcc = 0;
    wheelLock = now + 900;
    goPage(d);
  }, { passive: false });
  $('npPrev').addEventListener('click', function () { goPage(-1); });
  $('npNext').addEventListener('click', function () { goPage(1); });
  document.addEventListener('keydown', function (ev) {
    if (!current || !lb.hidden || !menu.hidden || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    var tag = ((document.activeElement || {}).tagName || '');
    if (/input|textarea|select/i.test(tag)) return;
    if (ev.key === 'ArrowDown' || ev.key === 'PageDown' || (ev.key === ' ' && !/button|summary|a/i.test(tag))) { ev.preventDefault(); goPage(ev.shiftKey && ev.key === ' ' ? -1 : 1); }
    else if (ev.key === 'ArrowUp' || ev.key === 'PageUp') { ev.preventDefault(); goPage(-1); }
    else if (ev.key === 'Home') { ev.preventDefault(); pages[0].scrollIntoView({ behavior: 'smooth' }); }
    else if (ev.key === 'End') { ev.preventDefault(); pages[pages.length - 1].scrollIntoView({ behavior: 'smooth' }); }
    else if (ev.key === 'ArrowRight') { var g = galleryOf(current); if (g) { g.user(); g.go(g.pos + 1); } }
    else if (ev.key === 'ArrowLeft') { var h = galleryOf(current); if (h) { h.user(); h.go(h.pos - 1); } }
  });

  /* En-tête opaque dès qu'on quitte le haut de l'ouverture */
  var hdr = $('hdr');
  var sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;height:80px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(function (en) { hdr.classList.toggle('solid', !en[0].isIntersecting); }).observe(sentinel);

  /* ════════════════ Galeries ════════════════ */
  /* L'album d'un éditeur : chaque capture est une carte. Une classe de position
     (courante, précédente, suivante, lointaine) place chaque carte ; le CSS anime
     le passage d'une position à l'autre. Lecture automatique tant que la
     diapositive est à l'écran ; elle s'interrompt au survol de l'album et
     reprend quelques secondes après une action du visiteur. */
  var RESUME_MS = 9000;
  function Gallery(el, e) {
    this.el = el; this.e = e; this.n = e.shots; this.pos = 0; this.timer = 0; this.resume = 0;
    this.hover = false; this.paused = false;
    this.deck = el.querySelector('.deck');
    this.cards = Array.prototype.slice.call(el.querySelectorAll('.card'));
    this.cap = el.querySelector('.cap');
    this.thumbs = el.querySelectorAll('.strip button');
    this.strip = el.querySelector('.strip');
    this.tick = el.querySelector('.frame-tick');
    this.playBtn = el.querySelector('[data-play]');
    var self = this;
    el.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-step],[data-go],[data-zoom],[data-play],.card');
      if (!t) return;
      if (t.hasAttribute('data-play')) { self.paused = !self.paused; self.paused ? self.stop() : self.play(); self.syncPlay(); return; }
      if (t.hasAttribute('data-zoom')) return openLightbox(self.e, self.pos);
      var target = t.hasAttribute('data-step') ? self.pos + Number(t.dataset.step)
        : t.hasAttribute('data-go') ? Number(t.dataset.go) : Number(t.dataset.i);
      if (t.classList.contains('card') && target === self.pos) return openLightbox(self.e, self.pos);
      self.user();
      self.go(target);
    });
    this.deck.addEventListener('pointerenter', function () { self.hover = true; self.stop(); });
    this.deck.addEventListener('pointerleave', function () { self.hover = false; if (self.el === current) self.play(); });
    var sx = 0, sy = 0;
    this.deck.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; sy = ev.touches[0].clientY; }, { passive: true });
    this.deck.addEventListener('touchend', function (ev) {
      var dx = ev.changedTouches[0].clientX - sx, dy = ev.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { self.user(); self.go(self.pos + (dx < 0 ? 1 : -1)); }
    }, { passive: true });
    // le format de l'album suit celui des captures de l'éditeur
    var first = this.cards[0].querySelector('img');
    var fit = function () { if (first.naturalWidth) self.deck.style.setProperty('--ar', first.naturalWidth + ' / ' + (first.naturalHeight + 30)); };
    if (first.complete) fit(); else first.addEventListener('load', fit, { once: true });
    this.place();
    this.updateUI();
  }
  Gallery.prototype.offset = function (i) {
    var n = this.n, d = ((i - this.pos) % n + n) % n;
    if (d > n / 2) d -= n;
    if (n === 2 && d === -1) d = 1;
    return d;
  };
  Gallery.prototype.place = function () {
    var self = this;
    this.cards.forEach(function (c, i) {
      var d = self.offset(i);
      c.className = 'card ' + (d === 0 ? 'is-cur' : d === -1 ? 'is-prev' : d === 1 ? 'is-next' : d < 0 ? 'is-far-l' : 'is-far-r');
      c.dataset.hint = d === -1 ? '‹' : d === 1 ? '›' : '';
      if (Math.abs(d) <= 2) {
        var img = c.querySelector('img');
        if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
      }
    });
  };
  Gallery.prototype.go = function (i) {
    i = ((i % this.n) + this.n) % this.n;
    if (i === this.pos) return;
    this.pos = i;
    this.place();
    this.updateUI();
    if (this.timer) this.runTick();
  };
  Gallery.prototype.updateUI = function () {
    var p = this.pos, self = this, e = this.e;
    if (this.cap) {
      this.cap.classList.remove('swap');
      void this.cap.offsetWidth;
      this.cap.innerHTML = bi(caption(e, p, 'fr'), caption(e, p, 'en'));
      this.cap.classList.add('swap');
    }
    Array.prototype.forEach.call(this.thumbs, function (b, j) {
      var on = j === p;
      b.classList.toggle('on', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
      if (on && self.strip && self.el.classList.contains('is-active')) {
        var left = b.offsetLeft - (self.strip.clientWidth - b.offsetWidth) / 2;
        self.strip.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  };
  /* une action du visiteur : pause, puis reprise après RESUME_MS */
  Gallery.prototype.user = function () {
    var self = this;
    this.stop();
    clearTimeout(this.resume);
    this.resume = setTimeout(function () { if (self.el === current && !self.hover) self.play(); }, RESUME_MS);
  };
  Gallery.prototype.play = function () {
    if (reduceMotion || this.n < 2 || this.timer || this.paused || this.hover || document.hidden) return;
    var self = this;
    this.runTick();
    this.timer = setInterval(function () { self.go(self.pos + 1); }, AUTOPLAY_MS);
    this.syncPlay();
  };
  Gallery.prototype.runTick = function () {
    if (!this.tick) return;
    this.tick.style.setProperty('--dur', AUTOPLAY_MS + 'ms');
    this.tick.classList.remove('run');
    void this.tick.offsetWidth;
    this.tick.classList.add('run');
  };
  Gallery.prototype.stop = function () {
    clearInterval(this.timer); this.timer = 0;
    if (this.tick) this.tick.classList.remove('run');
    this.syncPlay();
  };
  Gallery.prototype.syncPlay = function () {
    if (!this.playBtn) return;
    this.playBtn.classList.toggle('is-paused', this.paused);
  };

  var galleries = [];
  document.querySelectorAll('.slide[data-idx]').forEach(function (el) {
    var e = editors[Number(el.dataset.idx)];
    if (e.shots) galleries.push(new Gallery(el, e));
  });
  function galleryOf(el) { for (var i = 0; i < galleries.length; i++) if (galleries[i].el === el) return galleries[i]; return null; }
  document.addEventListener('visibilitychange', function () {
    galleries.forEach(function (g) { if (document.hidden) g.stop(); else if (g.el === current) g.play(); });
  });

  /* ════════════════ Couches modales (menu, visionneuse) ════════════════ */
  var lastFocus = null;
  function showLayer(el) {
    lastFocus = document.activeElement;
    el.hidden = false;
    document.body.classList.add('locked');
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('open'); }); });
  }
  function hideLayer(el, done) {
    el.classList.remove('open');
    var finish = function () { el.hidden = true; if (done) done(); };
    if (reduceMotion) finish(); else setTimeout(finish, 650);
    if (!document.querySelector('.menu.open, .lb.open')) document.body.classList.remove('locked');
  }
  function trapFocus(el, ev) {
    if (ev.key !== 'Tab') return;
    var f = el.querySelectorAll('a[href], button:not([disabled])');
    if (!f.length) return;
    var first = f[0], lastEl = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === first) { ev.preventDefault(); lastEl.focus(); }
    else if (!ev.shiftKey && document.activeElement === lastEl) { ev.preventDefault(); first.focus(); }
  }

  /* Menu */
  var menu = $('menu'), menuBtn = $('menuBtn');
  function openMenu() {
    var r = menuBtn.getBoundingClientRect();
    menu.style.setProperty('--mx', (r.left + r.width / 2) + 'px');
    menu.style.setProperty('--my', (r.top + r.height / 2) + 'px');
    showLayer(menu);
    root.classList.add('menu-open');
    menuBtn.setAttribute('aria-expanded', 'true');
    var on = menu.querySelector('.menu-list a.on') || menu.querySelector('.menu-list a');
    setTimeout(function () { on.focus({ preventScroll: true }); }, 60);
  }
  function closeMenu(restoreFocus) {
    if (menu.hidden) return;
    root.classList.remove('menu-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    hideLayer(menu);
    if (restoreFocus !== false) menuBtn.focus({ preventScroll: true });
  }
  menuBtn.addEventListener('click', function () { if (menu.hidden) openMenu(); else closeMenu(); });
  npName.addEventListener('click', openMenu);
  menu.addEventListener('click', function (ev) { if (ev.target.closest('a')) closeMenu(false); });
  menu.addEventListener('keydown', function (ev) { trapFocus(menu, ev); });

  /* Visionneuse */
  var lb = $('lb'), lbImg = $('lbImg'), lbState = { e: null, i: 0 };
  function lbRender(animate) {
    var e = lbState.e, i = lbState.i;
    var apply = function () {
      lbImg.src = shot(e, i);
      lbImg.alt = caption(e, i, lang());
      $('lbCount').textContent = pad(i + 1) + ' / ' + pad(e.shots);
      $('lbCap').innerHTML = bi(caption(e, i, 'fr'), caption(e, i, 'en'));
      var done = function () { lbImg.classList.remove('swap'); };
      if (lbImg.decode) lbImg.decode().then(done, done); else done();
    };
    $('lbTitle').textContent = e.greek + ' · ' + e.latin;
    lb.style.setProperty('--acc', e.accent);
    lb.style.setProperty('--acc-soft', rgba(e.accent, 0.18));
    var multi = e.shots > 1;
    $('lbPrev').hidden = !multi; $('lbNext').hidden = !multi;
    if (animate && !reduceMotion) { lbImg.classList.add('swap'); setTimeout(apply, 160); } else apply();
  }
  function openLightbox(e, i) {
    lbState.e = e; lbState.i = i;
    lbRender(false);
    showLayer(lb);
    galleries.forEach(function (g) { g.stop(); });
    setTimeout(function () { $('lbClose').focus({ preventScroll: true }); }, 60);
  }
  function lbStep(d) {
    var n = lbState.e.shots;
    if (n < 2) return;
    lbState.i = (lbState.i + d + n) % n;
    lbRender(true);
    var g = galleryOf(current);
    if (g && g.e === lbState.e) g.go(lbState.i);
  }
  function closeLightbox() {
    if (lb.hidden) return;
    hideLayer(lb);
    if (lastFocus) lastFocus.focus({ preventScroll: true });
    galleries.forEach(function (g) { if (g.el === current) g.play(); });
  }
  $('lbClose').addEventListener('click', closeLightbox);
  $('lbPrev').addEventListener('click', function () { lbStep(-1); });
  $('lbNext').addEventListener('click', function () { lbStep(1); });
  $('lbStage').addEventListener('click', function (ev) { if (ev.target === ev.currentTarget) closeLightbox(); });
  lb.addEventListener('keydown', function (ev) { trapFocus(lb, ev); });
  var lsx = 0;
  $('lbStage').addEventListener('touchstart', function (ev) { lsx = ev.touches[0].clientX; }, { passive: true });
  $('lbStage').addEventListener('touchend', function (ev) {
    var dx = ev.changedTouches[0].clientX - lsx;
    if (Math.abs(dx) > 50) lbStep(dx < 0 ? 1 : -1);
  }, { passive: true });

  document.addEventListener('keydown', function (ev) {
    if (!lb.hidden) {
      if (ev.key === 'Escape') closeLightbox();
      else if (ev.key === 'ArrowRight') lbStep(1);
      else if (ev.key === 'ArrowLeft') lbStep(-1);
      return;
    }
    if (!menu.hidden && ev.key === 'Escape') closeMenu();
  });

  /* ════════════════ Langue ════════════════ */
  $('langToggle').addEventListener('click', function () {
    var next = lang() === 'fr' ? 'en' : 'fr';
    root.dataset.lang = next;
    root.lang = next;
    try { localStorage.setItem('kanto-lang', next); } catch (e) { /* stockage indisponible : sans conséquence */ }
  });
})();
