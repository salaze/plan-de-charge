
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { PlanningGrid } from '@/components/calendar/PlanningGrid';
import { MonthSelector } from '@/components/calendar/MonthSelector';
import { planningService, employeeService, projectService } from '@/services/jsonStorage';
import { useAuth } from '@/contexts/AuthContext';

// Page d'accueil principale
const Index = () => {
  // Get current month and year from planning service or default to current date
  const planningData = planningService.getData();
  const [year, setYear] = useState(planningData.year || new Date().getFullYear());
  const [month, setMonth] = useState(planningData.month || new Date().getMonth());
  
  // Get employees and projects
  const employees = employeeService.getAll();
  const projects = projectService.getAll();
  
  // Get authentication context to check if user is admin
  const { isAdmin } = useAuth();
  
  // Handle month change
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    planningService.updateMonth(newYear, newMonth);
  };
  
  // Handle status change
  const handleStatusChange = (
    employeeId: string, 
    date: string, 
    status: string, 
    period: 'AM' | 'PM' | 'FULL',
    isHighlighted?: boolean,
    projectCode?: string
  ) => {
    employeeService.updateStatus(employeeId, {
      date,
      status,
      period,
      isHighlighted,
      projectCode
    });
  };
  
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
