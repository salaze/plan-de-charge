
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { generateDaysInMonth } from '@/utils/dateUtils';

export function usePlanningCalendar(year: number, month: number) {
  const [days, setDays] = useState<Date[]>([]);
  
  useEffect(() => {
    // Ensure valid year and month values
    const validYear = Number.isInteger(year) && year > 0 ? year : new Date().getFullYear();
    const validMonth = Number.isInteger(month) && month >= 0 && month <= 11 ? month : new Date().getMonth();
    
    console.log(`Generating days for: ${validYear}-${validMonth+1}`);
    
    // Generate days using the utility function
    const generatedDays = generateDaysInMonth(validYear, validMonth);
    console.log('Generated days count:', generatedDays.length);
    
    setDays(generatedDays);
  }, [year, month]);

  const formatDate = (date: Date): string => {
    try {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.warn('Invalid date object provided to formatDate:', date);
        return '';
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
