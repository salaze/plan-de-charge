
import React from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface DisplaySettingsProps {
  showWeekends: boolean;
  setShowWeekends: (value: boolean) => void;
  autoSave: boolean;
  setAutoSave: (value: boolean) => void;
}

export function DisplaySettings({ 
  showWeekends, 
  setShowWeekends, 
  autoSave, 
  setAutoSave 
}: DisplaySettingsProps) {
  return (
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
  );
}
