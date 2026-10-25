# Domino Studio : un éditeur complet

> `index.html` ouvre **Domino Studio**, un vrai éditeur bâti sur la plateforme. Il a une barre de menus, des onglets côte à côte, des projets enregistrés (navigateur, mémoire, API) et un espace de travail restauré au démarrage. Tout ce qu'il fait est une **commande** : une application ou un langage peut en ajouter, et les placer dans les menus et les raccourcis.

```js
// Ce que fait index.html :
await Domino.studio('#app', { config: globalThis.DominoConfig });   // domino.config.js
```

Le studio assemble des modules indépendants. Chacun peut servir sans les autres.

| Module | Rôle | DOM |
|---|---|---|
| `domino.resource.js` | Le format « élément » (ressources `apiVersion/kind/metadata/spec/status/extensions`) | non |
| `domino.languages.js` | Registre des langages, de leurs groupes, de leurs modèles de projet et de leurs contributions | non |
| `domino.codegen.js` | Registre des générateurs (point d'extension) | non |
| `domino.storage.js` | Adaptateurs de stockage, configuration, préférences | non |
| `domino.workbench.js` | Établi : documents, état « modifié », autosauvegarde, secours, récents, disposition des volets | non |
| `domino.commands.js` | Commandes, clauses `when`, raccourcis, menus déclaratifs | non |
| `domino.display.js` | Modes d'affichage des pierres | non |
| `domino.menubar.js` | Barre de menus, menus flottants, palette, dialogues | oui |
| `domino.panes.js` | Volets : groupes d'onglets, divisions, poignées | oui |
| `domino.studio.js` | Le shell qui relie tout | oui |

---

## 1. L'écran

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ ▣ Domino Studio  Fichier Édition Affichage Exécuter Kanto Aide │ Boutique ● │ ↶ ↷ ▶ ▣ ◐ │
├──────────────────────────────────────┬───────────────────────────────────────┤
│ Bienvenue │ Boutique · vue 1 ×  ◫ ⋯  ║ Boutique · vue 2 ×               ◫ ⋯  │  onglets de documents
│ Programme │ Déclarations              ║ Programme │ Panier ›                 │  parties (de l'éditeur)
│ pioche │ table                        ║ pioche │ table                        │
│        │                              ║        │                              │
│ inspecteur                            ║ inspecteur                            │
├──────────────────────────────────────┴───────────────────────────────────────┤
│ Stockage : Ce navigateur · Enregistré à 14:02      Volet 1/2 · ◫ Pierre · Kanto · F1 │
└──────────────────────────────────────────────────────────────────────────────┘
```

- **Barre du haut** :
  - la barre de menus ;
  - le nom du projet actif, avec « ● » s'il est modifié ;
  - les actions rapides : annuler, rétablir, boîte à outils, diviser, effet domino, arrêter, inspecteur, thème.
- **Volets** : un ou plusieurs groupes d'onglets, côte à côte ou l'un sous l'autre.
  - Chaque onglet montre un projet (ou la page de bienvenue).
  - Deux onglets peuvent montrer le **même projet** : deux vues, un seul historique.
  - Sous les onglets de documents, chaque éditeur garde ses onglets de parties (programme, déclarations, corps), plus discrets.
- **Barre d'état** :
  - le stockage actif (« ⚠ » s'il n'est pas conservé) et l'état d'enregistrement ;
  - le volet actif, le mode d'affichage, le langage, la palette.
  - Chaque élément est un bouton.

## 2. Les menus

| Menu | Contenu |
|---|---|
| **Fichier** | Nouveau projet… · **Nouveau ▸** (… Modèles ▸ États, Processus, Décision…, Mes langages ▸) · **Créer un éditeur…** · Modifier ce langage (à côté) · Publier le langage · (Langages ▸ Kanto ▸ Projet vide / Exemple / Bonjour…, Domaines ▸ …, Langage depuis un fichier JSON…) · Ouvrir un projet… · Ouvrir un fichier… · Ouvrir récent ▸ · Gérer les projets enregistrés… · Enregistrer · Enregistrer sous… · Enregistrer tout · Enregistrement automatique · Dupliquer le projet · Renommer… · Importer ▸ · Exporter ▸ · Fermer l'onglet · Fermer le projet · Fermer tout · Espace de travail ▸ (exporter, importer, réinitialiser la disposition, Stockage ▸) · Préférences… |
| **Édition** | Annuler · Rétablir · Couper · Copier · Coller · Dupliquer · Supprimer (une pierre ou toute la sélection) · **Tout sélectionner** · Désélectionner · Rechercher une pierre… · Aller à un élément… · Ajouter une pierre… · Configurer… · Ouvrir son intérieur · Annoter… · Neutraliser · Verrouiller · Tourner la suite ▸ |
| **Affichage** | Palette de commandes… · **Projection ▸** (Dominos, Diagramme, Tableau, Texte ; projection suivante) · Affichage des pierres ▸ · Habillage ▸ · Thème ▸ · Options de l'éditeur… · Boîte à outils · **Boîte à outils réduite aux dominos** · Inspecteur · Mini-carte · Grille · Noms · Valeurs sur les joints · Diviser à droite · Diviser en bas · Dupliquer l'onglet · **Ouvrir à côté en ▸** · Disposition ▸ (un volet, deux colonnes, deux lignes, grille 2 × 2, égaliser) · Volet suivant · Zoom · Ajuster · Mode zen |
| **Exécuter** | Effet domino · Exécuter à blanc · Arrêter · Mode direct · Vitesse ▸ · Générer ▸ (générateurs du langage, puis génériques) · Générer (premier) · Voir le code · Problèmes · Dernière exécution · Document de modèle · *contributions du langage* |
| **‹Langage›** | Voir le langage · Nouveau projet de ce langage… · Exporter le langage (JSON) · *contributions du langage* (le menu porte le nom du langage actif) |
| **Aide** | Bienvenue · Prendre en main · Raccourcis clavier… · Palette · Documentation ▸ · À propos |

**Importer ▸** liste aussi les importeurs inscrits (collection et environnement Postman…) ; un fichier ouvert ou déposé est reconnu de lui-même. **Exporter ▸** liste les générateurs du langage actif : leurs fichiers sont téléchargés (collection Postman, environnements, plan de test).

Ces menus sont **des données JSON** (`engine/studio/domino.studio.menus.js`) : titres, descriptions, aides (infobulles) et liens de documentation. Une instance en ajoute, en remplace ou en retire par la clé `menus` de `domino.config.js` (voir [EXTENDING.md](EXTENDING.md) § 12).

**Menus contextuels** :

- **Onglet** : clic droit, Maj+F10 ou appui long. Fermer, Fermer les autres, Fermer à droite, Diviser à droite, Diviser en bas, Dupliquer l'onglet, Dupliquer le projet, Renommer, Copier l'adresse, Épingler.
- **Volet** (bouton ⋯) : diviser, disposition, nouveau, ouvrir, fermer tout.
- **Pierre** : le menu de l'éditeur, plus les contributions (point `domino/context`), avant « Supprimer ».
- **Sélection de plusieurs pierres** (clic droit sur l'une d'elles) : dupliquer, copier, couper, détacher de leurs chaînes, neutraliser, verrouiller, désélectionner, supprimer.
- **Fond de la table** : ajouter, coller, tout sélectionner, annuler, rétablir, effet domino, ajuster, inspecteur.

## 3. Raccourcis

`Mod` est Ctrl, ou ⌘ sur Mac. Les raccourcis que le navigateur garde pour lui (Ctrl+N, Ctrl+T, Ctrl+W, Ctrl+Tab) sont évités : le studio refuse de les lier.

| Raccourci | Commande |
|---|---|
| Mod+Alt+N | Nouveau projet… |
| Mod+O / Mod+Maj+O | Ouvrir un projet… / Ouvrir un fichier… |
| Mod+S / Mod+Maj+S / Mod+Alt+S | Enregistrer / Enregistrer sous… / Enregistrer tout |
| Mod+Alt+W / Mod+K Mod+W | Fermer l'onglet / Fermer tout |
| F2 | Renommer le projet (sans pierre sélectionnée) |
| Mod+, | Préférences |
| Mod+Z / Mod+Maj+Z, Mod+Y | Annuler / Rétablir |
| Mod+X, Mod+C, Mod+V, Mod+D, Suppr | Presse-papiers, pierre ou sélection (dans la table : ailleurs, le texte se copie normalement) |
| Mod+A, Échap | Tout sélectionner, désélectionner (dans la table) |
| Ctrl+clic, Ctrl+glisser | Ajouter ou retirer une pierre de la sélection ; rectangle de sélection (bouton gauche ou droit ; Maj ajoute) |
| Mod+F / Mod+P | Rechercher une pierre / Aller à un élément (tous les projets ouverts) |
| F1, Mod+Maj+P | Palette de commandes |
| Mod+Alt+1…4 | (via le menu) Affichage des pierres |
| Mod+B / Mod+Alt+B / Mod+J | Boîte à outils / Boîte à outils réduite aux dominos / Inspecteur |
| Mod+\ / Mod+K Mod+\ | Diviser à droite / en bas |
| Mod+K → / Mod+K ← | Volet suivant / précédent |
| Alt+Pg.Suiv / Alt+Pg.Préc | Onglet suivant / précédent |
| F6 / Maj+F6 | Région suivante / précédente (menus → onglets → pioche → table → inspecteur → barre d'état) |
| F10, Alt seul | Barre de menus |
| Mod+= / Mod+- / Mod+0 | Zoom / Ajuster |
| Mod+K Z | Mode zen (Échap pour sortir) |
| F5 / Mod+F5 / Maj+F5 | Effet domino / à blanc / Arrêter |
| Mod+Maj+B / Mod+Maj+M | Générer / Problèmes |
| Mod+K Mod+S | Raccourcis clavier |

Dans la table, ceux de l'éditeur restent : flèches, Alt+flèche, `/`, Entrée, Maj+Entrée, I, F, R, Suppr.

Une instance ajoute ou remplace ses raccourcis dans `domino.config.js` (`keybindings`). Un langage ajoute les siens par `contributes.keybindings` ; ils ne valent que dans ses projets.

## 4. Volets et onglets

- **Diviser** (Mod+\, bouton ◫ du volet, menu de l'onglet) : un nouveau volet s'ouvre à droite ou en bas, avec une **deuxième vue du même projet**.
  - Les vues partagent le projet et son historique.
  - Chacune garde sa caméra, sa partie active, sa sélection et son mode d'affichage.
- **Dupliquer l'onglet** : une deuxième vue dans le même volet. **Dupliquer le projet** : une copie indépendante, « (copie) ».
- **Glisser un onglet** :
  - sur une barre d'onglets : le déplacer à cet endroit ;
  - au centre d'un volet : l'y déplacer ;
  - sur un bord (25 %) : diviser de ce côté.
- **Tailles** :
  - tirer la poignée entre deux volets ;
  - au clavier, focus sur la poignée : flèches (2 %), Maj+flèches (10 %), Début et Fin ;
  - double-clic : égaliser ;
  - un volet garde au moins 15 %.
- **Dispositions** toutes faites : un volet, deux colonnes, deux lignes, grille 2 × 2 (quatre volets au plus, configurable).
- **Fermer** le dernier onglet d'un projet ferme le projet. S'il est modifié, le studio demande : « Enregistrer / Ne pas enregistrer / Annuler ».
- Un onglet **épinglé** (📌) échappe à « Fermer les autres ».
- **Petits volets** : un volet de moins de 560 px de haut replie son inspecteur (I ou Mod+J le rouvre). Au-delà de 8 éditeurs vivants, les plus anciens onglets cachés sont démontés, et leur vue est gardée. Un éditeur caché ne se redessine plus.
- **Mobile** (moins de 820 px) :
  - un seul volet visible (« Volet 1/2 » dans la barre d'état pour changer) ;
  - les menus passent dans le bouton ☰ ;
  - les zones tactiles sont plus grandes.

## 5. Projets, enregistrement, espace de travail

- **Nouveau** : un projet commence **brouillon** (`untitled:3`). Il n'est écrit dans le stockage qu'au premier « Enregistrer », qui lui donne une adresse (`local:projects/p_k3x9…`).
- **Enregistrement automatique** :
  - actif par défaut ; un projet déjà enregistré s'écrit 1,2 s après chaque modification (le délai est réglable) ;
  - un brouillon modifié est gardé en **sauvegarde de secours** et revient au démarrage, encore « modifié » ;
  - quitter la page n'en perd rien.
- **Modifié (●)** :
  - un projet est modifié depuis le dernier enregistrement ; annuler jusqu'à l'état enregistré le rend propre ;
  - changer le contexte, le nom ou les options du projet le rend modifié ;
  - ce qu'écrit une exécution (sortie, compteurs) ne le rend pas modifié.
- **Espace de travail** : ce qui est ouvert, la disposition, les onglets et leur vue, les récents. Il est restauré au démarrage. On peut l'exporter, l'importer, réinitialiser la disposition.
- **Ouvrir** :
  - Mod+O liste les projets de chaque stockage ;
  - un fichier s'ouvre aussi par glisser-déposer sur la fenêtre : projet v2, ressource Project, forme à plat, langage, espace de travail, déclaration.
- **Exporter** :
  - le projet (v2), la ressource, la forme à plat ;
  - le document de modèle, une image SVG de la partie, le langage.
- **Conflit** : si le projet a changé ailleurs (un autre onglet du navigateur, un serveur), quatre choix :
  - « Enregistrer la mienne comme copie » (le choix par défaut, il ne perd rien) ;
  - « Garder la mienne » ;
  - « Prendre l'autre version » ;
  - « Annuler ».

Les détails (adaptateurs, configuration, API HTTP) sont dans [STORAGE.md](STORAGE.md).

## 6. Modes d'affichage

Le mode se choisit par **Affichage › Affichage des pierres** ou depuis la barre d'état. Il vaut pour l'onglet, et la préférence fixe le mode des nouveaux onglets.

| Mode | Pour quoi |
|---|---|
| **Pierre** | La pierre de domino : faces, points, relief, nom en entête |
| **Compacte** | Plus petite et sans entête, pour voir de grands projets. Le nom reste au survol et pour les lecteurs d'écran |
| **Carte détaillée** | La pierre et sa fiche : points et leurs types, champs et leurs valeurs, problèmes, note. La table s'écarte pour faire place aux fiches |
| **Contour** | Un trait et des points de couleur : sobre, lisible à l'impression et en thème sombre |

Une pierre peut imposer son dessin (`display` dans sa définition, ou `meta.display` sur la pierre posée), jamais son échelle. Les points restent aux mêmes coordonnées dans tous les modes. Voir [EXTENDING.md](EXTENDING.md) pour écrire un mode.

## 7. Accessibilité

- **Barre de menus** : motif ARIA « menubar ».
  - Rôles : `menuitem`, `menuitemcheckbox`, `menuitemradio`.
  - Attributs : `aria-checked`, `aria-disabled`, `aria-keyshortcuts`.
  - Clavier : flèches, Entrée, Échap (rend le focus), recherche par première lettre, F10 ou Alt pour y entrer.
- **Onglets** : `tablist` par volet ; un onglet modifié porte « ● » et « modifié » dans son nom accessible (jamais la couleur seule).
- **Poignées de volets** : `separator` avec `aria-valuenow`, réglables au clavier.
- **Dialogues** : `<dialog>` modal, focus sur le premier champ, retour du focus à l'invocateur, Échap pour annuler. Aucun `window.confirm` (bloqué dans les pages en bac à sable).
- **Annonces** : une zone vivante pour le studio (« Projet enregistré », « Volet divisé »). La table garde la sienne.
- **Thème** : Système, Clair ou Sombre, retenu. L'habillage « Automatique » passe en ébène en sombre. `prefers-reduced-motion` est respecté.

## 8. Mode dégradé

- **Stockage refusé** : si le navigateur refuse le stockage (page en bac à sable, navigation privée, stockage bloqué), le studio passe en mémoire.
  - Un bandeau prévient : « Vos projets ne seront pas conservés… exportez-les ».
  - La barre d'état affiche « ⚠ Stockage ».
  - Quitter la page avec des modifications demande confirmation.
- **Téléchargement refusé** : le studio propose de **copier** le contenu.
- **Hors ligne** : le studio marche sans réseau, en `file://`. Les polices ont leur repli, et aucun `fetch` n'est fait au démarrage.

## 9. Créer un éditeur (le Concepteur)

1. **Fichier › Créer un éditeur…** (Ctrl+Alt+L), ou une carte « Créer un éditeur » de la page de bienvenue : un modèle (blocs, flux, états, décision, processus, formulaire, schéma, carte mentale) ou une page vierge.
2. Le **Concepteur** s'ouvre à gauche : une pierre « Langage » et trois chaînes (types de points, pierres, genres de liens). L'**aperçu** s'ouvre à droite : un projet du nouveau langage.
3. Chaque modification recompile le langage (après un court délai) et le remplace **à chaud** dans les projets ouverts ; une erreur s'affiche avec l'endroit, et l'aperçu garde la dernière version valide. La vue Tableau du Concepteur édite les pierres en masse.
4. Le brouillon est gardé dans le navigateur (groupe « Mes langages »). **Publier le langage** le range avec les langages importés et télécharge `id.language.json` : un fichier sans code, qui s'importe ailleurs sans demande de confiance.

**Modifier ce langage (à côté)** ouvre le Concepteur sur le langage du projet actif, s'il est en données (les modèles, les vôtres, les imports sans code).

## 10. Projections et simulation

- La barre au-dessus de la table (ou **Affichage › Projection**, `Mod+K P`) montre le projet en **dominos**, **diagramme** (couches, arbre, libre ; SVG), **tableau** ou **texte** (Ctrl+Entrée applique).
- **Ouvrir à côté en ▸** ajoute un volet du même projet dans une autre projection : les deux restent synchronisés.
- Pour un langage à moteur (états, processus, décision), l'onglet **Simuler** de l'inspecteur avance pas à pas : événements possibles, horloge, variables, trace, retour arrière ; le diagramme allume l'état actif.
- **Déroulé** (projection) : les étapes de la dernière exécution, une partie par couloir (un scénario, une méthode), avec statut, durée et rapports ; sans exécution, le plan. Un langage peut ajouter sa propre projection (le tableau de bord TNR).
- **Rapport** (onglet de l'inspecteur) : ce que les pierres ont rapporté pendant l'exécution (`rc.report`), filtrable (tout, problèmes, réussis), cherchable, exportable en JSON ; chaque entrée se déplie (gabarit `report.<genre>`).
- **Pioche contextuelle** : une pierre sélectionnée, la pioche montre en tête ce qui se colle après elle. Dans l'ajout rapide (`/`), **Maj+Entrée** pose la pierre et rouvre l'ajout juste après (en rafale).

## 11. Sélection multiple et boîte à outils

**Sélectionner plusieurs pierres.** Ctrl (⌘ sur Mac) distingue la sélection du déplacement de la vue :

| Geste | Effet |
|---|---|
| Glisser le fond | déplacer la vue (comme avant) |
| Ctrl + clic sur une pierre | l'ajouter à la sélection, ou l'en retirer |
| Ctrl + glisser le fond, bouton **gauche ou droit** | un rectangle : toutes les pierres qu'il touche sont sélectionnées (Maj en plus : ajoutées à la sélection) |
| Ctrl + clic droit sans glisser | le menu de la sélection |
| Glisser une pierre sélectionnée | tout le groupe suit |
| Mod+A, Échap | tout sélectionner, désélectionner |

La barre d'état compte les pierres sélectionnées ; la pierre principale (cerclée en trait plein) est celle que montrent l'inspecteur et que le clavier fait bouger. Supprimer, couper, copier, dupliquer et neutraliser agissent sur toutes, en une seule entrée d'historique. Coller garde les connexions et les fils entre les pierres copiées ; une règle du langage qui refuse une copie (« au plus 1 Début ») est dite, et rien n'est collé.

**La boîte à outils.** Chaque langage la décrit en JSON (catégories, sous-catégories, pierres, textes, aide, liens) ; sans description, une catégorie par catégorie de pierre.

- Une catégorie est **présentée par un domino** : son initiale ou son icône, et le nombre de ses pierres en points. Un clic la déplie ou la replie ; « ? » ouvre sa fiche (description, aide, « En savoir plus »).
- **Entière** : noms, descriptions, faces. **Réduite** (bouton en haut, ou Mod+Alt+B) : une colonne étroite avec seulement les dominos ; la loupe rouvre la boîte entière sur la recherche.
- Tout replier, tout déplier ; recherche par nom, description, aide ou catégorie ; au clavier : ↑ ↓, → déplie, ← replie ou remonte, Entrée ajoute la pierre après la sélection.
- On glisse une pierre de la boîte sur la table dans les deux modes. Le mode et les catégories ouvertes sont retenus par langage.

## 12. Un éditeur de scénarios d'API

**Fichier › Nouveau ▸ Scénarios d'API (TNR)**, ou ouvrez une collection Postman : un éditeur à la Postman, fait de dominos (campagne, scénarios, requêtes, vérifications et extractions en liste sous chaque requête, données passées par fils), avec un tableau de bord, le Déroulé et le Rapport. Voir [TNR.md](TNR.md).

**Options de l'éditeur › Adjacentes** : « collées à 90° » (le jeu) ou « en liste » (droites, empilées, nom à l'horizontale) ; un langage chargé choisit la liste par défaut (`options: { adjacents: 'list' }`).
