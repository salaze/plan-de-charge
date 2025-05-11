
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/statistics';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { initPrintStyles } from '@/utils/printUtils';

// Chargement paresseux des composants lourds
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
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  const { chartData, isLoading: statsLoading, refreshData, loadingDetails } = useStatisticsData(
    currentYear, 
    currentMonth, 
    availableStatusCodes
  );
  
  // Initialiser les styles d'impression au chargement
  useEffect(() => {
    initPrintStyles();
  }, []);
  
  // Ajouter un timeout global pour afficher un message si le chargement est trop long
  useEffect(() => {
    if (statsLoading) {
      const timer = setTimeout(() => {
        if (statsLoading) {
          setLoadTimeout(true);
        }
      }, 20000); // 20 secondes
      
      return () => clearTimeout(timer);
    } else {
      setLoadTimeout(false);
    }
  }, [statsLoading]);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = () => {
    toast.info("Actualisation des statistiques en cours...");
    console.log("Demande d'actualisation des statistiques");
    setLoadTimeout(false);
    
    // Log des détails de chargement pour le débogage
    console.log("État du chargement:", loadingDetails);
    
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
      
      {loadTimeout && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>Le chargement des données prend plus de temps que prévu. Vous pouvez continuer à attendre ou actualiser la page.</p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            Réessayer
          </Button>
        </div>
      )}
      
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
