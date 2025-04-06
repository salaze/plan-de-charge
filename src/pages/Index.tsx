
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { planningService, projectService } from '@/services/jsonStorage';
import { employeeService } from '@/services/supabaseServices';
import { useAuth } from '@/contexts/AuthContext';
import { Employee, Project } from '@/types';
import { toast } from 'sonner';

const Index = () => {
  // Get current month and year from planning service or default to current date
  const planningData = planningService.getData();
  const [year, setYear] = useState(planningData.year || new Date().getFullYear());
  const [month, setMonth] = useState(planningData.month || new Date().getMonth());
  
  // Get employees and projects
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const projects = projectService.getAll();
  
  // Get authentication context to check if user is admin
  const { isAdmin } = useAuth();
  
  // Charger les employés
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoading(true);
      try {
        const data = await employeeService.getAll();
        setEmployees(data);
      } catch (error) {
        console.error('Erreur lors du chargement des employés:', error);
        toast.error('Erreur lors du chargement des employés');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmployees();
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
    try {
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
            <Link to="/init" className="text-sm text-muted-foreground hover:text-primary">
              Initialisation/Migration
            </Link>
            <MonthSelector 
              year={year} 
              month={month} 
              onChange={handleMonthChange}
            />
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-md">
          <PlanningGrid
            year={year}
            month={month}
            employees={employees}
            projects={projects}
            onStatusChange={handleStatusChange}
            isAdmin={isAdmin}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
