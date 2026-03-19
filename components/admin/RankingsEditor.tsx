'use client';

import { useState } from 'react';
import { Ranking, Artist } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';

interface RankingsEditorProps {
  rankings: (Ranking & { artist?: Artist })[];
  availableArtists: Artist[];
  onUpdate: (rankings: Ranking[]) => Promise<void>;
  isLoading?: boolean;
}

export function RankingsEditor({
  rankings: initialRankings,
  availableArtists,
  onUpdate,
  isLoading = false,
}: RankingsEditorProps) {
  const [rankings, setRankings] = useState(initialRankings);
  const [selectedArtist, setSelectedArtist] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const handleAddArtist = async () => {
    if (!selectedArtist) return;

    const artist = availableArtists.find((a) => a.id === selectedArtist);
    if (!artist) return;

    // Check if already in rankings
    if (rankings.some((r) => r.artist_id === selectedArtist)) {
      alert('Cet artiste est déjà dans le top');
      return;
    }

    const newRanking: Ranking = {
      id: `new_${Date.now()}`,
      artist_id: selectedArtist,
      rank_position: rankings.length + 1,
      display_title: undefined,
      display_order: rankings.length + 1,
      is_locked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      updated_by: 'current_admin',
    };

    setRankings([...rankings, newRanking]);
    setSelectedArtist('');
  };

  const handleRemove = (index: number) => {
    setRankings(rankings.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;

    const newRankings = [...rankings];
    const dragged = newRankings[draggedIndex];
    newRankings.splice(draggedIndex, 1);
    newRankings.splice(index, 0, dragged);

    // Update positions
    newRankings.forEach((r, i) => {
      r.rank_position = i + 1;
      r.display_order = i + 1;
    });

    setRankings(newRankings);
    setDraggedIndex(null);
  };

  const handleTitleChange = (index: number, title: string) => {
    const newRankings = [...rankings];
    newRankings[index].display_title = title || undefined;
    setRankings(newRankings);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdate(rankings);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Artist Section */}
      <Card>
        <CardHeader>
          <CardTitle>Ajouter un artiste au top</CardTitle>
          <CardDescription>
            Sélectionnez un artiste pour l'ajouter au classement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <select
              value={selectedArtist}
              onChange={(e) => setSelectedArtist(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md"
            >
              <option value="">-- Sélectionner un artiste --</option>
              {availableArtists
                .filter((a) => !rankings.some((r) => r.artist_id === a.id))
                .map((artist) => (
                  <option key={artist.id} value={artist.id}>
                    {artist.name}
                  </option>
                ))}
            </select>
            <Button onClick={handleAddArtist} disabled={!selectedArtist}>
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Rankings List */}
      <Card>
        <CardHeader>
          <CardTitle>Classement des artistes ({rankings.length})</CardTitle>
          <CardDescription>Glissez-déposez pour réorganiser</CardDescription>
        </CardHeader>
        <CardContent>
          {rankings.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Aucun artiste dans le top. Ajoutez-en un pour commencer.
            </div>
          ) : (
            <div className="space-y-3">
              {rankings.map((ranking, index) => (
                <div
                  key={ranking.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(index)}
                  className="flex items-center gap-3 p-4 border rounded-lg bg-card hover:bg-muted/50 cursor-move transition-colors"
                >
                  {/* Position */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                  </div>

                  {/* Artist Info */}
                  <div className="flex-1">
                    <p className="font-semibold">
                      {ranking.artist?.name || 'Artiste inconnu'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ranking.artist?.description}
                    </p>
                  </div>

                  {/* Custom Title Input */}
                  <div className="flex-1">
                    <Input
                      placeholder="Titre personnalisé (optionnel)"
                      value={ranking.display_title || ''}
                      onChange={(e) => handleTitleChange(index, e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {rankings.length > 0 && (
        <Button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? 'Enregistrement...' : 'Enregistrer le classement'}
        </Button>
      )}
    </div>
  );
}
