
import React from 'react';
import { format, isWeekend } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { HelpCircle } from 'lucide-react';

interface PlanningGridHeaderProps {
  days: Date[];
  handleShowLegend: () => void;
}

export function PlanningGridHeader({ days, handleShowLegend }: PlanningGridHeaderProps) {
  console.log('PlanningGridHeader days count:', days?.length || 0);

  return (
    <div className="sticky top-0 z-10 bg-background">
      <div className="flex border-b">
        <div className="min-w-[150px] w-[150px] p-2 font-medium text-center border-r flex items-center justify-between">
          <span>Employés</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleShowLegend}
            title="Afficher la légende"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex flex-row">
          {days && days.length > 0 ? (
            days.map((day, index) => {
              if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
                console.log(`Invalid day at index ${index}`);
                return (
                  <div key={`invalid-${index}`} className="w-[40px] min-w-[40px] p-1 text-center border-r text-xs">
                    <div className="font-medium">-</div>
                    <div className="text-muted-foreground uppercase">-</div>
                  </div>
                );
              }
              
              const isWeekendDay = isWeekend(day);
              const dayNumber = format(day, 'd');
              const dayName = format(day, 'EEE', { locale: fr });
  
              return (
                <div
                  key={`day-${index}`}
                  className={`w-[40px] min-w-[40px] p-1 text-center border-r text-xs ${
                    isWeekendDay ? 'bg-muted' : ''
                  }`}
                >
                  <div className="font-medium">{dayNumber}</div>
                  <div className="text-muted-foreground uppercase">{dayName}</div>
                </div>
              );
            })
          ) : (
            <div className="w-full p-4 text-center">Aucune date à afficher</div>
          )}
        </div>
      </div>
    </div>
  );
}
