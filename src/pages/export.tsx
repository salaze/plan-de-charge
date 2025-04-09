
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';

export default function Export() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Exports</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Exports des données</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Page d'export de données - Cette page sera développée prochainement.</p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
