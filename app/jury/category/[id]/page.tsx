'use client';

import { useEffect, useState, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useJuryAuth } from '@/hooks/useJuryAuth';
import { localDB } from '@/lib/local-storage';
import { Category, Artist, Vote } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Helper function to generate ID fallback
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function CategoryVotingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { juryMember } = useJuryAuth();
  const resolvedParams = use(params);
  const categoryId = resolvedParams.id;

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
        await localDB.init();

        // Get current voting session
        const sessions = await localDB.getAll('voting_sessions');
        const session = (sessions as any[]).find((s: any) => s.status === 'open');

        if (!session) {
          console.error('[v0] No open voting session');
          return;
        }
        setCurrentSession(session.id);

        // Fetch category
        const categoriesData = await localDB.getAll('categories');
        console.log('[CATEGORY] Catégories disponibles:', (categoriesData as any[]).map((c: any) => ({ id: c.id, name: c.name, is_active: c.is_active })));
        console.log('[CATEGORY] Recherche de la catégorie avec ID:', categoryId);
        
        const categoryData = (categoriesData as any[]).find((c: any) => c.id === categoryId && c.is_active);

        if (!categoryData) {
          console.error('[CATEGORY] Category not found for ID:', categoryId);
          return;
        }
        setCategory(categoryData);

        // Fetch artists in this category
        const artistsData = await localDB.getAll('artists');
        const categoryArtists = (artistsData as any[]).filter((a: any) => 
          a.category_id === categoryId && a.is_active
        ).sort((a: any, b: any) => a.artist_number - b.artist_number);

        setArtists(categoryArtists);

        // Fetch this jury's votes for this category in this session
        const votesData = await localDB.getAll('votes');
        const juryVotes = (votesData as any[]).filter((v: any) => 
          v.jury_member_id === juryMember.id && 
          v.category_id === categoryId
        );

        // Map votes by artist ID for quick lookup
        const votesMap: Record<string, number> = {};
        juryVotes.forEach((vote: any) => {
          votesMap[vote.artist_id] = vote.score;
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

  const handleSubmitVote = async (artistId: string, rankPosition: number) => {
    if (!juryMember?.id || !currentSession) return;

    try {
      setSubmitting(true);
      await localDB.init();

      // Get all existing votes for this jury member in this session
      const votesData = await localDB.getAll('votes');
      const existingVotes = (votesData as any[]).filter((v: any) => 
        v.jury_member_id === juryMember.id && 
        v.session_id === currentSession
      );

      // Remove existing votes for this rank position or artist
      const votesToRemove = existingVotes.filter((v: any) => 
        v.category_id === categoryId && 
        (v.score === rankPosition || v.artist_id === artistId)
      );

      for (const vote of votesToRemove) {
        await localDB.delete('votes', vote.id);
      }

      // Insert new vote
      await localDB.create('votes', {
        id: generateId(),
        jury_member_id: juryMember.id,
        artist_id: artistId,
        category_id: categoryId,
        session_id: currentSession,
        score: rankPosition,
        created_at: new Date().toISOString()
      });

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
                          onClick={() => handleSubmitVote(artist.id, position)}
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
                        onClick={() => handleSubmitVote(artist.id, 0)}
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
