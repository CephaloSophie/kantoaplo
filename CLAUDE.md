# KANTO APLO — contexte

Vitrine de **KANTO APLO** (ΚΆΝΤΟ ΑΠΛΌ, « fais-le, simplement »), la plateforme no-code et
low-code de **Cephalo Sophie** (ΚΕΦΑΛΗ ΣΟΦΙΑ). Site statique servi par GitHub Pages
(`kantoaplo.com`). Langue : français (textes bilingues FR/EN dans les données).

## L'univers

Une étoile, KANTO APLO, et des éditeurs aux noms grecs qui disent leur fonction. La source
du contenu affiché est `assets/js/data.js` (`window.KANTO.editors`, dans l'ordre d'affichage).

| Éditeur | Grec | Rôle | État |
|---|---|---|---|
| Skopos | ΣΚΟΠΟΣ | Le guetteur : surveille les APIs | démo |
| Héphaïstos | ἭΦΑΙΣΤΟΣ | La forge : éditeur de blocs Blockly | démo |
| **Zeugma** | ΖΕΥΓΜΑ | **Le lien** : bibliothèque de dominos pour bâtir sans code éditeurs visuels, workflows, automatisations | démo |
| Typos | ΤΥΠΟΣ | Le moule : templates structurels | démo |
| Tektôn | ΤΈΚΤΩΝ | Le bâtisseur : éditeur visuel du front (moteur KANTO) | démo |
| Logos | ΛΌΓΟΣ | La règle : éditeur visuel des services (moteur KANTO) | démo |
| Skhêma | ΣΧΗΜΑ | Le schéma : UML | démo |
| Kýdos | ΚΥΔΟΣ | L'application phare, bâtie sur KANTO APLO (kydosbelote.com) | externe |
| Mantis | ΜΆΝΤΙΣ | Le prophète : dashboards et prédictions | en composition |
| Kairos | ΚΑΙΡΟΣ | L'opportunité : tests A/B | en composition |
| Synergos | ΣΥΝΕΡΓΟΣ | Le collaborateur : connecteurs | en composition |
| Hermès | ἙΡΜΗ͂Σ | Le messager : orchestration, agents IA | en composition |

Hors orbite : **Époptès** (ἘΠΌΠΤΗΣ), le back-office qui voit tout le système.

### Zeugma et Psèphos

- **Zeugma** (ζεῦγμα, « le joug, l'attelage, ce qui lie deux choses ») : une plateforme pour
  construire des langages visuels à partir du jeu de dominos. Dépôt `CephaloSophie/zeugma` ;
  build publié ici dans `demos/zeugma/` ; captures dans `assets/editors/zeugma/`.
- **Psèphos** (ψῆφος, « le caillou qui compte et qui vote ») : **le nom propre d'une pierre de
  Zeugma**. Au lieu de dire « un bloc » ou « un domino », on dit « un psèphos » (pluriel :
  **psèphoi**). Ce n'est pas un éditeur à part : c'est l'unité de Zeugma. Sa face gauche dit
  ses entrées, sa face droite ses sorties ; la couleur de chaque point est son type de
  connexion. Les psèphoi se collent comme au jeu ou se relient par des fils.
  Même racine que ψηφίς, la tesselle de mosaïque.

## Sites et dépôts voisins

| Site | Dépôt | Contenu |
|---|---|---|
| kantoaplo.com | `CephaloSophie/kantoaplo` (ici) | Vitrine des éditeurs, démos |
| editors.kantoaplo.com | `CephaloSophie/kantoaplo-landing` | Ancienne page des éditeurs |
| cephalosophie.com | `CephaloSophie/cephalosophie` | Le studio : univers KANTO APLO animé, Kýdos, galerie des visuels Facebook (7 thèmes) |
| kydosbelote.com | `CephaloSophie/kydosvitrine` | Vitrine de Kýdos (APK Android) |

## Fichiers

| Fichier | Rôle |
|---|---|
| `assets/js/data.js` | Tout le contenu : éditeurs, moteur KANTO, slogans, clients |
| `assets/js/site.js` | Rendu, transitions, galeries, visionneuse |
| `assets/editors/<id>/` | Captures (≤ 1600 px) et `thumbs/` (560 px) ; `shots` = leur nombre |
| `tools/add-shots.py` | `python3 tools/add-shots.py <id> capture1.png …` ajoute des captures |
| `demos/<id>/` | Démos publiées des éditeurs |

Ajouter ou renommer un éditeur ici : le reporter aussi dans `cephalosophie`
(`assets/js/data.js` → `bodies`, et `tools/studio/content.js` pour ses affiches).
