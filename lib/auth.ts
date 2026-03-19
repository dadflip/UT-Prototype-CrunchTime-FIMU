import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

/**
 * Verify jury PIN - returns jury member if valid
 */
export async function verifyJuryPIN(pin: string) {
  try {
    // Get all jury members
    const { data: juryMembers, error } = await supabase
      .from('jury_members')
      .select('id, member_name, pin_hash, is_active')
      .eq('is_active', true);

    if (error) throw error;

    // Check PIN against each jury member
    for (const jury of juryMembers || []) {
      const isValid = await bcrypt.compare(pin, jury.pin_hash);
      if (isValid) {
        return { success: true, juryId: jury.id, name: jury.member_name };
      }
    }

    return { success: false, error: 'PIN invalide' };
  } catch (error) {
    console.error('PIN verification error:', error);
    return { success: false, error: 'Erreur lors de la vérification' };
  }
}

/**
 * Verify admin credentials
 */
export async function verifyAdminLogin(email: string, password: string) {
  try {
    const { data: admin, error } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, full_name, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    if (error) {
      return { success: false, error: 'Admin introuvable' };
    }

    const isValid = await bcrypt.compare(password, admin.password_hash);
    if (!isValid) {
      return { success: false, error: 'Mot de passe incorrect' };
    }

    return {
      success: true,
      adminId: admin.id,
      email: admin.email,
      name: admin.full_name,
      role: admin.role,
    };
  } catch (error) {
    console.error('Admin login error:', error);
    return { success: false, error: 'Erreur lors de la connexion' };
  }
}

/**
 * Hash password for storage
 */
export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
