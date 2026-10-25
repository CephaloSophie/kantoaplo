# Démos : six langages et trois éditeurs construits avec la plateforme

> Ce ne sont pas de vrais produits : chacun est un **langage** de moins de 30 pierres posées (sauf le créateur de quiz, banc d'essai du cœur : 20 questions, 43 pierres), qui montre ce que la plateforme produit à partir d'une configuration. Ouvrir `index.html` dans un navigateur, sans compilation.

## Langages

Ils montrent la plateforme elle-même : le langage comme unité d'instanciation, les fils, les déclarations et leurs instances, les appels synchrones ou asynchrones, bloquants ou non, la règle du jeu, un langage écrit avec des dominos, et des pierres qui représentent tout autre chose que du code (une théorie, un jeu).

| Langage | Fichier | Pierres posées | Ce qu'il montre |
|---|---|---|---|
| **Kanto** (programmation) | `demos/langages/kanto.lang.js` | 29 | Une pierre à chaque échelle : une **variable** (`tauxRemise`), des **lignes**, une **fonction** (`remise`), une **classe** (`Panier`), une **bibliothèque** venue d'un autre projet (`Notifications`), un **algorithme** (dans la pioche), et **un projet entier d'un autre langage** (le flux « Nouveau prospect » de Flux) dans une seule pierre. Instances libres, appels bloquants et non bloquants. Générateurs : **JavaScript** (exécutable), signatures `.d.ts`. Onglet : « Mémoire ». |
| **Flux** (automatisation) | `demos/langages/automate.lang.js` | 27 | Le même mécanisme, d'autres choix : pas de classes, des **connecteurs** (CRM venu d'un projet partagé, Slack, e-mail) et des sous-flux ; une **règle nommée** (un déclencheur ne se relie pas) ; un **fil vers une pierre libre** (journal d'audit, non bloquant) ; Slack non bloquant pendant l'e-mail. Générateurs : workflow JSON, **séquence Mermaid** (`->>` bloquant, `-)` non bloquant). Onglet : « Appels » (ligne de temps). |
| **Raisonnement** (philosophie) | `demos/langages/raisonnement.lang.js` | 15 | Pas de code : une **théorie**. Thèse, prémisses, appuis, objection, réponse, conclusion ; les **concepts** sont des variables déclarées et citées par identifiant ; la théorie adverse (« le déterminisme causal ») est **rangée dans une pierre** et s'ouvre dans un onglet. Règle du langage : une objection se relie à une conclusion. Pas de générateur : le **document de modèle** est la sortie. Onglet : « Solidité ». |
| **Dominos** (le jeu) | `demos/langages/jeu.lang.js` | 3 au départ | **Le jeu de dominos**, avec la règle « même nombre » : une seule pierre `a\|b` dont les faces suivent les champs. L'onglet « Partie » calcule les coups permis avec `canConnect` (la règle du glisser) et joue un coup. |
| **Créateur de quiz** | `demos/langages/quiz.lang.js` | 38 (+ 5 dans la source de données) | **Le banc d'essai du cœur** : 20 questions de 9 genres (choix unique, choix multiples, exactement N, nombre entre n et y, vrai ou faux, réponse libre, ordre, échelle, étape). Des choix **qui dépendent d'une réponse précédente**, des **choix calculés par une classe** (méthode `pays(continent)` qui rend du JSON), un **aiguillage à 5 chemins** (switch / case), des **sauts** (rejoindre une suite commune, revenir en arrière une fois). Générateurs : Quiz JSON v2, **quiz jouable** (un fichier HTML autonome), Moodle GIFT. Onglet « Aperçu joueur », commande « Jouer le quiz » |
| **Atelier** (méta) | `demos/langages/atelier.lang.js` | 10 | **Un langage pour écrire des langages** : Langage (règle « même nombre, comme au jeu »), deux types, cinq pierres avec leur code, une règle. Générateurs : le **langage en JSON** (chargé tel quel par `Domino.language()`), un module JavaScript. Onglet : « **Aperçu** » (l'éditeur de ce langage, créé en direct). |

## Éditeurs de domaine

| Éditeur | Fichier | Pierres posées | Ce qu'il montre |
|---|---|---|---|
| **Scénarios d'API (TNR)** | `demos/postman/` | 270 | Un éditeur à la Postman : la collection du dépôt (`postmanFile/`, 87 requêtes, 17 dossiers) et son environnement importés ; une campagne de 19 scénarios (17 tirés des dossiers, 2 écrits à la main : condition, appel d'un scénario, donnée passée par un fil, test négatif 404). Exécution simulée ou réseau, rapport pour testeur, Déroulé, tableau de bord, export Postman et newman. Voir [TNR.md](TNR.md). |
| Concepteur d'API | `demos/packs/api.pack.js` | 24 | Trois routes, trois middlewares (CORS, Auth JWT, limite de débit), des composants de bibliothèque, un secret lié au contexte, une branche « invalide ». Générateurs : OpenAPI 3.1, Express. Onglet d'entreprise : « Sécurité ». |
| Éditeur de workflow | `demos/packs/workflow.pack.js` | 23 | « Onboarding client » dépend de deux scénarios (KYC, solvabilité), rangés dans le composant « Vérifications » et appelés par une seule pierre. Générateurs : workflow YAML, Mermaid. Onglet : « Dépendances ». |
| Éditeur de circuit | `demos/packs/circuit.pack.js` | 21 | De l'entrée A à la LED, neuf niveaux de portes (NON, ET, OU, OU exclusif, NON-ET, NON-OU…), une porte imbriquée en adjacente, deux sondes. Mode direct. Générateurs : expression booléenne, Verilog. Onglet : « Banc de test » (table de vérité). |

---

## Scénarios

### Scénarios d'API (TNR) : « Kýdos Belote · non-régression »

**Fichier › Nouveau ▸ Scénarios d'API (TNR) ▸ Exemple.** La table principale est la campagne : 19 scénarios à la suite de la pierre « Campagne » (environnement « Kýdos Server — Local », transport simulé).

1. **Tableau de bord** (barre des projections) : 87 requêtes, 100 % couvertes. La collection est en dossiers dépliables : méthode, chemin, couverture, dernier statut.
2. **▶ Exécuter la campagne** : 99 requêtes envoyées au serveur simulé, 106 vérifications sur 107. Le seul échec est un vrai constat : le dossier « Analytics » lit `{{robotId}}`, un robot que le dossier « Robots » vient de supprimer (404, message du serveur dans la réponse).
3. **Rapport** (inspecteur). Dépliez `POST Login` : requête, réponse, en-têtes, jeton masqué (`••••…`), cURL. Dépliez l'échec : attendu « 2xx », obtenu 404.
4. **Déroulé** : un couloir par scénario. « Robots, cycle de vie › Parcours joueur » est le scénario appelé.
5. Double-cliquez sur **Robots, cycle de vie** :
   - le scénario appelle « Parcours joueur », puis crée un robot ;
   - sous la requête, en liste, l'extraction `robot.id → {{robotId}}` et deux vérifications ;
   - un **fil** porte l'identifiant jusqu'à « Créer une équipe » (clé `robotId` du corps) ;
   - une **Donnée JSON**, au-dessus de `PUT Update`, change le nom ;
   - après `DELETE`, la relecture attend **404** : c'est un test négatif, qui passe.
6. **Boîte à outils** (dans un scénario) :
   - **Kýdos Belote** : les 17 dossiers, chaque requête prête à poser avec ses vérifications ;
   - **Vérifications** : statut 2xx, 201, 404, temps, champ, corps, en-tête ;
   - **Variables** : définir ou extraire chaque variable de l'environnement, `{{$guid}}`.
7. **Fichier › Exporter ▸ Collection Postman v2.1** : la collection et l'environnement, à importer dans Postman ou à lancer avec newman. Réimportée, la collection rend les mêmes scénarios.

### Le studio : un vrai éditeur

1. Au premier lancement, la page **Bienvenue** et l'exemple de Kanto (« Boutique ») s'ouvrent.
2. **Fichier › Nouveau ▸ Langages ▸ Kanto ▸ Bonjour** crée un brouillon de quatre pierres. **F5** l'exécute : la sortie dit « Bonjour, 42 ».
3. **Exécuter › Générer ▸** propose JavaScript et `.d.ts` (Kanto), puis Documentation, Graphe Mermaid et Document de modèle (génériques). Le résultat s'ouvre dans l'onglet Code.
4. **Ctrl+S** : le brouillon s'enregistre dans le navigateur (« Enregistré à … » dans la barre d'état). Une pierre ajoutée le marque « ● » ; 1,2 s plus tard, il est réenregistré. Annuler jusqu'à l'état enregistré enlève le « ● ».
5. **Ctrl+\** : un deuxième volet montre le même projet, chacun avec sa caméra.
   - **Affichage › Affichage des pierres ▸ Carte détaillée** dans l'un, **Contour** dans l'autre.
   - Une modification dans un volet apparaît dans l'autre.
   - Tirer la poignée change les tailles ; double-clic les égalise.
6. **Affichage › Disposition ▸ Grille 2 × 2** : quatre volets. Les petits volets replient leur inspecteur.
7. Clic droit sur un onglet : Fermer les autres, Diviser en bas, Dupliquer le projet, Renommer, Épingler…
8. **Recharger la page** : les projets, les volets, leurs tailles, la vue de chaque onglet et les récents reviennent. Un brouillon modifié revient aussi, encore marqué « modifié ».
9. **Ctrl+O** liste les projets enregistrés. **Ctrl+P** va à une partie, une déclaration ou une pierre de n'importe quel projet ouvert. **F1** ouvre la palette de commandes.
10. Dans un projet Kanto, le menu **Kanto** et **Exécuter** ont « Vider la sortie du programme », et le menu d'une pierre a « Expliquer cette pierre ». Ce sont les contributions du langage.

### Kanto : « Boutique »

```text
Déclarations   Panier(devise)  ─ ajouter(prix) · total()        remise(montant) → nombre       Notifications ─ async envoyer(message)
                 corps : constructeur → this.devise ←               corps : (montant) → a × 0,9      corps : envoyer → Attendre 600 ms → Afficher
                         ajouter(prix) → a + this.somme → this.somme ←
                         total() → this.somme

Programme      40 → panier.ajouter() → remise(montant) → « Total : {v} EUR » → notif.envoyer() ⇢ ─résultat→ Afficher « Notification envoyée : … »
                     ⌇ fil (bloquant)                                          ⌇ fil (non bloquant)  └─suite──→ Afficher « Commande validée. … »
               panier : Panier ← « EUR » (adjacente haute : le paramètre du constructeur)          notif : Notifications
```

- Sortie, dans l'ordre d'arrivée : `Commande validée. Total : 36 EUR`, `[e-mail] Total : 36 EUR`, `Notification envoyée : Total : 36 EUR`. La suite part avant la fin de l'appel non bloquant.
- L'onglet « Mémoire » montre `panier : Panier` avec `{ devise: "EUR", somme: 40 }`.
- Cliquer le fil orange, choisir « Bloquant » : le point « suite » disparaît, ce qui y était collé devient libre, et le titre devient `await notif.envoyer()`.
- Le JavaScript généré écrit la variable `tauxRemise`, une classe `Panier`, une fonction `remise`, une classe `Notifications` avec `async envoyer`, puis le programme ; les deux chaînes deviennent deux tâches lancées ensemble (`Promise.all`). Le test l'exécute : il écrit les mêmes lignes.
- Double-clic sur « Flux · Nouveau prospect » : le flux s'ouvre dans un onglet, avec l'éditeur de Flux ; ce qu'on y change est enregistré dans la pierre. L'effet domino l'exécute (`Flux : ["[Slack #ventes] …", "[E-mail] …"]`).

### Flux : « Nouveau prospect »

```text
Formulaire reçu → Extraire le contact → await crm.chercher() → Si client connu ─oui→ « Bon retour {nom} » → await email.envoyer()
                      ⌇ (non bloquant)                                          └non→ « Bienvenue {nom} » → slack.publier() ⇢ ─suite→ await email.envoyer()
                  Journal d’audit (libre)       crm : CRM ← env.CRM_KEY         slack : Slack        email : E-mail
```

- Ada n'est pas dans la base : branche « non ». Slack (300 ms) tourne pendant l'e-mail (500 ms) : l'onglet « Appels » montre les deux barres qui se chevauchent.
- Tirer un fil depuis « Formulaire reçu » : la règle du langage le refuse, avec sa phrase.
- Le diagramme de séquence généré montre `F->>+CRM: chercher()` (attendu) et `F-)Slack: publier() (sans attendre)`.

### Raisonnement : « Le libre arbitre »

```text
« Nous sommes libres » (50 %) → « Nous délibérons avant d’agir » → « Délibérer suppose plusieurs possibles » → ⟹ « Notre volonté est libre »
                                  ↑ L’expérience vécue · ↑ délibération     ↑ liberté (concepts déclarés)                ⌇ objection
▣ Le déterminisme causal → ✗ « Nos choix sont causés » → ↺ « Le compatibilisme… » ──────────────────────────────────────┘
   (s’ouvre : « Tout événement a une cause » → « Nos choix sont des événements » → Résultat)
```

- L'effet domino mesure la solidité : chaque prémisse renforce, l'appui pèse, l'objection affaiblit, la réponse l'atténue. Verdict : 69 %, « plutôt solide ».
- Renommer le concept « liberté » : les pierres qui le citent suivent (renvoi par identifiant).
- L'onglet « Modèle » donne la théorie entière en JSON : chaque idée, d'où vient sa force, qui l'objecte.

### Dominos : « Une partie »

```text
6|4 → 4|2 → 2|5        main : 5|1 · 1|3 · 3|6 · 6|6 · 2|2 · 4|4 · 5|5
```

- Glisser 3|1 après 2|5 : refusé, « les deux faces qui se touchent doivent montrer le même nombre ».
- « Jouer un coup » pose la première pierre permise (5|1, puis 1|3…) ; le score est la somme des points posés.

### Atelier : « Calculette »

```text
Langage « Calculette » (règle : même nombre) → Type nombre → Type texte → Pierre Nombre 0|1 → Doubler 1|1 → Ajouter 2|1 → Écrire 1|1 → Afficher 1|0 → Règle « afficher-colle » → Publier
```

- L'onglet « Aperçu » crée l'éditeur « Calculette » : `Nombre → Doubler → Écrire → Afficher` se collent ; **Ajouter reste libre**, car ses 2 points à gauche ne touchent pas le 1 point de Doubler (règle du jeu). L'effet domino affiche `= 14`.
- Changer la règle de « Langage » en « couleurs » : l'aperçu se recrée, et Ajouter peut suivre.

### API : « API Boutique »

```text
GET /users  → CORS → Auth JWT → Limite 60/min → Lire en base → Paginer → Répondre 200
                     ↑ env.JWT_SECRET            ↑ Table users   ↓ Métriques
                     ↓ Journal d’accès
POST /orders → CORS → Auth JWT → Valider le corps ─valide→ Créer dans orders → Répondre 201
                       ↑ secret   ↑ Schéma Commande         ↓ Métriques
                                  └─invalide→ Erreur 400
GET /health → Ping → Répondre 200
```

L'effet domino simule la requête du contexte (`request.headers`, `request.body`).

- Vider `request.headers.authorization` dans l'onglet « Contexte » arrête la chute sur « Auth JWT » (401).
- Retirer `client` du corps envoie la commande sur la branche « invalide ».
- L'onglet « Sécurité » applique la politique d'une entreprise fictive : `/health` est publique, et le CORS de `/users` est ouvert à tous.

### Workflow : « Onboarding client »

```text
Nouveau client → Normaliser → [Vérifications] → Si validé ─accepté→ Créer le compte ↓ (virage)
                                   │                          ↓ Journal d’audit
                                   │                   E-mail de bienvenue (↑ Modèle e-mail)
                                   │                   Attendre 2 jours ← (virage)
                                   │                   Mettre à jour le CRM ← Relancer si inactif
                                   │            └─refusé→ Notifier la conformité ↓ Slack
                    sous-partie du composant :
                    KYC         → Vérifier l’identité (↑ KYC Ubble) → Score d’identité → Résultat « kyc »
                    Solvabilité → Interroger la centrale → Décider la solvabilité (↑ rules.minScore) → Résultat « credit »
```

- Double-cliquer « Vérifications » ouvre ses deux scénarios dans un onglet.
- Passer `client.income` à 1500 dans le contexte fait tomber la branche « refusé ».

### Circuit : « Logique à neuf niveaux »

```text
A → NON → ET(B) → OU(C) → OU-X(D) → NON-ET(NON(B)) → NON-OU(A) → NON → OU(C) → ET(D) → LED
                           ↓ Sonde P1                  ↓ Sonde P2
```

Chaque porte reçoit son premier signal de la précédente et le second d'une adjacente haute (une entrée, ou une porte avec sa propre adjacente). Le mode direct réévalue le circuit à chaque interrupteur du « Banc de test ». La table de vérité (16 lignes) est calculée par le moteur, en exécutions « à blanc ».

### Créateur de quiz : « Grand quiz de culture générale »

```text
Démarrer → Australie ? (choix unique) → Lune ? (nombre 1900…2025) → Premiers ? (choix multiples) → Gazeuses ? (exactement 2)
 → Continent ? (sondage) → Ville ? (choix « si réponses.continent == … ») → Pays ? (choix calculés ← géo.pays(réponses.continent))
 → Muraille (vrai/faux) → Or (libre) → Chronologie (ordre) → Avis (échelle) → Domaine ? → Aiguillage (selon réponses.domaine)
     ├ Histoire → Empereur ?    → ↪ Aller à Mercure
     ├ Sciences → Chromosomes ? → ↪ Aller à Mercure
     ├ Arts     → Joconde ?     → ↪ Aller à Mercure
     ├ Sport    → Marathon ?    → ↪ Aller à Mercure
     ├ Nature   → Mammifères ?  → ↪ Aller à Mercure
     └ sinon    → Mercure ? → Si (percent >= 50) ─alors→ Hexagone ? → Descartes ? → Selon le score → Expert · Bien joué · Passable
                                                 └sinon→ Révision (étape) → ↺ Aller à Muraille (1 fois) ─épuisé→ Fin · À revoir
Sources de données : Catalogue.pays(continent) = Méthode → Transformer {text: item.nom, correct: item.continent == arg} ← Données (10 pays) → Retour
```

1. **Les genres** : chaque question est une pierre de la pioche (« Questions »), avec ses champs groupés (Question, Réponses, Score, Retour). Les choix sont un **tableau** dans la pierre : une ligne par choix, une case « Juste », une colonne « Si ».
2. **Des choix qui dépendent d'une réponse** : la colonne « Si » de la question « Ville » contient une expression écrite en texte (`réponses.continent == "Europe"`), enregistrée en JSON. Le joueur qui a choisi l'Afrique ne voit que Marrakech et Le Caire.
3. **Des choix calculés par une classe** :
   - la table « Sources de données » déclare la classe `Catalogue` ; son corps, la méthode `pays(continent)`, transforme une table de pays en choix JSON ;
   - l'instance `géo` est posée sur le parcours, et un fil part de son point `pays` vers « Choix calculés », collée en adjacente haute de la question 7 ;
   - l'argument est `réponses.continent`.
4. **Un aiguillage à cinq chemins** : « Aiguillage (selon) », du kit `flow`, compare `réponses.domaine` à chaque cas. Il a une sortie par cas, plus « sinon », et les noms des sorties s'affichent sur les jointures.
5. **Des sauts** :
   - chaque chemin finit par « Aller à » la question 18 : les branches se rejoignent (flèches pointillées dorées) ;
   - sous 50 %, une étape « Révision » renvoie à la question 8 (flèche rose, en arrière) une seule fois ; au second échec, la sortie « épuisé » mène à « À revoir » ;
   - ⌖ (dans les champs, ou le menu de la pierre) choisit la cible d'un saut en cliquant sur la table.
6. **L'effet domino** (F5) joue le joueur simulé du contexte (`joueur.réponses`) : Sciences → Chromosomes → saut → Mercure → Expert, 16 / 16.
7. **Jouer** : Créateur de quiz › Jouer le quiz (Ctrl+Alt+J), ou l'onglet « Aperçu joueur ». Le lecteur pose les questions une à une, avec :
   - les touches 1 à 9 et Entrée ;
   - « exactement N » imposé ;
   - le curseur des nombres ;
   - les flèches de l'ordre ;
   - les choix calculés demandés à la classe, en direct ;
   - le parcours affiché à droite.
8. **Générer** : Exécuter › Générer ▸.
   - **Quiz JSON** (v2) : les choix calculés y sont **précalculés pour chaque continent**.
   - **Quiz jouable (HTML)** : un seul fichier, hors ligne, qui embarque le JSON, le dialecte d'expressions, le cœur du quiz et le lecteur.
   - **Moodle GIFT** : ce que GIFT ne sait pas dire (choix conditionnels et calculés, aiguillages, sauts) y est noté en commentaire.
9. **Les diagnostics** guident l'auteur :
   - une bonne réponse hors de l'intervalle ;
   - « exactement 3 » avec 2 choix justes ;
   - un cas d'aiguillage qui n'est pas un choix de la question visée ;
   - une condition qui cite une réponse inconnue ;
   - une expression mal formée (avec sa position) ;
   - deux questions avec la même clé.
10. **Modèle** « Géographie (court) » (Fichier › Nouveau ▸ Créateur de quiz) : le quiz d'avant, avec ses conditions combinées (ET, OU, PAS), joue toujours.

---

## Journal de construction : les soucis rencontrés et leur correction

Les dominos ont été créés d'abord, les scénarios ensuite, en se servant des démos comme d'un banc d'essai. Voici ce qui a bloqué, et ce qui a changé dans le moteur.

| # | Souci | Cause | Correction |
|---|---|---|---|
| 1 | Connecter une adjacente était difficile, et elle s'affichait loin, reliée par une tige marron | Ancienne maquette : secondaires posées à distance, tige en laiton | Adjacentes collées à 90° sur le grand côté, rapetissées à plusieurs ; zones de dépôt dédiées et poignées « haute » et « basse » |
| 2 | Le nom de la pierre partait très haut au-dessus des adjacentes | Entête placé au-dessus de toute la colonne | La haute se pose au-dessus de la face d'entrée, la basse sous la face de sortie ; l'entête passe au-dessus de la moitié libre |
| 3 | Après un virage, où vont les adjacentes ? | Règle à fixer | La pierre et ses adjacentes tournent d'un seul bloc (vers le bas : haute à droite, basse à gauche) ; proportions inchangées |
| 4 | Double-clic sans effet sur le composant | La capture du pointeur envoie le double-clic au SVG | La pierre est retrouvée sous le pointeur |
| 5 | Le banc de test (circuit) tournait en boucle et la LED ne s'allumait pas | Chaque calcul de table de vérité écrivait dans le contexte, ce qui relançait le banc | Exécution « à blanc » : portée isolée, sans événement ; option `bubble` des portées |
| 6 | En glissant depuis la pioche, une pierre s'appelait « Erreur undefined » | La pierre provisoire n'avait pas ses champs par défaut | Pierre provisoire créée avec les valeurs par défaut |
| 7 | « Lire en base » est proposée après « Paginer » | Elle accepte des données sur sa 2ᵉ entrée : la règle des couleurs l'autorise | Gardé : c'est juste. Le développeur restreint avec `canConnect` s'il le veut |
| 8 | La suite de « Paginer » n'accepte pas « Répondre » dans l'ajout rapide | « Répondre » est terminale : l'ancienne suite ne pourrait pas la suivre (insertion) | Gardé, et expliqué : l'insertion vérifie aussi l'ancienne suite |
| 9 | Diagramme Mermaid invalide | Le sous-graphe portait le même identifiant que la pierre conteneur | Sous-graphe `sub_<id>` relié à la pierre |
| 10 | Vue trop dézoomée au départ (31 %) | Le cadrage ajustait tout, même illisible | Cadrage à 55 % au moins, sur le début du projet ; recadrage tant que l'utilisateur n'a pas bougé la vue |
| 11 | Un virage vers le bas fait passer la colonne dans la chaîne suivante | Règle d'évitement : la chaîne suivante prend un rail | Gardé (règle 3) ; le virage est refusé seulement s'il enferme la chaîne |
| 12 | Les objets affichés sur les joints étaient illisibles | JSON tronqué | Valeurs simples sur les joints (1, 0, 200…), pastille avec info-bulle pour les objets |
| 13 | La DominoPopup des maquettes avait disparu du studio | Remplacée par l'inspecteur, qui ne grandit pas à partir de la pierre | `domino.popup.js` : la grande pierre revient (double-clic, Entrée, « Configurer… »), sur les règles du moteur ; l'inspecteur reste l'outil du développeur |
| 14 | En habillage ébène, les points du circuit disparaissaient | Le type « Signal » est noir, comme un point classique | Un point de type noir prend la couleur de l'habillage |
| 15 | Le nom de la grande pierre passait sous la place « + haute » | Entête centré | Il passe au-dessus de la moitié libre, comme sur la table |
| 16 | En glissant une pierre, une sélection bleue s'étendait à toutes les pierres | Sélection de texte native du navigateur sur les textes SVG | `user-select: none` sur la table, `selectstart` annulé, sélection vidée au début d'un glisser (moteur, valable pour tous les éditeurs) |
| 17 | Quiz : combien de choix sur une question ? | Une face fixe imposait un nombre de points | Callback `pips` : un point vert par choix collé, plus une place libre ; la place est facultative (`required: false`) |
| 18 | Quiz : les gabarits `{{score}}` des écrans de fin étaient signalés « liaison introuvable » | Le score n'existait que dans le parcours | Le score courant est publié dans le contexte (`parcours.score`, `parcours.max`) ; le JSON garde le gabarit, que le lecteur remplit |
| 19 | Quiz : la branche « sinon » partait très loin sous la table | Table de 1250 : « Selon le score » tournait vers le bas avec ses trois fins | Option `table: 1700` dans le pack |
| 20 | Un appel non bloquant chargé depuis le JSON perdait sa suite | Les collages étaient chargés avant les fils ; or c'est le fil non bloquant qui donne à « Appeler » son point « suite » | Chargement en trois temps : pierres, fils, collages |
| 21 | La valeur de la chaîne allait dans l'entrée « fonction » d'« Appeler » | Le type `any` est compatible avec tout, même une fonction | La chaîne ne remplit jamais une entrée de genre `call` (sauf avec une fonction) |
| 22 | La sortie d'une méthode n'arrivait pas dans la sortie du programme | L'appel écrivait dans une portée de contexte fermée | Un appel écrit dans le contexte du programme ; son état propre est `this` |
| 23 | Les déclarations signalaient leurs paramètres « non alimentés » | Leur face gauche dit ce qu'elles exigent, pas ce qu'elles reçoivent | Rôle « Déclaration » ; pas de diagnostic d'entrée |
| 24 | Un fil effaçait le nom de la pierre qu'il croisait | Un liseré de la couleur de la table sous le fil | Liseré transparent ; il n'apparaît qu'au survol |
| 25 | Le JavaScript généré calculait `NaN` | `undefined + 40` en JavaScript ; le moteur compte une entrée vide pour 0 | Le générateur écrit `(a ?? 0) + (b ?? 0)` |
| 26 | Dans le corps de `Panier`, « ajouter » tournait vers le bas | Son adjacente haute touchait le constructeur : règle d'évitement | Chaînes du corps plus espacées |
| 27 | L'inspecteur agrandi faisait 1 px de haut | Un enfant absolu d'une grille se place dans sa zone de grille, ici une rangée `auto` | L'inspecteur agrandi prend toute la grille |
| 28 | Les langages ne se chargeaient pas dans Node | `Domino.packs` n'existe qu'avec la vue | Chaque langage crée `Domino.packs` s'il manque |
| 29 | Le projet Flux embarqué dans Kanto était vide | Kanto se chargeait avant Flux | Flux se charge d'abord ; Kanto en garde une copie |
| 30 | Le JavaScript généré ne se lisait plus (`v` déclaré deux fois) | Deux chaînes dans la partie principale | Chaque chaîne devient une tâche, comme dans le moteur (`Promise.all`) |
| 31 | Les pierres du jeu ne tombaient pas | Leurs points étaient des entrées requises : la première pierre n'avait « aucune entrée » | Les points du jeu sont facultatifs |
| 32 | Pas de blancs au jeu | Une face à zéro ne se colle pas (règle du moteur) | Variante sans blancs (1 à 6) ; la règle reste vraie partout |
| 33 | Le document de modèle ne suivait pas son schéma | Les pierres sans champ perdaient la clé `fields` (trouvé par le test de schéma) | Les listes et objets du document sont toujours présents |
| 34 | Certaines causes d'exécution ne remontaient pas | Les adjacentes et les lectures à la demande notaient la pierre, pas l'étape | Toute cause renvoie à une étape |
| 35 | Deux vues d'un même projet auraient laissé des écouteurs derrière elles | L'éditeur posait ses écouteurs sur le projet sans les retirer ; le `setup()` des langages aussi | Une vue note tous ses écouteurs (même ceux du `setup()`) et les retire à sa destruction : le projet partagé survit à ses vues |
| 36 | Les volets recouvraient la barre de menus et la barre d'état | La classe `pv-root` mettait la zone principale en position absolue | La zone principale reste dans la grille ; seuls les hôtes d'onglets sont absolus |
| 37 | La table ne faisait que 35 px de haut | Le bandeau caché (`display: none`) ne comptait plus comme rangée de la grille : chaque bloc remontait d'une rangée | Rangées explicites (`grid-row`) pour l'entête, le bandeau, les volets et la barre d'état |
| 38 | Un projet vide de Raisonnement s'appelait « Le libre arbitre » | La partie principale reprenait le nom de celle de l'exemple, propre à l'exemple | Le nom générique de l'exemple est gardé (« Programme », « Flux »…), sinon le titre du nouveau projet |
| 39 | Lancer un programme marquait le projet « modifié » | L'exécution écrit sa sortie dans le contexte | Ce qu'écrit une exécution ne compte pas : seuls les gestes, le nom et les options rendent un projet modifié |
| 40 | Le générateur de documentation échouait sur une partie vide | Le document de modèle omet la liste d'une partie sans pierre | Le générateur lit `p.elements || []` ; la colonne « points » est échappée pour Markdown |
| 41 | Le menu montrait Ctrl+Maj+P pour la palette, au lieu de F1 | Le dernier raccourci lié passait devant | Le premier raccourci déclaré par la commande est celui qu'on affiche |
| 42 | Dans le navigateur de test, l'enregistrement automatique semblait ne jamais partir | Le Chrome sans interface du banc d'essai ne déclenche pas les minuteries de plus de 1,2 s (même sur une page vide) | Pas un défaut du studio : les tests de l'établi utilisent des minuteries simulées, et le scénario navigateur un délai court |
| 43 | Le dialogue « Jouer le quiz » restait vide après « Commencer » | Le lecteur était un `<form>` dans le `<form>` du dialogue : le navigateur supprime le formulaire imbriqué | Le lecteur n'emploie plus de formulaire (bouton et Entrée gérés à la main) : il vit dans n'importe quel hôte |
| 44 | Le fil de « géo.pays » vers « Choix calculés » n'apparaissait pas | La vue ne savait placer les points que sur les pierres de chaîne, pas sur les adjacentes | Les points d'une adjacente suivent son orientation et sa taille : un fil peut arriver sur une adjacente |
| 45 | Une question sondage (sans bonne réponse) affichait « Faux » | La notation traitait toute question à choix comme notée | Sans bonne réponse ni points, la réponse est retenue, pas notée |
| 46 | Après la seconde chance, le score affichait 0 / 20 au lieu de 0 / 16 | Une question reposée ajoutait sa note à l'ancienne | La note d'une question reposée remplace la précédente |
| 47 | La progression affichait « 21/20 » | Le compteur comptait les réponses, et le parcours dépend des réponses | On compte les questions répondues ; la barre se remplit à la fin |
| 48 | L'expression d'un « Transformer » ne s'écrivait qu'en JSON | Le texte des expressions n'avait pas d'objets | `{text: item.nom, correct: item.continent == arg}` s'écrit et se relit |
| 49 | Les fins du quiz signalaient « {{score}} ne trouve aucune valeur » | Le moteur ne publiait que `parcours.score` | Le score, le maximum, le pourcentage et les réponses sont publiés dans le contexte, comme dans le lecteur |
| 50 | « 10 lignes au moins » ne se signalait pas sur un tableau vide | Un champ vide sortait des contrôles avant ses bornes | Un tableau vide est comparé à son minimum |
| 51 | À 5 000 pierres, la mise en page prenait 3 s et l'exécution s'arrêtait (« trop d'étapes ») | Collisions testées pierre à pierre ; plafond d'étapes fixe | Grille spatiale et journal d'insertion ; plafond proportionnel à la taille ; `validate()` mémorisé ; index des fils |
| 52 | `get(cases, "0").max` : « Caractère inattendu « . » » | Les expressions n'avaient pas d'accès postfixe | `.clé` et `[i]` après une expression ; objets littéraux `{ k: v }` |
| 53 | Une condition « Si » des blocs était toujours vraie | Un champ `expr` arrivait au comportement comme son texte, donc « vrai » | Dans `run`, un champ `expr` vaut sa valeur calculée |
| 54 | Les étiquettes d'un genre de lien affichaient le gabarit brut | `edgeLabel` ne remplissait que les gabarits simples | Un gabarit avec expressions s'évalue sur les champs du lien |
| 55 | Les flèches du diagramme disparaissaient quand deux diagrammes étaient ouverts | Même identifiant de marqueur dans la page, le premier dans un volet caché | Un identifiant de marqueur par dessin |
| 56 | Des transitions entre les deux mêmes états se superposaient | Les arêtes opposées s'écartaient du même côté | Écart calculé dans le repère de la paire ; retour en arc seulement s'il est seul |
| 57 | L'aperçu ne s'ouvrait pas après « Créer un éditeur » | La vue reliait le Concepteur en se montant, avant la demande d'aperçu | La liaison attend sa première compilation, puis ouvre l'aperçu |
| 58 | Le texte d'un projet changeait « 12 » (champ texte) en nombre | Les valeurs nues étaient lues en JSON | Un champ textuel garde le texte ; un renvoi `{ "$ref" }` reste un objet |
| 59 | ESLint : « clé b en double » dans la mise en page | Une branche portait `b` (l'identifiant) puis `b` (le point d'arrivée) : le second écrasait le premier, et les branches ne suivaient pas une pierre qu'on glisse | Le point d'arrivée s'appelle `to` ; `data-b` porte bien l'identifiant |
| 60 | La boîte à outils restait vide | `D.compact()` retirait la liste vide des enfants d'une catégorie avant qu'on la remplisse | Les enfants s'ajoutent après le compactage |
| 61 | Copier la 1re et la 3e pierre d'une chaîne perdait la 3e | Une « racine » était une pierre sans *ascendant* sélectionné ; la 3e, rattachée à la 1re par la 2e (non copiée), disparaissait avec elle | Racine : pierre dont le *parent direct* n'est pas sélectionné |
| 62 | Coller une sélection détachait une pierre de sa chaîne | Les collages se faisaient pierre par pierre, avant que les faces calculées (projet embarqué, fils) n'existent | Comme au chargement : les pierres, puis les fils internes, puis les collages |
| 63 | Coller un « Début » dans un processus levait une erreur non rattrapée | La règle « au plus 1 » refuse la copie au milieu de la transaction | La transaction est annulée et la raison est dite ; rien n'est collé |
| 64 | Des gabarits de l'instance (fonctions) faisaient échouer le démarrage | La configuration est fusionnée par `structuredClone`, qui refuse les fonctions | Les gabarits sont mis à part avant la fusion |
| 65 | `{{baseUrl}}` signalé « ne trouve aucune valeur » | Le contexte ne cherchait un nom qu'à la racine (`env.baseUrl` existait) | Portées nommées du langage (`variables.scopes`) : un nom court se cherche dans local, env, collection, globals |
| 66 | `{{runId}}` signalé alors qu'une pierre « Définir » le pose | Les diagnostics ignoraient ce que l'exécution définira | `variables.declared(ws)` : le langage nomme ces variables |
| 67 | Dans les scripts lus, l'extraction de `userId` passait avant le `console.log` qui la précède | Chaque motif reconnu était remplacé par une seule espace : les positions glissaient | Remplacé par autant d'espaces : l'ordre est celui du script |
| 68 | Le jeton apparaissait en clair dans la réponse de « Login » | Le masque ne connaissait le jeton qu'après son extraction | Les champs au nom de secret (`token`, `password`…) sont masqués dans les corps, avant même d'être des variables |
| 69 | Une branche « sinon » sans requête s'exécutait toujours dans l'export Postman | Ses pierres allaient au script de la requête suivante | La condition devient `if/else` dans le test de la requête qui précède, puis `setNextRequest` saute la branche |
| 70 | Les vérifications sous une requête étaient illisibles (tournées, minuscules) | Les adjacentes suivent la géométrie du jeu (90°, réduites) | Option `adjacents: 'list'` : droites, empilées, reliées par une colonne, nom à l'horizontale |
| 71 | « Tournois » échouait (404) | La collection lit `{{tournamentId}}` sans jamais le créer | Un tournoi de démonstration est ajouté à l'environnement de l'exemple ; le rapport signale les variables **vides** à l'envoi |

---

## Vérifier

- **Plateforme** : `npm test` (142 tests), `npm run lint`, `npm run build` (`npm run check` fait les trois).
  - Depuis le 15e message (`tests/postman.test.js`, 13) :
    - le cœur : portées nommées, ressources du projet, rapports, `from` et chaînes séquentielles, boîte à outils dynamique et fragments, importeurs ;
    - Postman : la collection du dépôt lue entière, chaque script converti, serveur simulé (401, 404, ressources gardées), import ;
    - l'exemple exécuté avec son rapport : secrets masqués, fil, test négatif, condition, tableau de bord ;
    - l'arrêt au premier échec ;
    - l'export (scripts valides, noms uniques) et le réimport à l'identique ;
    - les données embarquées à jour ;
    - le bac à sable `pm.*`.
  - Dans Chrome :
    - l'exemple TNR : table, boîte à outils tirée de la collection, tableau de bord, campagne exécutée, Rapport, Déroulé ;
    - les adjacentes en liste et en domino, basculées en direct ;
    - l'import d'une collection puis d'un environnement par « Ouvrir un fichier » ;
    - l'export (trois fichiers).
  - Depuis le 14e message : gabarits, sélection multiple, boîte à outils en JSON, menus en JSON, manifeste (`tests/ui.test.js`) ; dans Chrome sans interface, en développement et dans `dist/` : les 18 langages exécutés, leurs quatre projections, la boîte à outils entière et réduite, tout sélectionner, copier, coller, annuler ; Ctrl + clic, Ctrl + glisser (bouton gauche et droit, sans menu), glisser le fond sans Ctrl (la vue bouge, rien n'est sélectionné), Ctrl + D et Suppr sur la sélection ; la fiche d'aide et son lien, le clavier dans la boîte (→ ← ↓), la recherche, le glisser depuis la boîte réduite, le thème sombre ; les polices locales chargées, aucune requête externe. Avant, depuis le 13e message : performance, liens typés, comportements déclarés, moteurs (états, jetons, décision), projections (texte, diagramme, tableaux), huit modèles en données, Concepteur (aller-retour sans perte, changement de langage à chaud). Et avant :
  - le créateur de quiz (vingt questions, chemins, seconde chance, choix calculés, notation, générateurs, diagnostics) ;
  - les expressions (aller-retour texte ⇄ JSON, évaluation, dialectes) ;
  - les sauts, l'aiguillage, les kits, les appels de classe, les champs expression et tableau, les générateurs asynchrones.
  - Moteur, fils, règle du jeu, modules et appels, langage en JSON, modélisation et traçage.
  - Ressources (aller-retour sans perte), stockage (même contrat pour la mémoire, le navigateur et HTTP), établi, volets, commandes et raccourcis, générateurs, affichages.
  - Conformité des neuf démos aux six schémas.
- **Navigateur** : un pilote Chrome sans interface a vérifié, sans erreur de console :
  - glisser depuis la pioche (insertion dans une chaîne) ;
  - déplacer une adjacente d'une pierre à une autre ;
  - un fil refusé, avec sa raison ;
  - un fil relâché dans le vide, puis l'ajout rapide ;
  - le clavier (navigation, virage, annuler, supprimer qui recolle la suite) ;
  - le menu contextuel ;
  - la DominoPopup (ouverture, voisines, points, onglets, flèches, fermeture) ;
  - les options d'instanciation (habillages, largeur de la table) ;
  - le zoom à deux doigts ;
  - l'ouverture d'un composant ;
  - glisser une pierre sans sélection de texte ;
  - l'aperçu joueur du quiz, joué jusqu'à l'écran de fin ;
  - tirer un fil depuis un point (points compatibles allumés, ajout rapide relié), le menu d'un fil (bloquant, non bloquant), reprendre un fil ;
  - double-clic sur une instance (sa déclaration s'ouvre), exporter puis importer une déclaration ;
  - les onglets Modules, Langage, Mémoire, Appels, Aperçu ;
  - ouvrir un projet embarqué dans l'éditeur de son langage, une théorie rangée dans une pierre ; jouer aux dominos ;
  - annoter, neutraliser, verrouiller une pierre ; l'onglet « Modèle » ;
  - l'effet domino dans les neuf éditeurs ;
  - chaque onglet de l'inspecteur et chaque partie (déclarations, corps) dans les neuf éditeurs ;
  - les quatorze générateurs ;
  - le thème sombre et l'affichage mobile (390 px) ;
  - le studio :
    - la barre de menus et ses sous-menus, Nouveau ▸ par langage ;
    - le dialogue Nouveau projet, la palette Ouvrir, la palette de commandes ;
    - Enregistrer (brouillon devenu `local:projects/…`), le « ● » de modification, l'enregistrement automatique, puis la page rechargée (projets, volets et brouillons restaurés) ;
    - les divisions à droite et en bas, la grille 2 × 2 ;
    - les quatre affichages dans les neuf langages (sans erreur ni avertissement) ;
    - Générer ▸ (dix-sept générateurs), les menus contextuels de l'onglet et de la pierre (avec les contributions de Kanto) ;
    - le thème sombre, le mobile et le menu ☰ ;
  - le 13e message : les huit modèles (diagramme, tableau, texte, Simuler, exécution) ; « Créer un éditeur » (dialogue, Concepteur et aperçu côte à côte, une forme et un nom changés recompilés et remplacés à chaud) ; « Ouvrir à côté en » ; la pioche contextuelle et l'ajout en rafale ;
  - le créateur de quiz :
    - les sauts dessinés, les sorties de l'aiguillage nommées, le fil vers une adjacente ;
    - la cible d'un saut choisie en cliquant sur la table ;
    - un tableau de choix modifié dans l'inspecteur (une condition tapée en texte, enregistrée en JSON ; une ligne ajoutée) ;
    - le quiz joué en entier dans le dialogue, deux fois : 16 / 16, puis tout faux jusqu'à « À revoir » après la seconde chance ;
    - le fichier HTML exporté, joué seul (choix précalculés), aussi à 390 px.
