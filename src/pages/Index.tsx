
import React, { Suspense, lazy } from 'react';
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
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';

// Indicateur de chargement pour toute la page
const LoadingPlaceholder = () => (
  <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)]">
    <Loader2 className="h-16 w-16 text-primary animate-spin mb-4" />
    <p className="text-lg text-muted-foreground">Chargement du planning...</p>
  </div>
);

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
  
  // Utiliser useRealtimeSync pour actualiser les données automatiquement
  useRealtimeSync(isOnline, refreshData);
  
  const handleReconnect = () => {
    refreshData();
  };
  
  // Si en cours de chargement initial, afficher un placeholder
  if (loading && (!data.employees || data.employees.length === 0) && (!data.projects || data.projects.length === 0)) {
    return (
      <Layout>
        <LoadingPlaceholder />
      </Layout>
    );
  }
  
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
          
          {loading && <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Chargement des données...
          </div>}
          
          {!loading && loadingSchedules && <div className="text-sm text-muted-foreground flex items-center gap-2">
            <Loader2 className="h-3 w-3 animate-spin" />
            Chargement des emplois du temps...
          </div>}
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
