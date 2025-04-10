
import { useState, useEffect } from 'react';
import { storageService } from '@/services/storage';
import { Employee, Project, Status } from '@/types';

export function usePlanningData() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const employees = await storageService.getEmployees();
        const projects = await storageService.getProjects();
        const statuses = await storageService.getStatuses();
        
        setEmployees(employees);
        setProjects(projects);
        setStatuses(statuses);
      } catch (error) {
        console.error('Error loading planning data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  return {
    employees,
    projects,
    statuses,
    currentMonth,
    currentYear,
    loading,
    handlePrevMonth,
    handleNextMonth,
    handleToday
  };
}
