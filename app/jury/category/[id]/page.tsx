'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useJuryAuth } from '@/hooks/useJuryAuth';
import { supabase } from '@/lib/supabase';
import { Category, Artist, Vote } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function CategoryVotingPage() {
  const params = useParams();
  const router = useRouter();
  const { juryMember } = useJuryAuth();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!juryMember?.id) return;

      try {
        setLoading(true);

        // Get current voting session
        const { data: session } = await supabase
          .from('voting_sessions')
          .select('id')
          .eq('status', 'open')
          .limit(1)
          .single();

        if (!session) {
          console.error('[v0] No open voting session');
          return;
        }
        setCurrentSession(session.id);

        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .eq('is_active', true)
          .single();

        if (categoryError) throw categoryError;
        setCategory(categoryData);

        // Fetch artists in this category
        const { data: artistsData, error: artistsError } = await supabase
          .from('artists')
          .select('*')
          .eq('category_id', categoryId)
          .eq('is_active', true)
          .order('artist_number', { ascending: true });

        if (artistsError) throw artistsError;
        setArtists(artistsData || []);

        // Fetch this jury's votes for this category in this session
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('artist_id, rank_position')
          .eq('jury_member_id', juryMember.id)
          .eq('session_id', session.id);

        if (votesError) throw votesError;

        // Map votes by artist ID for quick lookup
        const votesMap: Record<string, number> = {};
        (votesData || []).forEach((vote) => {
          votesMap[vote.artist_id] = vote.rank_position;
        });
        setVotes(votesMap);
      } catch (error) {
        console.error('[v0] Failed to load category:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId, juryMember?.id]);

  const handleVote = async (artistId: string, rankPosition: number) => {
    if (!juryMember?.id || !currentSession) return;

    setSubmitting(true);
    try {
      // Check if vote already exists for this rank position
      const { data: existingRankVote } = await supabase
        .from('votes')
        .select('id')
        .eq('jury_member_id', juryMember.id)
        .eq('session_id', currentSession)
        .eq('rank_position', rankPosition)
        .single();

      if (existingRankVote) {
        // Remove old vote for this rank
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingRankVote.id);
      }

      // Check if this artist already has a vote
      const { data: existingArtistVote } = await supabase
        .from('votes')
        .select('id')
        .eq('jury_member_id', juryMember.id)
        .eq('session_id', currentSession)
        .eq('artist_id', artistId)
        .single();

      if (existingArtistVote) {
        // Delete old vote for this artist
        await supabase
          .from('votes')
          .delete()
          .eq('id', existingArtistVote.id);
      }

      // Insert new vote
      const { error } = await supabase
        .from('votes')
        .insert([
          {
            jury_member_id: juryMember.id,
            artist_id: artistId,
            session_id: currentSession,
            rank_position: rankPosition,
          },
        ]);

      if (error) throw error;

      // Update local state
      const newVotes = { ...votes };
      // Remove any other votes for this rank
      Object.keys(newVotes).forEach((key) => {
        if (newVotes[key] === rankPosition) {
          delete newVotes[key];
        }
      });
      newVotes[artistId] = rankPosition;
      setVotes(newVotes);
    } catch (error) {
      console.error('[v0] Vote failed:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Catégorie non trouvée</p>
        <Button variant="outline" onClick={() => router.back()} className="mt-4">
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{category.name}</h1>
          <p className="text-muted-foreground mt-1">
            {artists.length} artiste(s) disponible(s)
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          ← Retour
        </Button>
      </div>

      {artists.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              Aucun artiste disponible dans cette catégorie
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {artists.map((artist) => {
              const rank = votes[artist.id];
              return (
                <Card
                  key={artist.id}
                  className={`cursor-pointer transition-all ${rank ? 'border-primary ring-1 ring-primary' : ''}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{artist.name}</CardTitle>
                        {artist.description && (
                          <CardDescription className="mt-1">{artist.description}</CardDescription>
                        )}
                      </div>
                      {rank && <Badge variant="default">Rang: {rank}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-5 gap-2">
                      {[1, 2, 3, 4, 5].map((position) => (
                        <Button
                          key={position}
                          variant={rank === position ? 'default' : 'outline'}
                          size="sm"
                          className="w-full"
                          onClick={() => handleVote(artist.id, position)}
                          disabled={submitting}
                        >
                          {position}
                        </Button>
                      ))}
                    </div>
                    {rank && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive"
                        onClick={() => handleVote(artist.id, 0)}
                        disabled={submitting}
                      >
                        Retirer le vote
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Vous avez voté pour <span className="font-semibold">{Object.keys(votes).length}</span> sur{' '}
              <span className="font-semibold">{artists.length}</span> artiste(s)
            </p>
          </div>
        </>
      )}
    </div>
  );
}
