import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { hashPIN, generateSessionToken, isValidPINFormat } from '@/lib/auth-utils';

const PINLoginSchema = z.object({
  pin: z.string().min(4, 'PIN must be at least 4 digits'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = PINLoginSchema.parse(body);

    // Validate PIN format
    if (!isValidPINFormat(pin)) {
      return NextResponse.json(
        { success: false, error: 'PIN invalide. Format: 4-8 chiffres.' },
        { status: 400 }
      );
    }

    // Hash the provided PIN
    const pinHash = hashPIN(pin);

    // Get all active jury members
    const { data: juryMembers, error: queryError } = await supabase
      .from('jury_members')
      .select('id, member_name, pin_hash, is_active')
      .eq('is_active', true);

    if (queryError) {
      throw queryError;
    }

    // Find matching jury member by comparing PIN hash
    let validJury = null;
    for (const jury of juryMembers || []) {
      if (jury.pin_hash === pinHash) {
        validJury = jury;
        break;
      }
    }

    if (!validJury) {
      return NextResponse.json(
        { success: false, error: 'PIN invalide.' },
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
        juryMember: {
          id: validJury.id,
          member_name: validJury.member_name,
          is_active: validJury.is_active,
        },
      },
      { status: 200 }
    );

    // Set httpOnly cookie for session
    response.cookies.set('jury_session_token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 8 * 60 * 60, // 8 hours
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

    console.error('[v0] Jury login error:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
