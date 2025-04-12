
import React from 'react';
import { Table } from '@/components/ui/table';
import { Employee, DayPeriod } from '@/types';
import { PlanningGridHeader } from '../PlanningGridHeader';
import { DepartmentGroups } from './DepartmentGroups';

interface PlanningGridTableProps {
  visibleDays: Date[];
  departmentGroups: {
    name: string;
    employees: Employee[];
  }[];
  getTotalStats: (employee: Employee) => number;
  handleCellClick: (employeeId: string, date: string, period: DayPeriod) => void;
}

export function PlanningGridTable({ visibleDays, departmentGroups, getTotalStats, handleCellClick }: PlanningGridTableProps) {
  return (
    <div className="overflow-x-auto -mx-2 sm:mx-0">
      <Table className="border rounded-lg bg-white dark:bg-gray-900 shadow-sm min-w-full">
        <PlanningGridHeader days={visibleDays} />
        <DepartmentGroups 
          departmentGroups={departmentGroups} 
          visibleDays={visibleDays}
          getTotalStats={getTotalStats}
          handleCellClick={handleCellClick}
        />
      </Table>
    </div>
  );
}
