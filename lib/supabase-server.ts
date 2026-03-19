import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials');
}

// Server-side Supabase client with service role (for admin operations)
export const supabaseAdmin = createClient(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
);

/**
 * Get the current session token from cookies (Server-side only)
 */
export async function getSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('session_token')?.value || cookieStore.get('jury_session_token')?.value || cookieStore.get('admin_session_token')?.value || null;
}

/**
 * Get the current jury member from session (Server-side only)
 */
export async function getCurrentJuryMember() {
  const token = await getSessionToken();
  if (!token) return null;

  const client = createClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await client
    .from('jury_members')
    .select('*')
    .limit(1)
    .single();

  if (error) return null;
  return data;
}

/**
 * Get the current admin user from session (Server-side only)
 */
export async function getCurrentAdminUser() {
  const token = await getSessionToken();
  if (!token) return null;

  const { data, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .limit(1)
    .single();

  if (error) return null;
  return data;
}
