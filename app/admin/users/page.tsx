'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { JuryMember } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, FieldLabel } from '@/components/ui/field';
import { Skeleton } from '@/components/ui/skeleton';
import { generateRandomPIN, hashPIN } from '@/lib/auth-utils';

export default function UsersPage() {
  const [juryMembers, setJuryMembers] = useState<JuryMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    generatePin: true,
    customPin: '',
  });
  const [generatedPin, setGeneratedPin] = useState('');

  useEffect(() => {
    const loadJuryMembers = async () => {
      try {
        setLoading(true);

        const { data } = await supabase
          .from('jury_members')
          .select('*')
          .order('created_at', { ascending: false });

        setJuryMembers(data || []);
      } catch (error) {
        console.error('[v0] Failed to load jury members:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJuryMembers();
  }, []);

  const handleGeneratePin = () => {
    const pin = generateRandomPIN(6);
    setGeneratedPin(pin);
    setFormData((prev) => ({ ...prev, customPin: '' }));
  };

  const handleAddJury = async (e: React.FormEvent) => {
    e.preventDefault();

    const pin = formData.generatePin && generatedPin ? generatedPin : formData.customPin;
    if (!pin) {
      alert('Veuillez générer ou entrer un PIN');
      return;
    }

    try {
      const pinHash = hashPIN(pin);

      const { error } = await supabase.from('jury_members').insert([
        {
          name: formData.name,
          access_pin: pinHash,
          is_active: true,
        },
      ]);

      if (error) throw error;

      // Reload
      const { data } = await supabase
        .from('jury_members')
        .select('*')
        .order('created_at', { ascending: false });

      setJuryMembers(data || []);

      // Reset form
      setFormData({ name: '', generatePin: true, customPin: '' });
      setGeneratedPin('');
      setShowForm(false);

      alert(`Juré ajouté avec le PIN: ${pin}`);
    } catch (error) {
      console.error('[v0] Failed to add jury member:', error);
      alert('Erreur lors de l\'ajout du juré');
    }
  };

  const toggleJuryStatus = async (juryId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('jury_members')
        .update({ is_active: !isActive })
        .eq('id', juryId);

      if (error) throw error;

      setJuryMembers((prev) =>
        prev.map((j) =>
          j.id === juryId ? { ...j, is_active: !isActive } : j
        )
      );
    } catch (error) {
      console.error('[v0] Failed to update jury member:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground">Gérez les jurés et les administrateurs</p>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion des utilisateurs</h2>
          <p className="text-muted-foreground mt-1">
            {juryMembers.length} juré(s) enregistré(s)
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Annuler' : '+ Ajouter un juré'}
        </Button>
      </div>

      {/* Add Jury Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouvel juré</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddJury} className="space-y-4">
              <FieldGroup>
                <FieldLabel>Nom du juré</FieldLabel>
                <Input
                  placeholder="Ex: Jean Dupont"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  required
                />
              </FieldGroup>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={formData.generatePin}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          generatePin: true,
                          customPin: '',
                        }))
                      }
                    />
                    <span>Générer un PIN aléatoire</span>
                  </label>
                </div>

                {formData.generatePin && (
                  <div className="flex gap-2">
                    <Input
                      value={generatedPin}
                      readOnly
                      placeholder="Le PIN généré apparaîtra ici"
                      className="font-mono"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGeneratePin}
                    >
                      Générer
                    </Button>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={!formData.generatePin}
                      onChange={() =>
                        setFormData((prev) => ({
                          ...prev,
                          generatePin: false,
                        }))
                      }
                    />
                    <span>Entrer un PIN personnalisé</span>
                  </label>
                </div>

                {!formData.generatePin && (
                  <Input
                    type="password"
                    inputMode="numeric"
                    placeholder="Ex: 1234"
                    value={formData.customPin}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        customPin: e.target.value.replace(/\D/g, ''),
                      }))
                    }
                    maxLength={8}
                  />
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={!formData.name || !(generatedPin || formData.customPin)}
                >
                  Ajouter le juré
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Jury Members Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des jurés</CardTitle>
          <CardDescription>Gérez les jurés et leurs accès</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4">Nom</th>
                  <th className="text-left py-3 px-4">Statut</th>
                  <th className="text-left py-3 px-4">Dernière connexion</th>
                  <th className="text-right py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {juryMembers.map((jury) => (
                  <tr key={jury.id} className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-semibold">{jury.name}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          jury.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {jury.is_active ? '✓ Actif' : '✗ Inactif'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground text-xs">
                      {jury.last_login
                        ? new Date(jury.last_login).toLocaleString('fr-FR')
                        : 'Jamais'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleJuryStatus(jury.id, jury.is_active)}
                      >
                        {jury.is_active ? 'Désactiver' : 'Activer'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {juryMembers.length === 0 && (
            <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
              Aucun juré enregistré. Ajoutez-en un pour commencer.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
