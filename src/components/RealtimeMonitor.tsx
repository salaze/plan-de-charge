
import React from 'react';
import { 
  useRealtimeEmployees, 
  useRealtimeStatuses,
  useRealtimeEmployeeSchedule 
} from '@/hooks/useRealtimeUpdates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function RealtimeMonitor() {
  const employeeUpdates = useRealtimeEmployees();
  const statusUpdates = useRealtimeStatuses();
  const scheduleUpdates = useRealtimeEmployeeSchedule();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Mises à jour en temps réel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Employés */}
            <div>
              <h3 className="font-semibold mb-2">Nouveaux Employés</h3>
              {employeeUpdates.length === 0 ? (
                <p className="text-muted-foreground">Aucune mise à jour</p>
              ) : (
                employeeUpdates.map(employee => (
                  <Badge 
                    key={employee.id} 
                    variant="secondary" 
                    className="m-1"
                  >
                    {employee.name}
                  </Badge>
                ))
              )}
            </div>

            {/* Statuts */}
            <div>
              <h3 className="font-semibold mb-2">Nouveaux Statuts</h3>
              {statusUpdates.length === 0 ? (
                <p className="text-muted-foreground">Aucune mise à jour</p>
              ) : (
                statusUpdates.map(status => (
                  <Badge 
                    key={status.id} 
                    variant="outline" 
                    style={{ backgroundColor: status.couleur }}
                    className="m-1 text-white"
                  >
                    {status.libelle}
                  </Badge>
                ))
              )}
            </div>

            {/* Planning */}
            <div>
              <h3 className="font-semibold mb-2">Mises à jour du Planning</h3>
              {scheduleUpdates.length === 0 ? (
                <p className="text-muted-foreground">Aucune mise à jour</p>
              ) : (
                scheduleUpdates.map((update, index) => (
                  <Badge 
                    key={index} 
                    variant="destructive" 
                    className="m-1"
                  >
                    Nouvelle entrée de planning
                  </Badge>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
