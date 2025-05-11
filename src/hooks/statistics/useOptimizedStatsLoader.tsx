
import { useState, useMemo, useCallback, useEffect } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { toast } from 'sonner';
import { syncStatusesWithDatabase } from '@/utils/supabase/status';

export const useOptimizedStatsLoader = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { calculateStats } = useStatsCalculator();
  
  // Cache key based on current selection and status codes
  const cacheKey = useMemo(() => 
    `stats_${currentYear}_${currentMonth}_${statusCodes.join('_')}_${refreshCounter}`,
  [currentYear, currentMonth, statusCodes, refreshCounter]);
  
  // Synchroniser les statuts au chargement initial
  useEffect(() => {
    const syncStatuses = async () => {
      try {
        await syncStatusesWithDatabase();
        console.log("Statuts synchronisés avec la base de données");
      } catch (error) {
        console.error("Erreur lors de la synchronisation des statuts", error);
      }
    };
    
    syncStatuses();
  }, []);

  // Écouter les mises à jour des statuts
  useEffect(() => {
    const handleStatusesUpdated = () => {
      console.log("Statuts mis à jour, actualisation des statistiques");
      setRefreshCounter(prev => prev + 1);
    };
    
    window.addEventListener('statusesUpdated', handleStatusesUpdated);
    
    return () => {
      window.removeEventListener('statusesUpdated', handleStatusesUpdated);
    };
  }, []);
  
  // Load data efficiently
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        
        // Vérifier si les statuts sont vides
        if (statusCodes.length === 0) {
          console.log('Aucun statut disponible, calcul des statistiques reporté');
          setIsLoading(false);
          return;
        }
        
        console.log('Loading optimized statistics for:', currentYear, currentMonth);
        console.log('Using status codes:', statusCodes);
        
        // Step 1: Generate date range for the month
        const days = generateDaysInMonth(currentYear, currentMonth);
        const startDate = formatDate(days[0]);
        const endDate = formatDate(days[days.length - 1]);
        
        // Step 2: Load employees (uses internal caching)
        const loadedEmployees = await fetchEmployees();
        if (!isMounted) return;
        
        // Step 3: Load schedules for the employees
        const employeesWithSchedules = await fetchSchedules(loadedEmployees, startDate, endDate);
        if (!isMounted) return;
        
        // Step 4: Calculate stats
        const { stats, chartData } = calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
        if (!isMounted) return;
        
        setChartData(chartData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading statistics:', error);
        if (isMounted) {
          toast.error('Erreur lors du chargement des statistiques');
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [cacheKey, fetchEmployees, fetchSchedules, calculateStats, statusCodes.length]);
  
  // Function to trigger a refresh
  const refreshData = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);
  
  return {
    chartData,
    isLoading,
    refreshData
  };
};
