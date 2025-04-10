
import { useState, useEffect } from 'react';
import { 
  employeeService, 
  statusService, 
  projectService, 
  planningService 
} from '@/services/supabaseServices';
import { Employee, Project, Status } from '@/types';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function usePlanningIndex() {
  const planningData = planningService.getData();
  const [year, setYear] = useState(planningData.year || new Date().getFullYear());
  const [month, setMonth] = useState(planningData.month || new Date().getMonth());
  
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const { isAdmin, isAuthenticated } = useAuth();
  
  const fetchData = () => {
    setIsLoading(true);
    try {
      console.log('Fetching employees data...');
      const employeesData = employeeService.getAll();
      console.log('Employees data fetched:', employeesData);
      setEmployees(employeesData);
      
      const statusesData = statusService.getAll();
      console.log('Statuses data fetched:', statusesData);
      setStatuses(statusesData);
      
      const projectsData = projectService.getAll();
      console.log('Projects data fetched:', projectsData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
    
    // Ajouter un écouteur d'événement pour détecter les changements dans localStorage
    const handleStorageChange = () => {
      fetchData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    planningService.updateMonth(newYear, newMonth);
  };
  
  const handleStatusChange = (
    employeeId: string, 
    date: string, 
    status: string, 
    period: 'AM' | 'PM' | 'FULL',
    isHighlighted?: boolean,
    projectCode?: string
  ) => {
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour modifier le planning');
      return;
    }
    
    try {
      console.log('Changing status:', { employeeId, date, status, period, isHighlighted, projectCode });
      
      const success = employeeService.updateStatus(employeeId, {
        date,
        status,
        period,
        isHighlighted,
        projectCode
      });
      
      if (!success) {
        toast.error('Erreur lors de la mise à jour du statut');
        return;
      }
      
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => {
          if (emp.id !== employeeId) return emp;
          
          const filteredSchedule = emp.schedule.filter(
            ds => ds.date !== date || ds.period !== period
          );
          
          let newSchedule = filteredSchedule;
          if (status) {
            newSchedule = [
              ...filteredSchedule, 
              { 
                date, 
                status, 
                period, 
                highlight: isHighlighted, 
                isHighlighted, // compatibilité
                projectId: projectCode, 
                projectCode // compatibilité
              }
            ];
          }
          
          return { ...emp, schedule: newSchedule };
        })
      );
      toast.success('Statut mis à jour avec succès');
      
      // Déclencher un événement de stockage pour informer les autres onglets
      window.dispatchEvent(new Event('storage'));
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    }
  };

  return {
    year,
    month, 
    employees,
    statuses,
    projects,
    isLoading,
    isAdmin,
    isAuthenticated,
    handleMonthChange,
    handleStatusChange
  };
}
