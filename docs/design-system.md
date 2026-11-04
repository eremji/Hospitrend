# Design system — Hospitrend

Direction retenue le 2026-11-03 : **C · Concierge** (chaleureux, thèmes en couleur, très guidé), en clair et en sombre.
Maquettes de référence : canvas « Hospitrend — 3 directions », lignes « C · Concierge » et « C sombre ».

## Fichiers

| Fichier | Rôle |
|---|---|
| `design/tokens.json` | Source de vérité : couleurs clair / sombre, teintes de thèmes, typographie, rayons, tailles. |
| `design/tokens.css` | Les mêmes tokens en variables CSS préfixées `--ht-`, avec le basculement clair / sombre. |
| `design/tailwind-theme.css` | Correspondance pour **Tailwind v4** (`@theme inline` + variante `dark`). |
| `design/tailwind.preset.cjs` | Correspondance pour **Tailwind v3** (preset). |
| `design/check-contrast.mjs` | Vérifie toutes les paires de couleurs en WCAG AA. |

Toute modification se fait d'abord dans `tokens.json`, puis est reportée dans `tokens.css`, puis on lance :

```sh
node design/check-contrast.mjs
```

Le script s'arrête en erreur si une paire passe sous 4,5:1 (texte) ou 3:1 (bordures et composants).

## Brancher dans Next.js

Tailwind v4, dans `app/globals.css` :

```css
@import "tailwindcss";
@import "../design/tokens.css";
@import "../design/tailwind-theme.css";
```

Police : Manrope (500 à 800), par exemple via `next/font/google`, exposée dans `--ht-font-sans`.

## Clair, sombre, auto

- Par défaut, l'application suit le réglage du téléphone (`prefers-color-scheme`).
- Le réglage « Apparence » force un thème en posant `data-theme="light"` ou `data-theme="dark"` sur `<html>` ; « Auto » retire l'attribut.
- Les classes Tailwind (`bg-surface`, `text-muted`…) changent toutes seules de valeur : pas besoin d'écrire `dark:` pour les couleurs du système. La variante `dark:` reste disponible pour un cas particulier.

## Utilitaires principaux

| Usage | Classe |
|---|---|
| Fond de page / carte | `bg-bg`, `bg-surface`, `bg-surface-muted` |
| Texte titre / corps / secondaire | `text-text`, `text-body`, `text-muted` |
| Bouton principal (marine en clair, clair en sombre) | `bg-primary text-on-primary` |
| Bouton « J'aime » (corail) | `bg-accent text-on-accent`, libellé `text-accent-text` |
| Bloc « L'idée à piquer » | `bg-idea-bg text-idea-fg` |
| Barre de navigation | `bg-nav text-nav-fg`, onglet actif `bg-nav-active text-nav-active-fg` |
| Bordures | `border-border` (séparateurs), `border-border-strong` (champs, boutons secondaires) |
| Rayons | `rounded-md` (boutons), `rounded-lg`, `rounded-xl` (panneaux, nav), `rounded-card` (carte), `rounded-pill` (pastilles) |
| Tailles tactiles | `min-h-touch` (44 px), `h-button`, `h-button-lg`, `size-action-main` (72 px), `size-action-side` (48 px), `h-nav` |

## Couleurs des thèmes

Chaque thème de `docs/sujets.md` a une teinte. On pose l'identifiant du thème, la couleur suit :

```html
<span data-topic="mice" class="bg-topic text-topic-fg rounded-pill px-3 py-1">MICE</span>
```

| Teinte | Thèmes |
|---|---|
| Bleu | `hospitality`, `distribution`, `transport` |
| Orange | `tourism`, `mice`, `food-beverage` |
| Vert | `wellness`, `sustainability` |
| Violet | `hotel-tech`, `guest-experience`, `design` |
| Ardoise | `hr`, `regulation` |

La couleur ne porte jamais seule l'information : le nom du thème est toujours écrit.

## Règles d'accessibilité

- Texte : 4,5:1 minimum ; bordures et icônes : 3:1. Toutes les paires de `tokens.json` passent (vérifié par le script).
- Sur le corail, texte et icônes en blanc en clair, **en marine en sombre** (le blanc sur le corail sombre ne passe pas).
- Cibles tactiles : 44 px minimum, 72 px pour les boutons « J'aime » et « Pas pour moi ».
- Boutons à icône seule : toujours un `aria-label`.
