
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
    
    try {
      // Generate days using the utility function
      const generatedDays = generateDaysInMonth(validYear, validMonth);
      console.log('Generated days count:', generatedDays.length);
      
      if (!generatedDays || generatedDays.length === 0) {
        console.error('Failed to generate days for the month');
        setDays([]);
        return;
      }
      
      // Verify all generated dates are valid Date objects
      const validDays = generatedDays.filter(date => 
        date instanceof Date && !isNaN(date.getTime())
      );
      
      if (validDays.length !== generatedDays.length) {
        console.warn('Some generated days were invalid and filtered out');
      }
      
      setDays(validDays);
    } catch (error) {
      console.error('Error generating days for the month:', error);
      setDays([]);
    }
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
