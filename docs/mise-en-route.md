# Mise en route — Démo 1

Ce guide explique, pas à pas, comment mettre Hospitrend en ligne avec des comptes **gratuits**. Comptez 30 à 45 minutes. Aucune ligne de commande n'est nécessaire : tout se fait dans le navigateur.

Vous allez créer trois choses :

1. un **projet Supabase** (la base de données et la connexion) ;
2. des **identifiants Google** (pour le bouton « Continuer avec Google ») ;
3. un **projet Vercel** (l'hébergement du site).

Gardez un fichier texte ouvert à côté pour noter les valeurs au fur et à mesure. Ces valeurs sont secrètes (sauf l'URL du projet) : ne les collez jamais dans le repo GitHub, qui est public.

---

## Étape 1 — Créer le projet Supabase (10 min)

1. Allez sur [supabase.com](https://supabase.com) et cliquez sur **Start your project**. Connectez-vous avec votre compte GitHub (le plus simple).
2. Cliquez sur **New project**.
   - **Name** : `hospitrend`
   - **Database password** : cliquez sur **Generate a password** et notez-le (il ne servira que rarement).
   - **Region** : `Europe (Paris)` ou `Europe (Frankfurt)`.
   - Plan : **Free**.
3. Cliquez sur **Create new project** et attendez environ deux minutes.
4. Notez les valeurs de connexion : menu de gauche **Project Settings** (roue dentée) > **API Keys** (ou **Data API** pour l'URL).
   - **Project URL** (`https://xxxx.supabase.co`) → ce sera `NEXT_PUBLIC_SUPABASE_URL`.
   - **Publishable key** (commence par `sb_publishable_`) → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
   - **Secret key** (commence par `sb_secret_`, cliquez sur l'œil pour l'afficher) → `SUPABASE_SECRET_KEY`. Celle-ci est la plus sensible : elle donne tous les droits sur la base.
   - Si votre projet n'affiche que des clés « legacy » : prenez `anon` pour la clé publique et `service_role` pour la clé secrète, cela fonctionne aussi.
   - Notez aussi l'identifiant du projet, la partie `xxxx` de l'URL : on en a besoin à l'étape 2.

## Étape 2 — Créer les tables (2 min)

1. Dans Supabase, menu de gauche : **SQL Editor** > **New query**.
2. Ouvrez le fichier [`supabase/schema.sql`](../supabase/schema.sql) sur GitHub, cliquez sur l'icône **Copy raw file**, puis collez tout dans l'éditeur.
3. Cliquez sur **Run**. Le message `Success. No rows returned` indique que tout s'est bien passé.

Ce script crée les tables (sources, articles, interactions, favoris, journal des collectes) et les règles de sécurité : chaque personne ne voit que ses propres choix. Il peut être relancé sans risque.

## Étape 3 — Créer les identifiants Google (10 min)

1. Allez sur [console.cloud.google.com](https://console.cloud.google.com) avec votre compte Google.
2. En haut à gauche, cliquez sur le sélecteur de projet > **Nouveau projet**. Nom : `Hospitrend`. Cliquez sur **Créer**, puis sélectionnez ce projet.
3. Menu ☰ > **API et services** > **Écran de consentement OAuth** (selon la version : **Google Auth Platform**). Cliquez sur **Commencer** :
   - **Nom de l'application** : `Hospitrend` ; **adresse e-mail d'assistance** : la vôtre.
   - **Audience** : **Externe**.
   - **Coordonnées** : votre e-mail. Acceptez les conditions et cliquez sur **Créer**.
4. Dans **Audience** > **Utilisateurs test**, cliquez sur **Add users** et ajoutez l'adresse Gmail de votre cousine et la vôtre. (Tant que l'application est « en test », seules ces adresses peuvent se connecter. C'est voulu.)
5. Dans **Clients** (ou **Identifiants** > **Créer des identifiants** > **ID client OAuth**) :
   - **Type d'application** : **Application Web** ; **Nom** : `Hospitrend web`.
   - **URI de redirection autorisés** > **Ajouter un URI** :
     `https://xxxx.supabase.co/auth/v1/callback` (remplacez `xxxx` par l'identifiant noté à l'étape 1).
   - Cliquez sur **Créer**. Notez l'**ID client** et le **Code secret du client**.

## Étape 4 — Activer Google dans Supabase (2 min)

1. Dans Supabase : **Authentication** > **Sign In / Providers** (ou **Providers**) > **Google**.
2. Activez **Enable Sign in with Google**, collez l'**ID client** et le **Code secret du client** de l'étape 3, puis **Save**.
3. Dans la même liste, ouvrez **Email** et désactivez-le, puis **Save**. Il est actif par défaut : n'importe qui pourrait sinon créer un compte par e-mail et remplir la base gratuite. Hospitrend n'utilise que Google.

## Étape 5 — Mettre le site en ligne sur Vercel (10 min)

1. Allez sur [vercel.com](https://vercel.com), **Sign Up** avec votre compte GitHub, plan **Hobby** (gratuit).
2. **Add New…** > **Project** > choisissez le repo `eremji/Hospitrend` > **Import**. (Si le repo n'apparaît pas, cliquez sur **Adjust GitHub App Permissions** et autorisez-le.)
3. Avant de cliquer sur **Deploy**, ouvrez **Environment Variables** et ajoutez une par une :

   | Nom | Valeur |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | l'URL du projet Supabase |
   | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | la clé `sb_publishable_…` |
   | `SUPABASE_SECRET_KEY` | la clé `sb_secret_…` |
   | `ALLOWED_EMAILS` | les adresses autorisées, séparées par des virgules (votre cousine, vous) |
   | `ADMIN_EMAILS` | votre adresse |
   | `CRON_SECRET` | une longue phrase au hasard (par exemple 40 caractères tapés au hasard) |

4. Cliquez sur **Deploy**. Au bout de deux minutes, Vercel affiche l'adresse du site, du type `https://hospitrend-xxxx.vercel.app`. Notez-la.

> Le projet ne doit pas encore être fusionné sur `main` ? Vercel déploie alors la branche `main` : la Démo 1 apparaîtra dès que la pull request sera fusionnée. Vous pouvez aussi ouvrir l'aperçu (« Preview ») que Vercel crée pour la pull request.

## Étape 6 — Dire à Supabase où se trouve le site (2 min)

1. Dans Supabase : **Authentication** > **URL Configuration**.
2. **Site URL** : l'adresse Vercel de l'étape 5 (`https://hospitrend-xxxx.vercel.app`).
3. **Redirect URLs** > **Add URL**, ajoutez :
   - `https://hospitrend-xxxx.vercel.app/**`
   - pour tester les aperçus de pull request : leur adresse suivie de `/**`. Elle se termine par le nom de votre équipe Vercel, par exemple `https://hospitrend-*-votre-equipe.vercel.app/**`. N'ajoutez pas `https://*.vercel.app/**`, qui autoriserait n'importe quel site Vercel.
   - `http://localhost:3000/**` (pour un test sur ordinateur)
4. **Save**.

## Étape 7 — Lancer la première collecte (1 min)

La collecte tourne toute seule chaque matin à 5 h (heure de Paris en hiver, 6 h en été). Pour ne pas attendre demain :

1. Dans Vercel : votre projet > **Settings** > **Cron Jobs**.
2. Sur la ligne `/api/cron/ingest`, cliquez sur **Run**.
3. Patientez une minute. Dans Supabase > **Table Editor** > `articles`, des lignes doivent apparaître. Le détail par source est dans la table `ingest_runs` (colonne `report`) et dans `sources` (colonnes `last_via` et `last_error`).

Au premier passage, les 33 sources de `docs/sources.md` sont créées automatiquement. Pour chaque source, l'app essaie dans l'ordre : le flux RSS connu, un flux trouvé sur la page d'accueil du site, puis Google News limité au site. Les articles venus de Google News n'ont pas d'extrait : la carte n'affiche alors que le titre.

## Étape 8 — Essayer sur le téléphone

1. Ouvrez l'adresse Vercel sur le téléphone et touchez **Continuer avec Google**.
2. Pour l'installer comme une app :
   - **iPhone (Safari)** : bouton Partager > **Sur l'écran d'accueil**.
   - **Android (Chrome)** : menu ⋮ > **Installer l'application** (ou **Ajouter à l'écran d'accueil**).

Une adresse qui n'est pas dans `ALLOWED_EMAILS` voit « Accès réservé », et son compte est supprimé aussitôt.

---

## En cas de problème

| Symptôme | Cause probable |
|---|---|
| Google affiche « Accès bloqué » ou « redirect_uri_mismatch » | L'URI de redirection de l'étape 3 ne correspond pas exactement à `https://xxxx.supabase.co/auth/v1/callback`. |
| Google refuse le compte | L'adresse n'est pas dans les **Utilisateurs test** (étape 3.4). |
| Retour sur l'écran de connexion après Google | **Site URL** ou **Redirect URLs** manquants dans Supabase (étape 6). |
| « Accès réservé » avec la bonne adresse | `ALLOWED_EMAILS` mal saisi sur Vercel. Après correction : **Deployments** > ⋯ > **Redeploy**. |
| « Pas encore d'actualités » | La collecte n'a pas encore tourné (étape 7). |
| Le **Run** de la collecte renvoie 401 | `CRON_SECRET` absent des variables Vercel. |

## Lancer en local (optionnel, pour un développeur)

```sh
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
npm run ingest               # une collecte depuis l'ordinateur
```
