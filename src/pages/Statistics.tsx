
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
  const { chartData, stats, isLoading: statsLoading, refreshData } = useOptimizedStatsLoader(
    currentYear, 
    currentMonth, 
    availableStatusCodes
  );
  
  // Synchronize statuses when page loads
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Synchronize statuses with database
        await syncStatusesWithDatabase();
        // Then refresh local statuses
        refreshStatuses();
      } catch (error) {
        console.error("Error initializing data", error);
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
    toast.info("Refreshing statistics...");
    console.log("Refreshing statistics data and synchronizing statuses");
    
    // Synchronize statuses before refreshing data
    await syncStatusesWithDatabase();
    // Refresh local statuses
    refreshStatuses();
    // Refresh statistics data
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
          <span>{isLoading ? 'Loading...' : 'Refresh'}</span>
        </Button>
      </div>
      
      <Suspense fallback={<div className="text-center p-6">Loading table...</div>}>
        <StatisticsTablePanel 
          chartData={chartData}
          statusCodes={filteredStatusCodes}
          isLoading={isLoading}
        />
      </Suspense>
      
      <Suspense fallback={<div className="text-center p-6">Loading charts...</div>}>
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
