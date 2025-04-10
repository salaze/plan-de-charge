
import { useState } from 'react';

export const useDateSelection = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [date, setDate] = useState<Date | undefined>(new Date());
  
  return { 
    currentYear, 
    setCurrentYear, 
    currentMonth, 
    setCurrentMonth,
    date,
    setDate
  };
};
