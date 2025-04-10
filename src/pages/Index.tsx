
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { PlanningHeader } from '@/components/planning/PlanningHeader';
import { PlanningContent } from '@/components/planning/PlanningContent';
import { LoadingState } from '@/components/planning/LoadingState';
import { usePlanningIndex } from '@/hooks/usePlanningIndex';

const Index = () => {
  const {
    year,
    month,
    employees,
    statuses,
    projects,
    isLoading,
    isAdmin,
    isAuthenticated,
    handleMonthChange,
    handleStatusChange
  } = usePlanningIndex();
  
  if (isLoading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex flex-col">
        <PlanningHeader
          isAuthenticated={isAuthenticated}
          isAdmin={isAdmin}
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
        />
        
        <PlanningContent
          employees={employees}
          projects={projects}
          statuses={statuses}
          year={year}
          month={month}
          isAdmin={isAdmin}
          isAuthenticated={isAuthenticated}
          onStatusChange={handleStatusChange}
        />
      </div>
    </Layout>
  );
};

export default Index;
