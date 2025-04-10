import { Employee, StatusCode, DayPeriod } from '@/types';
import { generateId } from './idUtils';

/**
 * Creates an empty employee structure
 */
export const createEmptyEmployee = (name: string): Employee => {
  return {
    id: generateId(),
    name,
    schedule: []
  };
};

/**
 * Gets an employee's status for a specific date and period
 */
export const getEmployeeStatusForDate = (
  employee: Employee,
  date: string,
  period: DayPeriod = 'FULL'
): StatusCode => {
  const dayStatus = employee.schedule.find(
    (day) => day.date === date && (day.period === period || day.period === 'FULL' || period === 'FULL')
  );
  
  return dayStatus?.status || '';
};

/**
 * Sets an employee's status for a specific date and period
 */
export const setEmployeeStatus = (
  employee: Employee,
  date: string,
  status: StatusCode,
  period: DayPeriod = 'FULL'
): Employee => {
  // Remove any existing entry for this date and period
  const updatedSchedule = employee.schedule.filter(
    (day) => !(day.date === date && (day.period === period || day.period === 'FULL' || period === 'FULL'))
  );
  
  // Add the new entry if status isn't empty
  if (status) {
    updatedSchedule.push({
      date,
      status,
      period
    });
  }
  
  return {
    ...employee,
    schedule: updatedSchedule
  };
};
