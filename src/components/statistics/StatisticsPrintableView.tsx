
import React from 'react';
import { StatusCode } from '@/types';
import { PrintableHeader } from './printable/PrintableHeader';
import { PrintableOverviewChart } from './printable/PrintableOverviewChart';
import { PrintableEmployeeCharts } from './printable/PrintableEmployeeCharts';

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
  // Décalage de rendu pour laisser le temps aux graphiques de se charger
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Laisser un délai pour le rendu complet des graphiques
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [chartData]);

  return (
    <div 
      ref={ref} 
      className="p-8 bg-white text-black print-view" 
      style={{ 
        minHeight: '100vh',
        visibility: isReady ? 'visible' : 'hidden' 
      }}
    >
      <PrintableHeader year={year} month={month} />
      <PrintableOverviewChart chartData={chartData} statusCodes={statusCodes} />
      <PrintableEmployeeCharts chartData={chartData} statusCodes={statusCodes} />
    </div>
  );
});

StatisticsPrintableView.displayName = 'StatisticsPrintableView';
