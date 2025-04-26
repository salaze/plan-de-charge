
import React, { useState, useEffect } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { StatisticsTablePanel } from '@/components/statistics/panels/StatisticsTablePanel';
import { StatisticsChartPanel } from '@/components/statistics/panels/StatisticsChartPanel';
import { MonthData } from '@/types';
import { toast } from 'sonner';

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [localData, setLocalData] = useState<MonthData | null>(null);
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  const { chartData, isLoading: statsLoading } = useStatisticsData(currentYear, currentMonth, availableStatusCodes, localData);
  
  useEffect(() => {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setLocalData(parsedData);
        console.log('Data loaded from localStorage:', parsedData);
      } catch (error) {
        console.error('Error parsing localStorage data:', error);
        toast.error('Erreur lors du chargement des données');
      }
    } else {
      console.warn('No planning data found in localStorage');
      toast.warning('Aucune donnée de planning disponible');
    }
  }, []);

  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  // Filter out the 'none' status
  const filteredStatusCodes = availableStatusCodes.filter(code => code !== 'none');
  
  const isLoading = statusesLoading || statsLoading;
  
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
