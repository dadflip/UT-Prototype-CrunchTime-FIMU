'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { authenticateJuryByPIN, setJurySession } from '@/lib/local-auth';

interface PINLoginFormProps {
  onSuccess?: () => void;
}

export function PINLoginForm({ onSuccess }: PINLoginFormProps) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const juryMember = await authenticateJuryByPIN(pin);

      if (juryMember) {
        console.log('[v0] Jury login successful');
        setJurySession(juryMember);
        if (onSuccess) onSuccess();
        router.push('/jury');
      } else {
        setError('PIN invalide.');
      }
    } catch (err) {
      console.error('[v0] Login error:', err);
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Accès Jury</CardTitle>
        <CardDescription>Entrez votre code PIN pour voter</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <FieldLabel>Code PIN</FieldLabel>
            <Input
              type="password"
              inputMode="numeric"
              placeholder="1234"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              maxLength={8}
              disabled={loading}
              required
              autoFocus
            />
          </FieldGroup>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!pin || loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
