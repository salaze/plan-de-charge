
import React, { useState, useEffect } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { StatisticsTablePanel } from '@/components/statistics/panels/StatisticsTablePanel';
import { StatisticsChartPanel } from '@/components/statistics/panels/StatisticsChartPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { initPrintStyles } from '@/utils/printUtils';

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
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
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = () => {
    toast.info("Actualisation des statistiques en cours...");
    console.log("Demande d'actualisation des statistiques");
    
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
      
      <StatisticsTablePanel 
        chartData={chartData}
        statusCodes={filteredStatusCodes}
        isLoading={isLoading}
      />
      
      <StatisticsChartPanel 
        chartData={chartData}
        statusCodes={filteredStatusCodes}
        isLoading={isLoading}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </StatisticsLayout>
  );
};

export default Statistics;
