'use client';

import { useEffect, useState } from 'react';
import { localDB } from '@/lib/local-storage';
import { Artist, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

interface ArtistWithCategory extends Artist {
  category?: Category;
}

export default function PerformanceFlowPage() {
  const [artists, setArtists] = useState<ArtistWithCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await localDB.init();

        // Fetch categories
        const categoriesData = await localDB.getAll('categories');
        setCategories(categoriesData as Category[]);

        // Fetch all artists
        const artistsData = await localDB.getAll('artists');
        setArtists(artistsData as Artist[]);
      } catch (error) {
        console.error('[v0] Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const toggleVisibility = async (artistId: string, isVisible: boolean) => {
    try {
      await localDB.init();
      await localDB.update('artists', { id: artistId, is_active: !isVisible });

      setArtists((prev) =>
        prev.map((a) =>
          a.id === artistId ? { ...a, is_active: !isVisible } : a
        )
      );
    } catch (error) {
      console.error('[v0] Failed to toggle visibility:', error);
    }
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Catégorie inconnue';
  };

  const filteredArtists = selectedCategory && selectedCategory !== 'all'
    ? artists.filter((a) => a.category_id === selectedCategory)
    : artists;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Contrôle des performances</h2>
          <p className="text-muted-foreground">Gérez l'ordre des performances et la visibilité</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Contrôle des performances</h2>
        <p className="text-muted-foreground mt-1">
          Gérez l'ordre des performances et contrôlez la visibilité des artistes
        </p>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filtrer par catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Voir tous les artistes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les artistes</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Artists List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Liste des artistes ({filteredArtists.length})
          </CardTitle>
          <CardDescription>
            Contrôlez la visibilité pour les jurés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredArtists.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Aucun artiste trouvé
              </div>
            ) : (
              filteredArtists.map((artist) => (
                <div
                  key={artist.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-muted-foreground min-w-8">
                        #{artist.artist_number}
                      </div>
                      <div>
                        <p className="font-semibold">{artist.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getCategoryName(artist.category_id)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant={artist.is_active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleVisibility(artist.id, artist.is_active)}
                  >
                    {artist.is_active ? '👁️ Visible' : '👁️‍🗨️ Caché'}
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Performance Info */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>Artiste en cours</CardTitle>
          <CardDescription>Artiste actuellement affiché aux jurés</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Aucun artiste n'est actuellement en vedette
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
