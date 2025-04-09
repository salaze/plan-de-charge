
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Info, Trash2, RefreshCw } from 'lucide-react';
import { createSampleData } from '@/utils';

const Settings = () => {
  const [showWeekends, setShowWeekends] = useState<boolean>(() => {
    // Récupérer la valeur depuis localStorage ou utiliser true par défaut
    const saved = localStorage.getItem('showWeekends');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  const [autoSave, setAutoSave] = useState<boolean>(() => {
    // Récupérer la valeur depuis localStorage ou utiliser true par défaut
    const saved = localStorage.getItem('autoSave');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  // Sauvegarder les paramètres lors des changements
  useEffect(() => {
    localStorage.setItem('showWeekends', JSON.stringify(showWeekends));
    toast.success('Paramètre "Afficher les weekends" mis à jour');
  }, [showWeekends]);
  
  useEffect(() => {
    localStorage.setItem('autoSave', JSON.stringify(autoSave));
    toast.success('Paramètre "Sauvegarde automatique" mis à jour');
  }, [autoSave]);
  
  const resetData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      const sampleData = createSampleData();
      localStorage.setItem('planningData', JSON.stringify(sampleData));
      toast.success('Données réinitialisées avec succès');
    }
  };
  
  const clearData = () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
      const emptyData = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        employees: [],
        projects: [
          { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
          { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
          { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
          { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
          { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
        ]
      };
      localStorage.setItem('planningData', JSON.stringify(emptyData));
      toast.success('Données supprimées avec succès');
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
        
        <Card className="glass-panel animate-scale-in">
          <CardHeader>
            <CardTitle>Paramètres d'affichage</CardTitle>
            <CardDescription>
              Personnalisez l'apparence et le comportement de l'application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekend-display">Afficher les weekends</Label>
                <p className="text-sm text-muted-foreground">
                  Afficher ou masquer les jours de weekend dans le planning
                </p>
              </div>
              <Switch 
                id="weekend-display" 
                checked={showWeekends} 
                onCheckedChange={setShowWeekends}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-save">Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarder automatiquement les modifications
                </p>
              </div>
              <Switch 
                id="auto-save" 
                checked={autoSave} 
                onCheckedChange={setAutoSave}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card className="glass-panel border-destructive/50 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-destructive">Zone de danger</CardTitle>
            <CardDescription>
              Ces actions sont irréversibles, procédez avec précaution.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-md bg-muted flex items-start gap-2">
              <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
              <p className="text-sm text-muted-foreground">
                La réinitialisation ou la suppression des données effacera toutes les informations 
                enregistrées dans l'application. Assurez-vous d'avoir effectué une sauvegarde si nécessaire.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={resetData}
              >
                <RefreshCw className="h-4 w-4" />
                Réinitialiser avec des données de test
              </Button>
              
              <Button 
                variant="destructive" 
                className="flex items-center gap-2"
                onClick={clearData}
              >
                <Trash2 className="h-4 w-4" />
                Supprimer toutes les données
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
