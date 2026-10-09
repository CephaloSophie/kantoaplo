/* ═══════════════════════════════════════════════════════════════════════
   KANTO APLO — comportement de la vitrine
   Rendu des éditeurs depuis assets/js/data.js, transitions entre éditeurs,
   galeries, menu, visionneuse. Aucun écouteur de scroll : tout passe par
   IntersectionObserver.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var DATA = window.KANTO;
  var editors = DATA.editors;
  var slogans = DATA.slogans;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV'];
  var NOTES = ['♪', '♫', '♩', '♬'];
  var AUTOPLAY_MS = 5200;

  var $ = function (id) { return document.getElementById(id); };

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
    return '--c:' + hex + ';--c-soft:' + rgba(hex, 0.16) + ';--c-line:' + rgba(hex, 0.38);
  }
  /* Texte bilingue : les deux langues sont dans le DOM, le CSS masque l'autre. */
  function bi(fr, en, tag) {
    tag = tag || 'span';
    return '<' + tag + ' data-fr>' + esc(fr) + '</' + tag + '><' + tag + ' data-en>' + esc(en) + '</' + tag + '>';
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function shot(e, i) { return 'assets/editors/' + e.id + '/' + pad(i + 1) + '.webp'; }
  function thumb(e, i) { return 'assets/editors/' + e.id + '/thumbs/' + pad(i + 1) + '.webp'; }
  function isExternal(e) { return e.status === 'external'; }
  function lang() { return document.documentElement.dataset.lang; }

  editors.forEach(function (e, i) { e.idx = i; e.num = ROMAN[i] || String(i + 1); });
  /* Tous les éditeurs ont leur section, qu'ils soient en ligne ou en composition. */
  var featured = editors;
  var engine = DATA.engine;
  var engineEds = engine ? editors.filter(function (e) { return e.engine; }) : [];

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

  /* ════════════════ Ouverture : chiffres clés ════════════════ */
  var editorCount = editors.filter(function (e) { return !isExternal(e); }).length;
  $('stats').innerHTML = [
    [editorCount, 'éditeurs', 'editors'],
    [1, 'partition commune', 'shared score'],
    [0, 'ligne de code', 'lines of code']
  ].map(function (s) { return '<li><b>' + s[0] + '</b>' + bi(s[1], s[2]) + '</li>'; }).join('');

  /* ════════════════ Statut d'un éditeur ════════════════ */
  function chip(e) {
    if (e.status === 'ready') return '<span class="chip ready">' + bi('Démo live', 'Live demo') + '</span>';
    if (isExternal(e)) return '<span class="chip external">' + esc(e.statusLabel || 'Web') + ' ↗</span>';
    return '<span class="chip pending">' + (e.version ? esc(e.version) : bi('Bientôt', 'Soon')) + '</span>';
  }

  /* ════════════════ La partition : chaque éditeur est une note ════════════════
     Noire = démo en ligne · blanche = en composition · ronde = l'application bâtie
     avec KANTO APLO. Les éditeurs qui partagent le moteur sont liés par une barre
     de croches. La partition se replie en plusieurs portées selon la largeur, et
     une tête de lecture la « joue » note après note. */
  var PITCH = [5, 7, 4, 2, 3, 6, 8, 5, 7, 4, 3, 6, 5, 7, 4];   // 0 = 1re ligne … 8 = 5e ligne
  function noteKind(e) { return isExternal(e) ? 'whole' : e.status === 'pending' ? 'half' : 'quarter'; }
  var sheetPer = 0;
  function renderSheet() {
    var body = $('sheetBody');
    var width = body.clientWidth || 1000;
    var per = Math.max(3, Math.min(editors.length, Math.floor((width - 80) / 88)));
    var systems = Math.ceil(editors.length / per);
    per = Math.ceil(editors.length / systems);
    if (per === sheetPer) return placeBeams();
    sheetPer = per;
    var html = '';
    for (var sIdx = 0; sIdx < systems; sIdx++) {
      var group = editors.slice(sIdx * per, (sIdx + 1) * per);
      var notes = group.map(function (e, k) {
        var kind = noteKind(e), p = PITCH[e.idx % PITCH.length];
        var up = e.engine || p < 4;
        var tip = (e.shots > 0 ? '<img src="' + thumb(e, 0) + '" alt="" loading="lazy" decoding="async"/>' : '<span class="tip-letter">' + esc(e.greek.charAt(0)) + '</span>') +
          '<b>' + esc(e.greek) + '</b><small>' + esc(e.latin) + ' · ' + bi(e.role_fr, e.role_en) + '</small>' + chip(e);
        var bar = (e.idx % 3 === 2 && k < group.length - 1) ? '<span class="sbar" aria-hidden="true"></span>' : '';
        return '<a class="snote ' + kind + (up ? ' up' : ' down') + (e.engine ? ' eng' : '') + '" href="#ed-' + e.id + '" data-idx="' + e.idx + '"' +
          ' style="--c:' + e.accent + ';--p:' + p + ';--i:' + e.idx + '" aria-label="' + esc(e.latin + ' — ' + e.role_fr) + '">' +
          '<span class="sn-num" aria-hidden="true">' + e.num + '</span>' +
          '<span class="sn-head" aria-hidden="true"></span>' + (kind !== 'whole' ? '<span class="sn-stem" aria-hidden="true"></span>' : '') +
          '<span class="sn-name" aria-hidden="true">' + esc(e.greek) + '</span>' +
          '<span class="sn-tip" aria-hidden="true">' + tip + '</span></a>' + bar;
      }).join('');
      var last = sIdx === systems - 1;
      html += '<div class="sys' + (sIdx === 0 ? ' first' : '') + '">' +
        '<div class="sys-lines" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>' +
        '<span class="sys-clef" aria-hidden="true">𝄞</span>' +
        (sIdx === 0 ? '<span class="sys-time" aria-hidden="true"><b>4</b><b>4</b></span>' : '') +
        '<div class="sys-notes">' + notes + (last ? '<span class="sbar end" aria-hidden="true"></span>' : '') + '</div>' +
        '<span class="sys-play" aria-hidden="true"></span></div>';
    }
    body.innerHTML = html;
    placeBeams();
  }
  /* Barre de croches entre deux notes voisines qui partagent le moteur. */
  function placeBeams() {
    var body = $('sheetBody');
    body.querySelectorAll('.sbeam').forEach(function (b) { b.remove(); });
    body.querySelectorAll('.sys-notes').forEach(function (row) {
      var engs = row.querySelectorAll('.snote.eng');
      for (var i = 0; i + 1 < engs.length; i++) {
        var a = engs[i].querySelector('.sn-stem'), b = engs[i + 1].querySelector('.sn-stem');
        if (!a || !b) continue;
        var r = row.getBoundingClientRect(), ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
        var x1 = ra.left - r.left, y1 = ra.top - r.top, x2 = rb.right - r.left, y2 = rb.top - r.top;
        var len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
        var beam = document.createElement('span');
        beam.className = 'sbeam';
        beam.setAttribute('aria-hidden', 'true');
        beam.style.cssText = 'left:' + x1 + 'px;top:' + y1 + 'px;width:' + len + 'px;transform:rotate(' + ang + 'rad)';
        row.appendChild(beam);
      }
    });
  }
  $('sheetLegend').innerHTML = [
    ['quarter', 'Démo en ligne', 'Live demo'],
    ['half', 'En composition', 'In composition'],
    ['whole', 'Application bâtie avec KANTO APLO', 'App built with KANTO APLO'],
    ['beam', 'Moteur KANTO partagé', 'Shared KANTO engine']
  ].map(function (l) { return '<li><i class="lg ' + l[0] + '" aria-hidden="true"></i>' + bi(l[1], l[2]) + '</li>'; }).join('');
  renderSheet();

  /* La tête de lecture joue la partition, note après note, tant qu'elle est visible. */
  (function playSheet() {
    var sheet = $('sheet'), at = -1, timer = 0, visible = false, hold = false;
    function step() {
      var notes = sheet.querySelectorAll('.snote');
      if (!notes.length) return;
      sheet.querySelectorAll('.snote.lit').forEach(function (n) { n.classList.remove('lit'); });
      at = (at + 1) % notes.length;
      light(notes[at]);
    }
    function light(n) {
      n.classList.add('lit');
      var sys = n.closest('.sys'), head = n.querySelector('.sn-head');
      sheet.querySelectorAll('.sys').forEach(function (x) { x.classList.toggle('playing', x === sys); });
      var x = head.getBoundingClientRect().left + head.offsetWidth / 2 - sys.getBoundingClientRect().left;
      sys.querySelector('.sys-play').style.transform = 'translateX(' + x.toFixed(1) + 'px)';
    }
    function run() { clearInterval(timer); if (visible && !hold && !reduceMotion) timer = setInterval(step, 720); }
    sheet.addEventListener('pointerover', function (e) {
      var n = e.target.closest('.snote'); if (!n) return;
      hold = true; clearInterval(timer);
      sheet.querySelectorAll('.snote.lit').forEach(function (x) { x.classList.remove('lit'); });
      light(n); at = Array.prototype.indexOf.call(sheet.querySelectorAll('.snote'), n);
    });
    sheet.addEventListener('pointerleave', function () { hold = false; run(); });
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; if (visible) run(); else clearInterval(timer); }, { threshold: 0.3 }).observe(sheet);
    var rz = 0;
    window.addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { renderSheet(); }, 150); });
  })();

  /* ════════════════ Les mouvements ════════════════ */
  function movement(e, order) {
    var greek = Array.from(e.greek).map(function (ch, i) {
      return '<span class="ch" style="--i:' + i + '">' + esc(ch) + '</span>';
    }).join('');
    var url = isExternal(e) ? e.href.replace(/^https?:\/\//, '') : 'kantoaplo.com/' + (e.href || '').replace(/\/index\.html$/, '');
    var wip = e.status === 'pending';
    var demo = wip
      ? '<span class="btn btn-wip" role="status"><i aria-hidden="true"></i>' + bi('Démo en composition', 'Demo in composition') + '</span>' +
        '<a class="btn btn-line" href="mailto:contact@cephalosophie.com?subject=' + encodeURIComponent('KANTO APLO — ' + e.latin) + '">' + bi('Être prévenu', 'Get notified') + ' <span aria-hidden="true">✉</span></a>'
      : isExternal(e)
      ? '<a class="btn btn-acc" href="' + esc(e.href) + '" target="_blank" rel="noopener">' + bi('Jouer sur ' + e.statusLabel, 'Play on ' + e.statusLabel) + ' <span aria-hidden="true">↗</span></a>'
      : '<a class="btn btn-acc" href="' + esc(e.href) + '">' + (e.engine ? bi('Démo du moteur ' + engine.name, engine.name + ' engine demo') : bi('Ouvrir la démo', 'Open the demo')) + ' <span aria-hidden="true">→</span></a>';
    var partners = engineEds.filter(function (x) { return x !== e; }).map(function (x) { return x.latin; }).join(', ');
    var engineChip = e.engine && partners
      ? '<li class="eng"><a href="#engine">⚙ ' + bi('Moteur ' + engine.name + ' · partagé avec ' + partners, engine.name + ' engine · shared with ' + partners) + '</a></li>'
      : '';
    var strip = '';
    for (var i = 0; i < e.shots; i++) {
      strip += '<button type="button" style="--i:' + i + '" data-go="' + i + '" aria-label="' + esc(e.latin) + ' — ' + (i + 1) + '">' +
        '<img src="' + thumb(e, i) + '" alt="" loading="lazy" decoding="async"/></button>';
    }
    return '<article class="mvt' + (order % 2 ? ' rev' : '') + (wip ? ' wip' : '') + '" id="ed-' + e.id + '" data-idx="' + e.idx + '" style="' + colorVars(e.accent) + '" aria-labelledby="t-' + e.id + '">' +
      '<span class="mvt-ghost" aria-hidden="true">' + esc(e.greek.charAt(0)) + '</span>' +
      '<div class="wrap mvt-grid">' +
        '<div class="mvt-info">' +
          '<p class="mvt-num">' + bi(isExternal(e) ? 'Finale' : 'Mouvement', isExternal(e) ? 'Finale' : 'Movement') + ' <b>' + e.num + '</b>' +
            (wip ? '<span class="wip-badge">' + bi('En cours', 'In progress') + '</span>' : '') + '</p>' +
          '<h3 class="mvt-greek" id="t-' + e.id + '" aria-label="' + esc(e.greek + ' — ' + e.latin) + '">' + greek + '</h3>' +
          '<p class="mvt-latin"><strong>' + esc(e.latin) + '</strong><em>' + bi(e.meaning_fr, e.meaning_en) + '</em></p>' +
          '<p class="mvt-pitch">' + bi(e.pitch_fr, e.pitch_en) + '</p>' +
          '<ul class="mvt-meta"><li class="role">' + bi(e.role_fr, e.role_en) + '</li>' +
            (wip
              ? (e.version ? '<li>' + bi('Version ', 'Version ') + esc(e.version) + '</li>' : '') + '<li class="wip-chip">' + bi('En composition', 'In composition') + '</li>'
              : '<li>' + bi(e.shots + ' captures', e.shots + ' screenshots') + '</li>' +
                (engineChip || '<li>' + (isExternal(e) ? bi('Bâti avec KANTO APLO', 'Built with KANTO APLO') : bi('Démo interactive', 'Interactive demo')) + '</li>')) + '</ul>' +
          '<div class="mvt-actions">' + demo +
            (wip ? '' : '<button type="button" class="btn btn-line" data-zoom>' + bi('Plein écran', 'Full screen') + '</button>') + '</div>' +
        '</div>' +
        (wip ? composeStage(e) : '<div class="stage">' +
          '<figure class="frame" style="margin:0">' +
            '<div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span class="frame-url">' + esc(url) + '</span></div>' +
            '<span class="frame-tick" aria-hidden="true"></span>' +
            '<button type="button" class="frame-view" data-zoom aria-label="' + esc(e.latin) + ' — agrandir / enlarge">' +
              '<img class="on" src="' + shot(e, 0) + '" alt="' + esc(e.latin) + ' — 1" loading="lazy" decoding="async"/>' +
              '<img alt="" decoding="async"/>' +
            '</button>' +
            (e.shots > 1
              ? '<div class="frame-ctrl"><button type="button" data-step="-1" aria-label="Précédente / Previous">←</button>' +
                '<span class="frame-count"><b>01</b> / ' + pad(e.shots) + '</span>' +
                '<button type="button" data-step="1" aria-label="Suivante / Next">→</button></div>'
              : '') +
          '</figure>' +
          (e.shots > 1 ? '<div class="strip">' + strip + '</div>' : '') +
        '</div>') +
      '</div></article>';
  }

  /* Cadre d'un éditeur en composition : une partition qui s'écrit, note après note. */
  function composeStage(e) {
    var P = [3, 5, 2, 6, 4, 7, 5, 8, 6, 4, 3, 5], notes = '';
    P.forEach(function (p, i) {
      var x = 15 + i * 6.9;
      notes += '<i class="cp-note' + (i % 4 === 3 ? ' hollow' : '') + (p >= 4 ? ' down' : '') + '" style="--i:' + i + ';--p:' + p + ';left:' + x.toFixed(1) + '%"></i>';
      if (i % 4 === 3 && i < P.length - 1) notes += '<i class="cp-bar" style="left:' + (x + 3.45).toFixed(1) + '%"></i>';
    });
    return '<div class="stage"><figure class="frame" style="margin:0">' +
      '<div class="frame-bar" aria-hidden="true"><i></i><i></i><i></i><span class="frame-url">kantoaplo.com · ' + esc(e.latin) + ' — ' + bi('en composition', 'in composition') + '</span></div>' +
      '<div class="frame-view compose" role="img" aria-label="' + esc(e.latin) + ' — en composition / in composition">' +
        '<span class="cp-greek" aria-hidden="true">' + esc(e.greek) + '</span>' +
        '<span class="cp-staff" aria-hidden="true"><span class="cp-clef">𝄞</span>' + notes + '</span>' +
        '<span class="cp-label"><i aria-hidden="true"></i>' + bi('En composition', 'In composition') + (e.version ? ' · ' + esc(e.version) : '') + '</span>' +
      '</div></figure></div>';
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
    return '<section class="engine" id="engine" style="' + colorVars(engine.accent) + '" aria-labelledby="engineTitle">' +
      '<div class="wrap">' +
        '<header class="section-head" data-reveal>' +
          '<p class="eyebrow">' + bi(engine.eyebrow_fr, engine.eyebrow_en) + '</p>' +
          '<h2 id="engineTitle">' + bi(engine.title_fr, engine.title_en) + '</h2>' +
          '<p class="lead">' + bi(engine.tagline_fr, engine.tagline_en) + '</p></header>' +
        '<div class="eng-map" data-reveal>' +
          '<div class="eng-core"><span class="eng-ring" aria-hidden="true"></span>' +
            '<span class="eng-name">' + esc(engine.name) + '</span>' +
            '<span class="eng-sub">' + bi('blocs · nœuds · workflows', 'blocks · nodes · workflows') + '</span></div>' +
          '<svg class="eng-wires" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">' + wires + '</svg>' +
          '<div class="eng-branches" style="--n:' + n + '">' + branches + '</div>' +
        '</div>' +
        '<div class="eng-foot" data-reveal>' +
          '<p class="eng-text">' + bi(engine.text_fr, engine.text_en) + '</p>' +
          '<ul class="eng-feats">' + engine.features.map(function (f) { return '<li>' + bi(f.fr, f.en) + '</li>'; }).join('') + '</ul>' +
          '<a class="btn btn-acc" href="' + esc(engine.href) + '">' + bi('Essayer le moteur ' + engine.name, 'Try the ' + engine.name + ' engine') + ' <span aria-hidden="true">→</span></a>' +
        '</div>' +
      '</div></section>';
  }

  /* Ordre de la page : chaque éditeur, et le moteur juste avant le deuxième éditeur
     qui le partage. Les slogans ont leur propre lecteur (Intermezzo). */
  var html = '<div class="wrap"><header class="section-head" data-reveal style="margin-bottom:0">' +
    '<p class="eyebrow">' + bi('Les mouvements', 'The movements') + '</p>' +
    '<h2>' + bi('Chaque éditeur, une voix.', 'Every editor, a voice.') + '</h2>' +
    '<p class="lead">' + bi('Faites défiler : la partition se joue d\'elle-même.', 'Scroll on: the score plays itself.') + '</p></header></div>';
  featured.forEach(function (e, i) {
    if (engineEds.length > 1 && e === engineEds[1]) html += engineSection();
    html += movement(e, i);
  });
  $('movementsBody').innerHTML = html;
  if (engineEds.length > 1) {
    $('sheet').insertAdjacentHTML('afterend', '<p class="ov-note" data-reveal><a href="#engine">⚙ ' +
      bi(engineEds.map(function (e) { return e.latin; }).join(' et ') + ' partagent le même moteur : ' + engine.name,
         engineEds.map(function (e) { return e.latin; }).join(' and ') + ' share the same engine: ' + engine.name) +
      ' <span aria-hidden="true">→</span></a></p>');
    $('menuFoot').insertAdjacentHTML('afterbegin', '<a href="#engine">' + bi('Le moteur ' + engine.name, 'The ' + engine.name + ' engine') + '</a>');
  }
  var last = slogans[slogans.length - 1];
  if (last) $('finale').innerHTML = bi(last.fr, last.en);

  /* ════════════════ Menu, portée latérale, pastille mobile ════════════════ */
  $('menuList').innerHTML = editors.map(function (e, i) {
    return '<li style="--i:' + i + '"><a href="#ed-' + e.id + '" data-idx="' + i + '" style="--c:' + e.accent + '">' +
      '<span class="mi-num">' + e.num + '</span><span class="mi-greek">' + esc(e.greek) + '</span><span class="mi-dot"></span>' +
      '<span class="mi-sub">' + esc(e.latin) + ' · ' + bi(e.role_fr, e.role_en) + '</span></a></li>';
  }).join('');
  $('scoreList').innerHTML = editors.map(function (e, i) {
    return '<li><a href="#ed-' + e.id + '" data-idx="' + i + '" style="--c:' + e.accent + '" aria-label="' + esc(e.latin) + '">' +
      '<span class="lbl">' + esc(e.greek) + '</span><span class="dot"></span></a></li>';
  }).join('');

  /* ════════════════ Intermezzo : un slogan, une portée, en boucle ════════════════
     Chaque slogan reçoit SA portée : clef, armure (dièses ou bémols), mesure et
     couleur propres, tirées d'une graine fixe (le même slogan garde toujours la
     même portée). Ses mots se posent sur les lignes comme des notes, à des
     hauteurs qui suivent une petite mélodie, avec des barres de mesure. Puis ils
     s'envolent et le slogan suivant s'écrit. Autant de slogans que l'on veut. */
  (function intermezzo() {
    var stage = $('anStage'), sheet = $('anthem'), bar = $('anBar'), playBtn = $('anPlay');
    if (!stage || !slogans.length) return;
    var CLEFS = ['𝄞', '𝄢', '𝄡'];
    var TIMES = [['4', '4'], ['3', '4'], ['6', '8'], ['2', '4'], ['12', '8'], ['5', '4']];
    var SHARP_Y = [-12, 0, -16, -4, 8], FLAT_Y = [4, -8, 8, -4, 12];
    var colors = editors.map(function (e) { return e.accent; });
    function prng(a) {
      return function () {
        a = (a + 0x6D2B79F5) | 0;
        var t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function melody(text, rnd) {
      var out = '', inBar = 0, barLen = 3 + Math.floor(rnd() * 3), p = 0;
      var list = text.split(/\s+/);
      list.forEach(function (w, k) {
        p = Math.max(-3, Math.min(3, p + Math.round((rnd() - 0.5) * 4)));   // pas conjoints, comme une mélodie
        out += '<span class="w" style="--p:' + p + ';--i:' + k + '">' + esc(w) + '</span> ';
        if (++inBar >= barLen && k < list.length - 1) {
          out += '<span class="bar" aria-hidden="true"></span> ';
          inBar = 0; barLen = 3 + Math.floor(rnd() * 3);
        }
      });
      return out;
    }
    function render(i) {
      var s = slogans[i], rnd = prng(i * 7919 + 17);
      var n = Math.floor(rnd() * 5), flat = rnd() < 0.5, acc = '';
      for (var k = 0; k < n; k++) acc += '<i style="transform:translateY(' + (flat ? FLAT_Y : SHARP_Y)[k] + 'px)">' + (flat ? '♭' : '♯') + '</i>';
      var t = TIMES[Math.floor(rnd() * TIMES.length)], c = colors[i % colors.length];
      return '<div class="an-line" style="--c:' + c + ';--slc:' + rgba(c, 0.42) + '">' +
        '<span class="an-key" aria-hidden="true"><span class="an-clef">' + CLEFS[i % CLEFS.length] + '</span>' +
          (acc ? '<span class="an-acc">' + acc + '</span>' : '') +
          '<span class="an-time"><b>' + t[0] + '</b><b>' + t[1] + '</b></span></span> ' +
        '<span class="an-text" data-fr>' + melody(s.fr, prng(i * 7919 + 101)) + '</span>' +
        '<span class="an-text" data-en>' + melody(s.en, prng(i * 7919 + 211)) + '</span>' +
        '<span class="bar end" aria-hidden="true"></span></div>';
    }
    function duration(i) {
      var len = Math.max(slogans[i].fr.length, slogans[i].en.length);
      return Math.max(6500, Math.min(14000, 3800 + len * 62));
    }

    var idx = -1, timer = 0, playing = !reduceMotion, visible = false, hovering = false;
    function show(i) {
      idx = (i + slogans.length) % slogans.length;
      var old = stage.querySelector('.an-line:not(.leave)');
      var holder = document.createElement('div');
      holder.innerHTML = render(idx);
      var fresh = holder.firstChild;
      if (old) {
        old.classList.add('leave');
        setTimeout(function () { old.remove(); }, reduceMotion ? 0 : 800);
      }
      stage.appendChild(fresh);
      requestAnimationFrame(function () { requestAnimationFrame(function () { fresh.classList.add('show'); }); });
      $('anCount').textContent = pad(idx + 1) + ' / ' + pad(slogans.length);
      schedule();
    }
    function schedule() {
      clearTimeout(timer);
      bar.classList.remove('run');
      var active = playing && visible && !hovering && !document.hidden;
      sheet.classList.toggle('paused', !playing);
      if (!active) return;
      bar.style.animationDuration = duration(idx) + 'ms';
      void bar.offsetWidth;
      bar.classList.add('run');
      timer = setTimeout(function () { show(idx + 1); }, duration(idx));
    }
    $('anPrev').addEventListener('click', function () { show(idx - 1); });
    $('anNext').addEventListener('click', function () { show(idx + 1); });
    playBtn.addEventListener('click', function () { playing = !playing; schedule(); });
    sheet.addEventListener('mouseenter', function () { hovering = true; schedule(); });
    sheet.addEventListener('mouseleave', function () { hovering = false; schedule(); });
    document.addEventListener('visibilitychange', schedule);
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; schedule(); }, { threshold: 0.35 }).observe(sheet);
    show(0);
  })();

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
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
  document.querySelectorAll('[data-reveal], .mvt, .engine').forEach(function (el) {
    if (reduceMotion) el.classList.add('in'); else revealIO.observe(el);
  });

  /* ════════════════ Transition d'un éditeur à l'autre ════════════════
     Une ligne invisible au milieu de l'écran : l'éditeur qu'elle traverse
     devient « en cours ». Le halo d'ambiance passe en fondu enchaîné à sa
     couleur, la portée et la pastille se mettent à jour. */
  var root = document.documentElement;
  var auraLayers = [$('auraA'), $('auraB')];
  var auraCur = 0;
  var scoreLinks = Array.prototype.slice.call(document.querySelectorAll('#scoreList a'));
  var menuLinks = Array.prototype.slice.call(document.querySelectorAll('#menuList a'));
  var np = $('np'), npName = $('npName');

  function setAura(hex) {
    var next = auraLayers[1 - auraCur];
    if (hex) {
      next.style.setProperty('--c1', rgba(hex, 0.13));
      next.style.setProperty('--c2', rgba(hex, 0.08));
    } else {
      next.style.setProperty('--c1', 'rgba(201,150,58,.06)');
      next.style.setProperty('--c2', 'transparent');
    }
    auraLayers[auraCur].classList.remove('on');
    next.classList.add('on');
    auraCur = 1 - auraCur;
  }

  /* Arrêts : chaque élément qui peut devenir « en cours », avec ce qu'il affiche
     (repères allumés, nom, couleur) et vers où mènent les flèches ‹ ›. */
  var stopInfo = new Map();
  document.querySelectorAll('.mvt').forEach(function (el) {
    var e = editors[Number(el.dataset.idx)];
    stopInfo.set(el, { idxs: [e.idx], num: e.num, label: esc(e.greek), accent: e.accent, prev: e.idx - 1, next: e.idx + 1 });
  });
  if ($('engine')) {
    stopInfo.set($('engine'), { idxs: engineEds.map(function (e) { return e.idx; }), num: '⚙',
      label: esc(engine.name), accent: engine.accent, prev: engineEds[0].idx, next: engineEds[1].idx });
  }
  var current = null;

  function setActive(info) {
    if (info === current) return;
    current = info;
    $('score').classList.toggle('show', !!info);
    np.classList.toggle('show', !!info);
    if (!info) { setAura(null); ['--acc', '--acc-soft', '--acc-line'].forEach(function (v) { root.style.removeProperty(v); }); return; }

    setAura(info.aura || info.accent);
    root.style.setProperty('--acc', info.accent);
    root.style.setProperty('--acc-soft', rgba(info.accent, 0.16));
    root.style.setProperty('--acc-line', rgba(info.accent, 0.38));
    scoreLinks.forEach(function (a, i) { a.classList.toggle('on', info.idxs.indexOf(i) !== -1); });
    menuLinks.forEach(function (a, i) { a.classList.toggle('on', info.idxs.indexOf(i) !== -1); });
    npName.innerHTML = '<span><span class="n">' + info.num + '</span><span class="g">' + info.label + '</span></span>';
    $('npPrev').disabled = info.prev < 0;
    $('npNext').disabled = info.next >= editors.length;
  }

  /* Entre deux éditeurs (pendant un intermède), l'éditeur précédent reste « en cours » :
     la navigation ne disparaît que lorsqu'on quitte la zone des éditeurs. */
  var movementsEl = $('movements');
  var visible = new Set();
  var activeIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) visible.add(en.target); else visible.delete(en.target); });
    if (!visible.has(movementsEl)) return setActive(null);
    var el = null;
    stopInfo.forEach(function (info, s) { if (visible.has(s)) el = s; });
    if (el) setActive(stopInfo.get(el));
  }, { rootMargin: '-48% 0px -48% 0px' });
  activeIO.observe(movementsEl);
  stopInfo.forEach(function (info, s) { activeIO.observe(s); });
  setAura(null);

  function scrollToEditor(i) {
    var e = editors[Math.max(0, Math.min(editors.length - 1, i))];
    var el = document.getElementById('ed-' + e.id);
    if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }
  $('npPrev').addEventListener('click', function () { if (current) scrollToEditor(current.prev); });
  $('npNext').addEventListener('click', function () { if (current) scrollToEditor(current.next); });

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
    this.updateUI();
  }
  Gallery.prototype.go = function (i) {
    var n = this.e.shots;
    i = (i + n) % n;
    if (i === this.pos) return;
    this.pos = i;
    this.updateUI();
    var token = ++this.token, self = this;
    var incoming = this.layers[1 - this.cur], outgoing = this.layers[this.cur];
    incoming.classList.remove('on');
    incoming.src = shot(this.e, i);
    incoming.alt = this.e.latin + ' — ' + (i + 1);
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
    var p = this.pos, self = this;
    if (this.count) this.count.textContent = pad(p + 1);
    Array.prototype.forEach.call(this.thumbs, function (b, j) {
      var on = j === p;
      b.classList.toggle('on', on);
      b.setAttribute('aria-current', on ? 'true' : 'false');
      if (on && self.strip && self.visible) {
        var left = b.offsetLeft - (self.strip.clientWidth - b.offsetWidth) / 2;
        self.strip.scrollTo({ left: left, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  };
  Gallery.prototype.play = function () {
    if (this.user || reduceMotion || this.e.shots < 2 || this.timer) return;
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
  document.querySelectorAll('.mvt').forEach(function (el) {
    var ed = editors[Number(el.dataset.idx)];
    if (!ed.shots) return;
    var g = new Gallery(el, ed);
    galleries.push(g);
    el.addEventListener('mouseenter', function () { g.stop(false); });
    el.addEventListener('mouseleave', function () { if (g.visible) g.play(); });
  });
  /* Défilement automatique uniquement pour la galerie visible à l'écran. */
  var frameToGallery = new Map();
  var playIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      var g = frameToGallery.get(en.target);
      g.visible = en.isIntersecting;
      if (en.isIntersecting && !document.hidden) g.play(); else g.stop(false);
    });
  }, { threshold: 0.55 });
  galleries.forEach(function (g) {
    var frame = g.el.querySelector('.frame');
    frameToGallery.set(frame, g);
    playIO.observe(frame);
  });
  document.addEventListener('visibilitychange', function () {
    galleries.forEach(function (g) { if (document.hidden) g.stop(false); else if (g.visible) g.play(); });
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
      lbImg.alt = e.latin + ' — ' + (i + 1);
      $('lbCount').textContent = pad(i + 1) + ' / ' + pad(e.shots);
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
    galleries.forEach(function (g) { if (g.visible) g.play(); });
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
