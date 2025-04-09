import React, { useState, useEffect } from 'react';
import { isSameDay } from 'date-fns';
import { StatusSelectorEnhanced } from './StatusSelectorEnhanced';
import { LegendModal } from './LegendModal';
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
  const [legendModalOpen, setLegendModalOpen] = useState(false);
  
  const { days, formatDate } = usePlanningCalendar(year, month);

  useEffect(() => {
    setSelectedDate(null);
    setSelectedEmployee(null);
    setStatusSelectorOpen(false);
  }, [month, year]);

  const handleCellClick = (employeeId: string, date: Date, period: 'AM' | 'PM' | 'FULL') => {
    if (!isAdmin) return;

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
    setLegendModalOpen(true);
  };

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
              handleCellClick={handleCellClick}
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
      <LegendModal 
        isOpen={legendModalOpen} 
        onClose={() => setLegendModalOpen(false)} 
        projects={projects}
        statuses={statuses}
      />
    </div>
  );
}
