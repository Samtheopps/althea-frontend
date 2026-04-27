# Althea Systems — Front-office

Site e-commerce B2B pour la vente d'équipements médicaux professionnels.
Bachelor CPI — Projet de fin d'études.

---

## Stack

| Couche | Technologie |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Langage | TypeScript strict |
| Styling | Tailwind CSS v4 |
| State | Zustand (auth, panier, produits) |
| HTTP client | Axios + intercepteurs JWT |
| Formulaires | React Hook Form + Zod |
| Animations | Framer Motion |
| Icônes | Lucide React |
| Notifications | React Hot Toast |
| Paiement | Stripe Elements |
| Carte | Leaflet (page contact) |
| IA chat | Ollama (proxy via route Next.js) |
| i18n | Custom (FR / EN / AR / HE avec RTL) |

---

## Démarrage rapide

### Prérequis

- Node.js 20+
- npm 10+
- Backend Althea accessible (`https://api-pslt.matheovieilleville.fr/api/v1`)
- Ollama installé localement (optionnel, pour le chatbot)

### Installation

```bash
git clone https://github.com/Samtheopps/althea-frontend.git
cd althea-frontend
npm install
```

### Variables d'environnement

Créer un fichier `.env.local` à la racine :

```bash
# Stripe (obligatoire pour le checkout)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Ollama (optionnel, défaut : localhost:11434)
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

> **Important** : sans `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, le tunnel de paiement plante au runtime.

### Lancer en développement

```bash
npm run dev
```

Le site est disponible sur [http://localhost:3000](http://localhost:3000).

### Build de production

```bash
npm run build
npm run start
```

### Vérifications

```bash
npm run lint       # ESLint
npx tsc --noEmit   # Type-check sans émettre de fichiers
```

---

## Architecture

```
src/
├── app/                  # Pages App Router + route /api/chat (Ollama proxy)
│   ├── account/          # Espace utilisateur (commandes, factures, adresses, paiement, settings)
│   ├── auth/             # forgot-password, verify-email
│   ├── cart/             # Panier
│   ├── categories/       # Listing catégorie
│   ├── checkout/         # Tunnel Stripe + confirmation
│   ├── contact/          # Formulaire + carte Leaflet
│   ├── legal/            # CGU, mentions légales, confidentialité
│   ├── login/            # Connexion
│   ├── register/         # Inscription
│   ├── products/         # Catalogue + fiche produit
│   ├── search/           # Recherche avancée (scoring + facettes)
│   ├── api/chat/         # Proxy Ollama (Server Component)
│   └── ...               # about, help, returns, services, shipping, warranty
│
├── components/
│   ├── chat/             # ChatBot (assistant IA)
│   ├── checkout/         # StripePaymentForm
│   ├── contact/          # ContactMap (Leaflet)
│   ├── home/             # HeroCarousel
│   ├── layout/           # Header, Footer, GlobalSearch, LayoutShell
│   ├── products/         # ProductCard, Filters, Sort, ImageCarousel, Reviews, Similar, Tabs
│   ├── providers/        # AuthProvider
│   └── ui/               # Logo, Breadcrumb, CartBadge, ErrorMessage, LanguageSelector,
│                         # LoadingSpinner, PageHeader, ProductImage, Cards, EnhancedCards
│
├── hooks/                # useImageWithFallback
├── lib/
│   ├── i18n/             # Provider + dictionnaires (4 langues)
│   ├── stripe.ts         # Loader singleton Stripe.js
│   ├── utils.ts          # formatPrice, classNames…
│   └── validations.ts    # Schémas Zod
│
├── services/             # Couche d'accès API (axios)
│   ├── api.ts            # Instance + intercepteurs (refresh JWT auto)
│   ├── auth.ts
│   ├── accountService.ts
│   ├── categoryService.ts
│   ├── checkoutService.ts
│   ├── homepageService.ts
│   ├── invoiceService.ts
│   ├── productService.ts
│   ├── reviewService.ts
│   └── errorHandler.ts
│
├── stores/               # Zustand persistés (auth + cart)
│   ├── authStore.ts
│   ├── cartStore.ts
│   └── productStore.ts
│
├── types/                # Types partagés (api, account, checkout, invoice)
└── utils/                # apiHealthMonitor, apiTransform, validation
```

---

## Fonctionnalités clés

### Catalogue

- Listing avec tri (par disponibilité / prix / nom / nouveauté), filtres avancés (catégorie, marque, prix, stock)
- Fiche produit avec onglets (description, caractéristiques, avis), variantes, produits similaires
- Polling silencieux toutes les 30 s pour rafraîchir prix et stock sans recharger la page

### Recherche avancée (`/search`)

Implémentation des règles du cahier des charges :

| Règle | Score | Type |
|---|---|---|
| Correspondance exacte | 100 | Nom |
| Distance Levenshtein 1 | 80 | Nom (1 caractère d'écart) |
| Commence par | 70 | Nom |
| Contient | 55 → 25 | Nom > Marque > Description > Specs |

Levenshtein-1 calculé en O(n) (parcours linéaire, pas de matrice). Facettes : prix min/max, catégories multiples, en stock uniquement. URL synchronisée (`?q=...`).

### Authentification

- Inscription avec vérification email (`/auth/verify-email`)
- Connexion + mot de passe oublié (`/auth/forgot-password`)
- JWT stocké en cookies (`secure`, `sameSite: strict`)
- Refresh token transparent via intercepteur axios

### Panier & checkout

- Panier persistant (localStorage via Zustand persist)
- Tunnel Stripe en 4 étapes : client → adresse → livraison → paiement
- **Checkout invité** supporté (formulaire inline, sans création de compte)
- Confirmation avec polling temps réel + téléchargement facture PDF

### Espace compte

- Tableau de bord avec dernières commandes
- Liste commandes filtrable (statut, année, recherche par numéro/produit)
- Détail commande avec timeline temps réel
- **Système de factures complet** : listing paginé, détail avec aperçu PDF inline (iframe blob), téléchargement
- Gestion adresses (CRUD), moyens de paiement Stripe, paramètres profil

### Chatbot IA

Assistant conversationnel avec **RAG** : avant chaque appel au modèle, le proxy `/api/chat` injecte dans le system prompt le contexte produits + catégories récupéré du backend Althea. Le modèle peut donc citer des produits réels avec prix et liens.

- Streaming token par token (NDJSON)
- FAQ pré-définies cliquables
- Bouton « Parler à un humain » pour escalader
- Annulation propagée au backend si l'utilisateur ferme le chat

### Internationalisation

- 4 langues : français (défaut), anglais, arabe, hébreu
- Support RTL automatique (`dir="rtl"` appliqué sur `<html>`)
- Persistance du choix de langue dans `localStorage`
- Hook typé `useI18n()` — erreur de compilation si clé inexistante

---

## Workflow Git

```
feature/<nom>  →  dev  →  prod
```

- Chaque fonctionnalité sur une branche `feature/...`
- Merge dans `dev` via `--no-ff` pour garder l'historique des merges
- Release manuelle de `dev` vers `prod` lorsque jugé stable

Convention de commit : `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.

---

## Documentation complémentaire

| Fichier | Contenu |
|---|---|
| [DOC_TECHNIQUE_FRONTOFFICE.md](./DOC_TECHNIQUE_FRONTOFFICE.md) | Documentation technique détaillée (12 sections) — destinée à intégration Word |
| [OLLAMA_BACKEND_INTEGRATION.md](./OLLAMA_BACKEND_INTEGRATION.md) | Guide d'intégration Ollama côté backend (pour évolution future) |

---

## Conventions de code

- **TypeScript strict** : aucun `any` implicite, types partagés dans `src/types/`
- **ESLint** : configuration `eslint-config-next` (core-web-vitals + typescript)
- **Imports** : alias `@/*` pointe vers `src/`
- **Server vs Client Components** : `'use client'` uniquement quand nécessaire (hooks, événements, APIs navigateur)
- **Nommage** :
  - Composants : `PascalCase.tsx`
  - Services : `camelCaseService.ts`
  - Stores : `camelCaseStore.ts`
  - Hooks : `useXxx.ts`

---

## Crédits

Projet réalisé dans le cadre du Bachelor CPI.
Backend par Mathéo Vieilleville (`api-pslt.matheovieilleville.fr`).
