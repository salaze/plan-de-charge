
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { generateDaysInMonth } from '@/utils/dateUtils';

export function usePlanningCalendar(year: number, month: number) {
  const [days, setDays] = useState<Date[]>([]);
  
  useEffect(() => {
    // Utiliser la fonction commune pour générer des jours
    setDays(generateDaysInMonth(year, month));
  }, [year, month]);

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return {
    days,
    formatDate
  };
}
