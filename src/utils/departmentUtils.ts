
import { Employee } from '@/types';

// Group employees by department
export const groupEmployeesByDepartment = (employees: Employee[]) => {
  const departments: { [key: string]: Employee[] } = {};
  
  employees.forEach(employee => {
    const department = employee.department || 'No department';
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

// Extract department from employee name (format: "Name (Department)")
export const extractDepartmentFromName = (name: string): string | null => {
  const pattern = /\(([^)]+)\)/;
  const matches = name.match(pattern);
  
  if (matches && matches.length > 1) {
    return matches[1].trim();
  }
  
  return null;
};

// Get available departments from chart data
export const getAvailableDepartments = (chartData: Array<{ name: string; [key: string]: number | string }>) => {
  const departments = new Set<string>();
  departments.add("all"); // Always include the "all" option
  
  chartData.forEach(employee => {
    const dept = extractDepartmentFromName(employee.name.toString());
    if (dept) {
      departments.add(dept);
    }
  });
  
  return Array.from(departments);
};

// Filter chart data by department
export const filterChartDataByDepartment = (
  chartData: Array<{ name: string; [key: string]: number | string }>, 
  department: string
): Array<{ name: string; [key: string]: number | string }> => {
  if (department === "all") {
    return chartData;
  }
  
  return chartData.filter(employee => {
    const nameParts = employee.name.toString().split('(');
    if (nameParts.length > 1) {
      const deptPart = nameParts[1].replace(')', '').trim();
      return deptPart === department;
    }
    return false;
  });
};
