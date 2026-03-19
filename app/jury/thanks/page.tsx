'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-3xl">Merci! 🎉</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg font-semibold">Votre vote a été enregistré</p>
          <p className="text-muted-foreground">
            Merci d'avoir participé à la sélection des artistes du Fimu
          </p>

          <div className="pt-4 space-y-3">
            <Link href="/jury" className="block">
              <Button className="w-full">Retour au vote</Button>
            </Link>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/api/auth/logout')}
            >
              Déconnexion
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
