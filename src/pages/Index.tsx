
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { LegendModal } from '@/components/calendar/LegendModal';
import { PlanningToolbar } from '@/components/planning/PlanningToolbar';
import { usePlanningState } from '@/hooks/usePlanningState';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

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
    handleFiltersChange
  } = usePlanningState();
  
  const handleReconnect = () => {
    window.location.reload();
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <PlanningToolbar 
          year={currentYear}
          month={currentMonth}
          isAdmin={isAdmin}
          employees={originalData.employees || []}
          projects={originalData.projects || []}
          filters={filters}
          onMonthChange={handleMonthChange}
          onShowLegend={() => setIsLegendOpen(true)}
          onFiltersChange={handleFiltersChange}
        />
        
        {connectionError ? (
          <div className="glass-panel p-6 animate-scale-in">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
              <p className="text-muted-foreground mb-4">{connectionError}</p>
              <Button onClick={handleReconnect}>Réessayer</Button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-1 md:p-4 animate-scale-in overflow-x-auto">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : (
              <PlanningGrid 
                year={currentYear} 
                month={currentMonth} 
                employees={data.employees || []}
                projects={data.projects || []}
                onStatusChange={handleStatusChange}
                isAdmin={isAdmin}
              />
            )}
          </div>
        )}
        
        <LegendModal 
          isOpen={isLegendOpen}
          onClose={() => setIsLegendOpen(false)}
          projects={data.projects || []}
        />
        
        <AlertDialog open={!isOnline && !loading && !connectionError}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Connexion perdue à Supabase</AlertDialogTitle>
              <AlertDialogDescription>
                La connexion avec la base de données a été perdue. L'application ne peut pas fonctionner sans connexion internet. Vérifiez votre réseau et réessayez.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button onClick={handleReconnect}>Reconnecter</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Index;
