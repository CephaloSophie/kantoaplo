# Zeugma

> **Zeugma** (ζεῦγμα, « joug, attelage, ce qui lie deux choses ») : c'est la connexion entre dominos. Le nom porte le mécanisme central (ça s'emboîte, ça s'enchaîne), et le mot est aussi une figure de style, donc il a du caractère. Zeugma est un projet du monde **Kantoaplo**.

> **Psèphos** (ψῆφος, « le caillou qui compte et qui vote ») : le nom propre d'une pierre de Zeugma. Au lieu de dire « un bloc » ou « un domino », on dit **un psèphos** (pluriel : **psèphoi**). Même racine que ψηφίς, la tesselle des mosaïques : un éditeur Zeugma est une mosaïque de psèphoi.

Une plateforme pour construire des **langages visuels** à partir du jeu de dominos : langages de programmation, outils d'automatisation, éditeurs métier, solutions de logique. Chaque bloc est une pierre :

- **face gauche** : ses entrées ; **face droite** : ses sorties. Le nombre de points a un sens, que chaque langage définit (zéro compris) ;
- **couleur de chaque point** : son type de connexion ; **couleur de chaque façade** : ce que la pierre est, dans ce langage ;
- **coller** comme au jeu (la suite, une insertion, des adjacentes haute et basse à 90°), au besoin avec la règle du jeu : les faces qui se touchent montrent le même nombre ;
- **relier par un fil** un point de sortie à un point d'entrée, entre pierres collées ou libres ; le fil prend la couleur des deux points, il est bloquant ou non ;
- **déclarer** des classes, des bibliothèques (ou d'autres projets réutilisés), des fonctions et des variables, les ouvrir dans un onglet, en poser des instances libres et appeler leurs méthodes, offertes par des points colorés ;
- **tout représenter** : une pierre peut être une ligne de code, un algorithme, un scénario, un projet entier (même d'un autre langage), une idée, une pièce de jeu ; ce qui contient un monde s'ouvre dans un onglet ;
- **tout exprimer sans code** : conditions, filtres et valeurs calculées sont des **expressions déclaratives** (JSON, écrites en texte : `réponses.continent == "Europe" et score >= 3`) ; des **sauts** (« Aller à ») rejoignent des branches ou reviennent en arrière ; un **aiguillage** a autant de sorties que de cas ; une classe peut être une **source de données** qui rend du JSON ;
- **tout modéliser** : le document de modèle (`editor.describe()`) donne chaque pierre, chaque point, chaque relation, résolus, avec la provenance et la causalité de l'exécution, selon un schéma publié. La génération de code reste à qui veut l'écrire.

**Un modèle, trois axes, tout en données.** Un éditeur se compose d'une *structure* (pierres faites de **traits**, comportement en expressions, **liens typés** qui portent des champs), d'une *exécution* (l'effet domino, une **machine à états**, des **jetons** façon BPMN, un **arbre de décision**, simulés pas à pas) et de *projections* (le même projet en **dominos, diagramme, tableau ou texte**, côte à côte). Et l'outil qui crée les éditeurs est lui-même un éditeur de dominos : le **Concepteur** (Fichier › Créer un éditeur…) compile votre langage en direct, l'aperçu change sous vos yeux, et le résultat est un fichier JSON sans code. Huit modèles servent de point de départ : blocs, flux de données, machine à états, arbre de décision, processus, formulaire, schéma de données, carte mentale.

Le tout s'ouvre dans **Domino Studio**, un éditeur complet :

- une barre de menus **décrite en JSON** (Fichier › Nouveau ▸ un langage ▸ un modèle, Ouvrir, Enregistrer, Exporter…), une palette de commandes (F1) et des raccourcis ;
- une **boîte à outils** (la pioche) décrite en JSON par chaque langage : catégories et sous-catégories dépliables, chacune présentée par un domino, textes, aides et liens ; entière, ou réduite aux seuls dominos ;
- la **sélection multiple** : Ctrl + clic, ou Ctrl + glisser (bouton gauche ou droit) pour un rectangle de sélection ; sans Ctrl, glisser déplace la vue. Supprimer, copier, couper, dupliquer et déplacer s'appliquent à tout le groupe ;
- un éditeur **de scénarios d'API (TNR) à la Postman** : importer une collection et ses environnements, composer des scénarios avec des pierres (requêtes, vérifications et extractions en liste, données passées par fils, variables partagées), les exécuter (réseau ou serveur simulé) avec un rapport pour testeur, un Déroulé et un tableau de bord, puis exporter vers Postman et newman ([docs/TNR.md](docs/TNR.md)) ;
- un balisage **centralisé** : chaque morceau d'interface est un gabarit nommé (`Domino.Templates`), remplaçable sans toucher aux composants ;
- des onglets côte à côte (deux vues du même projet), des volets redimensionnables et des dispositions toutes faites ;
- quatre affichages des pierres (Pierre, Compacte, Carte détaillée, Contour) ;
- des projets enregistrés dans le navigateur, avec enregistrement automatique, sauvegardes de secours et un espace de travail restauré au démarrage. Une API distante se branche par le fichier de configuration `domino.config.js`, sans toucher au code.

Chaque élément s'écrit en JSON selon une abstraction publiée (`apiVersion`, `kind`, `metadata`, `spec`, `status`, `extensions`).

Un éditeur est une **instance d'un langage**. Le langage dit les types, les pierres et leurs callbacks, le sens des faces, les règles, les façades, les modules, les générateurs et les onglets de l'inspecteur. Il peut s'écrire en JavaScript ou en JSON, et même avec des dominos (démo « Atelier »).

## Installer, lancer, construire

```sh
npm install        # les bibliothèques externes viennent de npm (polices @fontsource, esbuild, ESLint) ;
                   # « postinstall » copie les polices dans vendor/fonts : aucun lien vers un CDN ni un autre site
npm run dev        # http://localhost:5173 : les sources (index.html charge les modules de domino.manifest.js)
npm run build      # dist/ : le studio minifié avec toutes les démos, les bibliothèques, la documentation
npm run serve      # http://localhost:5173 : dist/
npm run check      # lint + tests + build
```

`index.html` s'ouvre aussi directement dans un navigateur (file://), sans serveur et sans compilation.

| Fichier | Contenu |
|---|---|
| `index.html` | **Domino Studio** : un éditeur complet (menus, volets, projets enregistrés), six langages (Kanto, Créateur de quiz, Flux, Atelier, Raisonnement, Dominos), trois éditeurs de domaine (API, workflow, circuit), huit modèles et le Concepteur, avec l'inspecteur |
| `domino.manifest.js` | **La seule liste des modules**, par couche et dans l'ordre : la page, les tests, les outils et le build la lisent |
| `domino.config.js` | La configuration de l'instance : stockage (navigateur, mémoire, API), enregistrement automatique, langages, interface, menus, gabarits, raccourcis |
| `dist/` | Le build (`npm run build`) : `index.html`, `assets/studio.<empreinte>.js/.css`, `lib/` (moteur seul, éditeur, studio, démos), `fonts/`, `docs/`, `schema/`, `design/` |
| `design/design-system.html` | Le design system (ses figures sont dessinées par le moteur) |
| `design/studio.html` | La maquette de design précédente (cinq domaines) |

## Organisation

Le code est rangé en **couches** ; une couche ne dépend que de celles d'en dessous. Chaque fichier est un module qui
s'ajoute à `globalThis.Domino` (navigateur comme Node), sans dépendance à l'exécution.

```text
domino.manifest.js     les modules et leur ordre (kit → core → ui → studio → demos → app)
domino.config.js       la configuration d'une instance
engine/
  domino.boot.js       chargeur de la page de développement (lit le manifeste)
  core/                le moteur, sans DOM (Node, navigateur, serveur)
    domino.core.js        bus, erreurs, messages
    domino.expr.js        expressions déclaratives : JSON ⇄ texte, évaluation sans code, dialectes
    domino.behaviors.js   traits et comportement déclaré : un langage en données pures
    domino.types.js       types de points (couleur = type ; genre : valeur, fonction…)
    domino.registry.js    définitions de pierres (JSON + callbacks, ou callbacks en texte), sens des faces
    domino.context.js     contexte, liaisons {$bind}, gabarits {{ }}
    domino.model.js       espace : collages, fils, règles (dont celle du jeu), transactions, diagnostics
    domino.serializer.js  JSON versionné (v2), vérification, migrations, schéma
    domino.resource.js    ressources : apiVersion, kind, metadata, spec, status, extensions ; forme à plat
    domino.runtime.js     effet domino : chaînes en parallèle, valeurs par fils, appels bloquants ou non
    domino.engines.js     moteurs pas à pas : machine à états, jetons (BPMN), arbre de décision
    domino.generator.js   générateurs de code depuis le JSON
    domino.modules.js     classes, bibliothèques, fonctions, instances, « Appeler »
    domino.kits.js        kits de pierres réutilisables : flow (aiguillage à N cas), data (filtrer, transformer…)
    domino.language.js    le langage : ce qu'un éditeur instancie ; export en JSON ; son schéma
    domino.languages.js   registre des langages, modèles de projet, contributions au studio
    domino.codegen.js     registre des générateurs (cibles, modèle ou projet, plusieurs fichiers)
    domino.describe.js    le document de modèle : tout résolu, pour les générateurs ; son schéma
    domino.storage.js     stockage : mémoire, navigateur, API HTTP, local d'abord ; configuration ; préférences
    domino.workbench.js   établi : documents, « modifié », autosauvegarde, secours, récents, volets
    domino.commands.js    commandes, clauses when, raccourcis, menus déclaratifs (et menus en JSON)
    domino.display.js     modes d'affichage des pierres
    domino.meta.js        le Concepteur : un langage pour créer des langages (compiler, décompiler)
  ui/                  les composants d'édition (DOM ; les modèles marqués * se chargent aussi dans Node)
    domino.templates.js * gabarits : tout le balisage des composants, à un seul endroit, remplaçable
    domino.selection.js * sélection multiple : ensemble, rectangle, racines, presse-papiers de plusieurs pierres
    domino.toolbox.js     boîte à outils (pioche) : modèle* construit depuis un JSON, et composant (entier ou réduit)
    domino.layout.js      mise en page « table » (virages, serpentin, non-collision, adjacentes)
    domino.view.js        éditeur SVG : rendu, fils, gestes, sélection multiple, clavier
    domino.inspector.js   inspecteur à onglets (dont Modules, Langage, Simuler)
    domino.projections.js * le même modèle en diagramme, en tableaux, en texte
    domino.popup.js       DominoPopup : la grande pierre, ses voisines collées et reliées
    domino.css            styles des composants
  studio/              l'application
    domino.menubar.js     barre de menus, menus, palette, dialogues
    domino.panes.js       volets : onglets, divisions, poignées
    domino.studio.templates.js  gabarits du studio (en-tête, barre d'état, bienvenue)
    domino.studio.menus.js      la barre de menus et les menus contextuels, en JSON
    domino.studio.js      le studio : commandes, documents, Concepteur
    domino.app.js         le démarrage de la page
    domino.studio.css     styles du studio
  schema/              domino, resource, language, model, workspace, config, expr, toolbox, menus
demos/langages/    Kanto (programmation), Créateur de quiz (20 questions, choix calculés, aiguillages, sauts),
                   Flux (automatisation), Atelier (un langage pour écrire des langages), Raisonnement (une théorie), Dominos (le jeu)
demos/packs/       éditeurs de domaine : API, workflow, circuit
demos/patterns/    huit langages-modèles en JSON pur (blocs, flux, états, décision, processus, formulaire, schéma, carte)
demos/postman/     Scénarios d'API (TNR) : un éditeur à la Postman (import/export Postman, serveur simulé, rapport, tableau de bord)
postmanFile/       la collection Postman « Kýdos Belote » et son environnement : la source de l'exemple TNR
demos/generators/  générateurs génériques (tous les langages) : documentation, graphe Mermaid, modèle
design/            kit de dessin, tokens, design system, maquette
docs/              IDEE.md (l'idée), ARCHITECTURE.md (la plateforme), STUDIO.md (l'éditeur), FORMATS.md (les formats),
                   STORAGE.md (stockage et API), EXTENDING.md (points d'extension), DEMOS.md (les démos)
tools/             vendor.mjs (polices npm → vendor/), build.mjs (dist/), serve.mjs (serveur statique),
                   schemas.js (schémas publiés), bench.js (performances)
tests/             node --test
```

## Utiliser

```js
const lang = Domino.language({
  id: 'mini', name: 'Mini',
  types: [{ name: 'nombre', label: 'Nombre', color: '#3B7DDD' }],
  dominos: [
    { type: 'src', name: 'Source', right: [{ type: 'nombre' }], run: () => [42] },
    { type: 'show', name: 'Afficher', left: [{ type: 'nombre' }], code: { run: "log('info', inputs[0]); return [];" } },
  ],
  rules: { chain: 'count', wires: true },   // comme au jeu : même nombre de points des deux côtés
  modules: true,                            // classes, bibliothèques, fonctions
});
const editor = Domino.create('#host', lang);       // avec la vue
const { ws, runtime } = lang.instantiate();        // sans la vue (Node, serveur)
```

Voir `docs/ARCHITECTURE.md` : le langage, coller ou relier, les modules, les règles, le JSON, l'exécution, les générateurs, la vue et l'inspecteur.

Le studio entier, ou ses morceaux :

```js
await Domino.studio('#app', { config: globalThis.DominoConfig });            // l'éditeur complet

const wb = new Domino.Workbench({ storage: Domino.Storage.open(config) });   // l'établi, sans interface
const doc = await wb.newProject({ language: 'kanto', template: 'example' });
Domino.create('#a', doc.language, { workspace: doc.ws, runtime: doc.runtime });                    // deux vues
Domino.create('#b', doc.language, { workspace: doc.ws, runtime: doc.runtime, display: 'card' });   // du même projet
Domino.Codegen.run('doc/markdown', doc.ws);                                    // un générateur inscrit
```

## Tester

```sh
npm test                 # 142 tests (node --test), sans navigateur
npm run lint             # ESLint (règles dans eslint.config.js)
npm run schemas          # réécrit les schémas publiés (engine/schema/)
npm run bench            # performances (5 000 pierres)
```
