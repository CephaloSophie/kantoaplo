# Zeugma : architecture de la plateforme

> Une plateforme pour construire des **langages visuels** avec le jeu de dominos : éditeurs de langage de programmation, outils d'automatisation, éditeurs métier, solutions de logique. Elle ne connaît aucun domaine. **Un éditeur est une instance d'un langage** ; le langage dit tout ce qui change d'un éditeur à l'autre : les couleurs des points et ce qu'elles transportent, les pierres, ce que veut dire le nombre de points à gauche et à droite, comment les pierres se collent ou se relient, la couleur des façades, les déclarations (classes, bibliothèques, fonctions), les générateurs, les onglets de l'inspecteur.

- **Code** : `engine/core` (moteur sans DOM), `engine/ui` (composants d'édition), `engine/studio` (l'application) ; JavaScript sans dépendance à l'exécution ni compilation obligatoire ; le dessin des pierres vient de `design/domino-kit.js`. **La liste des modules et leur ordre** : `domino.manifest.js` (page, tests, outils et build la lisent).
- **Langages de démonstration** : `demos/langages/*.lang.js` (Kanto, Flux, Atelier). **Éditeurs de domaine** : `demos/packs/*.pack.js` (API, workflow, circuit, quiz). Tous dans `index.html`.
- **Studio** : `index.html` est un éditeur complet (menus, volets côte à côte, projets enregistrés, espace de travail) : voir [STUDIO.md](STUDIO.md). Formats : [FORMATS.md](FORMATS.md). Stockage et API : [STORAGE.md](STORAGE.md). Points d'extension : [EXTENDING.md](EXTENDING.md).
- **Tests** : `npm test` (sans navigateur : 142 tests, dont la conformité aux neuf schémas). **Qualité** : `npm run lint` (ESLint). **Build** : `npm run build` → `dist/` (voir §19).
- **Schémas JSON** (2020-12), écrits par `node tools/schemas.js` : `engine/schema/domino.schema.json` (le projet), `resource.schema.json` (les ressources), `language.schema.json` (le langage), `model.schema.json` (le document de modèle), `workspace.schema.json` (l'espace de travail), `config.schema.json` (la configuration), `expr.schema.json` (les expressions), `toolbox.schema.json` (la boîte à outils), `menus.schema.json` (les menus du studio).

---

## 1. Les couches

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ Studio (domino.studio.js) · menus, palette, dialogues (menubar.js) · volets    │  navigateur
│ (panes.js) — tout est une commande                                             │
├───────────────────────────────────────────────────────────────────────────────┤
│ Établi (workbench.js) · Stockage (storage.js) · Commandes (commands.js) ·      │  partout
│ Ressources (resource.js) · Langages (languages.js) · Générateurs (codegen.js) ·│
│ Affichages (display.js)                                                        │
├───────────────────────────────────────────────────────────────────────────────┤
│ Langage (demos/langages/*.lang.js, demos/packs/*.pack.js, ou un fichier JSON)  │
│ types · pierres + callbacks · sens des faces · règles · façades · modules ·     │
│ générateurs · onglets · projet · contexte                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│ Vue (domino.view.js) · DominoPopup (domino.popup.js) · Inspecteur              │  navigateur
│ Mise en page « table » (domino.layout.js) · Dessin (design/domino-kit.js)      │
├───────────────────────────────────────────────────────────────────────────────┤
│ Langage (domino.language.js) · Modules (domino.modules.js)                     │
│ Modèle : pierres, collages, fils, règles, historique, événements (model.js)    │  partout
│ Types (types.js) · Définitions (registry.js) · Contexte (context.js)           │  (Node, navigateur,
│ JSON (serializer.js) · Exécution (runtime.js) · Générateurs (generator.js)     │   serveur)
│ Noyau : bus, erreurs, messages, utilitaires (core.js)                          │
└───────────────────────────────────────────────────────────────────────────────┘
```

Les couches du bas n'utilisent ni le DOM ni le dessin : un serveur charge un langage et un projet, le valide, l'exécute et le génère sans navigateur (`Domino.headless(langage, projet)`).

| Fichier | Rôle | Classe ou objet |
|---|---|---|
| `core/domino.core.js` | Bus d'événements, erreurs à code stable, messages (langue remplaçable), utilitaires | `Emitter`, `DominoError`, `i18n` |
| `core/domino.expr.js` | Expressions déclaratives : JSON ⇄ texte, évaluation sans code, vérification, dialectes, fabrique embarquable | `Expr` |
| `core/domino.behaviors.js` | Traits (comportements de confiance livrés avec le moteur) et comportement déclaré en expressions : un langage en données pures | `Traits`, `Behaviour` |
| `core/domino.engines.js` | Moteurs d'exécution pas à pas : machine à états, jetons (BPMN), arbre de décision ; une même session | `Engines`, `Domino.simulate()` |
| `ui/domino.projections.js` | Le même modèle en diagramme, en tableaux, en texte (écrire, relire, appliquer) | `Projections` |
| `core/domino.meta.js` | Le Concepteur : un langage pour créer des langages, compilé en spécification et décompilé sans perte | `Meta` |
| `core/domino.kits.js` | Kits de pierres réutilisables par tous les langages : `flow` (aiguillage à N cas, retenir), `data` (données, filtrer, transformer, trier) | `Kits` |
| `core/domino.types.js` | Types de points : couleur, genre (`data`, `call`…), héritage, acceptations, compatibilité | `TypeSystem` |
| `core/domino.registry.js` | Définitions de pierres (JSON + callbacks, ou callbacks écrits en texte), sens des faces, pierres du framework | `Registry`, `semantics()` |
| `core/domino.context.js` | Contexte observable, portées, liaisons `{ "$bind" }` et gabarits `{{ }}` | `Context` |
| `core/domino.model.js` | Espace de travail : pierres, collages, **fils**, règles (dont celle du jeu), transactions, annuler / rétablir, diagnostics | `Workspace`, `Node`, `Wire` |
| `core/domino.serializer.js` | JSON versionné (v2 : fils, genres de parties), vérification, migrations, schéma | `Serializer` |
| `core/domino.runtime.js` | Effet domino : chaînes en parallèle, valeurs par fils, appels bloquants ou non, portées d'appel, attente sans fin détectée | `Runtime`, `Frame` |
| `core/domino.generator.js` | Générateurs de code qui lisent le JSON | `Generator` |
| `core/domino.modules.js` | Déclarations (classe, bibliothèque, fonction), corps, signatures, instances, « Appeler » | `Modules` |
| `core/domino.language.js` | Le langage : ce qu'un éditeur instancie ; export en JSON ; son schéma | `Language`, `Domino.language()` |
| `core/domino.describe.js` | Le document de modèle : tout résolu, pour les générateurs et les outils ; son schéma | `Domino.describe()` |
| `ui/domino.templates.js` | **Gabarits** : tout le balisage des composants, nommé et documenté, remplaçable (`override`, `reset`) ; échappement par défaut (gabarit étiqueté `Domino.html`) | `Templates`, `Domino.html` |
| `ui/domino.selection.js` | **Sélection multiple** sans DOM : ensemble ordonné et pierre principale, rectangle, pierres touchées, racines, presse-papiers de plusieurs pierres (liens et fils internes gardés) | `Selection` |
| `ui/domino.toolbox.js` | **Boîte à outils** : un modèle sans DOM construit depuis un JSON (catégories, sous-catégories, pierres, groupes, textes, aide, liens), et le composant (entier ou réduit aux dominos, dépliable, au clavier) | `Toolbox` |
| `ui/domino.layout.js` | Mise en page « table » : chaîne, virages, serpentin, non-collision, adjacentes | `Layout` |
| `ui/domino.view.js` | Éditeur SVG : rendu, fils, glisser-déposer, zones, clavier, menus, ajout rapide | `Editor`, `Domino.create()` |
| `ui/domino.inspector.js` | Inspecteur à onglets, extensible ; éditeur de champs partagé | `Inspector`, `ui` |
| `ui/domino.popup.js` | DominoPopup : la grande pierre, ses voisines collées et reliées, sa fiche | `Popup` |
| `core/domino.resource.js` | Le format « élément » : ressources `apiVersion/kind/metadata/spec/status/extensions`, forme canonique et forme à plat | `Resource` |
| `core/domino.languages.js` | Registre des langages, groupes, modèles de projet, contributions, import JSON sous confiance | `Languages` |
| `core/domino.codegen.js` | Registre des générateurs : cibles, entrée projet ou modèle, plusieurs fichiers | `Codegen` |
| `core/domino.importers.js` | Registre des importeurs : un format d'un autre outil (collection Postman…) → un projet, ou des changements au projet ouvert | `Importers` |
| `core/domino.storage.js` | Adaptateurs (mémoire, navigateur, HTTP, local d'abord), configuration, préférences | `Storage`, `Prefs` |
| `core/domino.workbench.js` | Établi : documents, « modifié », autosauvegarde, secours, récents, disposition des volets | `Workbench`, `Document`, `PaneLayout` |
| `core/domino.commands.js` | Commandes, clauses `when`, raccourcis (accords), menus déclaratifs | `Commands`, `Keys`, `Menus`, `ContextKeys` |
| `core/domino.display.js` | Modes d'affichage des pierres (Pierre, Compacte, Carte détaillée, Contour) | `Displays` |
| `studio/domino.menubar.js` | Barre de menus ARIA, menus flottants, palette, dialogues `<dialog>` | `UI` |
| `studio/domino.panes.js` | Volets : groupes d'onglets, divisions, poignées, glisser d'onglets | `SplitView` |
| `studio/domino.studio.templates.js` | Gabarits du studio : en-tête, barre d'état, bienvenue, volet vide | (dans `Templates`) |
| `studio/domino.studio.menus.js` | La barre de menus et les menus contextuels, **en JSON** | `StudioMenus` |
| `studio/domino.studio.js` | Le studio : un éditeur complet qui relie tout | `Studio`, `Domino.studio()` |
| `studio/domino.app.js` | Le démarrage de la page (lit `DominoConfig`) | — |
| `domino.boot.js` | Le chargeur de la page de développement : lit le manifeste, charge styles et couches dans l'ordre | `DominoBoot` |

### Modules, couches et manifeste

`domino.manifest.js` est **la seule liste des modules**. Chaque couche ne dépend que des précédentes :

| Couche | Contenu | DOM |
|---|---|---|
| `kit` | `design/domino-kit.js` : le dessin des pierres | oui |
| `core` | `engine/core/*` : le moteur | non (Node, navigateur, serveur) |
| `ui` | `engine/ui/*` : gabarits, sélection, boîte à outils, mise en page, vue, inspecteur, projections, DominoPopup | oui (gabarits, sélection, modèle de la boîte et projections : non) |
| `studio` | `engine/studio/*` : barre de menus, volets, gabarits et menus du studio, studio | oui |
| `demos` | langages, éditeurs de domaine, modèles, générateurs | non |
| `app` | `engine/studio/domino.app.js` : monte le studio dans `#app` | oui |

La page de développement (`index.html`) charge le manifeste puis `engine/domino.boot.js`, qui insère styles et scripts dans l'ordre. Les tests (`tests/_load.js`) chargent les entrées `headless` du manifeste dans Node. Le build (`tools/build.mjs`) en fait les bundles de `dist/`. Ajouter un module, c'est l'ajouter à sa couche dans le manifeste, et rien d'autre.

---

## 2. Le langage : ce qu'on instancie

```js
const kanto = Domino.language({
  id: 'kanto', name: 'Kanto', color: '#6A5BDC',
  types: [
    { name: 'nombre', label: 'Nombre', color: '#3B7DDD' },
    { name: 'fonction', label: 'Fonction', color: '#6A5BDC', kind: 'call' },   // un point qui porte une fonction
  ],
  dominos: [ /* § 4 */ ],
  // Ce que veut dire le nombre de points, dans les mots du langage (la lecture par défaut est passée en `base`).
  semantics: (gauche, droite, def, base) => ({ label: { source: 'Expression', step: 'Instruction' }[base.role] }),
  // Comment les pierres se collent et se relient.
  rules: {
    chain: 'types',        // 'types' : couleurs ; 'count' : même nombre de points (le jeu) ; 'both' ; ou une fonction
    wires: true,           // fils point à point permis
    list: [{ id: 'déclencheur', on: 'wire', check: (q) => (q.parent.def.kind === 'déclencheur' ? 'Un déclencheur ne se relie pas.' : true) }],
  },
  // La couleur des façades a un sens dans ce langage (selon le genre ou le rôle d'une pierre), avec sa légende.
  faces: { kinds: { contrôle: { left: '#F4E9D2', right: '#F4E9D2' } }, legend: [{ label: 'Contrôle', left: '#F4E9D2', right: '#F4E9D2' }] },
  // Déclarations : renommées, ou retirées (false).
  modules: { title: 'Déclarations', class: { name: 'Classe' }, library: { name: 'Bibliothèque' }, function: { name: 'Fonction' } },
  generators: [ /* § 11 */ ], inspector: { tabs: [ /* § 16 */ ] },
  context: { … }, project: { … }, options: { table: 1250 }, setup: (editor, Domino) => {},
});

Domino.create('#host', kanto, { skin: 'ivoire', rules: { chain: 'count' } });   // un éditeur
const { ws, runtime, generate } = kanto.instantiate();                            // sans vue
```

- Un objet « pack » d'une version précédente est un langage : `Domino.create(host, pack)` fonctionne toujours.
- **Règle du jeu.** Avec `rules.chain: 'count'`, deux pierres se collent si les faces qui se touchent montrent le même nombre de points, comme au jeu (`connect.count`). `'both'` exige aussi des couleurs compatibles. Une fonction `({ parent, child, out, right, left }) => true | phrase | n° d'entrée` remplace la règle.
- **Règles nommées** (`rules.list`) : chacune s'applique à `on` (`next`, `top`, `bottom`, `wire`, ou toutes) et rend `true` ou la phrase du refus. Dans un langage écrit en JSON, une règle s'écrit `{ id, on, when: "q.child.type === 'x'", message }`.
- **Langage en JSON.** `lang.toJSON()` rend `{ format: 'kantoaplo.language', types, dominos, rules, faces, modules }`. Les callbacks écrits en texte (`code: { run: 'return [inputs[0] * 2]' }`) y figurent ; `Domino.language(json)` les recompile. La démo « Atelier » écrit ainsi des langages avec des dominos.

---

## 3. Une pierre et ses quatre côtés

```text
                 adjacente haute (alimente l'entrée)
                         ┃
          ┌──────────────┸───────────────┐
 chaîne → │ face gauche  ┊  face droite  │ → chaîne
 (avant)  │  ● ●  ◄─fil  ┊   ● ─fil─►    │   (après, et branches)
          └──────────────────────┰───────┘
                                 ┃
                 adjacente basse (consomme la sortie)
```

- **Face gauche** : un point par entrée. **Face droite** : un point par sortie. **La couleur d'un point est son type de connexion.**
- **Zéro est une règle, pas une absence.** Le langage peut donner d'autres mots à ces rôles (`semantics`) ; une pierre dit ce que comptent ses faces (`meaning`).

| Faces | Rôle par défaut | Ce que la pierre peut faire |
|---|---|---|
| `0 \| 0` | Valeur | Se coller en adjacente haute et fournir sa valeur |
| `0 \| n` | Source | Commencer une chaîne, ou alimenter une entrée (adjacente haute) |
| `n \| 0` | Terminale | Finir une chaîne, ou consommer une sortie (adjacente basse) |
| `n \| m` | Étape | Se coller dans une chaîne ; peut aussi être adjacente |
| `chain: false` | Libre | Se poser libre sur la table et se relier par des fils (instance, service, valeur partagée) |
| déclaration | Déclaration | Gauche : ce qu'elle exige ; droite : ce qu'elle offre |

**Façades.** Chaque moitié peut avoir sa couleur : celle de la pierre posée (`meta.faces`), puis le callback `faces(api)`, la définition (`faces`), enfin le langage (`faces.kinds[genre]` ou `faces.roles[rôle]`). Une instance prend la teinte de sa déclaration.

### Adjacentes haute et basse

- Une adjacente est une **petite pierre collée à 90°** sur le grand côté du parent.
- La **haute** se pose au-dessus de la **face d'entrée** et alimente une entrée libre et compatible ; la **basse** se pose sous la **face de sortie** et consomme une sortie.
- Plusieurs adjacentes se partagent la place : leur taille diminue. Une adjacente d'adjacente continue la colonne ; au-delà de `maxDepth` (3), un badge « +n ».
- **La pierre et ses adjacentes tournent d'un seul bloc.** Vers la droite, la haute est en haut ; vers le bas, à droite ; vers la gauche, en bas ; vers le haut, à gauche.

---

## 4. Définir une pierre

```js
{
  type: 'k.wait', name: 'Attendre', category: 'Contrôle',
  kind: 'contrôle',                 // genre : façades et règles du langage s'y réfèrent
  async: true,                      // elle prend du temps : un fil vers elle est dessiné en pointillé qui coule
  left:  [{ name: 'valeur', type: 'any' }],
  right: [{ name: 'valeur', type: 'any' }],
  meaning: { left: 'ce qui attend', right: 'la même valeur, plus tard' },
  fields: { ms: { kind: 'number', label: 'Durée (ms)', default: 300 } },
  chain: true,                      // false : pierre libre, reliée par des fils seulement
  wires: true,                      // false : ses points ne se relient pas par un fil (ou wire: false sur un point)
  where: ['main', 'body', 'component'],   // les parties où elle se pose (declarations : la table des déclarations)
  async run(rc) { await rc.sleep(rc.fields.ms); return [rc.inputs[0]]; },
  // ou, en texte (langage en JSON) : code: { run: 'await rc.sleep(fields.ms); return [inputs[0]];' }
}
```

Un point peut porter `multiple: true` (une entrée qui reçoit plusieurs fils, en liste), `required: false`, `color` (couleur imposée), `wire: false`, `signature` (point « call »).

### Callbacks d'une pierre

Chacun reçoit une **API de pierre** : `domino`, `workspace`, `context`, `language`, `field(clé)`, `raw(clé)`, `set(clé, valeur)`, `title()`, `pips()`, `semantics()`, `parent()`, `children()`, `feeders()`, `wires()`, `wireInto(n°)`, `partieKind()`, `log()`, `emit()`, `meta()`, `state`.

| Callback | Appelé |
|---|---|
| `init` | Une fois, à la création de l'instance |
| `title` | Pour le nom affiché |
| `pips` | Pour les faces de l'instance : elles changent avec les champs, les fils ou les adjacentes |
| `faces` | Pour la couleur de chaque façade selon l'instance |
| `onCreate`, `onDispose` | Après l'ajout, avant la suppression |
| `onChange` | Après le changement d'un champ, du sens ou d'une connexion |
| `onConnect`, `onDisconnect`, `onAttach`, `onDetach` | Collages |
| `onWire`, `onUnwire` | Un fil arrive sur un point de la pierre, ou en part |
| `canConnect` | Dernier mot sur un collage **ou un fil** : `true`, ou une phrase de refus |
| `validate` | Diagnostics propres au domaine |
| `run` | Exécution (effet domino) ; peut être asynchrone |
| `contextMenu`, `render`, `inspect`, `onSelect` | Menu, dessin, inspecteur, sélection |

### Événements de l'espace

`workspace.on(type, fn)` ; `'*'` reçoit tout. `create`, `delete`, `connect`, `disconnect`, `wire`, `unwire`, `wire:set`, `note`, `flag`, `tags`, `move`, `field`, `label`, `turn`, `link`, `meta`, `transaction`, `change`, `undo`, `redo`, `load`, `context`, `select`, `partie`, `log`, `popup`, `run:start`, `run:step`, `run:wire`, `run:call`, `run:var`, `run:enter`, `run:leave`, `run:end`, `custom:<nom>`. Un langage peut s'y abonner dès l'instanciation (`events`).

---

## 5. Coller ou relier

**Coller** (comme au jeu) : la suite à droite, une insertion sur un joint, une adjacente en haut ou en bas. Une pierre collée a un seul parent ; les pierres collées forment des arbres.

**Relier par un fil** : d'un **point de sortie** à un **point d'entrée**, entre deux pierres quelconques de la même partie, collées ou libres.

```text
   ┌──────┬──────┐                         ┌──────┬──────┐
   │      │  ◉━━━┿━━━━━━━━━━━━━━━━━━━━━━━━━━┿━━◎   │      │
   └──────┴──────┘   couleur du point de    └──────┴──────┘
     sortie (plug)   sortie → couleur du      entrée (prise)
                     point d'entrée
   ▮ près de la cible : appel bloquant (l'appelant attend)   ○ : non bloquant (l'appelant continue)
   pointillé qui coule : la pierre appelée est asynchrone
```

| Genre de fil | Quand | Ce qu'il fait |
|---|---|---|
| `call` | La sortie porte une fonction (type de genre `call`, point d'une méthode) | La cible appelle cette fonction ; **bloquant ou non** selon le fil ; **synchrone ou asynchrone** selon la méthode appelée |
| `trigger` | La cible est une pierre libre | Quand la valeur arrive, la pierre libre tombe (et sa chaîne) ; **bloquant** : la chaîne qui pousse attend la fin ; **non bloquant** : elle continue |
| `data` | La cible est dans une chaîne | La valeur attend que la cible tombe ; si la source n'est pas encore tombée, la cible l'attend |

- `workspace.canWire(source, sortie, cible, entrée?)` répond sans rien modifier ; `wire()`, `unwire()`, `setWire(id, { blocking, label, enabled })`.
- Une entrée a un seul fournisseur (précédente, adjacente haute ou fil), sauf `multiple`.
- Un fil de valeur qui ferait une boucle est refusé (`wire.cycle`) ; un fil de fonction ne l'est pas (un appel peut revenir).
- Les adjacentes ne se relient pas par des fils : elles se collent.

---

## 6. Modules : classes, bibliothèques, fonctions

Activés par `modules` dans le langage. Une partie **« Déclarations »** (`kind: 'declarations'`) reçoit une pierre par déclaration ; chacune **s'ouvre dans un onglet** sur son corps (`kind: 'body'`).

| Déclaration | Face gauche | Face droite | Corps |
|---|---|---|---|
| **Classe** | les paramètres du constructeur | une méthode publique par point (sa couleur) | `Constructeur`, `Méthode`, `Retour`, `Lire / Écrire une propriété` (this) |
| **Bibliothèque** (ou autre projet réutilisé) | sa configuration (souvent 0) | ses fonctions | `Méthode`… ; champ « Projet d'origine » |
| **Fonction** | ses paramètres | son résultat | `Paramètres`, puis la chaîne ; `Retour` facultatif |

- Une **méthode** est une chaîne qui commence par `Méthode` : nom, paramètres (`prix:nombre`, un point de sortie chacun), type rendu, asynchrone ou non, publique ou non, couleur de son point. Sans `Retour`, elle rend la dernière valeur de sa chaîne.
- Une **instance** (`inst.<id>`, pioche « Mes classes / Mes bibliothèques ») est une **pierre libre** : à gauche, elle exige les paramètres du constructeur (fils ou adjacentes hautes) ; à droite, elle offre chaque méthode publique par un point coloré. Double-clic : ouvrir sa déclaration.
- **Appeler** (`call`) : un fil depuis le point d'une méthode arrive sur son entrée « fonction » ; ses autres entrées deviennent les paramètres de la méthode (`pips`). Fil bloquant : la chaîne attend le résultat (`await panier.ajouter()`). **Fil non bloquant : un point « suite » apparaît** ; la suite part tout de suite, la branche « résultat » tombe quand le résultat arrive (`notif.envoyer() ⇢`).
- Une **fonction déclarée** apparaît directement dans la pioche (`fn.<id>`, « Mes fonctions ») : ses paramètres à gauche, son résultat à droite ; champ « Attendre le résultat ».
- **Réutiliser** : `editor.exportDeclaration(id)` rend la déclaration et son corps en JSON (`kantoaplo.declaration`) ; `importDeclaration(json)` la pose dans un autre projet du même langage (nouveaux identifiants). Onglet « Modules » de l'inspecteur.
- Tout se dérive du JSON : `Domino.Modules.signatureFromJSON(json, id)` rend la même signature que le moteur, pour les générateurs.
- Un langage renomme chaque genre (`library: { name: 'Connecteur', uses: 'Mes connecteurs' }`) ou le retire (`class: false`).

---

## 6 bis. Une pierre peut tout représenter

Une pierre n'est pas « un bloc de code » : c'est ce que le langage décide. La définition le dit avec `represents` (vocabulaire libre, reconnu par l'inspecteur et le document de modèle) et, si elle contient un monde, avec `inside`.

| Une pierre peut être… | Comment | S'ouvre dans un onglet |
|---|---|---|
| une **valeur**, une **constante**, une **ligne** de code, une **expression**, une **condition** | une définition, `represents: 'ligne'`… | — |
| une **variable** | `decl.variable` dans les déclarations ; la pioche offre « nom » (lire) et « nom ← » (écrire), liés par l'identifiant | double-clic : sa déclaration |
| une **fonction**, une **classe**, une **bibliothèque** | déclarations (§ 6) | double-clic : leur corps |
| un **algorithme**, un **scénario**, un **module**, une **boucle** | `inside: { kind: 'Algorithme', template: [ … ] }` : la pierre contient une partie, créée avec son contenu de départ | double-clic : son intérieur, à n'importe quelle profondeur |
| un **projet** entier, **même d'un autre langage** | `domino.project` : le JSON du projet et son langage ; l'entrée est écrite dans son contexte, le résultat y est lu | double-clic : l'éditeur de son langage, dans un onglet ; chaque modification y est enregistrée |
| un **renvoi** vers un autre élément | `domino.ref`, ou un champ `kind: 'ref'` : `{ "$ref": "id" }` (pierre, partie, déclaration, variable) | double-clic : aller à la cible |
| une **idée**, un **argument**, un **concept**, une **pièce de jeu** | n'importe quel langage (démos Raisonnement et Dominos) | selon le langage |

Les renvois tiennent par l'identifiant : renommer ou déplacer la cible ne casse rien ; une cible disparue est une erreur (`ref.missing`).

## 6 ter. La définition, dans le détail

Au-delà des faces, des types et des callbacks (§ 4), une définition contrôle :

- **Ses champs** : `kind` (`text`, `textarea`, `number`, `select`, `toggle`, `code`, `color`, `json`, `list`, `ref`), `required`, `min`, `max`, `pattern` (Unicode), `options` (liste ou fonction de l'instance), `to` (ce que vise un renvoi), `unit`, `group`, `hidden`, `readonly`, `validate(valeur, api)`. Chaque écart devient un diagnostic (`field.required`, `field.min`, `field.pattern`, `ref.missing`…).
- **Ses contraintes** : `constraints: { deletable, movable, editable, duplicable, max, maxPerPartie, allow, deny }`. `allow` et `deny` disent, côté par côté (`next`, `prev`, `top`, `bottom`, `wireIn`, `wireOut`), quelles pierres sont permises : par type, par genre, par « ce que représente », ou `*`. Refus : `connect.allow`, `connect.deny`, `create.max`. `workspace.can(id, 'delete' | 'move' | 'edit' | 'duplicate')` répond pour l'utilisateur ; l'API garde la main.
- **Sa vie** : `version`, `deprecated` (diagnostic d'information), `examples`.
- Une clé inconnue est signalée (`registry.warnings`), pas refusée : un langage peut évoluer.
- Tout est décrit, clé par clé, par le schéma des langages (`Domino.Language.schema`).

Une **pierre posée** porte aussi : `note` (une note de l'utilisateur), `disabled` (neutralisée : l'effet domino la traverse, ses entrées passent), `locked` (verrouillée pour l'utilisateur), `tags`, et sa **provenance** (§ 8 ter).

## 7. Règles d'assemblage

`canConnect` (coller) et `canWire` (relier) rendent `{ ok: true, … }` ou `{ ok: false, code, reason }`. Les mêmes règles servent au glisser, aux fils, au clavier, à l'ajout rapide et au chargement JSON.

| Code | Règle |
|---|---|
| `connect.leftZero` / `connect.rightZero` | Une face à zéro ne se colle pas de ce côté |
| `connect.count` | Règle du jeu : les faces qui se touchent montrent le même nombre de points |
| `connect.types` | La couleur (le type) de la sortie doit aller avec celle de l'entrée |
| `connect.chainClosed` | Une pierre libre ne se colle pas dans une chaîne |
| `connect.where` | La pierre ne se pose pas dans cette partie |
| `connect.cycle`, `wire.cycle` | Pas de boucle |
| `connect.pipTaken`, `connect.topFull`, `wire.taken` | Une sortie mène à une suite ; une entrée a un fournisseur |
| `connect.topSource` / `connect.bottomSink` / `connect.max` | Adjacentes |
| `wire.off`, `wire.closed`, `wire.adjacent`, `wire.noIn`, `wire.noOut`, `wire.full` | Fils |
| `rule.<id>` | Règle nommée du langage |
| `connect.hook` | Refus donné par un callback `canConnect` |

Les messages sont dans `Domino.i18n` (`i18n.extend('en', {...})`).

**Transactions.** Chaque modification passe par `workspace.transact(libellé, fn)` : une entrée d'historique, un `change`, et une erreur annule tout. `undo()` et `redo()` rechargent l'état JSON (fils compris).

---

## 7 bis. Expressions, sauts, aiguillages, kits

Le créateur de quiz, construit comme banc d'essai, a demandé au cœur ce qu'un éditeur complexe attend. Rien de ceci n'est propre au quiz.

**Expressions déclaratives** (`domino.expr.js`). Une condition, un critère, le sujet d'un aiguillage, une valeur calculée sont des **données JSON**. Elles s'enregistrent dans le projet et s'évaluent sans `eval`.

- Elles s'écrivent en texte lisible, avec un aller-retour garanti : `réponses.continent == "Europe" et score >= 3`, `entre(note, 1, 5)`, `x dans [1, 2]`, `{text: item.nom, correct: item.c == arg}`.
- Opérateurs : `and`, `or`, `not`, `eq`, `ne`, `like`, `gt`, `gte`, `lt`, `lte`, `in`, `contains`, l'arithmétique, `if`, `between`, `count`, `sum`, `min`, `max`, `round`, `percent`, `lower`, `upper`, `empty`, `get`, `list`, `object`.
- Un langage ajoute les siens : c'est son **dialecte** (`expr: { ops }`). Le quiz y ajoute ses conditions historiques (`score`, `percent`, `answer`, `profile`).
- La fabrique s'embarque telle quelle dans un fichier autonome (`Domino.Expr.source`).
- Une connexion peut porter une condition déclarative (`cond: { … }`).
- Une pierre évalue une expression avec `rc.expr(e, portée)`.

**Sauts** :

- La pierre `domino.goto` (« Aller à », catégorie « Liens ») continue l'exécution à une autre pierre de la même partie. Elle sert à revenir en arrière (une boucle), à sauter des étapes, ou à rejoindre des branches.
- Le nombre de passages est borné (`max`). Au-delà, la valeur sort par « épuisé » et la chaîne continue là.
- Tout champ « renvoi » déclaré `jump: true` est un saut. N'importe quelle pierre peut aussi sauter par `rc.jump(cible, valeur)`.
- La vue dessine une flèche pointillée : dorée vers l'avant, rose en arrière, avec ×max.
- Le document de modèle liste les relations `jump`, et la trace d'exécution marque les étapes `cause.via: 'jump'`.
- Diagnostics : une cible manquante, la pierre elle-même, ou une cible dans une autre partie.
- ⌖ **choisit la cible sur la table** (`editor.pick()`, `editor.pickField(id, champ)`) : les pierres possibles sont entourées, Échap annule.

**Aiguillage à N cas et kits** :

- Un langage inclut des **kits** d'une ligne (`kits: ['flow', { id: 'data', patch: { … } }]`), et peut les renommer ou les filtrer.
- `flow.switch` est un switch / case : un sujet (une expression), une sortie par cas (sa valeur, ou sa propre condition), plus « sinon ».
- Les sorties d'une pierre à plusieurs sorties se nomment d'elles-mêmes sur les jointures.
- Le kit `data` (données, filtrer, transformer, trier, garder les premiers) donne au corps d'une méthode de quoi rendre du JSON. Une classe devient ainsi une **source de données**.

**Appels directs** : `runtime.call(déclaration, membre, args)` appelle une méthode (sur une instance neuve) ou une fonction déclarée, hors d'une exécution complète.

- Un lecteur l'emploie pour demander des choix à une classe.
- Un générateur l'emploie par `ctx.call(…)`, de façon asynchrone.
- Un serveur l'emploie de la même façon.

**Nouveaux genres de champs** :

- `expr` : une expression, écrite en texte et enregistrée en JSON, vérifiée dans le dialecte du langage ;
- `table` : des lignes dont chaque colonne est un champ (`text`, `number`, `toggle`, `select`, `expr`, `color`), avec un nombre minimal et maximal de lignes et des colonnes requises. L'inspecteur et la grande pierre ajoutent, déplacent et retirent les lignes.

**Fils vers une adjacente** : les points d'une adjacente suivent son orientation et sa taille, et un fil peut y arriver (la méthode d'une instance vers « Choix calculés », collée en haut d'une question).

## 8. La représentation JSON (version 2)

```json
{
  "format": "kantoaplo.domino", "version": 2,
  "editor": { "id": "kanto", "name": "Kanto" },
  "name": "Boutique",
  "context": { "sortie": [] },
  "parties": [
    { "id": "main", "kind": "main", "name": "Programme", "dominos": [
      { "id": "pan", "type": "inst.cPanier", "position": { "x": 40, "y": 300 }, "fields": { "name": "panier" },
        "top": [{ "pip": 0, "domino": { "id": "eur", "type": "k.text", "fields": { "value": "EUR" } } }] },
      { "id": "n40", "type": "k.number", "position": { "x": 0, "y": 40 }, "fields": { "value": 40 },
        "next": [{ "pip": 0, "map": [1], "domino": { "id": "add", "type": "call" } }] } ] },
    { "id": "decl", "kind": "declarations", "name": "Déclarations", "dominos": [
      { "id": "cPanier", "type": "decl.class", "fields": { "name": "Panier", "color": "#D9539A" } } ] },
    { "id": "cPanier", "kind": "body", "owner": "cPanier", "name": "Panier", "dominos": [ … ] }
  ],
  "wires": [
    { "id": "w1", "from": { "domino": "pan", "pip": 0, "name": "ajouter" }, "to": { "domino": "add", "pip": 0, "name": "fonction" } },
    { "id": "w2", "from": { "domino": "ntf", "pip": 0, "name": "envoyer" }, "to": { "domino": "snd", "pip": 0, "name": "fonction" }, "blocking": false }
  ]
}
```

- `next[].pip` est la sortie du parent, `map` les entrées câblées ; `top[].pip` l'entrée alimentée ; `bottom[].pip` la sortie consommée.
- `wires[]` : `from` (sortie) et `to` (entrée), `blocking: false` pour un appel non bloquant, `label`, `enabled`. Le nom du point est donné pour les générateurs ; le numéro fait foi.
- `parties[].kind` : `main`, `declarations`, `body`, `component` ; `owner` : la pierre qui ouvre la partie.
- Chargement en trois temps : les pierres (déclarations d'abord), puis les fils (ils changent certaines faces), puis les collages.
- Type inconnu conservé ; `Serializer.check()` dit où est l'erreur ; `MIGRATIONS[1]` fait passer un projet v1 en v2.

---

## 8 bis. Le document de modèle

Le JSON du projet est fait pour être enregistré ; **le document de modèle est fait pour être lu**, par un générateur, un outil d'analyse ou un autre programme. Rien n'y est à deviner.

```js
const model = editor.describe();                        // ou Domino.describe(ws, { runtime })
model.elements.snd.faces.left[0].source                 // { via: 'wire', element: 'ntf', pip: 0, connection: 'w2' }
model.connections.find((c) => c.id === 'w2')            // { kind: 'wire', wireKind: 'call', blocking: false, async: true, calls: { member: 'envoyer', … } }
model.run.steps.find((s) => s.element === 'pm').cause   // { via: 'chain', step: 's19' } … jusqu'à l'appel, puis au départ
```

| Partie du document | Contenu |
|---|---|
| `language` | Règles, sens de chaque rôle dans les mots du langage, types, définitions de toutes les pierres utilisées |
| `parties` | Genre, pierre propriétaire, chemin (« Déclarations › Panier »), têtes, **ordre de lecture** |
| `elements` | Chaque pierre : type, titre, `represents`, rôle, place (parent, tête de chaîne, profondeur, ordre), **faces point par point** (type, couleur, **source** de chaque entrée, **cibles** de chaque sortie), champs (valeur brute, valeur résolue, liaison, renvoi), intérieur, déclaration, signature, note, drapeaux, provenance, diagnostics, dernier passage |
| `connections` | Toutes les relations à plat : `chain`, `top`, `bottom`, `wire` (genre, bloquant, asynchrone, méthode appelée), `inside`, `instance`, `calls-function`, `uses-variable`, `reference` |
| `declarations` | Classes, bibliothèques, fonctions, variables : signature, corps, instances, usages, appels, origine |
| `context` | Les valeurs, et chaque liaison ou gabarit qui les lit (et s'il trouve sa clé) |
| `diagnostics`, `journal`, `run` | Les problèmes ; les opérations ; la dernière exécution, étape par étape, avec sa causalité |

Le document suit son schéma (`engine/schema/model.schema.json`) ; les tests le vérifient pour chaque démo. L'onglet « Modèle » de l'inspecteur le montre (la pierre sélectionnée, les relations, le journal, le document entier) et le télécharge.

## 8 ter. Le traçage

- **Provenance** de chaque pierre et de chaque fil (`trace`, sérialisée) : `created: { at, by, how, from }` (pioche, ajout rapide, copie avec son original, import, programme…) et `modified: { at, by, count, last }`. L'auteur est `workspace.author` (option `author` de l'éditeur).
- **Journal** (`workspace.journal`) : une entrée par opération (transaction), avec qui, quand, et chaque événement en bref.
- **Exécution causale** : chaque étape a un identifiant et sa **cause** (`start`, `chain`, `wire`, `pull`, `call`, `construct`, `top`, `bottom`, `inside`) qui renvoie à l'étape qui l'a provoquée, et son **chemin d'appel** (« Programme › notif.envoyer »). On remonte de n'importe quelle étape jusqu'au départ du programme.

## 9. Contexte et liaisons

Arbre de valeurs observable (`get`, `set`, `watch`, `child`). **Liaison** : `{ "$bind": "env.API_URL" }`. **Gabarit** : `"Bonjour {{client.name}}"`. Pierres de liaison `ctx.get` (en adjacente haute) et `ctx.set` (en adjacente basse). Une sous-partie lit le contexte de sa partie ; un appel de méthode écrit dans le contexte du programme (son état propre est `this`). Exécution « à blanc » : `run({ silent: true })`. Mode direct : `options.live`.

---

## 10. Exécution : l'effet domino

**Les chaînes, c'est l'ordre ; les fils, ce sont les valeurs et les appels.**

1. Toutes les chaînes d'une partie tombent **ensemble**. Dans une chaîne, chaque pierre tombe quand la précédente lui donne sa valeur : adjacentes hautes, fils entrants, `run(rc)`, adjacentes basses, la suite.
2. Une sortie `undefined` ne tombe pas (une condition choisit sa branche). **Une sortie qui est une promesse fait tomber sa branche à son arrivée, sans retenir le reste** : c'est l'appel non bloquant.
3. **Fils entrants** : une source libre (valeur, instance, calcul sans chaîne) est **évaluée à la demande, une seule fois** ; une source dans une chaîne est **attendue** jusqu'à ce qu'elle tombe (jointure).
4. **Fil vers une pierre libre** : elle tombe quand toutes ses entrées poussées sont là ; bloquant ou non selon le fil.
5. **Appel** : la chaîne de la méthode tombe dans le corps de la déclaration, dans une **portée d'appel** (`Frame`) avec `this` et ses paramètres. Une instance est construite une fois (son constructeur tombe) et garde son état.
6. **Pierre neutralisée** : elle laisse passer ses entrées sans s'exécuter. **Variables** : une par programme, lues et écrites par leur identifiant ; leurs valeurs finales sont dans `runtime.last.variables`.
7. **Attente sans fin** : si toutes les chaînes attendent une valeur que personne ne donnera, l'exécution s'arrête et le dit (comptage des tâches, plus un chien de garde).

`rc` (donné à `run`) : `inputs`, `in.<nom>`, `fields`, `ctx`, `vars` (variables déclarées), `step` (identifiant de l'étape), `log()`, `sleep(ms)`, `wireInto(j)`, `call(j, …args)` (appelle la fonction reçue sur l'entrée j, bloquant ou non selon son fil), `self` et `args` (dans un corps), `runPartie()`, `results`, `partieInputs`, `frame`, `node`, `api`, `silent`.

La trace (`runtime.last`) donne chaque étape (portée d'appel comprise) ; `instances` donne les objets créés et leur état. La vue anime la chute, la valeur qui parcourt chaque fil, et pose les valeurs sur les joints et les fils.

---

## 11. Générateurs

```js
const g = new Domino.Generator('javascript', { label: 'JavaScript', extension: 'js' })
  .on('project', (json, g) => { for (const d of g.declarations()) { /* d.signature, d.body */ } return '…'; });
g.generate(editor.toJSON());
```

Un générateur ne lit que le JSON. Aides : `next`, `top`, `bottom`, `valueOf`, `chain`, `field`, `all`, `byId`, **`source(n, pip)`** (ce qui alimente une entrée : précédente, adjacente ou fil), **`wiresInto`**, **`wiresFrom`**, **`declarations()`** (signature et corps), `partieOf`, `indent`.

Les démos en fournissent quatorze : JavaScript (exécutable : il écrit la même sortie que l'effet domino) et signatures `.d.ts` (Kanto) ; workflow JSON et séquence Mermaid avec appels bloquants `->>` et non bloquants `-)` (Flux) ; langage JSON et module JavaScript (Atelier) ; OpenAPI, Express, YAML, Mermaid, expression booléenne, Verilog, Quiz JSON, Moodle GIFT (domaines).

**Le registre `Domino.Codegen`** en fait un point d'extension :

- chaque générateur est un descripteur `{ id: 'langage/cible', language, target, extension, input: 'project' | 'model', options, generate(ctx) }` ;
- un langage peut en déclarer directement dans `generators` ;
- `generate(ctx)` peut être asynchrone et interroger le moteur par `ctx.call(déclaration, membre, args)` ; `Codegen.runAsync` l'attend ;
- il rend un texte ou plusieurs fichiers, avec ses diagnostics ;
- un générateur générique (`language: '*'`) sert tous les langages.

Les générateurs des langages y sont adoptés d'eux-mêmes. Trois génériques sont livrés (`demos/generators/doc.gen.js`) : documentation Markdown, graphe Mermaid, document de modèle. Le détail est dans [EXTENDING.md § 2](EXTENDING.md).

---

## 12. Mise en page « table »

La chaîne avance dans son sens, tourne là où une pierre le demande, fait un serpentin au bord de la table, et rien ne se chevauche (évitement, virage refusé s'il enferme la chaîne, chaîne qui glisse vers le bas, pas de demi-tour, fils de branche qui contournent). Les pierres libres gardent leur position. Les fils point à point sont des courbes qui sortent de la face dans le sens de la pierre. Options : `table`, `serpent`, `route`, `names`, `maxDepth`.

---

## 13. Vue, gestes et accessibilité

**Modes d'affichage** (`domino.display.js`) : Pierre, Compacte, Carte détaillée (la pierre et sa fiche : points, champs, problèmes, note), Contour.

- Le mode de la vue fixe l'échelle de la table (`editor.setOption('display', …)`).
- Une pierre peut imposer son dessin (`display` dans sa définition, `meta.display` sur la pierre), jamais son échelle.
- Ce qu'un mode ajoute autour d'une pierre compte dans l'anti-collision. Les points ne bougent pas d'un mode à l'autre.

**Plusieurs vues d'un projet** :

- `Domino.create(hôte, langage, { workspace, runtime })` ouvre une vue de plus. Les vues partagent l'historique ; chacune garde sa caméra, sa partie active et sa sélection.
- `suspend()` et `resume()` mettent une vue cachée en pause. `viewState()` et `restoreViewState()` la retrouvent.
- `destroy()` retire tous ses écouteurs du projet partagé, y compris ceux du `setup()` du langage.

- **Glisser une pierre** (ou de la pioche) : zones de collage (suite, insertion, haute, basse, précédente), fantôme vert ou raison du refus. Les fils d'une pierre soulevée la suivent.
- **Tirer une poignée** (●+) : coller comme entre des nœuds ; relâcher dans le vide ouvre l'ajout rapide filtré.
- **Tirer depuis un point** : un fil, de la couleur des deux points. **Les points compatibles s'allument**, le fil s'y aimante ; sur une pierre, la raison d'un refus s'affiche ; dans le vide, l'ajout rapide propose les pierres qui ont un point compatible et les relie. Tirer depuis une entrée déjà reliée **reprend son fil** (le relâcher dans le vide le retire).
- **Cliquer un fil** : bloquant ou non (avec le genre d'appel, synchrone ou asynchrone), libellé, désactiver, inspecter, retirer.
- **Double-clic** : ouvre ce que représente la pierre (intérieur, déclaration, variable, projet embarqué dans l'éditeur de son langage, cible d'un renvoi) ; sinon la DominoPopup. Une petite marque ▣ ou ↪ dans le coin le signale ; ✎ montre une note, un cadenas une pierre verrouillée ; une pierre neutralisée est grisée.
- **Menu** : annoter, neutraliser, verrouiller ; les permissions de la définition sont respectées (une pierre qui ne se supprime pas le dit).
- **Sélection multiple** : <kbd>Ctrl</kbd> (<kbd>⌘</kbd>) + clic ajoute ou retire une pierre ; <kbd>Ctrl</kbd> + glisser le fond, bouton gauche **ou droit**, trace un rectangle de sélection (<kbd>Maj</kbd> en plus : ajouter à la sélection) ; un <kbd>Ctrl</kbd> + glisser commencé sur une pierre prolonge la sélection. **Sans Ctrl, glisser le fond déplace la vue** : Ctrl distingue la sélection du déplacement. Les pierres sélectionnées sont cernées en pointillés, la principale (celle de l'inspecteur et du clavier) en trait plein ; la barre d'état les compte. Glisser une pierre de la sélection déplace tout le groupe ; Suppr, Ctrl + C, X, D s'appliquent à toutes (une seule entrée d'historique) ; un clic droit sur la sélection ouvre son menu (dupliquer, copier, couper, détacher, neutraliser, verrouiller, supprimer). Coller garde les connexions et les fils entre pierres copiées.
- **La boîte à outils** (la pioche, `domino.toolbox.js`) montre ce qui se pose dans la partie ouverte et suit les déclarations. Elle se décrit en JSON (clé `toolbox` du langage, voir [EXTENDING.md](EXTENDING.md) § 11) : catégories et sous-catégories dépliables, chacune **présentée par un domino** (son initiale ou son icône, et le nombre de ses pierres en points de dé), pierres, groupes, textes, séparateurs, fiche d'aide avec lien. Deux modes : **entier** (noms, descriptions, faces) ou **réduit** aux seuls dominos (une colonne étroite ; un clic sur le domino d'une catégorie la déplie). Tout replier, tout déplier, recherche (nom, description, aide, catégorie), navigation au clavier (↑↓, → déplie, ← replie ou remonte). L'état (mode, catégories ouvertes) est retenu par langage. En tête, quand une seule pierre est sélectionnée : ce qui se colle juste après elle. Sa légende montre les types et les façades du langage.

| Touche | Action |
|---|---|
| <kbd>→</kbd> <kbd>←</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | suite, précédente, adjacente haute, basse |
| <kbd>Alt</kbd> + flèche | tourner la suite |
| <kbd>/</kbd> | ajout rapide |
| <kbd>Entrée</kbd> | configurer ; <kbd>Maj</kbd> + <kbd>Entrée</kbd> : ouvrir déclaration, instance ou conteneur |
| <kbd>Suppr</kbd> | retirer la pierre (la suite se recolle) ou le fil sélectionné |
| <kbd>Ctrl</kbd> + <kbd>D</kbd> / <kbd>C</kbd> / <kbd>X</kbd> / <kbd>V</kbd>, <kbd>Ctrl</kbd> + <kbd>Z</kbd> | dupliquer, copier, couper, coller (une pierre ou toute la sélection), annuler |
| <kbd>Ctrl</kbd> + <kbd>A</kbd>, <kbd>Échap</kbd> | tout sélectionner, désélectionner |
| <kbd>Ctrl</kbd> + clic, <kbd>Ctrl</kbd> + glisser | ajouter ou retirer une pierre, rectangle de sélection |
| <kbd>R</kbd>, <kbd>F</kbd>, <kbd>I</kbd> | effet domino, ajuster la vue, inspecteur |

Chaque pierre a une description (rôle, faces, place, problèmes), chaque geste est annoncé (aria-live), les animations respectent `prefers-reduced-motion`, et la couleur n'est jamais la seule information (types nommés, fils décrits en mots).

API : `editor.ws`, `lang`, `registry`, `types`, `runtime`, `inspector`, `toolbox` (`setMode`, `toggle`, `expandAll`, `collapseAll`, `setDefinition`, `tree()`), `selection`, `toJSON()`, `load(json)`, `run()`, `generate(nom)`, `select(id)`, `selectMany(ids)`, `toggleSelect(id)`, `selectAll()`, `selectedIds()`, `removeSelection()`, `copySelection()`, `cutSelection()`, `duplicateSelection()`, `selectWire(id)`, `wireMenu(id)`, `removeWire(id)`, `insideOf(pierre)`, `openPartie(id)`, `exportDeclaration(id)`, `importDeclaration(json)`, `turn()`, `fit()`, `undo()`, `redo()`, `quickAdd()`, `addInspectorTab()`, `setOption()`, `destroy()`.

---

## 14. DominoPopup (« Configurer »)

La grande pierre, avec ses voisines **collées** (précédente, suites, adjacentes) et **reliées** (sources de ses fils à gauche, cibles à droite, avec le fil en dégradé et son mode). Une pierre libre n'a ni « Avant… » ni « Suite… ». Fiche (ce que comptent les faces), Points, Connexions (dont les fils : bloquant ou non, retirer), Diagnostic ; « Ouvrir sa déclaration » pour une instance.

## 15. Options d'instanciation

`Domino.create(host, langage, options)` ; `editor.setOption(clé, valeur)` en direct.

| Option | Valeurs | Défaut |
|---|---|---|
| `rules` | `{ chain, wires }` : ajuster les règles du langage | celles du langage |
| `skin` | `'ivoire'` · `'ebene'` · `'teinte'` | `'ivoire'` |
| `names`, `grid`, `serpent`, `values`, `live` | booléens | `true`, `true`, `true`, `true`, `false` |
| `table` | largeur en unités | `1150` |
| `route` | `'around'` · `'straight'` | `'around'` |
| `overflow` | `'nine'` · `'engrave'` | `'nine'` |
| `pipColor` | `'type'` · `'none'` | `'type'` |
| `wheel` | `'zoom'` · `'scroll'` | `'zoom'` |
| `runDelay` | ms entre deux chutes | `240` |
| `inspector` | `false` : sans inspecteur (aperçu, éditeur embarqué) | — |
| `coach` | `false` : sans l'aide « Prendre en main » | — |
| `author` | qui modifie (provenance, journal) | `'anonyme'` |

Le langage peut aussi régler la vue (`ui`) : `pioche: { hide: [catégories], order: [catégories] }`, `coach: false`.

## 16. Inspecteur

| Onglet | Contenu |
|---|---|
| Éléments | Arbre des parties (avec leur genre), des pierres et des fils ; la pierre en grand ; faces et ce qu'elles comptent ; points et fournisseurs (⌇ : fil) ; champs ; note, état, provenance ; connexion entrante ; **fils** (bloquant ou non, retirer) ; callbacks ; dernier passage ; JSON |
| Console, Événements, Contexte, JSON, Code, Problèmes, Types | comme avant ; « Exécution » montre la portée d'appel de chaque étape |
| **Modules** | Déclarations : ce qu'elles exigent, ce qu'elles offrent, leurs instances et leurs appels ; exporter, importer |
| **Modèle** | Le document de modèle : la pierre sélectionnée, les relations, le journal, le document entier ; téléchargement, schéma |
| **Langage** | Règles d'assemblage, sens des faces, façades, types ; le langage en JSON, téléchargeable |

Un langage, un domaine ou une entreprise ajoute ses onglets (`inspector.tabs`, `editor.addInspectorTab()`).

---

## 16 bis. Un modèle, trois axes déclaratifs

Depuis le 13e message, un éditeur se décrit sur trois axes indépendants, tous en **données** :

| Axe | Ce qu'on choisit | Où |
|---|---|---|
| **Structure** | types de points, pierres (traits + comportement déclaré), **genres de liens** (fils typés qui portent des champs), règles en expressions, boucles permises | `types`, `dominos`, `edges`, `rules` |
| **Exécution** | l'effet domino (flux de valeurs) ou un **moteur** : `statemachine`, `tokens`, `decision` | `execution: { engine }` |
| **Projection** | dominos, **diagramme**, **tableau**, **texte** : des vues du même modèle, synchronisées | `projections: { default, list, diagram }` |

### Traits et comportement déclaré (`domino.behaviors.js`)

Une pierre compose des **traits** (`nommé`, `état(initial=vrai)`, `tâche`, `porte(mode=and)`, `question`, `feuille`, `entité`, `note`…) et déclare le reste en expressions : `behaviour: { title, validate, faces, pips (each), canConnect, run }`. `run` sait poser des valeurs (`set`), journaliser, attendre, sauter (`jump`, maximum en expression) et produire ses sorties (`out`, `first`). Un champ `expr` est une formule : dans `run`, son nom donne sa valeur calculée. Un langage sans callback s'importe sans demande de confiance (`Languages.countCode(spec) === 0`).

Les traits portent aussi des **rôles** (`roles.state`, `roles.flow`, `roles.decision`, `roles.schema`) que lisent les moteurs, et une **notation** (`notation.diagram.shape`, `rows`) que lit le diagramme.

### Liens typés

`edges: [{ type, name, color, dash, label, fields, from, to, default }]` : un fil porte un genre et des champs (événement, garde, condition, cardinalité). L'étiquette est un gabarit, avec expressions (`{{si(vide(event), "après " + after + " ms", event)}}`). `rules.cycles` permet les boucles (machines à états, graphes).

### Moteurs (`domino.engines.js`)

```js
const s = Domino.simulate(ws);   // la session du moteur du langage
s.state(); s.enabled(); s.fire('ouvrir'); s.step(); s.advance(5000); s.run(); s.back(); s.trace;
```

- `statemachine` : état initial, transitions par fil (`event`, `guard`, `after` sur une horloge virtuelle, `action`), actions d'entrée et de sortie ; les transitions sans événement se prennent seules.
- `tokens` : début, tâches (actions sur les variables), portes xor (première condition vraie, sinon le lien `default`) et and (parallèle ; à plusieurs arrivées, jointure), fins.
- `decision` : questions (une sortie par réponse, chacune avec sa condition sur les entrées), feuilles (verdict) ; réponse à la main possible.

Les actions sont un petit langage : `n := n + 1; émettre("fin")`. `Runtime.run` délègue au moteur du langage et garde la forme de la trace (la vue anime, l'inspecteur montre) ; l'onglet **Simuler** de l'inspecteur avance pas à pas, avec retour arrière, et les autres vues allument les états actifs (événement `sim`). Les diagnostics du moteur (pas d'état initial…) rejoignent les Problèmes.

### Projections (`domino.projections.js`)

`editor.project('diagram' | 'grid' | 'text' | 'dominos')`, ou la barre au-dessus de la table. Toutes partagent le projet (une modification s'annule d'un Ctrl+Z, la sélection suit) ; « Affichage › Ouvrir à côté en… » met deux projections côte à côte.

- **Diagramme** : formes des traits, disposition en couches (croisements réduits), en arbre ou libre (positions dans `meta.at`), arêtes parallèles écartées, étiquettes, formes « table » (une entité et ses attributs) ; export SVG ; fonctions pures `layout()` et `toSVG()`.
- **Tableau** : une table par type de pierre, une colonne par champ, valeurs typées.
- **Texte** : `print` / `parse` / `apply` ; une ligne par pierre (`id type champ=valeur`), l'indentation et `>`, `^`, `v` pour les collages, `~ a.0 -> b.0 genre champ=valeur` pour un fil ; erreurs avec leur ligne ; `ws.replace(json)` applique en une seule entrée d'historique.

Une projection s'ajoute : `Domino.Projections.register({ id, label, mount(host, editor) → { refresh, destroy } })`.

### Le Concepteur (`domino.meta.js`)

Le langage `concepteur` décrit un langage avec des dominos : une pierre **Langage** (identité, moteur, vues, règles), et trois chaînes : types de points, pierres (points et champs en tableaux, traits en texte, titre, forme, comportement), genres de liens. `Meta.compile(ws)` rend la spécification et ses erreurs (avec l'endroit) ; `Meta.decompile(spec)` fait l'inverse, **sans perte** (les clés que le Concepteur ne montre pas restent dans « Autres clés »). `ws.setLanguage(L)` change de langage à chaud : le projet est relu, l'historique gardé, les vues suivent (`editor.reloadLanguage`).

Dans le studio : **Fichier › Créer un éditeur…** (Ctrl+Alt+L) propose huit modèles et une page vierge ; le Concepteur s'ouvre à gauche, l'aperçu à droite, et chaque modification recompile et remplace le langage dans les projets ouverts. Les brouillons sont gardés (collection `drafts`) et rechargés avant la restauration ; **Publier** les range avec les langages importés et télécharge `id.language.json`.

### Huit modèles (`demos/patterns/patterns.js`)

blocs, flux de données, machine à états, arbre de décision, processus, formulaire, schéma de données, carte mentale : chacun en JSON pur, avec un exemple de quinze pierres au plus, qui s'exécute ou se dessine.

### Performance

Révision `ws.rev`, `validate()` mémorisé, index (par partie, fils entrants et sortants), mise en page par grille spatiale, historique en texte partagé : à 5 000 pierres, chargement ≈ 45 ms, mise en page ≈ 145 ms, exécution ≈ 45 ms, historique ≈ 50 Mo (`node --expose-gc tools/bench.js`).

---

## 17. Face à Blockly

| Besoin | Blockly | Zeugma |
|---|---|---|
| Ce qu'on instancie | Une boîte à outils de blocs | **Un langage** : types et leur genre, pierres, sens des faces, règles, façades, modules, générateurs, onglets ; exportable en JSON, écrit même avec des dominos (Atelier) |
| Signification des connecteurs | `previous` / `next` / `output` / `input` | Nombre de points = entrées et sorties ; zéro est une règle ; **le langage redéfinit le sens** ; règle du jeu (même nombre) en option |
| Types de connexion | `check` (chaînes) | Types colorés avec héritage, acceptations et **genre** (valeur, fonction…) |
| Relier deux blocs éloignés | Impossible sans les emboîter | **Fils point à point** en dégradé, entre pierres collées ou libres ; jointures ; déclenchements |
| Fonctions et objets | Procédures | **Classes, bibliothèques (ou projets réutilisés), fonctions** ; instances libres ; méthodes offertes par des points colorés ; corps dans des onglets |
| Synchrone, asynchrone, bloquant | Hors bibliothèque | Selon la pierre appelée (async) et selon le fil (bloquant ou non) ; vu sur la table et dans le code généré |
| Explication d'un refus | Silencieux | Code stable et phrase, partout ; règles nommées du langage |
| Exécution | Hors bibliothèque | `Runtime` : chaînes parallèles, valeurs à la demande, appels, portées, attente sans fin détectée |
| Générateurs | Sur les blocs vivants | Sur le JSON seul (signatures comprises) |
| Outils du développeur | Hors bibliothèque | Inspecteur à onglets (Modules, Langage…), extensible |
| Sérialisation | JSON | JSON versionné (v2), schéma publié, migrations, types inconnus conservés |
| Ce que représente un bloc | Un bloc de code | N'importe quoi : variable, ligne, classe, algorithme, scénario, **projet d'un autre langage**, idée, pièce de jeu ; ce qui contient un monde s'ouvre dans un onglet |
| Ce que reçoit un générateur | Les blocs vivants | **Un document de modèle** : chaque point avec sa source et ses cibles, chaque relation, chaque déclaration, résolus, avec leur schéma |
| Contrôle des blocs | `deletable`, `movable`, `editable`, `check` | Contraintes par côté (`allow` / `deny` sur suite, précédente, adjacentes, fils), nombre d'exemplaires, champs validés (requis, bornes, motif, renvoi), dépréciation, permissions interrogeables |
| Traçage | Événements | Provenance de chaque pierre et fil, journal des opérations, exécution causale |
| Sémantique d'exécution | Une seule (le code généré) | Effet domino, **machine à états, jetons, arbre de décision**, simulés pas à pas |
| Vues | Les blocs | **Dominos, diagramme, tableau, texte**, synchronisés, côte à côte |
| Créer un éditeur | Écrire du JavaScript | **Le Concepteur** : des dominos, aperçu en direct, publié en JSON sans code |

---

## 18. Tests

`npm test` (`node --test`) : 142 tests.

- **Moteur** (`tests/engine.test.js`, 14) : types, définitions, assemblage, adjacentes, insertion, annuler / rétablir, aller-retour JSON, contexte, exécution, callbacks, générateurs, événements, exécution à blanc.
- **Plateforme** (`tests/platform.test.js`, 10) : fils (refus, JSON, annuler) ; règle du jeu et règles nommées ; valeur libre lue une fois et jointure ; déclenchement bloquant ou non ; classes, instances, appels bloquants et non bloquants, état ; langage en JSON avec callbacks en texte ; démos Kanto (le JavaScript généré s'exécute), Flux (appels en parallèle), Atelier (un langage écrit par des dominos se joue).
- **Modélisation** (`tests/model.test.js`, 11) : définitions et champs contrôlés, permissions, intérieur créé depuis un gabarit, notes et drapeaux, provenance et journal, variables, renvois, projet embarqué d'un autre langage, document de modèle et causalité, démos Raisonnement et Dominos.
- **Schémas** (`tests/schema.test.js`, 5) : les six schémas publiés sont ceux du moteur ; chaque projet, ressource, document de modèle (exécution comprise) et langage des neuf démos s'y conforme, comme l'espace de travail et la configuration livrée.
- **Créateur de quiz** (`tests/quiz.test.js`, 7) :
  - vingt questions sans diagnostic ;
  - le parcours joué par l'effet domino, chaque chemin de l'aiguillage, la seconde chance bornée ;
  - les choix conditionnels et calculés, la notation de chaque genre ;
  - le JSON, le HTML jouable, GIFT ;
  - le modèle « Géographie » ;
  - les diagnostics.
- **Ressources** (`tests/resource.test.js`, 5) : aller-retour sans perte (canonique et à plat) pour les neuf démos, chargement d'une ressource, extensions conservées, `status` jamais relu, validation.
- **Stockage** (`tests/storage.test.js`, 7) : un même contrat pour la mémoire, le navigateur et HTTP (fetch simulé : ETag, If-Match, 412, 401, reprises, délai) ; quota plein ; repli en mémoire ; local d'abord avec file hors ligne ; configuration.
- **Établi** (`tests/workbench.test.js`, 7) : modèles de chaque langage, « modifié » et annuler jusqu'à l'état enregistré, autosauvegarde, brouillons restaurés, fermeture confirmée, conflit, fichiers, disposition des volets.
- **Commandes** (`tests/commands.test.js`, 5) : clauses `when`, raccourcis et accords, menus, registre des langages et import sous confiance.
- **Générateurs et affichages** (`tests/codegen.test.js`, 4).
- **Expressions** (`tests/expr.test.js`, 4) : aller-retour texte ⇄ JSON, évaluation, erreurs avec position, dialectes, fabrique embarquée.
- **Cœur enrichi** (`tests/flow.test.js`, 8) :
  - un saut borné (« épuisé », cause `jump`, relation `jump`) et ses diagnostics ;
  - un aiguillage à N cas ;
  - une connexion à condition déclarative ;
  - le kit data dans une méthode, appelée par `runtime.call` ;
  - les champs expression et tableau ;
  - les kits renommés et filtrés ;
  - un générateur déclaré par le langage, asynchrone, qui appelle le moteur.
- **Performance** (`tests/perf.test.js`, 2) : doubler la taille multiplie les temps par moins de quatre ; `validate()` mémorisé et index cohérents.
- **Liens typés** (`tests/edges.test.js`, 4) et **comportements déclarés** (`tests/behaviors.test.js`, 4).
- **Moteurs** (`tests/engines.test.js`, 6) : actions, machine à états (gardes, délais, retour arrière), jetons (xor, parallèle, jointure), décision, langages sans moteur.
- **Projections** (`tests/projections.test.js`, 5) : texte aller-retour, appliquer en une annulation, erreurs par ligne, diagramme, tableaux.
- **Modèles** (`tests/patterns.test.js`, 3) et **Concepteur** (`tests/meta.test.js`, 5) : JSON pur, exemples exécutés, décompiler puis recompiler à l'identique, changement de langage à chaud.
- **Composants** (`tests/ui.test.js`, 12) : gabarits (échappement, remplacement, documentation), sélection (ensemble, rectangle, racines, presse-papiers avec liens internes), boîte à outils (registre, sous-catégories, définition JSON, groupes, recherche, vérification, chaque démo, aller-retour par le Concepteur), menus en JSON (`fromJSON`, `merge`, `check`, la barre du studio), manifeste (fichiers présents, couches sans DOM).
- **Scénarios d'API (TNR)** (`tests/postman.test.js`, 13) : portées nommées, ressources du projet, rapports, `from` et chaînes séquentielles, boîte dynamique et fragments, importeurs ; lecture de la collection du dépôt et conversion de chaque script ; serveur simulé ; campagne exécutée et rapportée (secrets masqués) ; export Postman (scripts valides) et réimport à l'identique.
- **La vue** se teste dans un navigateur sans interface (voir `docs/DEMOS.md`).

---

## 19. Construire et livrer

| Commande | Effet |
|---|---|
| `npm install` | Installe les bibliothèques externes **par npm** : polices `@fontsource/*` (copiées dans `vendor/fonts` par `tools/vendor.mjs`, jeux latin et latin étendu, woff2), `esbuild` (build), `eslint` (qualité). Aucune page ne charge quoi que ce soit d'un CDN ou d'un autre site. |
| `npm run dev` / `npm run serve` | Serveur statique sans dépendance (`tools/serve.mjs`) : les sources, ou `dist/` |
| `npm run lint` | ESLint (`eslint.config.js`) : recommandé, plus `eqeqeq`, `prefer-const`, `no-var`, `no-implicit-globals`… |
| `npm test` | Les tests Node |
| `npm run build` | `dist/` (voir ci-dessous) ; échoue si une page construite charge une ressource hors de `dist/` |
| `npm run check` | lint, tests, build |

`dist/` contient le studio (`index.html`, `assets/studio.<empreinte>.js` et `.css`, minifiés, avec cartes de source), sa configuration **non minifiée** (`domino.config.js`, à modifier au déploiement), les polices, les bibliothèques (`lib/domino.core.js` pour Node ou le navigateur, `lib/domino.ui.js` pour intégrer un éditeur, `lib/domino.studio.js`, `lib/domino.demos.js`, `lib/domino.css`), la documentation, les schémas, les pages de design et `build.json` (version, date, fichiers, tailles).

```js
const Domino = require('./dist/lib/domino.core.js');   // le moteur seul, dans Node
require('./dist/lib/domino.demos.js');                 // et les langages des démos
```

---

## 20. Ce que le cœur a gagné avec l'éditeur TNR

| Capacité | Où | Pour quoi |
|---|---|---|
| Portées nommées et variables dynamiques | `Context.configure({ scopes, dynamic })`, `locate`, `lookup`, `resolves` ; clé `variables` du langage (avec `declared`) | `{{token}}` cherché dans local, env, collection, globals ; `{{$guid}}` ; diagnostics justes |
| Ressources du projet | `ws.assets`, `getAsset`, `setAsset` (annulable, événement `asset`) ; clé `assets` du format v2 (schéma) | Un catalogue importé (collection, environnements) voyage avec le projet |
| Boîte à outils dynamique, préréglages, fragments | `{ kind: 'dynamic', source }`, `toolboxSources`, `Toolbox.source()` ; entrées `fields`, `fragment`, `badge`, `subtitle` | Les requêtes d'une collection, prêtes à poser avec leurs vérifications |
| Rapports d'exécution | `rc.report()`, `res.reports`, événement `run:report`, `n.state.report` ; onglet **Rapport** ; gabarits `report.*` | Ce que le testeur doit lire |
| Exécution ciblée et séquentielle | `run({ from })`, `execution.chains: 'sequential'`, `rc.runPartie(e, { partie })`, `rc.rootCtx` | Une campagne ordonnée, un scénario seul, un scénario réutilisé |
| Importeurs | `core/domino.importers.js` ; studio : Importer ▸, détection à l'ouverture | Les formats des autres outils |
| Déroulé | projection `timeline` (`Projections.timeline.plan / fromRun`) | Le scénario présenté étape par étape, avec ses résultats |
| Projection propre à un langage | `Projections.register({ language })`, `forLanguage` dans l'ordre du langage | Le tableau de bord TNR |
| Adjacentes en liste | `layout` : option `adjacents: 'list'` (et dans Options de l'éditeur) | Une pierre et ses contrôles, lisibles dans un éditeur chargé |
| Exporter ▸ | studio : générateurs du langage, fichiers téléchargés | Collection et environnements Postman, plan de test |
