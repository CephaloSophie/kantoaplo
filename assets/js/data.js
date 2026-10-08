/* ═══════════════════════════════════════════════════════════════════════
   KANTO APLO — contenu de la vitrine
   ───────────────────────────────────────────────────────────────────────
   Tout ce qui s'affiche sur la page vient d'ici : éditeurs, slogans, clients.
   L'ordre du tableau `editors` est l'ordre d'affichage.

   Captures d'un éditeur :
     assets/editors/<id>/01.webp, 02.webp …        (pleine taille, ≤ 1600 px)
     assets/editors/<id>/thumbs/01.webp …          (miniatures, 560 px)
   `shots` = nombre de captures. Pour en ajouter :
     python3 tools/add-shots.py <id> capture1.png capture2.png …
   ═══════════════════════════════════════════════════════════════════════ */

window.KANTO = {

  editors: [
    { id: 'skopos', greek: 'ΣΚΟΠΟΣ', latin: 'Skopos', accent: '#E8714A',
      role_fr: 'Le guetteur', role_en: 'The watcher',
      meaning_fr: 'σκοπός — celui qui observe et vise juste', meaning_en: 'σκοπός — the one who watches and aims true',
      pitch_fr: "L'observateur, celui qui surveille. Il observe tes APIs, détecte les anomalies et te prévient avant tes utilisateurs.",
      pitch_en: 'The observer — the one who monitors. It watches your APIs, detects anomalies and warns you before your users notice.',
      status: 'ready', href: 'demos/skopos/index.html', shots: 10 },

    { id: 'hephaistos', greek: 'ἭΦΑΙΣΤΟΣ', latin: 'Héphaïstos', accent: '#E84A4A',
      role_fr: 'La forge', role_en: 'The forge',
      meaning_fr: 'Ἥφαιστος — le dieu forgeron', meaning_en: 'Ἥφαιστος — the smith god',
      pitch_fr: "Éditeur de blocs Blockly. Il forge les composants visuels que Tektôn assemblera. Sans Héphaïstos, rien à bâtir.",
      pitch_en: 'Blockly block editor. It forges the visual components Tektôn will assemble. Without Héphaïstos, nothing to build.',
      status: 'ready', href: 'demos/hephaistos/index.html', shots: 2 },

    { id: 'typos', greek: 'ΤΥΠΟΣ', latin: 'Typos', accent: '#D4A373',
      role_fr: 'Le moule', role_en: 'The mould',
      meaning_fr: "τύπος — l'empreinte, le moule", meaning_en: 'τύπος — the imprint, the mould',
      pitch_fr: 'Éditeur de templates structurels — grille, zones, arborescence — le squelette que Tektôn remplira.',
      pitch_en: 'Structural template editor — grid, zones, tree — the skeleton Tektôn fills.',
      status: 'ready', href: 'demos/typos/index.html', shots: 11 },

    { id: 'tekton', greek: 'ΤΈΚΤΩΝ', latin: 'Tektôn', accent: '#C9963A',
      role_fr: 'Le bâtisseur', role_en: 'The builder',
      meaning_fr: "τέκτων — l'artisan bâtisseur", meaning_en: 'τέκτων — the master builder',
      pitch_fr: 'Glisser-déposer visuel pour assembler pages, funnels, applications et quiz. Le cœur de KANTO APLO.',
      pitch_en: 'Visual drag-and-drop to build pages, funnels, apps and quizzes. The heart of KANTO APLO.',
      status: 'ready', href: 'demos/tekton/index.html', shots: 11 },

    { id: 'logos', greek: 'ΛΌΓΟΣ', latin: 'Logos', accent: '#3D8EE8',
      role_fr: 'La règle', role_en: 'The rule',
      meaning_fr: 'λόγος — la parole, la raison', meaning_en: 'λόγος — word and reason',
      pitch_fr: "Conception visuelle d'APIs REST — routes, règles métier, transformations — sortie OpenAPI documentée.",
      pitch_en: 'Visual REST API design — routes, business rules, transforms — documented OpenAPI output.',
      status: 'ready', href: 'demos/tekton/index.html', shots: 4 },

    { id: 'skhema', greek: 'ΣΧΗΜΑ', latin: 'Skhêma', accent: '#8FA2FF',
      role_fr: 'Le schéma', role_en: 'The schema',
      meaning_fr: 'σχῆμα — la forme, la figure', meaning_en: 'σχῆμα — form and figure',
      pitch_fr: "Éditeur UML professionnel — classes, séquences, ER, cas d'usage — modéliser avant de bâtir.",
      pitch_en: 'Professional UML editor — classes, sequences, ER, use-cases — model before you build.',
      status: 'ready', href: 'demos/skhema/index.html', shots: 9 },

    { id: 'kydos', greek: 'ΚΥΔΟΣ', latin: 'Kydos', accent: '#E6C77A',
      role_fr: "L'application", role_en: 'The application',
      meaning_fr: 'κῦδος — la gloire', meaning_en: 'κῦδος — glory',
      pitch_fr: 'Belote compétitive avec IA programmables — application phare bâtie sur KANTO APLO.',
      pitch_en: 'Competitive belote with programmable AI robots — flagship app built on KANTO APLO.',
      status: 'external', statusLabel: 'kydosbelote.com', href: 'https://kydosbelote.com', shots: 3 },

    { id: 'mantis', greek: 'ΜΆΝΤΙΣ', latin: 'Mantis', accent: '#8B5CF6',
      role_fr: 'Le prophète', role_en: 'The prophet',
      meaning_fr: 'μάντις — le devin', meaning_en: 'μάντις — the seer',
      pitch_fr: 'Dashboards analytiques interactifs et prédictions ML en temps réel, sans code.',
      pitch_en: 'Interactive analytics dashboards and real-time ML predictions, no code.',
      status: 'pending', version: 'v4.1.8', shots: 0 },

    { id: 'kairos', greek: 'ΚΑΙΡΟΣ', latin: 'Kairos', accent: '#F472B6',
      role_fr: "L'opportunité", role_en: 'The moment',
      meaning_fr: 'καιρός — le moment juste', meaning_en: 'καιρός — the right moment',
      pitch_fr: 'Tests A/B avec calcul de significativité et bascule automatique du gagnant.',
      pitch_en: 'A/B tests with significance calculation and automatic winner rollout.',
      status: 'pending', version: 'v2.0.3', shots: 0 },

    { id: 'synergos', greek: 'ΣΥΝΕΡΓΟΣ', latin: 'Synergos', accent: '#2DD4A0',
      role_fr: 'Le collaborateur', role_en: 'The connector',
      meaning_fr: 'συνεργός — celui qui œuvre avec', meaning_en: 'συνεργός — the one who works alongside',
      pitch_fr: 'Coffre-fort de connecteurs — bases relationnelles, NoSQL, APIs tierces, services cloud.',
      pitch_en: 'Universal connector vault — relational DBs, NoSQL, third-party APIs, cloud services.',
      status: 'pending', version: 'v1.0.3', shots: 0 }
  ],

  /* Intermèdes entre les éditeurs, dans l'ordre. Le dernier signe la section Contact. */
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

  clients: ['IFPEN', 'La Poste', 'LeadsHook', 'Docaposte', 'Softia', 'JCDecaux', 'Unibet', 'Allianz']
};
