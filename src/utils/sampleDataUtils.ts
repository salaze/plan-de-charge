
import { Employee, MonthData, StatusCode } from '@/types';
import { generateId } from './idUtils';
import { generateDaysInMonth, formatDate } from './dateUtils';

/**
 * Creates sample data for demonstration purposes
 */
export const createSampleData = (): MonthData => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const employees: Employee[] = [
    {
      id: 'emp1',
      name: 'Jean Dupont',
      position: 'Développeur',
      schedule: []
    },
    {
      id: 'emp2',
      name: 'Marie Martin',
      position: 'Designer',
      schedule: []
    },
    {
      id: 'emp3',
      name: 'Luc Bernard',
      position: 'Chef de projet',
      schedule: []
    }
  ];
  
  // Generate some random statuses for each employee
  const days = generateDaysInMonth(year, month);
  const statuses: StatusCode[] = ['assistance', 'absence', 'conges', 'formation'];
  
  employees.forEach(employee => {
    days.forEach(day => {
      // Skip weekends
      if (day.getDay() === 0 || day.getDay() === 6) return;
      
      // 70% chance of being present
      if (Math.random() < 0.7) {
        employee.schedule.push({
          date: formatDate(day),
          status: 'assistance',
          period: 'FULL'
        });
      } else {
        // Random status for the remaining 30%
        const randomStatus = statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1];
        employee.schedule.push({
          date: formatDate(day),
          status: randomStatus,
          period: 'FULL'
        });
      }
    });
  });
  
  // Sample projects
  const projects = [
    { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
    { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
    { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
    { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
    { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
  ];
  
  return {
    year,
    month,
    employees,
    projects
  };
};
