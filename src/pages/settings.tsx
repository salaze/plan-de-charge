
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

export default function Settings() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Paramètres</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Paramètres de l'application</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Page de paramètres - Cette page sera développée prochainement.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
