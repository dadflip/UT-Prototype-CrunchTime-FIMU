import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    const format = request.nextUrl.searchParams.get('format') || 'json';

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId requis' },
        { status: 400 }
      );
    }

    // Fetch votes with relationships
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select(`
        id,
        rank_position,
        points,
        jury_members(id, member_name),
        artists(id, name),
        categories(id, name)
      `)
      .eq('session_id', sessionId);

    if (votesError) throw votesError;

    if (format === 'csv') {
      // Convert to CSV
      const csv = [
        ['Juré', 'Artiste', 'Catégorie', 'Position', 'Points'],
        ...(votes || []).map((v: any) => [
          v.jury_members?.member_name || 'Unknown',
          v.artists?.name || 'Unknown',
          v.artists?.category_id || 'Unknown',
          v.rank_position,
          v.points,
        ]),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="votes-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Default: JSON format
    return NextResponse.json({
      session_id: sessionId,
      exported_at: new Date().toISOString(),
      total_votes: votes?.length || 0,
      votes: votes || [],
    });
  } catch (error) {
    console.error('[v0] Excel export error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'export' },
      { status: 500 }
    );
  }
}
