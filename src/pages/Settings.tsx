
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SettingsTab } from '@/components/admin/SettingsTab';

const Settings = () => {
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Paramètres</h1>
        
        <Card className="glass-panel animate-scale-in">
          <CardHeader>
            <CardTitle>Paramètres d'application</CardTitle>
            <CardDescription>
              Gérez les paramètres globaux de l'application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SettingsTab />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
