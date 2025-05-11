
import { useMemo } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeesQuery } from './useEmployeesQuery';
import { useSchedulesQuery } from './useSchedulesQuery';
import { useStatsCalculator } from './useStatsCalculator';
import { useStatusOptionsQuery } from '../useStatusOptionsQuery';

export const useOptimizedStatsLoader = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  // Générer les dates du mois
  const { startDate, endDate } = useMemo(() => {
    const days = generateDaysInMonth(currentYear, currentMonth);
    return {
      startDate: formatDate(days[0]),
      endDate: formatDate(days[days.length - 1])
    };
  }, [currentYear, currentMonth]);
  
  // Utiliser nos hooks React Query pour charger les données
  const { 
    data: employees = [], 
    isLoading: isEmployeesLoading 
  } = useEmployeesQuery();
  
  const { 
    data: employeesWithSchedules = [], 
    isLoading: isSchedulesLoading 
  } = useSchedulesQuery(employees, startDate, endDate, !isEmployeesLoading);
  
  const { 
    data: availableStatusCodes = [], 
    isLoading: isStatusesLoading 
  } = useStatusOptionsQuery();
  
  // Utiliser seulement les statuts disponibles si aucun n'est spécifié
  const effectiveStatusCodes = statusCodes.length > 0 ? statusCodes : availableStatusCodes;
  
  // Calculer les statistiques
  const { 
    stats, 
    chartData, 
    isLoading: isCalculating 
  } = useStatsCalculator(
    employeesWithSchedules,
    currentYear,
    currentMonth,
    effectiveStatusCodes
  );
  
  // Déterminer si le chargement est en cours
  const isLoading = isEmployeesLoading || isSchedulesLoading || isStatusesLoading || isCalculating;
  
  return {
    stats,
    chartData,
    isLoading,
    refreshData: () => {
      // Les requêtes seront automatiquement invalidées par useSupabaseSubscription
      console.log("Les données seront rechargées automatiquement si nécessaire");
    }
  };
};
