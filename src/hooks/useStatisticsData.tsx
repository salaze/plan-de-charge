
import { useState, useCallback } from 'react';
import { StatusCode } from '@/types';
import { useEmployeesFetcher } from './statistics/useEmployeesFetcher';
import { useRealTimeUpdates } from './statistics/useRealTimeUpdates';
import { useStatisticsCalculation } from './statistics/useStatisticsCalculation';

export const useStatisticsData = (
  year: number,
  month: number,
  availableStatusCodes: StatusCode[]
) => {
  const [chartData, setChartData] = useState<Array<{ name: string; [key: string]: number | string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchEmployees } = useEmployeesFetcher();
  const { calculateStats } = useStatisticsCalculation();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    
    try {
      console.log('Chargement des données statistiques pour', year, month);
      const employees = await fetchEmployees(year, month);
      
      if (employees.length === 0) {
        console.log('Aucun employé trouvé');
        setChartData([]);
        return;
      }

      const { chartData: newChartData } = calculateStats(
        employees,
        year,
        month,
        availableStatusCodes
      );

      console.log('Données du graphique générées:', newChartData.length);
      setChartData(newChartData);
    } catch (error) {
      console.error('Erreur lors du chargement des données statistiques:', error);
      setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [year, month, availableStatusCodes, fetchEmployees, calculateStats]);

  // Charger les données au démarrage et lorsque les dépendances changent
  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Configurer les mises à jour en temps réel
  const { forceRefresh } = useRealTimeUpdates(refreshData);

  // Charger les données initiales
  useState(() => {
    loadData();
  });

  return {
    chartData,
    isLoading,
    refreshData: forceRefresh
  };
};
