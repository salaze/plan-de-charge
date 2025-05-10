
import React, { useState } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { StatisticsTablePanel } from '@/components/statistics/panels/StatisticsTablePanel';
import { StatisticsChartPanel } from '@/components/statistics/panels/StatisticsChartPanel';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

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
