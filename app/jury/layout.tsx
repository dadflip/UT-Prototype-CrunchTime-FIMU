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
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Music className="h-6 w-6 sm:h-8 sm:w-8" />
              <div>
                <h1 className="font-bold text-base sm:text-lg">Fimu Voting</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  Bienvenue, {juryMember?.member_name}
                </p>
                <p className="text-xs text-muted-foreground sm:hidden">
                  {juryMember?.member_name}
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={logout} className="hidden sm:inline-flex">
              Déconnexion
            </Button>
            <Button variant="outline" size="sm" onClick={logout} className="sm:hidden px-2">
              Déco
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {children}
      </main>
    </div>
  );
}
