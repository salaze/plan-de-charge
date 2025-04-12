
import React from 'react';
import { PlanningStatusCell } from '../PlanningStatusCell';
import { StatusCode, DayPeriod } from '@/types';
import { formatDate } from '@/utils';

interface PlanningCellProps {
  day: Date;
  employeeId: string;
  period: DayPeriod;
  status: StatusCode;
  isHighlighted?: boolean;
  projectCode?: string;
  isWeekend: boolean;
  onCellClick: (employeeId: string, date: string, period: DayPeriod) => void;
}

export function PlanningCell({ 
  day, 
  employeeId, 
  period, 
  status, 
  isHighlighted, 
  projectCode, 
  isWeekend, 
  onCellClick 
}: PlanningCellProps) {
  const formattedDate = formatDate(day);
  
  return (
    <PlanningStatusCell 
      day={day}
      date={formattedDate}
      employeeId={employeeId}
      period={period}
      status={status}
      isHighlighted={isHighlighted}
      projectCode={projectCode}
      isWeekend={isWeekend}
      onCellClick={onCellClick}
    />
  );
}
