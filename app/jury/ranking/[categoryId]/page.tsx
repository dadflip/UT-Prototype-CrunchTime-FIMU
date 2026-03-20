'use client';

import { useState, useEffect } from 'react';
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

export default function JuryRankingPage({ params }: { params: { categoryId: string } }) {
  const { juryMember } = useJuryAuth();
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [rankedArtists, setRankedArtists] = useState<RankedArtist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadRankingData();
  }, [params.categoryId]);

  const loadRankingData = async () => {
    try {
      setIsLoading(true);
      
      // Charger la catégorie
      const categories = await localDB.getAll('categories');
      const currentCategory = (categories as any[]).find((cat: any) => cat.id === params.categoryId);
      
      if (!currentCategory) {
        setMessage({ type: 'error', text: 'Catégorie non trouvée' });
        return;
      }
      
      setCategory(currentCategory);
      
      // Charger les favoris du jury pour cette catégorie
      if (juryMember) {
        const favorites = await localDB.findBy('jury_favorites', 'jury_member_id', juryMember.id);
        const categoryFavorites = favorites.filter((fav: any) => fav.category_id === params.categoryId);
        
        // Charger les artistes correspondants
        const artists = await localDB.getAll('artists');
        const favoriteArtists = artists.filter((artist: any) => 
          categoryFavorites.some((fav: any) => fav.artist_id === artist.id)
        );
        
        // Trier par rang existant ou par nom
        const ranked = favoriteArtists
          .map((artist: any) => ({
            ...artist,
            rank: categoryFavorites.find((fav: any) => fav.artist_id === artist.id)?.rank || 0
          }))
          .sort((a: any, b: any) => {
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
        const existingFavorites = await localDB.findBy('jury_favorites', 'jury_member_id', juryMember.id);
        const existingFavorite = existingFavorites.find((fav: any) => 
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
        <Button variant="outline" onClick={() => router.push('/jury/favorites')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
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

      {hasEnoughArtists && rankedArtists.length > requiredSize && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Vous avez sélectionné plus de {requiredSize} artistes. Seuls les {requiredSize} premiers seront comptabilisés pour le classement final.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
