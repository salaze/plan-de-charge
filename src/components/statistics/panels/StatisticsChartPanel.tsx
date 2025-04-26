
import React from 'react';
import { StatisticsChart } from '../StatisticsChart';
import { StatusCode } from '@/types';

interface StatisticsChartPanelProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

export const StatisticsChartPanel = ({ chartData, statusCodes, isLoading }: StatisticsChartPanelProps) => {
  return (
    <div className="glass-panel p-4 animate-scale-in">
      <h2 className="text-xl font-semibold mb-4">Graphique par employé</h2>
      <div className="h-80">
        <StatisticsChart 
          chartData={chartData}
          statusCodes={statusCodes}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
