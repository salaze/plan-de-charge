import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RefreshCw, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
export function SettingsTab() {
  const {
    settings,
    isLoading,
    error,
    updateSetting,
    reloadSettings
  } = useSettings();
  if (isLoading) {
    return <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Chargement des paramètres...</CardTitle>
          </CardHeader>
          <CardContent className="h-24 flex items-center justify-center">
            <RefreshCw className="h-5 w-5 animate-spin" />
          </CardContent>
        </Card>
      </div>;
  }
  if (error) {
    return <div className="grid gap-6">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
            <CardDescription>
              Impossible de récupérer les paramètres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={reloadSettings} className="mt-4" variant="outline">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  return <div className="grid gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <div>
            <CardTitle className="text-2xl">Paramètres généraux</CardTitle>
            <CardDescription>
              Configuration principale de l'application
            </CardDescription>
          </div>
          <SettingsIcon className="h-5 w-5 text-muted-foreground" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Thème</Label>
                <p className="text-sm text-muted-foreground">
                  Thème par défaut de l'application
                </p>
              </div>
              <Select value={settings.theme} onValueChange={value => updateSetting('theme', value)}>
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
            
            
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="autoSave">Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Activer la sauvegarde automatique des modifications
                </p>
              </div>
              <Switch id="autoSave" checked={settings.autoSave} onCheckedChange={checked => updateSetting('autoSave', checked)} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenanceMode" className="text-amber-500">Mode maintenance</Label>
                <p className="text-sm text-muted-foreground">
                  Activer le mode maintenance (lecture seule)
                </p>
              </div>
              <Switch id="maintenanceMode" checked={settings.maintenanceMode} onCheckedChange={checked => updateSetting('maintenanceMode', checked)} />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={reloadSettings} variant="outline" className="mr-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </CardFooter>
      </Card>
    </div>;
}