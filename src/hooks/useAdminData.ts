
import { useState, useEffect } from 'react';
import { Employee, Status, Project } from '@/types';
import { 
  employeeService, 
  statusService 
} from '@/services/supabaseServices';
import { projectService } from '@/services/jsonStorage';

interface AdminData {
  projects: Project[];
  employees: Employee[];
  statuses: Status[];
}

export function useAdminData() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<AdminData>({
    projects: [],
    employees: [],
    statuses: []
  });

  // Charger les données au démarrage
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Les projets restent dans le localStorage pour l'instant
        const projects = projectService.getAll();
        
        // Récupérer les employés de Supabase
        const employees = await employeeService.getAll();
        
        // Récupérer les statuts de Supabase
        const statuses = await statusService.getAll();
        
        setData({
          projects,
          employees,
          statuses
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleProjectsChange = (projects: Project[]) => {
    // Sauvegarder dans localStorage (inchangé)
    projectService.saveAll(projects);
    
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleStatusesChange = async (statuses: Status[]) => {
    // Nous n'implémentons pas de mise à jour en masse ici,
    // car les mises à jour sont gérées individuellement 
    // dans les composants via les services
    setData(prevData => ({
      ...prevData,
      statuses
    }));
  };
  
  const handleEmployeesChange = async (employees: Employee[]) => {
    // Nous n'implémentons pas de mise à jour en masse ici,
    // car les mises à jour sont gérées individuellement
    // dans les composants via les services
    setData(prevData => ({
      ...prevData,
      employees
    }));
  };

  return {
    data,
    isLoading,
    handleProjectsChange,
    handleStatusesChange,
    handleEmployeesChange
  };
}
