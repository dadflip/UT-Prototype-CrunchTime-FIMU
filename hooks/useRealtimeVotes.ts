'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Vote } from '@/types';

export function useRealtimeVotes(categoryId?: string) {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialVotes = async () => {
      try {
        let query = supabase.from('votes').select('*');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data } = await query;
        setVotes(data || []);
      } catch (error) {
        console.error('[v0] Failed to load votes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialVotes();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(categoryId ? `votes_${categoryId}` : 'votes_all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes',
          ...(categoryId && { filter: `category_id=eq.${categoryId}` }),
        },
        (payload) => {
          console.log('[v0] Real-time vote update:', payload);

          if (payload.eventType === 'INSERT') {
            setVotes((prev) => [...prev, payload.new as Vote]);
          } else if (payload.eventType === 'UPDATE') {
            setVotes((prev) =>
              prev.map((v) => (v.id === payload.new.id ? (payload.new as Vote) : v))
            );
          } else if (payload.eventType === 'DELETE') {
            setVotes((prev) => prev.filter((v) => v.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [categoryId]);

  return { votes, loading };
}

export function useRealtimeArtists(categoryId?: string) {
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialArtists = async () => {
      try {
        let query = supabase.from('artists').select('*');

        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data } = await query;
        setArtists(data || []);
      } catch (error) {
        console.error('[v0] Failed to load artists:', error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialArtists();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(categoryId ? `artists_${categoryId}` : 'artists_all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artists',
          ...(categoryId && { filter: `category_id=eq.${categoryId}` }),
        },
        (payload) => {
          console.log('[v0] Real-time artist update:', payload);

          if (payload.eventType === 'INSERT') {
            setArtists((prev) => [...prev, payload.new]);
          } else if (payload.eventType === 'UPDATE') {
            setArtists((prev) =>
              prev.map((a) => (a.id === payload.new.id ? payload.new : a))
            );
          } else if (payload.eventType === 'DELETE') {
            setArtists((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [categoryId]);

  return { artists, loading };
}
