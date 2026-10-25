# Zeugma : document d'idée

> Une plateforme, inspirée du jeu de dominos, pour construire des **langages visuels** dans le monde **Kantoaplo** : éditeurs, langages de programmation, outils d'automatisation, solutions de logique.
>
> **Zeugma** (ζεῦγμα, « joug, attelage, ce qui lie deux choses ») : c'est la connexion entre dominos. Le nom porte le mécanisme central (ça s'emboîte, ça s'enchaîne), et le mot est aussi une figure de style, donc il a du caractère.

- **Statut** : version 11. Depuis le douzième message, un créateur de quiz de 20 questions a servi de banc d'essai : le cœur a gagné les expressions déclaratives, les sauts, l'aiguillage à N cas, les kits, les champs « tableau » et « expression », les appels de classe hors exécution et les générateurs asynchrones. Voir A.20 et B.6 sexies.
- **Version 10**. Depuis le onzième message, la plateforme a un vrai éditeur : Domino Studio (menus, volets côte à côte, quatre affichages, projets enregistrés, espace de travail, API configurables), un format « élément » professionnel (ressources) et un registre de générateurs. Voir A.19 et B.6 quinquies.
- **Version 9**. Depuis le dixième message, une pierre peut tout représenter (variable, ligne, classe, algorithme, scénario, projet d'un autre langage, idée, pièce de jeu), et la plateforme produit un document de modèle complet et traçable, selon des schémas publiés.
- **Version 8**. Depuis le neuvième message, le moteur est une plateforme de langages : un éditeur est l'instance d'un langage ; les pierres se collent ou se relient par des fils ; des classes, bibliothèques et fonctions se déclarent et s'instancient. Trois langages et quatre éditeurs de domaine l'utilisent (`index.html`).
- **Livrables** : [`index.html`](../index.html) (Domino Studio, neuf éditeurs et l'inspecteur), [`design/design-system.html`](../design/design-system.html) (design system), [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (le moteur), [`docs/DEMOS.md`](DEMOS.md) (les démos et le journal de leur construction). La maquette précédente reste dans [`design/studio.html`](../design/studio.html).
- **Textes d'origine** : les douze messages sont reproduits mot pour mot en [annexe](#annexe--textes-dorigine).

Ce document compte deux parties :

- **Partie A** reprend exactement l'idée telle qu'elle a été exprimée, point par point, sans rien ajouter.
- **Partie B** contient l'analyse : principe directeur (le framework d'abord), vocabulaire, règles formalisées, interprétations retenues pour le design, API, et choix ouverts devenus options configurables.

---

## Partie A : l'idée

### A.1 Le besoin

Dans le monde de **Kantoaplo**, on réfléchit à une **bibliothèque** (un module, une bibliothèque ou un framework) qui soit utilisable :

1. dans la construction d'**éditeurs visuels de codage pour le low-code** ;
2. dans la construction d'**éditeurs de workflow**, qui peuvent être intégrés dans un **logiciel d'automatisation** ;
3. dans une **interface visuelle de conception de circuits électroniques** ;
4. dans un **éditeur de création de scénarios** ;
5. pour **remplacer les nœuds** utilisés dans de nombreux projets ;
6. dans des **solutions de dashboarding**.

Il ne faut pas se limiter à ces exemples. Le module doit aller plus loin du côté de la **flexibilité**.

### A.2 Le concept

- Le module a un **design inspiré du domino**, dans la **façon de coller les composants entre eux**.
- L'éditeur **ressemble au concept de Blockly** et doit être utilisable dans des projets et des besoins très différents.
- **Chaque domino est un bloc, comme chez Blockly.** *(Point à bien retenir.)*

### A.3 Les deux faces d'un domino

- La **première face** (à gauche) affiche le **nombre de paramètres acceptés en entrée**.
- La **deuxième face** (à droite) affiche le **nombre de sorties**.
- Ces nombres sont **configurés et spécifiés par le développeur** qui utilise le module.
- Si le nombre d'entrées ou de sorties **dépasse 6**, la face affiche **9 points**.
- Si la **deuxième face affiche zéro**, il n'y a **pas de sortie** : **aucune pierre ne peut être collée après**.
- Si la **première face affiche zéro**, la pierre **ne peut pas être collée à une autre pierre** (elle ne peut pas venir après une autre).

### A.4 Les couleurs aux extrémités

- À **chaque extrémité** de chaque pierre se trouvent de **petites couleurs**. Elles indiquent les **couleurs acceptées en entrée** (à gauche) et **en sortie** (à droite).
- Lors de la **configuration d'une pierre**, on choisit les **couleurs des points de chaque côté** (entrée / sortie).
- On peut aussi spécifier les **catégories** qui peuvent **précéder** ou **suivre** une pierre (entrée / sortie), **comme Blockly**, qui définit les blocs pouvant précéder et ceux pouvant suivre. Ici, on ajoute en plus les **couleurs sur le domino**, à l'extrémité gauche ou droite.
- Ces couleurs prennent la forme de **petits traits**, comme ceci : `(-)`. La **largeur** dépend du **nombre de couleurs ou de catégories permises**.
- Chaque côté de chaque domino peut donc avoir une **couleur de points spécifiée par le concepteur**.

### A.5 L'apparence

- Par défaut, l'éditeur affiche les dominos **en blanc**, **parfaitement comme de vrais dominos**.
- L'utilisateur ou le développeur peut **instancier le module avec des options**, par exemple la **couleur des pierres**.

### A.6 L'espace de travail (workspace)

- L'éditeur principal, là où l'on **dépose les dominos** pour les **coller** et **construire son projet**, est **flexible pour la navigation**.
- On peut facilement **zoomer** et **explorer le projet** créé, **à la souris**.

### A.7 Le menu contextuel

Un **clic droit** sur un domino du workspace ouvre un menu avec :

- **Supprimer**
- **Dupliquer**
- **Copier**
- **Configurer**

### A.8 La DominoPopup (configuration)

Un clic sur **Configurer** ouvre une **DominoPopup** qui **s'agrandit à partir du domino**. Elle affiche un **grand domino** avec **toutes ses informations** :

- le **parent** et les **fils**, ainsi que les autres liens ;
- les **entrées** et les **sorties** ;
- l'**aide** (*help*) ;
- toutes les informations des pierres **attachées en entrée et en sortie** ;
- un espace pour les **avertissements**, les **erreurs** et les **logs**.

### A.9 Les dominos conteneurs

- Certains dominos peuvent **contenir d'autres sous-dominos** dans le workflow.
- On affiche la partie **principale**. Les dominos qui en contiennent d'autres s'affichent avec une **autre couleur, gris clair par défaut**. L'utilisateur peut la **changer à l'initialisation du module** ou dans la **configuration**.
- Le menu contextuel de ces dominos propose une **option supplémentaire** pour **éditer leur contenu**. Le nom est laissé libre ; le design retient **« Ouvrir la partie »** (voir B.4).
- Cette option **ouvre un nouvel onglet** avec le **contenu de ce domino**.

### A.10 Exemples (domaine du développement visuel)

Exemple : un développeur utilise le module pour créer un **éditeur de développement visuel**. Il utilise un domino « main », qui fait quelque chose et rend un résultat, et qui est **expansé** (conteneur) :

1. **Une fonction qui génère un nombre aléatoire.** Elle **ne reçoit pas d'entrée** mais **rend une valeur** utilisée ensuite par l'algorithme.
   - Ce domino **ne peut pas être collé après** une autre pierre. C'est un **domino libre**, avec une **face gauche à zéro** et une **face droite à 1** (par exemple), puisqu'il rend une valeur.
   - Il **n'est utilisé que par le domino main expansé**. Il s'affiche donc **dans le sous-jeu, parmi les dominos libres**.
   - Un **raccourci** de ce domino s'affiche **collé horizontalement** au domino qui l'appelle, **avec une taille plus petite** que la pierre réelle.
2. **Trois dominos de type variable.** Ils n'ont **pas d'entrée** et **pas de sortie** : ils affichent **zéro à gauche et zéro à droite**.
   - Quand un domino les **appelle**, ils s'affichent **avec une sortie à 1**, car ils rendent une valeur.
   - Leur **taille s'adapte** pour qu'ils soient **collés en haut** du domino qui les appelle.
3. **Une fonction qui accepte deux paramètres mais ne rend rien.**
   - Elle peut être représentée par un domino qui « fait des sorties ».
   - Elle s'affiche **en bas** du domino qui l'appelle.

> Ces exemples viennent d'un seul domaine d'utilisation. Le module ne doit pas s'y limiter : il doit aller plus loin du côté de la flexibilité.

### A.11 Ce qui est demandé

1. **Analyser** l'idée et la **documenter** dans un document Markdown qui contient exactement ce qui a été écrit *(ce document)*.
2. Réaliser un **design complet et professionnel**, ainsi qu'un **design system**.
3. Réaliser **une ou plusieurs démos** de l'éditeur (le workspace).
4. **Ne rien développer dans le cœur du projet.**

### A.12 Compléments (second message)

Le second message précise et corrige plusieurs points, après avoir vu la première démo.

1. **Pierres secondaires.** Les dominos secondaires (adjacents ou dérivés d'un domino) s'affichent **en plus petit** et se **collent en haut ou en bas** selon leur type, comme expliqué en A.10.
2. **Disposition.** Les dominos **liés** s'affichent **horizontalement**. Si, parmi les dominos secondaires affichés horizontalement, certains ont **d'autres connexions**, celles-ci s'affichent **verticalement** par rapport au domino principal.
3. **Un domino s'affiche comme un domino.** Dans la démo, il ne doit **rien y avoir au milieu** de la pierre. Le **nom** du domino s'affiche **comme entête** du domino.
4. **Couleur de chaque point.** Les couleurs des points de chaque extrémité **correspondent à l'identifiant du bloc** ou du domino ; dans la première démo, ils étaient tous noirs. Exemple : une pierre **3:2** a, par défaut, **3 points noirs à gauche** et **2 points noirs à droite**. La personne qui utilise le module pour **construire les dominos ou les blocs** peut définir **la couleur de chacun des 3 points de gauche** et **de chacun des points de droite**.
5. **Conteneurs.** Un domino peut être une **classe**, un **service** ou un **module** qui contient **plusieurs sous-dominos**. L'utilisateur peut **déplier ce composant dans un nouvel onglet**.
6. **Connexions configurables.** La **connexion entre deux dominos** doit être **configurable** et **accessible** par un **clic droit** sur un domino, puis l'option **« Connexion suivante »** ou **« Connexion précédente »**.
7. **La popup est un grand domino.** Elle affiche le **côté droit** et le **côté gauche**, ainsi que le **côté bas** et le **côté haut** s'il y en a, **proprement, comme de vrais dominos**. L'utilisateur **choisit le domino** qu'il veut, pour le **zoomer**, l'**afficher** ou le **modifier**.
8. **Consigne.** Garder **ce qui améliore**, écarter **ce qui est contradictoire ou incohérent**, et **développer à partir du souhait** de faire des choses « **magiques** ».

### A.13 Compléments (troisième message)

Le troisième message demande de continuer et ajoute trois points.

1. **Couleur des faces.** On doit pouvoir **définir la couleur de la partie gauche** du domino et **de la partie droite**, ainsi que **la couleur des points dans chaque partie**.
2. **Quatre types de connexion.** Dans le workflow, il y a **4 types de connexion** : **à droite**, **à gauche**, **en bas** et **en haut**. Les connexions **en haut et en bas** s'affichent **verticalement** avec le domino principal, et **en petite taille**.
3. **Virages, comme dans un vrai jeu.** Puisque ce sont des dominos, on veut pouvoir, **à un endroit**, par exemple **à la 5ᵉ pierre**, décider que les dominos qui suivent à droite **changent de sens**, **vers le bas ou vers le haut**. Si un domino de la suite qui descend **tourne**, les dominos qui le suivent changent de sens, **à droite ou à gauche**, **comme dans un vrai jeu de dominos**.

### A.14 Compléments (quatrième message)

En réponse aux deux questions sur les collisions et le serpentin : il faut des **règles qui assurent la non-collision** des dominos, et donc un **serpentin automatique**.

### A.15 Compléments (sixième message)

- Relire les messages et faire les bons choix. **En cas de confusion, choisir la flexibilité.**
- Ne pas oublier qu'il s'agit **avant tout d'un framework**, utilisable dans des domaines et de manières différents.
- Ce sont **l'instanciation du module, la configuration, et les besoins fonctionnels ou techniques** qui définissent les résultats.
- Ce qui est affiché (les démos) sont des **exemples qui peuvent être générés** par le module ou framework Domino.
- Garder la **flexibilité** et l'**extensibilité**, et prendre les choix qui vont dans ce sens.

### A.16 Compléments (septième message)

- Le design est jugé parfait. En revanche, **connecter une adjacente est compliqué** : elle s'affiche avec une connexion marron, et parfois trop loin.
- **Toucher le moteur** et l'adapter correctement. Prendre Blockly comme un concurrent à **dépasser**, et prendre cette motivation au sérieux.
- Le moteur doit avoir :
  - une **architecture propre** ;
  - une **génération JSON pour chaque domino ou bloc** ;
  - un **contrôle de la signification** du nombre de points à droite et à gauche ;
  - la **couleur de chaque point comme type de connexion**, ou des connexions permises ;
  - **zéro point** qui signifie quelque chose, à gauche comme à droite ;
  - un **contexte et un système de liaison** (binding) propres au framework ;
  - une **qualité extrême**, de l'**accessibilité** et une architecture soignée ;
  - une **abstraction flexible** et une manière de coder **extrêmement extensible** ;
  - une **représentation JSON impeccable**, qui permettra aux utilisateurs du framework d'écrire ensuite la partie génération.
- **Chaque bloc a tous les événements et callbacks**, pour que le développeur qui construit le domino y accède et y ajoute ses instructions, comme avec Blockly.
- Les connexions doivent être **plus fluides** dans l'espace de travail : glisser-déposer, et connexion à la souris **comme entre des nœuds, mais en dominos**.
- Les **connexions adjacentes** (en haut et en bas) doivent être des **petits dominos collés en haut ou en bas du domino parent, à 90°**. S'il y en a plusieurs, **leur taille diminue** pour qu'ils restent tous collés.
  - Le **haut** est la partie haute du domino horizontal ; si le domino est vertical, c'est **la partie droite**.
  - Domino horizontal : l'entrée est à gauche, la sortie à droite, l'adjacente haute en haut, la basse en bas.
  - **Ces proportions ne changent pas** quand la suite change de direction ; le design s'adapte.
- **Recréer les démos** : créer les dominos, puis un scénario, et voir les soucis qui empêchent de les faire.
  - Un **éditeur visuel de conception d'API**, avec une démo simple : 3 middlewares et des composants de type bibliothèque.
  - Un **éditeur de workflow** avec un scénario qui dépend de deux autres scénarios, rangés dans un autre composant appelé par un domino.
  - Un **éditeur de circuit** simple, avec une logique d'au plus 9 niveaux jusqu'à la fin, avec des composants OU, NON…
  - Pas de vrais éditeurs : des démos, d'**au plus 30 dominos** chacune, avec des scénarios simples.
- Un **inspecteur** semblable à l'inspecteur d'éléments de Chrome :
  - il s'agrandit ou se réduit ;
  - il a de nombreux onglets (logs, inspection, autres informations utiles) ;
  - il sert à chaque éditeur : ceux de la démo, ceux pas encore réalisés, ceux propres à une entreprise ou à un établissement.
- Prendre la meilleure décision en cas d'ambiguïté, sans s'arrêter, jusqu'à la fin du travail.

---

### A.17 Compléments (neuvième message)

- Le visuel et les détails (animations, forme des dominos) plaisent : **les garder**.
- Mais l'intérêt principal n'est pas dans les démos : c'est **un module utilisable dans n'importe quel éditeur**, qui profite du concept du jeu de dominos pour la liaison des blocs propres à cet éditeur.
- Le **chiffre à gauche et à droite** est une **logique prédéfinie par le développeur** du bloc ; trouver une **logique des connexions à gauche** et une **logique des connexions à droite**.
- Depuis ce module : définir les **connexions adjacentes** du haut et du bas, une **logique et une signification**, des **événements, des règles ou autre** pour chaque domino.
- La **couleur de chaque façade** peut aussi être prédéfinie et signifier quelque chose dans chaque éditeur qui utilise le module, à l'instanciation et à l'adaptation du module.
- Un domino peut **représenter une bibliothèque ou un autre projet réalisé**, réutilisé dans un autre projet : il s'affiche par un domino à deux façades.
- Ou une **classe** qui exige des **paramètres pour l'instancier** : la **déclarer dans une section** avec un domino, et l'utiliser avec le concept de domino **comme instance** ; **appeler une fonction publique**, partagée par un **point d'une couleur spécifique**.
- En plus de connecter deux dominos :
  - **connecter un point de sortie à un point d'entrée** d'un domino, par une **ligne qui prend la couleur des deux points** reliés ;
  - connecter le point de sortie d'un **domino libre** à l'entrée d'un domino ;
  - connecter un domino à un domino libre, en **asynchrone ou synchrone selon le domino appelé**, et **définir si l'appel est bloquant ou non**.
- Ces dominos libres sont des **classes ou des bibliothèques** ; on peut **les ouvrir dans un autre onglet** pour voir leurs dominos.
- Le but : **construire un monde** où l'on peut construire un **langage visuel** ; une plateforme, un framework ou un module **riche, basé sur le concept de domino**, pour construire des **éditeurs de langages visuels**, des **outils d'automatisation**, ou une **solution de logique** flexible, forte, manipulable, de haute qualité, pour **n'importe quel éditeur**. Blockly est un exemple ; le but est plus puissant.
- **Repartir de nouveau**, casser toutes les frontières, changer tout ce qui ne va pas avec ce concept ; toutes les décisions sont permises ; ne pas s'arrêter avant d'avoir terminé.

### A.18 Compléments (dixième message)

- **Aller plus loin** : que le projet soit un module, un framework ou un concept qui expose quelque chose de formidable et de configurable, pour que d'autres construisent des éditeurs, **même des jeux**, des langages visuels, des choses fascinantes **et même des choses qui ne le sont pas**.
- Une base capable de **représenter un détail, une théorie complexe, un mécanisme ou une philosophie** par des pierres de domino.
- D'où l'insistance : **un domino peut être une variable comme une classe, une ligne de code comme un module, un projet, un scénario, un workflow complexe ou un algorithme**, qu'on peut **consulter dans un autre onglet**. L'éditeur doit pouvoir servir à **construire n'importe quoi**.
- Les exemples de l'éditeur de programmation viennent d'un regard de développeur ; le framework, lui, doit avoir une **flexibilité énorme**, utilisable dans **tous les domaines et tous les éditeurs visuels**, et permettre d'exposer un **éditeur spécial, voire unique, à chaque besoin**.
- Faire mieux que Blockly : **plus fort, plus configurable, plus puissant, plus fluide, plus joli, plus riche, plus extensible, plus présentable, plus avancé, plus gérable**. Blockly permet de construire des blocs avec des options, des configurations, un contexte, des callbacks, des événements, des autorisations, un générateur par bloc, différents types de blocs et d'événements.
- Le framework doit **générer du JSON**, avec une **diversité énorme** et un **contrôle qui dépasse Blockly** : un JSON **clair et manipulable** par le créateur de chaque bloc, avec **toute l'information du contexte de chaque création**, clair pour la partie génération.
- **Ne pas faire la partie génération** : seulement un **mécanisme parfait**, un **traçage parfait**, une **modélisation parfaite**, une **définition parfaite** pour chaque élément : domino, projet, appel.

### A.19 Compléments (onzième message)

- **Faire appel à un agent expert** de la conception de projets et des IHM, pour que le module ait une **flexibilité énorme**.
- Pouvoir **réaliser des générateurs de langages de programmation**, construire des **blocs différents**.
- Un **éditeur riche**, avec **plusieurs types d'affichage** des dominos.
- **Ouvrir deux onglets côte à côte**, **dupliquer**, **choisir la taille des volets**, afficher côte à côte.
- Une **grande qualité de code et de documentation**.
- **Chaque domino représenté par un JSON** qui respecte une **abstraction hautement professionnelle et extensible**.
- Un **menu Fichier** en haut : Nouveau projet, Nouveau ▸ (un sous-menu vers les autres types de projets), Ouvrir un projet… et **toutes les options d'un vrai éditeur**.
- **Enregistrer un projet dans le localStorage**, et prévoir de l'enregistrer **plus tard dans des API définies dans un fichier de configuration**, comme un vrai éditeur qui contient le travail : **l'espace de travail**.
- Toujours **choisir la méthode recommandée** et décider sans revenir vers l'utilisateur jusqu'à la fin.

### A.20 Compléments (douzième message)

- **Un quiz de 20 questions** de genres différents :
  - choix unique ;
  - un nombre entre n et y ;
  - plusieurs réponses ;
  - exactement i réponses ;
  - une réponse à choisir selon le choix d'une réponse précédente ;
  - des choix **rendus par une classe** : une fonction d'une classe, présentée par un domino, qui rend des résultats en JSON, appelée par le domino « liste des choix » ;
  - d'autres questions ou étapes, avec d'autres genres de réponse.
- **Cinq sous-chemins** définis dans un domino **switch / case** qui, selon une condition ou une réponse, passe au chemin approprié.
- **Un domino qui mène à un autre domino du workflow** : une question précédente, ou plus loin en sautant des questions, jusqu'à un domino précis.
- **À partir de ce quiz**, construire les blocs nécessaires à cet éditeur, et **améliorer le cœur** pour qu'il sache le construire : redéfinir ou ajouter des genres de connexion, des formats, de nouvelles fonctionnalités.
- Livrer un **éditeur de quiz** avec une IHM, facile à utiliser, puissant.
- Le but : un module **plus fort, plus extensible**, qui sert à construire des **éditeurs très compliqués** et leurs éléments, blocs et liens, comme un **vrai framework** de haute qualité et de grande flexibilité, pour **toute sorte de modèle, d'architecture, de logique ou d'automatisation**. **Créer un excellent framework par ce quiz.**

### A.21 Compléments (treizième message)

- Reprendre le travail en **invoquant les meilleurs concepteurs**.
- Que cet outil **remplace tous les autres** : qu'il expose une **logique de génie**, quelque chose d'**unique** et de **flexible**.
- **Une solution unique et performante pour créer tous les types d'éditeurs.**

### A.22 Compléments (quatorzième message)

- **Aucun lien externe ni CDN** dans le projet : les bibliothèques externes viennent de **npm**.
- **Sélection multiple** : Ctrl + clic ; ou Ctrl + clic droit en glissant la souris pour tracer une sélection. **Ctrl distingue la sélection du déplacement** dans l'éditeur.
- Des **gabarits centralisés** côté code, faciles à modifier.
- Une **boîte à outils** qu'on peut **réduire** (seulement les dominos) ou afficher en entier, **par catégories** ; chaque catégorie peut être **présentée par un domino** ; des **sous-catégories** qu'on déplie et replie.
- Un **menu dynamique décrit en JSON** : catégories, sous-catégories, éléments, textes, titres, descriptions, aide, liens s'il y en a.
- Un **build** de l'éditeur dans `dist/`, avec les démos et tout le reste.
- Une **qualité de code extrême**, et surtout la **séparation en modules et composants**.

### A.23 Compléments (quinzième message)

- Partir du répertoire `postmanFile` (une collection Postman et son environnement).
- Un éditeur **au concept de Postman**, pour **visualiser et créer des scénarios de TNR**.
- Des **journaux utiles au testeur**, un **visuel qui présente le scénario**, un **tableau de bord** dont la boîte à outils montre la collection, ses sous-collections et ses API.
- Des **dominos de passage de contenu**, des **scripts automatisés** par les pierres : partager ou modifier une variable d'environnement.
- **Importer** les JSON exportés par Postman, **exporter** des automatisations que Postman accepte.
- Un **exemple** qui couvre les API et les variables d'environnement.
- Améliorer le **cœur** et le **concept** sans hésiter, pour réaliser ce genre d'éditeur « et même plus » ; trouver **la meilleure façon d'afficher ou de créer une simple pierre** dans un éditeur visuel complexe : un **patron**.

## Partie B : analyse et décisions de design

> Cette partie ne modifie pas l'idée. Elle la précise pour pouvoir la dessiner. Chaque interprétation est signalée et peut être remise en question.

### B.0 Principe directeur : un framework, des éditeurs (A.1, A.15)

Zeugma est **d'abord un framework**. Le moteur ne connaît aucun domaine : ni le code, ni les workflows, ni les circuits. Tout ce qui est propre à un domaine vient de l'**instanciation** :

```text
besoins fonctionnels et techniques  →  configuration  →  moteur Domino  →  éditeur
(quelles pierres, quelles règles,      (categories, dominos,   (poser, aimanter,     (low-code, workflow,
 quel écran, quelle exécution)          rules, table, links,    vérifier, mettre en   circuit, scénario,
                                        theme, locale + code)   page, animer)         dashboard, recette…)
```

Conséquences pour le design :

1. **Les démos sont des exemples, pas des limites.** Chaque domaine du studio est produit par une configuration publique ; le panneau **Configuration** du studio la montre, la laisse modifier et régénère l'éditeur. Un sixième domaine, **Recette** (une tarte aux pommes), n'existe que sous forme de configuration : rien dans le moteur ne parle de cuisine.
2. **Règle de décision.** Quand l'idée laisse un choix ouvert, ou que deux demandes semblent se contredire, on ne tranche pas à la place du développeur : le choix devient une **option**, et sa **valeur par défaut** suit l'idée d'origine (tableau de B.7).
3. **Ce que la configuration ne peut pas dire passe par des points d'extension** : règles personnalisées, mise en page, dessin des pierres, natures de conteneurs, événements, vocabulaire (B.6).
4. **Le vocabulaire du jeu (B.1) est le vocabulaire par défaut**, lui aussi remplaçable (`locale`) : un domaine peut parler de « nœud », de « scène » ou d'« étape ».

### B.1 Vocabulaire proposé

Le vocabulaire du jeu de dominos sert de langage commun à la bibliothèque. Il est utilisé dans le design system et dans la démo.

| Terme | Sens dans la bibliothèque | Équivalent Blockly / nœuds |
|---|---|---|
| **Pierre** (domino) | Un bloc. L'unité de base. | Block / Node |
| **Face d'entrée** (gauche) | Nombre de paramètres acceptés, affiché en points. | Previous connection / inputs |
| **Face de sortie** (droite) | Nombre de sorties, affiché en points. | Next connection / outputs |
| **Bande de connecteurs** | Petits traits colorés à une extrémité, un par couleur ou catégorie acceptée. | Check / type |
| **Ligne médiane** et **pivot** | La séparation entre les deux faces, avec le pivot en laiton des vrais dominos. | |
| **Entête** | Le nom de la pierre, affiché au-dessus d'elle. Rien n'est écrit sur la pierre. | Label |
| **Point** | Une entrée (face gauche) ou une sortie (face droite). Noir par défaut ; sa couleur, fixée par le développeur, identifie le paramètre ou le bloc. | Input / output port |
| **Couleur d'identité** | Couleur du point affiché par le raccourci d'une pierre 0 \| 0 (variable, paramètre). | Variable color |
| **Pierre libre** | Pierre dont la face d'entrée est à 0. Elle ne se colle après rien. | Top-level block / hat block |
| **Pierre terminale** | Pierre dont la face de sortie est à 0. Rien ne peut la suivre. | Terminal block |
| **Pierre conteneur** | Pierre qui contient une **sous-partie**. Gris clair par défaut. | Function / group / subflow |
| **Partie** | Un plateau de jeu, c'est-à-dire un espace de travail. La partie principale est le projet. | Workspace |
| **Sous-partie** | Le contenu d'une pierre conteneur, ouvert dans un onglet. | Subgraph |
| **Dominos libres** | Zone d'une sous-partie qui regroupe les pierres libres qu'elle utilise. | Flyout / local definitions |
| **Pierre secondaire** (raccourci) | Copie réduite (0,47 H) d'une pierre libre, collée par une **tige** en laiton à la pierre qui l'appelle : en haut pour une source, en bas pour une fonction sans retour. | Reference / shadow block |
| **Colonne verticale** | Les connexions propres d'une pierre secondaire, empilées à la verticale, en s'éloignant de la chaîne. | Nested reference |
| **Joint** | Le petit rivet en laiton entre deux pierres collées. Il représente la **connexion** et l'ouvre au clic. | Edge / link |
| **Connexion** | Le lien entre la sortie *k* de A et une ou plusieurs entrées de B, avec un libellé, une condition et un interrupteur. | Edge / wire |
| **Effet domino** | L'aperçu d'exécution : les pierres tombent une à une, depuis les pierres de départ. | Run / execute |
| **Couleur de face** | Couleur d'une moitié de la pierre : face gauche (entrées) ou face droite (sorties). Blanche par défaut. | Node color |
| **Sens** | La direction dans laquelle avance une chaîne : vers la droite (défaut), le bas, la gauche ou le haut. | Layout direction |
| **Virage** | Changement de sens d'un quart de tour, décidé sur une pierre : toutes les pierres qui la suivent prennent le nouveau sens. | Bend / elbow |
| **Pierre du coin** | La première pierre après un virage, posée en travers, sa face d'entrée contre la sortie de la précédente. | |
| **Bord de la table** | Largeur maximale d'une rangée (`table.width`). Au-delà, la chaîne fait un serpentin. | Layout width |
| **Serpentin** | Virage automatique au bord de la table : la chaîne descend d'une pierre du coin et repart dans l'autre sens. | Wrap / snake layout |
| **Évitement** | Virage automatique avant de toucher une pierre déjà posée. | Collision avoidance |
| **Pierre retournée** | Pierre d'une chaîne qui file vers la gauche ou vers le haut : son entrée est à droite ou en bas. | Flipped node |
| **Pioche** | La palette des pierres disponibles. | Toolbox |
| **Plateau** | La surface infinie où l'on pose les pierres (zoom et déplacement). | Canvas |

### B.2 Règles d'assemblage formalisées

Une pierre `B` peut être collée **après** une pierre `A` (sortie de `A` vers entrée de `B`) si et seulement si toutes ces conditions sont vraies :

1. `A.sorties > 0` : une face droite à 0 scelle la pierre.
2. `B.entrées > 0` : une face gauche à 0 fait de `B` une pierre libre.
3. `A` a encore une **sortie libre**. Une pierre à `n` sorties accepte au plus `n` pierres à sa droite, appelées branches.
4. **Couleurs** : `A.couleursSortie ∩ B.couleursEntrée ≠ ∅`. Une liste vide signifie « toutes les couleurs ».
5. **Catégories** (comme Blockly) : la catégorie de `B` fait partie des catégories que `A` autorise à la suivre, et la catégorie de `A` fait partie de celles que `B` autorise à la précéder.

```text
peutColler(A, B) =
     A.sorties > 0
  && B.entrées > 0
  && sortieLibre(A)
  && intersection(A.couleursSortie, B.couleursEntrée)
  && autorise(A.peutÊtreSuiviePar, B.catégorie)
  && autorise(B.peutSuivre, A.catégorie)
```

Quand une règle refuse l'assemblage, l'éditeur l'**explique** au moment du glisser (anneau rouge et message) au lieu d'échouer en silence.

#### Règles de non-collision (A.14)

Elles s'appliquent dans cet ordre, à chaque pose de pierre :

1. **Aucun chevauchement.** Chaque pierre occupe sa boîte : la pierre, son épaisseur, son entête et ses secondaires. Deux boîtes ne se touchent jamais ; un joint ou un rail les sépare.
2. **Serpentin au bord de la table.** Quand la pierre suivante, plus la place d'une pierre du coin, dépasserait le bord de la table, la chaîne tourne vers le bas, pose une pierre du coin, puis repart dans l'autre sens, sous toute la rangée précédente.
3. **Évitement.** Si la pierre suivante toucherait une pierre déjà posée, la chaîne tourne avant le contact (d'abord vers le bas, puis vers le haut) et reprend son sens après la pierre du coin.
4. **Le choix de l'utilisateur passe en premier, sauf collision.** Un virage choisi à la main est respecté. S'il touche une pierre, la chaîne contourne et la popup le signale. S'il enferme la chaîne plus loin (aucun sens libre), il est **refusé**, avec une phrase qui nomme la pierre en cause.
5. **Une chaîne lâchée sur une autre glisse** vers le bas jusqu'à la première place libre ; c'est toujours la chaîne déplacée en dernier qui bouge. Les branches se posent là où c'est libre ; les dominos libres remontent si une chaîne entre dans leur zone.
6. **Le demi-tour est interdit.**
7. **Les fils contournent les pierres.** Le fil d'une branche ne passe jamais sous une pierre : il suit les couloirs entre les rangées, à angles droits arrondis, par le chemin le plus court qui a le moins de coudes. À droite d'une colonne, une branche qui passerait le bord de la table se pose dessous.

```text
sensSuivant(n) =
     virageManuel(n)          si sa place est libre
  ou serpentin(n)             si la pierre suivante dépasse le bord de la table
  ou tout droit               si sa place est libre
  ou évitement(bas, haut)     sinon
  refus du virage manuel      si plus loin aucun sens n'est libre
```

### B.3 Affichage des faces

| Valeur configurée | Affichage de la face |
|---|---|
| 0 | Face vierge, sans bande de connecteurs (face scellée) |
| 1 à 6 | Disposition classique des points du domino |
| 7 et plus | **9 points** (la grille 3 × 3 complète). La valeur exacte est visible dans la DominoPopup et dans l'info-bulle. |

Chaque point a un **indice** : son rang dans l'ordre de lecture, de gauche à droite puis de haut en bas. Le point *i* de la face gauche correspond à l'entrée *i* ; le point *i* de la face droite à la sortie *i*. Sa couleur est fixée par le développeur (`pips: [{ name, color }]`) ; sans couleur, il est noir sur une pierre ivoire et ivoire sur une pierre ébène. Au-delà de 9 entrées, les entrées suivantes existent mais n'ont pas de point visible.

Chaque face a aussi sa **couleur de face** (`faces: { left, right }`), indépendante de la couleur des points. Un point sans couleur reste lisible sur toutes les faces : il est noir sur une face claire et ivoire sur une face sombre, choisi au contraste. L'épaisseur visible de la pierre prend une teinte plus sombre de chaque face.

### B.4 Interprétations retenues pour le design

| Point de l'idée | Interprétation retenue | Pourquoi |
|---|---|---|
| « Parfaitement comme les vrais dominos » + besoin de lire le nom | **Domino pur (2:1)** et **nom en entête**, au-dessus de la pierre. L'ancien style « plaque » (nom au milieu) est **supprimé** (A.12.3). Le développeur peut masquer les entêtes (`showNames: false`). | Le second message tranche : rien au milieu, le nom comme entête. |
| Couleur des points (A.4 et A.12.4) | **Deux informations distinctes et complémentaires.** Les **bandes de traits** `(-)` disent **ce qui peut se coller** (catégories acceptées). La **couleur de chaque point** dit **qui est qui** : l'identifiant du paramètre, de la sortie ou du bloc. | Les deux demandes sont gardées sans se contredire. |
| « Les couleurs correspondent à l'identifiant du bloc » | Le point garde la couleur de son paramètre partout : sur la pierre, sur ses raccourcis, dans la popup et sur le fil de l'éditeur de connexion. Quand deux points reliés ont des couleurs différentes, l'éditeur de connexion le **signale** (avertissement, pas un refus). | Rend la couleur utile sans bloquer l'utilisateur. |
| Secondaires « en haut ou en bas selon leur type » | **En haut** : les sources (elles rendent une valeur). **En bas** : les fonctions qui reçoivent sans rien rendre. Une **tige en laiton** relie la secondaire à la pierre ; l'entête de la pierre passe par-dessus. | Regroupe les exemples de A.10 en une seule règle. |
| « Si les secondaires ont d'autres connexions, verticalement » (A.12.2) | Les pierres appelées **par une secondaire** forment une **colonne verticale** de pierres debout (orientation verticale : face d'entrée en haut, face de sortie en bas), qui part **vers le haut** pour une secondaire du haut et **vers le bas** pour une secondaire du bas. Exemple : la graine du générateur aléatoire, la console appelée par « Journaliser ». | L'horizontale reste réservée aux pierres liées ; la verticale signale une dépendance de second rang, comme une partie de dominos qui tourne d'un quart de tour. |
| Classe, service, module (A.12.5) | Une **pierre conteneur** a une **nature** (Fonction, Classe, Service, Module, Séquence, Boucle). L'entête porte un pictogramme de pile, l'onglet affiche « Classe › Classe Dé ». « Ouvrir la partie » fait **plonger la caméra** dans la pierre avant d'ouvrir l'onglet. | La nature aide à lire le projet ; la plongée rend l'ouverture « magique » et compréhensible. |
| Connexion précédente / suivante (A.12.6) | Le menu contextuel propose **« Connexion précédente… »** et **une ligne « Connexion suivante → X » par sortie occupée**. Un clic sur un **joint** ouvre le même éditeur. L'éditeur montre la face droite de A et la face gauche de B en grand, avec des **fils** entre les points : on choisit la sortie de A, on câble ou décâble les entrées de B, on ajoute un libellé, une condition, et on peut désactiver la connexion. | Rend la connexion visible, réglable et navigable (précédente / suivante). |
| Popup comme un grand domino (A.12.7) | La DominoPopup a la forme d'une grande pierre : **à gauche la table**, **à droite la fiche**, séparées par une ligne de partage et un pivot en laiton. Sur la table, la pierre est au centre, en grand ; **à gauche** la précédente, **à droite** les suivantes, **en haut** et **en bas** les secondaires et les pierres sur lesquelles elle est collée. Un clic sur une voisine la **prend en main** : la caméra glisse et la grossit. Un clic sur un point ouvre son réglage (nom, couleur). | Choisir, zoomer, afficher et modifier depuis la même vue, comme sur une vraie table. |
| « Trucs magiques » (A.12.8) | **Effet domino** : les pierres tombent rang par rang (300 ms), les joints traversés passent au vert, la chute s'arrête sur une erreur ou une connexion désactivée. **Plongée** dans les conteneurs. **Prise en main** animée dans la popup. | Des effets qui expliquent le projet au lieu de seulement le décorer. |
| Couleur de la partie gauche et de la partie droite (A.13.1) | Chaque face a sa **couleur de face**, réglée par le développeur (`faces`) ou par l'utilisateur dans la DominoPopup : onglet « Faces et points », onglet « Apparence », ou **clic sur la moitié** de la grande pierre. La couleur des points reste réglable point par point (clic sur le point). | Les deux niveaux demandés (face, point) restent indépendants. |
| Quatre types de connexion (A.13.2) | Une pierre a **quatre côtés de connexion**. **À droite** et **à gauche** : la chaîne (la suivante et la précédente, dans le sens de la chaîne). **En haut** et **en bas** : les secondaires, en petite taille, tenues par une tige, à angle droit avec la chaîne. Quand la chaîne devient verticale, les secondaires passent sur les côtés (sources à gauche, fonctions sans retour à droite) : elles restent perpendiculaires à la chaîne. | Le principe « secondaires à angle droit » tient dans tous les sens de chaîne. |
| Virages (A.13.3) | Chaque pierre peut fixer le **sens de la suite** : vers le bas ou le haut dans une rangée, vers la droite ou la gauche dans une colonne. Le virage s'applique à la sortie principale ; les pierres qui suivent gardent ce sens jusqu'au prochain virage. La **pierre du coin** se pose en travers, sa face d'entrée contre la sortie de la précédente ; une pierre qui file vers la gauche ou le haut est **retournée**. Une **pastille laiton** (↓ ↑ ← →) marque chaque virage. On décide par clic droit (« Tourner la suite… »), <kbd>Alt</kbd> + flèche, la pastille, ou le pavé « Sens de la suite » de la popup. | Reproduit la table de jeu réelle : la ligne de dominos tourne pour tenir sur la table. |
| Virage « magique » | Au changement de sens, les pierres concernées **pivotent depuis leur ancien sens et glissent** une à une vers leur nouvelle place ; joints et secondaires réapparaissent ensuite. L'effet domino suit la chaîne dans ses virages. | Rend visible ce qui a changé, et pourquoi. |
| Non-collision et serpentin (A.14) | Les règles ci-dessus (B.2) sont appliquées à chaque pose, pendant la mise en page. Le serpentin est **actif par défaut** ; la largeur de la table se règle dans les options (et `table: { width, serpentine }`). En la changeant, les chaînes se réarrangent en direct : les pierres pivotent et glissent. Une ligne pointillée « bord de la table » apparaît là où la chaîne a tourné. Pastille **pleine** : virage choisi à la main ; **pointillée** : virage automatique. Le pavé « Sens de la suite » gagne un bouton **auto** (la table décide) ; <kbd>Alt</kbd> + 0 fait de même. | La demande « règles de non-collision, donc serpentin » devient une règle de mise en page, pas une contrainte pour l'utilisateur. |
| Largeur de la table (B.7 n° 9, après le cinquième message) | Deux modes : **fixe** (défaut, 1 150 unités, réglable), pour que le projet ait la même forme chez tout le monde ; ou **liée à l'écran** (`table: { width: 'screen' }`) : la largeur suit le plateau à 100 %, et la chaîne se réarrange, en pivotant, quand la fenêtre change. | Les deux usages sont légitimes ; le développeur choisit, l'utilisateur peut basculer dans les options. |
| Fils de branche (B.7 n° 10, après le cinquième message) | Le fil **contourne** les pierres (règle 7) au lieu de passer dessous. | Un fil caché sous une rangée se lit comme une fausse connexion. |
| Chaîne qui monte dans la zone des dominos libres | La zone **remonte d'elle-même** pour laisser la place, et la vue s'ajuste si la chaîne sort de l'écran. | Évite les chevauchements créés par un virage vers le haut. |
| Nom de l'option « éditer le projet » | **« Ouvrir la partie »** | Cohérent avec le vocabulaire du jeu (partie, sous-partie). |
| Largeur des petits traits `(-)` | Les traits s'empilent par colonne de 4. Chaque nouvelle colonne **élargit** la bande vers l'intérieur. | Respecte « la largeur selon le nombre de couleurs » sans masquer les points. |
| Les traits au point de jonction | Les traits dépassent légèrement du bord. Quand deux pierres sont collées, leurs bandes se font face dans le joint. | On voit d'un coup d'œil que les couleurs correspondent. |
| Raccourci « collé horizontalement » | La secondaire reste **horizontale** (comme une vraie pierre) et se colle contre un **bord horizontal** de la pierre appelante. | Conforme à A.10. |
| Variable 0/0 appelée | Le raccourci affiche **0 / 1** : une sortie, car elle rend sa valeur. Ce point prend la **couleur d'identité** de la variable. | Conforme à A.10 et A.12.4. |
| Fonction 2 paramètres sans retour, appelée | Le raccourci affiche **2 / 0**, collé **en bas**. | « Présentée par un domino qui fait des sorties » : la pierre appelante lui envoie ses valeurs. À valider (voir B.7). |
| Plusieurs sorties | Chaque sortie supplémentaire ouvre une **branche** sous la première, reliée par un rail en laiton. Les branches restent des pierres liées, donc horizontales. | Permet les conditions (si / sinon), les choix de scénario et les embranchements de workflow. |
| Domino conteneur | Gris clair, avec une **pierre en retrait** visible derrière, qui indique qu'elle « contient » quelque chose. | Signal visible même sans la couleur (accessibilité). |
| DominoPopup | Animation qui **part du rectangle exact de la pierre** et s'agrandit jusqu'au centre, puis revient à la pierre en se fermant. | « S'agrandit à partir de ce domino ». |
| Rangement initial | Les dominos libres se rangent en haut ; les chaînes se placent **côte à côte sur des étagères**. Les rangées d'une chaîne s'écartent assez pour laisser place aux secondaires et à leurs colonnes. | Une partie lisible dès l'ouverture, sans chevauchement. |

**Écarté ou arbitré.** Le style « plaque » est retiré : il contredit « rien au milieu ». Les branches de sorties multiples suivent le sens de leur chaîne : sous une rangée, à droite d'une colonne. Les connexions des secondaires restent à angle droit avec la chaîne. Le **demi-tour** est refusé : une chaîne ne revient jamais sur elle-même, comme sur une vraie table. Un virage s'applique à la sortie principale ; les autres sorties gardent le sens de la pierre. Aucune demande n'a été ignorée.

### B.5 Un même moteur pour plusieurs domaines

La démo montre le même éditeur, configuré différemment, dans cinq domaines :

| Domaine | Exemple de partie | Pierre conteneur | Couleurs (catégories) |
|---|---|---|---|
| **Low-code** | Lancer de dés | Calculer le score | Flux, Nombre, Texte, Booléen, Liste |
| **Workflow / automatisation** | Nouveau lead vers CRM | Enrichir le lead | Événement, Données, Action, Erreur |
| **Circuit électronique** | Clignotant LED | Oscillateur NE555 | Alimentation, Masse, Signal, Analogique, Bus I²C |
| **Scénario** | Le phare abandonné | Fouiller la cave | Scène, Choix, Condition, État |
| **Dashboard** | Ventes T3 2026 | Nettoyer les données | Source, Table, Mesure, Visuel |
| **Recette** (configuration seule) | Tarte aux pommes | — | Geste, Ingrédient, Cuisson, Plat |

Ces six domaines sont **six configurations** du même moteur (B.0). Dans le studio, « Configuration » affiche celle du domaine courant ; la régénérer redonne exactement le même éditeur (vérifié pour les cinq domaines intégrés).

D'autres usages envisagés : remplacement d'éditeurs de nœuds (shaders, audio, ETL), pipelines d'IA, parcours de formation, arbres de dialogue, règles métier, domotique.

### B.6 Esquisse de l'API d'instanciation (documentation, pas d'implémentation)

```js
const editor = DominoEditor.create('#studio', {
  // Apparence
  skin: 'ivoire',              // 'ivoire' (défaut, vrais dominos) | 'ebene' | 'teinte'
  showNames: true,             // nom en entête, au-dessus de la pierre ; rien sur la pierre
  containerColor: '#E1E4E6',   // gris clair par défaut
  grid: true,
  snapDistance: 44,            // en pixels écran
  table: { width: 1150, serpentine: true },   // 1150 | 'screen' ; jamais de chevauchement (B.2)

  // Choix ouverts devenus options (B.7) : chaque valeur est le défaut
  links: { route: 'around' },                // 'around' | 'straight'
  pips: { overflow: 'nine' },                // au-delà de 6 : 'nine' | 'engrave'
  shortcuts: { face: 'real' },               // raccourci du bas : 'real' (2 | 0) | 'call'
  docks: { sources: 'top', sinks: 'bottom', maxDepth: 3 },
  inputs: { merge: 'chain' },                // 'chain' | 'converge'
  doubles: 'plain',                          // 'plain' | 'across' | 'spinner'
  turns: 'free',                             // 'free' | 'off' | (pierre) => sens
  rules: {
    pipColor: 'warn',                        // 'ignore' | 'warn' | 'refuse'
    custom: [(a, b) => (a.type === 'led' && !b.resistor ? 'Une LED sans résistance grille.' : null)],
  },
  locale: 'fr',                              // ou { stone: 'nœud', game: 'scénario', … }

  // Points d'extension : ce que la configuration ne suffit pas à dire
  layout: undefined,                         // (partie, table) => positions ; défaut : la table (B.2)
  renderTile: undefined,                     // (pierre, svg) => svg ; défaut : le domino ivoire
  natures: { scene: { label: 'Scène' } },    // natures de conteneurs en plus de Fonction, Classe, Service, Module

  // Couleurs / catégories de connecteurs
  categories: {
    nombre: { label: 'Nombre', color: '#3B7DDD' },
    texte:  { label: 'Texte',  color: '#38A169' },
    flux:   { label: 'Flux',   color: '#5E6E7A' },
  },

  // Définition des pierres (équivalent des blocs Blockly)
  dominos: [
    {
      type: 'random',
      name: 'Nombre aléatoire',
      group: 'Math',                               // rubrique de la pioche
      inputs:  { count: 0 },                       // face gauche
      outputs: { count: 1, colors: ['nombre'],     // face droite
                 pips: [{ name: 'n', color: 'bleu' }] },   // couleur de chaque point
      help: 'Rend un entier entre 1 et 6.',
    },
    {
      type: 'if',
      name: 'Si … sinon',
      category: 'logique',
      inputs:  { count: 1, colors: ['nombre', 'bool'], canFollow: ['math', 'evenement'],
                 pips: [{ name: 'valeur', color: 'ambre' }] },
      outputs: { count: 2, colors: ['flux'], canPrecede: ['sortie', 'controle'],
                 pips: [{ name: 'vrai', color: 'vert' }, { name: 'faux', color: 'rouge' }] },
    },
    {
      type: 'crm',
      name: 'Créer le contact CRM',
      inputs:  { count: 1, pips: [{ name: 'lead', color: 'bleu' }] },
      outputs: { count: 1, pips: [{ name: 'contact', color: 'vert' }] },
      faces: { left: '#DDE8F6', right: '#DCEFE3' },   // couleur de la face gauche et de la face droite
    },
    {
      type: 'var',
      name: 'Variable',
      inputs: { count: 0 }, outputs: { count: 0 },
      identity: 'bleu',                            // couleur du point de ses raccourcis
    },
    {
      type: 'score',
      name: 'Calculer le score',
      container: { kind: 'Fonction' },            // 'Classe' | 'Service' | 'Module' | …
      inputs:  { count: 1, colors: ['flux'] },
      outputs: { count: 1, colors: ['nombre'] },
    },
  ],

  // Menu contextuel extensible
  contextMenu: (pierre, items) => [...items, { label: 'Exécuter jusqu’ici', run: () => {} }],

  // Projet de départ (facultatif) : la partie principale et les sous-parties des conteneurs
  project: {
    name: 'Lancer de dés',
    main: [
      { id: 'a1', type: 'start' },
      { id: 'a2', type: 'score', after: 'a1' },
      { id: 'a3', type: 'if', after: 'a2', turn: 'down', calls: [{ domino: 'record', side: 'top' }] },
      { id: 'a5', type: 'replay', after: 'a3', output: 2, link: { label: 'faux' } },
    ],
    inside: { a2: [ /* sous-partie de « Calculer le score » */ ] },
  },
});

// Pierre secondaire : la pierre appelée se colle en haut (source) ou en bas (sans retour).
editor.call('somme', 'a', { dock: 'top' });

// Connexion : quelle sortie de A alimente quelles entrées de B.
editor.connect('si', 'rejouer', { slot: 1, pins: [0], label: 'faux', when: 'score < record', enabled: true });

// Virage : après la 5e pierre, la suite part vers le bas ; null la remet tout droit.
editor.turn('bienvenue', 'down');   // 'down' | 'up' | 'left' | 'right' | null

editor.on('connect', ({ from, to, slot, pins }) => {});
editor.on('configure', (pierre) => {});
editor.on('run', ({ order, stoppedAt }) => {});   // effet domino
editor.toJSON();   // sérialisation de la partie et des sous-parties
```

### B.6 bis Le moteur (A.16)

Le moteur est décrit en détail dans [`docs/ARCHITECTURE.md`](ARCHITECTURE.md). Les décisions qui répondent au septième message :

| Demande | Décision |
|---|---|
| Adjacentes difficiles à connecter, trop loin, tige marron | Collées à 90° sur le grand côté, sans tige ni distance. La **haute** se pose au-dessus de la **face d'entrée** (elle alimente une entrée), la **basse** sous la **face de sortie** (elle consomme une sortie). Plusieurs adjacentes rétrécissent ensemble. Zones de dépôt « haute » et « basse », poignées ●+. |
| Haut et bas quand la pierre tourne | La pierre et ses adjacentes tournent d'un seul bloc. Sens → : haute en haut. ↓ : haute à droite (comme demandé). ← : haute en bas. ↑ : haute à gauche. Les proportions ne changent pas. |
| Architecture propre | Moteur en couches : types, définitions, contexte, modèle, JSON, exécution, générateurs (utilisables sans navigateur), puis mise en page, vue, inspecteur. Le moteur ne connaît aucun domaine : tout vient d'un pack. |
| Signification du nombre de points, zéro | `semantics()` donne le rôle d'une pierre selon ses faces : valeur (0 \| 0), source (0 \| n), terminale (n \| 0), étape (n \| m). Les règles d'assemblage en découlent. |
| Couleur = type de connexion | Système de types : couleur, héritage, acceptations. La couleur d'un point est celle de son type ; la compatibilité est vérifiée partout, et chaque refus est expliqué par une phrase. |
| Contexte et liaisons | Contexte observable à portées, liaisons `{ "$bind": "clé" }`, gabarits `{{clé}}`, pierres « Lire » et « Écrire dans le contexte » ; diagnostics de liaison ; mode direct. |
| Événements et callbacks pour chaque bloc | 16 callbacks par définition, dont `init`, `title`, `pips` (faces dynamiques), `canConnect`, `validate`, `run`, `contextMenu`, `render`, `inspect` et les callbacks de cycle de vie ; plus de 20 événements d'espace, tous en JSON. |
| JSON impeccable, génération par l'utilisateur | Format versionné et imbriqué, schéma publié, vérification qui dit où est l'erreur, migrations, types inconnus conservés ; générateurs qui ne lisent que le JSON (six dans les démos). |
| Connexions fluides, à la souris, comme des nœuds | Glisser avec zones vertes ou rouges et fantôme ; fil tiré depuis une poignée vers une pierre ; ajout rapide filtré quand le fil est relâché dans le vide ; insertion sur un joint ; suppression qui recolle la suite. |
| Inspecteur à la Chrome | Ancré en bas ou à droite, redimensionnable, agrandi ou réduit. Neuf onglets intégrés (Éléments, Console, Événements, Contexte, JSON, Code, Problèmes, Exécution, Types), plus des onglets de domaine ou d'entreprise (`addInspectorTab`). |
| Dépasser Blockly | Tableau comparatif dans `ARCHITECTURE.md` § 12 : refus expliqués, adjacentes, fils, mise en page de table, contexte, exécution, générateurs sur JSON, inspecteur. |

### B.6 ter La plateforme de langages (A.17)

Le détail est dans [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (§ 2, 5, 6, 10). Les décisions qui répondent au neuvième message :

| Demande | Décision |
|---|---|
| Un module pour n'importe quel éditeur | **Un éditeur est l'instance d'un langage** (`Domino.language()`, `Domino.create(hôte, langage)`) : types, pierres, sens des faces, règles, façades, modules, générateurs, onglets. Sans vue : `langage.instantiate()`. Un langage s'exporte en JSON et se recharge ; ses callbacks peuvent s'écrire en texte. |
| Le chiffre à gauche et à droite, logique du développeur | Le langage redéfinit la lecture des faces (`semantics`) ; chaque pierre dit ce que comptent ses faces (`meaning`) ; les faces peuvent changer avec l'instance (`pips`). |
| Logique des connexions à gauche et à droite | Règle de chaîne du langage : couleurs, **même nombre de points comme au jeu** (`count`), les deux, ou une fonction ; règles nommées (`rules.list`) sur chaque genre de connexion ; dernier mot à chaque pierre (`canConnect`). |
| Couleur des façades | Façades par genre ou par rôle, définies par le langage, avec leur légende ; callback `faces` par instance ; une instance prend la teinte de sa déclaration. |
| Une bibliothèque ou un autre projet, à deux façades | Déclaration « Bibliothèque » : gauche, sa configuration ; droite, ses fonctions ; champ « Projet d'origine » ; export et import d'une déclaration entre projets d'un même langage. |
| Une classe qui exige des paramètres, déclarée dans une section | Table « Déclarations » ; la classe montre à gauche les paramètres de son constructeur, à droite ses méthodes publiques ; son corps (constructeur, méthodes, propriétés) s'ouvre dans un onglet. |
| L'utiliser comme instance, appeler une fonction par un point coloré | Instance : pierre libre qui exige les paramètres (fils ou adjacentes hautes) et offre chaque méthode par un point de sa couleur ; « Appeler » reçoit la méthode par un fil, ses paramètres deviennent ses entrées. Une fonction déclarée apparaît dans la pioche. |
| Relier un point à un point, de la couleur des deux | **Fils** point à point, en dégradé de la couleur de sortie à celle d'entrée ; points compatibles allumés pendant le geste ; reprendre un fil depuis son entrée ; menu du fil. |
| Domino libre relié | Une source libre est évaluée à la demande (une fois) ; un fil vers une pierre libre la déclenche ; une chaîne peut attendre la valeur d'une autre (jointure). |
| Synchrone ou asynchrone selon le domino appelé, bloquant ou non | `async` sur la pierre ou la méthode (fil en pointillé qui coule) ; `blocking` sur le fil (▮ bloquant, ○ non bloquant). Non bloquant : « Appeler » gagne un point « suite » qui part tout de suite, et sa branche « résultat » tombe plus tard. L'exécution fait tourner les chaînes en parallèle et détecte les attentes sans fin. |
| Ouvrir ces dominos dans un autre onglet | Double-clic sur une déclaration, une instance ou un appel : son corps s'ouvre dans un onglet. |
| Un monde pour construire des langages visuels | Trois langages de démonstration (programmation, automatisation, et un **Atelier qui écrit des langages avec des dominos** et crée leur éditeur en direct) ; les quatre éditeurs de domaine passent sur la même plateforme. |
| Garder le visuel | Kit de dessin, animations, DominoPopup, inspecteur et design inchangés ; les nouveautés (fils, déclarations, instances) suivent le même dessin. |

### B.6 quater Tout représenter, tout modéliser (A.18)

Le détail est dans [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) (§ 6 bis, 6 ter, 8 bis, 8 ter). Les décisions :

| Demande | Décision |
|---|---|
| Un domino peut être une variable, une classe, une ligne, un module, un projet, un scénario, un workflow, un algorithme | `represents` dit ce qu'une pierre représente (vocabulaire libre). **Variables** déclarées (lire / écrire par identifiant). **Intérieur** générique (`inside`, avec un contenu de départ) pour un algorithme, un scénario, un module, à toute profondeur. **Projet embarqué** (`domino.project`) : un projet entier, même d'un autre langage. **Renvois** (`{ "$ref" }`) vers n'importe quel élément. |
| Le consulter dans un autre onglet | Double-clic : l'intérieur, la déclaration, la variable, la cible d'un renvoi, ou l'éditeur du langage du projet embarqué, dans un onglet. Une marque ▣ ou ↪ le signale sur la pierre. |
| Construire n'importe quoi, même un jeu, une théorie, une philosophie | Démos **Raisonnement** (une théorie du libre arbitre : idées, appuis, objections, concepts déclarés, théorie adverse dans une pierre) et **Dominos** (le jeu, avec la règle « même nombre », les coups permis calculés par le moteur). |
| Un éditeur unique pour chaque besoin | Le langage règle aussi la vue (`ui` : pioche cachée ou ordonnée, aide), les contraintes de chaque pierre, ses permissions, son vocabulaire. |
| Plus que Blockly : options, autorisations, types de blocs, événements | **Définition détaillée** : champs (dix genres, requis, bornes, motif, options dynamiques, renvoi, validation), **contraintes** côté par côté (`allow` / `deny`), nombre d'exemplaires, permissions (supprimer, déplacer, modifier, dupliquer), dépréciation, clés inconnues signalées. Pierres posées : note, neutralisée, verrouillée, étiquettes. Événements `note`, `flag`, `tags`, `run:var`. |
| Un JSON clair et manipulable, avec tout le contexte | **Document de modèle** (`editor.describe()`) : chaque pierre (faces point par point, source de chaque entrée, cibles de chaque sortie, champs bruts et résolus, place, chemin, intérieur, déclaration, provenance, diagnostics), chaque relation à plat, les déclarations, le contexte et ses liaisons, le journal, l'exécution. |
| Traçage parfait | **Provenance** de chaque pierre et fil (qui, quand, comment, d'où), **journal** des opérations, **exécution causale** (chaque étape renvoie à celle qui l'a provoquée, avec son chemin d'appel). |
| Définition et modélisation parfaites | **Trois schémas JSON publiés** (projet, langage, document de modèle) ; les tests vérifient que les neuf démos s'y conforment. |
| Ne pas faire la génération | Aucun générateur ajouté : le document de modèle est l'entrée prévue pour ceux qui les écriront. |

### B.6 quinquies Un vrai éditeur (A.19)

Un agent expert (conception de projets et IHM) a d'abord étudié le code. Il a proposé un plan d'architecture : couches sans DOM testables sous Node, modules, API, menus, formats, ordre et tests. Ses recommandations ont été suivies. Le détail est dans [STUDIO.md](STUDIO.md), [FORMATS.md](FORMATS.md), [STORAGE.md](STORAGE.md) et [EXTENDING.md](EXTENDING.md).

| Demande | Décision |
|---|---|
| Des générateurs de langages de programmation | **Registre `Domino.Codegen`** : un descripteur par cible, une entrée au choix (le projet, ou le document de modèle tout résolu), un ou plusieurs fichiers, des options, des diagnostics. Un générateur générique sert tous les langages. Les générateurs des langages y sont adoptés d'eux-mêmes ; trois génériques sont livrés (documentation, graphe, modèle). |
| Plusieurs types d'affichage | **`Domino.Displays`** : Pierre, Compacte, Carte détaillée, Contour, et ceux qu'on inscrit. Le mode fixe l'échelle de la vue ; une pierre peut imposer son dessin. Les points ne bougent pas d'un mode à l'autre, donc les fils et les gestes non plus. |
| Deux onglets côte à côte, dupliquer, tailles | **Volets** : diviser à droite ou en bas (une deuxième vue du même projet, historique commun) ; dupliquer l'onglet ou le projet ; tirer un onglet sur un bord ; poignées réglables à la souris et au clavier ; dispositions toutes faites (deux colonnes, deux lignes, grille). |
| Un JSON par domino, professionnel et extensible | **Ressources `kantoaplo.dev/v1`** : `apiVersion`, `kind`, `metadata` (uid, name, labels, annotations, provenance, révision, ETag), `spec` (déclaré), `status` (calculé, jamais relu), `extensions` (espaces de noms, conservées). Deux formes sans perte : le projet canonique (le v2 enveloppé) et la forme à plat (une ressource par pierre, fil, partie). Schéma publié. |
| Un menu Fichier, Nouveau ▸ vers les autres types de projets, toutes les options d'un vrai éditeur | **Barre de menus** (Fichier, Édition, Affichage, Exécuter, ‹Langage›, Aide). Nouveau ▸ propose les langages et leurs modèles. Une palette de commandes, des raccourcis (accords compris), des menus contextuels, des préférences, une page de bienvenue. Tout est une **commande** extensible ; un langage ajoute les siennes (`contributes`). |
| localStorage, puis des API définies dans un fichier de configuration | **`domino.config.js`** décrit les fournisseurs : navigateur, mémoire, **HTTP** (endpoints, authentification sans secret, ETag et If-Match, reprises, délai), **local d'abord** (file hors ligne). Le contrat HTTP est documenté et testé avec un serveur simulé. |
| Un vrai éditeur qui contient le travail : l'espace de travail | **Établi** (`Domino.Workbench`) : documents ouverts, « modifié » (annuler jusqu'à l'état enregistré le rend propre), enregistrement automatique, sauvegardes de secours des brouillons, récents, disposition et vue de chaque onglet, restaurés au démarrage. Il s'enregistre comme une ressource `Workspace`. |
| Qualité de code et documentation | Chaque couche s'emploie seule et se teste sous Node : 72 tests, six schémas publiés générés par le moteur (`tools/schemas.js`). Quatre guides ; l'architecture, le README et le journal sont mis à jour. |

### B.6 sexies Le quiz, banc d'essai du cœur (A.20)

Le quiz a été écrit d'abord, en demandant à chaque question ce qui manquait au cœur. Ce qui manquait a été ajouté **au cœur**, sous une forme générale, puis employé par le quiz. Le détail est dans [ARCHITECTURE.md § 7 bis](ARCHITECTURE.md) et dans [DEMOS.md](DEMOS.md).

| Demande | Ce que le quiz emploie | Ce que le cœur y a gagné (pour tous les langages) |
|---|---|---|
| 20 questions de genres différents | 9 pierres de question ou d'étape, aux champs groupés | Le genre de champ **`table`** (des lignes, une colonne par sous-champ, éditées dans l'inspecteur et la grande pierre) |
| Choisir selon une réponse précédente | Une colonne « Si » par choix | Les **expressions déclaratives** (`domino.expr.js`) : JSON, écrites en texte, évaluées sans code, vérifiées avec leur position, extensibles par un dialecte ; le genre de champ **`expr`** ; des conditions déclaratives sur les connexions |
| Des choix rendus par la fonction d'une classe, appelée par la liste des choix | La classe « Catalogue », sa méthode `pays(continent)`, et « Choix calculés » relié par un fil | Le kit **`data`** (données, filtrer, transformer, trier) ; **`runtime.call`** (appeler une méthode hors d'une exécution) ; les **fils vers une adjacente** ; des générateurs **asynchrones** qui interrogent le moteur (`ctx.call`), et des générateurs déclarés par le langage |
| Cinq sous-chemins par un switch / case | « Aiguillage (selon) », cinq cas plus « sinon » | Le kit **`flow`** : `flow.switch` à N sorties (une par cas, valeur ou condition) ; les noms des sorties affichés sur les jointures ; les **kits** eux-mêmes (`kits: [...]`, renommables) |
| Un domino qui mène à une question précédente, ou plus loin | « Aller à » : rejoindre la suite commune, revenir une fois en arrière | Un **nouveau genre de connexion : le saut** (`domino.goto`, ou tout renvoi `jump: true`, ou `rc.jump`). Il est borné, avec une sortie « épuisé ». La vue le dessine en flèche, le modèle le décrit (`jump`), la trace le cause (`via: jump`). ⌖ **choisit la cible sur la table** |
| Une IHM facile, un éditeur puissant | Aperçu joueur ; « Jouer le quiz » (Ctrl+Alt+J) ; diagnostics de l'auteur ; génération du JSON, d'un HTML jouable et de GIFT | Un lecteur et un cœur **embarquables** (fabriques sans dépendance) ; les mêmes règles de notation dans le moteur et le lecteur |

### B.6 septies Un modèle, trois axes déclaratifs (A.21)

Trois concepteurs (performance, sémantique des langages, outils de création) ont été consultés ; leur synthèse : **un seul modèle, trois axes indépendants, tout en données**. Un éditeur = une structure (pierres, traits, liens typés) × une exécution (effet domino, machine à états, jetons, décision) × des projections (dominos, diagramme, tableau, texte). Et l'outil qui crée les éditeurs est **lui-même un éditeur de dominos** : le Concepteur.

| Demande | Réponse | Où |
|---|---|---|
| Performant | Révisions, validation mémorisée, index, grille spatiale, historique partagé : 5 000 pierres se chargent en ≈ 45 ms et se disposent en ≈ 145 ms | `tools/bench.js`, `tests/perf.test.js` |
| Tous les types d'éditeurs | Huit familles livrées en JSON pur (blocs, flux, états, décision, processus, formulaire, schéma, carte mentale) ; d'autres se composent avec les mêmes traits, moteurs et vues | `demos/patterns/patterns.js` |
| Flexible | Liens typés à champs ; traits composables ; comportement en expressions ; moteurs et projections enregistrables | `domino.behaviors.js`, `domino.engines.js`, `domino.projections.js` |
| Unique, « de génie » | Le même projet vu en dominos, diagramme, tableau et texte, côte à côte ; simulé pas à pas ; et **l'outil se décrit avec lui-même** : un langage s'écrit avec des dominos, se compile en données, se remplace à chaud sous les yeux de l'auteur | `domino.meta.js`, Fichier › Créer un éditeur… |
| Sûr | Un langage en données ne contient aucun code : il s'importe sans confiance, se vérifie sous Node, se rouvre dans le Concepteur sans perte | `Languages.countCode`, `tests/meta.test.js` |

### B.6 octies Modules, composants, livraison (A.22)

| Demande | Réponse | Où |
|---|---|---|
| Pas de lien externe, npm | Polices `@fontsource/*` installées par npm et copiées dans `vendor/` (latin, woff2) ; esbuild et ESLint en dépendances de développement ; le build échoue si une page charge une ressource hors de `dist/` | `package.json`, `tools/vendor.mjs`, `tools/build.mjs` |
| Sélection multiple | Ctrl + clic ; Ctrl + glisser, bouton gauche ou droit (rectangle) ; sans Ctrl, glisser déplace la vue. Groupe déplacé, supprimé, copié, dupliqué ensemble ; liens et fils internes gardés au collage | `engine/ui/domino.selection.js`, `domino.view.js` |
| Gabarits centralisés | Un registre unique, `Domino.Templates` : chaque morceau d'interface est un gabarit nommé, documenté, remplaçable (`override`, configuration `ui.templates`) ; échappement par défaut | `engine/ui/domino.templates.js`, `engine/studio/domino.studio.templates.js` |
| Boîte à outils | Modèle sans DOM construit depuis un JSON (catégories, sous-catégories, pierres, groupes, textes, aide, liens) ; entière ou réduite ; catégorie présentée par un domino (initiale, nombre en points de dé) ; dépliable, au clavier ; état retenu par langage | `engine/ui/domino.toolbox.js`, clé `toolbox` du langage |
| Menus en JSON | La barre de menus et les menus contextuels sont des données (titres, descriptions, aide, liens) ; une instance les complète par la configuration | `engine/studio/domino.studio.menus.js`, `Domino.Menus.fromJSON` |
| Build | `npm run build` → `dist/` : studio minifié avec toutes les démos, bibliothèques (`lib/`), polices, documentation, schémas ; configuration laissée modifiable | `tools/build.mjs` |
| Qualité, séparation | Trois couches de code (`core` sans DOM, `ui`, `studio`) et une seule liste de modules (`domino.manifest.js`) pour la page, les tests, les outils et le build ; ESLint ; 129 tests | `domino.manifest.js`, `eslint.config.js` |

Interprétation signalée : « le menu dynamique présenté par JSON » se lit à la fois comme la boîte à outils (catégories, sous-catégories, éléments) et comme la barre de menus du studio ; les deux sont décrites en JSON, avec le même vocabulaire (titre, description, aide, lien).

### B.6 nonies Un outil complexe en dominos : le patron TNR (A.23)

| Demande | Réponse | Où |
|---|---|---|
| Un éditeur à la Postman | Langage « Scénarios d’API (TNR) » : campagne, scénarios (conteneurs), requêtes, vérifications, extractions, variables, conditions, appels de scénario, scripts | `demos/postman/` |
| Importer, exporter Postman | Importeurs (collection, environnement) ; générateur d’une collection v2.1 (scénarios en dossiers, pierres en scripts `pm.*`, `setNextRequest`) et des environnements ; aller-retour sans perte | `Domino.Importers`, `tnr/postman` |
| Logs pour le testeur | Rapports structurés (`rc.report`) : requête, réponse, en-têtes, corps, cURL, attendu et obtenu, variables avant et après, secrets masqués ; onglet Rapport | cœur : `domino.runtime.js`, `domino.inspector.js` |
| Un visuel du scénario | La table (chaîne et adjacentes en liste), le Déroulé (couloirs par scénario) | projection `timeline` |
| Tableau de bord, collection et sous-collections | Une projection propre au langage, et une boîte à outils **dynamique** tirée de la collection (dossiers, sous-dossiers, requêtes prêtes avec leurs vérifications : fragments) | `tnr.dashboard`, `toolboxSources` |
| Passage de contenu, variables partagées | Fils et adjacentes hautes vers le corps d’une requête ; contexte à **portées nommées** (local, env, collection, globals) et variables dynamiques | `variables: { scopes, dynamic, declared }` |
| La meilleure façon d’afficher une pierre dans un éditeur complexe | Adjacentes **en liste** (droites, empilées, nom à l’horizontale) en plus de la géométrie du jeu ; badges et sous-titres dans la boîte | `adjacents: 'list'` |
| Le patron | Catalogue → ressource du projet et boîte dynamique ; séquence → chaîne ; contrôles → adjacentes ; données → fils ; état → portées ; exécution → séquentielle, `from` ; observation → rapports et projections ; échanges → importeurs et générateurs | `docs/TNR.md` § 6, `docs/EXTENDING.md` § 14 |

### B.7 Questions ouvertes, tranchées par la configuration (A.15)

Toutes les questions des versions précédentes sont tranchées par la règle de B.0 : chacune devient une option, avec une valeur par défaut fidèle à l'idée. Aucune ne bloque plus le design.

| # | Question | Option | Valeurs | Défaut | Dans les livrables |
|---|---|---|---|---|---|
| 1 | Raccourci d'une fonction sans retour | `shortcuts.face` | `'real'` · `'call'` | `'real'` : il montre ses paramètres (2 \| 0) | Démo (défaut), design system |
| 2 | Valeur exacte au-delà de 6 | `pips.overflow` | `'nine'` · `'engrave'` | `'nine'` (« au-delà de 6, 9 points ») | Démo : option « 9 points + valeur gravée » |
| 3 | Entrées multiples | `inputs.merge` | `'chain'` · `'converge'` | `'chain'` : une chaîne plus des secondaires | Design system |
| 4 | Points reliés de couleurs différentes | `rules.pipColor` | `'ignore'` · `'warn'` · `'refuse'` | `'warn'` | Démo : option, diagnostic, éditeur de connexion, l'effet domino s'arrête en `'refuse'` |
| 5 | Colonnes verticales profondes | `docks.maxDepth` | nombre · `Infinity` | `3`, puis repli « + n » | Design system |
| 6 | Pierres doubles | `doubles` | `'plain'` · `'across'` · `'spinner'` | `'plain'` : aucun sens imposé | Design system : les trois rendus |
| 7 | Virage et autres chaînes | règles de B.2 | — | non-collision | Démo |
| 8 | Serpentin automatique | `table.serpentine` | booléen | `true` (A.14) | Démo |
| 9 | Largeur de la table | `table.width` | nombre · `'screen'` | `1150` | Démo : option « Suit la largeur de l'écran » |
| 10 | Fils de branche | `links.route` | `'around'` · `'straight'` | `'around'` | Démo : option « Fils de branche » |
| — | Nom du menu « éditer le projet » | `locale` | texte | « Ouvrir la partie » | Démo |
| — | Ce qu'aucune option ne prévoit | points d'extension | code | — | B.6, design system |

---

## Partie C : livrables

| Fichier | Contenu |
|---|---|
| `index.html` | **Domino Studio** : cinq langages (Kanto, Flux, Atelier, Raisonnement, Dominos) et quatre éditeurs de domaine (API, workflow, circuit, quiz), la DominoPopup, l'inspecteur, les options d'instanciation, l'effet domino, les générateurs |
| `engine/` | Le moteur : types, définitions, contexte, modèle, JSON (et son schéma), exécution, générateurs, mise en page, vue, DominoPopup, inspecteur, styles |
| `demos/langages/` | Cinq langages construits avec la plateforme (moins de 30 pierres posées chacun) |
| `engine/schema/` | Schémas JSON : projet, langage, document de modèle |
| `demos/packs/` | Un langage par éditeur de domaine (moins de 30 pierres chacun) |
| `tests/` | Tests du moteur et de la démo quiz (`node --test`) |
| `docs/IDEE.md` | Ce document |
| `docs/ARCHITECTURE.md` | Le moteur : couches, faces, adjacentes, définitions et callbacks, événements, règles, JSON, contexte, exécution, générateurs, mise en page, gestes, inspecteur, comparaison avec Blockly |
| `docs/DEMOS.md` | Les neuf démos, leurs scénarios, et le journal des soucis rencontrés en les construisant |
| `design/design-system.html` | Design system ; ses figures d'adjacentes et sa figure d'accueil sont dessinées par le moteur |
| `design/studio.html` | Maquette précédente (cinq domaines, panneau Configuration) |
| `design/domino-kit.js` | Dessin SVG des pierres |
| `design/tokens.css` | Tokens de design, lus par le moteur |

Pour voir les pages, ouvrir les fichiers `.html` dans un navigateur. Aucune compilation n'est nécessaire.

---

## Annexe : textes d'origine

> Reproduits tels quels.

### Premier message

```text
ici je demande que un designe et demos et doc qui explique mon projet ne fait rien du dev dans le core du projet :dans le monde de kantoaplo je reflechit a une bibihotheque quelle soit utilisable dans la construction des editeur visuelle de codage pour les low code , utilisable pour la construction des editeur workflow qui peux etre implementer dans un logicielle d automatisation, capable d etre  utiliser dans un elle visuelle pour la conception des circuit electronique  , capable a etre utiliser dans un editeur de creation des scenario , capable a remplacer les noeud utiliser dans autant de projet , capable d etre utiliser dans des solution de dashbording , ce module a un design de ouf inspirer par la domino comme facon de coller les composant entre eux , ce editeur rassemble au concepte de blockly utlisable dans plein et different projet ou besoin , ce module ou biblihotheque ou frame work  a pour concepte que la premier facade contient le nombre des parametre a accepter et la deuxieme le nombre des sortie (a configurer et specifier  par le devlopppeur qui va utiliser le module ) si le nombre depasse 6 pour l entre ou le sortie affiche 9 points si une des deuxieme face affiche zero donc pas de sortie et aucun pier ne peux etre coller , si la premier donc aussi elle ne peux pas etre coller a une autre pierre , aussi un truc sur chaque piere de dominos au deux extrimeté il ya des couleurs en petit qui signifier les couleurs qu elle accepte en entre ou sortie , car chaque pierre on peux definir lors de la configuration des pierre on peux choisir des couleur des point a chaque coté (entree/sortie) et pouvoire specifier les categorie qui peux etre suivit ou attacher (entree/srtie ) comme blockly definir les bloc qui peux etre preceder et celle qui peux etre suivit mais ici on ajoute des couleur sur le domino a l extremite a gauche ou droite avec des petit trait comme ca exepl (-) mais le largeur selon le nombre des couleur ou categorie permise , donc chaque cté de chaque domono peux avoire un couleur des point specifier par le concepteur , on parle que chaque domino et comme un bloc cher blockly note ca bien , l editeur affiche les domino par defaut en blanc et parfaitement comme les vraie domino mais l utilisateur ou devloppeur peux instancier le module avec tell de chose comme le couleur des pierre ou des dominos , l editeur main la ou on drop les dominos les coller ou construire son projet est flexible dans la navigation facile a zoomer ou fouller le projet cree par la sourie , pour les dominos situer dans le workspace on peux faire des clique droite pour avoir un menue suprime duplique copier et configurer , quand on clique sur configurer une dominoPopup se agrandie a partir de ce domino pour afficher un grand domino avec toute information de ce domino parent fils ou autre les sortie les entreé le help et tous in formation de celuis qui est attacher en entre et sortie un espace warning erreur et logs , pour le dominos qui peux avoire des autre sous dominos dans le workflow on affiche le main et ces dominos qui contient des autre domino il s affiche avec un autre couleur gris claire par defaut mais l utilisateur peut changer lors le linitialisation du module ou la configuration et sur se domino une option dans le menue qui apparaitre editer le projet (ce que tu prefer pour le nom de ce menue ) cette option ouvre un neuveau onglet avec le contenue de ce domino , je donne un exmple un devlopeeur il peux utiliser le module pour cree un editeur de devlopeemnt visuel il a utiliser un composant ou domino qui permet de faire un truc et rend une resultat el la dont (ce domino)  il a utiliser une fonction qui genere un num aleatoir (un domino qui ne recoit pas d entree mais il rend un truc utiliser par la suite du l agho) donc ce domino il ne peux pas coller apres un truc donc il seras un domino libre avec une faceade gauche zero et facade droite 1 par exm car il rend un truc et ce domino n est utiliser que par le domino expanded main et il s affiche dans le sous game domino libre et une raccorcci de ce domino saffiche colle horizontalement a la domino qui lui appelle appeler mais avec un taille plus petite que le relle autre exp 3 dominos de type var pas de entre pas de sortie donc affiche zero a gauche et zero a droite appeler par un domino il saffiche avec sortie 1 car il rend un truc il leur taill s adopte pour etre coller en haut de le domino qui ils les as appeler , autre exemple un fonction qui accepte deux parametre mais ne rend rien sa peux etre presenter par un domino quit fait des sortie mais il saffiche en bas de le domino qui il appeler dans mes exemple j'ai parler dans un seul domaine d utilistaitn comme exemple don il faut pas se limiter a ce que j'ai situé et partir plus loin coté flexibilité , maintenant mes demande je voulais que tu analyse bien ce que j'ai ecrit le documenter dans un document en markdown de l ideé qui contiient exactement ce que j'ai ecrit    , et realiser un design complet profitionelle et design system avec un demos  ou plusieur de l editeur ou le workspace
```

### Second message

```text
parfait mais il manque des truc les dominos secondaire adjacente ou deriver ou secondaire d un domino il saffiche de taille plus petit et se colle comme j'ai expliqué avant en haut ou en bas selon leur type , et les domonios liee saffiche horizontallement et si parmis des secondaire dominos afficher horizontalement a des autre connections il seront afficher verticalement par a port au main , aussi dans le demo un domino dois afficher comme domino pas des truc dans le milieu , le nom de dominos saffiche comme entete de la domino aussi les couleur des point afficher dans chaque extrimité correspond a l identifiant du bloc ou domino actuellement tous en noire dans la demo , je voualais dire le couleur des point d une extrimiter d un domino les couleur des facade dun domino exp une pierre domino 3:2 donc 3 points noire a gauche et 2 point noire a droite ca ce qui est par defaut , moi je parle a ca exactement je peux definir (pas moi je parle au personne qui va utiliser le module pour construire les dominos ou les bloc )les couleur des chaque point des 3 point a gauche et le couleur de chaque point a droite ou , je retourne pour les laison des dominos un domino peut etre une classe ou service ou module qui contien plusieur sous dominos que le utilisateur peux expand ce composant dan un nouveau onglet , aussi la connexion entre deux domino elle dois etre configurable et accecible on cliqaunt une clique droite sur un domino et selectionne l option connexion suivante ou connection precedente , la popup dois etre comme une grande domino qui affiche la cote droite et la coter gauche aussi la coté bas et la coté haut si ont a proprement comme des vraie domino et l utilisateur choisie la domino qu il veut la zoome ou afficher ou modifier , je suis content par ton rendue je voulais que tu prend que les chose qui va ameliorer et pas les contradictoire ou les chose que je demande et sont pas coherent et que tu devloppe on partant par mon souhait a faire des truc magique
```

### Troisième message

```text
continue aussi je dois pouvoire defenir la couleur de la partie gauche de domino et la partie droite aussi les couleur des points dans chaque partie aussi dans le workflow il ya 4 type de connnexion a droite a gauche et en bas les connection en haut et en bas saffiche verticalement avec la domino pricipal et en petit taille aussi pusique sont des dominos je voulais pouvoire a un endroit par exeemple dans la 5eme pirre de decide les dominos a droit change le sens en bas ou en haut si la domino avec un sense en bas tourner changer le sens des dominos qui suivent a droite ou a gauche comme dans un vrais jeux domino
```

### Quatrième message

```text
il ya des regle qui assure le non collision des domino don il serpentin automatique
```

### Cinquième message

```text
contenue
```

### Sixième message

```text
tu relie mes message et tu fais le bon chois aussi tu choisit la flexibilité en cas de confesion et noublie pas un truc que il sagit aupremier lieu un framwork qui permet d etre utiliser dans des different domaines ou maniere , c est l instantiation de module ou la configuration , les besoins fonctionnelle ou technique different ... qui defnit les resultat , dans ce que tu affiche est des exemple peux etre genere par le module ou framwok domino donc garde la flexibiliteé l extensiabilité et prend les choix qui va a ce concept
```

### Septième message

```text
coté design c est parfait , coté connexion adjacente c est compliqué de connecté un domino adjacent aussi il saffiche avec une connexion maron et parfois trop loin , je voulais que tu touche le moteur et l adpté correctement prend blockly comme un parmie les concurent qu on dois les deppaser , je voulais que tu prend au serieux cette motivation un truc deppase blockly , avec une architecture clean une generation json pour chaque domino/bloc un controlle de la signification de nombre des point a droite les nombre des point a gauche de chaque domino les couleur de chaque point est un type de connection ou des connection permise, zoro point sgnifier un truc a gauche ou a droite , aussi un context et un systeme de binding speciale a ce framwork riche avec une qualité extreme accessible et archetecturé soignieusement une abstraction flexible et maniere de codage extremement extensible une representation en json impecable (ce qui permet la creation de la partie generation apres par les utilisateur de ce module ou framwork ) , chaque bloc/domino a tous les events et les call back qui permet au devloppeur qui va construire ce domino a acceder et faire tous action ou ajouter des instructions qu il voudra , comme blockly , les connection dois etre visuelement dans le workspace plus fluide et facile avec les drag and drop aussi avec le sourie pour faire un truc comme la connection entre des noeuds mais en dominos , les connexiotin en haut et les connnexion en bas ce je les appelle par des connection adjacente dois etre plus propre je insiste quils doivent des petit dominos qui sont coller en haut ou en bas de la domino parent mais en feson 90 degree et sil ya plusieurs on reduit leur taille pour qui il sont seron tous coller en haut ou en bas de la domino parent attention fixe ca si tu a pas compris ce que je voulais dire par haut et bas , haut de domino cest la partie haute de domino qui est horizontalement si elle ete verticalement donc la partie droite ,supposant un domino affiche horizontalement proprement avec facade gauche et autre a droite l entree donc celle a gauche sortie celle a droit adjacent celle en haut ou en bas de ce domino , adjacente haute celle en haut adjacente bas celle en bas et ces proportion ne sont pas changer si dans le workflow on change la direction de domino suivante les proportion reste les meme et le design s adapte , je compte sur ton intelligence de comprendre cette partie , aussi je voulais que apres que tu refait corriger et adopter tous ce qui nessaire a mes demande tu recrre les exemple des demos avec ce scenario , tu cree les dominos apres tu cree un scenario et tu vois les soucis qui te empeche a les faire , un editeur visuelle pour conception d  apis et un demo simple avec 3 midelle ware et des composant genre biblihoteque , un editeur de workflow avec un scenario qui depand de deux autre scenarion dans un autre composant appeler par un domino , un editeur de circuit simple aussi avec des dominos et un scenario des faire un logique de max 9 niveaux jusqua la fin avec des composant or not .. , fait attention ne cree pas des vraie editeur juste des demos avec max 30 domino pour chaque editeur , aussi pas des scenario de demos complexe sont juste pour le demo et test , et un inspecteur qui rassemble au inspecteur d element de chrome qui peux etre agrandir ou l inverse avec plein des onglet pour voire les logs ou inspection ou autre information necessaire pour le utilisateur de chaque editeur celui dans le demo ou celle qui ne sont meme pas realiser ou celle specifique a une entreprise ou etablissement ou autre ,jour la meilleur choix en cas d ambiguité ne t arrete pas a acune raison prend la decesion ju squa tu finie le travail
```

### Huitième message

```text
je voulais une autre demos pour la creation des quiz avec plusieur condition pouvoire constuire un jsons avec cet editeur , aussi quand je fais un drag il ya une selection etrange qui sapplique a tous les dominos dans l editeur ,
```

### Neuvième message

```text
c est parfait , mais moi j'ai penseé a autre chose , plein des chose surtout le visuelle est pas mal par contre j ai adorer les detaille que tu as ajouter les animation les forme des domino... garde ca ,mais moi le plus interssat pas ca dans les demos que tu as fait , l  idee de a partir du jeux domino et la conception de jeux on peux cree un module qui permet d etre utiliser dans n importe quelle editeur on profitant du concepte du jeu domino pour la laison des bloc specifier a ce editeur pouvoire utiliser le chifre a gauche et a droit comme un logique predefinit par le devloppeur du bloc ou de la piere domino trouver un logique des connection a gauch aussi un logique des connnection a gauche , pouvoire a partire de ce module definir les connexion adjacente de haut ou en bas , defenir un logique et signification et specifier des event ou regle ou autre pour chaque domino , la couleur de chaque facade de domino aussi elle peux etre predefinit et signifier un truc a chaque editeur qui utilise ce module , predefinit lors de l instantiation et la apdptation de ce module dans un editeur , un domino peux ausii represente une bilihotheque ou autre projet raliser reutiliser dans un autre projet il saffiche par un domino avec deux facade , ou une classe qui par exemple une classe qui exige des parmatre pour linstancier , je dois pouvoire la declarer dans une section avec un domino et la utiliser avec le concepte de domino comme instance pouvoire appeler une fonction public partager par un point avec un couleur specifique pouvoire apart de connecter deux domino pouvoir connecter un point de sortie avec un point d entrer d un domino avec une ligne qui prend la couleur des deux point relier aussi pouvoire connecte un point de sortie d un domino libre avec un entreé d un domino (la point ) aussi pouvoire connecté un domino avec un domino libre en asynchrone ou synchrone selon la domino appeler , aussi pouvoir defenit que cet appel est bloquant ou pas , et ces dominos libre il sont de classe ou des bilihothethequ je peux les ouvrire dans une autre onglet pour voire le dominos la dont , ce que je voulais dire construire un monde ou on peux l utiliser pour construire un langage visuelle fait trop attention a ca je voulais construire avec le concepte de domino une platforme ou framwork ou module riche basé sur le concepte domino qui permet a construire des editeur des langage visuelle des outill de automatisaion ou de construire une solution de logique flexible forte manupulable de haute qualité pour pouvoir realiser n imaporte q quelle editeur (prend blockly comme exemple mais moi je voulais un truc plus puissant ) fait ca repart de nouveau , casse tous frontier , change tous qui ne va pas avec ce concepte et tu as toute permission de choisir le bon demarche ou tous decision sont de me retourner et ne sarrete pas tan que tu na pas terminer
```

### Dixième message

```text
je voulais que tu fonce plus loin dans le projet pour qu il soit un module ou framwork ou concepte qui expose un truc formidable configurable pour les autre pour construire des editeur meme des jeux ou un langage visuelle ou des truc facinante et meme les truc non pas facinante , je cherche a cree une base ou framwork ou biliohteque qui est capable a construire ou representé un detaille ou une theorie complexe ou mecanisme ou philosophie dans ce module avec des representaion en un pier de domino , pour cela j ai insiste que un domino peux etre une variable comme il peux etre une classe , il peux etre un ligne de code comme il peux etre un module ou projet ou scenario ou un complexe workflow ou algo qu on peux le consulter dans une autre onglet , ce editeur dois pouvoire utitilser pour construire n importe quoi . moi je parle avec un backgroud devloppeur don je met des exemples dans le edteur de programmation , je voulais que ce framwork a une flexibiliter enorme qui le rend utilisable dans tous les domaine ou les editeur visuelle , et q uil permet d exposer un editeur speciale et meme unique a chaque besoin ou cas ou autre ..., l idee de domino comme des bloc au contraire de blockly et de realiser un truc plus fort plus configurable plus puissant plus fluide plus jolie plus riche plus extensible plus jolie plus presentable plus avancer plus gerable ( blockly par exemple nous permet de construire plein des bloc avec plien des options ou configuration ou contexte , expose des call back des events , des truc autorise ou pas , un generateur pour chaque bloque a defenire ... des different type des blocs , des diffrent event, ...) mois je voulais un framwork qui depasse ca qui genere juste du json avec une diversité enorme et un controle qui depasse blockly qui genere du json claire et manupulable par le createur de chaque bloc avec tous iformation dna sle contexte ou autre de chaque creation claire pour la partie generation ( ne fiat pas la partie generation , je voulais juste un mecanisme parfait ou tracage parfait ou une modelisation parfaite , modelisation ou definition parfaite pour chaque element domino projet , appelle
```

### Onzième message

```text
je voulais que tu appelle un agent expert dans les conception des projet et ihm ,pour que ce module soit d une enorme flexibilité pour que on pussent realiser des generateur de langage de programmation pouvoire construire des different blocs un editeur riche avec plusieur type daffichage des dominos pouvoire ouvrir deux anglet cote a cote dupliquepouvoire choisir les taille des engolet afficher cote a cote avec une grande qualité de code et la documentation et que chaque domino soit representer par un json qui respecte une abstraction hautement profetionelle extensible , dans l editeur ajouter un menue file en haut avec les feld nouveu projet , Nouveau prospect avec un sou menue qui amene veres les autre type de projet ovrir un projet  ... ajoute tous les options d un vraie editeur , aussi utilise le local storage pour sauvgarder un projet et prend on concideration de saugarder sa dans le future dans des apis si on les definir dans uun fichier config  comme un vraie editeur qui contient le travaille ou le workspace ,choisir toujour la methode recomndé par tois et prend la decision sont revenir vers mois jusqu a tu termine cette demande
```

### Douzième message

```text
je voulais que tu cree un quiz avec 20 questions differente ( type choix unique , entree un nombre entre n et y , choix plusieur reponce , choix exactement i nombre de reponces , choisir une reponse selon le choix de une precendent reponse, choisir des choix retourner par une classe (une fonction dans une classe presenter par un domino qui retourne des resultat dans un json paeeler par le domino liste des choix , 5 sous chemin definit par dans un  domino de type switch/case qui selon une condition ou une reponse passe au chemin appropier , un dominos qui ammene a un autre domino dans le workflow une question precedente ou sauter des question et amene a un domino precise et des autre questions ou etape de diffenrent type de reponce ) tu fait un quiz et apartir de ce quiz tu construit les bloc necessaire pour cet editeur et tu ameliore le core pour qu il soit capable a construire ce editeur et redefinir ou ajouter des type de connexion ou des format dans le core ou des nouveau fonctionalité a fin de livrer un editeur quiz avec ihm et facilité d usage puissant ainse que la capacité et la puissance , tous ca pour le but que le module soit plus fort plus extensible qui permet d etre utiliser pour la construction des editeur trop compliqué et pouvoire construire les element ou bloc ou lien ou autre comme un vraie framwork de haute qualité et flexibilité capable d etre utiliser pour construire tous genre de paterne ou architecture ou logique ou automatisation ou autre , le but est de cree un exelent framwork par ce quiz
```

### Treizième message

```text
tu reprend le travail tu invoque tou savant concepteur pour que vette outiile remplace tous autre outille , pour que cette outille expose un logique de genie , un truc unique , un truc flexible...une solution unque et performante pour la creation de tous type des editeur
```

### Quatorzième message

```text
c est magnifique mercie enormement pou ce beau travil ,mais pas des lien externe ou cdn externe  dans le projet utiliser npm pour des bibliohtheque externe , ajouter la possibiliter des faire des selections multiple par clique sur ctrl et clique sourie ou par le sourie on faire une selection on cliqaunt sur le clique droite + ctrl et deplacant le sourie , ctrl pour diffferencer le depalcement dans l editeur et la selection , aussi une amelioration dans la template qu elle soit centraliser coté code facile a modifier aussi un toolbox qu on peux le minimiser et il affiche que les dominos ou l aficher entierement avec affcihage par categorie et cahque catergorie peux etre presente par un domino aussi des sous categorie on peux les expande ou les deexpande aussi le menue il dois etre dynamique presenter par json qui defenie les categorie les sous categories les element les text titre decription help lien si il existe , aussi je voulais pouvoire fair un build de cet editeur dans dist avec les demos et tous faire tous avec un niveau extreme de qualité de niveau de code et surtout la separtion des module ou composant
```

### Quinzième message

```text
maitenant je voulais que tu regarde le repertoire postmanFile et que tu modifier le coeur du module ou le concepte d usage de dominos cree par le devloppeur pour realiser et pouvoire cree une editeur qui a le meme concepte de postmain qui permet de visualise et crees des tnr test scenarios aussi pouvoire configurer ce editeur pour avoire dans le les logs tous info utile pour un testeur aussi un visuelle qui presente le scenarios aussi une dashborde avec un toolbox qui affiche trop bien la collection aussi les sous collection ainsi que les apis , des domino de passage de contenue presenter par des dominos , pour bien decrire ce que je veux et de pouvoire faire des scripte automatiser par les piere de domino partager ou moifier une variable d environnment , aussi le truc important pouvoire cree des scenario et scipte automatiser avec les piere domino dans un editeur visuelle qui accepte dimporter des json exporter par poste man et il exporte des automatisation accepeter par post man , donc je voulais que tu cree ce editeur avec les apis et environement dans le repertoire et que tu prend cet editeur d apis un rendue de notre module dominos et une base pour ameliorer le module pour qui il peux realiser ce genre de editeur visuelle et meme plus , ameliorer le module ajouter ce editeur et fait un exemple qui couvre les apis postmain et les variable d environement rajouter , le but et de generer un paterne trouver la meilleur facon d afficher ou cree une simple piere de dominos dans un projet editeur visuelle complex donc tu ose pas a modifier le core ou le concepte ou autre chose qui empeche cette flexibilité ou de rajouter des ideé ou flexibilité ou richecche don le concepte de module
```
