
import React from 'react';
import { isSameDay, isWeekend } from 'date-fns';
import { StatusCell } from '../StatusCell';
import { Employee, Schedule } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmployeeRowProps {
  employee: Employee;
  days: Date[];
  selectedDate: Date | null;
  selectedEmployee: string | null;
  selectedPeriod: 'AM' | 'PM' | 'FULL';
  handleCellClick: (employeeId: string, date: Date, period: 'AM' | 'PM' | 'FULL') => void;
  formatDate: (date: Date) => string;
}

export function EmployeeRow({
  employee,
  days,
  selectedDate,
  selectedEmployee,
  selectedPeriod,
  handleCellClick,
  formatDate
}: EmployeeRowProps) {
  const isMobile = useIsMobile();

  const getEmployeeStatus = (
    employeeId: string,
    date: string,
    period: 'AM' | 'PM' | 'FULL'
  ) => {
    if (!employee) return null;

    const dayStatus = employee.schedule.find(
      (ds) => ds.date === date && ds.period === period
    );

    return dayStatus || null;
  };

  // Guard against empty or invalid days array
  if (!days || !Array.isArray(days) || days.length === 0) {
    console.log(`EmployeeRow: No valid days array for ${employee.name}`);
    return (
      <div className="flex border-b">
        <div className="min-w-[150px] w-[150px] p-2 border-r truncate">{employee.name}</div>
        <div className="flex-1 flex justify-center items-center p-2">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  return (
    <div className="flex border-b">
      <div className="min-w-[150px] w-[150px] p-2 border-r truncate">{employee.name}</div>
      <div className="flex-1 flex flex-row">
        {days.map((day, index) => {
          // Skip invalid date objects
          if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
            return (
              <div 
                key={`invalid-day-${index}`}
                className="w-[40px] min-w-[40px] border-r"
              >
                <div className="h-full flex items-center justify-center">-</div>
              </div>
            );
          }
          
          const dateStr = formatDate(day);
          const isWeekendDay = isWeekend(day);
          const isSelected =
            selectedDate &&
            selectedEmployee === employee.id &&
            isSameDay(selectedDate, day);

          if (isMobile) {
            const status = getEmployeeStatus(employee.id, dateStr, 'FULL');
            return (
              <div
                key={`day-${index}`}
                className={`w-[40px] min-w-[40px] p-1 border-r flex items-center justify-center ${
                  isWeekendDay ? 'bg-muted' : ''
                } ${isSelected ? 'ring-2 ring-primary' : ''}`}
                onClick={() => handleCellClick(employee.id, day, 'FULL')}
              >
                {status ? (
                  <StatusCell
                    status={status.status}
                    isHighlighted={status.highlight || status.isHighlighted}
                    projectCode={status.projectId || status.projectCode}
                  />
                ) : (
                  <div className="w-6 h-6"></div>
                )}
              </div>
            );
          }

          const amStatus = getEmployeeStatus(employee.id, dateStr, 'AM');
          const pmStatus = getEmployeeStatus(employee.id, dateStr, 'PM');

          return (
            <div
              key={`day-${index}`}
              className={`w-[40px] min-w-[40px] border-r ${isWeekendDay ? 'bg-muted' : ''}`}
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
                    isHighlighted={amStatus.highlight || amStatus.isHighlighted}
                    projectCode={amStatus.projectId || amStatus.projectCode}
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
                    isHighlighted={pmStatus.highlight || pmStatus.isHighlighted}
                    projectCode={pmStatus.projectId || pmStatus.projectCode}
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
    </div>
  );
}
