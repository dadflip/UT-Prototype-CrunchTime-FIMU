import crypto from 'crypto';
import { localDB, AdminUser, JuryMember, Category, Artist, VotingSession } from './local-storage';

// Fonction UUID compatible avec tous les navigateurs
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour les navigateurs plus anciens
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Fonctions de hashage
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

function hashPIN(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

// Données initiales
const initialData = {
  adminUser: {
    email: 'admin@fimu.local',
    password: 'admin123',
    fullName: 'Admin Fimu',
    role: 'admin' as const
  },
  
  juryMembers: [
    { name: 'Juré 1', pin: '1234', email: 'jury1@fimu.local' },
    { name: 'Juré 2', pin: '1234', email: 'jury2@fimu.local' },
    { name: 'Juré 3', pin: '1234', email: 'jury3@fimu.local' },
    { name: 'Juré 4', pin: '1234', email: 'jury4@fimu.local' },
    { name: 'Juré 5', pin: '1234', email: 'jury5@fimu.local' }
  ],
  
  categories: [
    { name: 'Rock', description: 'Catégorie Rock' },
    { name: 'Jazz', description: 'Catégorie Jazz' },
    { name: 'Électronique', description: 'Catégorie Électronique' },
    { name: 'Pop', description: 'Catégorie Pop' },
    { name: 'Hip-Hop', description: 'Catégorie Hip-Hop' },
    { name: 'Classique', description: 'Catégorie Classique' },
    { name: 'World', description: 'Catégorie World' },
    { name: 'Reggae', description: 'Catégorie Reggae' }
  ],
  
  artists: {
    'Rock': ['The Beatles', 'The Rolling Stones', 'Queen', 'Led Zeppelin'],
    'Jazz': ['Miles Davis', 'John Coltrane', 'Ella Fitzgerald'],
    'Pop': ['Michael Jackson', 'Madonna', 'Prince']
  }
};

export async function initializeDatabase(): Promise<void> {
  try {
    console.log('[INIT] Initialisation de la base de données locale...');
    
    await localDB.init();
    
    // Vérifier si les données existent déjà
    const existingAdmin = await localDB.findAdminByEmail(initialData.adminUser.email);
    const existingCategories = await localDB.getAll('categories');
    
    if (existingAdmin && existingCategories.length > 0) {
      console.log('[INIT] Base de données déjà initialisée');
      return;
    }
    
    // 1. Créer l'utilisateur admin
    const adminUser: AdminUser = {
      id: generateUUID(),
      email: initialData.adminUser.email.toLowerCase(),
      password_hash: hashPassword(initialData.adminUser.password),
      full_name: initialData.adminUser.fullName,
      role: initialData.adminUser.role,
      is_active: true
    };
    
    await localDB.create('admin_users', adminUser);
    console.log(`[INIT] Admin créé: ${adminUser.email} / ${initialData.adminUser.password}`);
    
    // 2. Créer les catégories
    const createdCategories: Category[] = [];
    for (let i = 0; i < initialData.categories.length; i++) {
      const categoryData = initialData.categories[i];
      const category: Category = {
        id: generateUUID(),
        name: categoryData.name,
        description: categoryData.description,
        order_index: i + 1,
        is_active: true
      };
      
      await localDB.create('categories', category);
      createdCategories.push(category);
    }
    console.log(`[INIT] ${createdCategories.length} catégories créées`);
    
    // 3. Créer les jurés
    for (const juryData of initialData.juryMembers) {
      const juryMember: JuryMember = {
        id: generateUUID(),
        member_name: juryData.name,
        pin_hash: hashPIN(juryData.pin),
        email: juryData.email,
        is_active: true
      };
      
      await localDB.create('jury_members', juryMember);
    }
    console.log(`[INIT] ${initialData.juryMembers.length} jurés créés (PIN: 1234)`);
    
    // 4. Créer les artistes
    for (const [categoryName, artistNames] of Object.entries(initialData.artists)) {
      const category = createdCategories.find(cat => cat.name === categoryName);
      if (!category) continue;
      
      for (let i = 0; i < artistNames.length; i++) {
        const artist: Artist = {
          id: generateUUID(),
          name: artistNames[i],
          category_id: category.id,
          artist_number: i + 1,
          is_active: true
        };
        
        await localDB.create('artists', artist);
      }
    }
    console.log(`[INIT] Artistes créés pour ${Object.keys(initialData.artists).length} catégories`);
    
    // 5. Créer une session de vote
    const votingSession: VotingSession = {
      id: generateUUID(),
      name: 'Fimu 2026',
      status: 'open',
      start_time: new Date().toISOString()
    };
    
    await localDB.create('voting_sessions', votingSession);
    
    console.log('[INIT] Initialisation terminée avec succès !');
    console.log('\n[INIT] Identifiants de connexion:');
    console.log(`Admin: ${adminUser.email} / ${initialData.adminUser.password}`);
    console.log(`Jurés: PIN = 1234`);
    
  } catch (error) {
    console.error('[INIT] Erreur lors de l\'initialisation:', error);
    throw error;
  }
}

export async function resetDatabase(): Promise<void> {
  try {
    console.log('[INIT] Réinitialisation de la base de données...');
    
    await localDB.init();
    await localDB.clearAll();
    
    console.log('[INIT] Base de données vidée');
    
    // Réinitialiser les données
    await initializeDatabase();
    
  } catch (error) {
    console.error('[INIT] Erreur lors de la réinitialisation:', error);
    throw error;
  }
}

export async function checkDatabaseStatus(): Promise<{ initialized: boolean; adminExists: boolean; categoriesCount: number }> {
  try {
    await localDB.init();
    
    const adminExists = !!(await localDB.findAdminByEmail(initialData.adminUser.email));
    const categories = await localDB.getAll('categories');
    
    return {
      initialized: adminExists && categories.length > 0,
      adminExists,
      categoriesCount: categories.length
    };
  } catch (error) {
    console.error('[INIT] Erreur lors de la vérification du statut:', error);
    return {
      initialized: false,
      adminExists: false,
      categoriesCount: 0
    };
  }
}
