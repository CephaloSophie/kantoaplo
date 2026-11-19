# Templates d'éditeur, thèmes et connexions

Zeugma est un **module pour construire des éditeurs** : low-code, no-code, workflow, outil métier. Le moteur
(dominos, fils, exécution, génération) ne change pas ; ce qui change, c'est l'**interface**, et l'interface est
une **donnée**. Trois registres la décrivent :

| Registre | Ce qu'il décrit | Schéma |
|---|---|---|
| `Domino.EditorTemplates` | toute l'interface : coque, menus, barre d'outils, ruban, barre d'activité, raccourcis, options des éditeurs, page d'accueil, thème et connexions par défaut | `engine/schema/template.schema.json` |
| `Domino.Themes` | les couleurs, polices, rayons (jetons CSS), en clair et en sombre | `engine/schema/theme.schema.json` |
| `Domino.Connections` | le dessin des fils : tracé, épaisseur, couleur, bouts, flux animé, lueur, étiquette | `engine/schema/connections.schema.json` |

> À ne pas confondre : `Domino.Templates` (les gabarits de **balisage** des composants, docs/EXTENDING.md § 13)
> et les **modèles de projet** d'un langage (Fichier › Nouveau ▸).

## Ordre de priorité

```
template  <  configuration d'instance  <  préférences de l'utilisateur
```

- Le **template** apporte tout (`template: 'flux'` dans `domino.config.js`).
- La **configuration** ajuste : `theme`, `mode`, `connections`, `templateOverrides`, `menus`, `keybindings`.
- L'**utilisateur** choisit dans *Affichage › Apparence* ou *Outils › Personnaliser l'interface…* (Ctrl+K Ctrl+T).
  `lockTemplate: true` dans la configuration lui retire ce choix.

## Les trois templates livrés

| | Atelier | Flux | Console |
|---|---|---|---|
| Pour | concevoir, programmer (low-code) | composer des processus (no-code, workflow) | générer du code, brancher des plugins (low-code dev) |
| En-tête | barre de menus complète | **ruban** (Accueil, Insérer, Affichage, Partager) + menu « Projet » | **barre d'activité** verticale + menus fins, menu « Développeur » |
| Thème | Laiton (système) | Aurore (clair) | Nuit néon (sombre) |
| Connexions | Câbles (courbes en dégradé) | Métro (angles droits arrondis, flèches, points qui coulent) | Néon (courbes lumineuses, flux continu) |
| Onglets | classiques | pastilles | soulignés |
| Densité | confortable | aérée | compacte |
| Raccourcis en plus | — | Ctrl+Entrée lancer, Ctrl+Maj+A ajouter | Ctrl+Entrée, Ctrl+Maj+P palette, Ctrl+Maj+E pioche, Ctrl+Maj+G générer |

Fichiers : `engine/templates/atelier.template.js`, `flux.template.js`, `console.template.js`.

## Écrire un template

Un template peut **étendre** un autre (`extends`) : les objets se fusionnent, les tableaux se remplacent, les
raccourcis s'ajoutent, les menus s'appliquent comme des **correctifs** successifs.

```js
Domino.EditorTemplates.register({
  apiVersion: 'zeugma/v1', kind: 'EditorTemplate',
  id: 'crm-flow', name: 'CRM Flow', icon: '📇', extends: 'flux',
  description: 'L’éditeur de workflows de notre CRM.',
  theme: 'maison', mode: 'light', connections: { extends: 'metro', flow: 'comet' },
  shell: {
    header: 'ribbon',            // menubar | ribbon | activity | minimal | none
    brand: 'CRM <span>Flow</span>',
    tabs: 'cards',               // classic | pills | underline | cards
    density: 'comfortable',      // compact | comfortable | spacious
    statusBar: true, minimap: true, coach: false,
    inspector: { open: false },
  },
  toolbar: [{ command: 'run.run', icon: 'run', label: 'Lancer', primary: true }, '|', { command: 'view.themeToggle', icon: 'theme' }],
  ribbon: [{ id: 'home', title: 'Accueil', groups: [
    { title: 'Processus', items: [{ command: 'file.new', icon: 'new', label: 'Nouveau', size: 'large' }, { command: 'file.save', icon: 'save', label: 'Enregistrer' }] },
  ] }],
  activity: [],                  // [{ id, icon, title, command, bottom? }] pour data-header « activity »
  menus: {
    base: 'studio',              // 'studio' : tous les menus du studio ; null : partir de rien
    bar: [{ id: 'crm', title: 'CRM', before: 'help', sections: [{ id: 's', items: [{ command: 'plugins.manage' }] }] }],
    remove: ['language'],        // menus retirés
  },
  keybindings: [{ key: 'Mod+Enter', command: 'run.run' }, { command: 'view.pioche', remove: true }],
  editor: { grid: true, names: true, values: true, display: 'card' },
  welcome: { title: 'CRM <span>Flow</span>', subtitle: 'Vos automatisations.', sections: ['start', 'recent', 'languages'] },
});
```

Icônes disponibles (`Domino.Templates.icons`) : `new open save paste cut copy duplicate add note gear eye search
goto layers fit zoomIn zoomOut map palette overview export image code puzzle alert steps command template wire
undo redo run stop insp theme split pioche burger`, et toute icône ajoutée par `Domino.Templates.defineIcons`.

Sans écrire de JavaScript : *Outils › Personnaliser l'interface… › Exporter comme template…* écrit le JSON de
l'apparence en cours (qui étend le template actuel) ; *Outils › Importer un thème, un template ou un plugin…*
(ou un glisser-déposer du fichier) l'installe.

## Thèmes

```js
Domino.Themes.register({
  id: 'maison', name: 'Maison', extends: 'laiton',
  tokens: {
    shared: { 'r-md': '12px', 'f-body': "'Inter', system-ui, sans-serif" },
    light: { brass: '#0A7D5A', 'brass-soft': 'rgba(10,125,90,.12)' },
    dark: { brass: '#38D39F' },
  },
  skin: { light: 'ivoire', dark: 'ebene' },   // habillage des pierres en mode « auto »
});
Domino.Themes.apply('maison');                 // une feuille <style id="zg-theme">
```

Jetons principaux : `table` (plateau), `panel`, `panel-2`, `raised`, `line`, `line-strong`, `ink`, `ink-2`,
`ink-3`, `brass` (l'accent), `brass-ink`, `brass-soft`, `on-brass`, `ok`, `warn`, `err`, `scrim`, `shadow-1..3`,
`f-display`, `f-body`, `f-mono`, `r-sm`, `r-md`, `r-lg`. Livrés : **Laiton**, **Aurore**, **Nuit néon**, **Contraste élevé**.

## Connexions

```js
Domino.Connections.register({
  id: 'ma-ligne', extends: 'metro',
  path: 'orthogonal',          // bezier | orthogonal | step | straight | arc
  radius: 14, width: 3, casing: 9,
  color: 'source',             // gradient | source | target | accent | ink | une couleur
  ends: { start: 'dot', end: 'arrow', size: 1.8 },   // none ring dot arrow chevron diamond square socket
  flow: 'comet', flowAlways: false,                  // none march dots comet pulse
  glow: 0, label: 'pill',                            // text | pill | none
  kinds: { call: { color: 'accent' }, trigger: { dash: '6 4' } },   // par genre de fil
  edges: { transition: { path: 'arc' } },                           // par type de lien d'un langage
});
```

La géométrie et le rendu sont sans DOM (`Domino.Connections.route(a, b, style)`, `render({...})`) : les mêmes
fils dans le navigateur, dans Node et dans un export SVG. Un éditeur seul prend l'option `connections`.

## Zeugma dans une autre application

```js
await Zeugma.app('#app', { template: 'flux', theme: 'aurore', plugins: ['flux-codegen'] });  // l'éditeur complet
const ed = Zeugma.embed('#zone', 'flux', { theme: 'nuit', mode: 'dark', connections: 'neon', project });  // un éditeur seul
```
