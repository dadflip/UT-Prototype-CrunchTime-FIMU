'use client';

import { useEffect, useState } from 'react';
import { localDB } from '@/lib/local-storage';
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
        await localDB.init();

        // Fetch rankings and artists separately
        const [rankingsData, artistsData] = await Promise.all([
          localDB.getAll('rankings'),
          localDB.getAll('artists').then(artists => 
            (artists as any[]).filter((a: any) => a.is_active !== false)
          )
        ]);

        setRankings(rankingsData as any[]);
        setArtists(artistsData as Artist[]);
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
      await localDB.init();
      
      // Clear existing rankings
      await localDB.clearAll();

      // Insert updated rankings
      for (const ranking of updatedRankings) {
        await localDB.create('rankings', {
          ...ranking,
          id: ranking.id || crypto.randomUUID?.() || generateId(),
        });
      }

      // Reload rankings
      const rankingsData = await localDB.getAll('rankings');
      setRankings(rankingsData as any[]);
    } catch (error) {
      console.error('[v0] Failed to update rankings:', error);
      throw error;
    }
  };

  // Helper function to generate ID fallback
  const generateId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
