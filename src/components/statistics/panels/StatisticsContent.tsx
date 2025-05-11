
import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';
import { StatusCode } from '@/types';

// Lazy loaded components
const StatisticsTablePanel = lazy(() => 
  import('./StatisticsTablePanel')
    .then(module => ({ default: module.StatisticsTablePanel }))
);
const StatisticsChartPanel = lazy(() => 
  import('./StatisticsChartPanel')
    .then(module => ({ default: module.StatisticsChartPanel }))
);

interface StatisticsContentProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
  selectedDepartment: string;
  onDepartmentChange: (department: string) => void;
  currentYear: number;
  currentMonth: number;
}

export const StatisticsContent = ({
  chartData,
  statusCodes,
  isLoading,
  selectedDepartment,
  onDepartmentChange,
  currentYear,
  currentMonth
}: StatisticsContentProps) => {
  return (
    <>
      <Suspense fallback={
        <div className="w-full h-[200px] rounded-md bg-muted/20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading table...</span>
        </div>
      }>
        <StatisticsTablePanel 
          chartData={chartData}
          statusCodes={statusCodes}
          isLoading={isLoading}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={onDepartmentChange}
        />
      </Suspense>
      
      <Suspense fallback={
        <div className="w-full h-[200px] rounded-md bg-muted/20 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Loading charts...</span>
        </div>
      }>
        <StatisticsChartPanel 
          chartData={chartData}
          statusCodes={statusCodes}
          isLoading={isLoading}
          currentYear={currentYear}
          currentMonth={currentMonth}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={onDepartmentChange}
        />
      </Suspense>
    </>
  );
};
