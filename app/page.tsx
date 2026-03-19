'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PINLoginForm } from '@/components/auth/PINLoginForm';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';

export default function Home() {
  const [mode, setMode] = useState<'select' | 'jury' | 'admin'>('select');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {mode === 'select' && (
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl">Fimu Voting</CardTitle>
              <CardDescription className="mt-2">
                Système de vote interactif pour le festival
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Sélectionnez votre rôle pour continuer
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  onClick={() => setMode('jury')}
                  className="h-auto flex flex-col items-center justify-center py-6"
                >
                  <span className="text-2xl mb-2">🎵</span>
                  <span className="font-semibold">Jury</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMode('admin')}
                  className="h-auto flex flex-col items-center justify-center py-6"
                >
                  <span className="text-2xl mb-2">⚙️</span>
                  <span className="font-semibold">Admin</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {mode === 'jury' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setMode('select')}
              className="w-full justify-start"
            >
              ← Retour
            </Button>
            <PINLoginForm />
          </div>
        )}

        {mode === 'admin' && (
          <div className="space-y-4">
            <Button
              variant="ghost"
              onClick={() => setMode('select')}
              className="w-full justify-start"
            >
              ← Retour
            </Button>
            <AdminLoginForm />
          </div>
        )}
      </div>
    </main>
  );
}
