
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
    isOnline,
    connectionError,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange,
    refreshData
  } = usePlanningState();
  
  const { isStatusDialogOpenRef, handleStatusDialogChange } = useStatusDialogTracker(refreshData);
  
  const handleReconnect = () => {
    window.location.reload();
  };
  
  return (
    <Layout>
      <div className="flex flex-col h-full w-full animate-fade-in">
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
        
        {connectionError ? (
          <ConnectionError
            errorMessage={connectionError}
            onRefresh={handleReconnect}
          />
        ) : (
          <div className="glass-panel p-1 md:p-4 animate-scale-in flex-1 overflow-hidden">
            <PlanningContent
              loading={loading}
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
