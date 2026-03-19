import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdminUser } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const adminUser = await getCurrentAdminUser();

    if (!adminUser) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Don't return password hash
    const { password_hash, ...safeAdmin } = adminUser;

    return NextResponse.json(
      { success: true, admin: safeAdmin },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Check admin auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
