
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SettingsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres généraux</CardTitle>
        <CardDescription>
          Configuration de l'application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Options de configuration et paramètres avancés.
        </p>
      </CardContent>
    </Card>
  );
}
