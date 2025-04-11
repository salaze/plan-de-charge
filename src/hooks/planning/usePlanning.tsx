
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePlanningDataLoader } from './usePlanningDataLoader';
import { usePlanningFilters } from './usePlanningFilters';
import { usePlanningStatusUpdates } from './usePlanningStatusUpdates';
import { usePlanningPersistence } from './usePlanningPersistence';
import { useEffect } from 'react';

export const usePlanning = () => {
  const { isAdmin } = useAuth();
  const { data, setData, isLoading } = usePlanningDataLoader();
  const { filters, filteredData, handleFiltersChange } = usePlanningFilters(data);
  const { handleStatusChange } = usePlanningStatusUpdates(data, setData, isAdmin);
  const { saveDataToLocalStorage } = usePlanningPersistence();
  
  const [currentYear, setCurrentYear] = useState(data.year || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(typeof data.month === 'number' ? data.month : new Date().getMonth());
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  
  // Sauvegarde immédiate lors des changements
  useEffect(() => {
    saveDataToLocalStorage(data);
  }, [data, saveDataToLocalStorage]);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  return {
    data: filteredData,
    originalData: data,
    currentYear,
    currentMonth,
    filters,
    isLegendOpen,
    isLoading,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange
  };
};

export default usePlanning;
