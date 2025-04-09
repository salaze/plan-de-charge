
import React, { useState, useEffect } from 'react';
import { PlanningGrid } from './PlanningGrid';
import { LegendModal } from './LegendModal';
import { Employee, Project, Status } from '@/types';

// Define the showLegendModal function to the global window object
declare global {
  interface Window {
    showLegendModal?: () => void;
  }
}

interface PlanningGridEnhancedProps {
  year: number;
  month: number;
  employees: Employee[];
  projects: Project[];
  statuses: Status[];
  onStatusChange: (
    employeeId: string,
    date: string,
    status: string,
    period: 'AM' | 'PM' | 'FULL',
    isHighlighted?: boolean,
    projectCode?: string
  ) => void;
  isAdmin: boolean;
}

export function PlanningGridEnhanced({
  year,
  month,
  employees,
  projects,
  statuses,
  onStatusChange,
  isAdmin
}: PlanningGridEnhancedProps) {
  const [legendModalOpen, setLegendModalOpen] = useState(false);
  
  console.log(`PlanningGridEnhanced: year=${year}, month=${month}, employees=${employees?.length || 0}`);
  console.log('Employees data in PlanningGridEnhanced:', employees);

  // Initialize the window.showLegendModal function
  useEffect(() => {
    // Make sure we initialize it only once
    window.showLegendModal = () => {
      setLegendModalOpen(true);
    };
    
    // Cleanup function to prevent memory leaks
    return () => {
      if (window.showLegendModal === (() => setLegendModalOpen(true))) {
        window.showLegendModal = undefined;
      }
    };
  }, []);

  if (!employees) {
    console.log('No employees data provided to PlanningGridEnhanced');
    return (
      <div className="p-4 text-center">
        <p>Erreur: Aucune donnée d'employés n'a été fournie.</p>
      </div>
    );
  }

  if (employees.length === 0) {
    console.log('Empty employees array in PlanningGridEnhanced');
    return (
      <div className="p-4 text-center">
        <p>Aucun employé à afficher dans le planning.</p>
      </div>
    );
  }

  return (
    <>
      <PlanningGrid
        year={year}
        month={month}
        employees={employees}
        projects={projects}
        statuses={statuses}
        onStatusChange={onStatusChange}
        isAdmin={isAdmin}
      />

      <LegendModal 
        isOpen={legendModalOpen} 
        onClose={() => setLegendModalOpen(false)} 
        projects={projects} 
        statuses={statuses}
      />
    </>
  );
}
