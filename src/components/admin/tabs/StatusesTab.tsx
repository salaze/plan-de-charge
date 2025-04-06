
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusManager } from '@/components/admin/StatusManager';
import { Status } from '@/types';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface StatusesTabProps {
  statuses: Status[];
  onStatusesChange: (statuses: Status[]) => void;
}

export function StatusesTab({ statuses, onStatusesChange }: StatusesTabProps) {
  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Gestion des statuts</CardTitle>
        <CardDescription>
          Gérez les différents statuts utilisés dans le planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              Les statuts sont utilisés pour définir les différents types d'activités dans le planning. 
              Vous pouvez ajouter, modifier ou supprimer des statuts selon vos besoins.
            </AlertDescription>
          </Alert>

          <StatusManager
            statuses={statuses}
            onStatusesChange={onStatusesChange}
          />
        </div>
      </CardContent>
    </Card>
  );
}
