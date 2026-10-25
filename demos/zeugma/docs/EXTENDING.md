# Étendre : langages, générateurs, affichages, commandes

> La plateforme a cinq points d'extension. Chacun est un **registre** qui s'emploie sans le studio (sous Node aussi), et chacun est lu par le studio s'il est là.

| Point d'extension | Registre | Exemple livré |
|---|---|---|
| Un langage, ses modèles de projet, ses contributions | `Domino.Languages` | Kanto (`templates`, `contributes`) |
| Un générateur (langage → texte, une ou plusieurs cibles, un ou plusieurs fichiers) | `Domino.Codegen` | `demos/generators/doc.gen.js` (documentation, Mermaid, modèle) |
| Un mode d'affichage des pierres | `Domino.Displays` | Pierre, Compacte, Carte détaillée, Contour |
| Une commande, un menu, un raccourci | `Domino.Commands`, `Domino.Menus`, `Domino.Keys` | les ~100 commandes du studio |
| Un stockage | `StorageAdapter` | [STORAGE.md](STORAGE.md) |
| Un kit de pierres (réutilisé par plusieurs langages) | `Domino.Kits` | `flow` (aiguillage à N cas), `data` (données, filtrer, transformer, trier) |
| Un opérateur d'expression (le dialecte d'un langage) | `Domino.Expr.extend`, `expr: { ops }` | les conditions du quiz (`score`, `percent`, `answer`, `profile`) |
| La boîte à outils d'un langage (catégories, sous-catégories, aide, liens) | clé `toolbox` (JSON), `Domino.Toolbox` | Kanto |
| La barre de menus et les menus contextuels | `Domino.Menus.fromJSON`, clé `menus` de la configuration | `engine/studio/domino.studio.menus.js` |
| Le balisage de l'interface | `Domino.Templates` (`override`, `reset`), clé `ui.templates` de la configuration | tous les gabarits livrés (`Domino.Templates.list()`) |
| Un format venu d'un autre outil | `Domino.Importers` | collection et environnement Postman |
| Une vue du projet (projection), propre ou non à un langage | `Domino.Projections.register({ id, language?, mount })` | Déroulé (tous), Tableau de bord (TNR) |

---

## 1. Un langage

Un langage se décrit comme avant (voir [ARCHITECTURE.md § 2](ARCHITECTURE.md)). Deux clés s'ajoutent :

```js
Domino.Languages.register(Domino.language({
  id: 'kanto', name: 'Kanto', /* types, dominos, rules, modules, generators… */

  // Modèles de projet : « Fichier › Nouveau ▸ Kanto ▸ … » (en plus de « Projet vide » et « Exemple »).
  templates: [{ id: 'hello', name: 'Bonjour', description: 'Trois pierres.', project: { format: 'kantoaplo.domino', version: 2, … } }],

  // Contributions au studio : actives seulement dans les projets de ce langage (clause when ajoutée d'office).
  contributes: {
    commands: [{ id: 'kanto.clearOutput', title: 'Vider la sortie du programme', run: (ctx) => ctx.doc.ws.context.set('sortie', []) }],
    menus: {
      'menubar/run': [{ command: 'kanto.clearOutput', group: '4_lang@1' }],
      'menubar/language': [{ command: 'kanto.clearOutput', group: '2_lang@1' }],
      'domino/context': [{ command: 'kanto.explain', group: '1@1' }],     // le menu d'une pierre ; l'id de la pierre est passé
    },
    keybindings: [{ key: 'Mod+Alt+K', command: 'kanto.clearOutput' }],
    displays: [ /* modes d'affichage, § 3 */ ],
    generators: [ /* descripteurs, § 2 */ ],
  },
}), { group: 'Langages', short: 'Kanto' });
```

- Un langage qui s'inscrit lui-même dans `Domino.packs` (comme les démos) est vu par le registre sans rien changer.
- `Domino.Languages.templates(id)` rend toujours le projet vide, puis l'exemple (`project`), puis les `templates`.
- Un langage écrit en JSON (par l'Atelier, ou à la main) s'importe avec `Domino.Languages.importJSON(json, { trust })`.
  - Ses callbacks écrits en texte (`code`) s'exécuteront dans la page : sans `trust: true`, l'import est refusé (`lang.untrusted`, avec le nombre de fonctions).
  - Le studio demande confirmation, puis garde le langage dans le stockage (`languages`).

## 2. Un générateur

Un générateur est un **descripteur**. Il a une cible et une extension, il prend le projet ou le **document de modèle**, et il rend un texte ou plusieurs fichiers.

```js
Domino.Codegen.register({
  id: 'kanto/python',            // « langage/cible » ; language: '*' pour tous les langages
  language: 'kanto', target: 'python', label: 'Python', extension: 'py',
  input: 'model',                // 'project' (JSON v2, par défaut) ou 'model' (tout résolu : voir ARCHITECTURE.md § 8 bis)
  options: { indent: { kind: 'number', label: 'Indentation', default: 4 } },
  generate(ctx) {
    const m = ctx.model();                        // le document de modèle (calculé à la demande)
    for (const p of m.parties) {
      const lines = (p.elements || []).map((id) => `# ${m.elements[id].title}`);
      ctx.file(`${p.id}.py`, lines.join('\n'));   // plusieurs fichiers…
    }
    ctx.log('info', `${m.project.stats.elements} pierres`);
    return { files: [] };                         // … ou un texte : return '…'
  },
});

const out = Domino.Codegen.run('kanto/python', editor.ws, { options: { indent: 2 } });
// → { files: [{ path, content, mime }], diagnostics: [{ level, message }], text }
```

**L'entrée** : un espace vivant (`ws`), un projet v2, ou une ressource. Depuis le JSON seul, le document de modèle est calculé en rechargeant le projet sans vue. Un serveur génère donc sans navigateur.

**Les générateurs existants** : ceux de `spec.generators` (classe `Domino.Generator`) sont adoptés d'eux-mêmes sous `langage/nom`. `editor.generate(nom)` continue de marcher.

**Dans le studio** :

- Exécuter › Générer ▸ montre les générateurs du langage, puis les génériques ;
- l'onglet Code de l'inspecteur affiche le résultat, et « Télécharger » rend chaque fichier.

**Trois génériques livrés** (`demos/generators/doc.gen.js`, `language: '*'`) :

- `doc/markdown` : la documentation du projet ;
- `graph/mermaid` : le graphe des collages, des adjacentes et des fils ;
- `model/json` : le document de modèle et son schéma, deux fichiers.

Ils servent les neuf langages sans en connaître un seul.

## 3. Un mode d'affichage

```js
Domino.Displays.register({
  id: 'badge', label: 'Badge', description: 'La pierre et un badge sous elle.',
  metrics: { T: 60, names: true, labels: true, maxDepth: 3 },     // l'échelle de la table, par vue
  // Ce que le mode ajoute autour d'une pierre (repère de la pierre) : l'anti-collision en tient compte.
  extent: (ctx) => [{ x: 0, y: ctx.bounds.y2 + 4, w: ctx.w, h: 16 }],
  // Le dessin : ctx.kit.svg est la pierre du kit ; rendre { svg } (ou null : le kit dessine).
  render: (ctx) => ({ svg: `${ctx.kit.svg}<text x="${ctx.w / 2}" y="${ctx.deco[0].y + 12}" text-anchor="middle">${ctx.node.type}</text>` }),
});
editor.setOption('display', 'badge');
```

- **Les métriques** (`T`, `names`, `labels`, `maxDepth`, `headerSize`) appartiennent à la **vue**. La géométrie des chaînes suppose une seule unité par partie.
- **Le dessin** peut appartenir à la **pierre** : `display: 'card'` dans sa définition, ou `meta.display` sur la pierre posée. Elle l'emporte sur la vue.
- **Les points** restent aux coordonnées du kit (`DominoKit.pipXY`) dans tous les modes. Les fils, l'aimantation et les clics ne changent pas.
- **La priorité** : le callback `render` d'une pierre l'emporte sur le mode.

## 4. Une commande, un menu, un raccourci

```js
Domino.Commands.register({
  id: 'monapp.publier', title: 'Publier le projet', category: 'Fichier',
  when: "hasDocument && language == 'automate'",          // clé de contexte : hasDocument, dirty, language, hasSelection, running…
  enabled: (ctx) => !ctx.dirty,
  run: async (ctx) => { await monApi.publier(ctx.doc.toResource()); ctx.studio.toast('Publié.', 'ok'); },
  keybinding: 'Mod+Alt+P',
});
Domino.Menus.contribute('menubar/file', [{ command: 'monapp.publier', group: '3_save@9' }]);   // en code
Domino.Menus.fromJSON({ bar: [{ id: 'file', title: 'Fichier', sections: [{ id: 'publish', items: [{ command: 'monapp.publier' }] }] }] });   // ou en JSON (§ 12)
Domino.Menus.provider('menubar/file/recent', (ctx) => [/* éléments calculés */]);
```

**Clauses `when`** :

- identifiants, chaînes, nombres, `true` et `false` ;
- opérateurs `! && || == !=`, parenthèses ;
- elles sont lues par un analyseur maison, jamais par `new Function`.

**Clés de contexte** : `hasDocument`, `hasEditor`, `dirty`, `untitled`, `canUndo`, `canRedo`, `hasSelection`, `selectionLocked`, `selectionDisabled`, `running`, `language`, `display`, `groupCount`, `tabCount`, `storageDegraded`, `autosave`, `clipboard`, `canvasFocus`, `isMobile`, `hasModules`.

**Points de contribution** :

- les menus du haut : `menubar/file`, `menubar/file/new`, `menubar/file/import`, `menubar/file/export`, `menubar/file/workspace`, `menubar/edit`, `menubar/view`, `menubar/view/display`, `menubar/view/layout`, `menubar/run`, `menubar/run/generate`, `menubar/language`, `menubar/help` ;
- les menus contextuels : `tab/context`, `group/context`, `domino/context`.

**Groupes** : `'2_open@3'` désigne le groupe `2_open`, rang 3. Les groupes sont triés par nom, et un séparateur les sépare.

**Raccourcis** :

- forme : `'Mod+Shift+S'`, `'F5'`, `'Alt+PageDown'`, accords `'Mod+K Mod+S'` ;
- `Mod` vaut Ctrl, ou ⌘ sur Mac ;
- les raccourcis réservés par les navigateurs sont refusés (`Domino.Keys.warnings`) ;
- dans un champ texte, seuls les raccourcis globaux agissent (Mod+S, Mod+O, F1, F5…).

**Exécuter et lire** : `await Domino.Commands.execute('file.save')` ; `Domino.Menus.resolve('menubar/file', ctx)` rend le menu prêt à dessiner.

## 5. Le studio par morceaux

Chaque couche s'emploie seule :

```js
// Un établi sans interface (un serveur, un test) :
const wb = new Domino.Workbench({ storage: Domino.Storage.open(config), ui: { confirmClose: async () => 'save' } });
const doc = await wb.newProject({ language: 'kanto', template: 'example' });
await wb.save(doc);

// Deux vues d'un même projet, dans une page à vous :
const a = Domino.create('#gauche', doc.language, { workspace: doc.ws, runtime: doc.runtime });
const b = Domino.create('#droite', doc.language, { workspace: doc.ws, runtime: doc.runtime, display: 'card' });

// Des volets sans le studio :
const panes = new Domino.SplitView(el, { layout: () => wb.layout, tabInfo, mount, onActivate, onClose, onResize, … });
```

**Ce que l'éditeur ajoute pour cela** :

- `options.workspace`, `options.runtime` et `options.project` ;
- `suspend()` et `resume()` ;
- `viewState()` et `restoreViewState(s)` ;
- `stop()` et `cut()` ;
- `setOption('display' | 'pioche' | 'minimap', …)` ;
- les événements `focus` et `clipboard`.

Une vue détruite retire tous ses écouteurs du projet, y compris ceux que le `setup()` du langage a posés. Le projet partagé survit à ses vues.

## 6. Kits : des pierres prêtes à l'emploi

```js
Domino.language({
  id: 'quiz',
  kits: [{ id: 'flow', only: ['flow.switch'], patch: { 'flow.switch': { name: 'Aiguillage (selon)', category: 'Embranchements' } } }, 'data'],
  …
});
Domino.Kits.register('monKit', { types: [{ name: 'tableau', color: '#13A3A0' }], dominos: [ /* définitions */ ] });
```

- **Les types d'un kit** ne remplacent pas ceux du langage, et une pierre du langage du même type l'emporte.
- **`patch`** renomme, recatégorise ou change un callback (le quiz ajoute à l'aiguillage une vérification contre les clés de ses questions).
- **`only`** garde certaines pierres d'un kit.
- **Le langage exporté en JSON** nomme ses kits sans recopier leurs pierres.

## 7. Expressions et dialectes

Une condition, un filtre, un sujet, une valeur calculée : une **expression déclarative** (JSON), écrite en texte par l'auteur.

```js
const Q = Domino.Expr.extend({
  // { "score": { "gte": 3 } } ou score(…) : un opérateur propre au langage.
  score: { args: [1, 1], raw: true, eval: ([c], ev, scope) => scope.score >= c.gte, text: (c) => `score >= ${c.gte}`, doc: 'score minimum' },
});
Domino.language({ id: 'quiz', expr: { ops: Q.ops }, … });      // le dialecte du langage (ws.language.exprDialect)
rc.expr(rc.fields.where, { item })                             // dans un run : évaluer avec la portée par défaut (value, ctx, args, self) + la sienne
```

- **Un champ `kind: 'expr'`** s'écrit en texte dans l'inspecteur et la grande pierre, et s'enregistre en JSON. Une erreur de syntaxe est signalée avec sa position, et le texte est gardé jusqu'à correction.
- **Un opérateur** déclare `args: [min, max]`, `eval(valeurs, évaluer, portée, brut)` ; avec `raw: true`, il reçoit ses arguments non évalués. Il peut aussi déclarer `text(brut, texte)` pour s'écrire, `vars(brut)` pour dire les chemins qu'il lit, et `check(brut)` pour se vérifier.
- **`Domino.Expr.vars(e)`** rend les chemins lus par une expression. Le quiz s'en sert pour signaler une condition qui cite une réponse inconnue.
- **`Domino.Expr.source`** est la fabrique en texte : un générateur l'embarque dans un fichier autonome (le quiz jouable HTML).

## 8. Sauts et champs riches

- **Un champ « renvoi » `jump: true`** fait de sa pierre un saut : l'exécution continue à la cible, et la vue dessine une flèche. ⌖ choisit la cible sur la table.
- **Dans un `run`**, `rc.jump(cible, valeur, { max })` saute depuis n'importe quelle pierre. Il rend `false` quand les passages sont épuisés.
- **Un champ `kind: 'table'`** décrit des lignes : `columns: { texte: { kind: 'text', required: true }, juste: { kind: 'toggle' }, si: { kind: 'expr' } }`, avec `min` et `max` lignes. Exemple : les choix d'une question, les cas d'un aiguillage, les éléments à ordonner.
- **`runtime.call(déclaration, membre, args)`** appelle la méthode d'une classe déclarée : une **source de données** pour un lecteur, un générateur (`ctx.call`) ou un serveur.

## 9. Un langage en données pures

Sans une ligne de JavaScript : des traits, un comportement déclaré, des genres de liens, un moteur, des vues. Il s'importe sans demande de confiance, se vérifie sous Node et se rouvre dans le Concepteur.

```js
Domino.Languages.register({
  format: 'kantoaplo.language', version: 1, id: 'porte', name: 'Porte',
  types: [{ name: 't', label: 'Transition', color: '#7A5AF8' }],
  rules: { chain: 'types', wires: true, cycles: true },
  execution: { engine: 'statemachine' },                              // ou 'tokens', 'decision' ; sans : l'effet domino
  projections: { default: 'diagram', list: ['diagram', 'grid', 'text'] },
  edges: [{ type: 'transition', default: true, label: '{{event}}',
            fields: { event: { kind: 'text', default: '' }, guard: { kind: 'expr' }, after: { kind: 'number' }, action: { kind: 'text', default: '' } } }],
  dominos: [
    { type: 'p.init', traits: [{ id: 'état', initial: true, type: 't' }] },
    { type: 'p.state', traits: ['nommé', { id: 'état', type: 't' }],
      behaviour: { faces: [{ if: 'name == "Erreur"', left: '#F5DFE6', right: '#F5DFE6' }] } },
    { type: 'p.add', left: [{ name: 'x', type: 't' }], right: [{ name: 'x', type: 't' }], fields: { k: { kind: 'number', default: 1 } },
      behaviour: { title: '+ {{k}}', validate: [{ if: 'k < 0', message: 'Négatif.' }], run: { out: ['value + k'] } } },
  ],
});
```

- **Un trait** s'ajoute : `Domino.Traits.register('monTrait', (params) => ({ fields, roles, notation, behaviour, left, right }))`. Les champs et rôles se fusionnent (la définition l'emporte), les vérifications s'additionnent.
- **Un moteur** s'ajoute : `Domino.Engines.register({ id, label, init(session), active, enabled, step?, fire?, nextTimer?, tick?, check? })` ; la session (`state`, `fire`, `step`, `advance`, `run`, `back`, `trace`) est commune.
- **Une projection** s'ajoute : `Domino.Projections.register({ id, label, icon, description, mount(host, editor) → { refresh(), destroy() } })` ; elle écoute `ws.on('change')` et sélectionne avec `editor.select(id)`.
- **Une forme de diagramme** : `notation: { diagram: { shape: 'diamond' | 'circle' | 'pill' | 'table' …, rows: { field, text } } }`.
- **Changer de langage à chaud** : `ws.setLanguage(Domino.language(spec))` ; les vues suivent.

## 10. Avec le Concepteur

Le Concepteur (langage `concepteur`) écrit la même spécification avec des dominos : **Fichier › Créer un éditeur…**, ou par programme :

```js
const { project } = Domino.Meta.decompile(spec);      // une spécification → un projet du Concepteur
const { spec, errors } = Domino.Meta.compile(ws);     // et l'inverse ; errors : [{ where, message }]
```

## 11. Une boîte à outils en JSON

La boîte à outils (la pioche) d'un langage se décrit par sa clé `toolbox`. Sans elle, une catégorie par catégorie de pierre, et une sous-catégorie quand le nom en contient (`category: 'Logique / Comparaisons'` ou `'Logique › Comparaisons'`). Schéma : `engine/schema/toolbox.schema.json`.

```js
toolbox: {
  mode: 'full',                    // 'full' : noms, descriptions, faces ; 'compact' : seulement les dominos
  rest: true,                      // les pierres non citées suivent, par catégorie (vrai par défaut)
  contents: [
    { kind: 'category', id: 'donnees', title: 'Données', icon: '▤', color: '#3B7DDD',
      description: 'Les valeurs et ce qu’on en calcule',            // sous le titre, et dans la fiche d'aide
      help: 'Une valeur part à droite vers la pierre suivante…',      // la fiche « ? »
      link: 'docs/EXTENDING.md',                                       // « En savoir plus » (page du projet ou adresse)
      domino: 'k.number',                                              // facultatif : une pierre présente la catégorie
      expanded: true,                                                  // ouverte au départ (sinon : les catégories du haut le sont)
      contents: [
        { kind: 'category', title: 'Valeurs', contents: [{ kind: 'dominos', category: 'Valeurs' }] },   // toute une catégorie du registre
        { kind: 'category', title: 'Calculs', contents: [
          { kind: 'domino', type: 'k.calc', help: 'Une expression : a + b…' },                         // une pierre, titre et aide propres
          { kind: 'dominos', match: 'k.cmp*' },                                                         // les pierres dont le type correspond
        ] },
        { kind: 'label', text: 'Boucles', help: '…' },                 // un intertitre
        { kind: 'separator' },
      ] },
  ],
}
```

- Chaque pierre n'apparaît qu'une fois ; une catégorie sans pierre disparaît ; une pierre citée qui n'existe pas (ou qui ne se pose pas dans la partie ouverte) est ignorée.
- **Le domino d'une catégorie** : son initiale (ou `icon`) à gauche, le nombre de ses pierres en points de dé à droite, à sa couleur (`color`, ou un jeton `--cat-*` du thème choisi par le nom). Avec `domino`, c'est le dessin de cette pierre.
- `Domino.Toolbox.check(def, types)` signale ce qui ne va pas (le Concepteur s'en sert) ; `Domino.Toolbox.build(def, pierres, { hide, order })` rend l'arbre, sans DOM ; `Domino.Toolbox.filter(arbre, 'texte')` le réduit à une recherche.
- Dans l'éditeur : `editor.toolbox.setMode('compact')`, `toggle(chemin)`, `expandAll()`, `collapseAll()`, `setDefinition(json)` ; `Domino.create(hôte, langage, { toolbox: {...} })` en impose une autre à une instance.
- Le Concepteur a un champ « Boîte à outils » (pierre Langage, groupe Vues) : le JSON y est vérifié et publié avec le langage.

## 12. Des menus en JSON

La barre de menus et les menus contextuels du studio sont des données : `engine/studio/domino.studio.menus.js`. Schéma : `engine/schema/menus.schema.json`.

```js
{ version: 1,
  bar: [
    { id: 'file', title: 'Fichier', description: '…', sections: [            // une section = un groupe, séparé par un trait
      { id: 'new', items: [
        { command: 'file.new' },                                             // une commande (titre, raccourci : ceux de la commande)
        { command: 'file.export', args: 'svg', title: 'Image SVG', description: '…', help: '…' },
        { submenu: 'recent', title: 'Ouvrir récent' },                       // sans contenu : rempli par un fournisseur (Domino.Menus.provider)
        { submenu: 'export', title: 'Exporter', items: [ … ] },              // ou avec ses éléments (ou ses sections)
        { header: 'Langages' },                                              // un intertitre
        { link: 'docs/STUDIO.md', title: 'Le studio' },                      // une page (commande help.open)
      ] } ] },
    { id: 'language', title: 'Langage', dynamicTitle: 'language' },          // prend le nom du langage actif
  ],
  menus: { 'tab/context': { sections: [ … ] } } }
```

Une instance ajoute, remplace ou retire des menus **sans toucher au code**, dans `domino.config.js` :

```js
menus: { bar: [
  { id: 'help', sections: [{ id: 'site', items: [{ link: 'https://intranet.example/aide', title: 'Aide de l’équipe' }] }] },   // ajouté au menu Aide
  { id: 'run', remove: true },                                                                                              // retiré
  { id: 'outils', title: 'Outils', sections: [{ id: 'a', items: [{ command: 'monapp.publier' }] }] },                      // nouveau menu
] }
```

`Domino.Menus.fromJSON(def)` déclare tout et rend `{ bar, off }` ; `Domino.Menus.merge(base, extra)` fusionne (sections ajoutées, `replace: true` remplace, `remove: true` retire) ; `Domino.Menus.check(def)` vérifie.

## 13. Des gabarits

Tout le balisage des composants est dans `engine/ui/domino.templates.js` (éditeur, boîte à outils, menus contextuels, barre d'état) et `engine/studio/domino.studio.templates.js` (en-tête, barre d'état, page de bienvenue, volet vide). Les composants n'écrivent pas de HTML : ils appellent `Domino.Templates.render(nom, données)`.

```js
// Une pierre de la boîte à outils, autrement :
Domino.Templates.override('toolbox.item', (d, h) => h.html`
  <div class="dk-tb-row item"><button class="dk-pi" data-type="${d.type}" title="${d.tooltip}">${h.raw(d.art)}<b>${d.title}</b></button></div>`);
Domino.Templates.reset('toolbox.item');       // revenir au gabarit livré
Domino.Templates.list();                       // [{ name, description, data, overridden }] : chaque gabarit et ses données
Domino.Templates.defineIcons({ run: '<svg…>' }); // remplacer une icône partout
```

- `h.html` (gabarit étiqueté) échappe chaque valeur ; `h.raw()` marque du HTML déjà sûr ; `h.icon(nom)` ; `h.render(autre, données)` insère un autre gabarit.
- Un gabarit remplacé garde les attributs `data-*` et les classes `dk-*` que le composant écoute (`data-type` d'une pierre, `data-toggle` d'une catégorie, `data-help`, `data-tb`…).
- Pour une instance : `ui: { templates: { 'studio.welcome': (d, h) => … }, brand: 'Mon <span>Atelier</span>' }` dans `domino.config.js` (des fonctions : le fichier de configuration JavaScript, pas un JSON).
- Les couleurs, polices et rayons sont des jetons CSS (`design/tokens.css`) : le thème se change là, les gabarits n'en contiennent pas.

## 14. Un outil complexe en dominos (le patron TNR)

L'éditeur de scénarios d'API ([TNR.md](TNR.md)) est fait avec ce que le moteur offre à tous les langages. Chaque besoin a son point d'appui :

```js
Domino.language({
  id: 'tnr', …,
  // Les noms courts se cherchent dans des portées : {{token}} → local.token, env.token, collection.token…
  variables: { scopes: ['local', 'env', 'collection', 'globals'], dynamic: true, declared: (ws) => ['runId', …] },
  // Une campagne : les chaînes d'une partie tombent l'une après l'autre.
  execution: { chains: 'sequential' },
  // La boîte à outils tire ses pierres d'une ressource du projet (la collection importée).
  toolbox: { contents: [{ kind: 'dynamic', source: 'collection' }, …] },
  toolboxSources: { collection: ({ ws }) => [{ kind: 'category', title: '…', contents: [
    { kind: 'domino', type: 'tnr.request', title: 'Login', badge: 'POST', subtitle: '/auth/login',
      fragment: { type: 'tnr.request', fields: {…}, bottom: [{ pip: 0, domino: { type: 'tnr.assert', fields: {…} } }] } },
  ] }] },
  // Les vérifications d'une requête, en liste sous elle.
  options: { adjacents: 'list' },
  projections: { list: ['tnr.dashboard', 'timeline', 'diagram', 'grid', 'text'] },
  inspector: { report: true },
});
```

- **Ressources du projet** : `ws.setAsset(clé, json)` attache un document (une collection, des environnements, un jeu de données) ; il est enregistré avec le projet (clé `assets`), annulable, et ses changements redessinent les sections dynamiques.
- **Fragments** : une entrée de la boîte peut poser une pierre avec ce qui y est collé (adjacentes, suite), au format d'une pierre v2.
- **Rapports** : `rc.report(genre, { status, summary, ms, details })` dans `run`. L'onglet Rapport, la vue Déroulé et `res.reports` les montrent ; le gabarit `report.<genre>` dessine le détail.
- **Exécution** : `runtime.run({ from: id })` ne fait tomber que la chaîne de cette pierre ; `rc.runPartie(entrées, { partie: autreConteneur })` exécute la partie d'un autre conteneur (un scénario réutilisé) ; `rc.rootCtx` est le contexte de toute l'exécution.
- **Importeurs** : `Domino.Importers.register({ id, language, label, detect(json, nom), import(json, { ws }) → { project } | { apply(ws) } })`. Le studio les propose dans Importer ▸ et les essaie à l'ouverture d'un fichier ; `apply` complète le projet ouvert en une annulation.
- **Projection d'un langage** : `Domino.Projections.register({ id: 'tnr.dashboard', language: 'tnr', mount(hôte, éditeur) })` : elle n'est offerte qu'à lui.

Ce patron s'applique à tout outil fait d'un catalogue, de séquences, de contrôles, d'un état partagé et de formats d'échange : tests d'interface, intégration continue, ETL, orchestration.
