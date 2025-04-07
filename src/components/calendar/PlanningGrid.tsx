import React, { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, getDay, isWeekend, isSameDay } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar, Info, HelpCircle } from 'lucide-react';
import { StatusCell } from './StatusCell';
import { StatusSelector } from './StatusSelector';
import { LegendModal } from './LegendModal';
import { Employee, Project, Status } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();

  // Réinitialiser la sélection lorsque le mois ou l'année change
  useEffect(() => {
    setSelectedDate(null);
    setSelectedEmployee(null);
    setStatusSelectorOpen(false);
  }, [month, year]);

  // Générer les jours du mois
  const generateDays = () => {
    const firstDay = startOfMonth(new Date(year, month));
    const lastDay = endOfMonth(firstDay);
    const days = [];

    // Ajouter les jours du mois
    for (let day = 0; day < lastDay.getDate(); day++) {
      const date = addDays(firstDay, day);
      days.push(date);
    }

    return days;
  };

  const days = generateDays();

  // Formater la date pour l'affichage
  const formatDate = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Vérifier si un jour est un jour de week-end
  const isWeekendDay = (date: Date) => {
    return isWeekend(date);
  };

  // Gérer le clic sur une cellule
  const handleCellClick = (employeeId: string, date: Date, period: 'AM' | 'PM' | 'FULL') => {
    if (!isAdmin) return;

    setSelectedDate(date);
    setSelectedEmployee(employeeId);
    setSelectedPeriod(period);
    setStatusSelectorOpen(true);
  };

  // Obtenir le statut d'un employé pour une date et une période données
  const getEmployeeStatus = (employeeId: string, date: string, period: 'AM' | 'PM' | 'FULL') => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return null;

    const dayStatus = employee.schedule.find(
      ds => ds.date === date && ds.period === period
    );

    return dayStatus || null;
  };

  // Gérer la sélection d'un statut
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

  // Afficher la légende
  const handleShowLegend = () => {
    setLegendModalOpen(true);
  };

  // Rendre l'en-tête du tableau
  const renderHeader = () => {
    return (
      <div className="sticky top-0 z-10 bg-background">
        <div className="grid grid-cols-[minmax(150px,1fr)_repeat(auto-fill,minmax(40px,1fr))] border-b">
          <div className="p-2 font-medium text-center border-r flex items-center justify-between">
            <span>Employés</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleShowLegend}
              title="Afficher la légende"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
          {days.map((day, index) => {
            const isWeekend = isWeekendDay(day);
            const dayNumber = format(day, 'd');
            const dayName = format(day, 'EEE', { locale: fr });

            return (
              <div
                key={index}
                className={`p-1 text-center border-r text-xs ${
                  isWeekend ? 'bg-muted' : ''
                }`}
              >
                <div className="font-medium">{dayNumber}</div>
                <div className="text-muted-foreground uppercase">{dayName}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Rendre les lignes du tableau
  const renderRows = () => {
    return employees.map((employee) => (
      <div
        key={employee.id}
        className="grid grid-cols-[minmax(150px,1fr)_repeat(auto-fill,minmax(40px,1fr))] border-b"
      >
        <div className="p-2 border-r truncate">{employee.name}</div>
        {days.map((day, index) => {
          const dateStr = formatDate(day);
          const isWeekend = isWeekendDay(day);
          const isSelected =
            selectedDate &&
            selectedEmployee === employee.id &&
            isSameDay(selectedDate, day);

          // Si c'est un mobile, on n'affiche qu'une seule cellule par jour
          if (isMobile) {
            const status = getEmployeeStatus(employee.id, dateStr, 'FULL');
            return (
              <div
                key={index}
                className={`p-1 border-r flex items-center justify-center ${
                  isWeekend ? 'bg-muted' : ''
                } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleCellClick(employee.id, day, 'FULL')}
              >
                {status ? (
                  <StatusCell
                    status={status.status}
                    isHighlighted={status.isHighlighted}
                    projectCode={status.projectCode}
                    projects={projects}
                  />
                ) : (
                  <div className="w-6 h-6"></div>
                )}
              </div>
            );
          }

          // Sur desktop, on affiche AM et PM
          const amStatus = getEmployeeStatus(employee.id, dateStr, 'AM');
          const pmStatus = getEmployeeStatus(employee.id, dateStr, 'PM');

          return (
            <div
              key={index}
              className={`border-r ${isWeekend ? 'bg-muted' : ''}`}
            >
              <div
                className={`h-1/2 p-0.5 border-b flex items-center justify-center ${
                  isSelected && selectedPeriod === 'AM' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCellClick(employee.id, day, 'AM')}
              >
                {amStatus ? (
                  <StatusCell
                    status={amStatus.status}
                    isHighlighted={amStatus.isHighlighted}
                    projectCode={amStatus.projectCode}
                    projects={projects}
                    size="sm"
                  />
                ) : (
                  <div className="w-5 h-5"></div>
                )}
              </div>
              <div
                className={`h-1/2 p-0.5 flex items-center justify-center ${
                  isSelected && selectedPeriod === 'PM' ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => handleCellClick(employee.id, day, 'PM')}
              >
                {pmStatus ? (
                  <StatusCell
                    status={pmStatus.status}
                    isHighlighted={pmStatus.isHighlighted}
                    projectCode={pmStatus.projectCode}
                    projects={projects}
                    size="sm"
                  />
                ) : (
                  <div className="w-5 h-5"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ));
  };

  return (
    <div className="overflow-auto">
      <div className="min-w-[800px]">
        {renderHeader()}
        <div className="relative">
          {renderRows()}
          <StatusSelector
            open={statusSelectorOpen}
            onOpenChange={setStatusSelectorOpen}
            onSelect={handleStatusSelect}
            projects={projects}
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
