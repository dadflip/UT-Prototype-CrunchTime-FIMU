# Système de Vote Fimu - Documentation Complète

## Vue d'ensemble

Le système de vote Fimu est une application web responsive permettant aux membres du jury de voter pour des artistes classés par catégories musicales, avec synchronisation en temps réel vers un serveur central Supabase et intégration Excel.

## Architecture

### Stack Technologique
- **Frontend**: Next.js 16, React 19, TypeScript, shadcn/ui
- **Backend**: Next.js API Routes
- **Base de données**: Supabase PostgreSQL
- **Authentification**: PIN-based pour jurés, Email/Password pour admins
- **Styles**: Tailwind CSS v4
- **Export/Import**: CSV, JSON

## Schéma de Base de Données

### Tables Principales

1. **admin_users**
   - Gestion des administrateurs avec authentification email/password
   - Rôles: admin, superadmin
   - Champs: id, email, password_hash, full_name, role, is_active

2. **jury_members**
   - Membres du jury avec authentification PIN
   - Champs: id, member_name, pin_hash, email, is_active

3. **categories**
   - Catégories musicales
   - Champs: id, name, description, order_index, is_active

4. **artists**
   - Artistes à voter
   - Champs: id, name, category_id, artist_number, description, image_url, is_active

5. **voting_sessions**
   - Sessions de vote
   - Statuts: open, paused, closed
   - Champs: id, name, status, category_id, start_time, end_time

6. **votes**
   - Votes des jurés (table centrale)
   - Système de notation: Rank 1-5 génère automatiquement 10-8-6-4-2 points
   - Champs: id, jury_member_id, artist_id, session_id, rank_position, points (GENERATED)

7. **rankings**
   - Classements agrégés
   - Champs: id, artist_id, session_id, total_points, vote_count, average_rank, final_rank, is_finalist

8. **excel_sync_logs**
   - Historique des synchronisations Excel
   - Champs: id, operation_type, source_file, status, records_affected, error_message

## Fonctionnalités

### Interface Jury

**URL**: `/jury`

- **Authentification**: PIN 4-8 chiffres
- **Dashboard**: Affichage des catégories avec nombre de votes par catégorie
- **Système de vote**: 
  - Sélectionner une catégorie
  - Voter pour jusqu'à 5 artistes avec ranking 1-5
  - Points générés automatiquement (Rang 1=10pts, Rang 2=8pts, etc.)
  - Possibilité de modifier ou retirer les votes
- **Responsive**: Mobile-first, adapté pour tous les appareils

### Interface Admin

**URL**: `/admin`

**Authentification**: Email + Mot de passe

#### Dashboard (`/admin`)
- Statistiques en temps réel: nombre d'artistes, catégories, jurés, votes
- Statut de la session de vote (ouvert/fermé)
- Vue d'ensemble du système

#### Gestion des Artistes (`/admin/artists`)
- CRUD complet sur les artistes
- Filtrage par catégorie
- Import en masse depuis Excel

#### Top Artistes (`/admin/rankings`)
- Éditeur de classement drag-and-drop
- Ajouter/retirer des artistes du top
- Titres personnalisés optionnels
- Modification de l'ordre par glisser-déposer

#### Résultats (`/admin/results`)
- Visualisation des votes par catégorie
- Calcul automatique des points totaux
- Classement par score
- Export CSV

#### Utilisateurs (`/admin/users`)
- Gestion des comptes admin
- Création/modification/suppression d'utilisateurs

#### Flux de Performance (`/admin/performance-flow`)
- Contrôle du passage des groupes à écouter
- Gestion de l'ordre des performances

#### Synchronisation Excel (`/admin/excel-sync`)
- **Import**: Artistes, catégories, jurés depuis fichiers Excel/CSV
- **Export**: Résultats en CSV
- **Historique**: Log de toutes les opérations
- **Sync temps réel** (optionnel): Synchronisation automatique des votes

## API Routes

### Authentification

- `POST /api/auth/jury-login` - Connexion jury avec PIN
- `POST /api/auth/admin-login` - Connexion admin
- `GET /api/auth/check-jury` - Vérification session jury
- `GET /api/auth/check-admin` - Vérification session admin
- `POST /api/auth/logout` - Déconnexion

### Excel

- `POST /api/excel/import` - Import de données (artistes, catégories, jurés)
- `GET /api/excel/export` - Export des votes

## Sécurité

- **Row Level Security (RLS)**: Politiques de sécurité au niveau des lignes
- **PIN Hashing**: SHA-256 pour les PINs (ou bcrypt en production)
- **Session Management**: Tokens sécurisés stockés en cookies HTTP-only
- **Validation**: Zod pour la validation des données côté serveur
- **CSRF Protection**: SameSite cookies

## Données de Démo

### Admin
- Email: `admin@fimu.local`
- Mot de passe: `admin123`

### Jurés (PIN)
- PIN: `1234`, `5678`, `9101`, `1121`, `3141`

### Catégories
Rock, Jazz, Électronique, Pop, Hip-Hop, Classique, World, Reggae

### Artistes
- Rock: The Beatles, The Rolling Stones, Queen, Led Zeppelin
- Jazz: Miles Davis, John Coltrane, Ella Fitzgerald
- Pop: Michael Jackson, Madonna, Prince

## Points de Scoring

```
Rang 1 = 10 points
Rang 2 = 8 points
Rang 3 = 6 points
Rang 4 = 4 points
Rang 5 = 2 points
```

Les points sont générés automatiquement via une colonne GENERATED dans la table votes.

## Flux d'utilisation

### Jury
1. Accédez à `/` et sélectionnez "Jury"
2. Entrez votre PIN
3. Sélectionnez une catégorie
4. Classez jusqu'à 5 artistes (1-5)
5. Les points sont attribués automatiquement
6. Répétez pour chaque catégorie

### Admin
1. Accédez à `/` et sélectionnez "Admin"
2. Connectez-vous avec email et mot de passe
3. Utilisez le dashboard pour:
   - Monitorer les votes en temps réel
   - Gérer les artistes et catégories
   - Exporter les résultats
   - Importer les données depuis Excel
   - Gérer le classement final

## Déploiement

### Prérequis
- Projet Supabase configuré
- Variables d'environnement (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- Node.js 18+, pnpm

### Installation
```bash
pnpm install
pnpm run dev
```

### Production
```bash
vercel deploy
```

## Extensibilité

Le système est conçu pour être extensible:
- Ajouter de nouveaux types de votes
- Intégrer d'autres sources de données
- Personnaliser les formules de scoring
- Ajouter des analyses avancées
- Implémenter des webhooks pour notifications externes

## Support

Pour les questions ou améliorations, consultez la documentation Supabase ou Next.js.
