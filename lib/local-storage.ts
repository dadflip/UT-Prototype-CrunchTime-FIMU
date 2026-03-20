// Types pour notre base de données locale
export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin';
  is_active: boolean;
}

export interface JuryMember {
  id: string;
  member_name: string;
  pin_hash: string;
  email: string;
  is_active: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

export interface Artist {
  id: string;
  name: string;
  category_id: string;
  artist_number: number;
  is_active: boolean;
}

export interface Vote {
  id: string;
  jury_member_id: string;
  artist_id: string;
  category_id: string;
  score: number;
  created_at: string;
}

export interface VotingSession {
  id: string;
  name: string;
  status: 'open' | 'closed';
  start_time: string;
  end_time?: string;
}

export interface ExcelSyncLog {
  id: string;
  operation_type: 'import' | 'export';
  source_file: string;
  status: 'success' | 'failed' | 'pending';
  records_affected: number;
  created_at: string;
}

export interface Ranking {
  id: string;
  artist_id: string;
  session_id: string;
  rank_position?: number;
  display_title?: string;
  display_order?: number;
  is_locked?: boolean;
  total_points?: number;
  vote_count?: number;
  average_rank?: number;
  final_rank?: number;
  is_finalist?: boolean;
}

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

// Classe pour gérer IndexedDB
class LocalDatabase {
  private dbName = 'fimuVotingDB';
  private version = 2;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer les tables
        if (!db.objectStoreNames.contains('admin_users')) {
          const adminStore = db.createObjectStore('admin_users', { keyPath: 'id' });
          adminStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('jury_members')) {
          const juryStore = db.createObjectStore('jury_members', { keyPath: 'id' });
          juryStore.createIndex('email', 'email', { unique: true });
        }

        if (!db.objectStoreNames.contains('categories')) {
          const categoryStore = db.createObjectStore('categories', { keyPath: 'id' });
          categoryStore.createIndex('name', 'name', { unique: true });
        }

        if (!db.objectStoreNames.contains('artists')) {
          const artistStore = db.createObjectStore('artists', { keyPath: 'id' });
          artistStore.createIndex('category_id', 'category_id');
          artistStore.createIndex('category_artist', ['category_id', 'artist_number'], { unique: true });
        }

        if (!db.objectStoreNames.contains('votes')) {
          const voteStore = db.createObjectStore('votes', { keyPath: 'id' });
          voteStore.createIndex('jury_member_id', 'jury_member_id');
          voteStore.createIndex('artist_id', 'artist_id');
          voteStore.createIndex('category_id', 'category_id');
          voteStore.createIndex('jury_artist', ['jury_member_id', 'artist_id'], { unique: true });
        }

        if (!db.objectStoreNames.contains('voting_sessions')) {
          db.createObjectStore('voting_sessions', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('excel_sync_logs')) {
          const excelStore = db.createObjectStore('excel_sync_logs', { keyPath: 'id' });
          excelStore.createIndex('created_at', 'created_at');
        }

        if (!db.objectStoreNames.contains('rankings')) {
          const rankingStore = db.createObjectStore('rankings', { keyPath: 'id' });
          rankingStore.createIndex('artist_id', 'artist_id');
          rankingStore.createIndex('session_id', 'session_id');
        }
      };
    });
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // CRUD génériques
  async create<T>(storeName: string, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      // Vérifier que les données ont une propriété 'id'
      if (!data || typeof data !== 'object' || !('id' in data)) {
        reject(new Error('Data must have an "id" property for IndexedDB keyPath'));
        return;
      }
      
      const store = this.getStore(storeName, 'readwrite');
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  async get<T>(storeName: string, id: string): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async update<T>(storeName: string, data: T): Promise<T> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result as T);
      request.onerror = () => reject(request.error);
    });
  }

  async delete(storeName: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Méthodes spécifiques
  async findAdminByEmail(email: string): Promise<AdminUser | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('admin_users');
      const index = store.index('email');
      const request = index.get(email);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async findJuryByEmail(email: string): Promise<JuryMember | undefined> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('jury_members');
      const index = store.index('email');
      const request = index.get(email);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getActiveCategories(): Promise<Category[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('categories');
      const request = store.getAll();
      request.onsuccess = () => {
        const allCategories = request.result;
        const activeCategories = allCategories.filter((cat: Category) => cat.is_active);
        resolve(activeCategories);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getArtistsByCategory(categoryId: string): Promise<Artist[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('artists');
      const index = store.index('category_id');
      const request = index.getAll(categoryId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getVotesByJuryMember(juryMemberId: string): Promise<Vote[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('votes');
      const index = store.index('jury_member_id');
      const request = index.getAll(juryMemberId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getVotesByArtist(artistId: string): Promise<Vote[]> {
    return new Promise((resolve, reject) => {
      const store = this.getStore('votes');
      const index = store.index('artist_id');
      const request = index.getAll(artistId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async createVote(vote: Omit<Vote, 'id' | 'created_at'>): Promise<Vote> {
    const newVote: Vote = {
      ...vote,
      id: generateUUID(),
      created_at: new Date().toISOString()
    };
    return this.create('votes', newVote);
  }

  async clearAll(): Promise<void> {
    const storeNames = ['admin_users', 'jury_members', 'categories', 'artists', 'votes', 'voting_sessions'];
    for (const storeName of storeNames) {
      await this.clear(storeName);
    }
  }

  private async clear(storeName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const store = this.getStore(storeName, 'readwrite');
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export const localDB = new LocalDatabase();
