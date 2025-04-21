
import React, { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { AdminError } from '@/components/admin/AdminError';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { useAdminData } from '@/hooks/useAdminData';
import { useRealtimeSync } from '@/hooks/useRealtimeSync';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

const Admin = () => {
  const { isConnected, isLoading, connectionError, checkConnection, setConnectionError, setIsLoading } = useSupabaseConnection();
  const { data, fetchAllData, handleProjectsChange, handleStatusesChange, handleEmployeesChange } = useAdminData(isConnected);
  
  useRealtimeSync(isConnected, fetchAllData);

  useEffect(() => {
    const initialize = async () => {
      const isConnected = await checkConnection();
      if (isConnected) {
        try {
          await fetchAllData();
        } catch (error) {
          setConnectionError("Erreur lors du chargement des données depuis Supabase");
        }
      }
    };

    initialize();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      const isConnected = await checkConnection();
      if (isConnected) {
        await fetchAllData();
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des données:', error);
      setConnectionError("Erreur lors du rechargement des données.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader onRefresh={handleRefresh} isOffline={!isConnected} isLoading={isLoading} />
        
        {connectionError ? (
          <AdminError error={connectionError} onRetry={handleRefresh} />
        ) : (
          <AdminTabs 
            projects={data.projects || []}
            employees={data.employees || []}
            statuses={data.statuses || []}
            onProjectsChange={handleProjectsChange}
            onStatusesChange={handleStatusesChange}
            onEmployeesChange={handleEmployeesChange}
            isLoading={isLoading}
            isConnected={isConnected}
          />
        )}
        
        <AlertDialog open={!isConnected && !isLoading}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Connexion perdue à Supabase</AlertDialogTitle>
              <AlertDialogDescription>
                La connexion avec la base de données a été perdue. Vérifiez votre connexion internet et réessayez.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end">
              <Button onClick={handleRefresh}>Réessayer</Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Admin;
