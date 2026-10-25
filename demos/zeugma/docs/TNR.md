# Scénarios d'API (TNR) : un éditeur à la Postman, fait de dominos

> Importer une collection Postman et ses environnements, composer des **scénarios de non-régression** avec des pierres, les exécuter (réseau ou serveur simulé), lire un **rapport fait pour le testeur**, puis exporter une collection que **Postman et newman exécutent**. L'exemple livré est la collection du dépôt, `postmanFile/` (Kýdos Belote : 87 requêtes, 17 dossiers, un environnement).

Fichiers : `demos/postman/` :

| Fichier | Rôle |
|---|---|
| `postman.js` | La bibliothèque sans DOM : lire une collection, scripts ⇄ pierres, conditions → JavaScript, serveur simulé, envoi HTTP, import et export |
| `tnr.lang.js` | Le langage : pierres, exécution, boîte à outils (statique et dynamique), importeurs, générateurs |
| `tnr.templates.js` | Les gabarits du rapport et du tableau de bord (registre `Domino.Templates`) |
| `tnr.dashboard.js` | Le tableau de bord : ses données (sans DOM) et sa projection |
| `tnr.example.js` | L'exemple : la collection importée et deux scénarios écrits à la main |
| `belote.sample.js` | Les fichiers de `postmanFile/`, embarqués (généré par `npm run samples`) |
| `tnr.css` | Les styles du rapport et du tableau de bord |

Tests : `tests/postman.test.js` (13).

---

## 1. Ce qu'on voit

**La table principale est une campagne.** La pierre « Campagne » porte l'environnement, le transport (simulé ou réseau), l'arrêt au premier échec, la latence simulée et l'autorisation d'exécuter les scripts Postman. Des pierres « Scénario » la suivent, dans l'ordre d'exécution.

**Un scénario s'ouvre dans un onglet** (double-clic). Sa chaîne part de « Début » et enchaîne des requêtes :

```text
 Début ─▶ Appeler « Parcours joueur » ─▶ POST Create ─▶ GET Detail ─▶ PUT Update ─▶ POST Créer une équipe ─▶ …
                                            │              │          ▲  │              ▲
                                            ├ robot.id → {{robotId}} ─┼──┼──── fil ─────┘   (passage de contenu)
                                            ├ statut 2xx               │  │
                                            └ robot créé (201)         │  ├ statut 2xx
                                                                       │  └ le nouveau nom est gardé
                                                    {"name":"Athéna II"} (donnée posée au-dessus)
```

- **Sous une requête**, en adjacentes basses, ce qu'on fait de sa réponse : *Vérifier* et *Extraire*. Elles sont affichées **en liste** : une colonne les relie à la requête, et chaque nom est écrit à l'horizontale, comme l'onglet Tests de Postman.
- **Au-dessus d'une requête**, en adjacente haute, une *Donnée JSON* fusionnée dans son corps.
- **Un fil** porte une valeur extraite vers une autre requête : c'est le **passage de contenu**, visible sur la table.
- **Entre deux requêtes** : *Définir une variable*, *Si* (deux suites), *Attendre*, *Journal*, *Appeler un scénario*, *Script Postman*, et *Recommencer* (« Aller à », borné) pour réessayer.

Projections (barre en haut de la table) : **Dominos**, **Tableau de bord**, **Déroulé**, Diagramme, Tableau, Texte.

## 2. Les pierres

| Pierre | Faces | Ce qu'elle fait | Export Postman |
|---|---|---|---|
| Campagne | 0 \| 1 | Choisit l'environnement, le transport, les règles d'arrêt | Dossier « Scénarios TNR » |
| Scénario | 1 \| 1 | Exécute son intérieur, dresse son bilan (requêtes, vérifications) | Un sous-dossier |
| Début | 0 \| 1 | Le départ du scénario | — |
| Requête | 2 \| 1 | Méthode, adresse, en-têtes, corps ; `données` (entrée facultative) injectée dans le corps ; sa réponse part à droite | Une requête |
| Vérifier | 1 \| 1 | Statut (2xx, =, ≠…), temps, corps, champ JSON, en-tête | `pm.test(…)` |
| Extraire | 1 \| 2 | Une valeur de la réponse → une variable ; la valeur part aussi par sa 2ᵉ sortie (un fil) | `pm.environment.set(…)` |
| Définir une variable | 2 \| 1 | Texte avec `{{variables}}`, ou la valeur reçue par un fil | `pm.environment.set(…)` (pré-requête) |
| Si | 1 \| 2 | `alors` / `sinon` selon une condition (status, time, body.x, headers.x, env.x…) | `if/else` + `setNextRequest` |
| Attendre | 1 \| 1 | Une pause | `setTimeout` en pré-requête |
| Journal | 1 \| 1 | Un message au rapport | `console.log` |
| Appeler un scénario | 1 \| 1 | Exécute un autre scénario ici (connexion réutilisée) | Ses requêtes recopiées |
| Script Postman | 1 \| 1 | Du JavaScript `pm.*` tel quel : exécuté seulement si la campagne l'autorise | À l'identique |
| Donnée JSON | 0 \| 1 | Une valeur écrite à la main | Pré-requête qui l'injecte |

Les **variables** s'écrivent `{{nom}}` partout. Elles sont cherchées dans cet ordre :

- `local` (le scénario) ;
- `env` (l'environnement) ;
- `collection` ;
- `globals` ;
- plus les variables dynamiques `{{$guid}}`, `{{$timestamp}}`, `{{$isoTimestamp}}`, `{{$randomInt}}`…

Une variable d'environnement modifiée pendant l'exécution le reste ensuite, comme dans Postman. Le tableau de bord montre ce qui a changé ; « Enregistrer » le garde dans l'environnement.

## 3. Exécuter

- **Transport simulé** (par défaut). Un serveur déduit de la collection répond sans réseau :
  - il émet des jetons à la connexion ;
  - il exige `Authorization: Bearer <jeton émis>` là où la collection l'envoie (401 sinon) ;
  - il garde ce qu'on crée : relu, modifié, supprimé, puis 404 ;
  - il renvoie les champs que lisent les scripts de la collection (`d.robot.id`, `d.token`…).

  Les durées sont reproductibles, et instantanées si la campagne le demande.
- **Transport réseau** : les vraies requêtes, par `fetch`. Le serveur doit autoriser la page (CORS).
- La campagne s'exécute scénario après scénario (`execution.chains: 'sequential'`). Un scénario ouvert s'exécute seul (bouton ▶ ou `R`).

## 4. Le rapport, pour le testeur

Chaque pierre dépose ce qu'elle a fait (`rc.report`). Trois vues le montrent :

- **Onglet Rapport** de l'inspecteur :
  - en tête, les compteurs (réussis, échecs, erreurs, infos) ;
  - des filtres (tout, problèmes, réussis) et une recherche ;
  - un export du rapport en JSON.

  Une entrée HTTP dépliée montre :
  - la méthode, l'adresse résolue, le statut, la durée, la taille ;
  - les en-têtes et le corps de la requête et de la réponse (JSON coloré) ;
  - les variables **inconnues ou vides** au moment de l'envoi ;
  - la commande **cURL** pour rejouer.

  Une vérification montre ce qui était *attendu* et ce qui a été *obtenu*. Une variable montre sa portée, sa valeur *avant* et *après*.
- **Déroulé** : un couloir par scénario, chaque étape avec son statut, sa durée et ses lignes de rapport. Un scénario appelé a son propre couloir, nommé par son chemin.
- **Tableau de bord** :
  - le choix de l'environnement et du transport ;
  - Importer…, Exporter vers Postman, Exécuter la campagne ;
  - les chiffres clés : requêtes, scénarios, couverture, vérifications réussies, erreurs réseau, temps moyen ;
  - **la collection** : dossiers et sous-dossiers dépliables, chaque requête avec sa méthode, son chemin, sa couverture et son dernier statut, et une recherche ;
  - les scénarios et leur bilan, les variables (initiale ou courante, secrets 🔒) et les derniers échecs.

**Les secrets sont masqués** partout : valeurs des variables secrètes, champs `token`, `password`, `secret`… des corps (`••••abc`).

## 5. Importer, exporter

- **Fichier › Importer ▸ Collection Postman (v2.1)…**, ou simplement *Ouvrir un fichier* : le format est reconnu (`Domino.Importers`).
  - Chaque dossier de premier niveau devient un scénario, les sous-dossiers étant mis à plat avec un intertitre.
  - Chaque requête devient une pierre, avec ses scripts **convertis en pierres** : `pm.environment.set('x', d.a.b)` devient *Extraire*, `pm.test(…)` reconnu devient *Vérifier*, `console.log` devient *Journal*.
  - Un script non reconnu reste une pierre *Script Postman*, telle quelle.
  - Les variables employées mais absentes de l'environnement y sont ajoutées, et signalées.
  - La même collection réimportée met à jour la boîte à outils et garde les scénarios.
- **Importer ▸ Environnement Postman…** : ajouté au projet ouvert, choisi, en une seule annulation.
- **Fichier › Exporter ▸ Collection Postman v2.1…** (ou le bouton du tableau de bord) produit :
  - la collection d'origine, intacte ;
  - un dossier « 🧪 Scénarios TNR », avec un sous-dossier par scénario : chaque requête dans l'ordre, et ses pierres devenues scripts (pré-requête et test) ;
  - chaque environnement.

  Il se lance avec : `newman run collection.json -e environnement.json --folder "🧪 Scénarios TNR (Domino Studio)"`.
- **Aller-retour** : le projet de dominos voyage dans une variable de la collection exportée (Postman l'ignore). Réimportée, la collection rend les mêmes scénarios, pierre pour pierre.
- **Plan de test (Markdown)** : le cahier de recette, généré.

## 6. Le patron : un outil complexe en dominos

L'éditeur TNR n'a demandé au moteur que des capacités générales. Chaque idée de l'outil a trouvé sa place dans le concept domino :

| Ce que fait l'outil | Le concept domino | Le point du cœur |
|---|---|---|
| Un catalogue venu d'ailleurs (la collection) | Une **ressource du projet**, et une **boîte à outils dynamique** qui en tire des pierres prêtes, avec ce qui y est collé (**fragments**) | `ws.setAsset`, `toolbox: { kind: 'dynamic' }`, `toolboxSources`, entrée `fragment` |
| Une suite d'étapes | La **chaîne** | — |
| Ce qu'on vérifie d'une étape | Ses **adjacentes basses**, **en liste** pour rester lisibles | option `adjacents: 'list'` |
| Une donnée qui passe d'une étape à une autre | Un **fil** (et une adjacente haute) | — |
| Un état partagé (environnement) | Le **contexte**, avec des **portées nommées** et des variables dynamiques | `variables: { scopes, dynamic, declared }` |
| Une campagne ordonnée, un scénario seul | Des **chaînes séquentielles**, une exécution à partir d'une pierre | `execution.chains: 'sequential'`, `run({ from })` |
| Réutiliser un scénario | Exécuter la partie d'un autre conteneur | `rc.runPartie(entrées, { partie })` |
| Ce que le testeur doit lire | Des **rapports** structurés, montrés par l'inspecteur, le Déroulé et une projection propre au langage | `rc.report`, onglet Rapport, vue `timeline`, `Projections.register({ language })` |
| Les formats des autres outils | Des **importeurs** et des **générateurs** (aller-retour par une variable du format cible) | `Domino.Importers`, `Domino.Codegen` |
| L'apparence | Des **gabarits** nommés | `Domino.Templates.define/override` |

Le même patron vaut pour une suite de tests d'interface (étapes de navigateur, vérifications du DOM), une chaîne d'intégration continue (étapes, artefacts passés par fils, environnement de déploiement), un ETL (sources, transformations, contrôles de qualité en adjacentes) ou des appels GraphQL et gRPC.
