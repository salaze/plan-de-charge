
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Status } from '@/types';

interface StatusLegendProps {
  statuses: Status[];
}

export function StatusLegend({ statuses }: StatusLegendProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Légende</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {statuses.map((status) => (
            <div key={status.code} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full" 
                style={{backgroundColor: status.color}}
              ></div>
              <span>{status.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
