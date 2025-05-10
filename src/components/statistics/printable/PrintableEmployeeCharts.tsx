
import React from 'react';
import { StatusCode } from '@/types';
import { StatisticsPieChart } from '../StatisticsPieChart';

interface PrintableEmployeeChartsProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
}

export const PrintableEmployeeCharts = ({ chartData, statusCodes }: PrintableEmployeeChartsProps) => {
  return (
    <div className="page-break-before">
      <h2 className="text-xl font-semibold mb-4">Répartition détaillée par employé</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {chartData.map((employee, index) => (
          <div key={index} className="border p-4 rounded-lg bg-white">
            <h3 className="text-lg font-medium mb-2">{employee.name as string}</h3>
            <div className="h-64">
              <StatisticsPieChart 
                chartData={[employee]}
                statusCodes={statusCodes}
                isLoading={false}
                className="print-chart"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
