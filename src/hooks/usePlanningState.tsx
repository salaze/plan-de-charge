
import { useState, useEffect, useCallback, useRef } from 'react';
import { FilterOptions } from '@/types';
import { filterData } from '@/utils/dataFilterUtils';
import { usePlanningSync } from './planning/usePlanningSync';
import { usePlanningData } from './planning/usePlanningData';
import { useStatusUpdater } from './planning/useStatusUpdater';
import { toast } from 'sonner';

export const usePlanningState = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  
  // Référence pour suivre si on est en train de modifier un statut
  const isEditingStatus = useRef(false);

  const { data, setData, loading, isOnline, connectionError, reloadData } = usePlanningData(currentYear, currentMonth);
  const { handleSync } = usePlanningSync(data);
  const { handleStatusChange: originalHandleStatusChange } = useStatusUpdater(data, setData, isOnline);

  // Filtered data based on applied filters
  const [filteredData, setFilteredData] = useState(data);

  // Apply filters when they change
  useEffect(() => {
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
  
  // Wrapper pour handleStatusChange qui définit isEditingStatus
  const handleStatusChange = useCallback(async (...args: Parameters<typeof originalHandleStatusChange>) => {
    isEditingStatus.current = true;
    try {
      await originalHandleStatusChange(...args);
    } finally {
      // Remettre à false avec un petit délai pour éviter les actualisations immédiates
      setTimeout(() => {
        isEditingStatus.current = false;
      }, 500); 
    }
  }, [originalHandleStatusChange]);

  // Fonction pour forcer le rechargement des données
  const refreshData = useCallback(async () => {
    // Ne pas actualiser si on est en train d'éditer un statut
    if (isEditingStatus.current) {
      console.log("Actualisation ignorée car édition de statut en cours");
      return;
    }
    
    toast.info("Actualisation des données...");
    await reloadData();
    toast.success("Données actualisées");
  }, [reloadData]);

  return {
    data: filteredData,
    originalData: data,
    currentYear,
    currentMonth,
    filters,
    isLegendOpen,
    loading,
    isOnline,
    connectionError,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange,
    refreshData
  };
};

export default usePlanningState;
