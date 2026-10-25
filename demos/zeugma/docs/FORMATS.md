# Formats : ressources et JSON

> Tout ce que la plateforme enregistre ou échange s'écrit dans des formats publiés, chacun avec son **schéma JSON** (2020-12) dans `engine/schema/`, généré par le moteur (`node tools/schemas.js`) et vérifié par les tests.

| Schéma | Ce qu'il décrit | Source dans le moteur |
|---|---|---|
| `domino.schema.json` | Le projet, format `kantoaplo.domino` v2 (arbre des pierres, fils) | `Domino.Serializer.schema` |
| `resource.schema.json` | L'enveloppe « élément » `kantoaplo.dev/v1` (Project, Domino, Wire, Partie, List…) | `Domino.Resource.schema` |
| `language.schema.json` | Un langage écrit en JSON | `Domino.Language.schema` |
| `model.schema.json` | Le document de modèle (tout résolu, pour les générateurs) | `Domino.describe.schema` |
| `workspace.schema.json` | L'espace de travail (ressource Workspace) | `Domino.Workbench.schema` |
| `config.schema.json` | La configuration d'une instance (`domino.config.js`) | `Domino.Storage.configSchema` |
| `expr.schema.json` | Une expression déclarative (conditions, filtres, valeurs calculées) | `Domino.Expr.schema` |

---

## 1. L'enveloppe : une ressource

```json
{
  "apiVersion": "kantoaplo.dev/v1",
  "kind": "Domino",
  "metadata": { "uid": "…", "name": "…", "title": "…", "description": "…", "labels": {}, "annotations": {}, "created": {}, "modified": {}, "revision": 3, "etag": "…" },
  "spec": { },
  "status": { },
  "extensions": { "com.acme.review/v1": { } }
}
```

| Clé | Sens | Règle |
|---|---|---|
| `apiVersion` | Groupe et version de l'enveloppe | `kantoaplo.dev/v1` |
| `kind` | `Project`, `Domino`, `Wire`, `Partie`, `Language`, `Workspace`, `List` | |
| `metadata.uid` | Identifiant opaque, stable une fois donné | généré (`p_…`) |
| `metadata.name` | Identifiant lisible, unique dans son parent | pour une pierre : son `id` v2 ; motif `^[A-Za-z_][\w.-]{0,63}$` |
| `metadata.title`, `description` | Pour les humains | |
| `metadata.labels` | Chaîne → chaîne, pour filtrer | `language=kanto` |
| `metadata.annotations` | Chaîne → chaîne, pour les outils | |
| `metadata.created`, `modified` | Provenance (la `trace` des pierres, telle quelle) | `{ at, by, how, from }`, `{ at, by, count, last }` |
| `metadata.revision`, `etag` | Version enregistrée, empreinte | posés par le stockage |
| `spec` | **Ce qui est déclaré** : fait autorité | seul lu au chargement |
| `status` | **Ce qui est calculé** : rôle, points, diagnostics, dernière exécution | jamais relu |
| `extensions` | Données d'outils tiers (revue, CI, audit, liens) | clés `domaine/nom[/vN]` ; `kantoaplo.dev/` réservé ; **conservées** même inconnues |

**Où mettre une donnée** :

- elle appartient **au langage** (un champ de la pierre) : `spec.fields`, défini par la définition de la pierre ;
- elle appartient **à un outil** qui ne fait pas partie du langage : `extensions["com.votre-outil/v1"]`.

**Versions** :

- un ajout facultatif garde `v1` ;
- une rupture donne `v2`, avec sa conversion dans `Domino.Resource.CONVERSIONS` ;
- le contenu d'un projet garde son propre versionnage (`format: kantoaplo.domino`, `version: 2`, migrations de `Serializer.MIGRATIONS`).

Les deux axes sont indépendants.

## 2. Un projet, forme canonique

C'est ce qui est enregistré : une ressource `Project` dont `spec.content` est **exactement** le format v2 du sérialiseur. Les générateurs, `Serializer.load` et les 72 tests le lisent sans changement.

```json
{
  "apiVersion": "kantoaplo.dev/v1", "kind": "Project",
  "metadata": { "uid": "p_k3x9a1", "name": "boutique", "title": "Boutique", "labels": { "language": "kanto" },
                "created": { "at": "2026-10-19T09:00:00Z", "by": "ameur", "how": "modèle:kanto/example" },
                "modified": { "at": "2026-10-19T09:14:40Z", "by": "ameur" }, "revision": 14 },
  "spec": {
    "language": { "id": "kanto", "name": "Kanto" },
    "settings": { "options": { "skin": "ivoire", "table": 1250 } },
    "content": { "format": "kantoaplo.domino", "version": 2, "editor": { "id": "kanto", "name": "Kanto" }, "name": "Boutique",
                 "context": { "sortie": [] }, "parties": [ … ], "wires": [ … ] }
  },
  "status": { "stones": 29, "wires": 2, "errors": 0, "warnings": 0, "savedAt": "2026-10-19T09:14:41Z" }
}
```

`spec.settings.options` contient les options d'éditeur choisies pour ce projet (Affichage › Options de l'éditeur), et toutes ses vues les suivent.

## 3. Un projet, forme à plat

C'est une ressource `List` : **une ressource par partie, par pierre et par fil**, dans l'ordre de lecture. Elle est faite pour les API par élément (`PATCH` d'une pierre), les diffs et les conflits fins.

```json
{
  "apiVersion": "kantoaplo.dev/v1", "kind": "List",
  "metadata": { … celles du projet … },
  "spec": { "language": { … }, "project": { "format": "kantoaplo.domino", "version": 2, "editor": { … }, "name": "Boutique", "context": { … } } },
  "items": [
    { "apiVersion": "kantoaplo.dev/v1", "kind": "Partie", "metadata": { "name": "main", "title": "Programme" }, "spec": { "kind": "main", "order": 0 } },
    { "apiVersion": "kantoaplo.dev/v1", "kind": "Domino",
      "metadata": { "name": "pan", "created": { … } },
      "spec": { "type": "inst.cPanier", "fields": { "name": "panier" }, "placement": { "partie": "main", "position": { "x": 40, "y": 300 }, "order": 0 } } },
    { "apiVersion": "kantoaplo.dev/v1", "kind": "Domino",
      "metadata": { "name": "eur", "title": "Devise" },
      "spec": { "type": "k.text", "fields": { "value": "EUR" },
                "placement": { "partie": "main", "attachedTo": { "element": "pan", "via": "top", "pip": 0, "order": 0 } },
                "flags": { "locked": true }, "note": "Devise par défaut", "tags": ["config"],
                "presentation": { "display": "card" } },
      "extensions": { "com.acme.review/v1": { "approvedBy": "léa" } } },
    { "apiVersion": "kantoaplo.dev/v1", "kind": "Wire",
      "metadata": { "name": "w2" },
      "spec": { "from": { "element": "ntf", "pip": 0, "name": "envoyer" }, "to": { "element": "snd", "pip": 0, "name": "fonction" }, "blocking": false } }
  ]
}
```

**La place d'une pierre** (`spec.placement`) :

- une **tête de chaîne** ou une pierre libre : `{ partie, position, turn, order }` ;
- une pierre **collée** : `{ partie, turn, attachedTo: { element, via: next | top | bottom, pip, order } }`, plus `map`, `label`, `cond`, `enabled` pour une suite.

**Correspondance avec le v2**, sans perte :

| Ressource `Domino` | Pierre v2 (`Serializer.nodeToJSON`) |
|---|---|
| `metadata.name` | `id` |
| `metadata.title` | `label` |
| `metadata.uid` | `meta.uid` |
| `metadata.created` / `modified` | `trace.created` / `trace.modified` |
| `spec.type`, `fields`, `note`, `tags` | idem |
| `spec.flags.disabled` / `locked` | `disabled` / `locked` |
| `spec.placement.position`, `turn` | `position`, `turn` |
| `spec.placement.attachedTo` | l'imbrication `next[]`, `top[]`, `bottom[]` (l'ordre = `order`) |
| `spec.presentation.display` / `faces` / `tint` | `meta.display` / `meta.faces` / `meta.tint` |
| `extensions` | `meta.extensions` |
| `extensions["kantoaplo.dev/meta"]` | les autres clés de `meta` |
| `status` | non stocké (`Domino.Resource.fromNode` le calcule) |

## 4. L'API

```js
Domino.Resource.fromProject(v2, { title, uid, labels, … })   // → ressource Project
Domino.Resource.toProject(ressource)                         // → v2 exact
Domino.Resource.explode(ressource)  /  .assemble(liste)      // ⇄ forme à plat
Domino.Resource.unwrap(json)          // v2, Project ou List → v2 (Serializer.load et Generator.generate l'appellent)
Domino.Resource.fromNode(ws, pierre)  // une pierre vivante, avec son status (rôle, points, diagnostics)
Domino.Resource.validate(ressource)   // → messages d'erreur, avec le chemin
Domino.Resource.convert(ressource, 'kantoaplo.dev/v1')
```

Les tests vérifient pour les neuf démos :

- `toProject(fromProject(v2))` est égal à `v2` ;
- `assemble(explode(r))` est égal à `r` ;
- une ressource se charge comme le v2 ;
- les extensions inconnues survivent ;
- `status` n'est pas relu ;
- tout suit `resource.schema.json`.

## 5. L'espace de travail

C'est une ressource `Workspace` (collection `workspace`, clé `default`). Elle dit ce qui est ouvert, jamais le contenu des projets.

```json
{ "apiVersion": "kantoaplo.dev/v1", "kind": "Workspace", "metadata": { "uid": "ws_default", "name": "default" },
  "spec": {
    "documents": [{ "uri": "local:projects/p_k3x9a1", "language": "kanto", "title": "Boutique" }],
    "layout": { "root": { "type": "split", "id": "s1", "dir": "row", "sizes": [0.55, 0.45], "children": [
                  { "type": "group", "id": "g1", "tabs": ["t1"], "active": "t1" },
                  { "type": "group", "id": "g2", "tabs": ["t2"], "active": "t2" } ] },
                "focused": "g1",
                "tabs": { "t1": { "uri": "local:projects/p_k3x9a1", "view": { "partie": "main", "display": "stone", "camera": { "main": { "k": 1, "x": 40, "y": 40 } } } },
                          "t2": { "uri": "local:projects/p_k3x9a1", "view": { "partie": "cPanier", "display": "card" } } } },
    "panels": { "pioche": true },
    "recent": [{ "uri": "local:projects/p_k3x9a1", "title": "Boutique", "language": "kanto", "openedAt": "…" }],
    "untitledSeq": 3, "autosave": { "enabled": true, "delayMs": 1200 } } }
```

## 6. Les autres formats

- **Projet v2** (`kantoaplo.domino`) : [ARCHITECTURE.md § 8](ARCHITECTURE.md).
- **Langage** (`kantoaplo.language`) : [ARCHITECTURE.md § 2 et 4](ARCHITECTURE.md). Il ajoute `templates` (modèles de projet) et `contributes` (contributions au studio, en JavaScript seulement).
- **Déclaration exportée** (`kantoaplo.declaration`) : `editor.exportDeclaration(id)`.
- **Document de modèle** (`kantoaplo.model`) : [ARCHITECTURE.md § 8 bis](ARCHITECTURE.md).

## 7. Les expressions

Une expression est une valeur JSON :

| Forme | Exemple |
|---|---|
| Une valeur | `3`, `"Europe"`, `true`, `null` |
| Une liste | `[1, 2]` |
| Un chemin | `{ "var": "réponses.continent" }` (ou `{ "var": ["chemin", défaut] }`) |
| Un opérateur | `{ "eq": [a, b] }`, `{ "and": [c1, c2] }`, `{ "not": c }`, `{ "object": { "text": …, "correct": … } }` |

Son texte se lit et s'écrit avec `Domino.Expr.parse` et `Domino.Expr.text`, aller-retour garanti :

```text
réponses.continent == "Europe" et score >= 3
non (a ou b)
x dans [1, 2, 3]
entre(note, 1, 5)
nombre(réponses.choix) == 2
{text: item.nom, correct: item.continent == arg}
```

Un langage étend les opérateurs (son dialecte). Une connexion peut porter une condition déclarative (`cond`).

## 7 bis. Le texte d'un projet

La projection « Texte » écrit une partie en lignes, et relit ce qu'on y tape :

```text
// une ligne par pierre : identifiant, type, champs qui diffèrent de leur valeur par défaut
s x.start n=3                       # Départ (3)      ← un commentaire : le titre
  > a x.add k=-1                    ← collée à droite (sortie 0) ; >1 : sortie 1
    ^ n x.note text="à revoir"      ← au-dessus ; v : en dessous
off s.state name=Éteint entry="n := n + 1"
~ off.0 -> on.0 transition event=appui guard="n > 1"
== partie p1 component "Sous-partie"
```

Les valeurs sont du JSON, ou un mot nu. Un texte appliqué garde ce qu'il ne dit pas (position, rotation, note, métadonnées) et retire les pierres qui n'y sont plus ; une seule entrée d'historique (`Domino.Projections.text.apply(ws, texte)`).

## 7 ter. Les nouvelles clés d'un langage

| Clé | Forme |
|---|---|
| `edges` | `[{ type, name, description, color, dash, label, fields, from, to, default }]` : genres de liens |
| `execution` | `{ engine: 'dataflow' \| 'statemachine' \| 'tokens' \| 'decision' }` |
| `projections` | `{ default, list: ['diagram', 'grid', 'text'], diagram: { algo, dir } }` |
| `rules.cycles`, `rules.list[].if` | boucles permises ; refus en expression (`parent`, `child`, `via`, `pip`) |
| `dominos[].traits` | `['nommé', { id: 'état', initial: true }]` |
| `dominos[].behaviour` | `{ title, validate, faces, pips, canConnect, run }` en expressions |
| `dominos[].roles`, `dominos[].notation` | lus par les moteurs et par le diagramme |
| `toolbox` | `{ mode, rest, contents: [catégorie \| pierre \| groupe \| texte \| séparateur] }` : la boîte à outils (`toolbox.schema.json`, [EXTENDING.md](EXTENDING.md) § 11) |
| `ui.toolboxTitle` | le titre de la boîte à outils (« Pioche » par défaut) |

Un fil peut porter `type` et `fields` dans le projet (`wires[]`), la ressource (`spec.edgeType`, `spec.fields`) et le document de modèle.

## 7 quater bis. Ressources du projet et rapports

| Format | Forme |
|---|---|
| `assets` (projet v2) | `{ clé: document JSON }` : des documents attachés au projet (`postman.collection`, `postman.environments`…), enregistrés et annulables avec lui |
| `variables` (langage) | `{ scopes: ['local', 'env', …], dynamic: true }` : où chercher un nom court `{{x}}`, et les variables dynamiques `{{$guid}}`… |
| Entrée de rapport (`res.reports[]`, événement `run:report`) | `{ id, kind, step, dominoId, title, path: [parties], at, status: 'ok' \| 'fail' \| 'error' \| 'skip' \| 'info', summary, ms?, details? }` |
| Boîte à outils : entrée préréglée | `{ kind: 'domino', type, title?, badge?, badgeColor?, subtitle?, fields?, fragment? }` ; section `{ kind: 'dynamic', source }` |

## 7 quater. Presse-papiers et menus

| Format | Forme |
|---|---|
| Presse-papiers de plusieurs pierres | `{ format: 'kantoaplo.domino.clip', version: 1, dominos: [pierre v2…], wires?: [fil v2…] }` : chaque racine de la sélection avec ses suites sélectionnées et ses adjacentes ; les fils dont les deux bouts sont copiés. Une seule pierre reste au format d'une pierre v2. |
| Menus du studio | `{ version: 1, bar: [{ id, title, description?, help?, dynamicTitle?, sections: [{ id, items: [commande \| sous-menu \| lien \| intertitre] }] }], menus: { 'tab/context': … } }` (`menus.schema.json`, [EXTENDING.md](EXTENDING.md) § 12) |

## 8. Le quiz (kantoaplo.quiz, version 2)

C'est ce qu'écrit le générateur « Quiz JSON » du créateur de quiz, et ce que joue n'importe quel lecteur (celui du HTML exporté en est un) :

```json
{ "format": "kantoaplo.quiz", "version": 2, "title": "…", "intro": "…", "settings": { "shuffle": false, "passPercent": 50 }, "start": "australie",
  "steps": [
    { "id": "australie", "kind": "single", "text": "…", "points": 1, "choices": [{ "text": "Canberra", "correct": true }, { "text": "Sydney" }], "explanation": "…", "next": "lune" },
    { "id": "lune", "kind": "number", "min": 1900, "max": 2025, "step": 1, "answer": 1969, "tolerance": 0, "next": "…" },
    { "id": "ville", "kind": "single", "choices": [{ "text": "Paris", "when": { "eq": [{ "var": "réponses.continent" }, "Europe"] } }], "next": "pays" },
    { "id": "pays", "kind": "multi", "source": { "declaration": "catalogue", "class": "Catalogue", "method": "pays", "arg": { "var": "réponses.continent" },
                                                 "values": { "Europe": [{ "text": "France", "correct": true }, …], "Asie": [ … ] } }, "next": "muraille" },
    { "id": "sw", "kind": "switch", "on": { "var": "réponses.domaine" }, "cases": [{ "label": "Arts", "if": { "eq": [{ "var": "subject" }, "Arts"] }, "goto": "joconde" }], "else": "mercure" },
    { "id": "g3", "kind": "goto", "target": "mercure", "max": 3, "else": null },
    { "id": "si", "kind": "branch", "if": { "gte": [{ "var": "percent" }, 50] }, "then": "hexagone", "else": "revision" },
    { "id": "f1", "kind": "end", "title": "Expert", "message": "Bravo {{joueur.nom}} : {{score}} / {{max}}", "badge": "or" }
  ] }
```

**Genres d'étapes** :

- questions : `single`, `multi` (`partial`, `minPick`, `maxPick`), `exact` (`count`), `number` (`min`, `max`, `step`, `answer`, `tolerance`, `unit`), `truefalse`, `text` (réponses acceptées séparées par `|`), `order` (`items` dans le bon ordre), `scale` (`min`, `max`, `low`, `high`), `info` ;
- parcours : `branch`, `switch`, `goto`, `end`.

**Portée des conditions** :

- `réponses` (par clé), `score`, `max`, `percent` ;
- `ctx` (le profil du joueur : `ctx.joueur.niveau`) ;
- dans un `switch`, `subject` (la valeur de `on`).

**Les choix calculés** : leurs `values` sont précalculées pour chaque réponse possible de la question qu'ils lisent. Sinon, le lecteur les demande à son hôte (`resolveSource(step, arg)` : dans le studio, le moteur appelle la classe ; ailleurs, une API).
