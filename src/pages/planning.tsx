
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePlanningData } from '@/hooks/usePlanningData';
import { PlanningNavigator } from '@/components/planning/PlanningNavigator';
import { PlanningTable } from '@/components/planning/PlanningTable';
import { StatusLegend } from '@/components/planning/StatusLegend';

export default function Planning() {
  const {
    employees,
    projects,
    statuses,
    currentMonth,
    currentYear,
    loading,
    handlePrevMonth,
    handleNextMonth,
    handleToday
  } = usePlanningData();

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">Planning</h1>
          <p className="text-muted-foreground">Consultez et gérez le planning des employés</p>
        </div>
        <PlanningNavigator 
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/50 p-2">
          <CardTitle className="text-lg">Planning des employés</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <PlanningTable 
            employees={employees}
            projects={projects}
            statuses={statuses}
            currentMonth={currentMonth}
            currentYear={currentYear}
          />
        </CardContent>
      </Card>

      <StatusLegend statuses={statuses} />
    </div>
  );
}
