'use client';

import { useEffect, useState } from 'react';
import { localDB } from '@/lib/local-storage';
import { Category } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useJuryAuth } from '@/hooks/useJuryAuth';
import { Heart, BarChart3, ArrowRight } from 'lucide-react';

export default function JuryDashboard() {
  const { juryMember } = useJuryAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
  const [favoritesCount, setFavoritesCount] = useState<Record<string, number>>({});

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

        // Récupérer les favoris du juré
        if (juryMember) {
          const favorites = await localDB.findBy('jury_favorites', 'jury_member_id', juryMember.id);
          const favCounts: Record<string, number> = {};
          (favorites as any[]).forEach((fav: any) => {
            if (fav.category_id) {
              favCounts[fav.category_id] = (favCounts[fav.category_id] || 0) + 1;
            }
          });
          setFavoritesCount(favCounts);
        }
      } catch (error) {
        console.error('[v0] Failed to fetch categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [juryMember]);

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
        <h2 className="text-3xl font-bold tracking-tight mb-2">Tableau de bord du jury</h2>
        <p className="text-muted-foreground">
          Sélectionnez vos coups de cœur puis classez-les pour déterminer les meilleurs artistes
        </p>
      </div>

      {/* Actions principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/jury/favorites">
          <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <CardTitle>Mes coups de cœur</CardTitle>
              </div>
              <CardDescription>
                Sélectionnez vos artistes préférés pour chaque catégorie
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                <Heart className="h-4 w-4 mr-2" />
                Sélectionner
              </Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/thanks">
          <Card className="h-full cursor-pointer transition-all hover:shadow-lg hover:scale-105">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <CardTitle>Résultats</CardTitle>
              </div>
              <CardDescription>
                Consultez les résultats actuels du vote
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <BarChart3 className="h-4 w-4 mr-2" />
                Voir les résultats
              </Button>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Catégories */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Catégories disponibles</h3>
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
            {categories.map((category) => {
              const topSize = category.top_size || 5;
              const favCount = favoritesCount[category.id] || 0;
              const canRank = favCount >= topSize;
              
              return (
                <Card key={category.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{category.name}</CardTitle>
                      <div className="flex gap-2">
                        <Badge variant={canRank ? "default" : "secondary"}>
                          <Heart className="h-3 w-3 mr-1" />
                          {favCount}/{topSize}
                        </Badge>
                        {voteCounts[category.id] && (
                          <Badge variant="outline">
                            {voteCounts[category.id]} votes
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardDescription>
                      Top {topSize} artist{topSize > 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Link href={`/jury/category/${category.id}`}>
                        <Button variant="outline" className="w-full">
                          Vote traditionnel
                        </Button>
                      </Link>
                      {canRank && (
                        <Link href={`/jury/ranking/${category.id}`}>
                          <Button className="w-full">
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Classer mes favoris
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
