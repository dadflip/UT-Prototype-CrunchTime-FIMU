'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Artist, Vote } from '@/types';

interface VotingCardProps {
  artist: Artist;
  onVote: (artistId: string, points: number) => Promise<void>;
  userVote?: Vote;
  isLoading?: boolean;
}

export function VotingCard({
  artist,
  onVote,
  userVote,
  isLoading = false,
}: VotingCardProps) {
  const [selectedPoints, setSelectedPoints] = useState<number | null>(
    userVote?.points || null
  );
  const [submitting, setSubmitting] = useState(false);

  const handleVote = async (points: number) => {
    setSubmitting(true);
    try {
      await onVote(artist.id, points);
      setSelectedPoints(points);
    } catch (error) {
      console.error('[v0] Vote error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{artist.name}</h3>
        {artist.description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {artist.description}
          </p>
        )}

        {/* Vote Buttons */}
        <div className="grid grid-cols-5 gap-2">
          {[1, 2, 3, 4, 5].map((points) => (
            <Button
              key={points}
              variant={selectedPoints === points ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleVote(points)}
              disabled={submitting || isLoading}
              className="font-semibold"
            >
              {points}
            </Button>
          ))}
        </div>

        {selectedPoints !== null && (
          <div className="mt-3 text-center text-sm text-muted-foreground">
            Votre vote: <span className="font-semibold">{selectedPoints}/5</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
