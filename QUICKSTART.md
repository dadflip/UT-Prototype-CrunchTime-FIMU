# Quickstart - Fimu Voting en 5 minutes

## 1️⃣ Installation (2 min)

```bash
# Cloner et installer
git clone <repo-url>
cd fimu-voting
pnpm install

# Configurer Supabase
# Créez .env.local avec vos credentials:
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Démarrer
pnpm dev
```

Accédez à http://localhost:3000

## 2️⃣ Test Jury (1 min)

```
1. Cliquez "Jury"
2. Entrez PIN: 1234
3. Cliquez sur une catégorie
4. Votez pour un artiste (1-5)
5. Votez pour d'autres artistes
```

## 3️⃣ Test Admin (2 min)

```
1. Cliquez "Admin"
2. Email: admin@fimu.local
3. Mot de passe: admin123
4. Explorez les menus:
   - Artistes: Voir/modifier artistes
   - Top Artistes: Drag-drop ranking
   - Utilisateurs: Créer jurés
   - Résultats: Voir votes en temps réel
   - Excel Sync: Export/import
```

## 4️⃣ Créer un nouveau jury

```
1. Allez Admin → Utilisateurs
2. Cliquez "+ Ajouter un juré"
3. Entrez un nom
4. Cliquez "Générer" pour PIN
5. Notez le PIN affiché
6. Cliquez "Ajouter le juré"
7. Le juré peut se connecter avec le PIN
```

## 5️⃣ Ajouter un artiste

```
1. Allez Admin → Artistes
2. Cliquez "+ Ajouter un artiste"
3. Remplissez:
   - Nom de l'artiste
   - Description (optionnel)
   - Catégorie
4. Cliquez "Ajouter"
5. Artiste apparaît immédiatement
```

## 6️⃣ Créer un top artistes

```
1. Allez Admin → Top Artistes
2. Sélectionnez un artiste du dropdown
3. Cliquez "Ajouter"
4. Répétez pour 2-3 artistes
5. Drag-drop pour réorganiser
6. Cliquez "Enregistrer le classement"
```

## 7️⃣ Voir les résultats

```
1. Allez Admin → Résultats
2. Sélectionnez une catégorie
3. Tableau avec:
   - Rang (1, 2, 3...)
   - Nom artiste
   - Nombre de votes
   - Score moyen
4. Cliquez "Exporter CSV"
```

## Données de test prêtes à l'emploi

### Jurés (PINs)
```
1234 → Juré 1
5678 → Juré 2
9101 → Juré 3
1121 → Juré 4
3141 → Juré 5
```

### Admin
```
Email: admin@fimu.local
Mot de passe: admin123
```

### Catégories
```
Rock, Jazz, Électronique, Pop, Hip-Hop, 
Classique, World, Reggae (35+ artistes)
```

## Troubleshooting rapide

| Problème | Solution |
|----------|----------|
| "Invalid PIN" | Vérifiez PIN correct (1234, 5678...) |
| Variables non chargées | Redémarrez avec `pnpm dev` |
| Real-time ne marche pas | Vérifiez Supabase URL/keys |
| Page blanche | F12 → Onglet Console, vérifiez erreurs |

## Prochaines étapes

1. **Ajouter vos données** - Remplacez artistes/catégories
2. **Tester avec utilisateurs** - Invitez jury à voter
3. **Déployer** - Sur Vercel avec Supabase production
4. **Configurer branding** - Couleurs/logos au style Fimu

## Besoin d'aide?

- 📚 **[README.md](./README.md)** - Vue d'ensemble
- 📖 **[SETUP.md](./SETUP.md)** - Installation complète
- 🧪 **[TESTING.md](./TESTING.md)** - Guide de test
- 🏗️ **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Architecture

---

**Prêt à démarrer?** Lancez `pnpm dev` et allez à http://localhost:3000

**Vous n'avez pas Supabase?** Créez un compte gratuit sur https://supabase.com
