
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { generateId } from '@/utils';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminTabs } from '@/components/admin/AdminTabs';
import { RealtimeMonitor } from '@/components/RealtimeMonitor';
import { supabase } from '@/integrations/supabase/client';
import { checkSupabaseConnection } from '@/utils/supabase';

const Admin = () => {
  const [data, setData] = useState({
    projects: [], 
    employees: [],
    statuses: []
  });
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fonction pour se connecter à Supabase
  useEffect(() => {
    const connectToSupabase = async () => {
      setIsLoading(true);
      try {
        const isConnected = await checkSupabaseConnection();
        setIsConnected(isConnected);
        
        if (isConnected) {
          // Charger toutes les données depuis Supabase
          await fetchAllData();
        } else {
          // Charger depuis localStorage si la connexion échoue
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Erreur de connexion inattendue:', error);
        toast.error('Erreur de connexion à Supabase, chargement des données locales');
        loadFromLocalStorage();
      } finally {
        setIsLoading(false);
      }
    };

    connectToSupabase();
  }, []);

  // Fonction pour récupérer toutes les données depuis Supabase
  const fetchAllData = async () => {
    try {
      setIsLoading(true);
      
      // 1. Récupérer les statuts
      const { data: statusData, error: statusError } = await supabase
        .from('statuts')
        .select('*')
        .order('display_order', { ascending: true });

      if (statusError) throw statusError;

      // 2. Récupérer les employés
      const { data: employeeData, error: employeeError } = await supabase
        .from('employes')
        .select('*');

      if (employeeError) throw employeeError;

      // 3. Récupérer les projets (à implémenter côté Supabase)
      // Pour l'instant, nous utilisons les projets stockés localement
      const savedData = localStorage.getItem('planningData');
      const localData = savedData ? JSON.parse(savedData) : { projects: [] };
      
      // Mise à jour des données
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
        projects: localData.projects || []
      });

      // Mettre à jour les STATUS_LABELS et STATUS_COLORS globaux
      if (statusData && statusData.length > 0) {
        statusData.forEach((status) => {
          if (status.code) {
            // @ts-ignore - Mise à jour dynamique
            STATUS_LABELS[status.code] = status.libelle;
            // @ts-ignore - Mise à jour dynamique
            STATUS_COLORS[status.code] = status.couleur;
          }
        });
        
        // Déclencher un événement personnalisé pour informer les autres composants
        const event = new CustomEvent('statusesUpdated');
        window.dispatchEvent(event);
      }

      toast.success('Données chargées depuis Supabase');
      
      // Sauvegarde locale pour le mode hors ligne
      localStorage.setItem('planningData', JSON.stringify({
        ...localData,
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
        statuses: statusData?.map(status => ({
          id: status.id,
          code: status.code,
          label: status.libelle,
          color: status.couleur
        })) || []
      }));
      
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour charger les données depuis le localStorage
  const loadFromLocalStorage = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const localData = JSON.parse(savedData);
        
        setData({
          projects: localData.projects || [],
          employees: localData.employees || [],
          statuses: localData.statuses || []
        });
        
        // Mettre à jour les STATUS_LABELS et STATUS_COLORS globaux
        if (localData.statuses && localData.statuses.length > 0) {
          localData.statuses.forEach((status: any) => {
            if (status.code) {
              // @ts-ignore - Mise à jour dynamique
              STATUS_LABELS[status.code] = status.label;
              // @ts-ignore - Mise à jour dynamique
              STATUS_COLORS[status.code] = status.color;
            }
          });
          
          // Déclencher un événement personnalisé pour informer les autres composants
          const event = new CustomEvent('statusesUpdated');
          window.dispatchEvent(event);
        }
        
        toast.info('Données chargées depuis le cache local');
      } else {
        toast.warning('Aucune donnée en cache');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données depuis localStorage:', error);
      toast.error('Erreur lors du chargement des données locales');
    }
  };
  
  const handleProjectsChange = async (projects: any[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
    
    // Sauvegarder les projets dans localStorage
    const savedData = localStorage.getItem('planningData');
    const localData = savedData ? JSON.parse(savedData) : {};
    
    localStorage.setItem('planningData', JSON.stringify({
      ...localData,
      projects
    }));
    
    toast.success('Projets sauvegardés localement');
  };
  
  const handleStatusesChange = async (statuses: any[]) => {
    try {
      // Mise à jour locale des données
      setData(prevData => ({
        ...prevData,
        statuses
      }));
      
      if (isConnected) {
        // Synchroniser avec Supabase
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
        toast.warning('Mode hors ligne: Statuts sauvegardés localement uniquement');
      }
      
      // Mettre à jour les STATUS_LABELS et STATUS_COLORS globaux
      statuses.forEach((status) => {
        if (status.code) {
          // @ts-ignore - Mise à jour dynamique
          STATUS_LABELS[status.code] = status.label;
          // @ts-ignore - Mise à jour dynamique
          STATUS_COLORS[status.code] = status.color;
        }
      });
      
      // Sauvegarder les statuts dans localStorage
      const savedData = localStorage.getItem('planningData');
      const localData = savedData ? JSON.parse(savedData) : {};
      
      localStorage.setItem('planningData', JSON.stringify({
        ...localData,
        statuses
      }));
      
      // Déclencher un événement personnalisé pour informer les autres composants
      const event = new CustomEvent('statusesUpdated');
      window.dispatchEvent(event);
    } catch (error) {
      console.error('Erreur lors de la synchronisation des statuts:', error);
      toast.error('Erreur lors de la synchronisation des statuts');
    }
  };
  
  const handleEmployeesChange = async (employees: any[]) => {
    try {
      // Mise à jour locale des données
      setData(prevData => ({
        ...prevData,
        employees
      }));
      
      if (isConnected) {
        // Synchroniser avec Supabase
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
        toast.warning('Mode hors ligne: Employés sauvegardés localement uniquement');
      }
      
      // Sauvegarder les employés dans localStorage
      const savedData = localStorage.getItem('planningData');
      const localData = savedData ? JSON.parse(savedData) : {};
      
      localStorage.setItem('planningData', JSON.stringify({
        ...localData,
        employees
      }));
    } catch (error) {
      console.error('Erreur lors de la synchronisation des employés:', error);
      toast.error('Erreur lors de la synchronisation des employés');
    }
  };
  
  // Effet pour écouter les changements en temps réel de Supabase
  useEffect(() => {
    if (!isConnected) return;
    
    // S'abonner aux changements de statuts
    const statusChannel = supabase
      .channel('statuses-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'statuts'
        },
        (payload) => {
          console.log('Changement de statut détecté:', payload);
          // Recharger les données après un changement
          fetchAllData();
        }
      )
      .subscribe();
      
    // S'abonner aux changements d'employés
    const employeesChannel = supabase
      .channel('employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Écouter tous les événements (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'employes'
        },
        (payload) => {
          console.log('Changement d\'employé détecté:', payload);
          // Recharger les données après un changement
          fetchAllData();
        }
      )
      .subscribe();
      
    return () => {
      // Nettoyer les abonnements
      supabase.removeChannel(statusChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, [isConnected]);
  
  // Initialiser les statuts par défaut si nécessaire
  useEffect(() => {
    if (!data.statuses || data.statuses.length === 0) {
      const defaultStatuses = Object.entries(STATUS_LABELS)
        .filter(([code]) => code !== '')
        .map(([code, label]) => ({
          id: generateId(),
          code: code as StatusCode,
          label,
          color: STATUS_COLORS[code as StatusCode]
        }));
      
      setData(prevData => ({
        ...prevData,
        statuses: defaultStatuses
      }));
    }
  }, [data.statuses]);
  
  // Fonction pour forcer un rechargement des données
  const handleRefresh = async () => {
    try {
      setIsLoading(true);
      const isConnected = await checkSupabaseConnection();
      setIsConnected(isConnected);
      
      if (isConnected) {
        await fetchAllData();
        toast.success('Données rechargées avec succès depuis Supabase');
      } else {
        loadFromLocalStorage();
        toast.warning('Mode hors ligne: données chargées depuis le cache local');
      }
    } catch (error) {
      console.error('Erreur lors du rechargement des données:', error);
      toast.error('Erreur lors du rechargement des données');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader onRefresh={handleRefresh} isOffline={!isConnected} isLoading={isLoading} />
        
        <RealtimeMonitor />
        
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
      </div>
    </Layout>
  );
};

export default Admin;
