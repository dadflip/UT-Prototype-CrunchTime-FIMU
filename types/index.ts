// Database Types - Local storage version
export interface Category {
  id: string;
  name: string;
  description?: string;
  order_index: number;
  is_active: boolean;
  top_size?: number; // Nombre d'artistes dans le top pour cette catégorie
}

export interface Artist {
  id: string;
  name: string;
  description?: string;
  category_id: string;
  artist_number?: number;
  image_url?: string;
  is_active: boolean;
}

export interface JuryMember {
  id: string;
  member_name: string;
  pin_hash: string; // hashed PIN
  email?: string;
  is_active: boolean;
}

export interface Vote {
  id: string;
  artist_id: string;
  jury_member_id: string;
  category_id: string;
  score: number;
  created_at: string;
}

export interface JuryFavorite {
  id: string;
  jury_member_id: string;
  artist_id: string;
  category_id: string;
  rank?: number; // Position dans le classement du jury
  created_at: string;
  updated_at: string;
}

export interface Ranking {
  id: string;
  artist_id: string;
  session_id: string;
  total_points: number;
  vote_count: number;
  average_rank?: number;
  final_rank?: number;
  is_finalist: boolean;
}

export interface VotingSession {
  id: string;
  name: string;
  status: 'open' | 'paused' | 'closed';
  category_id?: string;
  start_time?: string;
  end_time?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  password_hash: string;
  full_name?: string;
  role: 'admin' | 'superadmin';
  is_active: boolean;
}

export interface ExcelSyncLog {
  id: string;
  operation_type: 'import' | 'export' | 'sync';
  source_file: string;
  status: 'success' | 'failed' | 'pending';
  records_affected: number;
  error_message?: string;
  created_at: string;
}

// API Request/Response Types
export interface PINLoginRequest {
  pin: string;
  juryName?: string;
}

export interface PINLoginResponse {
  success: boolean;
  message: string;
  juryMember?: JuryMember;
  error?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  message: string;
  admin?: AdminUser;
  error?: string;
}

export interface VoteSubmission {
  artistId: string;
  categoryId: string;
  points: number;
}

export interface VoteResponse {
  success: boolean;
  message: string;
  vote?: Vote;
  error?: string;
}
