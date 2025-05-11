
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { StatusCode } from '@/types';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { useEmployeeLoader } from './useEmployeeLoader';
import { useScheduleLoader } from './useScheduleLoader';
import { useStatsCalculator } from './useStatsCalculator';
import { useRealtimeUpdates } from './useRealtimeUpdates';
import { useLoadingState } from './useLoadingState';
import { toast } from 'sonner';
import { syncStatusesWithDatabase } from '@/utils/supabase/status';

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  const { employees, fetchEmployees } = useEmployeeLoader();
  const { fetchSchedules } = useScheduleLoader();
  const { stats, chartData, isLoading: isCalculating } = useStatsCalculator(
    employees, 
    currentYear, 
    currentMonth, 
    statusCodes
  );
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

  // Synchroniser les statuts au chargement pour éviter les désynchronisations
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

  // Effet principal qui gère la séquence de chargement des données avec optimisation
  useEffect(() => {
    // Vérifier si les statuts sont vides et arrêter si c'est le cas
    if (statusCodes.length === 0) {
      console.log('Aucun statut disponible, calcul des statistiques reporté');
      return;
    }

    // Vérifier si les données sont déjà en cache pour cette période
    if (cacheKey === previousCacheKey.current && cachedData.current) {
      console.log('Utilisation des données en cache pour', cacheKey);
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Chargement des données depuis Supabase pour', currentYear, currentMonth);
        console.log('Statuts utilisés pour le calcul:', statusCodes);

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
        
        // 4. Mettre les données dans le cache
        setLoadingState('calculating');
        cachedData.current = {
          employees: employeesWithSchedules,
          chartData: chartData
        };
        previousCacheKey.current = cacheKey;
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setIsLoading(false);
        setLoadingState('idle');
      }
    };

    // Déclencher le chargement des données
    loadData();
  }, [currentYear, currentMonth, statusCodes, fetchEmployees, fetchSchedules, refreshKey, cacheKey, chartData]);

  // Ajouter un nettoyage de cache lors des changements de statusCodes
  useEffect(() => {
    return () => {
      // Nettoyer le cache lors des changements de statuts
      previousCacheKey.current = '';
      cachedData.current = null;
    };
  }, [statusCodes.length, refreshKey]);

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
    employeeStats: stats,
    chartData,
    isLoading,
    loadingDetails,
    refreshData
  };
};
