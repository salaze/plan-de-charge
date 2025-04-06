
import { useState, useEffect } from 'react';
import { Employee, Status, Project } from '@/types';
import { 
  employeeService, 
  projectService, 
  statusService, 
  saveData 
} from '@/services/jsonStorage';

interface AdminData {
  projects: Project[];
  employees: Employee[];
  statuses: Status[];
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>(() => {
    return { 
      projects: projectService.getAll(), 
      employees: employeeService.getAll(),
      statuses: statusService.getAll() 
    };
  });

  useEffect(() => {
    if (data) {
      // Sauvegarder les modifications dans notre service JSON
      saveData({
        projects: data.projects,
        employees: data.employees,
        statuses: data.statuses
      });
    }
  }, [data]);

  const handleProjectsChange = (projects: Project[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleStatusesChange = (statuses: Status[]) => {
    setData(prevData => ({
      ...prevData,
      statuses
    }));
  };
  
  const handleEmployeesChange = (employees: Employee[]) => {
    setData(prevData => ({
      ...prevData,
      employees
    }));
  };

  return {
    data,
    handleProjectsChange,
    handleStatusesChange,
    handleEmployeesChange
  };
}
