
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
  const isWeekendDay = (date: Date) => {
    return isWeekend(date);
  };

  return (
    <div className="sticky top-0 z-10 bg-background">
      <div className="grid grid-cols-[minmax(150px,1fr)_repeat(auto-fill,minmax(40px,1fr))] border-b">
        <div className="p-2 font-medium text-center border-r flex items-center justify-between">
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
        {days.map((day, index) => {
          const isWeekend = isWeekendDay(day);
          const dayNumber = format(day, 'd');
          const dayName = format(day, 'EEE', { locale: fr });

          return (
            <div
              key={index}
              className={`p-1 text-center border-r text-xs ${
                isWeekend ? 'bg-muted' : ''
              }`}
            >
              <div className="font-medium">{dayNumber}</div>
              <div className="text-muted-foreground uppercase">{dayName}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
