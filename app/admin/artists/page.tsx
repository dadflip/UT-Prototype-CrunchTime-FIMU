'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
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

        // Fetch categories
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        setCategories(categoriesData || []);

        // Fetch artists
        const { data: artistsData } = await supabase
          .from('artists')
          .select('*, category:categories(name)')
          .order('performance_order', { ascending: true });

        setArtists(artistsData || []);
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
      const { error } = await supabase.from('artists').insert([
        {
          name: formData.name,
          description: formData.description || null,
          category_id: formData.categoryId,
          performance_order: artists.length + 1,
          is_visible: true,
        },
      ]);

      if (error) throw error;

      setFormData({ name: '', description: '', categoryId: '' });
      setShowForm(false);

      // Refresh artists
      const { data: artistsData } = await supabase
        .from('artists')
        .select('*')
        .order('performance_order', { ascending: true });

      setArtists(artistsData || []);
    } catch (error) {
      console.error('[v0] Failed to add artist:', error);
    }
  };

  const toggleArtistVisibility = async (artistId: string, isVisible: boolean) => {
    try {
      const { error } = await supabase
        .from('artists')
        .update({ is_visible: !isVisible })
        .eq('id', artistId);

      if (error) throw error;

      setArtists((prev) =>
        prev.map((a) =>
          a.id === artistId ? { ...a, is_visible: !isVisible } : a
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
                    <td className="py-3 px-4">{artist.performance_order}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          artist.is_visible
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {artist.is_visible ? '✓ Visible' : '✗ Caché'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          toggleArtistVisibility(artist.id, artist.is_visible)
                        }
                      >
                        {artist.is_visible ? 'Cacher' : 'Afficher'}
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
