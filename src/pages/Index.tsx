
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { PlanningGridEnhanced } from '@/components/calendar/PlanningGridEnhanced';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { planningService, projectService } from '@/services/jsonStorage';
import { employeeService, statusService } from '@/services/supabaseServices';
import { useAuth } from '@/contexts/AuthContext';
import { Employee, Project, Status } from '@/types';
import { toast } from 'sonner';

const Index = () => {
  // Get current month and year from planning service or default to current date
  const planningData = planningService.getData();
  const [year, setYear] = useState(planningData.year || new Date().getFullYear());
  const [month, setMonth] = useState(planningData.month || new Date().getMonth());
  
  // Get employees, projects and statuses
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Get authentication context to check if user is admin
  const { isAdmin, isAuthenticated } = useAuth();
  
  // Charger les employés et les statuts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching employees data...');
        const employeesData = await employeeService.getAll();
        console.log('Employees data fetched:', employeesData);
        setEmployees(employeesData);
        
        const statusesData = await statusService.getAll();
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
    
    fetchData();
  }, []);
  
  // Handle month change
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    planningService.updateMonth(newYear, newMonth);
  };
  
  // Handle status change
  const handleStatusChange = async (
    employeeId: string, 
    date: string, 
    status: string, 
    period: 'AM' | 'PM' | 'FULL',
    isHighlighted?: boolean,
    projectCode?: string
  ) => {
    // Only allow status change if user is authenticated
    if (!isAuthenticated) {
      toast.error('Vous devez être connecté pour modifier le planning');
      return;
    }
    
    try {
      console.log('Changing status:', { employeeId, date, status, period, isHighlighted, projectCode });
      
      // Mettre à jour dans Supabase
      const success = await employeeService.updateStatus(employeeId, {
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
      
      // Mettre à jour la liste locale
      setEmployees(prevEmployees => 
        prevEmployees.map(emp => {
          if (emp.id !== employeeId) return emp;
          
          // Filtrer les statuts existants pour cette date/période
          const filteredSchedule = emp.schedule.filter(
            ds => ds.date !== date || ds.period !== period
          );
          
          // Si le statut n'est pas vide, ajouter le nouvel état
          let newSchedule = filteredSchedule;
          if (status) {
            newSchedule = [
              ...filteredSchedule, 
              { date, status, period, isHighlighted, projectCode }
            ];
          }
          
          return { ...emp, schedule: newSchedule };
        })
      );
      toast.success('Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue');
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <p>Chargement du planning...</p>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h1 className="text-2xl font-bold">Planning</h1>
          <div className="flex items-center gap-2">
            {!isAuthenticated && (
              <Link to="/login" className="bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-2 rounded-md text-sm">
                Se connecter
              </Link>
            )}
            {isAdmin && (
              <Link to="/init" className="text-sm text-muted-foreground hover:text-primary">
                Initialisation/Migration
              </Link>
            )}
            <MonthSelector 
              year={year} 
              month={month} 
              onChange={handleMonthChange}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-md">
          {employees.length === 0 ? (
            <div className="p-4 text-center">
              <p>Aucun employé trouvé. {isAdmin ? 'Veuillez ajouter des employés depuis la page Employés.' : 'Contactez votre administrateur.'}</p>
              {isAdmin && (
                <Link to="/employees" className="text-primary hover:underline mt-2 inline-block">
                  Aller à la page Employés
                </Link>
              )}
            </div>
          ) : (
            <PlanningGridEnhanced
              year={year}
              month={month}
              employees={employees}
              projects={projects}
              statuses={statuses}
              onStatusChange={handleStatusChange}
              isAdmin={isAuthenticated && isAdmin}
            />
          )}
          
          {!isAuthenticated && (
            <div className="p-4 bg-muted/20 text-center border-t">
              <p>Vous consultez le planning en mode lecture seule. Pour apporter des modifications, veuillez vous connecter.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Index;
