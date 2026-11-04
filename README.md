# Hospitrend

Application web mobile (PWA) de veille personnalisée sur l'hôtellerie, le tourisme et le bien-être, qui apprend les centres d'intérêt de son utilisatrice au fil de ses swipes.

- Vision, domaine et conventions : [CLAUDE.md](CLAUDE.md)
- Périmètre de la V1 : [docs/SPEC.md](docs/SPEC.md)
- Mise en route (Supabase, Google, Vercel) : [docs/mise-en-route.md](docs/mise-en-route.md)

## Démarrer en local

```sh
npm install
cp .env.example .env.local   # puis remplir les valeurs
npm run dev                  # http://localhost:3000
npm test
```

Stack : Next.js 16, TypeScript, Tailwind CSS 4, Supabase (PostgreSQL, connexion Google), Vercel. Licence MIT.
