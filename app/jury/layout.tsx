'use client';

import { useJuryAuth } from '@/hooks/useJuryAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Music } from 'lucide-react';

export default function JuryLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, juryMember, logout } = useJuryAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8" />
              <div>
                <h1 className="font-bold text-lg">Fimu Voting</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenue, {juryMember?.member_name}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={logout}>
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
