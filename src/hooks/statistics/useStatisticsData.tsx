
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { useLoadingState } from './useLoadingState';
import { toast } from 'sonner';

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { employeeStats, chartData, calculateStats } = useStatsCalculator();
  const { isLoading, setIsLoading, loadingState, setLoadingState, refreshKey, incrementRefreshKey } = useLoadingState();
  
  // Mise en cache des données pour éviter des chargements inutiles
  const cacheKey = `${currentYear}-${currentMonth}-${statusCodes.join('-')}`;
  const previousCacheKey = useRef('');
  const cachedData = useRef<{
    employees: any[];
    chartData: any[];
  } | null>(null);
  
  // Gestion des mises à jour en temps réel avec optimisation
  const { refreshData } = useRealtimeUpdates(incrementRefreshKey);
  
  // Ajouter un timeout pour éviter un blocage infini
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxLoadingTime = 30000; // 30 secondes max

  // Effet principal qui gère la séquence de chargement des données avec optimisation
  useEffect(() => {
    // Vérifier si les données sont déjà en cache pour cette période
    if (cacheKey === previousCacheKey.current && cachedData.current) {
      console.log('Utilisation des données en cache pour', cacheKey);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Chargement des données depuis Supabase pour', currentYear, currentMonth);

        // Configurer un timeout pour éviter un chargement infini
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        
        timeoutRef.current = setTimeout(() => {
          if (isLoading) {
            setIsLoading(false);
            setLoadingState('idle');
            toast.error('Le chargement des statistiques a pris trop de temps. Veuillez réessayer.');
            console.error('Timeout de chargement des statistiques');
          }
        }, maxLoadingTime);

        // 1. Déterminer l'intervalle de dates pour le mois sélectionné
        const days = generateDaysInMonth(currentYear, currentMonth);
        const startDate = formatDate(days[0]);
        const endDate = formatDate(days[days.length - 1]);
        console.log(`Période: ${startDate} à ${endDate}`);

        // 2. Charger les employés de manière optimisée
        setLoadingState('loading-employees');
        const loadedEmployees = await fetchEmployees();
        
        // 3. Optimisation: Charger tous les plannings en une seule requête
        setLoadingState('loading-schedules');
        const employeesWithSchedules = await fetchSchedules(loadedEmployees, startDate, endDate);
        
        // 4. Calculer les statistiques avec optimisation
        setLoadingState('calculating');
        calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
        
        // Mettre en cache les résultats
        cachedData.current = {
          employees: employeesWithSchedules,
          chartData
        };
        previousCacheKey.current = cacheKey;
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsLoading(false);
        setLoadingState('idle');
      }
    };

    // Déclencher le chargement des données
    loadData();
    
    return () => {
      // Nettoyer le timeout en cas de démontage du composant
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentYear, currentMonth, statusCodes, fetchEmployees, fetchSchedules, calculateStats, refreshKey, cacheKey, chartData, isLoading]);

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
