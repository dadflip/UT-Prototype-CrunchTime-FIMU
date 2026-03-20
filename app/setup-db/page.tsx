'use client';

import { DatabaseManager } from '@/components/database-manager';

export default function SetupDatabasePage() {
  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Configuration de la base de données</h1>
        <p className="text-muted-foreground mb-8">
          Configurez la base de données locale pour le système de vote Fimu.
        </p>
        
        <DatabaseManager />
      </div>
    </div>
  );
}
