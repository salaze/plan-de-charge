
import { useCallback } from 'react';
import { MonthData } from '@/types';

export const usePlanningPersistence = () => {
  // Sauvegarde des données dans localStorage
  const saveDataToLocalStorage = useCallback((updatedData: MonthData) => {
    localStorage.setItem('planningData', JSON.stringify(updatedData));
  }, []);
  
  return {
    saveDataToLocalStorage
  };
};
