# Contributing - Fimu Voting System

Guide pour contribuer au projet et ajouter de nouvelles features.

## Conventions de code

### TypeScript
- Toujours ajouter les types explicitement
- Utiliser les interfaces dans `types/index.ts`
- Éviter les `any`

```typescript
// ✅ BON
interface User {
  id: string;
  name: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ❌ MAUVAIS
function getUser(id: any): any {
  // ...
}
```

### Composants React
- Composants comme exports par défaut
- Utiliser `'use client'` pour client components
- Props typisées avec interface

```typescript
// ✅ BON
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export function MyButton({ label, onClick, disabled }: ButtonProps) {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
}

// ❌ MAUVAIS
export default function MyButton(props) {
  return <button {...props} />;
}
```

### Naming Convention
```
Files:     camelCase pour composants (VotingCard.tsx)
Folders:   kebab-case pour dossiers (components/jury/)
Variables: camelCase
Constants: UPPER_SNAKE_CASE
Classes:   PascalCase
```

### API Routes
```typescript
// Structure standard pour routes API
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Validation
    // Logique
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[v0] Error:', error);
    return NextResponse.json({ error: 'Message' }, { status: 500 });
  }
}
```

## Ajout de nouvelles features

### 1. Feature: Nouveau formulaire d'artiste

```
1. Créer component: components/admin/ArtistForm.tsx
2. Ajouter types: types/index.ts (interface ArtistFormData)
3. Ajouter route API: app/api/admin/artists/route.ts
4. Créer/modifier page: app/admin/artists/page.tsx
5. Tests: TESTING.md (ajouter checklist)
```

### 2. Feature: Nouvelle métrique de vote

```
1. Ajouter fonction: lib/vote-utils.ts
2. Créer hook: hooks/useVoteMetrics.ts
3. Créer component: components/admin/VotingMetrics.tsx
4. Intégrer dans: app/admin/results/page.tsx
5. Tester avec: TESTING.md
```

### 3. Feature: Excel avancé

```
1. Créer lib: lib/excel-processor.ts
2. Ajouter route: app/api/excel/advanced/route.ts
3. Créer component: components/admin/ExcelAdvanced.tsx
4. Intégrer dans: app/admin/excel-sync/page.tsx
5. Documenter dans: SETUP.md
```

## Git Workflow

### Branches
```
main          → Production
develop       → Development
feature/*     → Nouvelles features
bugfix/*      → Corrections
hotfix/*      → Emergency fixes
```

### Commits
```
feat: Add voting statistics
fix: Correct real-time sync
docs: Update README
style: Format code
refactor: Improve auth utils
test: Add test cases
```

### Pull Request
```markdown
## Description
Describe what changed

## Type of Change
- [x] New feature
- [ ] Bug fix
- [ ] Documentation

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] TESTING.md updated

## Screenshots (if UI change)
[Attach screenshots]
```

## Code Quality

### Lint & Format
```bash
# TypeScript
pnpm tsc --noEmit

# ESLint
pnpm lint

# Format with Prettier
pnpm format
```

### Performance
- Éviter re-renders inutiles
- Utiliser `memo()` pour composants coûteux
- Lazy load quand possible
- Indexes PostgreSQL pour requêtes lentes

### Sécurité
- Toujours valider inputs (Zod)
- Hashage des données sensibles
- RLS PostgreSQL pour données jury
- CORS properly configured

## Testing

### Frontend
```typescript
// Checklist minimale dans TESTING.md
- [ ] Page charges
- [ ] Formulaire fonctionne
- [ ] Validation fonctionne
- [ ] Real-time sync OK
- [ ] Responsive mobile OK
```

### Backend
```bash
# Tester route avec curl
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Base de données
- Tester avec EXPLAIN ANALYZE
- Vérifier indexes utilisés
- Tester RLS policies
- Vérifier constraints

## Documentation

### Pour chaque change
1. Mettre à jour CHANGELOG.md
2. Mettre à jour README.md si pertinent
3. Mettre à jour SETUP.md si installation change
4. Ajouter test cases dans TESTING.md
5. Ajouter des exemples dans le code

### Commentaires en code
```typescript
// ✅ BON - Explique le pourquoi
// We use SHA-256 instead of bcrypt for speed
// since PINs are short-lived tokens
const hash = hashPIN(pin);

// ❌ MAUVAIS - Obvious
// Hash the pin
const hash = hashPIN(pin);
```

## Database Changes

### Ajouter une table
```sql
-- scripts/04-add-new-table.sql
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ajouter RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_can_see_own" ON new_table
  FOR SELECT USING (auth.uid() = user_id);
```

### Modifier une table
```sql
-- Toujours faire migration, pas ALTER direct
-- scripts/05-modify-table.sql
ALTER TABLE existing_table ADD COLUMN new_field TEXT;
```

## Performance Benchmarks

Garder ces metrics en tête:

```
Page load:           < 2s
Vote submit:         < 1s
Real-time update:    < 2s
CSV export:          < 5s (1000 votes)
Search/filter:       < 500ms
Concurrent users:    100+
```

## Dépannage courant

### TypeScript error
```bash
# Clear cache and rebuild
pnpm clean
pnpm build
```

### Supabase connection issue
```
1. Vérifier NEXT_PUBLIC_SUPABASE_URL
2. Vérifier NEXT_PUBLIC_SUPABASE_ANON_KEY
3. Vérifier firewall/VPN
4. Tester curl: curl <URL>/rest/v1/
```

### Real-time not working
```
1. Vérifier Supabase Real-time enabled
2. Vérifier RLS policies
3. Check browser console F12
4. Logs Supabase: logs/tapi-logs
```

## Style Guide

### Tailwind
```typescript
// ✅ BON
<div className="flex items-center gap-4 p-4">

// ❌ MAUVAIS
<div style={{ display: 'flex', gap: '16px', padding: '16px' }}>
```

### Components
```typescript
// ✅ BON - Propsinterface
interface CardProps {
  title: string;
  children: React.ReactNode;
}

// ❌ MAUVAIS - Props any
function Card(props: any) {
```

## Resources

- [Next.js Docs](https://nextjs.org)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## Questions?

- 📖 Consultez SETUP.md
- 🧪 Consultez TESTING.md
- 🏗️ Consultez PROJECT_SUMMARY.md
- 💬 Ouvrez une issue

---

**Merci de contribuer à Fimu Voting!**
