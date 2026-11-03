# CLAUDE.md — Hospitrend

> Application de veille personnalisée pour les directeurs et directrices commerciaux de l'hôtellerie.
> Ce fichier guide Claude (et tout contributeur) sur la vision, le domaine métier et les conventions du projet.
> Décisions de setup validées le 2026-11-03 : PWA mobile first, stack Next.js + TypeScript + Supabase + API Claude, une seule utilisatrice au départ, contenus FR / EN / ES, code en anglais.

## 1. Vision

Les directeurs commerciaux d'hôtels manquent de temps pour suivre les innovations et l'actualité de leur secteur. Hospitrend leur sert chaque jour un flux court d'actualités pertinentes, présentées une par une sous forme de cartes. L'utilisatrice indique d'un geste si le sujet l'intéresse ou non, et l'application apprend progressivement ses centres d'intérêt pour affiner le flux.

Promesse : **« 10 minutes par jour pour ne plus rien rater de ce qui compte dans mon métier. »**

## 2. Utilisatrice cible (persona principal)

**Claire, directrice commerciale d'un groupe hôtelier** (plusieurs établissements).

- Pilote le revenu, la distribution, les partenariats et les ventes groupes / MICE / corporate.
- Peu de temps, consulte surtout sur mobile, entre deux rendez-vous ou dans les transports.
- Veut repérer : les innovations à copier, les mouvements des concurrents, les tendances clients, les changements réglementaires, les idées d'offres ou de partenariats.
- Veut pouvoir **ressortir une info en réunion** : elle doit pouvoir la sauvegarder et la retrouver.
- Pas technophile : l'interface doit être évidente, sans réglages complexes.

## 3. Domaines de veille

Domaines cœur :
- **Hôtellerie** : ouvertures, rachats, enseignes, concepts, chiffres de fréquentation, RevPAR / ADR / TO.
- **Tourisme** : flux touristiques, destinations, saisonnalité, grands événements, tourisme d'affaires / MICE.
- **Bien-être** : spa, thermalisme, wellness, retraites, sommeil, nutrition.

Domaines connexes / annexes :
- Distribution et revenue management (OTA, Booking, Expedia, Airbnb, vente directe, channel managers, pricing dynamique).
- Tech hôtelière (PMS, CRM, IA, check-in digital, objets connectés, chatbots).
- Restauration et F&B en hôtel.
- RSE et développement durable (labels, sobriété, Clef Verte, Green Key).
- Expérience client, avis en ligne, réputation.
- Marketing, fidélité, réseaux sociaux, influence.
- Ressources humaines et recrutement dans l'hôtellerie.
- Réglementation (taxe de séjour, meublés de tourisme, normes, classement).
- Transport aérien et ferroviaire (impact sur les flux).
- Luxe, art de vivre, événementiel.

Chaque actualité porte un ou plusieurs **thèmes** et des **tags** libres (entreprises, lieux, concepts). La taxonomie détaillée (13 thèmes, sous-thèmes, mots-clés FR / EN / ES) est dans `docs/sujets.md` : c'est la référence.

## 4. Mécanique produit

### 4.1 Le flux de cartes (swipe)
- Une carte = une actualité : titre, visuel, source, date, résumé de 2 à 3 phrases, thèmes.
- **Swipe droite / bouton cœur** : « ça m'intéresse ».
- **Swipe gauche / bouton croix** : « pas pour moi ».
- **Tap sur la carte** : ouvre la lecture détaillée (résumé enrichi + lien vers l'article source).
- **Sauvegarder** (signet) : met l'article de côté pour plus tard, indépendamment du like.
- Annuler le dernier swipe doit être possible.
- Le flux est **fini** (ex. 20 à 30 cartes par jour) : on veut une habitude courte, pas un scroll infini.

### 4.2 Apprentissage des intérêts
Signaux collectés, du plus fort au plus faible :
1. Sauvegarde
2. Like après lecture détaillée
3. Like direct
4. Ouverture de la lecture détaillée (et temps de lecture)
5. Dislike après lecture
6. Dislike direct

- Un **profil d'intérêts** pondère thèmes et tags. Il est visible et modifiable par l'utilisatrice (« je ne veux plus voir X », « plus de Y »).
- Le classement du flux combine : score d'intérêt, fraîcheur, diversité.
- **Exploration obligatoire** : une part du flux (ex. 15 à 20 %) sort des intérêts connus, pour éviter la bulle et faire découvrir des domaines annexes.
- Démarrage à froid : un court onboarding où elle choisit ses thèmes de départ.
- V1 : scoring simple et explicable (pondérations par thème / tag). Pas de modèle opaque avant d'avoir des données.

### 4.3 Traitement des actualités
- Ingestion depuis les sources listées dans `docs/sources.md` (flux RSS en priorité, Google News RSS en complément).
- Déduplication des articles qui couvrent le même sujet.
- Résumé et classement thématique automatisés par LLM (API Claude).
- Toujours afficher la source et renvoyer vers l'article original. Ne jamais republier l'article complet (droits d'auteur).

## 5. Principes

- **Mobile first.** Tout doit marcher d'une main, en quelques secondes.
- **Sobriété** : peu de réglages, des choix par défaut intelligents.
- **Transparence** : l'utilisatrice peut comprendre pourquoi une carte lui est proposée (« parce que vous aimez : Revenue management »).
- **Confiance** : source et date toujours visibles, pas de contenu inventé. Les résumés LLM doivent rester fidèles à l'article.
- **Vie privée** : les données d'usage servent uniquement à personnaliser le flux. Conformité RGPD.

## 6. Langue

- Interface en **français**.
- Contenus : sources en **français, anglais et espagnol**. Les résumés affichés sont toujours en français ; le titre et le lien d'origine restent dans la langue source.
- Code, noms de variables, identifiants de la taxonomie et messages de commit : **anglais**.
- Documentation produit (CLAUDE.md, `docs/`) : **français**.

## 7. Stack technique

- **Plateforme** : web app **PWA, mobile first**, installable sur l'écran d'accueil. Pas d'app native en V1.
- **Front** : Next.js + TypeScript + Tailwind CSS, gestes de swipe via une librairie dédiée.
- **Back / données** : Next.js (routes API) + PostgreSQL (ex. Supabase pour la base et l'authentification).
- **Ingestion** : tâche planifiée (cron) qui récupère les flux, déduplique, résume et classe.
- **LLM** : API Claude pour résumé, traduction et classification thématique.
- **Hébergement** : Vercel ou équivalent.

## 8. Modèle de données (première ébauche)

Une seule utilisatrice au départ, mais toutes les données (interactions, profil, flux) sont rattachées à un `user_id` : ouvrir à d'autres utilisateurs plus tard ne doit pas demander de refonte. Pas de gestion d'équipes ni de rôles en V1, hormis un accès administrateur pour les sources.

- `User` : profil, préférences, thèmes de départ.
- `Source` : nom, URL, type (RSS / API), langue, fiabilité, actif ou non.
- `Article` : titre, URL, source, date de publication, image, résumé court, résumé détaillé, langue, thèmes, tags, empreinte de déduplication.
- `Interaction` : utilisateur, article, type (like, dislike, open, save, undo), durée de lecture, horodatage.
- `InterestProfile` : poids par thème et par tag, mis à jour à chaque interaction.
- `Feed` : sélection quotidienne d'articles par utilisateur, avec la raison de chaque recommandation.

## 9. Conventions de travail

- Toute nouvelle fonctionnalité part d'une user story (voir `docs/user-stories.md`).
- Repo GitHub privé `Hospitrend`, branche principale `main`.
- Petites PR, une story ou une partie de story par PR.
- Tests sur la logique de scoring et d'ingestion (la partie la plus critique).
- Ne jamais committer de clé d'API ; utiliser des variables d'environnement.
- Commandes de build, test et lint : **à compléter une fois la stack choisie.**

## 10. Hors périmètre V1

- Messagerie ou partage social entre utilisateurs.
- Génération de rapports automatiques.
- Monétisation.
- Recommandation par modèle de machine learning entraîné (le scoring simple suffit en V1).
