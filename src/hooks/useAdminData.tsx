
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { STATUS_LABELS, STATUS_COLORS } from '@/types';

export const useAdminData = (isConnected: boolean) => {
  const [data, setData] = useState({
    projects: [],
    employees: [],
    statuses: []
  });

  const fetchAllData = async () => {
    try {
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
          code: status.code,
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
        statusData.forEach(status => {
          if (status.code) {
            STATUS_LABELS[status.code] = status.libelle;
            STATUS_COLORS[status.code] = status.couleur;
          }
        });
        
        const event = new CustomEvent('statusesUpdated');
        window.dispatchEvent(event);
      }

      toast.success('Données chargées depuis Supabase');
      return true;
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
      throw error;
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
      
      statuses.forEach(status => {
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

  return {
    data,
    fetchAllData,
    handleProjectsChange,
    handleStatusesChange,
    handleEmployeesChange
  };
};
