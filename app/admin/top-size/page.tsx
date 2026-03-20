'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, Settings } from 'lucide-react';
import { Category, Artist } from '@/types';
import { localDB } from '@/lib/local-storage';

export default function TopSizeManager() {
  const [categories, setCategories] = useState<(Category & { artists_count?: number })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const categoriesData = await localDB.getAll('categories') as Category[];
      const artistsData = await localDB.getAll('artists') as Artist[];
      
      // Compter le nombre d'artistes par catégorie
      const categoriesWithCounts = categoriesData.map((category: Category) => ({
        ...category,
        artists_count: artistsData.filter((artist: any) => artist.category_id === category.id).length,
        top_size: category.top_size || 5 // Valeur par défaut
      }));
      
      // Trier par order_index
      categoriesWithCounts.sort((a, b) => a.order_index - b.order_index);
      setCategories(categoriesWithCounts);
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des catégories' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTopSizeChange = (categoryId: string, newSize: string) => {
    const size = parseInt(newSize) || 5;
    setCategories(prev => 
      prev.map(cat => 
        cat.id === categoryId ? { ...cat, top_size: size } : cat
      )
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      // Mettre à jour chaque catégorie avec sa nouvelle taille de top
      for (const category of categories) {
        const updatedCategory = {
          id: category.id,
          name: category.name,
          description: category.description,
          order_index: category.order_index,
          is_active: category.is_active,
          top_size: category.top_size
        };
        await localDB.update('categories', updatedCategory);
      }
      
      setMessage({ type: 'success', text: 'Tailles des tops sauvegardées avec succès' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des catégories...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configuration des Tops</h1>
      </div>
      
      <p className="text-muted-foreground">
        Définissez le nombre d'artistes à sélectionner dans le top pour chaque catégorie.
      </p>

      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              <CardDescription>
                {category.artists_count || 0} artist{category.artists_count !== 1 ? 's' : ''} disponible{category.artists_count !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor={`top-size-${category.id}`}>
                  Taille du top
                </Label>
                <Input
                  id={`top-size-${category.id}`}
                  type="number"
                  min="1"
                  max={category.artists_count || 50}
                  value={category.top_size}
                  onChange={(e) => handleTopSizeChange(category.id, e.target.value)}
                  className="w-24"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: {category.artists_count || 0} artist{category.artists_count !== 1 ? 's' : ''}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
