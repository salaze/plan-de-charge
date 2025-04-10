
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';
import { getMonthName } from '@/lib/utils';

interface PlanningNavigatorProps {
  currentMonth: number;
  currentYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function PlanningNavigator({
  currentMonth,
  currentYear,
  onPrevMonth,
  onNextMonth,
  onToday
}: PlanningNavigatorProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onPrevMonth}>
        &lt;
      </Button>
      <Button variant="outline" size="sm" onClick={onToday}>
        Aujourd'hui
      </Button>
      <Button variant="outline" size="sm" onClick={onNextMonth}>
        &gt;
      </Button>
      <div className="bg-primary/10 rounded-md px-3 py-1.5 text-sm font-medium text-primary">
        <Calendar className="inline-block h-4 w-4 mr-1" />
        {getMonthName(currentMonth)} {currentYear}
      </div>
    </div>
  );
}
