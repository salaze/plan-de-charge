
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusCell } from '@/components/calendar/StatusCell';
import { StatusCode } from '@/types';

type StatusLegendCardProps = {
  statuses: StatusCode[];
};

const StatusLegendCard: React.FC<StatusLegendCardProps> = ({ statuses }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Légende des statuts</CardTitle>
        <CardDescription>
          Référence des codes utilisés dans le planning
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((status) => (
            <div key={status} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <StatusCell status={status} isBadge={true} />
              </div>
              <div className="text-sm text-muted-foreground">
                Code: {status.toUpperCase()}
              </div>
            </div>
          ))}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StatusCell status="assistance" isHighlighted={true} isBadge={true} />
              <span className="text-sm">Entouré (Permanence)</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Statut avec permanence
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusLegendCard;
