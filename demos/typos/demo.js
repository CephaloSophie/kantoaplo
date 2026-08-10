/* Démo Typος 2.2.0 — s'appuie sur le bundle UMD (window.Typos).
   Le seed montre les nouveautés de la phase 3 :
   · templates insérés depuis DEFAULT_TEMPLATES ;
   · sélection avec icônes flottantes et poignées de resize ;
   · code surligné selon la sélection courante. */
(function () {
  "use strict";
  var T = window.Typos;
  var app = document.getElementById("app");

  var editor = T.mountTyposEditor(app, {
    document: T.createDocument({ name: "Démo Typος", kind: "page" }),
  });
  var e = editor.engine;
  var TEMPLATES = T.TEMPLATES_BY_KEY;

  e.batch("Seed phase 3", function () {
    /* Header + nav depuis le template par défaut. */
    e.insertTemplate(TEMPLATES.get("header-nav").tree);

    /* Hero personnalisé pour matcher l'identité KANTO APLO. */
    var heroId = e.insertTemplate(TEMPLATES.get("hero").tree);
    var hero = e.findElement(heroId);
    if (hero && hero.children[0]) {
      e.updateElement(hero.children[0].id, { innerHtml: "KANTO APLO · <em>Typος</em>" });
    }
    if (hero && hero.children[1]) {
      e.updateElement(hero.children[1].id, {
        innerHtml: "Icônes flottantes, poignées de resize, palette de squelettes, autocomplete des styles."
      });
    }

    /* Row 3 colonnes → chaque colonne reçoit une carte. */
    var rowId = e.insertTemplate(TEMPLATES.get("row-3").tree);
    var row = e.findElement(rowId);
    if (row) {
      row.children.forEach(function (col, i) {
        var cardId = e.insertTemplate(TEMPLATES.get("card").tree, { parentId: col.id });
        var card = e.findElement(cardId);
        var titles = ["Config déclarative", "Overlay direct", "Code surligné"];
        var texts = [
          "src/config/defaults.ts — icônes, autocomplete, templates, tout en un seul JSON.",
          "Icônes de la sélection + 8 poignées de resize posées sur le canvas.",
          "Cliquer un nœud dans le canvas fait voir la ligne correspondante en Code."
        ];
        if (card && card.children[0]) e.updateElement(card.children[0].id, { innerHtml: titles[i] });
        if (card && card.children[1]) e.updateElement(card.children[1].id, { innerHtml: texts[i] });
      });
    }

    /* Section vide avec une image pour tester le resize direct sur le canvas. */
    var section = e.insertTemplate(TEMPLATES.get("section-empty").tree);
    e.addElement("img", {
      parentId: section,
      name: "vignette",
      attrs: {
        src: "data:image/svg+xml," + encodeURIComponent(
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="240">' +
            '<rect width="800" height="240" fill="#1c1712"/>' +
            '<path d="M0 240 220 90l120 82 90-58 290 126z" fill="#3a2f22"/>' +
            '<circle cx="640" cy="58" r="30" fill="#d4a373"/>' +
            '<text x="24" y="44" fill="#d4a373" font-family="monospace" font-size="28">τ</text>' +
          '</svg>'
        ),
      },
      styleOptions: { width: "100%", "border-radius": "12px", display: "block" },
    });

    /* Footer standard. */
    e.insertTemplate(TEMPLATES.get("footer").tree);
  });

  /* Second template cible mobile — clone du principal. */
  var mobile = e.addTemplate({ name: "Mobile", cloneFromId: e.document.activeTemplateId });
  e.setTemplateTarget(mobile, "mobile");

  e.markSaved();
  var heroEl = e.tree.children[1];
  if (heroEl) e.select([heroEl.id]);

  window.typosDemo = editor;
})();
