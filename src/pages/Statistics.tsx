
import React, { useState } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/statistics';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { toast } from 'sonner';
import { StatisticsFilterPanel } from '@/components/statistics/panels/StatisticsFilterPanel';
import { StatisticsLoadingState } from '@/components/statistics/panels/StatisticsLoadingState';
import { StatisticsTimeoutAlert } from '@/components/statistics/panels/StatisticsTimeoutAlert';
import { StatisticsContent } from '@/components/statistics/panels/StatisticsContent';

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  
  // Use the refactored hook which now provides all needed functionality
  const { 
    chartData, 
    isLoading: statsLoading, 
    loadTimeout,
    refreshData, 
    loadingState
  } = useStatisticsData(
    currentYear, 
    currentMonth, 
    availableStatusCodes,
    selectedDepartment
  );
  
  // List of available departments
  const departments = [
    { value: "all", label: "All departments" },
    { value: "REC", label: "REC" },
    { value: "78", label: "78" },
    { value: "91", label: "91" },
    { value: "92", label: "92" },
    { value: "95", label: "95" },
  ];
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
  };

  const handleRefresh = () => {
    toast.info("Refreshing statistics...");
    console.log("Statistics refresh requested");
    refreshData();
  };

  const handleDepartmentChange = (dept: string) => {
    console.log(`Department changed to: ${dept}`);
    setSelectedDepartment(dept);
    toast.info(`Loading statistics for department: ${dept === 'all' ? 'All' : dept}`);
  };

  // Filter out the 'none' status
  const filteredStatusCodes = availableStatusCodes.filter(code => code !== 'none');
  
  const isLoading = statusesLoading || statsLoading;
  
  // Log component render for debugging
  console.log(`Statistics page rendering. Loading: ${isLoading}, Department: ${selectedDepartment}, Data items: ${chartData?.length || 0}`);
  
  return (
    <StatisticsLayout>
      <div className="flex justify-between items-center mb-4">
        <StatisticsHeader 
          year={currentYear}
          month={currentMonth}
          onMonthChange={handleMonthChange}
        />
        
        <StatisticsFilterPanel
          departments={departments}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={handleDepartmentChange}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
      </div>
      
      {loadTimeout && (
        <StatisticsTimeoutAlert onRetry={handleRefresh} />
      )}
      
      {isLoading ? (
        <StatisticsLoadingState loadingState={loadingState} />
      ) : (
        <StatisticsContent
          chartData={chartData}
          statusCodes={filteredStatusCodes}
          isLoading={isLoading}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          currentYear={currentYear}
          currentMonth={currentMonth}
        />
      )}
    </StatisticsLayout>
  );
};

export default Statistics;
