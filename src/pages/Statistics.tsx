
import React, { useState, useEffect, useCallback } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { StatisticsTablePanel } from '@/components/statistics/panels/StatisticsTablePanel';
import { StatisticsChartPanel } from '@/components/statistics/panels/StatisticsChartPanel';
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [localData, setLocalData] = useState<MonthData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  const { chartData, isLoading: statsLoading } = useStatisticsData(currentYear, currentMonth, availableStatusCodes, localData);
  
  // Fonction pour charger les données depuis localStorage
  const loadLocalData = useCallback(() => {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setLocalData(parsedData);
        console.log('Data loaded from localStorage:', parsedData);
        
        if (!parsedData.employees || parsedData.employees.length === 0) {
          toast.warning('Aucun employé trouvé dans les données du planning');
        }
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    } else {
      console.warn('No planning data found in localStorage');
      toast.warning('Aucune donnée de planning disponible. Veuillez configurer le planning.');
    }
  }, []);
  
  // Charger les données au chargement initial et quand le mois change
  useEffect(() => {
    loadLocalData();
    
    // Configurer un écouteur d'événements pour les mises à jour du stockage local
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'planningData') {
        console.log('LocalStorage planningData changed, reloading data');
        loadLocalData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Configurer un écouteur d'événements personnalisé pour les mises à jour du planning
    const handlePlanningUpdated = () => {
      console.log('Planning updated event received, reloading data');
      loadLocalData();
    };
    
    window.addEventListener('planningUpdated', handlePlanningUpdated);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('planningUpdated', handlePlanningUpdated);
    };
  }, [currentYear, currentMonth, loadLocalData]);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = () => {
    toast.info('Actualisation des statistiques...');
    loadLocalData();
    setRefreshKey(prev => prev + 1);
  };

  // Filter out the 'none' status
  const filteredStatusCodes = availableStatusCodes.filter(code => code !== 'none');
  
  const isLoading = statusesLoading || statsLoading;
  
  return (
    <StatisticsLayout>
      <div className="flex justify-between items-center">
        <StatisticsHeader 
          year={currentYear}
          month={currentMonth}
          onMonthChange={handleMonthChange}
        />
        
        <Button 
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Actualiser</span>
        </Button>
      </div>
      
      <StatisticsTablePanel 
        chartData={chartData}
        statusCodes={filteredStatusCodes}
        isLoading={isLoading}
      />
      
      <StatisticsChartPanel 
        chartData={chartData}
        statusCodes={filteredStatusCodes}
        isLoading={isLoading}
      />
    </StatisticsLayout>
  );
};

export default Statistics;
