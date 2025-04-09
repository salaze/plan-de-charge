
import { useState, useEffect } from 'react';
import { Employee, Status, Project } from '@/types';
import { 
  employeeService, 
  statusService,
  projectService 
} from '@/services/supabaseServices';

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

  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Récupérer les projets du localStorage
      const projects = projectService.getAll();
      
      // Récupérer les employés du localStorage (via le service réexporté)
      const employees = employeeService.getAll();
      
      // Récupérer les statuts du localStorage (via le service réexporté)
      const statuses = statusService.getAll();
      
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
  
  // Charger les données au démarrage
  useEffect(() => {
    fetchData();
  }, []);

  const handleProjectsChange = (projects: Project[]) => {
    // Sauvegarde des projets
    projects.forEach(project => {
      if (projectService.getById(project.id)) {
        projectService.update(project);
      } else {
        projectService.create(project);
      }
    });
    
    // Suppression des projets qui ne sont plus présents
    const currentProjects = projectService.getAll();
    const projectIds = projects.map(p => p.id);
    currentProjects.forEach(project => {
      if (!projectIds.includes(project.id)) {
        projectService.delete(project.id);
      }
    });
    
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleStatusesChange = (statuses: Status[]) => {
    // Mise à jour des statuts
    setData(prevData => ({
      ...prevData,
      statuses
    }));
  };
  
  const handleEmployeesChange = (employees: Employee[]) => {
    // Mise à jour des employés
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
