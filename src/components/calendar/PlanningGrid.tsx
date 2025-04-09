
import React, { useState, useEffect } from 'react';
import { StatusSelectorEnhanced } from './StatusSelectorEnhanced';
import { Employee, Project, Status } from '@/types';
import { usePlanningCalendar } from '@/hooks/usePlanningCalendar';
import { PlanningGridHeader } from './grid/PlanningGridHeader';
import { EmployeeRow } from './grid/EmployeeRow';

interface PlanningGridProps {
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

export function PlanningGrid({
  year,
  month,
  employees,
  projects,
  statuses,
  onStatusChange,
  isAdmin
}: PlanningGridProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'AM' | 'PM' | 'FULL'>('FULL');
  const [statusSelectorOpen, setStatusSelectorOpen] = useState(false);
  
  console.log(`PlanningGrid: Rendering for ${year}-${month+1}`);
  console.log(`PlanningGrid: Received employees count: ${employees?.length || 0}`);
  const { days, formatDate } = usePlanningCalendar(year, month);
  console.log(`PlanningGrid: Got ${days?.length || 0} days from usePlanningCalendar`);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedEmployee(null);
    setStatusSelectorOpen(false);
  }, [month, year]);

  // Add debugging for employees data
  useEffect(() => {
    console.log('PlanningGrid - Employees data:', employees);
  }, [employees]);

  const handleCellClick = (employeeId: string, date: Date, period: 'AM' | 'PM' | 'FULL') => {
    if (!isAdmin) return; // Disallow cell clicks if not admin

    setSelectedDate(date);
    setSelectedEmployee(employeeId);
    setSelectedPeriod(period);
    setStatusSelectorOpen(true);
  };

  const handleStatusSelect = (
    status: string,
    isHighlighted: boolean = false,
    projectCode?: string
  ) => {
    if (selectedDate && selectedEmployee) {
      onStatusChange(
        selectedEmployee,
        formatDate(selectedDate),
        status,
        selectedPeriod,
        isHighlighted,
        projectCode
      );
    }
    setStatusSelectorOpen(false);
  };

  const handleShowLegend = () => {
    if (window.showLegendModal) {
      window.showLegendModal();
    }
  };

  if (!employees || employees.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md bg-muted/20">
        <p>Aucun employé à afficher. Veuillez ajouter des employés depuis la page Employés.</p>
      </div>
    );
  }

  return (
    <div className="overflow-auto">
      <div className="min-w-[800px]">
        <PlanningGridHeader 
          days={days} 
          handleShowLegend={handleShowLegend} 
        />
        <div className="relative">
          {employees.map((employee) => (
            <EmployeeRow
              key={employee.id}
              employee={employee}
              days={days}
              selectedDate={selectedDate}
              selectedEmployee={selectedEmployee}
              selectedPeriod={selectedPeriod}
              handleCellClick={isAdmin ? handleCellClick : () => {}}
              formatDate={formatDate}
            />
          ))}
          <StatusSelectorEnhanced
            open={statusSelectorOpen}
            onOpenChange={setStatusSelectorOpen}
            onSelect={handleStatusSelect}
            projects={projects}
            statuses={statuses}
          />
        </div>
      </div>
    </div>
  );
}
