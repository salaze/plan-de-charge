
import { useState, useEffect } from 'react';
import { MonthData } from '@/types';

export const usePlanningData = () => {
  const [planningData, setPlanningData] = useState<MonthData | null>(null);
  
  useEffect(() => {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      setPlanningData(JSON.parse(savedData));
    }
  }, []);
  
  return planningData;
};
