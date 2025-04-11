
import React from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Info, Trash2, RefreshCw } from 'lucide-react';
import { createSampleData } from '@/utils';

export function DangerZone() {
  const resetData = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser toutes les données ? Cette action est irréversible.')) {
      const sampleData = createSampleData();
      localStorage.setItem('planningData', JSON.stringify(sampleData));
      toast.success('Données réinitialisées avec succès');
    }
  };
  
  const clearData = () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer toutes les données ? Cette action est irréversible.')) {
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
  );
}
