'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowUpDown, Save, CheckCircle, ArrowLeft } from 'lucide-react';
import { Category, Artist, JuryFavorite } from '@/types';
import { localDB } from '@/lib/local-storage';
import { useJuryAuth } from '@/hooks/useJuryAuth';

interface RankedArtist extends Artist {
  rank: number;
}

export default function JuryRankingPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { juryMember } = useJuryAuth();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [rankedArtists, setRankedArtists] = useState<RankedArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resolvedParams = use(params);
  const categoryId = resolvedParams.categoryId;

  useEffect(() => {
    if (categoryId) {
      loadRankingData();
    }
  }, [categoryId, juryMember?.id]);

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadRankingData();
    setIsRefreshing(false);
  };

  const loadRankingData = async () => {
    try {
      if (!isRefreshing) setIsLoading(true);
      await localDB.init();
      
      // Charger la catégorie
      const categories = await localDB.getAll('categories');
      console.log('[RANKING] Catégories disponibles:', (categories as any[]).map((c: any) => ({ id: c.id, name: c.name })));
      console.log('[RANKING] Recherche de la catégorie avec ID:', categoryId);
      
      const currentCategory = (categories as any[]).find((cat: any) => cat.id === categoryId);
      
      if (!currentCategory) {
        console.log('[RANKING] Catégorie non trouvée pour ID:', categoryId);
        setMessage({ type: 'error', text: `Catégorie non trouvée (ID: ${categoryId})` });
        return;
      }
      
      setCategory(currentCategory);
      
      // Charger les favoris du jury pour cette catégorie
      if (juryMember) {
        // Forcer la relecture depuis la base de données
        console.log('[RANKING] Relecture des favoris depuis la base de données...');
        const allFavorites = await localDB.findBy('jury_favorites', 'jury_member_id', juryMember.id) as JuryFavorite[];
        console.log('[RANKING] Tous les favoris du juré:', allFavorites.length);
        console.log('[RANKING] Détails de tous les favoris:', allFavorites);
        
        const categoryFavorites = allFavorites.filter((fav: JuryFavorite) => fav.category_id === categoryId);
        console.log('[RANKING] Favoris trouvés:', categoryFavorites.length, 'pour la catégorie', categoryId);
        console.log('[RANKING] Détails des favoris de catégorie:', categoryFavorites);
        
        // Si aucun favori trouvé, attendre un peu et réessayer (pour la synchronisation)
        if (categoryFavorites.length === 0 && allFavorites.length > 0) {
          console.log('[RANKING] Attente de synchronisation...');
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Réessayer une fois
          const retryFavorites = await localDB.findBy('jury_favorites', 'jury_member_id', juryMember.id) as JuryFavorite[];
          const retryCategoryFavorites = retryFavorites.filter((fav: JuryFavorite) => fav.category_id === categoryId);
          console.log('[RANKING] Après attente - Favoris trouvés:', retryCategoryFavorites.length);
        }
        
        // Charger les artistes correspondants
        const artists = await localDB.getAll('artists') as Artist[];
        const favoriteArtists = artists.filter((artist: Artist) => 
          categoryFavorites.some((fav: JuryFavorite) => fav.artist_id === artist.id)
        );
        
        console.log('[RANKING] Artistes favoris trouvés:', favoriteArtists.length);
        console.log('[RANKING] Artistes favoris:', favoriteArtists.map(a => ({ id: a.id, name: a.name })));
        
        // Trier par rang existant ou par nom
        const ranked = favoriteArtists
          .map((artist: Artist) => {
            const favorite = categoryFavorites.find((fav: JuryFavorite) => fav.artist_id === artist.id);
            return {
              ...artist,
              rank: favorite?.rank || 0
            } as RankedArtist;
          })
          .sort((a: RankedArtist, b: RankedArtist) => {
            if (a.rank === 0 && b.rank === 0) return a.name.localeCompare(b.name);
            if (a.rank === 0) return 1;
            if (b.rank === 0) return -1;
            return a.rank - b.rank;
          });
        
        setRankedArtists(ranked);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données' });
    } finally {
      setIsLoading(false);
    }
  };

  const moveArtist = (fromIndex: number, toIndex: number) => {
    const newRanking = [...rankedArtists];
    const [movedArtist] = newRanking.splice(fromIndex, 1);
    newRanking.splice(toIndex, 0, movedArtist);
    
    // Mettre à jour les rangs
    const updatedRanking = newRanking.map((artist, index) => ({
      ...artist,
      rank: index + 1
    }));
    
    setRankedArtists(updatedRanking);
  };

  const moveUp = (index: number) => {
    if (index > 0) {
      moveArtist(index, index - 1);
    }
  };

  const moveDown = (index: number) => {
    if (index < rankedArtists.length - 1) {
      moveArtist(index, index + 1);
    }
  };

  const saveRanking = async () => {
    if (!juryMember || !category) return;

    try {
      setIsSaving(true);
      
      // Sauvegarder chaque artiste avec son rang
      for (let i = 0; i < rankedArtists.length; i++) {
        const artist = rankedArtists[i];
        
        // Chercher si un favori existe déjà
        const existingFavorites = await localDB.findBy('jury_favorites', 'jury_member_id', juryMember.id) as JuryFavorite[];
        const existingFavorite = existingFavorites.find((fav: JuryFavorite) => 
          fav.artist_id === artist.id && fav.category_id === category.id
        );
        
        if (existingFavorite) {
          // Mettre à jour le rang
          const updatedFavorite = {
            ...existingFavorite,
            rank: i + 1,
            updated_at: new Date().toISOString()
          };
          await localDB.update('jury_favorites', updatedFavorite);
        }
      }
      
      setMessage({ type: 'success', text: 'Classement sauvegardé avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde du classement' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  if (!category) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Catégorie non trouvée</AlertDescription>
      </Alert>
    );
  }

  const requiredSize = category.top_size || 5;
  const hasEnoughArtists = rankedArtists.length >= requiredSize;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Classement - {category.name}</h1>
          <p className="text-muted-foreground">
            Organisez vos {requiredSize} meilleurs coups de cœur par ordre de préférence
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={refreshData}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <ArrowUpDown className="h-4 w-4 mr-2" />
            )}
            Actualiser
          </Button>
          <Button variant="outline" onClick={() => router.push('/jury/favorites')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {!hasEnoughArtists && (
        <Alert>
          <AlertDescription>
            Vous devez sélectionner au moins {requiredSize} artistes avant de pouvoir classer.
            Actuellement: {rankedArtists.length}/{requiredSize}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-3">
        {rankedArtists.map((artist, index) => (
          <Card key={artist.id} className="drag-handle">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{artist.name}</h3>
                    {artist.description && (
                      <p className="text-sm text-muted-foreground">{artist.description}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => moveDown(index)}
                    disabled={index === rankedArtists.length - 1}
                  >
                    <ArrowUpDown className="h-4 w-4 rotate-180" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasEnoughArtists && (
        <div className="flex justify-center">
          <Button 
            onClick={saveRanking} 
            disabled={isSaving}
            size="lg"
            className="flex items-center gap-2"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Sauvegarder le classement
          </Button>
        </div>
      )}

      {rankedArtists.length > requiredSize && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Vous avez sélectionné {rankedArtists.length} artistes. Classez-les par ordre de préférence - 
            seuls les {requiredSize} premiers compteront pour le top final.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
