
import React, { useState, Suspense, lazy } from 'react';
import { useStatusOptionsQuery } from '@/hooks/useStatusOptionsQuery';
import { useOptimizedStatsLoader } from '@/hooks/statistics';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { initPrintStyles } from '@/utils/printUtils';
import { useEffect } from 'react';
import { queryClient } from '@/contexts/QueryContext';

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
  
  const { data: availableStatusCodes = [], isLoading: statusesLoading } = useStatusOptionsQuery();
  
  // Filtrer le statut 'none'
  const filteredStatusCodes = availableStatusCodes.filter(code => code !== 'none');
  
  const { chartData, stats, isLoading: statsLoading } = useOptimizedStatsLoader(
    currentYear, 
    currentMonth, 
    filteredStatusCodes
  );
  
  // Initialiser les styles d'impression au chargement
  useEffect(() => {
    initPrintStyles();
  }, []);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = async () => {
    toast.info("Actualisation des statistiques...");
    
    // Invalider toutes les requêtes pertinentes
    await queryClient.invalidateQueries({ queryKey: ['employees'] });
    await queryClient.invalidateQueries({ queryKey: ['schedules'] });
    await queryClient.invalidateQueries({ queryKey: ['statuses'] });
    await queryClient.invalidateQueries({ queryKey: ['statistics'] });
  };

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
