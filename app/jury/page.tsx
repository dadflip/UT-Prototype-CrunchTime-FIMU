'use client';

import { useEffect, useState } from 'react';
import { localDB } from '@/lib/local-storage';
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
        await localDB.init();
        
        const categoriesData = await localDB.getAll('categories');
        const activeCategories = (categoriesData as any[]).filter((c: any) => c.is_active);
        
        setCategories(activeCategories);

        // Fetch current voting session and its votes
        const sessions = await localDB.getAll('voting_sessions');
        const session = (sessions as any[]).find((s: any) => s.status === 'open');

        if (session) {
          const votesData = await localDB.getAll('votes');
          const sessionVotes = (votesData as any[]).filter((v: any) => 
            v.category_id && activeCategories.some((c: any) => c.id === v.category_id)
          );

          // Count votes per category
          const counts: Record<string, number> = {};
          sessionVotes.forEach((vote: any) => {
            if (vote.category_id) {
              counts[vote.category_id] = (counts[vote.category_id] || 0) + 1;
            }
          });

          setVoteCounts(counts);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
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
                    {voteCounts[category.id] || 0} artiste(s) voté(s)
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
