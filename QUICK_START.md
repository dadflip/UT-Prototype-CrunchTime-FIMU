# Guide de Démarrage Rapide - Système de Vote Fimu

## Initialisation de l'Application

### 1. Configuration Initiale

L'application a été créée avec une base de données Supabase complète incluant:
- ✅ 8 tables de base de données avec contraintes et triggers
- ✅ Row Level Security (RLS) policies
- ✅ Données de démonstration pré-chargées

### 2. Démarrage de l'Application

```bash
# Installer les dépendances (si nécessaire)
pnpm install

# Démarrer le serveur de développement
pnpm run dev

# L'application sera disponible à http://localhost:3000
```

### 3. Accès Initial

**Choisissez votre rôle sur la page d'accueil:**

#### Option 1: Mode Jury
- Cliquez sur "Jury"
- Entrez un PIN: **1234** (ou 5678, 9101, 1121, 3141)
- Vous accédez à `/jury` pour voter

#### Option 2: Mode Admin
- Cliquez sur "Admin"
- Email: `admin@fimu.local`
- Mot de passe: `admin123`
- Vous accédez à `/admin` pour gérer le système

## Points Clés du Système

### Authentification

| Type | Méthode | Identifiant | Secret |
|------|---------|-------------|--------|
| Jury | PIN | Automatique | 4-8 chiffres |
| Admin | Email/Password | Email | Mot de passe |

### Système de Vote

**Jury**: Peut voter pour 1-5 artistes par catégorie avec un classement (rang 1-5)
- Rang 1 = 10 points
- Rang 2 = 8 points
- Rang 3 = 6 points
- Rang 4 = 4 points
- Rang 5 = 2 points

**Points générés automatiquement** - Aucun calcul manuel requis!

### Structure de Données

```
Session de Vote
├── Catégories (Rock, Jazz, Pop, etc.)
│   └── Artistes
│       └── Votes des Jurés (Rang + Points auto-générés)
└── Classements Finaux (Résultats agrégés)
```

## Fonctionnalités Principales

### Pour les Jurés

1. **Sélectionner une catégorie** - Accéder à la liste des artistes
2. **Voter** - Classer jusqu'à 5 artistes (1-5)
3. **Modifier** - Changer le classement d'un artiste
4. **Retirer** - Annuler un vote

### Pour les Administrateurs

1. **Dashboard** - Vue d'ensemble du système
2. **Gestion des artistes** - CRUD + Import Excel
3. **Gestion du top** - Éditer l'ordre final (drag & drop)
4. **Résultats** - Visualiser et exporter les votes
5. **Synchronisation Excel** - Import/Export en masse
6. **Utilisateurs** - Gérer les comptes admin

## Workflow Typique d'un Événement

### Avant le Début du Vote
1. Admin importe les artistes via Excel (`/admin/excel-sync`)
2. Admin crée les catégories et assigne les artistes
3. Admin crée une session de vote

### Pendant le Vote
1. Jurés se connectent avec leur PIN
2. Jurés votent catégorie par catégorie
3. Admin monitore les votes en temps réel sur le dashboard
4. Votes apparaissent immédiatement dans le classement

### Après le Vote
1. Admin ferme la session de vote
2. Admin visualise les résultats (`/admin/results`)
3. Admin peut ajuster le classement final (`/admin/rankings`)
4. Admin exporte les résultats en CSV

## Fichiers Importants

### Structure du Projet

```
app/
├── page.tsx                    # Landing page (choix jury/admin)
├── api/
│   ├── auth/                   # Authentification
│   └── excel/                  # Import/Export Excel
├── jury/                       # Interface jury
│   ├── page.tsx               # Dashboard jury
│   └── category/[id]/page.tsx # Voting interface
└── admin/                      # Interface admin
    ├── page.tsx               # Dashboard admin
    ├── artists/               # Gestion artistes
    ├── rankings/              # Gestion du top
    ├── results/               # Résultats
    └── excel-sync/            # Import/Export

lib/
├── supabase.ts                # Client Supabase + fonctions BD
├── auth.ts                    # Utilitaires d'authentification
└── auth-utils.ts              # Hashage PIN, tokens, etc.

types/
└── index.ts                   # TypeScript interfaces

components/
├── auth/                      # Formulaires de connexion
└── admin/                     # Composants admin
    └── RankingsEditor.tsx     # Éditeur de classement
```

### Fichiers de Configuration BD

```
scripts/
├── 01-init-database.sql       # Schéma complet
└── 02-seed-demo-data.sql      # Données de démonstration
```

## Problèmes Courants et Solutions

### Le formulaire PIN ne fonctionne pas
- Vérifiez que le PIN est entre 4-8 chiffres
- PINs de démo: 1234, 5678, 9101, 1121, 3141

### Les artistes n'apparaissent pas
- Assurez-vous qu'ils sont marqués comme `is_active = true`
- Vérifiez que la catégorie est active

### Les votes ne s'affichent pas immédiatement
- Vérifiez la connexion à Supabase
- Les votes devraient synchroniser en ~1 seconde
- Rafraîchir la page si nécessaire (F5)

### Erreur lors de l'import Excel
- Vérifiez le format du fichier (CSV ou XLSX)
- Assurez-vous que les colonnes correspondent au format attendu
- Consultez l'historique de sync pour plus de détails

## Commandes Utiles

```bash
# Démarrer en développement
pnpm run dev

# Build pour production
pnpm run build

# Vérifier le linting
pnpm run lint

# Ajouter une dépendance
pnpm add <package>
```

## Prochaines Étapes

1. **Personnaliser le thème** - Modifier les couleurs dans `app/globals.css`
2. **Configurer les données** - Importer vos propres artistes et catégories
3. **Ajouter des utilisateurs** - Créer des admins supplémentaires
4. **Tester le vote** - Créer une session et tester l'interface jury
5. **Configurer les PINs** - Générer des PINs uniques pour chaque juré

## Documentation Complète

Pour une documentation détaillée, consultez:
- `FIMU_VOTING_SYSTEM.md` - Documentation complète du système
- Code source bien commenté dans les fichiers API et composants

## Support

Si vous rencontrez des problèmes:
1. Vérifiez que Supabase est correctement configuré
2. Consultez la console JavaScript (F12) pour les erreurs
3. Vérifiez les logs serveur dans le terminal
4. Assurez-vous que les variables d'environnement sont correctes

---

**Bienvenue sur le système de vote Fimu!** Bonne chance avec votre événement! 🎵
