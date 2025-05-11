
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
  // Délai de rendu plus court pour améliorer la réactivité
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Réduire le délai à 500ms pour accélérer le rendu
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [chartData]);

  // Optimisation: limiter le nombre d'employés pour l'impression
  const optimizedData = chartData.length > 30 
    ? chartData.slice(0, 30) 
    : chartData;

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
      <PrintableOverviewChart chartData={optimizedData} statusCodes={statusCodes} />
      <PrintableEmployeeCharts chartData={optimizedData} statusCodes={statusCodes} />
    </div>
  );
});

StatisticsPrintableView.displayName = 'StatisticsPrintableView';
