/*!
 * Configuration de Domino Studio (une instance).
 *
 * Chargée avant le studio (par engine/domino.boot.js, ou par un <script> dans dist/index.html) : elle marche hors ligne, en file://, et dans une
 * page publiée. Servi en HTTP, le studio peut aussi lire un JSON (Domino.Storage.loadConfig(url)).
 * Schéma : engine/schema/config.schema.json. Documentation : docs/STORAGE.md.
 *
 * N'écrivez JAMAIS de secret ici (jeton, mot de passe) : un fournisseur HTTP obtient son jeton à
 * l'exécution (auth.token.from : 'prompt', 'session' ou 'prefs').
 */
globalThis.DominoConfig = {
  $schema: './engine/schema/config.schema.json',
  version: 1,

  storage: {
    // Fournisseur des nouveaux projets et de l'espace de travail.
    default: 'local',
    // Si le navigateur refuse le stockage (page en bac à sable, navigation privée) : la mémoire, avec un bandeau.
    fallback: 'memory',
    providers: {
      local: { type: 'localStorage', prefix: 'kantoaplo', label: 'Ce navigateur' },
      memory: { type: 'memory', label: 'Session (non conservé)' },

      // Une API distante, prête à brancher : passez enabled à true et renseignez baseUrl.
      // Le contrat HTTP (ressources Project, ETag, If-Match, 412 en cas de conflit) est dans docs/STORAGE.md.
      team: {
        type: 'http', enabled: false, label: 'Serveur de l’équipe',
        baseUrl: 'https://api.example.org/kantoaplo/v1',
        auth: { type: 'bearer', token: { from: 'prompt' } },
        headers: { 'X-Client': 'domino-studio' },
        endpoints: {
          list: 'GET /workspaces/{workspace}/projects?cursor={cursor}&limit={limit}',
          get: 'GET /projects/{key}',
          put: 'PUT /projects/{key}',
          remove: 'DELETE /projects/{key}',
          workspaceGet: 'GET /workspaces/{workspace}',
          workspacePut: 'PUT /workspaces/{workspace}',
        },
        workspace: 'default',
        concurrency: { mode: 'etag', requireIfMatch: true },
        conflicts: { strategy: 'ask' },
        timeoutMs: 15000,
        retry: { count: 2, backoffMs: 400 },
      },

      // Local d'abord, poussé vers le serveur à chaque enregistrement (file d'attente hors ligne).
      // cloud: { type: 'layered', local: 'local', remote: 'team', label: 'Équipe (hors ligne d’abord)', sync: { mode: 'onSave' } },
    },
  },

  autosave: { enabled: true, delayMs: 1200, backups: { keep: 5, everyMs: 30000 } },
  workbench: { restore: true, maxRecent: 12, maxGroups: 4, maxLiveEditors: 8, welcome: 'whenEmpty' },

  languages: {
    // L'ordre et les groupes de « Fichier › Nouveau ▸ » et de la page de bienvenue.
    groups: [
      ['Langages', ['kanto', 'quiz', 'automate', 'atelier', 'raison', 'jeu']],
      ['Domaines', ['tnr', 'api', 'workflow', 'circuit']],
      ['Modèles', ['etats', 'processus', 'decision', 'flux', 'blocs', 'formulaire', 'schema', 'carte']],
    ],
    allowImport: true,
    // false : importer un langage JSON qui contient du code demande une confirmation.
    trustImported: false,
  },

  ui: {
    theme: 'system', display: 'stone', skin: 'auto', locale: 'fr', author: null,
    // Le nom en haut à gauche, et des gabarits remplacés (voir docs/EXTENDING.md § 13, Domino.Templates.list()) :
    // brand: 'Mon <span>Atelier</span>',
    // templates: { 'toolbox.empty': (d, h) => h.html`<p class="dk-empty">Rien ici pour « ${d.query} ».</p>` },
  },

  // Menus ajoutés, remplacés (replace: true) ou retirés (remove: true) ; même forme qu'engine/studio/domino.studio.menus.js.
  // menus: { bar: [{ id: 'help', sections: [{ id: 'team', items: [{ link: 'docs/STUDIO.md', title: 'Guide de l’équipe' }] }] }] },

  // Raccourcis propres à cette instance : { key: 'Mod+Alt+R', command: 'run.run', when: 'hasEditor' }.
  keybindings: [],
};
