'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Vote } from '@/types';

export function useVotes(categoryId: string, juryMemberId?: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch votes for category
  const fetchVotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('votes')
        .select('*')
        .eq('category_id', categoryId);

      if (juryMemberId) {
        query = query.eq('jury_member_id', juryMemberId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setVotes(data || []);
    } catch (err) {
      console.error('[v0] Failed to fetch votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch votes');
    } finally {
      setLoading(false);
    }
  }, [categoryId, juryMemberId]);

  useEffect(() => {
    fetchVotes();
  }, [fetchVotes]);

  // Submit a vote
  const submitVote = useCallback(
    async (artistId: string, points: number, juryId: string) => {
      try {
        setError(null);

        // Check if vote already exists
        const { data: existingVote } = await supabase
          .from('votes')
          .select('id')
          .eq('artist_id', artistId)
          .eq('jury_member_id', juryId)
          .eq('category_id', categoryId)
          .single();

        if (existingVote) {
          // Update existing vote
          const { error: updateError } = await supabase
            .from('votes')
            .update({ points, timestamp: new Date().toISOString() })
            .eq('id', existingVote.id);

          if (updateError) throw updateError;
        } else {
          // Insert new vote
          const { error: insertError } = await supabase
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

          if (insertError) throw insertError;
        }

        // Refresh votes
        await fetchVotes();
        return true;
      } catch (err) {
        console.error('[v0] Failed to submit vote:', err);
        setError(err instanceof Error ? err.message : 'Failed to submit vote');
        return false;
      }
    },
    [categoryId, fetchVotes]
  );

  return {
    votes,
    loading,
    error,
    submitVote,
    refetch: fetchVotes,
  };
}
