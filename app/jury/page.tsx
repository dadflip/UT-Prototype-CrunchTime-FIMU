'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function JuryDashboard() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCategories(data || []);

        // Fetch vote counts per category
        const { data: votes } = await supabase
          .from('votes')
          .select('category_id');

        const counts: Record<string, number> = {};
        (votes || []).forEach((vote) => {
          counts[vote.category_id] = (counts[vote.category_id] || 0) + 1;
        });
        setVoteCounts(counts);
      } catch (error) {
        console.error('[v0] Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();

    // Subscribe to real-time category changes
    const subscription = supabase
      .channel('categories_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, (payload) => {
        console.log('[v0] Categories changed:', payload);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Votez pour vos artistes préférés</h2>
        <p className="text-muted-foreground">
          Sélectionnez une catégorie et votez pour les artistes de votre choix
        </p>
      </div>

      {categories.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Aucune catégorie disponible pour le moment
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Link key={category.id} href={`/jury/category/${category.id}`}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105">
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                  <CardDescription>
                    {voteCounts[category.id] || 0} vote(s) enregistré(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">Voter</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
