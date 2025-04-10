
import React from 'react';
import { Link } from 'react-router-dom';
import { PlanningGridEnhanced } from '@/components/calendar/PlanningGridEnhanced';
import { Employee, Project, Status } from '@/types';

interface PlanningContentProps {
  employees: Employee[];
  projects: Project[];
  statuses: Status[];
  year: number;
  month: number;
  isAdmin: boolean;
  isAuthenticated: boolean;
  onStatusChange: (
    employeeId: string,
    date: string,
    status: string,
    period: 'AM' | 'PM' | 'FULL',
    isHighlighted?: boolean,
    projectCode?: string
  ) => void;
}

export function PlanningContent({
  employees,
  projects,
  statuses,
  year,
  month,
  isAdmin,
  isAuthenticated,
  onStatusChange
}: PlanningContentProps) {
  return (
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
          onStatusChange={onStatusChange}
          isAdmin={isAuthenticated && isAdmin}
        />
      )}
      
      {!isAuthenticated && (
        <div className="p-4 bg-muted/20 text-center border-t">
          <p>Vous consultez le planning en mode lecture seule. Pour apporter des modifications, veuillez vous connecter.</p>
        </div>
      )}
    </div>
  );
}
