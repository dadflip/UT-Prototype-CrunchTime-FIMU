import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

/**
 * Get the current session token from cookies
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session_token')?.value || null;
}

/**
 * Get the current jury member from session
 */
export async function getCurrentJuryMember() {
  const token = await getSessionToken();
  if (!token) return null;

  const { data, error } = await supabase
    .from('jury_members')
    .select('*')
    .eq('session_token', token)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get the current admin user from session
 */
export async function getCurrentAdminUser() {
  const token = await getSessionToken();
  if (!token) return null;

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('session_token', token)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get all categories with artists
 */
export async function getCategoriesWithArtists() {
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (catError) throw catError;

  // Get artists for each category
  const categoriesWithArtists = await Promise.all(
    (categories || []).map(async (category) => {
      const { data: artists, error: artError } = await supabase
        .from('artists')
        .select('*')
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('artist_number', { ascending: true });

      if (artError) throw artError;
      return { ...category, artists: artists || [] };
    })
  );

  return categoriesWithArtists;
}

/**
 * Get current voting session
 */
export async function getCurrentSession() {
  const { data, error } = await supabase
    .from('voting_sessions')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Submit votes for a jury member
 */
export async function submitVotes(
  juryId: string,
  sessionId: string,
  votes: Array<{ artistId: string; rank: number }>
) {
  const voteRecords = votes.map((vote) => ({
    jury_member_id: juryId,
    artist_id: vote.artistId,
    session_id: sessionId,
    rank_position: vote.rank,
  }));

  const { error } = await supabase.from('votes').insert(voteRecords);
  if (error) throw error;
}

/**
 * Get current rankings for a category
 */
export async function getRankings(sessionId: string) {
  const { data, error } = await supabase
    .from('rankings')
    .select('*, artists(name, artist_number, category_id)')
    .eq('session_id', sessionId)
    .order('final_rank', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data;
}

/**
 * Update rankings (reorder by admin)
 */
export async function updateRankings(sessionId: string, newRankings: any[]) {
  const updates = newRankings.map((ranking, index) => ({
    id: ranking.id,
    final_rank: index + 1,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('rankings')
    .upsert(updates, { onConflict: 'id' });

  if (error) throw error;
}

/**
 * Export votes to JSON for Excel
 */
export async function exportVotesToJSON(sessionId: string) {
  const { data: votes, error } = await supabase
    .from('votes')
    .select(`
      id,
      rank_position,
      points,
      jury_member_id,
      jury_members(member_name),
      artist_id,
      artists(name),
      session_id
    `)
    .eq('session_id', sessionId);

  if (error) throw error;
  return votes;
}
