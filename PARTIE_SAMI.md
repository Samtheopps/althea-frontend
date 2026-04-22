# Partie Sami — Interface front-end Althea Systems

Résumé du travail réalisé sur la partie IHM / front-end du projet e-commerce Althea Systems (cosmétiques bio & matériel médical).

---

## 1. Stack technique

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript** en strict mode
- **Tailwind CSS v4** (tokens CSS natifs)
- **Zustand** — gestion d'état (auth, panier, filtres produits)
- **React Hook Form + Zod** — formulaires & validation
- **Framer Motion** — animations
- **Leaflet / React-Leaflet** — carte interactive contact
- **Axios** — client HTTP avec refresh token
- **lucide-react** — iconographie

---

## 2. Design system

Charte graphique harmonisée basée sur les couleurs de la marque :

- Primaire : `#00a8b5` (teal)
- Secondaire : `#003d5c` (bleu marine)
- Typographies : **Poppins** (titres) + **Inter** (corps)
- Variables CSS centralisées dans `globals.css` (couleurs, ombres, radius, transitions)
- Tokens Tailwind v4 mappés sur les variables CSS

**Composants UI réutilisables** (`src/components/ui/`) :
- Boutons, Cards, Badges, Breadcrumb
- CartBadge, Logo, LanguageSelector
- LoadingSpinner, ErrorMessage, PageHeader
- ProductImage (avec fallback intelligent)

---

## 3. Architecture des pages (App Router)

### Pages principales
| Route | Description |
|---|---|
| `/` | Home avec hero carousel, catégories en grille, produits mis en avant |
| `/products` | Catalogue avec filtres, tri, pagination |
| `/products/[slug]` | Fiche produit — carousel images, tabs, avis, produits similaires |
| `/categories` + `/categories/[slug]` | Navigation par catégorie |
| `/cart` | Panier avec gestion quantités |
| `/checkout` | Tunnel d'achat multi-étapes + confirmation |

### Compte utilisateur
- `/account` — dashboard
- `/account/orders` — historique commandes
- `/account/addresses` — gestion adresses livraison
- `/account/payment` — moyens de paiement
- `/account/settings` — paramètres

### Authentification
- `/auth/login`, `/auth/register`
- `/auth/forgot-password`, `/auth/verify-email`

### Pages info & légal
- `/about`, `/help`, `/services`
- `/contact` (avec carte Leaflet interactive)
- `/shipping`, `/returns`, `/warranty`
- `/legal/cgu`, `/legal/mentions-legales`, `/legal/privacy`

---

## 4. Layout & navigation

- **Header** responsive avec menu mobile, cart badge, recherche
- **GlobalSearch** avec raccourci clavier (Cmd+K)
- **Footer** avec sitemap complet + newsletter
- **LayoutShell** wrapper global pour les providers

---

## 5. Fonctionnalités IHM notables

### Carte interactive contact
- Composant `ContactMap` chargé dynamiquement (`ssr: false`)
- Tuiles **CartoDB Voyager** (rendu moderne et coloré)
- Pin SVG personnalisé aux couleurs de la marque (dégradé + ombre)
- Popup stylée avec info de l'adresse
- Barre d'info en bas avec `backdrop-blur`

### Formulaires
- Validation côté client via Zod + React Hook Form
- Feedback utilisateur via `react-hot-toast`
- États de chargement et succès gérés

### Images produits
- Hook `useImageWithFallback` — gestion automatique des fallbacks
- Composant `ProductImage` avec placeholder et retry

### Animations
- Transitions au montage des sections (Framer Motion)
- Micro-interactions (hover, tap) sur les CTAs
- Animations séquentielles sur les listes

---

## 6. Gestion d'état (Zustand)

| Store | Rôle |
|---|---|
| `authStore` | Session utilisateur, tokens, profil |
| `cartStore` | Panier persisté (localStorage), ajout/suppression/quantités |
| `productStore` | Filtres actifs, tri, recherche catalogue |

---

## 7. Couche API

Client Axios centralisé (`src/services/api.ts`) avec :
- Refresh token automatique sur 401
- Intercepteurs de requête/réponse
- Gestion d'erreurs typée via `errorHandler.ts`

**Services métier :**
- `productService` — catalogue, détails produits
- `categoryService` — catégories
- `reviewService` — avis clients
- `auth` — login, register, refresh

**Utilitaires API :**
- `apiHealthMonitor` — monitoring santé de l'API
- `apiTransform` — normalisation des réponses

---

## 8. Internationalisation (i18n)

- Système i18n custom léger (sans dépendance externe)
- **4 langues supportées** : Français, Anglais, Arabe, Hébreu
- Support RTL natif pour l'arabe et l'hébreu
- Context React avec hook `useI18n()`
- Toutes les chaînes extraites dans `src/lib/i18n/translations.ts`

---

## 9. Git & versioning

Le repo GitHub est organisé en **Git Flow** :

- `main` — configuration projet (base)
- `dev` — branche de développement (toutes les features mergées proprement)
- `prod` — branche de production (release stable depuis dev)

Historique structuré en 14 merges de branches `feature/*` (design-system, api-services, ui-components, layout, home-page, products, categories, auth, cart-checkout, account, contact-map, info-pages, api-chat, core-utils).

---

## 10. Build & performance

- **Build production** OK (`npm run build`)
- Toutes les pages générées en **Static** sauf routes dynamiques
- Fonts optimisées via `next/font`
- Images optimisées via `next/image`
- Code-splitting automatique par route
- Chargement dynamique pour les composants lourds (carte Leaflet)

---

**Repo :** https://github.com/Samtheopps/althea-frontend
