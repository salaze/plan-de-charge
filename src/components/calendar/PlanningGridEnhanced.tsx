
import React, { useState, useEffect } from 'react';
import { PlanningGrid } from './PlanningGrid';
import { LegendModal } from './LegendModal';
import { Employee, Project, Status } from '@/types';

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

  // Hook pour intercepter l'ouverture de la LegendModal dans le PlanningGrid
  // et afficher notre propre modal à la place
  useEffect(() => {
    // Méthode originale qui sera appelée par PlanningGrid
    const originalShowModal = window.showLegendModal;
    
    // On redéfinit la méthode pour afficher notre modal avec les statuts
    window.showLegendModal = () => {
      setLegendModalOpen(true);
    };
    
    // Nettoyage au démontage
    return () => {
      window.showLegendModal = originalShowModal;
    };
  }, []);

  return (
    <>
      <PlanningGrid
        year={year}
        month={month}
        employees={employees}
        projects={projects}
        onStatusChange={onStatusChange}
        isAdmin={isAdmin}
      />

      {/* Notre modal de légende personnalisée avec statuts */}
      <LegendModal 
        isOpen={legendModalOpen} 
        onClose={() => setLegendModalOpen(false)} 
        projects={projects} 
        statuses={statuses}
      />
    </>
  );
}
