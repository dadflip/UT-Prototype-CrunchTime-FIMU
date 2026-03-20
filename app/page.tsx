'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PINLoginForm } from '@/components/auth/PINLoginForm';
import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { FIMULogo } from '@/components/brand/FIMULogo';
import { Music, Settings, Database } from 'lucide-react';

export default function Home() {
  const [mode, setMode] = useState<'select' | 'jury' | 'admin'>('select');

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <div className="w-full max-w-md">
        {mode === 'select' && (
          <Card>
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-3xl text-primary">FIMU Voting</CardTitle>
              <CardDescription className="mt-2">
                Système de vote interactif pour le Festival International de Musique Universitaire
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Sélectionnez votre rôle pour continuer
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => setMode('jury')}
                  className="h-auto flex flex-col items-center justify-center py-6 bg-[#FEEB85] hover:bg-[#FEEB85]/90 text-white"
                >
                  <Music className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Jury</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setMode('admin')}
                  className="h-auto flex flex-col items-center justify-center py-6 border-2 border-[#A21825] hover:bg-[#A21825]/10 text-white"
                >
                  <Settings className="h-8 w-8 mb-2" />
                  <span className="font-semibold">Admin</span>
                </Button>
              </div>
              
              <div className="pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => window.location.href = '/setup-db'}
                  className="w-full text-xs text-muted-foreground"
                >
                  <Database className="h-4 w-4 mr-2" />
                  Configuration de la base de données
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
