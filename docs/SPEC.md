# SPEC — Hospitrend V1

> Version 1.0 — 2026-11-03. Document de référence du périmètre de la V1.
> Contexte, persona et principes : voir `CLAUDE.md`. Sources : `docs/sources.md`. Taxonomie : `docs/sujets.md`.

## 1. Objectif de la V1

Donner à une directrice commerciale d'un groupe hôtelier un flux quotidien d'actualités du secteur, présentées en cartes à swiper. Le flux apprend ses centres d'intérêt au fil de ses choix. La V1 sert **une seule utilisatrice**. Le modèle de données reste prêt pour plusieurs comptes.

## 2. Contraintes

| Contrainte | Décision |
|---|---|
| Plateforme | Web app **PWA mobile first**, installable sur l'écran d'accueil. Utilisable aussi sur ordinateur. |
| Stack | Next.js + TypeScript + Tailwind CSS, Supabase (PostgreSQL + authentification), hébergement Vercel. |
| Budget | **0 € par mois.** Offres gratuites uniquement : Vercel Hobby, Supabase Free. Pas d'API payante. |
| Connexion | Compte **Google** uniquement. |
| Langues | Interface en français. Sources en français, anglais et espagnol. Résumés affichés en français. |
| Échéance | Au plus tôt. Une première démo partielle est visée rapidement (voir §7). |

Conséquences des offres gratuites :
- Vercel Hobby limite les tâches planifiées à **une exécution par jour**. L'ingestion se fait donc une fois par jour, tôt le matin.
- Supabase Free met en pause un projet inactif depuis 7 jours. L'ingestion quotidienne le garde actif.
- **Résumés, traduction et classement** : la méthode reste à choisir (voir §8, décision D1). Dans tous les cas, l'application doit fonctionner sans résumé généré : elle affiche alors l'extrait fourni par la source.

## 3. Périmètre fonctionnel V1

| ID | Story | Épique |
|---|---|---|
| US-01 | Se connecter avec Google | Onboarding |
| US-02 | Choisir ses thèmes de départ | Onboarding |
| US-03 | Mini tutoriel | Onboarding |
| US-04 | Voir une actualité en carte | Flux |
| US-05 | Liker / disliker d'un geste | Flux |
| US-06 | Lire en détail | Flux |
| US-07 | Annuler le dernier choix | Flux |
| US-08 | Flux quotidien fini et configurable | Flux |
| US-09 | Savoir pourquoi une carte est proposée | Flux |
| US-10 | Le flux s'adapte aux choix | Apprentissage |
| US-11 | Garder une part de découverte | Apprentissage |
| US-12 | Voir et ajuster son profil d'intérêts | Apprentissage |
| US-14 | Sauvegarder une actualité | Exploiter l'info |
| US-16 | Partager une actualité | Exploiter l'info |
| US-19 | Collecter les actualités automatiquement | Contenus |
| US-20 | Résumer et classer chaque article | Contenus |
| US-21 | Éviter les doublons | Contenus |
| US-22 | Gérer les sources (page admin) | Contenus |
| US-24 | Mesurer l'usage | Pilotage |

US-03 n'était pas dans le lot MVP initial. Elle est retenue parce qu'elle est peu coûteuse et utile pour une première prise en main sans accompagnement.

---

## 4. User stories et critères d'acceptation

Format des critères : **Étant donné** (contexte) / **Quand** (action) / **Alors** (résultat attendu).

### Onboarding

#### US-01 — Se connecter avec Google
En tant qu'utilisatrice, je veux me connecter avec mon compte Google, afin de ne pas gérer un mot de passe de plus.

- **CA1** Étant donné que je ne suis pas connectée, quand j'ouvre l'app, alors je vois un écran d'accueil avec un unique bouton « Continuer avec Google ».
- **CA2** Étant donné que mon adresse Google figure dans la liste des comptes autorisés, quand je me connecte, alors j'arrive sur l'onboarding (première fois) ou sur le flux (fois suivantes).
- **CA3** Étant donné que mon adresse n'est **pas** autorisée, quand je me connecte, alors je vois le message « Accès réservé » et aucune donnée n'est créée.
- **CA4** Étant donné que je suis connectée sur mon téléphone, quand je ferme puis rouvre l'app (même plusieurs jours après), alors je reste connectée.
- **CA5** Je peux me déconnecter depuis l'écran Profil.

Notes : la liste des comptes autorisés est une variable d'environnement (`ALLOWED_EMAILS`). Un compte autorisé peut être marqué administrateur (`ADMIN_EMAILS`).

#### US-02 — Choisir mes thèmes de départ
En tant qu'utilisatrice, à ma première connexion, je veux choisir les thèmes qui m'intéressent, afin que mon premier flux soit déjà pertinent.

- **CA1** Étant donné ma première connexion, quand l'onboarding s'affiche, alors je vois les 13 thèmes de `docs/sujets.md`, avec icône et libellé en français. Les 4 thèmes cœur (Hôtellerie, Tourisme, MICE, Bien-être) sont présélectionnés.
- **CA2** Le bouton « Continuer » est désactivé tant que moins de 3 thèmes sont sélectionnés.
- **CA3** Quand je valide, alors chaque thème choisi reçoit un poids initial positif dans mon profil d'intérêts, et les autres un poids neutre.
- **CA4** Je peux modifier ces thèmes plus tard depuis l'écran Profil (voir US-12).

#### US-03 — Comprendre le fonctionnement
En tant qu'utilisatrice, je veux un mini tutoriel, afin d'être à l'aise dès la première carte.

- **CA1** Après l'onboarding, 3 écrans expliquent : swipe à droite = intéressant, swipe à gauche = pas pour moi, toucher la carte = lire en détail.
- **CA2** Un bouton « Passer » est visible sur chaque écran.
- **CA3** Le tutoriel ne s'affiche qu'une fois. Il reste accessible depuis Profil > Aide.

### Flux de cartes

#### US-04 — Voir une actualité sous forme de carte
En tant qu'utilisatrice, je veux voir une actualité à la fois, afin de juger en quelques secondes si elle m'intéresse.

- **CA1** Une carte affiche : image (ou visuel par défaut du thème si l'article n'en a pas), titre, nom de la source, date relative (« il y a 2 j »), résumé court (3 phrases maximum), thème principal.
- **CA2** Sur un écran de 375 × 667 px (iPhone SE), la carte entière est visible sans faire défiler.
- **CA3** Un article en anglais ou en espagnol affiche un résumé en français et un badge de langue (EN, ES). Le titre original reste visible.
- **CA4** Si aucun résumé généré n'est disponible, la carte affiche l'extrait fourni par la source, tronqué à 3 phrases.
- **CA5** La carte suivante est déjà visible en arrière-plan (effet de pile).

#### US-05 — Liker ou disliker d'un geste
En tant qu'utilisatrice, je veux swiper à droite pour « intéressant » et à gauche pour « pas pour moi », afin de trier rapidement.

- **CA1** Quand je fais glisser la carte, alors elle suit mon doigt et s'incline. Un indicateur « J'aime » (vert) ou « Pas pour moi » (gris) apparaît selon la direction.
- **CA2** Au-delà d'un seuil (environ 30 % de la largeur de l'écran), relâcher valide le choix. En deçà, la carte revient à sa place.
- **CA3** Deux boutons sous la carte (✕ et ♥) produisent le même résultat que le swipe. Sur ordinateur, les flèches gauche et droite du clavier aussi.
- **CA4** Quand je valide un choix, alors l'interaction (`like` ou `dislike`) est enregistrée avec l'horodatage, et la carte suivante s'affiche en moins de 300 ms.
- **CA5** Hors connexion, le choix est mis en file d'attente et envoyé au retour du réseau.

#### US-06 — Lire en détail
En tant qu'utilisatrice, je veux toucher une carte pour en savoir plus, afin d'approfondir un sujet qui m'interpelle.

- **CA1** Quand je touche la carte, alors une vue détaillée s'ouvre avec : titre, source, date, résumé détaillé en points clés, encadré « Ce que ça change pour un hôtel », thèmes et tags.
- **CA2** Un bouton « Lire l'article » ouvre l'article original dans un nouvel onglet.
- **CA3** Depuis la vue détaillée, je peux liker, disliker ou sauvegarder. Liker ou disliker ferme la vue et passe à la carte suivante.
- **CA4** Un bouton « Retour » ramène à la carte sans enregistrer de like ni de dislike.
- **CA5** L'ouverture est enregistrée (`open`), ainsi que la durée passée dans la vue détaillée.
- **CA6** Si l'article a été regroupé avec d'autres (US-21), la vue liste les autres sources qui traitent le même sujet.
- **CA7** Si le résumé détaillé n'est pas disponible, la vue affiche l'extrait de la source et le bouton « Lire l'article ». L'encadré « Ce que ça change pour un hôtel » est alors masqué.

#### US-07 — Annuler mon dernier choix
En tant qu'utilisatrice, je veux annuler mon dernier swipe, afin de corriger un geste malheureux.

- **CA1** Après un swipe, un bouton « Annuler » (↺) est disponible.
- **CA2** Quand je touche « Annuler », alors la dernière carte revient au sommet de la pile.
- **CA3** L'interaction annulée est marquée `undone` et n'a plus aucun effet sur le profil d'intérêts.
- **CA4** Seul le dernier choix est annulable. Après une annulation, le bouton est désactivé jusqu'au swipe suivant.

#### US-08 — Avoir un flux quotidien fini et configurable
En tant qu'utilisatrice, je veux une sélection quotidienne limitée, dont je choisis la taille et l'heure, afin de faire ma veille en une dizaine de minutes.

- **CA1** Par défaut, le flux contient **25 cartes**, disponibles à partir de **7 h** (heure de Paris).
- **CA2** Dans Profil > Réglages, je peux choisir le nombre de cartes (10 à 50, par pas de 5) et l'heure (de 5 h à 12 h, par pas de 30 min).
- **CA3** Un indicateur de progression est visible (ex. « 12 / 25 »).
- **CA4** Quand j'ai traité toutes les cartes, alors un écran « Vous êtes à jour » s'affiche, avec un bouton « 5 cartes de plus » (si des articles restent disponibles) et un lien vers mes sauvegardes.
- **CA5** Si j'ouvre l'app avant l'heure choisie, je retrouve les cartes non traitées du flux précédent, s'il en reste.
- **CA6** Un article de plus de **7 jours** n'entre jamais dans un flux.
- **CA7** Un article déjà montré (liké, disliké ou passé) n'est jamais remontré, sauf annulation (US-07).
- **CA8** Un changement de réglage s'applique au flux suivant.

Note technique : le flux du jour est construit à la première ouverture après l'heure choisie, à partir des articles déjà ingérés. Cela évite une tâche planifiée par utilisatrice (limite de Vercel Hobby).

#### US-09 — Savoir pourquoi une carte m'est proposée
En tant qu'utilisatrice, je veux voir la raison de la recommandation, afin de faire confiance au flux.

- **CA1** Chaque carte affiche une ligne discrète : « Parce que vous aimez : *thème ou tag* », ou « Découverte » pour les cartes d'exploration (US-11).
- **CA2** La raison affichée correspond au thème ou au tag qui a le plus contribué au score de l'article.

### Apprentissage des intérêts

#### US-10 — Le flux s'adapte à mes choix
En tant qu'utilisatrice, je veux que mes choix modifient les actualités proposées, afin que le flux devienne plus pertinent au fil des jours.

- **CA1** Chaque interaction met à jour les poids des thèmes et des tags de l'article, selon le barème :

| Interaction | Effet sur le poids |
|---|---|
| Sauvegarde | +3 |
| Like après lecture détaillée | +2,5 |
| Like direct | +1,5 |
| Ouverture de plus de 20 s | +0,5 |
| Dislike après lecture détaillée | −1 |
| Dislike direct | −1,5 |

- **CA2** Le score d'un article = somme des poids de ses thèmes (principal ×1, secondaires ×0,5) et de ses tags, multipliée par un facteur de fraîcheur (1 le jour même, 0,5 à 7 jours).
- **CA3** Le flux sélectionne les articles de meilleur score, avec **au maximum 40 % des cartes d'un même thème principal**.
- **CA4** Étant donné que j'ai liké plusieurs articles d'un thème, quand le flux suivant est construit, alors ce thème y est plus représenté qu'avant. Ce comportement est couvert par un test automatisé.
- **CA5** Le barème est centralisé dans un seul fichier de configuration, pour pouvoir l'ajuster facilement.

#### US-11 — Garder une part de découverte
En tant qu'utilisatrice, je veux voir aussi des sujets hors de mes habitudes, afin de découvrir des innovations auxquelles je n'aurais pas pensé.

- **CA1** **20 % des cartes** du flux (arrondi à l'entier inférieur, soit 5 cartes sur 25) sont des cartes « Découverte ».
- **CA2** Une carte Découverte est choisie parmi les articles récents dont le thème principal a un poids neutre ou faible, en excluant les thèmes bloqués (US-12).
- **CA3** Les cartes Découverte sont réparties dans le flux, pas regroupées à la fin.
- **CA4** Les interactions sur une carte Découverte mettent à jour le profil comme les autres.

#### US-12 — Voir et ajuster mon profil d'intérêts
En tant qu'utilisatrice, je veux voir et corriger ce que l'app a appris, afin de garder la main sur ma veille.

- **CA1** L'écran « Mes intérêts » liste les 13 thèmes, triés par poids, avec une jauge de niveau (5 niveaux), et les 10 tags les plus forts.
- **CA2** Pour chaque thème ou tag, je peux choisir « Plus » (+3), « Moins » (−3) ou « Ne plus voir ».
- **CA3** Un thème ou tag en « Ne plus voir » est exclu de tous les flux, y compris des cartes Découverte. Je peux le réactiver depuis la même page.
- **CA4** Un ajustement s'applique dès le flux suivant, ou dès les « 5 cartes de plus ».
- **CA5** Un bouton « Réinitialiser mes intérêts » remet le profil à l'état de l'onboarding, après confirmation.

### Exploiter l'information

#### US-14 — Sauvegarder une actualité
En tant qu'utilisatrice, je veux mettre une actualité de côté, afin de la retrouver en réunion ou de la lire plus tard.

- **CA1** Un bouton signet est disponible sur la carte et dans la vue détaillée.
- **CA2** Sauvegarder n'enlève pas la carte du flux. Je dois quand même liker ou disliker pour passer à la suivante.
- **CA3** L'écran « Mes sauvegardes » liste les articles sauvegardés, du plus récent au plus ancien, avec titre, source, date et thème. Un filtre par thème est disponible.
- **CA4** Je peux retirer une sauvegarde depuis cet écran ou depuis la vue détaillée.
- **CA5** Une sauvegarde reste accessible même après 7 jours (la limite de fraîcheur ne s'applique qu'au flux).

#### US-16 — Partager une actualité
En tant qu'utilisatrice, je veux partager une actualité, afin d'en faire profiter mon équipe.

- **CA1** Un bouton « Partager » est disponible dans la vue détaillée et dans « Mes sauvegardes ».
- **CA2** Sur mobile, il ouvre le menu de partage natif du téléphone (e-mail, WhatsApp, Teams…), avec le titre, le résumé court et le lien de l'article original.
- **CA3** Si le partage natif n'est pas disponible (certains navigateurs d'ordinateur), le texte est copié dans le presse-papiers et un message « Copié » s'affiche.
- **CA4** Le lien partagé est celui de l'article original, jamais un lien vers Hospitrend.

### Contenus (système et admin)

#### US-19 — Collecter les actualités automatiquement
En tant qu'administrateur, je veux que les articles des sources soient récupérés chaque jour, afin d'alimenter le flux sans intervention.

- **CA1** Une tâche planifiée s'exécute une fois par jour, avant 6 h (heure de Paris). Elle récupère les flux RSS de toutes les sources actives (les 33 sources de `docs/sources.md`, ou leur équivalent Google News RSS si elles n'ont pas de flux).
- **CA2** Pour chaque article, on enregistre : titre, URL, source, date de publication, image, extrait, langue.
- **CA3** Les articles de plus de 7 jours et les URLs déjà connues sont ignorés.
- **CA4** Une source en erreur (indisponible, flux invalide) n'empêche pas la collecte des autres. L'erreur est journalisée.
- **CA5** Chaque exécution est journalisée : date, nombre d'articles par source, erreurs.
- **CA6** Une source en erreur 3 jours de suite est signalée dans la page admin.
- **CA7** Les articles de plus de 30 jours qui ne sont pas sauvegardés sont supprimés, pour rester dans le quota gratuit de Supabase.

#### US-20 — Résumer et classer chaque article
En tant qu'administrateur, je veux que chaque article soit résumé en français et classé, afin d'être prêt à être affiché.

- **CA1** Chaque article reçoit : un résumé court (3 phrases maximum), un résumé détaillé (3 à 5 points clés), un encadré « Ce que ça change pour un hôtel » (2 phrases maximum), 1 thème principal, 0 à 2 thèmes secondaires et jusqu'à 5 tags.
- **CA2** Les résumés sont rédigés en français, quelle que soit la langue de l'article.
- **CA3** Les thèmes proviennent exclusivement de la taxonomie de `docs/sujets.md`.
- **CA4** Le résumé ne contient aucune information absente de l'article source. Le prompt l'exige explicitement.
- **CA5** Un article dont le contenu est inexploitable (vide, paywall total, hors sujet) est marqué « ignoré » et n'entre pas dans les flux.
- **CA6** Si le résumé n'a pas pu être produit, l'article reste éligible au flux avec son extrait source (voir US-04 CA4). Il est alors classé par correspondance avec les mots-clés de la taxonomie.
- **CA7** La méthode de génération dépend de la décision D1 (§8).

#### US-21 — Éviter les doublons
En tant qu'utilisatrice, je ne veux pas voir plusieurs fois la même information, afin de ne pas perdre de temps.

- **CA1** Deux articles avec la même URL (paramètres de tracking retirés) sont un seul article.
- **CA2** Deux articles publiés à moins de 72 h d'intervalle avec des titres très proches (similarité ≥ 0,8 après normalisation) sont regroupés.
- **CA3** Un groupe n'apparaît qu'une fois dans le flux. La carte affichée est celle de la source de meilleure fiabilité, et les autres sources sont listées dans la vue détaillée (US-06 CA6).
- **CA4** La logique de regroupement est couverte par des tests automatisés.

Note : le regroupement entre langues (même sujet en français et en anglais) n'est pas exigé en V1.

#### US-22 — Gérer les sources (page admin)
En tant qu'administrateur, je veux gérer les sources depuis une page dédiée, afin de faire évoluer la couverture sans toucher au code.

- **CA1** La page `/admin` n'est accessible qu'aux comptes listés dans `ADMIN_EMAILS`. Les autres reçoivent une erreur 404.
- **CA2** Elle liste les sources avec : nom, URL du flux, langue, fiabilité (1 à 3), statut (active ou inactive), date de dernière collecte réussie, nombre d'articles collectés sur 7 jours, erreur éventuelle.
- **CA3** Je peux ajouter une source (nom, URL du flux, langue, fiabilité). L'URL est testée à l'enregistrement : si le flux n'est pas lisible, un message l'indique et la source n'est pas enregistrée.
- **CA4** Je peux modifier une source, ou l'activer et la désactiver. Je ne peux pas la supprimer si des articles sauvegardés en dépendent.
- **CA5** Un bouton « Lancer la collecte maintenant » déclenche une ingestion immédiate.
- **CA6** Les 33 sources de `docs/sources.md` sont créées au premier déploiement (script d'initialisation).

### Pilotage

#### US-24 — Mesurer l'usage
En tant qu'administrateur, je veux savoir comment l'app est utilisée, afin d'en discuter avec l'utilisatrice et d'améliorer le produit.

- **CA1** Sont mesurés, sans outil tiers (dans la base Supabase) : jours d'utilisation, sessions par jour, cartes traitées par jour, taux de like, nombre d'ouvertures, de sauvegardes et de partages, flux terminés.
- **CA2** Une section « Usage » de la page admin affiche ces indicateurs sur 7 et 30 jours.
- **CA3** Aucun outil d'analytics externe, aucun cookie publicitaire.

---

## 5. Exigences non fonctionnelles

- **Mobile first** : conçu pour 375 px de large d'abord. Les zones tactiles font au moins 44 × 44 px.
- **PWA** : manifest, icônes, installable sur iOS et Android. Le flux du jour reste consultable hors connexion une fois chargé.
- **Performance** : premier affichage du flux en moins de 2 s sur une connexion 4G.
- **Accessibilité** : toute action faite par geste existe aussi en bouton. Contrastes conformes WCAG AA.
- **Sécurité** : aucune clé ni secret dans le repo (le repo est public). Accès aux données protégé par les règles de sécurité de Supabase (Row Level Security) : chaque utilisatrice ne voit que ses interactions.
- **Droits d'auteur** : on n'affiche que des résumés et des extraits courts, toujours avec la source et le lien vers l'article original.
- **RGPD** : données limitées au nécessaire. Suppression du compte et des données possible sur demande (manuellement en V1).
- **Tests** : tests automatisés sur le scoring (US-10, US-11), la construction du flux (US-08) et le dédoublonnage (US-21).

## 6. Hors périmètre V1

| Élément | Prévu |
|---|---|
| Notifications push (flux prêt) — US-18 | V2 |
| Recherche par mot-clé dans les sauvegardes et l'historique — US-15 | V2 |
| Suivre une entreprise ou un mot-clé précis — US-13 | V2 |
| Récapitulatif hebdomadaire par e-mail — US-17 | V2 |
| Signaler un contenu erroné — US-23 | V2 |
| Ouverture à d'autres utilisateurs (inscription, équipes, rôles) | À décider après la V1 |
| Connexion autrement que par Google | Non prévu |
| Application native iOS / Android | Non prévu |
| Ingestion des newsletters par e-mail | Non prévu |
| Regroupement des doublons entre langues | V2 |
| Recommandation par modèle de machine learning | Non prévu (le barème suffit) |
| Toute fonctionnalité payante, et tout service payant | Non prévu |
| Interface en anglais ou en espagnol | Non prévu |

## 7. Découpage en livraisons

| Étape | Contenu | Objectif |
|---|---|---|
| **Démo 1** | Squelette Next.js PWA, connexion Google, flux de cartes swipables alimenté par une collecte RSS réelle (sans résumé généré : extraits source), lecture détaillée, sauvegarde | Montrer la mécanique et le ressenti à l'utilisatrice au plus vite |
| **Démo 2** | Résumés en français et classement (selon D1), onboarding, tutoriel, apprentissage (US-10, US-11), « pourquoi cette carte » | Flux personnalisé |
| **V1** | Annulation, partage, profil d'intérêts, réglages du flux, dédoublonnage, page admin, mesure d'usage, tests | Version complète |

## 8. Décisions ouvertes

| ID | Question | Options | Recommandation |
|---|---|---|---|
| D1 | Comment produire résumés, traduction et classement à 0 € ? L'abonnement Claude ne couvre pas l'API. | (a) Une routine Claude planifiée chaque matin, avec l'abonnement existant. (b) Pas d'IA en V1 : extraits source et classement par mots-clés. (c) API Claude payante (quelques euros par mois). | (a), avec (b) en secours automatique |
