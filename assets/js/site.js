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
  function base(e) { return (e.dir || 'assets/editors/') + e.id + '/'; }
  function shot(e, i) { return base(e) + pad(i + 1) + '.webp'; }
  function thumb(e, i) { return base(e) + 'thumbs/' + pad(i + 1) + '.webp'; }
  function caption(e, i, l) {
    var list = e['captions_' + l];
    return list && list[i] ? list[i] : (e.latin + ' — ' + (i + 1));
  }
  function lang() { return root.dataset.lang; }
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
  $('avatarStaff1').innerHTML = buildStaff('AMEUR', 'HAMDOUNI', 22);
  $('avatarStaff2').innerHTML = buildStaff('ABDELHAMID', 'SGHAIER', 22);

  /* ════════════════ Nombre d'éditeurs, partout où il est écrit ════════════════ */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var word = el.hasAttribute('data-en') ? NUM_EN[count] : NUM_FR[count];
    el.textContent = el.dataset.count === 'lower' ? word.toLowerCase() : word;
  });

  /* ════════════════ Ouverture : chiffres clés ════════════════ */
  var live = editors.filter(function (e) { return e.status === 'ready'; }).length;
  $('stats').innerHTML = [
    [count, 'éditeurs', 'editors'],
    [live, 'démos en ligne', 'live demos'],
    [0, 'ligne de code', 'lines of code']
  ].map(function (s) { return '<li><b>' + s[0] + '</b>' + bi(s[1], s[2]) + '</li>'; }).join('');

  function chip(e) {
    if (e.status === 'ready') return '<span class="chip ready"><i></i>' + bi('Démo live', 'Live demo') + '</span>';
    return '<span class="chip pending"><i></i>' + bi('En composition', 'In composition') + (e.version ? ' · ' + esc(e.version) : '') + '</span>';
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
    return '<li style="--i:' + i + ';' + colorVars(e.accent) + '"><a href="#ed-' + e.id + '" class="inst' + (e.status === 'ready' ? ' is-live' : '') + '">' +
      '<span class="inst-disc" aria-hidden="true">' + initial(e) + '</span>' +
      '<span class="inst-txt"><b>' + esc(e.greek) + '</b><small>' + esc(e.latin) + ' · ' + bi(e.role_fr, e.role_en) + '</small></span>' +
      '<span class="inst-state" title="' + (e.status === 'ready' ? 'Démo live' : 'En composition') + '"></span></a></li>';
  }).join('');

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
    stageLine.style.setProperty('--c', e.accent);
    stageLine.innerHTML = '<span class="now-note" aria-hidden="true">' + NOTES[Math.floor(Math.random() * 4)] + '</span>' +
      '<span class="now-lbl">' + bi('En scène', 'On stage') + '</span>' +
      '<b>' + esc(e.greek) + '</b><span class="now-cap">' + bi(caption(e, +parts[1], 'fr'), caption(e, +parts[1], 'en')) + '</span>';
  }
  var ovEl = $('partition');
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
      actions += '<a class="btn btn-acc" href="' + esc(e.href) + '" target="_blank" rel="noopener">' +
        (e.engine ? bi('Démo du moteur ' + engine.name, engine.name + ' engine demo') : bi('Ouvrir la démo', 'Open the demo')) + ' <span aria-hidden="true">↗</span></a>';
    }
    if (e.shots) actions += '<button type="button" class="btn btn-line" data-zoom>' + bi('Plein écran', 'Full screen') + '</button>';
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
      stage = '<div class="stage">' +
        '<div class="stack" aria-hidden="true"><img alt="" loading="lazy" decoding="async" src="' + thumb(e, e.shots > 1 ? 1 : 0) + '"/></div>' +
        '<figure class="frame">' +
          '<div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span class="frame-url">' + esc(url) + '</span><span class="frame-count"><b>01</b> / ' + pad(e.shots) + '</span></div>' +
          '<button type="button" class="frame-view" data-zoom aria-label="' + esc(e.latin) + ' — agrandir / enlarge">' +
            '<img class="on" src="' + shot(e, 0) + '" alt="' + esc(caption(e, 0, 'fr')) + '" loading="lazy" decoding="async"/><img alt="" decoding="async"/>' +
          '</button>' +
          '<span class="frame-tick" aria-hidden="true"></span>' +
        '</figure>' +
        '<div class="stage-foot">' +
          '<p class="cap" aria-live="polite">' + bi(caption(e, 0, 'fr'), caption(e, 0, 'en')) + '</p>' +
          (e.shots > 1 ? '<div class="frame-ctrl"><button type="button" data-step="-1" aria-label="Précédente / Previous">←</button><button type="button" data-step="1" aria-label="Suivante / Next">→</button></div>' : '') +
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
        '<p class="soon-ver">' + bi('En composition', 'In composition') + (e.version ? ' · ' + esc(e.version) : '') + '</p></div>';
    }

    return '<article class="slide' + (order % 2 ? ' rev' : '') + (e.shots ? '' : ' is-soon') + '" id="ed-' + e.id + '" data-idx="' + e.idx + '" style="' + colorVars(e.accent) + '" aria-labelledby="t-' + e.id + '">' +
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
    return '<section class="slide engine" id="engine" style="' + colorVars(engine.accent) + '" aria-labelledby="engineTitle">' +
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
          '<a class="btn btn-acc" href="' + esc(engine.href) + '" target="_blank" rel="noopener">' + bi('Essayer le moteur ' + engine.name, 'Try the ' + engine.name + ' engine') + ' <span aria-hidden="true">↗</span></a>' +
        '</div>' +
      '</div></section>';
  }

  var html = '';
  editors.forEach(function (e, i) {
    if (engineEds.length > 1 && e === engineEds[1]) html += engineSection();
    html += slide(e, i);
  });
  $('movementsBody').innerHTML = html;
  var last = slogans[slogans.length - 1];
  if (last) $('finale').innerHTML = bi(last.fr, last.en);

  /* ════════════════ Autres projets Cephalo Sophie ════════════════ */
  $('projectsList').innerHTML = (DATA.projects || []).map(function (pr) {
    pr.dir = 'assets/projects/';
    var shots = '';
    for (var i = 0; i < pr.shots; i++) shots += '<img src="' + thumb(pr, i) + '" alt="" loading="lazy" decoding="async" style="--i:' + i + '"/>';
    return '<a class="proj" href="' + esc(pr.href) + '" target="_blank" rel="noopener" data-reveal style="' + colorVars(pr.accent) + '">' +
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
      '<span class="mi-sub">' + esc(e.latin) + ' · ' + bi(e.role_fr, e.role_en) + '</span></a></li>';
  }).join('');
  if (engineEds.length > 1) $('menuFoot').insertAdjacentHTML('afterbegin', '<a href="#engine">' + bi('Le moteur ' + engine.name, 'The ' + engine.name + ' engine') + '</a>');

  $('scoreList').innerHTML = editors.map(function (e, i) {
    return '<li style="--i:' + i + '"><a href="#ed-' + e.id + '" data-idx="' + i + '" style="' + colorVars(e.accent) + '" aria-label="' + esc(e.latin + ' — ' + e.greek) + '">' +
      '<span class="sc-lbl"><b>' + esc(e.greek) + '</b><small>' + e.num + ' · ' + esc(e.latin) + '</small></span>' +
      '<span class="sc-disc"><span>' + initial(e) + '</span></span></a></li>';
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

  /* ════════════════ Diapositive en cours ════════════════
     La diapositive qui occupe le centre de l'écran devient « active » : son
     contenu entre en scène, celles d'avant sortent par le haut, celles d'après
     attendent en bas. Le halo d'ambiance prend sa couleur, la portée se met à jour.
     Dans la zone des éditeurs, le défilement s'aimante d'une diapositive à l'autre. */
  var auraLayers = [$('auraA'), $('auraB')];
  var auraCur = 0;
  var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'));
  var scoreLinks = Array.prototype.slice.call(document.querySelectorAll('#scoreList a'));
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll('#menuList a'));
  var score = $('score'), np = $('np'), npName = $('npName');

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
    if (el === current) return;
    current = el;
    var pos = slides.indexOf(el);
    if (el) el.classList.add('in');
    slides.forEach(function (s, i) {
      s.classList.toggle('is-active', i === pos);
      s.classList.toggle('is-past', pos >= 0 && i < pos);
    });
    var show = !!el;
    score.classList.toggle('show', show);
    np.classList.toggle('show', show);
    if (!el) { setAura(null); ['--acc', '--acc-soft', '--acc-line'].forEach(function (v) { root.style.removeProperty(v); }); return; }
    var isEngine = el.id === 'engine';
    var e = isEngine ? null : editors[+el.dataset.idx];
    var accent = isEngine ? engine.accent : e.accent;
    setAura(accent);
    root.style.setProperty('--acc', accent);
    root.style.setProperty('--acc-soft', rgba(accent, 0.16));
    root.style.setProperty('--acc-line', rgba(accent, 0.38));
    var idx = isEngine ? engineEds[0].idx + 0.5 : e.idx;
    score.style.setProperty('--p', (idx / (count - 1)).toFixed(4));
    score.style.setProperty('--acc', accent);
    scoreLinks.forEach(function (a, i) { a.classList.toggle('on', !isEngine && i === e.idx); a.classList.toggle('near', !isEngine && Math.abs(i - e.idx) === 1); });
    menuLinks.forEach(function (a, i) { a.classList.toggle('on', !isEngine && i === e.idx); });
    npName.innerHTML = '<span><span class="n">' + (isEngine ? '⚙' : e.num) + '</span><span class="g">' + esc(isEngine ? engine.name : e.greek) + '</span></span>';
    $('npPrev').disabled = pos <= 0;
    $('npNext').disabled = pos >= slides.length - 1;
    galleries.forEach(function (g) { if (g.el === el) g.play(); else g.stop(false); });
  }

  var movementsEl = $('movements');
  var inMovements = false;
  var visibleSlides = new Set();
  var activeIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.target === movementsEl) { inMovements = en.isIntersecting; return; }
      if (en.isIntersecting) visibleSlides.add(en.target); else visibleSlides.delete(en.target);
    });
    if (!inMovements) return activate(null);
    var el = null;
    slides.forEach(function (s) { if (visibleSlides.has(s)) el = s; });
    if (el) activate(el);
  }, { rootMargin: '-46% 0px -46% 0px' });
  activeIO.observe(movementsEl);
  slides.forEach(function (s) { activeIO.observe(s); });
  setAura(null);

  /* Aimantation : seulement sur grand écran, et seulement entre les diapositives. */
  var snapMQ = window.matchMedia('(min-width: 980px) and (min-height: 620px)');
  new IntersectionObserver(function (en) {
    root.classList.toggle('snap', en[0].isIntersecting && snapMQ.matches && !reduceMotion);
  }, { rootMargin: '-2% 0px -2% 0px' }).observe(movementsEl);

  function goSlide(d) {
    var pos = slides.indexOf(current);
    var t = slides[Math.max(0, Math.min(slides.length - 1, pos + d))];
    if (t) t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  $('npPrev').addEventListener('click', function () { goSlide(-1); });
  $('npNext').addEventListener('click', function () { goSlide(1); });
  document.addEventListener('keydown', function (ev) {
    if (!current || !lb.hidden || !menu.hidden || ev.altKey || ev.ctrlKey || ev.metaKey) return;
    if (/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) return;
    if (ev.key === 'ArrowDown' || ev.key === 'PageDown') { ev.preventDefault(); goSlide(1); }
    else if (ev.key === 'ArrowUp' || ev.key === 'PageUp') { ev.preventDefault(); goSlide(-1); }
    else if (ev.key === 'ArrowRight') { var g = galleryOf(current); if (g) { g.stop(true); g.go(g.pos + 1); } }
    else if (ev.key === 'ArrowLeft') { var h = galleryOf(current); if (h) { h.stop(true); h.go(h.pos - 1); } }
  });

  /* En-tête opaque dès qu'on quitte le haut de l'ouverture */
  var hdr = $('hdr');
  var sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;height:80px;width:1px;pointer-events:none';
  document.body.prepend(sentinel);
  new IntersectionObserver(function (en) { hdr.classList.toggle('solid', !en[0].isIntersecting); }).observe(sentinel);

  /* ════════════════ Galeries ════════════════ */
  function Gallery(el, e) {
    this.el = el; this.e = e; this.pos = 0; this.token = 0; this.timer = 0; this.user = false;
    this.layers = el.querySelectorAll('.frame-view img');
    this.cur = 0;
    this.count = el.querySelector('.frame-count b');
    this.cap = el.querySelector('.cap');
    this.stack = el.querySelector('.stack img');
    this.thumbs = el.querySelectorAll('.strip button');
    this.strip = el.querySelector('.strip');
    this.tick = el.querySelector('.frame-tick');
    var self = this;
    el.addEventListener('click', function (ev) {
      var t = ev.target.closest('[data-step],[data-go],[data-zoom]');
      if (!t) return;
      if (t.hasAttribute('data-zoom')) return openLightbox(self.e, self.pos);
      self.stop(true);
      self.go(t.hasAttribute('data-step') ? self.pos + Number(t.dataset.step) : Number(t.dataset.go));
    });
    var stage = el.querySelector('.frame-view'), sx = 0, sy = 0;
    stage.addEventListener('touchstart', function (ev) { sx = ev.touches[0].clientX; sy = ev.touches[0].clientY; }, { passive: true });
    stage.addEventListener('touchend', function (ev) {
      var dx = ev.changedTouches[0].clientX - sx, dy = ev.changedTouches[0].clientY - sy;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) { self.stop(true); self.go(self.pos + (dx < 0 ? 1 : -1)); }
    }, { passive: true });
    el.addEventListener('mouseenter', function () { self.stop(false); });
    el.addEventListener('mouseleave', function () { if (el.classList.contains('is-active')) self.play(); });
    var first = this.layers[0], view = el.querySelector('.frame-view');
    var fit = function () { if (first.naturalWidth) view.style.aspectRatio = first.naturalWidth + ' / ' + first.naturalHeight; };
    if (first.complete) fit(); else first.addEventListener('load', fit, { once: true });
    this.updateUI();
  }
  Gallery.prototype.go = function (i) {
    var n = this.e.shots;
    i = (i + n) % n;
    if (i === this.pos) return;
    var dir = i > this.pos ? 1 : -1;
    this.pos = i;
    this.updateUI();
    var token = ++this.token, self = this;
    var incoming = this.layers[1 - this.cur], outgoing = this.layers[this.cur];
    incoming.classList.remove('on', 'from-l', 'from-r');
    incoming.classList.add(dir > 0 ? 'from-r' : 'from-l');
    incoming.src = shot(this.e, i);
    incoming.alt = caption(this.e, i, lang());
    var swap = function () {
      if (token !== self.token) return;
      outgoing.classList.remove('on');
      incoming.classList.add('on');
      self.cur = 1 - self.cur;
      self.preload(i + 1);
    };
    if (incoming.decode) incoming.decode().then(swap, swap); else incoming.onload = swap;
  };
  Gallery.prototype.preload = function (i) {
    if (this.e.shots < 2) return;
    var img = new Image();
    img.src = shot(this.e, (i + this.e.shots) % this.e.shots);
  };
  Gallery.prototype.updateUI = function () {
    var p = this.pos, self = this, e = this.e;
    if (this.count) this.count.textContent = pad(p + 1);
    if (this.cap) {
      this.cap.classList.remove('swap');
      void this.cap.offsetWidth;
      this.cap.innerHTML = bi(caption(e, p, 'fr'), caption(e, p, 'en'));
      this.cap.classList.add('swap');
    }
    if (this.stack && e.shots > 1) this.stack.src = thumb(e, (p + 1) % e.shots);
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
  Gallery.prototype.play = function () {
    if (this.user || reduceMotion || this.e.shots < 2 || this.timer || document.hidden) return;
    var self = this;
    this.preload(this.pos + 1);
    this.runTick();
    this.timer = setInterval(function () { self.go(self.pos + 1); self.runTick(); }, AUTOPLAY_MS);
  };
  Gallery.prototype.runTick = function () {
    if (!this.tick) return;
    this.tick.style.setProperty('--dur', AUTOPLAY_MS + 'ms');
    this.tick.classList.remove('run');
    void this.tick.offsetWidth;
    this.tick.classList.add('run');
  };
  Gallery.prototype.stop = function (byUser) {
    if (byUser) this.user = true;
    clearInterval(this.timer); this.timer = 0;
    if (this.tick) this.tick.classList.remove('run');
  };

  var galleries = [];
  document.querySelectorAll('.slide[data-idx]').forEach(function (el) {
    var e = editors[Number(el.dataset.idx)];
    if (e.shots) galleries.push(new Gallery(el, e));
  });
  function galleryOf(el) { for (var i = 0; i < galleries.length; i++) if (galleries[i].el === el) return galleries[i]; return null; }
  document.addEventListener('visibilitychange', function () {
    galleries.forEach(function (g) { if (document.hidden) g.stop(false); else if (g.el === current) g.play(); });
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
    galleries.forEach(function (g) { g.stop(false); });
    setTimeout(function () { $('lbClose').focus({ preventScroll: true }); }, 60);
  }
  function lbStep(d) {
    var n = lbState.e.shots;
    if (n < 2) return;
    lbState.i = (lbState.i + d + n) % n;
    lbRender(true);
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
