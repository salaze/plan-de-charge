
import { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';

export function usePlanningCalendar(year: number, month: number) {
  const [days, setDays] = useState<Date[]>([]);
  
  useEffect(() => {
    setDays(generateDays());
  }, [year, month]);
  
  const generateDays = () => {
    const firstDay = startOfMonth(new Date(year, month));
    const lastDay = endOfMonth(firstDay);
    const daysArray = [];

    for (let day = 0; day < lastDay.getDate(); day++) {
      const date = addDays(firstDay, day);
      daysArray.push(date);
    }

    return daysArray;
  };

  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  return {
    days,
    formatDate
  };
}
