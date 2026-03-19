import { NextRequest, NextResponse } from 'next/server';
import { getCurrentJuryMember } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const juryMember = await getCurrentJuryMember();

    if (!juryMember) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: true, juryMember },
      { status: 200 }
    );
  } catch (error) {
    console.error('[v0] Check jury auth error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
