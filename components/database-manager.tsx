'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { initializeDatabase, resetDatabase, checkDatabaseStatus } from '@/lib/init-data';

interface DatabaseStatus {
  initialized: boolean;
  adminExists: boolean;
  categoriesCount: number;
}

export function DatabaseManager() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      setIsLoading(true);
      const dbStatus = await checkDatabaseStatus();
      setStatus(dbStatus);
    } catch (error) {
      console.error('Error checking database status:', error);
      setMessage('Erreur lors de la vérification du statut de la base de données');
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitialize = async () => {
    try {
      setIsInitializing(true);
      setMessage('Initialisation en cours...');
      setMessageType('info');
      
      await initializeDatabase();
      
      setMessage('Base de données initialisée avec succès !');
      setMessageType('success');
      await checkStatus();
    } catch (error) {
      console.error('Error initializing database:', error);
      setMessage('Erreur lors de l\'initialisation de la base de données');
      setMessageType('error');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleReset = async () => {
    if (!confirm('Êtes-vous sûr de vouloir réinitialiser la base de données ? Toutes les données seront perdues.')) {
      return;
    }

    try {
      setIsResetting(true);
      setMessage('Réinitialisation en cours...');
      setMessageType('info');
      
      await resetDatabase();
      
      setMessage('Base de données réinitialisée avec succès !');
      setMessageType('success');
      await checkStatus();
    } catch (error) {
      console.error('Error resetting database:', error);
      setMessage('Erreur lors de la réinitialisation de la base de données');
      setMessageType('error');
    } finally {
      setIsResetting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Vérification de la base de données...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {message && (
        <Alert variant={messageType === 'error' ? 'destructive' : 'default'}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statut de la base de données
          </CardTitle>
          <CardDescription>
            Gérez la base de données locale du système de vote
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {status?.initialized ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-700">Base de données initialisée</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                <span className="text-yellow-700">Base de données non initialisée</span>
              </>
            )}
          </div>

          {status && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Admin:</span> {status.adminExists ? 'OK' : 'N/A'}
              </div>
              <div>
                <span className="font-medium">Catégories:</span> {status.categoriesCount}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {!status?.initialized && (
              <Button 
                onClick={handleInitialize} 
                disabled={isInitializing}
                className="flex items-center gap-2"
              >
                {isInitializing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Initialiser la base de données
              </Button>
            )}
            
            <Button 
              onClick={handleReset} 
              disabled={isResetting || !status?.initialized}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isResetting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Réinitialiser
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Identifiants par défaut après initialisation :</p>
            <p>• Admin: admin@fimu.local / admin123</p>
            <p>• Jurés: PIN = 1234</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
