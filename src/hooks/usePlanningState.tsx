
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

  // Écouter les événements d'édition pour suivre l'état
  useEffect(() => {
    const handleStatusEditStart = () => {
      console.log("usePlanningState: Début d'édition de statut détecté");
      isEditingStatus.current = true;
    };
    
    const handleStatusEditEnd = () => {
      console.log("usePlanningState: Fin d'édition de statut détectée");
      // Utiliser un délai pour éviter les actualisations immédiates
      setTimeout(() => {
        isEditingStatus.current = false;
      }, 750);
    };
    
    window.addEventListener('statusEditStart', handleStatusEditStart);
    window.addEventListener('statusEditEnd', handleStatusEditEnd);
    
    return () => {
      window.removeEventListener('statusEditStart', handleStatusEditStart);
      window.removeEventListener('statusEditEnd', handleStatusEditEnd);
    };
  }, []);

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
    console.log("Début modification statut");
    // Informer l'application du début de l'édition
    const startEvent = new CustomEvent('statusEditStart');
    window.dispatchEvent(startEvent);
    
    try {
      // Appeler la fonction originale
      await originalHandleStatusChange(...args);
    } finally {
      // Informer l'application de la fin de l'édition avec un délai
      setTimeout(() => {
        console.log("Fin modification statut");
        const endEvent = new CustomEvent('statusEditEnd');
        window.dispatchEvent(endEvent);
      }, 1000);
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
