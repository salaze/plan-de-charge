
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Info, RefreshCw, Trash2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function SettingsTab() {
  const { 
    showWeekends, 
    setShowWeekends, 
    autoSave, 
    setAutoSave, 
    resetData, 
    clearData 
  } = useSettings();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Paramètres d'affichage</CardTitle>
          <CardDescription>
            Personnalisez l'apparence et le comportement de l'application
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

      <Card className="border-destructive/50">
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
  );
}
