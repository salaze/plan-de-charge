
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusManager } from '@/components/admin/StatusManager';

interface StatusesTabProps {
  statuses: any[];
  onStatusesChange: (statuses: any[]) => void;
}

export function StatusesTab({ statuses, onStatusesChange }: StatusesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gestion des statuts</CardTitle>
        <CardDescription>
          Ajouter, modifier ou supprimer des statuts et leur code associé
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StatusManager
          statuses={statuses}
          onStatusesChange={onStatusesChange}
        />
      </CardContent>
    </Card>
  );
}
