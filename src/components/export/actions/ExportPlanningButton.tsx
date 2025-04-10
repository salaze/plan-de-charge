
import React from 'react';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/exportUtils';
import { MonthData } from '@/types';

interface ExportPlanningButtonProps {
  selectedDepartment: string;
}

export const ExportPlanningButton: React.FC<ExportPlanningButtonProps> = ({ 
  selectedDepartment 
}) => {
  const handleExport = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      let data: MonthData;
      
      if (savedData) {
        data = JSON.parse(savedData);
        
        // Filter by department if needed
        if (selectedDepartment !== "all") {
          data = {
            ...data,
            employees: data.employees.filter(emp => emp.department === selectedDepartment)
          };
        }
      } else {
        data = {
          year: new Date().getFullYear(),
          month: new Date().getMonth(),
          employees: [],
          projects: []
        };
      }
      
      exportToExcel(data);
      toast.success(`Données du planning exportées au format Excel (.xlsx)`);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Une erreur est survenue lors de l\'export');
    }
  };
  
  return { handleExport };
};
