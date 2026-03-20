'use client';

import { useEffect, useState } from 'react';
import { localDB } from '@/lib/local-storage';
import { Artist, Category } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';

// Helper function to generate ID fallback
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        await localDB.init();

        // Fetch categories and artists
        const [categoriesData, artistsData] = await Promise.all([
          localDB.getAll('categories'),
          localDB.getAll('artists')
        ]);

        setCategories(categoriesData as Category[]);
        setArtists(artistsData as Artist[]);
      } catch (error) {
        console.error('[v0] Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await localDB.init();
      
      await localDB.create('artists', {
        id: generateId(),
        name: formData.name,
        category_id: formData.categoryId,
        artist_number: artists.length + 1,
        is_active: true,
      });

      setFormData({ name: '', description: '', categoryId: '' });
      setShowForm(false);

      // Refresh artists
      const artistsData = await localDB.getAll('artists');
      setArtists(artistsData as Artist[]);
    } catch (error) {
      console.error('[v0] Failed to add artist:', error);
    }
  };

  const toggleArtistVisibility = async (artistId: string, isVisible: boolean) => {
    try {
      await localDB.init();
      await localDB.update('artists', { id: artistId, is_active: !isVisible });

      setArtists((prev) =>
        prev.map((a) =>
          a.id === artistId ? { ...a, is_active: !isVisible } : a
        )
      );
    } catch (error) {
      console.error('[v0] Failed to update artist:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Gestion des artistes</h2>
          <p className="text-muted-foreground">Ajouter, modifier ou gérer les artistes</p>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des artistes</h2>
          <p className="text-muted-foreground mt-1">
            {artists.length} artiste(s) enregistré(s)
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Ajouter un artiste'}
        </Button>
      </div>

      {/* Add Artist Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouvel artiste</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddArtist} className="space-y-4">
              <FieldGroup>
                <FieldLabel>Nom de l'artiste</FieldLabel>
                <Input
                  placeholder="Ex: The Beatles"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Description (optionnel)</FieldLabel>
                <Input
                  placeholder="Ex: Groupe de rock légendaire"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                />
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Catégorie</FieldLabel>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, categoryId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.name || !formData.categoryId}
                >
                  Ajouter
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Artists Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des artistes</CardTitle>
          <CardDescription>Gérez la visibilité et l'ordre des artistes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Artiste</th>
                  <th className="text-left py-3 px-4">Catégorie</th>
                  <th className="text-left py-3 px-4">Ordre</th>
                  <th className="text-left py-3 px-4">Visibilité</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {artists.map((artist) => (
                  <tr key={artist.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold">{artist.name}</p>
                        {artist.description && (
                          <p className="text-xs text-muted-foreground">{artist.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {/* Category name would come from the joined data */}
                    </td>
                    <td className="py-3 px-4">{artist.artist_number}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          artist.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {artist.is_active ? '✓ Visible' : '✗ Caché'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleArtistVisibility(artist.id, artist.is_active)
                        }
                      >
                        {artist.is_active ? 'Cacher' : 'Afficher'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
