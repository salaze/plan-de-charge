
import { Employee } from '@/types';

// Group employees by department
export const groupEmployeesByDepartment = (employees: Employee[]) => {
  const departments: { [key: string]: Employee[] } = {};
  
  employees.forEach(employee => {
    const department = employee.department || 'Sans département';
    if (!departments[department]) {
      departments[department] = [];
    }
    departments[department].push(employee);
  });
  
  // Convert the object to an array for easier rendering
  return Object.entries(departments).map(([name, employees]) => ({
    name,
    employees
  }));
};
