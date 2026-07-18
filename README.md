# EBENORA — Galerie d'art en ligne

Boutique en ligne d'un artiste (reproductions de tableaux, formats + stock).
**Front React/Vite + Supabase** (base Postgres, Auth, Storage) — sans backend.

- Commande **sans compte** et **sans paiement en ligne** (règlement en direct après contact).
- **Espace admin** (`/admin`) pour gérer le catalogue et suivre les commandes.
- Identité EBENORA : brun profond `#2A1C15`, ivoire `#F5F1E8`, or subtil `#C9A86A`
  (typos Cormorant Garamond + Inter).

## Démarrage rapide (mode démo)

```bash
npm install
npm run dev
```

Sans configuration Supabase, le site tourne en **mode démonstration** avec des données d'exemple
(bannière en haut de page). Idéal pour montrer le rendu tout de suite.

## Activer les vraies données (Supabase)

1. Créez un projet sur https://supabase.com
2. Dans **Project Settings → API**, copiez l'URL et la clé `anon public`.
3. Copiez `.env.example` en `.env` et renseignez :
   ```
   VITE_SUPABASE_URL=https://VOTRE-PROJET.supabase.co
   VITE_SUPABASE_ANON_KEY=...
   ```
4. Dans le **SQL Editor** de Supabase, exécutez le contenu de `supabase/schema.sql`
   (tables, sécurité RLS, fonction de commande, bucket d'images).
5. Dans **Authentication → Users**, créez votre compte administrateur (email + mot de passe).
6. Redémarrez `npm run dev`. Connectez-vous sur `/admin` pour ajouter vos tableaux.

## Structure

```
src/
  lib/         supabase.js (client), api.js (accès données), demo.js, format.js
  context/     AuthContext, CartContext, ToastContext
  components/  Navbar, Footer, PaintingCard, Modal, DemoBanner
  pages/       Home, Gallery, Painting, Cart, Checkout, Confirmation, About, Admin, NotFound
  styles/      global.css (design system), components.css, pages.css
supabase/schema.sql   # à exécuter dans Supabase
```

## Build / déploiement

```bash
npm run build     # génère dist/
```
Déployable sur Vercel/Netlify (SPA). Renseignez les variables `VITE_SUPABASE_*` côté hébergeur.
