import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '@/utils/supabase/connection';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

const Admin = () => {
  const [data, setData] = useState({
    projects: [], 
    employees: [],
    statuses: []
  });
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  useEffect(() => {
    const connectToSupabase = async () => {
      setIsLoading(true);
      setConnectionError(null);
      try {
        const isConnected = await checkSupabaseConnection();
        setIsConnected(isConnected);
        
        if (!isConnected) {
          const errorMsg = "Impossible de se connecter à Supabase. Veuillez vérifier votre connexion internet.";
          setConnectionError(errorMsg);
          toast.error(errorMsg);
          setIsLoading(false);
          return;
        }
        
        await fetchAllData();
      } catch (error) {
        console.error('Erreur de connexion inattendue:', error);
        const errorMsg = "Erreur de connexion à Supabase.";
        setConnectionError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    connectToSupabase();
  }, []);

  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      const { data: statusData, error: statusError } = await supabase
        .from('statuts')
        .select('*')
        .order('display_order', { ascending: true });

      if (statusError) throw statusError;

      const { data: employeeData, error: employeeError } = await supabase
        .from('employes')
        .select('*');

      if (employeeError) throw employeeError;

      const projects = [];
      
      setData({
        statuses: statusData?.map(status => ({
          id: status.id,
          code: status.code as StatusCode,
          label: status.libelle,
          color: status.couleur
        })) || [],
        employees: employeeData?.map(emp => ({
          id: emp.id,
          name: emp.nom,
          email: emp.identifiant,
          position: emp.fonction,
          department: emp.departement,
          role: emp.role || 'employee',
          uid: emp.uid,
          schedule: []
        })) || [],
        projects: projects || []
      });

      if (statusData && statusData.length > 0) {
        statusData.forEach((status) => {
          if (status.code) {
            STATUS_LABELS[status.code] = status.libelle;
            STATUS_COLORS[status.code] = status.couleur;
          }
        });
        
        const event = new CustomEvent('statusesUpdated');
        window.dispatchEvent(event);
      }

      toast.success('Données chargées depuis Supabase');
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
      setConnectionError("Erreur lors du chargement des données depuis Supabase");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleProjectsChange = async (projects: any[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
    
    toast.success('Projets sauvegardés');
  };
  
  const handleStatusesChange = async (statuses: any[]) => {
    try {
      setData(prevData => ({
        ...prevData,
        statuses
      }));
      
      if (isConnected) {
        for (const status of statuses) {
          await supabase.from('statuts').upsert({
            id: status.id,
            code: status.code,
            libelle: status.label,
            couleur: status.color,
            display_order: 0
          });
        }
        
        toast.success('Statuts synchronisés avec Supabase');
      } else {
        toast.error("Impossible de synchroniser : connexion à Supabase indisponible");
      }
      
      statuses.forEach((status) => {
        if (status.code) {
          STATUS_LABELS[status.code] = status.label;
          STATUS_COLORS[status.code] = status.color;
        }
      });
      
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Erreur lors de la synchronisation des statuts:', error);
      toast.error('Erreur lors de la synchronisation des statuts');
    }
  };
  
  const handleEmployeesChange = async (employees: any[]) => {
    try {
      setData(prevData => ({
        ...prevData,
        employees
      }));
      
      if (isConnected) {
        for (const employee of employees) {
          await supabase.from('employes').upsert({
            id: employee.id,
            nom: employee.name,
            prenom: '',
            identifiant: employee.email,
            fonction: employee.position,
            departement: employee.department,
            role: employee.role,
            uid: employee.uid
          });
        }
        
        toast.success('Employés synchronisés avec Supabase');
      } else {
        toast.error("Impossible de synchroniser : connexion à Supabase indisponible");
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des employés:', error);
      toast.error('Erreur lors de la synchronisation des employés');
    }
  };
  
  useEffect(() => {
    if (!isConnected) return;
    
    const statusChannel = supabase
      .channel('statuses-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('Changement de statut détecté:', payload);
          toast.info('Données de statut mises à jour sur le serveur, actualisation...');
          fetchAllData();
        }
      )
      .subscribe();
      
    const employeesChannel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employes'
        },
        (payload) => {
          console.log('Changement d\'employé détecté:', payload);
          toast.info('Données d\'employé mises à jour sur le serveur, actualisation...');
          fetchAllData();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, [isConnected]);
  
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      const isConnected = await checkSupabaseConnection();
      setIsConnected(isConnected);
      
      if (isConnected) {
        await fetchAllData();
        toast.success('Données rechargées avec succès depuis Supabase');
      } else {
        const errorMsg = "Impossible de se connecter à Supabase pour recharger les données.";
        setConnectionError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des données:', error);
      const errorMsg = "Erreur lors du rechargement des données.";
      setConnectionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader onRefresh={handleRefresh} isOffline={!isConnected} isLoading={isLoading} />
        
        {connectionError ? (
          <div className="glass-panel p-6 animate-scale-in">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
              <p className="text-muted-foreground mb-4">{connectionError}</p>
              <Button onClick={handleRefresh}>Réessayer</Button>
            </div>
          </div>
        ) : (
          <>
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
          </>
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
