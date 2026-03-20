'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { Category, Artist, JuryFavorite } from '@/types';
import { localDB } from '@/lib/local-storage';
import { useJuryAuth } from '@/hooks/useJuryAuth';

// Helper function to generate ID fallback
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function JuryFavoritesPage() {
  const { juryMember } = useJuryAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [favorites, setFavorites] = useState<JuryFavorite[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      await localDB.init();
      
      const [categoriesData, artistsData, favoritesData] = await Promise.all([
        localDB.getAll('categories'),
        localDB.getAll('artists'),
        juryMember ? localDB.findBy('jury_favorites', 'jury_member_id', juryMember.id) : []
      ]);

      console.log('[FAVORITES] Données chargées:', {
        categories: (categoriesData as any[]).length,
        artists: (artistsData as any[]).length,
        favorites: (favoritesData as any[])?.length || 0
      });

      // Filtrer catégories actives et trier
      const activeCategories = (categoriesData as any[])
        .filter((cat: any) => cat.is_active)
        .sort((a: any, b: any) => a.order_index - b.order_index);
      
      setCategories(activeCategories);
      setArtists(artistsData as Artist[]);
      setFavorites((favoritesData as JuryFavorite[]) || []);
    } catch (error) {
      console.error('[FAVORITES] Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryArtists = (categoryId: string) => {
    return artists.filter(artist => artist.category_id === categoryId && artist.is_active);
  };

  const getFavoriteIds = () => {
    return favorites.map(fav => fav.artist_id);
  };

  const toggleFavorite = async (artist: Artist, categoryId: string) => {
    if (!juryMember) return;

    const isFavorite = favorites.some(fav => fav.artist_id === artist.id);
    const categoryFavorites = favorites.filter(fav => fav.category_id === categoryId);
    const category = categories.find(cat => cat.id === categoryId);
    const maxFavorites = category?.top_size || 5;
    
    console.log('[FAVORITES] Toggle favorite:', { 
      artist: artist.name, 
      isFavorite, 
      categoryId, 
      currentCount: categoryFavorites.length,
      maxFavorites
    });
    
    try {
      await localDB.init();
      
      if (isFavorite) {
        // Retirer des favoris
        const favorite = favorites.find(fav => fav.artist_id === artist.id);
        if (favorite) {
          console.log('[FAVORITES] Suppression du favori:', favorite.id);
          await localDB.delete('jury_favorites', favorite.id);
          setFavorites(prev => prev.filter(fav => fav.id !== favorite.id));
          console.log('[FAVORITES] Favori supprimé, reste:', favorites.length - 1);
        }
      } else {
        // Vérifier si on peut ajouter un nouveau favori
        if (categoryFavorites.length >= maxFavorites) {
          console.log('[FAVORITES] Limite atteinte, impossible d\'ajouter');
          alert(`Vous avez déjà sélectionné ${maxFavorites} artistes pour cette catégorie. Retirez d'abord un artiste de vos favoris.`);
          return;
        }
        
        // Ajouter aux favoris
        const newFavorite: JuryFavorite = {
          id: generateId(),
          jury_member_id: juryMember.id,
          artist_id: artist.id,
          category_id: categoryId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('[FAVORITES] Ajout du favori:', newFavorite);
        await localDB.create('jury_favorites', newFavorite);
        setFavorites(prev => [...prev, newFavorite]);
        console.log('[FAVORITES] Favori ajouté, total:', favorites.length + 1);
      }
    } catch (error) {
      console.error('[FAVORITES] Error toggling favorite:', error);
    }
  };

  const canProceedToRanking = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const categoryFavorites = favorites.filter(fav => fav.category_id === categoryId);
    return category && categoryFavorites.length >= (category.top_size || 5);
  };

  const proceedToRanking = (categoryId: string) => {
    router.push(`/jury/ranking/${categoryId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sélectionnez vos coups de cœur</h1>
        <p className="text-muted-foreground">
          Choisissez vos artistes préférés pour chaque catégorie avant de les classer.
        </p>
      </div>

      {!selectedCategory ? (
        // Vue des catégories
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const categoryFavorites = favorites.filter(fav => fav.category_id === category.id);
            const requiredSize = category.top_size || 5;
            const canRank = canProceedToRanking(category.id);
            
            return (
              <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{category.name}</CardTitle>
                    <Badge variant={canRank ? "default" : "secondary"}>
                      {categoryFavorites.length}/{requiredSize}
                    </Badge>
                  </div>
                  <CardDescription>
                    {canRank 
                      ? "✅ Prêt pour le classement" 
                      : `Sélectionnez ${requiredSize - categoryFavorites.length} artiste${requiredSize - categoryFavorites.length > 1 ? 's' : ''} sur ${requiredSize}`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setSelectedCategory(category.id)}
                    className="w-full"
                    variant={canRank ? "default" : "outline"}
                  >
                    {canRank ? (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Classer mes favoris
                      </>
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-2" />
                        Sélectionner
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        // Vue des artistes de la catégorie sélectionnée
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold">
                {categories.find(cat => cat.id === selectedCategory)?.name}
              </h2>
              <p className="text-muted-foreground">
                Sélectionnez vos coups de cœur ({favorites.filter(fav => fav.category_id === selectedCategory).length} / {(categories.find(cat => cat.id === selectedCategory)?.top_size || 5)} requis)
              </p>
            </div>
            <Button variant="outline" onClick={() => setSelectedCategory(null)}>
              Retour aux catégories
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {getCategoryArtists(selectedCategory).map((artist) => {
              const isFavorite = favorites.some(fav => fav.artist_id === artist.id);
              
              return (
                <Card key={artist.id} className={`cursor-pointer transition-all ${isFavorite ? 'ring-2 ring-primary' : ''}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{artist.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(artist, selectedCategory)}
                        className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
                      >
                        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                      </Button>
                    </CardTitle>
                    {artist.description && (
                      <CardDescription>{artist.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>

          {canProceedToRanking(selectedCategory) && (
            <div className="mt-8">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Vous avez sélectionné suffisamment d'artistes ! Vous pouvez maintenant procéder au classement.
                </AlertDescription>
              </Alert>
              
              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => proceedToRanking(selectedCategory)}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <ArrowRight className="h-4 w-4" />
                  Classer mes favoris
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
