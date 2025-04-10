
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportEmployeesToExcel } from '@/utils/employeeExportUtils';
import { Employee } from '@/types';

interface ExportEmployeesButtonProps {
  selectedDepartment: string;
}

export const ExportEmployeesButton: React.FC<ExportEmployeesButtonProps> = ({
  selectedDepartment
}) => {
  const handleExportEmployees = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      let employees: Employee[] = [];
      
      if (savedData) {
        const data = JSON.parse(savedData);
        employees = data.employees || [];
        
        // Filter by department if needed
        if (selectedDepartment !== "all") {
          employees = employees.filter(emp => emp.department === selectedDepartment);
        }
      }
      
      if (employees.length === 0) {
        toast.error('Aucun employé à exporter');
        return;
      }
      
      exportEmployeesToExcel(employees);
      toast.success('Employés exportés avec succès au format Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export des employés:', error);
      toast.error('Une erreur est survenue lors de l\'export des employés');
    }
  };
  
  return (
    <Button onClick={handleExportEmployees} className="w-full">
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Exporter les employés au format Excel
    </Button>
  );
};
