
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useStatusOptions } from '@/hooks/useStatusOptions';
import { useStatisticsData } from '@/hooks/statistics';
import { StatisticsLayout } from '@/components/statistics/StatisticsLayout';
import { StatisticsHeader } from '@/components/statistics/StatisticsHeader';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy loaded components
const StatisticsTablePanel = lazy(() => 
  import('@/components/statistics/panels/StatisticsTablePanel')
    .then(module => ({ default: module.StatisticsTablePanel }))
);
const StatisticsChartPanel = lazy(() => 
  import('@/components/statistics/panels/StatisticsChartPanel')
    .then(module => ({ default: module.StatisticsChartPanel }))
);

const Statistics = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  
  const { statuses: availableStatusCodes, isLoading: statusesLoading } = useStatusOptions();
  const { 
    chartData, 
    isLoading: statsLoading, 
    loadTimeout,
    refreshData, 
    loadingDetails 
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
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Select
              value={selectedDepartment}
              onValueChange={handleDepartmentChange}
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem key={dept.value} value={dept.value}>
                    {dept.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </>
            )}
          </Button>
        </div>
      </div>
      
      {loadTimeout && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <p>The data is taking longer than expected to load. You can continue waiting or try refreshing.</p>
          </div>
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}
      
      {isLoading ? (
        <>
          <Card className="mb-4">
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-2">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-6 w-24 ml-auto" />
              </div>
              <div className="w-full h-[400px] rounded-md bg-muted/20 flex items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading statistics... {loadingState}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-24 ml-auto" />
              </div>
              <div className="space-y-2">
                <div className="flex space-x-3 items-center">
                  <Skeleton className="h-6 w-36" />
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-6 w-16" />
                  ))}
                </div>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex space-x-3 items-center">
                    <Skeleton className="h-6 w-36" />
                    {[1, 2, 3, 4, 5].map(j => (
                      <Skeleton key={j} className="h-6 w-16" />
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <Suspense fallback={
            <div className="w-full h-[200px] rounded-md bg-muted/20 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading table...</span>
            </div>
          }>
            <StatisticsTablePanel 
              chartData={chartData}
              statusCodes={filteredStatusCodes}
              isLoading={isLoading}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
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
              statusCodes={filteredStatusCodes}
              isLoading={isLoading}
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={setSelectedDepartment}
            />
          </Suspense>
        </>
      )}
    </StatisticsLayout>
  );
};

export default Statistics;
