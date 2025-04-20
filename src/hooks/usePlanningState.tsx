
import { useState } from 'react';
import { FilterOptions } from '@/types';
import { filterData } from '@/utils/dataFilterUtils';
import { usePlanningSync } from './planning/usePlanningSync';
import { usePlanningData } from './planning/usePlanningData';
import { useStatusUpdater } from './planning/useStatusUpdater';

export const usePlanningState = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  const { data, setData, loading, isOnline } = usePlanningData(currentYear, currentMonth);
  const { saveDataToLocalStorage, handleSync } = usePlanningSync(data);
  const { handleStatusChange } = useStatusUpdater(data, setData, isOnline, saveDataToLocalStorage);

  // Filtered data based on applied filters
  const [filteredData, setFilteredData] = useState(data);

  // Apply filters when they change
  useState(() => {
    const filtered = filterData(data, filters);
    setFilteredData(filtered);
  }, [data, filters]);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };
  
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    if (Object.keys(newFilters).length > 0 && 
        (newFilters.employeeId || 
         newFilters.projectCode || 
         (newFilters.statusCodes && newFilters.statusCodes.length) || 
         newFilters.startDate || 
         newFilters.endDate)) {
      toast.success("Filtres appliqués");
    } else {
      toast.info("Filtres réinitialisés");
    }
  };

  return {
    data: filteredData,
    originalData: data,
    currentYear,
    currentMonth,
    filters,
    isLegendOpen,
    loading,
    isOnline,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange
  };
};

export default usePlanningState;
