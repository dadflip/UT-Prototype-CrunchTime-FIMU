import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { generateSessionToken } from '@/lib/auth-utils';
import crypto from 'crypto';

const AdminLoginSchema = z.object({
  email: z.string().email('Format email invalide'),
  password: z.string().min(6, 'Mot de passe minimum 6 caractères'),
});

// Helper to hash password using SHA-256
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to compare passwords
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = AdminLoginSchema.parse(body);

    // Find admin user
    const { data: adminUser, error: queryError } = await supabase
      .from('admin_users')
      .select('id, email, password_hash, full_name, role, is_active')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (queryError || !adminUser) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe invalide.' },
        { status: 401 }
      );
    }

    // Verify password
    if (!verifyPassword(password, adminUser.password_hash)) {
      return NextResponse.json(
        { success: false, error: 'Email ou mot de passe invalide.' },
        { status: 401 }
      );
    }

    // Generate session token
    const sessionToken = generateSessionToken();

    // Create response with session token in httpOnly cookie
    const response = NextResponse.json(
      {
        success: true,
        message: 'Connexion réussie',
        admin: {
          id: adminUser.id,
          email: adminUser.email,
          full_name: adminUser.full_name,
          role: adminUser.role,
        },
      },
      { status: 200 }
    );

    // Set httpOnly cookie for session
    response.cookies.set('admin_session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Format de requête invalide.' },
        { status: 400 }
      );
    }

    console.error('[v0] Admin login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
