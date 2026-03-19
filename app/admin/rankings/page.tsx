'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Artist, Ranking } from '@/types';
import { RankingsEditor } from '@/components/admin/RankingsEditor';
import { Skeleton } from '@/components/ui/skeleton';

export default function RankingsPage() {
  const [rankings, setRankings] = useState<(Ranking & { artist?: Artist })[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Fetch rankings with artist data
        const { data: rankingsData } = await supabase
          .from('rankings')
          .select('*, artist:artists(*)')
          .order('rank_position', { ascending: true });

        setRankings(rankingsData || []);

        // Fetch all artists
        const { data: artistsData } = await supabase
          .from('artists')
          .select('*')
          .eq('is_visible', true)
          .order('name', { ascending: true });

        setArtists(artistsData || []);
      } catch (error) {
        console.error('[v0] Failed to load rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleUpdateRankings = async (updatedRankings: Ranking[]) => {
    try {
      // Delete existing rankings
      await supabase.from('rankings').delete().neq('id', 'null');

      // Insert updated rankings
      const rankingsToInsert = updatedRankings.map((r) => ({
        artist_id: r.artist_id,
        rank_position: r.rank_position,
        display_title: r.display_title,
        display_order: r.display_order,
        is_locked: r.is_locked,
        updated_by: 'admin_user',
      }));

      const { error } = await supabase
        .from('rankings')
        .insert(rankingsToInsert);

      if (error) throw error;

      // Reload rankings
      const { data: newRankings } = await supabase
        .from('rankings')
        .select('*, artist:artists(*)')
        .order('rank_position', { ascending: true });

      setRankings(newRankings || []);
    } catch (error) {
      console.error('[v0] Failed to update rankings:', error);
      alert('Erreur lors de la mise à jour du classement');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Gestion du Top Artistes</h2>
          <p className="text-muted-foreground">Classement des meilleurs artistes</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Gestion du Top Artistes</h2>
        <p className="text-muted-foreground mt-1">
          Organisez et gérez le classement des meilleurs artistes
        </p>
      </div>

      <RankingsEditor
        rankings={rankings}
        availableArtists={artists}
        onUpdate={handleUpdateRankings}
        isLoading={loading}
      />
    </div>
  );
}
