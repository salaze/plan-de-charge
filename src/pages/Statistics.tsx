import React, { useState } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { StatisticsTablePanel } from '@/components/statistics/panels/StatisticsTablePanel';
import { StatisticsChartPanel } from '@/components/statistics/panels/StatisticsChartPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  const { chartData, isLoading: statsLoading, refreshData } = useStatisticsData(
    currentYear, 
    currentMonth, 
    availableStatusCodes
  );
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = () => {
    toast.info("Actualisation des statistiques en cours...");
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
          className="flex items-center gap-1"
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Chargement...' : 'Actualiser'}</span>
        </Button>
      </div>
      
      {isLoading ? (
        <div className="space-y-6">
          <div className="glass-panel p-6 animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Répartition des statuts par employé</h2>
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
          
          <div className="glass-panel p-4 animate-scale-in">
            <h2 className="text-xl font-semibold mb-4">Graphique par employé</h2>
            <div className="h-80">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <StatisticsTablePanel 
            chartData={chartData}
            statusCodes={filteredStatusCodes}
            isLoading={false}
          />
          
          <StatisticsChartPanel 
            chartData={chartData}
            statusCodes={filteredStatusCodes}
            isLoading={false}
          />
        </>
      )}
    </StatisticsLayout>
  );
};

export default Statistics;
