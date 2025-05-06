
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { LegendModal } from '@/components/calendar/LegendModal';
import { usePlanningState } from '@/hooks/usePlanningState';
import { useAuth } from '@/contexts/AuthContext';
import { PlanningHeader } from '@/components/planning/PlanningHeader';
import { PlanningContent } from '@/components/planning/PlanningContent';
import { ConnectionError } from '@/components/planning/ConnectionError';
import { DisconnectionAlert } from '@/components/planning/DisconnectionAlert';
import { useStatusDialogTracker } from '@/hooks/planning/useStatusDialogTracker';
import { DepartmentSelector } from '@/components/planning/DepartmentSelector';

const Index = () => {
  const { isAdmin } = useAuth();
  const {
    data,
    originalData,
    currentYear,
    currentMonth,
    filters,
    isLegendOpen,
    loading,
    loadingSchedules,
    isOnline,
    connectionError,
    selectedDepartment,
    allDepartments,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange,
    handleDepartmentChange,
    refreshData
  } = usePlanningState();
  
  const { isStatusDialogOpenRef, handleStatusDialogChange } = useStatusDialogTracker(refreshData);
  
  const handleReconnect = () => {
    window.location.reload();
  };
  
  return (
    <Layout>
      <div className="space-y-4 animate-fade-in h-[calc(100vh-80px)] flex flex-col">
        <PlanningHeader
          year={currentYear}
          month={currentMonth}
          isAdmin={isAdmin}
          employees={originalData.employees || []}
          projects={originalData.projects || []}
          filters={filters}
          loading={loading}
          isStatusDialogOpen={isStatusDialogOpenRef.current}
          onMonthChange={handleMonthChange}
          onShowLegend={() => setIsLegendOpen(true)}
          onFiltersChange={handleFiltersChange}
          onRefresh={refreshData}
        />
        
        <div className="flex items-center justify-between">
          <DepartmentSelector 
            departments={allDepartments}
            selectedDepartment={selectedDepartment}
            onDepartmentChange={handleDepartmentChange}
            isLoading={loading}
          />
          
          {loading && <div className="text-sm text-muted-foreground">Chargement des données...</div>}
        </div>
        
        {connectionError ? (
          <ConnectionError
            errorMessage={connectionError}
            onRefresh={handleReconnect}
          />
        ) : (
          <div className="glass-panel p-1 md:p-4 animate-scale-in flex-1 overflow-hidden">
            <PlanningContent
              loading={loading}
              loadingSchedules={loadingSchedules}
              employees={data.employees || []}
              projects={data.projects || []}
              year={currentYear}
              month={currentMonth}
              isAdmin={isAdmin}
              onStatusChange={handleStatusChange}
              onStatusDialogChange={handleStatusDialogChange}
            />
          </div>
        )}
        
        <LegendModal 
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
          projects={data.projects || []}
        />
        
        <DisconnectionAlert
          isOpen={!isOnline && !loading && !connectionError}
          onReconnect={handleReconnect}
        />
      </div>
    </Layout>
  );
};

export default Index;
