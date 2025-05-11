
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useOptimizedStatsLoader } from '@/hooks/statistics';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { initPrintStyles } from '@/utils/printUtils';
import { syncStatusesWithDatabase } from '@/utils/supabase/status';

// Lazy load heavy components
const StatisticsTablePanel = lazy(() => 
  import('@/components/statistics/panels/StatisticsTablePanel')
    .then(module => ({ default: module.StatisticsTablePanel }))
);
const StatisticsChartPanel = lazy(() => 
  import('@/components/statistics/panels/StatisticsChartPanel')
    .then(module => ({ default: module.StatisticsChartPanel }))
);

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading, refreshStatuses } = useStatusOptions();
  const { chartData, isLoading: statsLoading, refreshData } = useOptimizedStatsLoader(
    currentYear, 
    currentMonth, 
    availableStatusCodes
  );
  
  // Synchroniser les statuts au chargement de la page
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Synchroniser les statuts avec la base de données
        await syncStatusesWithDatabase();
        // Puis rafraîchir les statuts locaux
        refreshStatuses();
      } catch (error) {
        console.error("Erreur lors de l'initialisation des données", error);
      }
    };
    
    initializeData();
  }, [refreshStatuses]);
  
  // Initialize print styles on load
  useEffect(() => {
    initPrintStyles();
  }, []);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = async () => {
    toast.info("Actualisation des statistiques en cours...");
    console.log("Refreshing statistics data and synchronizing statuses");
    
    // Synchroniser les statuts avant de rafraîchir les données
    await syncStatusesWithDatabase();
    // Rafraîchir les statuts locaux
    refreshStatuses();
    // Rafraîchir les données statistiques
    refreshData();
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
          disabled={isLoading}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Chargement...' : 'Actualiser'}</span>
        </Button>
      </div>
      
      <Suspense fallback={<div className="text-center p-6">Chargement du tableau...</div>}>
        <StatisticsTablePanel 
          chartData={chartData}
          statusCodes={filteredStatusCodes}
          isLoading={isLoading}
        />
      </Suspense>
      
      <Suspense fallback={<div className="text-center p-6">Chargement des graphiques...</div>}>
        <StatisticsChartPanel 
          chartData={chartData}
          statusCodes={filteredStatusCodes}
          isLoading={isLoading}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      </Suspense>
    </StatisticsLayout>
  );
};

export default Statistics;
