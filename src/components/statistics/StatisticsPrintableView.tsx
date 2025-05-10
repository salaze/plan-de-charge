
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
  return (
    <div ref={ref} className="p-8 bg-white text-black" style={{ minHeight: '100vh' }}>
      <PrintableHeader year={year} month={month} />
      <PrintableOverviewChart chartData={chartData} statusCodes={statusCodes} />
      <PrintableEmployeeCharts chartData={chartData} statusCodes={statusCodes} />
    </div>
  );
});

StatisticsPrintableView.displayName = 'StatisticsPrintableView';
