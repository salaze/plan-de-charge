
import React from 'react';
import { StatusCode } from '@/types';
import { StatisticsChart } from '../StatisticsChart';

interface PrintableOverviewChartProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
}

export const PrintableOverviewChart = ({ chartData, statusCodes }: PrintableOverviewChartProps) => {
  return (
    <div className="mb-12">
      <h2 className="text-xl font-semibold mb-4">Vue d'ensemble par employé</h2>
      <div className="h-80 border p-4 rounded-lg bg-white">
        <StatisticsChart 
          chartData={chartData}
          statusCodes={statusCodes}
          isLoading={false}
        />
      </div>
    </div>
  );
};
