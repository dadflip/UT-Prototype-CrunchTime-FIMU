# Guide de test - Système de vote Fimu

## Checklist de test complète

### 1. Authentification

#### Jury PIN Login
- [ ] Accédez à http://localhost:3000
- [ ] Cliquez sur "Jury"
- [ ] Entrez le PIN `1234`
- [ ] Vérifiez que vous êtes redirigé vers `/jury`
- [ ] Vérifiez que le nom du juré s'affiche dans l'en-tête
- [ ] Cliquez sur "Déconnexion" et vérifiez que vous retournez à la page d'accueil
- [ ] Testez avec un mauvais PIN et vérifiez le message d'erreur

#### Admin Login
- [ ] Cliquez sur "Admin" depuis la page d'accueil
- [ ] Entrez `admin@fimu.local` et `admin123`
- [ ] Vérifiez que vous êtes redirigé vers `/admin`
- [ ] Vérifiez que le menu latéral s'affiche correctement
- [ ] Testez avec des identifiants incorrects et vérifiez le message d'erreur

### 2. Interface Jury

#### Dashboard Jury
- [ ] Page `/jury` affiche toutes les catégories
- [ ] Chaque catégorie affiche un bouton "Voter"
- [ ] Les compteurs de votes s'affichent correctement
- [ ] Cliquez sur une catégorie (ex: Rock)

#### Page de vote par catégorie
- [ ] Page `/jury/category/[id]` affiche tous les artistes visibles
- [ ] Chaque artiste a 5 boutons de vote (1-5)
- [ ] En cliquant sur un score, il est enregistré
- [ ] La carte affiche "Votre vote: X/5"
- [ ] Le résumé en bas montre le nombre d'artistes votés
- [ ] Retournez au dashboard - les votes sont conservés

### 3. Interface Admin - Dashboard
- [ ] Page `/admin` affiche les statistiques:
  - [ ] Nombre total d'artistes
  - [ ] Nombre de catégories
  - [ ] Nombre de jurés
  - [ ] Nombre de votes
  - [ ] État du vote (ouvert/fermé)

### 4. Gestion des artistes
- [ ] Allez à `/admin/artists`
- [ ] Cliquez sur "+ Ajouter un artiste"
- [ ] Complétez le formulaire:
  - [ ] Nom: "Test Artist"
  - [ ] Description: "Test description"
  - [ ] Catégorie: Sélectionnez une catégorie
- [ ] Cliquez sur "Ajouter"
- [ ] Vérifiez que l'artiste apparaît dans la liste
- [ ] Testez le bouton "Cacher/Afficher"
- [ ] Vérifiez que les artistes cachés ne s'affichent plus dans le vote jury

### 5. Gestion des jurés
- [ ] Allez à `/admin/users`
- [ ] Cliquez sur "+ Ajouter un juré"
- [ ] Entrez un nom: "Test Juré"
- [ ] Générez un PIN aléatoire (cliquez sur "Générer")
- [ ] Cliquez sur "Ajouter le juré"
- [ ] Vérifiez que le juré apparaît dans la liste avec statut "Actif"
- [ ] Testez la connexion avec le nouveau PIN

### 6. Gestion du Top Artistes
- [ ] Allez à `/admin/rankings`
- [ ] Sélectionnez un artiste depuis le dropdown
- [ ] Cliquez sur "Ajouter"
- [ ] Vérifiez que l'artiste apparaît à la position 1
- [ ] Ajoutez 2-3 artistes supplémentaires
- [ ] Testez le drag-and-drop pour réorganiser
- [ ] Ajoutez un titre personnalisé pour un artiste
- [ ] Cliquez sur "Enregistrer le classement"
- [ ] Rechargez la page et vérifiez que les changements sont conservés

### 7. Contrôle des performances
- [ ] Allez à `/admin/performance-flow`
- [ ] La liste des artistes s'affiche
- [ ] Testez le filtre par catégorie
- [ ] Testez les boutons "Visible/Caché"
- [ ] Vérifiez que les artistes cachés disparaissent du vote jury

### 8. Résultats des votes
- [ ] Allez à `/admin/results`
- [ ] Une catégorie doit être sélectionnée par défaut
- [ ] Vérifiez le tableau avec:
  - [ ] Position/rang (1, 2, 3...)
  - [ ] Nom de l'artiste
  - [ ] Nombre de votes reçus
  - [ ] Points totaux
  - [ ] Score moyen
- [ ] Changez de catégorie et vérifiez la mise à jour
- [ ] Testez le bouton "Exporter CSV"
- [ ] Vérifiez que le fichier CSV est téléchargé

### 9. Synchronisation Excel
- [ ] Allez à `/admin/excel-sync`
- [ ] Testez le bouton "Exporter les votes"
- [ ] Vérifiez que un fichier CSV est téléchargé
- [ ] Vérifiez que l'opération est enregistrée dans l'historique
- [ ] Testez le toggle "Synchronisation en temps réel"

### 10. Real-time Updates
- [ ] Ouvrez deux navigateurs côte à côte:
  - [ ] Fenêtre 1: Accueil jury (page `/jury`)
  - [ ] Fenêtre 2: Dashboard admin (page `/admin`)
- [ ] Depuis la fenêtre 1, votez pour un artiste dans une catégorie
- [ ] Vérifiez que les votes s'affichent rapidement dans la fenêtre 2 (résultats)
- [ ] Testez avec plusieurs catégories

### 11. Responsive Design
- [ ] Ouvrez l'application sur:
  - [ ] Desktop (1920x1080+)
  - [ ] Tablet (768x1024)
  - [ ] Mobile (375x667)
- [ ] Vérifiez que tous les éléments sont visibles et utilisables
- [ ] Testez les touches/clics en mode mobile
- [ ] Vérifiez que le menu admin se collapse sur mobile

### 12. Performance
- [ ] Avec données de test (50+ artistes, 10+ jurés)
- [ ] Testez le chargement des pages (< 2 secondes)
- [ ] Testez l'enregistrement d'un vote (< 1 seconde)
- [ ] Testez les recherches/filtres (< 500ms)

### 13. Erreurs et edge cases
- [ ] Testez la connexion avec un PIN expiré
- [ ] Testez l'ajout d'un juré sans nom
- [ ] Testez le vote sans être connecté
- [ ] Testez la navigation directe vers `/jury` sans login
- [ ] Testez l'import d'un fichier Excel vide
- [ ] Testez la suppression d'une catégorie avec des votes

### 14. Sécurité
- [ ] Vérifiez que les PINs sont hashés en base de données
- [ ] Vérifiez que les sessions expirent après 24h
- [ ] Testez l'accès direct à `/admin` sans login
- [ ] Vérifiez que les jurés ne peuvent voir que leurs votes

## Données de test

### PINs disponibles
- `1234` → Juré 1
- `5678` → Juré 2
- `9101` → Juré 3
- `1121` → Juré 4
- `3141` → Juré 5

### Admin
- Email: `admin@fimu.local`
- Mot de passe: `admin123`

### Catégories
- Rock
- Jazz
- Électronique
- Pop
- Hip-Hop
- Classique
- World
- Reggae

## Rapports de bugs

Si vous trouvez un bug:
1. Notez les étapes pour le reproduire
2. Vérifiez la console du navigateur (F12) pour les erreurs
3. Vérifiez les logs Supabase
4. Signalez le problème avec ces informations

## Performance Baseline

Métriques cibles:
- Chargement initial: < 2s
- Enregistrement d'un vote: < 1s
- Export CSV: < 5s
- Recherche/filtre: < 500ms
- Real-time update: < 2s
