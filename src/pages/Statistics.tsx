
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/useStatisticsData';
import { StatisticsTable } from '@/components/statistics/StatisticsTable';
import { StatisticsChart } from '@/components/statistics/StatisticsChart';

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
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Statistiques</h1>
        
        <MonthSelector 
          year={currentYear} 
          month={currentMonth} 
          onChange={handleMonthChange} 
        />
        
        <div className="glass-panel p-6 animate-scale-in">
          <h2 className="text-xl font-semibold mb-4">Répartition des statuts par employé</h2>
          <StatisticsTable 
            chartData={chartData}
            statusCodes={filteredStatusCodes}
            isLoading={statusesLoading}
          />
        </div>
        
        <div className="glass-panel p-4 animate-scale-in">
          <h2 className="text-xl font-semibold mb-4">Graphique par employé</h2>
          <div className="h-80">
            <StatisticsChart 
              chartData={chartData}
              statusCodes={filteredStatusCodes}
              isLoading={statusesLoading}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Statistics;
