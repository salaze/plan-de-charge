
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusCell } from '@/components/calendar/StatusCell';
import { Status } from '@/types';

type StatusLegendCardProps = {
  statuses: Status[];
};

const StatusLegendCard: React.FC<StatusLegendCardProps> = ({ statuses }) => {
  // If no statuses are provided, don't render the card
  if (statuses.length === 0) return null;

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
            <div key={status.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  {status.code}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {status.label}
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
