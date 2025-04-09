
import React from 'react';
import { isSameDay, isWeekend } from 'date-fns';
import { StatusCell } from '../StatusCell';
import { Employee, DayStatus } from '@/types';
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

  const isWeekendDay = (date: Date) => {
    return isWeekend(date);
  };

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

  return (
    <div
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
  );
}
