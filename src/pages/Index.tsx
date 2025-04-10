
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { LegendModal } from '@/components/calendar/LegendModal';
import { PlanningToolbar } from '@/components/planning/PlanningToolbar';
import { usePlanningState } from '@/hooks/usePlanningState';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAdmin } = useAuth();
  const {
    data,
    currentYear,
    currentMonth,
    isLegendOpen,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange
  } = usePlanningState();
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <PlanningToolbar 
          year={currentYear}
          month={currentMonth}
          isAdmin={isAdmin}
          onMonthChange={handleMonthChange}
          onShowLegend={() => setIsLegendOpen(true)}
        />
        
        <div className="glass-panel p-1 md:p-4 animate-scale-in overflow-x-auto">
          <PlanningGrid 
            year={currentYear} 
            month={currentMonth} 
            employees={data.employees || []}
            projects={data.projects || []}
            onStatusChange={handleStatusChange}
            isAdmin={isAdmin}
          />
        </div>
        
        <LegendModal 
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
          projects={data.projects || []}
        />
      </div>
    </Layout>
  );
};

export default Index;
