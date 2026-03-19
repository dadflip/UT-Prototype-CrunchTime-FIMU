'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Stats {
  totalArtists: number;
  totalCategories: number;
  totalJuryMembers: number;
  totalVotes: number;
  votingSessionOpen: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [artists, categories, jury, votes, sessions] = await Promise.all([
          supabase.from('artists').select('id', { count: 'exact', head: true }),
          supabase.from('categories').select('id', { count: 'exact', head: true }),
          supabase.from('jury_members').select('id', { count: 'exact', head: true }),
          supabase.from('votes').select('id', { count: 'exact', head: true }),
          supabase.from('voting_sessions').select('is_open').order('created_at', { ascending: false }).limit(1),
        ]);

        const votingOpen = sessions.data?.[0]?.is_open || false;

        setStats({
          totalArtists: artists.count || 0,
          totalCategories: categories.count || 0,
          totalJuryMembers: jury.count || 0,
          totalVotes: votes.count || 0,
          votingSessionOpen: votingOpen,
        });
      } catch (error) {
        console.error('[v0] Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Aperçu général du système de vote</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Aperçu général du système de vote</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Artistes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalArtists || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Total enregistrés</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Catégories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalCategories || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Total disponibles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Jurés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalJuryMembers || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Membres actifs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Votes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalVotes || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Enregistrés</p>
          </CardContent>
        </Card>
      </div>

      {/* Voting Status */}
      <Card>
        <CardHeader>
          <CardTitle>Statut du vote</CardTitle>
          <CardDescription>État actuel de la session de vote</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className={`h-4 w-4 rounded-full ${
                stats?.votingSessionOpen ? 'bg-green-500' : 'bg-red-500'
              }`}
            ></div>
            <span className="font-semibold">
              {stats?.votingSessionOpen ? 'Vote ouvert' : 'Vote fermé'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
