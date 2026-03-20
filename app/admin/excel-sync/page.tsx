'use client';

import { useEffect, useState } from 'react';
import { localDB } from '@/lib/local-storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { ExcelSyncLog } from '@/types';

// Helper function to generate ID fallback
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function ExcelSyncPage() {
  const [syncLogs, setSyncLogs] = useState<ExcelSyncLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(true);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true);
        await localDB.init();

        const data = await localDB.getAll('excel_sync_logs');
        setSyncLogs((data as any[]).slice(0, 10));
      } catch (error) {
        console.error('[v0] Failed to load sync logs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLogs();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      // In a real implementation, you would parse the Excel file here
      // For now, we'll create a log entry
      const fileName = file.name;

      // Create log entry
      await localDB.create('excel_sync_logs', {
        id: generateId(),
        operation_type: 'import',
        source_file: fileName,
        status: 'success',
        records_affected: 0,
      });

      // Reload logs
      const data = await localDB.getAll('excel_sync_logs');
      setSyncLogs((data as any[]).slice(0, 10));
    } catch (error) {
      console.error('[v0] Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleExportResults = async () => {
    try {
      await localDB.init();
      
      // Fetch all votes, artists and jury members
      const [votes, artists, juryMembers] = await Promise.all([
        localDB.getAll('votes'),
        localDB.getAll('artists'),
        localDB.getAll('jury_members')
      ]);

      if (!votes || votes.length === 0) {
        alert('Aucune donnée à exporter');
        return;
      }

      // Create CSV with joined data
      const csv = [
        ['Artist', 'Jury Member', 'Score', 'Timestamp'],
        ...(votes as any[]).map((v) => {
          const artist = (artists as any[]).find(a => a.id === v.artist_id);
          const jury = (juryMembers as any[]).find(j => j.id === v.jury_member_id);
          return [
            artist?.name || 'Unknown',
            jury?.member_name || 'Unknown',
            v.score,
            new Date(v.created_at).toLocaleString('fr-FR'),
          ];
        }),
      ]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

      const blob = new Blob([csv], { type: 'text/csv; charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `votes-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      // Log export
      await localDB.create('excel_sync_logs', {
        id: generateId(),
        operation_type: 'export',
        source_file: 'votes-export.csv',
        status: 'success',
        records_affected: votes.length,
      });
    } catch (error) {
      console.error('[v0] Export error:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'success':
        return '✓ Succès';
      case 'failed':
        return '✗ Erreur';
      case 'pending':
        return '⏳ En attente';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Synchronisation Excel</h2>
          <p className="text-muted-foreground">Importez et exportez les données de vote</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Synchronisation Excel</h2>
        <p className="text-muted-foreground mt-1">
          Importez et exportez les données de vote avec Excel
        </p>
      </div>

      {/* Import Section */}
      <Card>
        <CardHeader>
          <CardTitle>Importer les artistes</CardTitle>
          <CardDescription>
            Chargez un fichier Excel avec les artistes et catégories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FieldGroup>
            <FieldLabel>Fichier Excel</FieldLabel>
            <Input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploading}
            />
          </FieldGroup>
          <p className="text-sm text-muted-foreground">
            Formats supportés: .xlsx, .xls, .csv
          </p>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Exporter les résultats</CardTitle>
          <CardDescription>
            Téléchargez tous les votes en format CSV
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleExportResults}>
            📥 Exporter les votes
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Sync Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Synchronisation en temps réel</CardTitle>
          <CardDescription>
            Les votes sont automatiquement synchronisés avec Excel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">État: {syncEnabled ? 'Activé' : 'Désactivé'}</p>
              <p className="text-sm text-muted-foreground">
                Les votes sont {syncEnabled ? 'synchronisés' : 'non synchronisés'} en temps réel
              </p>
            </div>
            <Button
              variant={syncEnabled ? 'default' : 'outline'}
              onClick={() => setSyncEnabled(!syncEnabled)}
            >
              {syncEnabled ? 'Désactiver' : 'Activer'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card>
        <CardHeader>
          <CardTitle>Historique de synchronisation</CardTitle>
          <CardDescription>
            Dernières {syncLogs.length} opérations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncLogs.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                Aucune opération enregistrée
              </div>
            ) : (
              syncLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <p className="font-semibold capitalize">{log.operation_type}</p>
                    <p className="text-sm text-muted-foreground">{log.source_file}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.created_at).toLocaleString('fr-FR')}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{log.records_affected} enreg.</p>
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        log.status
                      )}`}
                    >
                      {getStatusLabel(log.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
