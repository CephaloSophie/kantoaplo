/**
 * Pinax (board) — fake demo data.
 *
 * Fills a THROWAWAY MongoDB database with a rich, fictional workspace:
 * 10 people, 3 projects, sprints/versions with real histories (so burndowns,
 * velocity and activity feeds are meaningful), comments, rituals, saved
 * filters and dashboards. Used only to record the static demo.
 *
 *   MONGODB_URI=mongodb://…/boardDemoCaptureTest node seed-demo.js
 *
 * Must be run from the board `server/` folder (it reuses its Mongoose models).
 * Refuses to run against a database whose name does not contain "test".
 */
const path = require('path');
const SERVER = process.env.BOARD_SERVER_DIR || process.cwd();
const req = (p) => require(path.join(SERVER, 'src', p));

const { connectDb, mongoose } = req('db');
const { User } = req('models/User');
const { Project } = req('models/Project');
const { Taxonomy } = req('models/Taxonomy');
const { Task } = req('models/Task');
const { Counter } = req('models/Counter');
const { Event } = req('models/Event');
const { Activity } = req('models/Activity');
const { Notification } = req('models/Notification');
const { SavedFilter } = req('models/SavedFilter');
const { Dashboard } = req('models/Dashboard');
const { TEMPLATES, sanitizeWidgets } = req('dashboards/widgets');
const { hashPassword } = req('utils/password');

const uri = process.env.MONGODB_URI || '';
if (!/test/i.test(uri.split('/').pop().split('?')[0])) {
  console.error('Refusing to seed: the database name must contain "test".');
  process.exit(1);
}

const DAY = 86400000;
const HOUR = 3600000;

/* ── deterministic RNG ── */
let seed = 20261119;
const rnd = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const chance = (p) => rnd() < p;
const between = (a, b) => a + Math.floor(rnd() * (b - a + 1));
const shuffle = (a) => a.map((v) => [rnd(), v]).sort((x, y) => x[0] - y[0]).map((x) => x[1]);

function mondayUtc(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  return new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * DAY);
}
const iso = (ms) => new Date(ms).toISOString();
// a working-hours timestamp inside [from, to]
function workTime(from, to) {
  let t = from + rnd() * Math.max(to - from, HOUR);
  const d = new Date(t);
  const wd = d.getUTCDay();
  if (wd === 0) t += DAY;
  if (wd === 6) t += 2 * DAY;
  const dd = new Date(Math.min(t, to));
  dd.setUTCHours(between(7, 16), between(0, 59), between(0, 59));
  return dd.getTime();
}

/* ── people ── */
const PEOPLE = [
  { username: 'demo', displayName: 'Camille Laurent', email: 'demo@kantoaplo.com', role: 'superadmin', color: '#e6c46a', title: 'Visiteur démo · Chef de projet' },
  { username: 'lea', displayName: 'Léa Moreau', email: 'lea.moreau@atlas-demo.io', role: 'developer', color: '#7ecb98' },
  { username: 'hugo', displayName: 'Hugo Bernard', email: 'hugo.bernard@atlas-demo.io', role: 'developer', color: '#6b78ea' },
  { username: 'ines', displayName: 'Inès Dubois', email: 'ines.dubois@atlas-demo.io', role: 'developer', color: '#e85d70' },
  { username: 'malik', displayName: 'Malik Benali', email: 'malik.benali@atlas-demo.io', role: 'developer', color: '#4fd1c5' },
  { username: 'sofia', displayName: 'Sofia Rossi', email: 'sofia.rossi@atlas-demo.io', role: 'developer', color: '#b39ddb' },
  { username: 'thomas', displayName: 'Thomas Petit', email: 'thomas.petit@atlas-demo.io', role: 'developer', color: '#e0a458' },
  { username: 'yanis', displayName: 'Yanis Haddad', email: 'yanis.haddad@atlas-demo.io', role: 'developer', color: '#9be15d' },
  { username: 'chloe', displayName: 'Chloé Garnier', email: 'chloe.garnier@atlas-demo.io', role: 'developer', color: '#f472b6' },
  { username: 'nora', displayName: 'Nora Kaci', email: 'nora.kaci@atlas-demo.io', role: 'developer', color: '#38bdf8' },
];

/* ── projects ── */
const STATUS_FLOW = ['pending', 'onprocess', 'tested', 'needconfirmation', 'finished'];

const PROJECTS = [
  {
    key: 'ATL',
    name: 'Atlas Commerce',
    vendor: 'Atlas Retail',
    description: "Plateforme e-commerce B2B : catalogue de 40 000 références, devis, commandes récurrentes et paiement fractionné pour les professionnels.",
    sprintWeeks: 2,
    sprints: 9, // finished before the active one
    planned: 2,
    firstVersion: [2, 0],
    team: ['demo', 'lea', 'hugo', 'ines', 'malik', 'sofia', 'thomas', 'yanis', 'chloe'],
    roles: { demo: 'admin', lea: 'admin', hugo: 'admin', ines: 'member', malik: 'member', sofia: 'member', thomas: 'member', yanis: 'member', chloe: 'member' },
    areas: [['catalog', 'Catalogue'], ['checkout', 'Panier & commande'], ['payment', 'Paiement'], ['account', 'Compte client'], ['backoffice', 'Back-office'], ['search', 'Recherche'], ['api', 'API publique'], ['infra', 'Infrastructure']],
    technos: ['React', 'Node.js', 'PostgreSQL', 'Elasticsearch', 'Stripe', 'Kubernetes', 'Figma'],
    categories: ['Fonctionnel', 'UX / UI', 'Performance', 'Sécurité', 'Dette technique', 'Observabilité', 'Tests'],
    epics: [
      ['catalog', 'Catalogue', ['Fiche produit : variantes taille / couleur', 'Import CSV des références fournisseurs', 'Prix dégressifs par palier de quantité', 'Galerie produit avec zoom et vidéo', 'Fiches techniques PDF téléchargeables', 'Produits associés et alternatives', 'Gestion des ruptures et dates de réassort', 'Catalogue personnalisé par contrat client', 'Badges « nouveau » et « promo » automatiques', 'Comparateur de produits (4 max)']],
      ['checkout', 'Panier & commande', ['Panier partagé entre acheteurs d’une même société', 'Validation de commande à deux niveaux', 'Commande rapide par référence', 'Commandes récurrentes planifiées', 'Récapitulatif avec frais de port estimés', 'Sauvegarde du panier entre appareils', 'Bons de commande PDF', 'Choix du créneau de livraison', 'Devis convertible en commande', 'Minimum de commande par fournisseur']],
      ['payment', 'Paiement', ['Paiement à 30 jours fin de mois', 'Intégration Stripe SEPA', 'Paiement fractionné en 3 fois', 'Relances automatiques des factures impayées', 'Avoirs et remboursements partiels', '3-D Secure 2 sur les cartes', 'Export comptable FEC', 'Rapprochement bancaire automatique']],
      ['account', 'Compte client', ['Gestion des utilisateurs d’une société', 'Rôles acheteur / approbateur / comptable', 'Carnet d’adresses de livraison', 'Historique des commandes filtrable', 'Authentification SSO (SAML)', 'Double authentification', 'Téléchargement des factures', 'Préférences de notification']],
      ['backoffice', 'Back-office', ['Tableau de bord des ventes du jour', 'Modération des avis clients', 'Gestion des promotions par segment', 'Journal d’audit des actions admin', 'Édition en masse des prix', 'Gestion des transporteurs', 'Export des commandes vers l’ERP']],
      ['search', 'Recherche', ['Recherche tolérante aux fautes', 'Facettes dynamiques par catégorie', 'Suggestions dès la 2e lettre', 'Synonymes métier (« visserie » → « vis »)', 'Classement par marge et disponibilité', 'Recherche par référence fabricant']],
      ['api', 'API publique', ['Webhooks commande créée / expédiée', 'Pagination par curseur', 'Clés API par environnement', 'Documentation OpenAPI 3.1', 'Limitation de débit par client']],
      ['infra', 'Infrastructure', ['Migration du cluster vers Kubernetes 1.31', 'Sauvegardes chiffrées quotidiennes', 'Tableau de bord Grafana des temps de réponse', 'CDN pour les images produit', 'Plan de reprise d’activité testé', 'Pipeline CI en moins de 8 minutes']],
    ],
    bugs: ['Le total TTC est arrondi deux fois', 'La pagination saute une page après un filtre', 'Double envoi du mail de confirmation', 'Le panier se vide après la connexion SSO', 'Les facettes ignorent les produits en rupture', 'Erreur 500 sur une adresse sans code postal', 'Le PDF du devis coupe les longues désignations', 'Le prix barré s’affiche sans promotion', 'Session expirée pendant le paiement', 'Tri par prix incorrect avec les paliers', 'Lien de réinitialisation valable deux fois', 'Image produit floue sur écran Retina'],
    chores: ['Mettre à jour React 19', 'Supprimer l’ancien module de promotions', 'Nettoyer les feature flags obsolètes', 'Passer les tests E2E sur Playwright', 'Documenter le modèle de prix', 'Réduire la taille du bundle de 20 %'],
  },
  {
    key: 'ORB',
    name: 'Orbit Mobile',
    vendor: 'Orbit Logistics',
    description: 'Application mobile de suivi de livraisons en temps réel pour les chauffeurs et les destinataires : tournées, preuves de livraison, chat.',
    sprintWeeks: 1,
    sprints: 10,
    planned: 1,
    firstVersion: [3, 4],
    team: ['demo', 'sofia', 'thomas', 'nora', 'yanis', 'chloe'],
    roles: { demo: 'admin', sofia: 'admin', thomas: 'member', nora: 'member', yanis: 'member', chloe: 'viewer' },
    areas: [['driver', 'App chauffeur'], ['tracking', 'Suivi destinataire'], ['routing', 'Tournées'], ['chat', 'Messagerie'], ['offline', 'Hors ligne']],
    technos: ['Flutter', 'Kotlin', 'Swift', 'Firebase', 'Mapbox', 'Go'],
    categories: ['Fonctionnel', 'UX / UI', 'Performance', 'Hors ligne', 'Tests'],
    epics: [
      ['driver', 'App chauffeur', ['Scan des colis au chargement', 'Signature du destinataire à l’écran', 'Photo de preuve de dépôt', 'Signalement d’incident en deux gestes', 'Mode nuit automatique']],
      ['tracking', 'Suivi destinataire', ['Carte en direct du livreur', 'Fenêtre de livraison de 30 minutes', 'Notification « livreur à 5 minutes »', 'Reprogrammer la livraison', 'Note de la livraison']],
      ['routing', 'Tournées', ['Optimisation de tournée sur 120 arrêts', 'Réordonner les arrêts à la main', 'Temps de trajet en fonction du trafic', 'Zones à accès restreint']],
      ['chat', 'Messagerie', ['Chat chauffeur ↔ destinataire', 'Messages prédéfinis', 'Traduction automatique des messages']],
      ['offline', 'Hors ligne', ['File d’attente des preuves hors réseau', 'Cartes téléchargées par tournée', 'Synchronisation différentielle']],
    ],
    bugs: ['Crash au retour de l’appareil photo sur Android 15', 'Position GPS figée en tunnel', 'Badge de notification qui ne disparaît pas', 'Signature tronquée en mode paysage', 'Double scan du même colis accepté'],
    chores: ['Monter Flutter 3.29', 'Activer Crashlytics', 'Réduire le temps de démarrage à froid'],
  },
  {
    key: 'HEL',
    name: 'Helios Data',
    vendor: 'Helios Énergie',
    description: 'Entrepôt de données et reporting pour 2 300 sites de production solaire : ingestion des onduleurs, alertes, rapports mensuels.',
    sprintWeeks: 2,
    sprints: 5,
    planned: 1,
    firstVersion: [1, 0],
    team: ['demo', 'ines', 'malik', 'hugo', 'nora'],
    roles: { demo: 'admin', ines: 'admin', malik: 'member', hugo: 'member', nora: 'member' },
    areas: [['ingest', 'Ingestion'], ['warehouse', 'Entrepôt'], ['reporting', 'Reporting'], ['alerts', 'Alertes']],
    technos: ['Python', 'dbt', 'BigQuery', 'Airflow', 'Metabase'],
    categories: ['Fonctionnel', 'Qualité des données', 'Performance', 'Observabilité'],
    epics: [
      ['ingest', 'Ingestion', ['Connecteur Modbus des onduleurs', 'Reprise des données manquantes', 'Ingestion météo horaire', 'Dédoublonnage des relevés']],
      ['warehouse', 'Entrepôt', ['Modèle en étoile de la production', 'Historisation des contrats (SCD 2)', 'Tests de fraîcheur dbt', 'Partitionnement par mois']],
      ['reporting', 'Reporting', ['Rapport mensuel PDF par site', 'Tableau de bord du rendement', 'Comparaison production / prévision', 'Export pour le régulateur']],
      ['alerts', 'Alertes', ['Alerte onduleur silencieux', 'Détection de sous-performance', 'Escalade SMS de nuit']],
    ],
    bugs: ['Décalage d’une heure au passage à l’heure d’été', 'Production négative sur certains sites', 'Rapport vide pour les sites mis en service ce mois'],
    chores: ['Monter Airflow 3', 'Supprimer les vues SQL inutilisées'],
  },
];

const COMMENTS = [
  'Je prends. Je pense finir demain midi.',
  'Maquette validée avec @lea, on part sur la version B.',
  'Attention : impact sur l’export ERP, à tester avec @yanis.',
  'PR ouverte, il reste les tests d’intégration.',
  'Revue faite ✅ deux petites remarques sur le nommage.',
  'Reproduit en recette, ça vient du cache de session.',
  'On découpe en deux : le back cette semaine, le front au prochain sprint.',
  'Le client confirme le besoin, priorité haute.',
  'Testé sur iOS et Android, tout est vert.',
  'Je bloque sur l’accès à l’environnement de préprod, @hugo tu peux m’ajouter ?',
  'Démo faite au PO, validé 👍',
  'Estimation revue en refinement : 5 points au lieu de 3.',
  'Documentation mise à jour dans le wiki.',
  'Petit souci de perf sur 10 000 lignes, je regarde l’index.',
];

const DESCRIPTIONS = [
  'En tant qu’utilisateur, je veux pouvoir profiter de : {t}, afin de gagner du temps au quotidien.',
  'Objectif : {t}. Le besoin vient de trois clients grands comptes interrogés en entretien.',
  '{t}. Voir la maquette Figma et les règles de gestion associées.',
  'Contexte : remonté par le support (12 tickets ce mois). {t}.',
];

const BUG_DESCRIPTIONS = [
  'Constaté en recette : {t}. Reproductible à chaque fois sur Chrome et Safari.',
  'Remonté par le support (4 tickets) : {t}. Étapes de reproduction dans le premier commentaire.',
  'Détecté par la supervision : {t}. Impact estimé à 2 % des sessions.',
];

const ACCEPTANCE = [
  ['Le comportement est couvert par des tests automatisés', 'Fonctionne sur mobile et desktop', 'Accessible au clavier'],
  ['Temps de réponse < 300 ms au 95e centile', 'Journalisé dans l’audit', 'Messages d’erreur en français'],
  ['Validé par le PO en démo', 'Documentation utilisateur à jour'],
];

async function run() {
  await connectDb();
  await mongoose.connection.db.dropDatabase();
  await Promise.all([User, Project, Taxonomy, Task, Counter, Event, Activity, Notification, SavedFilter, Dashboard].map((m) => m.syncIndexes()));

  const now = new Date();
  const passwordHash = await hashPassword('Pinax2026!');
  const users = {};
  for (const p of PEOPLE) {
    users[p.username] = await User.create({ ...p, passwordHash, active: true, createdAt: new Date(now - 200 * DAY) });
  }
  const U = (u) => users[u];

  for (const P of PROJECTS) {
    const sprintLen = P.sprintWeeks * 7 * DAY;
    const thisMonday = mondayUtc(now).getTime();
    // the active sprint started this week (1-week) or last week (2-week) so it is half-way through
    const activeStart = P.sprintWeeks === 2 ? thisMonday - 7 * DAY : thisMonday;
    const firstStart = activeStart - P.sprints * sprintLen;
    const owner = U('demo');

    const project = await Project.create({
      key: P.key,
      name: P.name,
      vendor: P.vendor,
      description: P.description,
      owner: owner._id,
      sprintDurationValue: P.sprintWeeks,
      sprintDurationUnit: 'weeks',
      access: 'members',
      members: P.team.map((u) => ({ user: U(u)._id, role: P.roles[u] || 'member', addedAt: new Date(firstStart - 7 * DAY), addedBy: owner._id })),
      defaults: { status: 'pending', type: 'feature', priority: 'P2' },
      createdAt: new Date(firstStart - 10 * DAY),
    });

    /* taxonomies */
    const tax = [];
    const add = (kind, key, label, extra = {}) => tax.push({ project: project._id, kind, key, label, order: tax.filter((t) => t.kind === kind).length, ...extra });
    [
      ['draft', 'Brouillon', '#6b7280', 'todo'],
      ['pending', 'À faire', '#9db4dd', 'todo'],
      ['onprocess', 'En cours', '#e6c46a', 'inprogress'],
      ['tested', 'En recette', '#7ecb98', 'inprogress'],
      ['needconfirmation', 'À valider', '#e0a458', 'inprogress'],
      ['finished', 'Terminée', '#2f8f57', 'done'],
      ['confirmed', 'Validée', '#1c6a40', 'done'],
    ].forEach(([k, l, c, cat]) => add('status', k, l, { color: c, meta: { category: cat, isDone: cat === 'done' } }));
    [['P0', 'Bloquant', '#e85d70'], ['P1', 'Haute', '#e6c46a'], ['P2', 'Moyenne', '#9db4dd'], ['P3', 'Basse', '#6b7280']].forEach(([k, l, c]) => add('priority', k, l, { color: c }));
    [['story', 'Story', '#6b78ea'], ['feature', 'Fonctionnalité', '#7ecb98'], ['bug', 'Bug', '#e85d70', { isBug: true }], ['chore', 'Technique', '#9db4dd'], ['spike', 'Étude', '#b39ddb']].forEach(([k, l, c, m]) => add('type', k, l, { color: c, meta: m || {} }));
    P.areas.forEach(([k, l]) => add('area', k, l));
    P.technos.forEach((t) => add('techno', t, t));
    P.categories.forEach((c) => add('category', c, c));
    [
      ['refinement', 'Refinement', '#6b78ea', '🔍', ['participants', 'backlog', 'estimation', 'agenda', 'actions', 'decisions']],
      ['grooming', 'Grooming', '#7ecb98', '🌱', ['participants', 'backlog', 'estimation', 'agenda']],
      ['technical', 'Point technique', '#e6c46a', '🛠️', ['participants', 'agenda', 'decisions', 'actions', 'backlog']],
      ['architecture', 'Point architecture', '#b39ddb', '🏛️', ['participants', 'adr', 'decisions', 'actions']],
      ['demo_prep', 'Préparation démo', '#e0a458', '🎬', ['participants', 'demo', 'backlog', 'agenda']],
      ['retro', 'Rétrospective', '#e85d70', '🔄', ['participants', 'decisions', 'actions', 'notes']],
    ].forEach(([k, l, c, icon, features]) => add('eventType', k, l, { color: c, meta: { icon, features } }));

    /* sprints + versions: one version per sprint */
    const total = P.sprints + 1 + P.planned;
    const sprintDefs = [];
    let [maj, min] = P.firstVersion;
    for (let i = 0; i < total; i++) {
      const v = `${maj}.${min}.0`;
      min += 1;
      if (min > 9) { maj += 1; min = 0; }
      const start = firstStart + i * sprintLen;
      const end = start + sprintLen - 3 * DAY; // ends on Friday
      const state = i < P.sprints ? 'finished' : i === P.sprints ? 'active' : i === P.sprints + 1 ? 'ready' : 'draft';
      sprintDefs.push({ i, key: `sprint-${i + 1}`, label: `Sprint ${i + 1}`, version: v, start, end, state });
    }
    const GOALS = ['Livrer le parcours de commande rapide', 'Stabiliser le paiement et réduire les abandons', 'Ouvrir l’API aux partenaires', 'Recherche : pertinence et vitesse', 'Back-office autonome pour les commerciaux', 'Compte client multi-utilisateurs', 'Performance mobile et hors ligne', 'Qualité : zéro bug bloquant', 'Préparer le salon professionnel', 'Industrialiser la mise en production', 'Rapports pour les grands comptes', 'Expérience de livraison premium'];
    sprintDefs.forEach((s, i) => {
      s.goal = GOALS[(i + P.key.charCodeAt(0)) % GOALS.length];
      add('version', s.version, s.version, {
        meta:
          s.state === 'finished'
            ? { status: 'released', startDate: iso(s.start), releaseDate: iso(s.end), releasedAt: iso(s.end + 3 * HOUR), description: s.goal }
            : { status: 'unreleased', startDate: iso(s.start), releaseDate: iso(s.end), description: s.goal },
      });
    });
    project.currentVersion = sprintDefs[P.sprints].version;
    project.currentSprint = sprintDefs[P.sprints].key;
    await project.save();

    /* tasks */
    const team = P.team.filter((u) => u !== 'chloe' || P.key === 'ATL');
    const devs = team.filter((u) => u !== 'demo');
    const items = [];
    for (const [area, epicName, titles] of P.epics) {
      for (const t of titles) items.push({ area, epicName, title: t, type: chance(0.35) ? 'story' : 'feature' });
    }
    P.bugs.forEach((t) => items.push({ area: pick(P.areas)[0], title: t, type: 'bug' }));
    P.chores.forEach((t) => items.push({ area: 'infra' in Object.fromEntries(P.areas) ? 'infra' : pick(P.areas)[0], title: t, type: chance(0.3) ? 'spike' : 'chore' }));
    // a few extra stories to make the backlog deep
    const variants = ['(v2)', '— cas limites', '— accessibilité', '— version mobile', '— traduction anglaise'];
    shuffle(items.slice()).slice(0, Math.round(items.length * 0.45)).forEach((it) => items.push({ ...it, title: `${it.title} ${pick(variants)}`, type: it.type === 'bug' ? 'bug' : pick(['story', 'feature', 'chore']) }));

    const shuffled = shuffle(items);
    // distribution: ~58 % in finished sprints, ~20 % active, ~10 % planned, rest backlog
    const nFinished = Math.round(shuffled.length * 0.58);
    const nActive = Math.max(8, Math.round(shuffled.length * 0.2));
    const nPlanned = Math.round(shuffled.length * 0.1);
    const tasks = [];
    let seq = 0;
    const activity = [];
    const userById = (u) => U(u);

    shuffled.forEach((it, idx) => {
      seq += 1;
      const taskId = `${P.key}-${String(seq).padStart(3, '0')}`;
      let sprint = null;
      let bucket = 'backlog';
      if (idx < nFinished) {
        sprint = sprintDefs[idx % P.sprints];
        bucket = 'finished';
      } else if (idx < nFinished + nActive) {
        sprint = sprintDefs[P.sprints];
        bucket = 'active';
      } else if (idx < nFinished + nActive + nPlanned) {
        sprint = sprintDefs[P.sprints + 1 + (idx % P.planned)];
        bucket = 'planned';
      }
      const reporter = pick(['demo', 'lea', 'hugo'].filter((u) => team.includes(u)).concat(['demo']));
      const assignee = bucket === 'backlog' && chance(0.6) ? null : pick(devs);
      const points = it.type === 'bug' ? pick([1, 1, 2, 3]) : it.type === 'chore' ? pick([1, 2, 3]) : pick([1, 2, 3, 3, 5, 5, 8, 13]);
      const priority = it.type === 'bug' ? pick(['P0', 'P1', 'P1', 'P2']) : pick(['P1', 'P2', 'P2', 'P2', 'P3']);
      const sprintStart = sprint ? sprint.start : now.getTime() - between(5, 60) * DAY;
      const createdAt = sprint ? sprintStart - between(3, 25) * DAY : sprintStart;
      const hist = [];
      const H = (at, field, from, to, by, note) => hist.push({ at: new Date(at), by: by ? userById(by)._id : undefined, byLabel: by ? userById(by).displayName : undefined, field, from, to, note });
      H(createdAt, 'created', null, it.title, reporter);
      let status = bucket === 'backlog' ? (chance(0.35) ? 'draft' : 'pending') : 'pending';
      if (bucket === 'backlog' && status === 'pending') H(createdAt + between(1, 3) * DAY, 'status', 'draft', 'pending', reporter);
      if (sprint) H(sprintStart - between(1, 3) * DAY, 'sprint', null, sprint.key, 'demo', 'Planification du sprint');
      if (assignee) H(sprintStart - between(0, 2) * DAY, 'assignee', null, String(userById(assignee)._id), 'demo');

      let resolvedAt = null;
      let statusChangedAt = null;
      const walk = (target, from, to) => {
        const steps = STATUS_FLOW.slice(1, STATUS_FLOW.indexOf(target) + 1);
        let t = from;
        const slot = (to - from) / (steps.length + 1);
        for (const st of steps) {
          t = workTime(t, t + slot);
          H(t, 'status', status, st, st === 'needconfirmation' || st === 'finished' ? pick(['lea', 'hugo', 'yanis'].filter((u) => team.includes(u)).concat(assignee || 'demo')) : assignee || 'demo');
          status = st;
          statusChangedAt = new Date(t);
          if (st === 'finished') resolvedAt = new Date(t);
        }
      };
      if (bucket === 'finished') {
        const target = chance(0.88) ? (chance(0.25) ? 'confirmed' : 'finished') : pick(['tested', 'onprocess']);
        if (target === 'confirmed') {
          walk('finished', sprint.start, sprint.end - DAY);
          const t = workTime(sprint.end - DAY, sprint.end);
          H(t, 'status', 'finished', 'confirmed', 'demo', 'Validé en démo');
          status = 'confirmed';
          statusChangedAt = new Date(t);
        } else walk(target, sprint.start, sprint.end);
      } else if (bucket === 'active') {
        const elapsed = Math.min(now.getTime(), sprint.end) - sprint.start;
        const r = rnd();
        const target = r < 0.28 ? 'pending' : r < 0.55 ? 'onprocess' : r < 0.68 ? 'tested' : r < 0.78 ? 'needconfirmation' : 'finished';
        if (target !== 'pending') walk(target, sprint.start, sprint.start + elapsed * 0.95);
      }

      const comments = [];
      const nComments = bucket === 'backlog' ? between(0, 1) : between(0, 4);
      for (let c = 0; c < nComments; c++) {
        const author = pick(team);
        const at = new Date(Math.min(now.getTime() - HOUR, createdAt + (c + 1) * between(1, 4) * DAY));
        comments.push({ author: U(author)._id, text: pick(COMMENTS).replace(/@(\w+)/g, (m, u) => (users[u] ? `@${u}` : m)), createdAt: at, updatedAt: at, mentions: undefined });
      }
      if (comments.length > 1 && chance(0.5)) {
        comments[1].parent = undefined;
        comments[0].reactions = [{ emoji: pick(['👍', '🎉', '👀', '🚀']), users: [U(pick(team))._id] }];
      }

      const desc = it.type === 'bug'
        ? pick(BUG_DESCRIPTIONS).replace('{t}', it.title)
        : pick(DESCRIPTIONS).replace('{t}', it.title.charAt(0).toLowerCase() + it.title.slice(1)).replace(/^(.)/, (c) => c.toUpperCase());
      const labels = [];
      if (chance(0.3)) labels.push(pick(['client-clé', 'quick-win', 'salon-2026', 'rgpd', 'mobile-first', 'tech-debt', 'perf']));
      if (it.type === 'bug' && chance(0.4)) labels.push('régression');
      const dueDate = bucket === 'active' && chance(0.3) ? new Date(sprint.end) : null;
      const last = hist.reduce((m, h) => Math.max(m, h.at.getTime()), createdAt);
      tasks.push({
        project: project._id,
        taskId,
        title: it.title,
        description: `${desc}${it.epicName ? `\n\n**Épopée :** ${it.epicName}` : ''}`,
        area: it.area,
        module: it.epicName || '',
        type: it.type,
        status,
        priority,
        version: sprint ? sprint.version : null,
        sprint: sprint ? sprint.key : null,
        techno: pick(P.technos),
        category: it.type === 'bug' ? 'Fonctionnel' : pick(P.categories),
        labels,
        estimate: `${points * 3} h`,
        duration: status === 'finished' || status === 'confirmed' ? `${points * between(2, 4)} h` : '',
        complexity: points,
        instructions: chance(0.6) ? ['Lire la spécification et les maquettes', 'Ajouter les tests unitaires et E2E', 'Mettre à jour la documentation'] : [],
        acceptance: pick(ACCEPTANCE),
        assignee: assignee ? U(assignee)._id : null,
        reporter: U(reporter)._id,
        dueDate,
        resolvedAt,
        statusChangedAt,
        comments,
        history: hist.sort((a, b) => a.at - b.at),
        createdAt: new Date(createdAt),
        updatedAt: new Date(last),
      });
      for (const h of hist) {
        activity.push({
          project: project._id, at: h.at, actor: h.by || null, actorLabel: h.byLabel || 'système', scope: 'task',
          action: h.field === 'created' ? 'task.created' : 'task.updated', taskId, taskTitle: it.title, field: h.field, from: h.from, to: h.to, note: h.note,
          sprints: sprint ? [sprint.key] : undefined, versions: sprint ? [sprint.version] : undefined,
        });
      }
      for (const c of comments) {
        activity.push({ project: project._id, at: c.createdAt, actor: c.author, actorLabel: Object.values(users).find((u) => String(u._id) === String(c.author)).displayName, scope: 'task', action: 'comment.added', taskId, taskTitle: it.title, note: c.text.slice(0, 120), sprints: sprint ? [sprint.key] : undefined });
      }
    });

    // epics as parents for a few stories
    const parents = tasks.filter((t) => t.type === 'story').slice(0, 6);
    tasks.forEach((t) => {
      if (t.type !== 'story' && chance(0.25) && parents.length) {
        const p = parents.find((x) => x.module === t.module && x.taskId !== t.taskId);
        if (p) t.parent = p.taskId;
      }
    });

    await Task.insertMany(tasks, { timestamps: false });
    await Counter.create({ _id: P.key, seq });

    // sprint taxonomy with reports
    const pts = (list) => list.reduce((a, t) => a + (t.complexity || 0), 0);
    sprintDefs.forEach((s) => {
      const inSprint = tasks.filter((t) => t.sprint === s.key);
      const done = inSprint.filter((t) => ['finished', 'confirmed'].includes(t.status));
      const meta = { linkedVersion: s.version, status: s.state, startDate: iso(s.start), endDate: iso(s.end), goal: s.goal };
      if (s.state === 'finished' || s.state === 'active') {
        meta.startedAt = iso(s.start + 9 * HOUR);
        meta.startedBy = String(U('demo')._id);
        meta.startSnapshot = { at: iso(s.start + 9 * HOUR), committedPoints: pts(inSprint), committedCount: inSprint.length, taskIds: inSprint.map((t) => t.taskId) };
      }
      if (s.state === 'finished') {
        meta.closedAt = iso(s.end + 16 * HOUR);
        meta.closedBy = String(U('demo')._id);
        meta.report = {
          committedPoints: pts(inSprint), committedCount: inSprint.length, completedPoints: pts(done), completedCount: done.length,
          carriedOverTaskIds: [], carriedOverPoints: 0, carriedTo: null,
          keptTaskIds: inSprint.filter((t) => !done.includes(t)).map((t) => t.taskId), source: 'close',
        };
        activity.push({ project: project._id, at: new Date(s.end + 16 * HOUR), actor: U('demo')._id, actorLabel: U('demo').displayName, scope: 'sprint', action: 'sprint.closed', sprints: [s.key], data: { completedPoints: pts(done) } });
        activity.push({ project: project._id, at: new Date(s.end + 17 * HOUR), actor: U('demo')._id, actorLabel: U('demo').displayName, scope: 'version', action: 'version.released', versions: [s.version] });
      }
      if (s.state !== 'draft') activity.push({ project: project._id, at: new Date(s.start + 9 * HOUR), actor: U('demo')._id, actorLabel: U('demo').displayName, scope: 'sprint', action: s.state === 'ready' ? 'sprint.updated' : 'sprint.started', sprints: [s.key] });
      add('sprint', s.key, s.label, { meta });
    });
    await Taxonomy.insertMany(tax);
    await Activity.insertMany(activity);

    /* rituals */
    const evs = [];
    const lastSprints = sprintDefs.slice(Math.max(0, P.sprints - 3), P.sprints + 2);
    for (const s of lastSprints) {
      const inSprint = tasks.filter((t) => t.sprint === s.key);
      const at = (d, h) => new Date(s.start + d * DAY + h * HOUR);
      const status = s.state === 'finished' ? 'done' : s.state === 'active' ? 'scheduled' : 'draft';
      const ppl = P.team.slice(0, 6).map((u) => U(u)._id);
      const linked = (n) => inSprint.slice(0, n).map((t, i) => ({ task: undefined, taskId: t.taskId, note: '', outcome: pick(['estimé 3 pts', 'estimé 5 pts', 'à découper', 'prêt', 'à revoir avec le PO']), order: i, presenter: t.assignee }));
      evs.push({ type: 'refinement', title: `Refinement — ${s.label}`, status: s.state === 'draft' ? 'scheduled' : 'done', sprint: s.key, scheduledAt: at(-4, 9.5), durationMin: 90, participants: ppl, tasks: linked(6), agenda: '1. Revue des stories prioritaires\n2. Estimation en points\n3. Risques et dépendances', decisions: ['Découper la commande récurrente en deux stories', 'Les bugs P0 passent avant toute story'], actionItems: [{ text: 'Mettre à jour les maquettes du panier', assignee: U(P.team[1])._id, done: s.state === 'finished' }, { text: 'Vérifier la faisabilité côté ERP', assignee: U(P.team[2])._id, done: false }] });
      evs.push({ type: 'technical', title: `Point technique — ${s.goal.toLowerCase()}`, status, sprint: s.key, scheduledAt: at(2, 14), durationMin: 45, participants: ppl.slice(1, 5), tasks: linked(3), agenda: 'Choix de la stratégie de cache et du découpage des services.', decisions: ['Cache Redis avec invalidation par événement'], actionItems: [{ text: 'Prototype du cache sur la fiche produit', assignee: U(P.team[3])._id, done: s.state === 'finished' }] });
      if (s.state !== 'draft') evs.push({ type: 'demo_prep', title: `Préparation démo ${s.version}`, status, sprint: s.key, scheduledAt: at(10, 15), durationMin: 30, participants: ppl, tasks: linked(4), agenda: 'Ordre de passage et jeu de données de démo.' });
      if (s.state === 'finished') evs.push({ type: 'retro', title: `Rétrospective — ${s.label}`, status: 'done', sprint: s.key, scheduledAt: at(11, 16), durationMin: 60, participants: ppl, notes: '👍 Bonne entraide sur les revues de code\n👍 Démo fluide, client ravi\n👎 Trop d’interruptions en milieu de sprint\n💡 Créneau « focus » sans réunion le jeudi matin', decisions: ['Créneau focus le jeudi matin', 'Définition of Done : tests E2E obligatoires'], actionItems: [{ text: 'Bloquer le créneau focus dans les agendas', assignee: U(P.team[1])._id, done: true }, { text: 'Ajouter un modèle de PR', assignee: U(P.team[2])._id, done: false }] });
    }
    evs.push({ type: 'architecture', title: 'ADR-012 — Découpage du monolithe commande', status: 'done', sprint: sprintDefs[P.sprints - 1].key, scheduledAt: new Date(sprintDefs[P.sprints - 1].start + 3 * DAY + 10 * HOUR), durationMin: 90, participants: P.team.slice(0, 4).map((u) => U(u)._id), adr: { context: 'Le service commande concentre 60 % des incidents et bloque les mises en production.', decision: 'Extraire le calcul de prix et la facturation en deux services indépendants, synchronisés par événements.', alternatives: 'Garder le monolithe et ajouter des tests ; migrer d’un bloc vers des micro-services.', consequences: 'Déploiements indépendants, mais besoin d’une observabilité distribuée.' }, decisions: ['Extraction progressive (strangler pattern)'], actionItems: [{ text: 'Rédiger le contrat d’événements', assignee: U(P.team[1])._id, done: true }] });
    for (const e of evs) {
      e.tasks = (e.tasks || []).map((l) => ({ ...l, task: tasks.find((t) => t.taskId === l.taskId) && undefined }));
    }
    const taskDocs = await Task.find({ project: project._id }).select('_id taskId').lean();
    const idOf = Object.fromEntries(taskDocs.map((t) => [t.taskId, t._id]));
    await Event.insertMany(evs.map((e) => ({ ...e, project: project._id, createdBy: U('demo')._id, tasks: (e.tasks || []).map((l) => ({ ...l, task: idOf[l.taskId] })) })));

    /* saved filters */
    const sf = (name, filters, extra = {}) => ({ project: project._id, owner: U('demo')._id, name, filters, visibility: 'shared', view: 'grouped', groupBy: 'sprint', ...extra });
    await SavedFilter.insertMany([
      sf('Mes tâches ouvertes', { assignee: ['@me'], statusCategory: ['todo', 'inprogress'] }, { view: 'jira', starredBy: [U('demo')._id] }),
      sf('Bugs bloquants', { type: ['bug'], priority: ['P0', 'P1'], statusCategory: ['todo', 'inprogress'] }, { view: 'list', groupBy: 'priority', starredBy: [U('demo')._id] }),
      sf('Sprint courant par personne', { sprint: ['@current'] }, { groupBy: 'assignee' }),
      sf('Backlog à affiner', { sprint: ['@none'], status: ['draft', 'pending'] }, { view: 'list', groupBy: 'area' }),
    ]);

    /* dashboards (server templates, same validation as the API) */
    const dash = (name, tpl, extra = {}) => {
      const t = TEMPLATES[tpl];
      return { project: project._id, owner: U('demo')._id, name, visibility: 'shared', globalFilters: t.globalFilters, widgets: sanitizeWidgets(JSON.parse(JSON.stringify(t.widgets))), ...extra };
    };
    await Dashboard.create(dash('Sprint en cours', 'sprint', { starredBy: [U('demo')._id], defaultFor: [U('demo')._id], description: 'Burndown, charge et bloquants du sprint actif.' }));
    await Dashboard.create(dash('Pilotage produit', 'po', { starredBy: [U('demo')._id], description: 'Vélocité, avancement par version et activité.' }));
    await Dashboard.create(dash('Mon espace', 'dev', { visibility: 'private' }));

    /* notifications for the demo user */
    const recent = tasks.filter((t) => t.sprint === sprintDefs[P.sprints].key).slice(0, 7);
    await Notification.insertMany(
      recent.map((t, i) => ({
        user: U('demo')._id, project: project._id, projectKey: P.key, type: ['mention', 'assigned', 'comment', 'status', 'reaction', 'reply', 'comment'][i],
        taskId: t.taskId, taskTitle: t.title, actor: U(devs[i % devs.length])._id, actorLabel: U(devs[i % devs.length]).displayName,
        excerpt: pick(COMMENTS), read: i > 3, createdAt: new Date(now - (i + 1) * 3 * HOUR), updatedAt: new Date(now - (i + 1) * 3 * HOUR),
      }))
    );

    console.log(`[seed-demo] ${P.key}: ${tasks.length} tâches, ${sprintDefs.length} sprints, ${evs.length} rituels`);
  }

  // an archived project, to show the archive screen
  await Project.create({ key: 'LEG', name: 'Legacy Intranet', description: 'Ancien intranet, archivé après migration.', owner: U('demo')._id, archived: true, archivedAt: new Date(now - 40 * DAY), archivedBy: U('demo')._id, members: [{ user: U('demo')._id, role: 'admin' }] });

  console.log('[seed-demo] done — login: demo / Pinax2026!');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
