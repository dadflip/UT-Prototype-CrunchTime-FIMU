'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getCurrentJuryMember } from '@/lib/supabase';
import { Category, Artist, Vote } from '@/types';
import { Button } from '@/components/ui/button';
import { VotingCard } from '@/components/jury/VotingCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryVotingPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [votes, setVotes] = useState<Record<string, Vote>>({});
  const [loading, setLoading] = useState(true);
  const [juryId, setJuryId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Get current jury member
        const juryMember = await getCurrentJuryMember();
        if (!juryMember) {
          router.push('/');
          return;
        }
        setJuryId(juryMember.id);

        // Fetch category
        const { data: categoryData, error: categoryError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', categoryId)
          .single();

        if (categoryError) throw categoryError;
        setCategory(categoryData);

        // Fetch artists in this category
        const { data: artistsData, error: artistsError } = await supabase
          .from('artists')
          .select('*')
          .eq('category_id', categoryId)
          .eq('is_visible', true)
          .order('performance_order', { ascending: true });

        if (artistsError) throw artistsError;
        setArtists(artistsData || []);

        // Fetch this jury's votes for this category
        const { data: votesData, error: votesError } = await supabase
          .from('votes')
          .select('*')
          .eq('category_id', categoryId)
          .eq('jury_member_id', juryMember.id);

        if (votesError) throw votesError;

        // Map votes by artist ID for quick lookup
        const votesMap: Record<string, Vote> = {};
        (votesData || []).forEach((vote) => {
          votesMap[vote.artist_id] = vote;
        });
        setVotes(votesMap);
      } catch (error) {
        console.error('[v0] Failed to load category:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Subscribe to real-time artist changes
    const subscription = supabase
      .channel(`category_${categoryId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artists', filter: `category_id=eq.${categoryId}` },
        (payload) => {
          console.log('[v0] Artists changed:', payload);
          // Refetch artists
          loadData();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [categoryId, router]);

  const handleVote = async (artistId: string, points: number) => {
    if (!juryId) return;

    setSubmitting(artistId);
    try {
      // Check if vote already exists
      const { data: existingVote } = await supabase
        .from('votes')
        .select('id')
        .eq('artist_id', artistId)
        .eq('jury_member_id', juryId)
        .eq('category_id', categoryId)
        .single();

      if (existingVote) {
        // Update
        const { error } = await supabase
          .from('votes')
          .update({ points, timestamp: new Date().toISOString() })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Insert
        const { error } = await supabase
          .from('votes')
          .insert([
            {
              artist_id: artistId,
              jury_member_id: juryId,
              category_id: categoryId,
              points,
              timestamp: new Date().toISOString(),
            },
          ]);

        if (error) throw error;
      }

      // Update local state
      setVotes((prev) => ({
        ...prev,
        [artistId]: {
          id: prev[artistId]?.id || `vote_${artistId}`,
          artist_id: artistId,
          jury_member_id: juryId,
          category_id: categoryId,
          points,
          timestamp: new Date().toISOString(),
          created_at: new Date().toISOString(),
        },
      }));
    } catch (error) {
      console.error('[v0] Vote failed:', error);
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          ← Retour
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{category?.name}</h1>
          <p className="text-muted-foreground mt-1">
            {artists.length} artiste(s) à voter
          </p>
        </div>
      </div>

      {/* Voting Cards */}
      {artists.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">
            Aucun artiste disponible dans cette catégorie
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {artists.map((artist) => (
            <VotingCard
              key={artist.id}
              artist={artist}
              userVote={votes[artist.id]}
              onVote={handleVote}
              isLoading={submitting === artist.id}
            />
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          Vous avez voté pour <span className="font-semibold">{Object.keys(votes).length}</span> sur{' '}
          <span className="font-semibold">{artists.length}</span> artiste(s) dans cette catégorie
        </p>
      </div>
    </div>
  );
}
