
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { generateDaysInMonth } from '@/utils/dateUtils';

export function usePlanningCalendar(year: number, month: number) {
  const [days, setDays] = useState<Date[]>([]);
  
  useEffect(() => {
    try {
      // Ensure valid year and month values
      const validYear = Number.isInteger(year) && year > 0 ? year : new Date().getFullYear();
      const validMonth = Number.isInteger(month) && month >= 0 && month <= 11 ? month : new Date().getMonth();
      
      // Generate days using the utility function
      const generatedDays = generateDaysInMonth(validYear, validMonth);
      
      // Verify we have valid Date objects
      const validDays = generatedDays.filter(day => day instanceof Date);
      
      setDays(validDays);
    } catch (error) {
      console.error('Error generating days:', error);
      setDays([]);
    }
  }, [year, month]);

  const formatDate = (date: Date) => {
    try {
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error('Invalid date object');
      }
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  return {
    days,
    formatDate
  };
}
