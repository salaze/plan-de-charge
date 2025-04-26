
import React, { useState } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { StatisticsTablePanel } from '@/components/statistics/panels/StatisticsTablePanel';
import { StatisticsChartPanel } from '@/components/statistics/panels/StatisticsChartPanel';

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  const { chartData } = useStatisticsData(currentYear, currentMonth, availableStatusCodes);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // Filter out the 'none' status
  const filteredStatusCodes = availableStatusCodes.filter(code => code !== 'none');
  
  return (
    <StatisticsLayout>
      <StatisticsHeader 
        year={currentYear}
        month={currentMonth}
        onMonthChange={handleMonthChange}
      />
      
      <StatisticsTablePanel 
        chartData={chartData}
        statusCodes={filteredStatusCodes}
        isLoading={statusesLoading}
      />
      
      <StatisticsChartPanel 
        chartData={chartData}
        statusCodes={filteredStatusCodes}
        isLoading={statusesLoading}
      />
    </StatisticsLayout>
  );
};

export default Statistics;
