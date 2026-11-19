# Plugins, blocs et génération

Un **plugin** est un paquet JSON (`kind: Plugin`) qui ajoute à Zeugma ce que ses registres savent recevoir.
Il ne contient **pas de code** par défaut : un plugin dont les pierres ont des fonctions écrites en texte
n'est installé qu'après confirmation (`trust`).

```json
{
  "apiVersion": "zeugma/v1",
  "kind": "Plugin",
  "metadata": { "id": "http-blocs", "name": "Blocs HTTP", "version": "1.0.0", "author": "…", "description": "…", "icon": "🌐", "tags": ["http"] },
  "engines": { "zeugma": ">=1.2.0" },
  "dependencies": { "autre-plugin": "^1.0.0" },
  "contributes": {
    "themes": [], "connections": [], "templates": [],
    "languages": [],
    "blocks": [], "generators": [], "projects": [],
    "menus": {}, "keybindings": [], "commands": []
  }
}
```

| Contribution | Effet | Va dans |
|---|---|---|
| `themes` | thèmes de l'interface | `Domino.Themes` |
| `connections` | styles de fils | `Domino.Connections` |
| `templates` | templates d'éditeur (une interface entière) | `Domino.EditorTemplates` |
| `languages` | langages complets (`format: kantoaplo.language`) | `Domino.Languages.register` |
| `blocks` | **pierres ajoutées à un langage existant**, avec ce qu'elles génèrent | `Domino.Languages.extend` |
| `generators` | cibles de génération par gabarits pour un langage | `Domino.Languages.extend` → `Domino.Codegen` |
| `projects` | modèles de projet (Fichier › Nouveau ▸) | `Domino.Languages.extend` |
| `menus` | éléments de menu (`{ link, title }` ou `{ command }`) | `Domino.Menus.contribute` |
| `keybindings` | raccourcis | `Domino.Keys.bind` |
| `commands` | commandes **composées** d'autres commandes (`steps`) | `Domino.Commands.register` |

Désactiver ou désinstaller un plugin **retire tout** ce qu'il a apporté ; les projets ouverts dans un langage
étendu prennent la nouvelle version à chaud.

## Blocs : une pierre et ce qu'elle génère

```json
{ "language": "flux", "category": "HTTP", "dominos": [{
  "type": "http.get", "name": "GET", "left": [{ "name": "x", "type": "nombre" }], "right": [{ "name": "réponse", "type": "nombre" }],
  "fields": { "url": { "kind": "text", "label": "Adresse", "default": "https://api.exemple.org" } },
  "behaviour": { "title": "GET {{url}}", "run": { "out": ["value"] } },
  "generate": {
    "js": "const res = await fetch({{json(url)}});\n{{> next}}",
    "py": { "statement": "res = requests.get({{json(url)}})", "expression": "requests.get({{json(url)}})" }
  }
}] }
```

### Gabarits de génération (`Domino.BlockGen`)

| Écriture | Produit |
|---|---|
| `{{ expression }}` | une expression déclarative : les champs à la racine, `id`, `type`, `title`, `index`, `ctx`, `project` |
| `{{> next}}` | le code de la suite (sortie 0) ; sans lui, la suite est ajoutée après |
| `{{> out 1}}` | la chaîne branchée sur la sortie 1 (sinon, cas, boucle) |
| `{{> in 0}}` | l'expression (`expression`) de la pierre reliée par un fil à l'entrée 0 |
| `{{> top}}`, `{{> bottom}}` | les adjacentes |

Fonctions en plus des expressions : `json(x)`, `quote(x, "'")`, `camel`, `pascal`, `snake`, `kebab`,
`join(liste, sep)`, `indent(texte, n)`, `code(expr)` (une condition écrite en texte), `str(x)`.
Un `{{> …}}` seul sur sa ligne garde l'indentation. Une cible : `{ id, label, extension, comment, header,
footer, partie: '// {{name}}\n{{> body}}', templates: { type: gabarit } }`.

Les générateurs déclarés apparaissent dans *Exécuter › Générer ▸*, l'onglet **Code** de l'inspecteur et
*Fichier › Exporter ▸*.

## Installer

- *Outils › Extensions…* (Ctrl+Maj+X) : **Installés** (activer, désactiver, exporter, désinstaller) et
  **Découvrir** (les sources : les plugins livrés, le **Store Zeugma** à venir).
- *Outils › Importer un plugin (JSON)…*, ou glisser-déposer le fichier sur la fenêtre.
- Dans `domino.config.js` : `plugins: ['flux-codegen', { …manifeste… }]` (installés à chaque démarrage).
  `allowPlugins: false` interdit l'installation par l'utilisateur.

Les plugins installés sont enregistrés avec les projets (fournisseur de stockage par défaut, collection `plugins`).

## Sources et store

```js
Domino.Plugins.sources.register({
  id: 'equipe', label: 'Dépôt de l’équipe',
  list: async (query) => (await fetch(`/plugins?q=${encodeURIComponent(query)}`)).json(),   // [{ id, name, version, description, icon, tags }]
  fetch: async (id) => (await fetch(`/plugins/${id}.json`)).json(),                         // le manifeste
});
```

La source `store` (le **Store Zeugma**) est réservée et marquée « bientôt » : quand le service existera, il
suffira de l'inscrire avec ce contrat, le gestionnaire d'extensions la montrera.

## Plugins livrés (exemples)

- `demos/plugins/flux-codegen.plugin.js` : trois pierres pour *Flux de données* et la génération JavaScript
  et Python, en gabarits ; un modèle de projet « Lancer de dé ».
- `demos/plugins/carnet.plugin.js` : un thème (Sépia), un style de connexions (Ruban), un template (Carnet).

## Héphaïstos

**Héphaïstos** (dépôt `hephaestosZeugma`) est l'atelier visuel des blocs : on y dessine une pierre (faces,
points, couleurs, champs, comportement), on écrit ce qu'elle génère pour chaque cible avec un aperçu en direct,
et on exporte un **plugin** (ce format) à importer dans Zeugma.
