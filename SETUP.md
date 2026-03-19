# Fimu Voting System - Guide de mise en place

## Vue d'ensemble

Système de vote interactif pour le festival Fimu, permettant aux jurés de voter pour des artistes par catégorie musicale, avec un tableau de bord administrateur complet pour gérer les résultats, les classements et la synchronisation Excel.

## Prérequis

- Node.js 18+ et pnpm
- Compte Supabase avec projet configuré
- Environment variables configurées

## Installation

### 1. Cloner le projet

```bash
git clone <votre-repo>
cd fimu-voting
```

### 2. Installer les dépendances

```bash
pnpm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env.local` avec:

```env
NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
SUPABASE_SERVICE_ROLE_KEY=votre_clé_service_role
```

### 4. Initialiser la base de données

Exécutez le script SQL pour créer les tables:

```bash
# Via Supabase SQL editor, exécutez:
# scripts/01-init-database.sql
# scripts/02-seed-demo-data.sql
```

### 5. Démarrer le serveur de développement

```bash
pnpm dev
```

L'application est disponible sur `http://localhost:3000`

## Accès initial

### Jury
- **URL:** `http://localhost:3000`
- **Rôle:** Juré
- **PIN de test:** `1234`, `5678`, `9101`, `1121`, `3141`
- Chaque PIN correspond à un juré différent

### Admin
- **URL:** `http://localhost:3000`
- **Rôle:** Administrateur
- **Email:** `admin@fimu.local`
- **Mot de passe:** `admin123`

## Structure du projet

```
app/
├── api/
│   └── auth/               # Routes d'authentification
├── jury/
│   ├── layout.tsx          # Layout jury
│   ├── page.tsx            # Dashboard jury
│   ├── category/[id]/page.tsx  # Page de vote par catégorie
│   └── thanks/page.tsx     # Page de remerciement
├── admin/
│   ├── layout.tsx          # Layout admin
│   ├── page.tsx            # Dashboard admin
│   ├── artists/page.tsx    # Gestion des artistes
│   ├── rankings/page.tsx   # Gestion du top artistes
│   ├── users/page.tsx      # Gestion des jurés
│   ├── performance-flow/page.tsx  # Contrôle des performances
│   ├── results/page.tsx    # Résultats des votes
│   └── excel-sync/page.tsx # Synchronisation Excel
├── page.tsx                # Page d'accueil/sélection de rôle
└── layout.tsx              # Layout racine
components/
├── auth/
│   ├── PINLoginForm.tsx    # Formulaire de connexion PIN
│   └── AdminLoginForm.tsx  # Formulaire de connexion admin
├── jury/
│   ├── VotingCard.tsx      # Carte d'artiste avec boutons de vote
│   └── CategorySelector.tsx # Sélecteur de catégorie
└── admin/
    ├── RankingsEditor.tsx  # Editeur de classement drag-drop
    └── VotingAnalytics.tsx # Graphiques d'analyse
lib/
├── supabase.ts             # Client Supabase
├── auth-utils.ts           # Utilitaires d'authentification (PIN/hash)
├── vote-utils.ts           # Utilitaires de vote
hooks/
├── useJuryAuth.ts          # Hook auth jury
├── useAdminAuth.ts         # Hook auth admin
├── useVotes.ts             # Hook pour gérer les votes
└── useRealtimeVotes.ts     # Hook temps réel
types/
└── index.ts                # TypeScript types
```

## Utilisation

### Pour les jurés

1. **Accéder au site:** Allez à l'accueil, cliquez sur "Jury"
2. **Entrer le PIN:** Saisissez votre code PIN à 4-8 chiffres
3. **Sélectionner une catégorie:** Cliquez sur une catégorie musicale
4. **Voter:** Sélectionnez les artistes et donnez une note de 1 à 5
5. **Soumettre:** Les votes sont enregistrés automatiquement

### Pour les administrateurs

#### Dashboard
- Vue d'ensemble des statistiques (artistes, jurés, votes)
- État de la session de vote

#### Gestion des artistes
- Ajouter/modifier/supprimer des artistes
- Contrôler la visibilité pour les jurés
- Assigner des catégories

#### Gestion des jurés
- Ajouter de nouveaux jurés avec PIN
- Générer ou personnaliser les PINs
- Activer/désactiver l'accès

#### Gestion du Top Artistes
- Créer un classement personnalisé
- Réorganiser par drag-and-drop
- Ajouter des titres personnalisés
- Verrouiller des positions

#### Contrôle des performances
- Afficher/masquer les artistes des jurés
- Gérer l'ordre des performances
- Filtrer par catégorie

#### Résultats des votes
- Voir les votes en temps réel
- Analyser les scores moyens
- Exporter les résultats en CSV

#### Synchronisation Excel
- Importer les artistes depuis Excel
- Exporter les résultats des votes
- Historique des opérations

## Architecture de la base de données

### Tables principales

**categories**
- Groupes musicaux (Rock, Jazz, Pop, etc.)

**artists**
- Artistes à voter
- Lié à une catégorie
- Contrôle de visibilité

**jury_members**
- Jurés avec PINs hashés
- Session tokens
- Statut actif/inactif

**votes**
- Votes individuels (artist, jury, points, timestamp)
- Index composite sur (artist_id, jury_member_id)

**rankings**
- Classement personnalisé des top artistes
- Positions verrouillables
- Titres personnalisés

**voting_sessions**
- Sessions de vote (Fimu 2026, etc.)
- État ouvert/fermé

**admin_users**
- Administrateurs avec email/password
- Rôles (admin, moderator, analyst)

**excel_sync_logs**
- Historique des imports/exports Excel

## Sécurité

### Authentification
- PINs hashés avec SHA-256 (tokens de session uniques)
- Admins avec email/password
- Cookies httpOnly pour les sessions

### Base de données
- Row Level Security (RLS) activé
- Jurés peuvent voir uniquement leurs votes
- Admins ont accès complet

### Validation
- Validation Zod sur tous les formulaires
- Points de vote validés (1-5)
- Protection CSRF activée

## Performances

- Pagination pour grandes listes
- Indexes base de données optimisés
- Real-time subscriptions Supabase
- Caching client-side avec React

## Déploiement

### Vercel

```bash
# Push vers GitHub
git push origin main

# Vercel déploiera automatiquement
# Configurez les variables d'environnement dans Settings → Environment Variables
```

### Variables à configurer

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

## Troubleshooting

### "Invalid PIN or jury member not found"
- Vérifiez que vous utilisez le bon PIN
- Assurez-vous que le juré est actif

### Les votes ne s'enregistrent pas
- Vérifiez la connexion Supabase
- Regardez la console du navigateur pour les erreurs

### Real-time updates ne fonctionnent pas
- Vérifiez que Supabase Real-time est activé
- Rechargez la page

## Support

Pour les problèmes:
1. Vérifiez la console du navigateur (F12)
2. Consultez les logs Supabase
3. Vérifiez les variables d'environnement

## Licences

MIT - Libre d'utilisation et de modification
