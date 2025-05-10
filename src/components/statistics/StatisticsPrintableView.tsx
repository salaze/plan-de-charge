
import React from 'react';
import { StatisticsChart } from './StatisticsChart';
import { StatisticsPieChart } from './StatisticsPieChart';
import { StatusCode } from '@/types';

interface StatisticsPrintableViewProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  year: number;
  month: number;
}

export const StatisticsPrintableView = React.forwardRef<HTMLDivElement, StatisticsPrintableViewProps>(({
  chartData,
  statusCodes,
  year,
  month
}, ref) => {
  // Obtenir le nom du mois en français
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  
  const monthName = monthNames[month];
  
  return (
    <div ref={ref} className="p-8 bg-white text-black" style={{ minHeight: '100vh' }}>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Statistiques - {monthName} {year}</h1>
        <p className="text-sm text-gray-600">Date d'impression: {new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
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
    </div>
  );
});

StatisticsPrintableView.displayName = 'StatisticsPrintableView';
