'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Category, Artist, Vote } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

interface ArtistVotes {
  artist: Artist;
  totalVotes: number;
  totalPoints: number;
  averageScore: number;
}

export default function ResultsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [artistVotes, setArtistVotes] = useState<ArtistVotes[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);

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

        if (categoriesData && categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }
      } catch (error) {
        console.error('[v0] Failed to load categories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedCategory) return;

    const loadResults = async () => {
      try {
        // Fetch all votes for this category
        const { data: votesData } = await supabase
          .from('votes')
          .select('*')
          .eq('category_id', selectedCategory);

        setTotalVotes(votesData?.length || 0);

        // Fetch artists in this category
        const { data: artistsData } = await supabase
          .from('artists')
          .select('*')
          .eq('category_id', selectedCategory);

        if (!artistsData) return;

        // Calculate votes per artist
        const artistVotesMap: Record<string, ArtistVotes> = {};

        artistsData.forEach((artist) => {
          artistVotesMap[artist.id] = {
            artist,
            totalVotes: 0,
            totalPoints: 0,
            averageScore: 0,
          };
        });

        (votesData || []).forEach((vote) => {
          if (artistVotesMap[vote.artist_id]) {
            artistVotesMap[vote.artist_id].totalVotes += 1;
            artistVotesMap[vote.artist_id].totalPoints += vote.points;
          }
        });

        // Calculate averages and sort
        const results = Object.values(artistVotesMap)
          .map((av) => ({
            ...av,
            averageScore:
              av.totalVotes > 0 ? Number((av.totalPoints / av.totalVotes).toFixed(2)) : 0,
          }))
          .sort((a, b) => b.averageScore - a.averageScore);

        setArtistVotes(results);
      } catch (error) {
        console.error('[v0] Failed to load results:', error);
      }
    };

    loadResults();
  }, [selectedCategory]);

  const categoryName = categories.find((c) => c.id === selectedCategory)?.name || '';

  const handleExport = async () => {
    try {
      const csv = [
        ['Artiste', 'Votes', 'Points totaux', 'Score moyen'],
        ...artistVotes.map((av) => [
          av.artist.name,
          av.totalVotes,
          av.totalPoints,
          av.averageScore,
        ]),
      ]
        .map((row) => row.join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resultats-${categoryName}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[v0] Export error:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Résultats des votes</h2>
          <p className="text-muted-foreground">Analysez les votes par catégorie</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Résultats des votes</h2>
          <p className="text-muted-foreground mt-1">
            {totalVotes} vote(s) enregistré(s)
          </p>
        </div>
        <Button onClick={handleExport}>
          📥 Exporter CSV
        </Button>
      </div>

      {/* Category Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Sélectionner une catégorie</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Classement - {categoryName}</CardTitle>
          <CardDescription>
            {artistVotes.length} artiste(s) avec {totalVotes} vote(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Rang</th>
                  <th className="text-left py-3 px-4">Artiste</th>
                  <th className="text-right py-3 px-4">Votes</th>
                  <th className="text-right py-3 px-4">Points totaux</th>
                  <th className="text-right py-3 px-4">Score moyen</th>
                </tr>
              </thead>
              <tbody>
                {artistVotes.map((av, index) => (
                  <tr key={av.artist.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold">{av.artist.name}</p>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">{av.totalVotes}</td>
                    <td className="py-3 px-4 text-right">{av.totalPoints}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1">
                        ⭐ {av.averageScore}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {artistVotes.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Aucun vote enregistré pour cette catégorie
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
