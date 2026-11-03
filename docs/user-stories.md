# User stories — Hospitrend (V1)

Persona : **Claire**, directrice commerciale d'un groupe hôtelier (voir CLAUDE.md §2).
Priorités : **P0** = indispensable pour la première version utilisable, **P1** = juste après, **P2** = plus tard.

---

## Épique 1 — Démarrage et onboarding

**US-01 (P0) — Créer mon compte**
En tant que Claire, je veux me connecter simplement (lien magique par e-mail ou compte Google), afin de ne pas gérer un mot de passe de plus.
- Critères : connexion en moins d'une minute ; session conservée sur mobile ; déconnexion possible.

**US-02 (P0) — Choisir mes thèmes de départ**
En tant que Claire, à ma première connexion, je veux cocher les thèmes qui m'intéressent (hôtellerie, tourisme, bien-être, distribution, tech, RSE…), afin que mon premier flux soit déjà pertinent.
- Critères : liste des thèmes avec icône ; au moins 3 thèmes requis ; modifiable plus tard dans le profil.

**US-03 (P1) — Comprendre le fonctionnement**
En tant que Claire, je veux un mini tutoriel de 3 écrans (swipe droite, swipe gauche, tap pour lire), afin d'être à l'aise dès la première carte.
- Critères : passable ; ne s'affiche qu'une fois ; accessible depuis l'aide.

## Épique 2 — Flux de cartes

**US-04 (P0) — Voir une actualité sous forme de carte**
En tant que Claire, je veux voir une actualité à la fois avec titre, image, source, date et résumé court, afin de juger en quelques secondes si elle m'intéresse.
- Critères : résumé de 2 à 3 phrases maximum ; source et date toujours visibles ; thème(s) affiché(s) ; lisible sur un écran de téléphone sans scroll.

**US-05 (P0) — Liker ou disliker d'un geste**
En tant que Claire, je veux swiper à droite pour « intéressant » et à gauche pour « pas pour moi », afin de trier rapidement.
- Critères : swipe tactile et boutons équivalents (accessibilité, ordinateur) ; retour visuel pendant le geste ; carte suivante affichée immédiatement ; interaction enregistrée.

**US-06 (P0) — Lire en détail**
En tant que Claire, je veux toucher une carte pour voir un résumé détaillé et accéder à l'article original, afin d'approfondir un sujet qui m'interpelle.
- Critères : résumé détaillé (points clés, chiffres, « pourquoi c'est important pour un hôtel ») ; bouton vers l'article source ; je peux liker / disliker / sauvegarder depuis cette vue ; le temps de lecture est mesuré.

**US-07 (P1) — Annuler mon dernier choix**
En tant que Claire, je veux annuler mon dernier swipe, afin de corriger un geste malheureux.
- Critères : bouton « annuler » disponible pour la dernière carte ; l'interaction annulée n'influence pas mon profil.

**US-08 (P0) — Avoir un flux quotidien fini**
En tant que Claire, je veux une sélection de 20 à 30 actualités par jour, afin de faire ma veille en une dizaine de minutes et de savoir quand j'ai terminé.
- Critères : indicateur de progression (ex. 12/25) ; écran de fin « Vous êtes à jour » ; possibilité de demander quelques cartes de plus.

**US-09 (P1) — Savoir pourquoi une carte m'est proposée**
En tant que Claire, je veux voir la raison de la recommandation (« parce que vous suivez : Revenue management », « découverte »), afin de faire confiance au flux.

## Épique 3 — Apprentissage de mes intérêts

**US-10 (P0) — Le flux s'adapte à mes choix**
En tant que Claire, je veux que mes likes, dislikes, lectures et sauvegardes modifient les actualités proposées, afin que le flux devienne plus pertinent au fil des jours.
- Critères : chaque interaction met à jour les poids des thèmes et tags ; les signaux forts (sauvegarde, like après lecture) pèsent plus que les faibles ; effet visible dans les jours qui suivent.

**US-11 (P0) — Garder une part de découverte**
En tant que Claire, je veux que l'application me montre aussi des sujets en dehors de mes habitudes, afin de découvrir des innovations auxquelles je n'aurais pas pensé.
- Critères : environ 15 à 20 % du flux en exploration, signalé comme « Découverte ».

**US-12 (P1) — Voir et ajuster mon profil d'intérêts**
En tant que Claire, je veux voir mes thèmes et sujets préférés, et pouvoir en augmenter, réduire ou bloquer certains, afin de garder la main sur ma veille.
- Critères : liste des thèmes avec niveau d'intérêt ; actions « plus », « moins », « ne plus voir » ; effet dès le flux suivant.

**US-13 (P2) — Suivre une entreprise ou un sujet précis**
En tant que Claire, je veux suivre explicitement un concurrent, une marque ou un mot-clé (ex. « Accor », « tourisme d'affaires Lyon »), afin d'être sûre de ne rien rater à son sujet.

## Épique 4 — Retrouver et exploiter l'info

**US-14 (P0) — Sauvegarder une actualité**
En tant que Claire, je veux sauvegarder une actualité pour la retrouver plus tard, afin de la ressortir en réunion ou de la lire tranquillement.
- Critères : bouton signet sur la carte et en lecture détaillée ; liste « Mes sauvegardes » triée par date.

**US-15 (P1) — Rechercher dans mes sauvegardes et mon historique**
En tant que Claire, je veux filtrer mes sauvegardes par thème et rechercher par mot-clé, afin de retrouver vite une info.

**US-16 (P1) — Partager une actualité**
En tant que Claire, je veux partager une actualité (e-mail, WhatsApp, Teams) avec son résumé et le lien, afin d'en faire profiter mon équipe.

**US-17 (P2) — Recevoir un récapitulatif hebdomadaire**
En tant que Claire, je veux recevoir chaque lundi un e-mail avec les 5 actualités marquantes de la semaine selon mon profil, afin de ne rien rater si je n'ai pas ouvert l'app.

## Épique 5 — Notifications et habitude

**US-18 (P1) — Être prévenue que mon flux est prêt**
En tant que Claire, je veux une notification à l'heure de mon choix (ex. 8h), afin d'en faire un rituel quotidien.
- Critères : heure configurable ; désactivable ; une seule notification par jour maximum.

## Épique 6 — Contenus et sources (côté système / administrateur)

**US-19 (P0) — Collecter les actualités automatiquement**
En tant qu'administrateur, je veux que l'application récupère régulièrement les articles des sources configurées, afin d'alimenter le flux sans intervention.
- Critères : collecte au moins quotidienne ; gestion des erreurs de source sans bloquer les autres ; journal des collectes.

**US-20 (P0) — Résumer et classer chaque article**
En tant qu'administrateur, je veux que chaque article soit résumé (court et détaillé), traduit en français si besoin, et classé dans les thèmes, afin d'être prêt à être affiché.
- Critères : résumés fidèles à l'article, sans invention ; thèmes issus de la taxonomie du CLAUDE.md ; article ignoré si le contenu n'est pas exploitable.

**US-21 (P0) — Éviter les doublons**
En tant que Claire, je ne veux pas voir trois fois la même info reprise par trois médias, afin de ne pas perdre de temps.
- Critères : regroupement des articles traitant du même sujet ; une seule carte affichée, avec les autres sources accessibles en lecture détaillée.

**US-22 (P1) — Gérer les sources**
En tant qu'administrateur, je veux ajouter, désactiver ou modifier une source (RSS, site, API), afin de faire évoluer la couverture de la veille.

**US-23 (P2) — Signaler un contenu non pertinent ou erroné**
En tant que Claire, je veux signaler une carte hors sujet ou un résumé incorrect, afin d'améliorer la qualité du contenu.

---

## Proposition de premier lot (MVP)

US-01, US-02, US-04, US-05, US-06, US-08, US-10, US-11, US-14, US-19, US-20, US-21.
Avec ce lot, Claire peut se connecter, choisir ses thèmes, swiper un flux quotidien réel, lire en détail, sauvegarder, et voir le flux s'adapter.
