
import { useState, useEffect } from 'react';
import { Employee, Status } from '@/types';

interface AdminData {
  projects: any[];
  employees: Employee[];
  statuses: Status[];
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { 
      projects: [], 
      employees: [],
      statuses: [] 
    };
  });

  useEffect(() => {
    if (!data.statuses || data.statuses.length === 0) {
      // This initialization code is now handled in the hook
      // It would check if statuses exist and create defaults if not
      // Assuming this is implemented elsewhere or not needed for refactoring
    }
  }, []);
  
  useEffect(() => {
    if (data) {
      const savedData = localStorage.getItem('planningData');
      const fullData = savedData ? JSON.parse(savedData) : {};
      
      // Mettre à jour les projets, les employés et les statuts dans le localStorage
      localStorage.setItem('planningData', JSON.stringify({
        ...fullData,
        projects: data.projects,
        employees: data.employees,
        statuses: data.statuses
      }));
    }
  }, [data]);

  const handleProjectsChange = (projects: any[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleStatusesChange = (statuses: any[]) => {
    setData(prevData => ({
      ...prevData,
      statuses
    }));
  };
  
  const handleEmployeesChange = (employees: any[]) => {
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
