
import React from 'react';
import { StatisticsTable } from '../StatisticsTable';
import { StatusCode } from '@/types';

interface StatisticsTablePanelProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

export const StatisticsTablePanel = ({ chartData, statusCodes, isLoading }: StatisticsTablePanelProps) => {
  return (
    <div className="glass-panel p-6 animate-scale-in">
      <h2 className="text-xl font-semibold mb-4">Répartition des statuts par employé</h2>
      <StatisticsTable 
        chartData={chartData}
        statusCodes={statusCodes}
        isLoading={isLoading}
      />
    </div>
  );
};
