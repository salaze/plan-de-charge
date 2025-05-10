
import { useState, useEffect, useMemo } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { useLoadingState } from './useLoadingState';

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { employeeStats, chartData, calculateStats } = useStatsCalculator();
  const { isLoading, setIsLoading, loadingState, setLoadingState, refreshKey, incrementRefreshKey } = useLoadingState();
  
  // Gestion des mises à jour en temps réel
  const { refreshData } = useRealtimeUpdates(incrementRefreshKey);

  // Effet principal qui gère la séquence de chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Chargement des données depuis Supabase pour', currentYear, currentMonth);

        // 1. Déterminer l'intervalle de dates pour le mois sélectionné
        const days = generateDaysInMonth(currentYear, currentMonth);
        const startDate = formatDate(days[0]);
        const endDate = formatDate(days[days.length - 1]);
        console.log(`Période: ${startDate} à ${endDate}`);

        // 2. Charger les employés
        setLoadingState('loading-employees');
        const loadedEmployees = await fetchEmployees();
        
        // 3. Charger les plannings pour ces employés
        setLoadingState('loading-schedules');
        const employeesWithSchedules = await fetchSchedules(loadedEmployees, startDate, endDate);
        
        // 4. Calculer les statistiques
        setLoadingState('calculating');
        calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
      } finally {
        setIsLoading(false);
        setLoadingState('idle');
      }
    };

    // Déclencher le chargement des données
    loadData();
  }, [currentYear, currentMonth, statusCodes, fetchEmployees, fetchSchedules, calculateStats, refreshKey]);

  // Exposer l'état de chargement détaillé pour le débogage
  const loadingDetails = useMemo(() => {
    return {
      state: loadingState,
      employeesCount: employees.length,
      statusCodesCount: statusCodes.length,
      chartDataCount: chartData.length
    };
  }, [loadingState, employees.length, statusCodes.length, chartData.length]);

  return {
    employeeStats,
    chartData,
    isLoading,
    loadingDetails,
    refreshData
  };
};
