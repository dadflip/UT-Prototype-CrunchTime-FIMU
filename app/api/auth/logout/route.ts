import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getSessionToken } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const token = await getSessionToken();

    if (token) {
      // Clear session token from database (both jury and admin)
      await supabase
        .from('jury_members')
        .update({ session_token: null })
        .eq('session_token', token);

      await supabase
        .from('admin_users')
        .update({ session_token: null })
        .eq('session_token', token);
    }

    // Clear session cookie
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    response.cookies.set('session_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[v0] Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
