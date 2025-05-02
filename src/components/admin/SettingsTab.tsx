
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Database, Server, Sliders } from 'lucide-react';

export function SettingsTab() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoBackup, setAutoBackup] = useState(true);
  const [theme, setTheme] = useState('system');
  const [maxEmployees, setMaxEmployees] = useState('50');
  
  const handleSaveGeneralSettings = () => {
    toast.success('Paramètres généraux enregistrés');
  };
  
  const handleSavePerformanceSettings = () => {
    toast.success('Paramètres de performance enregistrés');
  };
  
  const handleMaintenanceModeToggle = () => {
    const newValue = !maintenanceMode;
    setMaintenanceMode(newValue);
    
    if (newValue) {
      toast.warning('Mode maintenance activé - L\'application sera en lecture seule');
    } else {
      toast.success('Mode maintenance désactivé');
    }
  };
  
  const handleBackupNow = () => {
    toast.loading('Sauvegarde en cours...', { duration: 2000 });
    setTimeout(() => {
      toast.success('Sauvegarde effectuée avec succès');
    }, 2000);
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-2xl">Paramètres généraux</CardTitle>
            <CardDescription>
              Configuration principale de l'application
            </CardDescription>
          </div>
          <Sliders className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Thème par défaut</Label>
                <p className="text-sm text-muted-foreground">
                  Thème affiché aux utilisateurs par défaut
                </p>
              </div>
              <Select 
                value={theme}
                onValueChange={setTheme}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Clair</SelectItem>
                  <SelectItem value="dark">Sombre</SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Activer les notifications système
                </p>
              </div>
              <Switch 
                id="notifications" 
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="max-employees">Nombre maximum d'employés</Label>
                <p className="text-sm text-muted-foreground">
                  Limite du nombre d'employés affichables
                </p>
              </div>
              <Input 
                id="max-employees"
                className="w-[180px]" 
                type="number"
                value={maxEmployees}
                onChange={(e) => setMaxEmployees(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveGeneralSettings}>Enregistrer les modifications</Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-2xl">Base de données</CardTitle>
            <CardDescription>
              Gestion des données et sauvegardes
            </CardDescription>
          </div>
          <Database className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">
                Sauvegarder automatiquement les données chaque jour
              </p>
            </div>
            <Switch 
              id="auto-backup" 
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={handleBackupNow}>
              Sauvegarder maintenant
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card className="border-amber-500/30">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-2xl text-amber-600">Mode maintenance</CardTitle>
            <CardDescription>
              Restreindre l'accès pendant les mises à jour
            </CardDescription>
          </div>
          <Server className="h-5 w-5 text-amber-500" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Activer le mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                L'application sera en lecture seule pour tous les utilisateurs sauf les administrateurs
              </p>
            </div>
            <Switch 
              id="maintenance-mode" 
              checked={maintenanceMode}
              onCheckedChange={handleMaintenanceModeToggle}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
