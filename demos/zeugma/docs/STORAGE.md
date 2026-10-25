# Stockage et API

> Les projets, l'espace de travail, les sauvegardes de secours, les langages importés et les préférences passent par des **adaptateurs** au contrat unique. Lesquels existent, et lequel sert par défaut, c'est le fichier de configuration qui le dit : `domino.config.js`. Brancher une API distante, c'est remplir ce fichier ; aucune ligne du studio ne change.

## 1. Le contrat

Tous les adaptateurs sont asynchrones. Ils rangent des valeurs JSON par **collection** et par **clé**.

```ts
interface StorageAdapter {
  id: string; label: string;
  capabilities: { persistent: boolean; remote: boolean; list: boolean; etag: boolean };
  list(collection, { prefix?, limit?, cursor? }): Promise<{ items: { key, etag, updatedAt, size, summary }[]; cursor? }>;
  get(collection, key): Promise<{ value, etag, updatedAt } | null>;
  put(collection, key, value, { ifMatch? }): Promise<{ etag, updatedAt }>;   // ifMatch périmé : storage.conflict
  remove(collection, key, { ifMatch? }): Promise<void>;
  info(): Promise<{ used?, quota?, persistent, pending? }>;
}
```

| Collection | Contenu | Clé |
|---|---|---|
| `projects` | Ressources `Project` ([FORMATS.md](FORMATS.md)) | `uid` du projet |
| `workspace` | La ressource `Workspace` | `default` |
| `backups` | Sauvegardes de secours des projets modifiés non enregistrés, et la file hors ligne (`outbox`) | adresse du projet |
| `languages` | Langages importés (JSON) | `id` du langage |
| `prefs` | (Préférences : voir `Domino.Prefs`) | |

**Erreurs** : des `DominoError`, avec des codes stables.

| Code | Quand |
|---|---|
| `storage.unavailable` | Le stockage refuse de répondre |
| `storage.quota` | Le stockage est plein |
| `storage.conflict` | La version a changé ; `details.remote` contient la version distante |
| `storage.notFound` | La clé n'existe pas |
| `storage.auth` | 401 ou 403 |
| `storage.network` | Réseau ou erreur 5xx |
| `storage.timeout` | Délai dépassé |

**Adresse d'un projet** : `fournisseur:collection/clé`, par exemple `local:projects/p_k3x9`. Pour la lire ou l'écrire : `Domino.Storage.parseUri` et `formatUri`. Un brouillon a l'adresse `untitled:n`.

## 2. Les adaptateurs livrés

| Type | Classe | Notes |
|---|---|---|
| `localStorage` | `LocalStorageAdapter` | Le navigateur. Clés `kantoaplo:v1:<collection>:<clé>`, valeur `{ etag, updatedAt, value }`. Un quota plein donne `storage.quota`. L'ETag (FNV-1a) détecte une écriture d'un autre onglet |
| `memory` | `MemoryAdapter` | Pour les tests et le repli. Rien n'est conservé |
| `http` | `HttpAdapter` | Une API distante (§ 4). `fetch` est injectable (les tests en simulent un) |
| `layered` | `LayeredAdapter` | Local d'abord : écriture locale immédiate, poussée distante à l'enregistrement, file hors ligne (`flush()`) |

```js
const store = Domino.Storage.open(globalThis.DominoConfig);
// → { config, providers: Map, default, degraded, reason, problems }
await store.default.put('projects', 'p_k3x9', ressource);
```

`open()` sonde le `localStorage` (il écrit, relit, efface). S'il est refusé (page en bac à sable, navigation privée), le fournisseur de repli (`fallback`, la mémoire) prend la place, avec `degraded: true` et la raison. Le studio affiche alors un bandeau, et un « ⚠ » dans la barre d'état.

## 3. Le fichier de configuration

`domino.config.js` est chargé par un `<script>` : il marche en `file://`, hors ligne et dans une page publiée. Servi en HTTP, le studio peut lire un JSON avec `Domino.Storage.loadConfig(url)`. Le schéma est `engine/schema/config.schema.json`.

```js
globalThis.DominoConfig = {
  version: 1,
  storage: {
    default: 'local',          // les nouveaux projets et l'espace de travail
    fallback: 'memory',        // si le premier est indisponible
    providers: {
      local:  { type: 'localStorage', prefix: 'kantoaplo', label: 'Ce navigateur' },
      memory: { type: 'memory', label: 'Session (non conservé)' },
      team: {
        type: 'http', enabled: true, label: 'Serveur de l’équipe',
        baseUrl: 'https://api.example.org/kantoaplo/v1',
        auth: { type: 'bearer', token: { from: 'prompt' } },     // jamais de jeton en clair ici
        headers: { 'X-Client': 'domino-studio' },
        endpoints: {
          list: 'GET /workspaces/{workspace}/projects?cursor={cursor}&limit={limit}',
          get: 'GET /projects/{key}', put: 'PUT /projects/{key}', remove: 'DELETE /projects/{key}',
          workspaceGet: 'GET /workspaces/{workspace}', workspacePut: 'PUT /workspaces/{workspace}',
          // autres collections : 'languages.get': 'GET /languages/{key}', … ; sinon /{collection}/{key}
        },
        workspace: 'default',
        concurrency: { mode: 'etag', requireIfMatch: true },
        conflicts: { strategy: 'ask' },            // ask | keep-both | overwrite | reload
        timeoutMs: 15000,
        retry: { count: 2, backoffMs: 400 },       // en lecture seulement (GET), sur réseau ou 5xx
      },
      cloud: { type: 'layered', local: 'local', remote: 'team', label: 'Équipe (hors ligne d’abord)', sync: { mode: 'onSave' } },
    },
  },
  autosave: { enabled: true, delayMs: 1200 },
  workbench: { restore: true, maxRecent: 12, maxGroups: 4, maxLiveEditors: 8 },
  languages: { groups: [['Langages', ['kanto', 'automate']], ['Domaines', ['api']]], allowImport: true, trustImported: false },
  ui: { theme: 'system', display: 'stone', skin: 'auto', author: null },
  keybindings: [{ key: 'Mod+Alt+R', command: 'run.run' }],
};
```

`Domino.Storage.checkConfig(config)` vérifie la configuration et rend la liste des problèmes : fournisseur inconnu, `baseUrl` manquante, **jeton écrit en clair**… Le studio montre le premier problème au démarrage.

Le **jeton** se fournit à l'exécution : `new HttpAdapter(cfg, { getToken: async (cfg) => … })`. Il peut être demandé à l'utilisateur, lu dans la session, ou lu dans une préférence. Il n'est jamais enregistré dans la configuration ni dans l'espace de travail exporté.

## 4. Le contrat HTTP

Une API compatible n'a besoin que de ceci :

| Requête | Réponse |
|---|---|
| `GET /…/projects?cursor=&limit=` | `200 { "items": [ressource Project sans spec.content, ou { key, etag, metadata }], "next": "…" }` |
| `GET /projects/{key}` | `200` + la ressource Project + en-tête `ETag` ; `404` si absente |
| `PUT /projects/{key}` + `If-Match: "<etag>"` | `200` ou `201` + nouvel `ETag` ; **`412`** si la version a changé (le corps contient la version distante) ; `428` si `If-Match` manque alors qu'il est exigé |
| `DELETE /projects/{key}` + `If-Match` | `204` |
| `GET` / `PUT /workspaces/{workspace}` | la ressource Workspace |

- Le corps est toujours `application/json`.
- `409` est accepté comme synonyme de `412`.
- `401` et `403` donnent `storage.auth`.
- Avec `auth.type: 'cookie'`, les requêtes partent avec `credentials: 'include'`.

**Prévu** (la forme à plat le permet déjà) : `PATCH /projects/{key}/elements/{name}` en `application/merge-patch+json` sur une ressource `Domino`. Une API pourra ainsi enregistrer une pierre sans renvoyer tout le projet.

## 5. Concurrence et conflits

Chaque enregistrement envoie l'ETag lu (`ifMatch`). Si le stockage a changé entre-temps, que ce soit un autre onglet (même avec le `localStorage`), un collègue ou le serveur, l'établi appelle `ui.resolveConflict(doc, remote)`.

| Choix | Effet |
|---|---|
| `keep-both` (par défaut dans le studio) | Votre version est enregistrée comme une copie, rien n'est perdu |
| `overwrite` | Votre version remplace l'autre (avec son nouvel ETag) |
| `reload` | L'autre version est chargée dans le projet |
| `cancel` | Rien ne change |

## 6. Préférences

`Domino.Prefs` est synchrone (en mémoire d'abord) et s'écrit dans le navigateur quand il le permet, sous la clé `kantoaplo:v1:prefs`. Il retient :

- le thème, l'habillage, le mode d'affichage ;
- l'auteur ;
- la page de bienvenue et l'aide « Prendre en main » ;
- la mini-carte.

Les anciennes clés (`dk-coach`, `dk-inspector`) sont reprises une fois.

```js
Domino.Prefs.get('theme', 'system'); Domino.Prefs.set('theme', 'dark'); Domino.Prefs.on('theme', fn);
```

## 7. Écrire un adaptateur

Il suffit d'un objet qui respecte le contrat du § 1 (IndexedDB, un système de fichiers, un dépôt Git…).

```js
const store = Domino.Storage.open(config);
store.providers.set('idb', new MonAdaptateurIndexedDB({ id: 'idb', label: 'Base du navigateur' }));
```

Pour le vérifier, lancez-lui la suite de contrat de `tests/storage.test.js` (`contract(t, adaptateur)`).
