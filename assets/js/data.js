/* ═══════════════════════════════════════════════════════════════════════
   KANTO APLO — contenu de la vitrine
   ───────────────────────────────────────────────────────────────────────
   Tout ce qui s'affiche sur la page vient d'ici : éditeurs, autres projets,
   slogans, clients. L'ordre du tableau `editors` est l'ordre d'affichage.

   Captures d'un éditeur :
     assets/editors/<id>/01.webp, 02.webp …        (pleine taille, ≤ 1600 px)
     assets/editors/<id>/thumbs/01.webp …          (miniatures, 560 px)
   `shots` = nombre de captures, `captions_fr` / `captions_en` (facultatif) =
   une légende par capture, dans l'ordre. Pour ajouter des captures :
     python3 tools/add-shots.py <id> capture1.png capture2.png …
   ═══════════════════════════════════════════════════════════════════════ */

window.KANTO = {

  editors: [
    { id: 'skopos', greek: 'ΣΚΟΠΟΣ', latin: 'Skopos', accent: '#9BE15D',
      role_fr: 'Le guetteur', role_en: 'The watcher',
      meaning_fr: 'σκοπός — celui qui observe et vise juste', meaning_en: 'σκοπός — the one who watches and aims true',
      pitch_fr: "L'observateur, celui qui surveille. Il observe tes APIs, détecte les anomalies et te prévient avant tes utilisateurs.",
      pitch_en: 'The observer — the one who monitors. It watches your APIs, detects anomalies and warns you before your users notice.',
      features: [
        { fr: 'Surveillance continue des APIs', en: 'Continuous API monitoring' },
        { fr: 'Détection d’anomalies', en: 'Anomaly detection' },
        { fr: 'Alertes avant vos utilisateurs', en: 'Alerts before your users notice' }
      ],
      status: 'ready', href: 'demos/skopos/index.html', shots: 10 },

    { id: 'hephaistos', greek: 'ἭΦΑΙΣΤΟΣ', latin: 'Héphaïstos', accent: '#E84A4A',
      role_fr: 'La forge', role_en: 'The forge',
      meaning_fr: 'Ἥφαιστος — le dieu forgeron', meaning_en: 'Ἥφαιστος — the smith god',
      pitch_fr: "Éditeur de blocs Blockly. Il forge les composants visuels que Tektôn assemblera. Sans Héphaïstos, rien à bâtir.",
      pitch_en: 'Blockly block editor. It forges the visual components Tektôn will assemble. Without Héphaïstos, nothing to build.',
      features: [
        { fr: 'Blocs Blockly sur mesure', en: 'Custom Blockly blocks' },
        { fr: 'Composants prêts pour Tektôn', en: 'Components ready for Tektôn' },
        { fr: 'Export en plugins Zeugma', en: 'Exports Zeugma plugins' }
      ],
      status: 'ready', href: 'demos/hephaistos/index.html', shots: 2 },

    { id: 'zeugma', greek: 'ΖΕΥΓΜΑ', latin: 'Zeugma', accent: '#4FD1C5', version: 'v1.2.0',
      role_fr: 'Le lien', role_en: 'The link',
      meaning_fr: 'ζεῦγμα — joug, attelage, ce qui lie deux choses', meaning_en: 'ζεῦγμα — yoke, coupling, what binds two things',
      pitch_fr: "Une bibliothèque de dominos pour construire sans code des éditeurs visuels, des workflows et des outils d'automatisation — généralistes, métier ou internes.",
      pitch_en: 'A domino-based library for building visual editors, workflows and automation tools without code — general-purpose, domain-specific or internal.',
      features: [
        { fr: 'Six langages, trois éditeurs métier, huit modèles', en: 'Six languages, three domain editors, eight templates' },
        { fr: 'Templates Atelier, Flux, Console — thèmes et connexions', en: 'Atelier, Flux, Console templates — themes and wires' },
        { fr: 'Extensions et Store Zeugma : plugins installables', en: 'Extensions and Zeugma Store: installable plugins' }
      ],
      captions_fr: ['Kanto : un programme en dominos, fils et déclarations', 'Template Console : sombre, néon, pour les développeurs', 'Plugin « Carnet » installé : template sépia en ruban', 'Personnaliser l’interface : templates, thèmes, connexions', 'Extensions : installer un plugin depuis le store', 'Extensions installées : désactiver, exporter, désinstaller', 'Accueil du studio : démarrer, langages, modèles', 'Nouveau projet : un langage, un modèle', 'Concepteur : l’éditeur se compile en direct, à côté', 'Créer un éditeur : neuf points de départ', 'Scénarios d’API (TNR) : tableau de bord de la campagne', 'Déroulé : un couloir par scénario', 'Effet domino : l’exécution pas à pas', 'Éditeur de circuit : neuf niveaux de portes logiques', 'Machine à états : transitions et gardes', 'Le même projet en diagramme', 'Quatre volets : grille 2 × 2', 'Créateur de quiz : 20 questions, aiguillages, sauts'],
      captions_en: ['Kanto: a program made of dominoes, wires and declarations', 'Console template: dark, neon, for developers', '“Carnet” plugin installed: sepia ribbon template', 'Customize the interface: templates, themes, wires', 'Extensions: install a plugin from the store', 'Installed extensions: disable, export, uninstall', 'Studio home: start, languages, templates', 'New project: a language, a template', 'Designer: the editor compiles live, side by side', 'Create an editor: nine starting points', 'API scenarios (regression): campaign dashboard', 'Timeline: one lane per scenario', 'Domino effect: step-by-step execution', 'Circuit editor: nine levels of logic gates', 'State machine: transitions and guards', 'The same project as a diagram', 'Four panes: 2 × 2 grid', 'Quiz builder: 20 questions, switches, jumps'],
      status: 'ready', href: 'demos/zeugma/index.html', shots: 18 },

    { id: 'typos', greek: 'ΤΥΠΟΣ', latin: 'Typos', accent: '#D4A373',
      role_fr: 'Le moule', role_en: 'The mould',
      meaning_fr: "τύπος — l'empreinte, le moule", meaning_en: 'τύπος — the imprint, the mould',
      pitch_fr: 'Éditeur de templates structurels — grille, zones, arborescence — le squelette que Tektôn remplira.',
      pitch_en: 'Structural template editor — grid, zones, tree — the skeleton Tektôn fills.',
      features: [
        { fr: 'Grilles et zones', en: 'Grids and zones' },
        { fr: 'Arborescence des pages', en: 'Page tree' },
        { fr: 'Squelettes réutilisables', en: 'Reusable skeletons' }
      ],
      status: 'ready', href: 'demos/typos/index.html', shots: 11 },

    { id: 'tekton', greek: 'ΤΈΚΤΩΝ', latin: 'Tektôn', accent: '#C9963A',
      role_fr: 'Le bâtisseur', role_en: 'The builder',
      meaning_fr: "τέκτων — l'artisan bâtisseur", meaning_en: 'τέκτων — the master builder',
      pitch_fr: "L'éditeur visuel du front : glisser-déposer pour assembler pages, funnels, applications et quiz. Le cœur de KANTO APLO.",
      pitch_en: 'The visual editor for the front end: drag and drop to build pages, funnels, apps and quizzes. The heart of KANTO APLO.',
      features: [
        { fr: 'Glisser-déposer', en: 'Drag and drop' },
        { fr: 'Pages, funnels, applications, quiz', en: 'Pages, funnels, apps, quizzes' },
        { fr: 'Moteur KANTO partagé', en: 'Shared KANTO engine' }
      ],
      status: 'ready', href: 'demos/tekton/index.html', shots: 11, engine: true },

    { id: 'logos', greek: 'ΛΌΓΟΣ', latin: 'Logos', accent: '#3D8EE8',
      role_fr: 'La règle', role_en: 'The rule',
      meaning_fr: 'λόγος — la parole, la raison', meaning_en: 'λόγος — word and reason',
      pitch_fr: "L'éditeur visuel des services : APIs REST, tâches planifiées (cron), règles métier, transformations — sortie OpenAPI documentée.",
      pitch_en: 'The visual editor for services: REST APIs, scheduled jobs (cron), business rules, transforms — documented OpenAPI output.',
      features: [
        { fr: 'APIs REST et règles métier', en: 'REST APIs and business rules' },
        { fr: 'Tâches planifiées (cron)', en: 'Scheduled jobs (cron)' },
        { fr: 'Sortie OpenAPI documentée', en: 'Documented OpenAPI output' }
      ],
      status: 'ready', href: 'demos/tekton/index.html', shots: 4, engine: true },

    { id: 'skhema', greek: 'ΣΧΗΜΑ', latin: 'Skhêma', accent: '#8FA2FF',
      role_fr: 'Le schéma', role_en: 'The schema',
      meaning_fr: 'σχῆμα — la forme, la figure', meaning_en: 'σχῆμα — form and figure',
      pitch_fr: "Éditeur UML professionnel — classes, séquences, ER, cas d'usage — modéliser avant de bâtir.",
      pitch_en: 'Professional UML editor — classes, sequences, ER, use-cases — model before you build.',
      features: [
        { fr: 'Classes, séquences, ER', en: 'Classes, sequences, ER' },
        { fr: 'Cas d’usage', en: 'Use cases' },
        { fr: 'Modéliser avant de bâtir', en: 'Model before you build' }
      ],
      status: 'ready', href: 'demos/skhema/index.html', shots: 9 },

    { id: 'pinax', greek: 'ΠΊΝΑΞ', latin: 'Pinax', accent: '#FFD166', version: 'v5.0',
      role_fr: 'Le registre', role_en: 'The ledger',
      meaning_fr: "πίναξ — la tablette où l'on inscrit, le tableau, le registre", meaning_en: 'πίναξ — the writing tablet, the board, the register',
      pitch_fr: "Le tableau de bord du projet agile : tâches, sprints, versions et rituels sur un board façon Jira — en plus souple. Burndown, vélocité, dashboards et import Jira.",
      pitch_en: 'The agile project board: tasks, sprints, versions and rituals on a Jira-like board — only more flexible. Burndown, velocity, dashboards and Jira import.',
      features: [
        { fr: 'Board, Jira ou liste, regroupés à volonté', en: 'Board, Jira or list, grouped at will' },
        { fr: 'Sprints, versions, burndown et vélocité', en: 'Sprints, versions, burndown and velocity' },
        { fr: 'Rituels agiles, ADR, dashboards par widgets', en: 'Agile rituals, ADRs, widget dashboards' }
      ],
      login: { user: 'demo@kantoaplo.com', password: 'Pinax2026!' },
      captions_fr: ['Board du sprint en cours, regroupé par sprint', 'Vue Jira : colonnes de statut, points, assignés', 'Une tâche : détails, commentaires, réactions, historique', 'Planification : sprint, version, report des restes', 'Dashboard du sprint : burndown, charge, bloquants', 'Pilotage produit : vélocité, avancement par version', 'Vue liste, groupée par sprint', 'Un board par personne', 'Rituels : refinement, point technique, démo, rétro', 'Point architecture : un ADR complet', 'Journal d’activité filtrable', 'Sprints et versions : démarrer, clôturer, publier', 'Workflow : statuts et catégories', 'Thème clair, projet Orbit Mobile', 'Thème Mac, dashboard Helios Data', 'Projets de l’espace de travail', 'Connexion de la démo'],
      captions_en: ['Current sprint board, grouped by sprint', 'Jira view: status columns, points, assignees', 'A task: details, comments, reactions, history', 'Planning: sprint, version, carry-over', 'Sprint dashboard: burndown, workload, blockers', 'Product steering: velocity, progress by version', 'List view, grouped by sprint', 'One board per person', 'Rituals: refinement, tech sync, demo, retro', 'Architecture meeting: a full ADR', 'Filterable activity log', 'Sprints and versions: start, close, release', 'Workflow: statuses and categories', 'Light theme, Orbit Mobile project', 'Mac theme, Helios Data dashboard', 'Workspace projects', 'Demo sign-in'],
      status: 'ready', href: 'demos/pinax/', shots: 17 },

    { id: 'mantis', greek: 'ΜΆΝΤΙΣ', latin: 'Mantis', accent: '#8B5CF6', version: 'v0.5',
      role_fr: 'Le prophète', role_en: 'The prophet',
      meaning_fr: 'μάντις — le devin', meaning_en: 'μάντις — the seer',
      pitch_fr: "L'analyse web auto-hébergée qui ne perd rien : tableaux de bord, temps réel, objectifs, cohortes, tests A/B et statistiques bayésiennes — avec un studio d'apparence complet.",
      pitch_en: 'Self-hosted web analytics that loses nothing: dashboards, real time, goals, cohorts, A/B tests and Bayesian statistics — with a full appearance studio.',
      features: [
        { fr: 'Tableaux de bord et temps réel', en: 'Dashboards and real time' },
        { fr: 'Objectifs, cohortes, rétention', en: 'Goals, cohorts, retention' },
        { fr: 'Tests A/B et insights bayésiens', en: 'A/B tests and Bayesian insights' }
      ],
      login: { user: 'demo@kantoaplo.com', password: 'Mantis2026!' },
      captions_fr: ['Tableau de bord : vue d’ensemble, évolution, temps réel', 'Design « Nébuleuse » : verre, dock et lanceur', 'Design « Horizon » : barre supérieure à méga-menus', 'Mode sombre, design « Mantis Studio »', 'Insights bayésiens : a posteriori par canal', 'Test A/B : progression, diagnostics, bandit', 'Expérimentations : A/B, multivarié, feature flags', 'Cohortes : rétention semaine par semaine', 'Rétention client : actifs, nouveaux, revenus', 'Temps réel : visiteurs actifs et dernières visites', 'Journal des visites', 'Profil d’un visiteur et son parcours', 'Audience par pays, sans ligne « Autres »', 'Acquisition par canal', 'Canaux, référents, pages et localisation', 'Performance : Core Web Vitals au 75e centile', 'Registre des paramètres de campagne', 'Coffre de données : cookies, user agents, recherches', 'Studio d’apparence : trois designs, variantes, marque blanche', 'Palette de commandes (Ctrl K)', 'Code de suivi à coller avant </head>', 'Connexion'],
      captions_en: ['Dashboard: overview, trend, real time', '“Nebula” design: glass, dock and launcher', '“Horizon” design: top bar with mega menus', 'Dark mode, “Mantis Studio” design', 'Bayesian insights: posteriors by channel', 'A/B test: progress, diagnostics, bandit', 'Experiments: A/B, multivariate, feature flags', 'Cohorts: week-by-week retention', 'Customer retention: active, new, returning', 'Real time: active visitors and latest visits', 'Visit log', 'A visitor profile and journey', 'Audience by country, no “Others” row', 'Acquisition by channel', 'Channels, referrers, pages and locations', 'Performance: Core Web Vitals at p75', 'Campaign parameters registry', 'Data vault: cookies, user agents, searches', 'Appearance studio: three designs, variants, white label', 'Command palette (Ctrl K)', 'Tracking code to paste before </head>', 'Sign-in'],
      status: 'ready', href: 'demos/mantis/', shots: 22 },

    { id: 'kairos', greek: 'ΚΑΙΡΟΣ', latin: 'Kairos', accent: '#F472B6',
      role_fr: "L'opportunité", role_en: 'The moment',
      meaning_fr: 'καιρός — le moment juste', meaning_en: 'καιρός — the right moment',
      pitch_fr: 'Tests A/B avec calcul de significativité et bascule automatique du gagnant.',
      pitch_en: 'A/B tests with significance calculation and automatic winner rollout.',
      features: [
        { fr: 'Significativité calculée', en: 'Computed significance' },
        { fr: 'Bascule automatique du gagnant', en: 'Automatic winner rollout' },
        { fr: 'Feature flags', en: 'Feature flags' }
      ],
      status: 'pending', version: 'v2.0.3', shots: 0 },

    { id: 'synergos', greek: 'ΣΥΝΕΡΓΟΣ', latin: 'Synergos', accent: '#2DD4A0',
      role_fr: 'Le collaborateur', role_en: 'The connector',
      meaning_fr: 'συνεργός — celui qui œuvre avec', meaning_en: 'συνεργός — the one who works alongside',
      pitch_fr: 'Coffre-fort de connecteurs — bases relationnelles, NoSQL, APIs tierces, services cloud.',
      pitch_en: 'Universal connector vault — relational DBs, NoSQL, third-party APIs, cloud services.',
      features: [
        { fr: 'Bases relationnelles et NoSQL', en: 'Relational and NoSQL databases' },
        { fr: 'APIs tierces', en: 'Third-party APIs' },
        { fr: 'Secrets chiffrés', en: 'Encrypted secrets' }
      ],
      status: 'pending', version: 'v1.0.3', shots: 0 },

    { id: 'hermes', greek: 'ἙΡΜΗ͂Σ', latin: 'Hermès', accent: '#E8714A',
      role_fr: 'Le messager', role_en: 'The messenger',
      meaning_fr: 'Ἑρμῆς — le messager des dieux, gardien des passages', meaning_en: 'Ἑρμῆς — messenger of the gods, keeper of passages',
      pitch_fr: "Orchestration : workflows d'automatisation visuels, agents IA autonomes capables d'utiliser des outils, circulation des données entre systèmes.",
      pitch_en: 'Orchestration: visual automation workflows, autonomous AI agents able to use tools, data flowing between systems.',
      features: [
        { fr: 'Workflows d’automatisation', en: 'Automation workflows' },
        { fr: 'Agents IA outillés', en: 'Tool-using AI agents' },
        { fr: 'Données entre systèmes', en: 'Data between systems' }
      ],
      status: 'pending', shots: 0 }
  ],

  /* Les autres projets de Cephalo Sophie, hors KANTO APLO. */
  projects: [
    { id: 'kydos', greek: 'ΚΥΔΟΣ', latin: 'Kýdos Belote', accent: '#E6C77A',
      meaning_fr: 'κῦδος — la gloire', meaning_en: 'κῦδος — glory',
      tagline_fr: 'La belote contrée où vos robots jouent aussi.', tagline_en: 'Competitive belote where your robots play too.',
      pitch_fr: "Belote contrée multijoueur en temps réel, écurie de robots joueurs à entraîner, éditeur de stratégie sans code et tournois jusqu'à 128 joueurs. Sur Android et iOS.",
      pitch_en: 'Real-time multiplayer belote, a stable of robot players to train, a no-code strategy editor and tournaments of up to 128 players. On Android and iOS.',
      tags: ['Android', 'iOS', 'Temps réel', 'IA'],
      href: 'https://kydosbelote.com', label: 'kydosbelote.com', shots: 3 }
  ],

  /* Le moteur commun aux éditeurs marqués `engine: true` (Tektôn, Logos).
     Présenté entre ces éditeurs ; leur démo est celle du moteur. */
  engine: {
    name: 'KANTO', accent: '#C9963A', href: 'demos/tekton/index.html',
    eyebrow_fr: "L'instrument commun", eyebrow_en: 'The shared instrument',
    title_fr: 'Le moteur KANTO', title_en: 'The KANTO engine',
    tagline_fr: 'Un seul instrument, toutes les partitions.', tagline_en: 'One instrument, every score.',
    text_fr: "Tektôn et Logos jouent sur le même instrument : une bibliothèque de blocs, de nœuds et de workflows. Chaque bloc se définit par sa configuration ; leur assemblage génère du JSON, du code ou toute autre sortie. Tektôn l'accorde pour le front, Logos pour les services — et il s'accorde à n'importe quel domaine.",
    text_en: 'Tektôn and Logos play the same instrument: a library of blocks, nodes and workflows. Each block is defined by its configuration; assembling them generates JSON, code or any other output. Tektôn tunes it for the front end, Logos for services — and it can be tuned to any domain.',
    features: [
      { fr: 'Blocs, nœuds et workflows complexes', en: 'Blocks, nodes and complex workflows' },
      { fr: 'Sortie JSON, code ou format sur mesure', en: 'JSON, code or custom output' },
      { fr: "Configurable pour n'importe quel besoin", en: 'Configurable for any need' }
    ],
    uses: {
      tekton: { fr: 'Front : pages, funnels, applications, quiz', en: 'Front end: pages, funnels, apps, quizzes' },
      logos: { fr: 'Services : APIs, cron, règles métier', en: 'Services: APIs, cron, business rules' }
    },
    open_fr: 'Votre domaine', open_en: 'Your domain',
    open_text_fr: 'Les mêmes blocs, configurés pour tout autre besoin.', open_text_en: 'The same blocks, configured for any other need.'
  },

  /* Une épigraphe par éditeur, dans l'ordre. Le dernier slogan signe la section Contact. */
  slogans: [
    { fr: "Avant, tu regardais l'heure en te demandant où était passée ta journée. Maintenant, ta journée se passe pendant que tu regardes l'heure.",
      en: "Before, you'd check the time and wonder where your day had gone. Now, your day happens while you watch the time." },
    { fr: "Un bon chef ne coupe pas lui-même chaque légume. Il a sous la main ce qu'il faut, quand il le faut. C'est la cuisine — sans épluchage.",
      en: "A good chef doesn't chop every vegetable himself. He has what he needs, right when he needs it. It's cooking — without the peeling." },
    { fr: "Tu n'as pas besoin de savoir comment fonctionne l'électricité pour allumer une lampe. Tu appuies, ça brille.",
      en: "You don't need to know how electricity works to turn on a lamp. You flip the switch, it shines." },
    { fr: "Les grandes maisons ne se construisent pas brique par brique. Elles se dessinent d'abord. Dessine, le reste se construit.",
      en: "Great houses aren't built brick by brick. They're drawn first. Draw it, the rest builds itself." },
    { fr: 'Le musicien compose. Il n\'accorde pas lui-même chaque instrument.',
      en: "The musician composes. He doesn't tune every instrument himself." },
    { fr: 'La plus belle musique ne naît pas de celui qui règle les câbles — elle naît de celui qui ferme les yeux et joue.',
      en: "The most beautiful music isn't born from the one wiring the cables — it's born from the one who closes his eyes and plays." },
    { fr: 'Mozart ne configurait pas son piano avant chaque morceau. Toi non plus tu ne devrais pas.',
      en: "Mozart didn't configure his piano before every piece. Neither should you." },
    { fr: 'Tu composes. On joue.', en: 'You compose. We play.' }
  ],

  clients: ['IFPEN', 'La Poste', 'Docaposte', 'LeadsHook', 'Softia', 'JCDecaux', 'Genybet', 'Allianz']
};
