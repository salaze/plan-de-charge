
import { useState } from 'react';
import { toast } from 'sonner';
import { importEmployeesFromExcel } from '@/utils/employeeExportUtils';
import { Employee } from '@/types';

export const useImportEmployees = () => {
  const [importedEmployees, setImportedEmployees] = useState<Employee[] | null>(null);
  
  const handleImportEmployees = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const result = event.target?.result;
        if (result instanceof ArrayBuffer) {
          const employees = await importEmployeesFromExcel(result);
          
          if (employees && employees.length > 0) {
            setImportedEmployees(employees);
            
            const savedData = localStorage.getItem('planningData');
            if (savedData) {
              const data = JSON.parse(savedData);
              
              const existingEmployees = data.employees || [];
              const employeeMap = new Map();
              
              existingEmployees.forEach(emp => employeeMap.set(emp.id, emp));
              employees.forEach(emp => {
                const existing = employeeMap.get(emp.id);
                if (existing) {
                  emp.schedule = existing.schedule || [];
                }
                employeeMap.set(emp.id, emp);
              });
              
              data.employees = Array.from(employeeMap.values());
              localStorage.setItem('planningData', JSON.stringify(data));
            } else {
              localStorage.setItem('planningData', JSON.stringify({ 
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                employees,
                projects: []
              }));
            }
            
            toast.success(`${employees.length} employés importés avec succès`);
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'import des employés:', error);
        toast.error('Erreur lors de l\'import du fichier');
      }
      
      // Reset the input
      if (e.target) {
        e.target.value = '';
      }
    };
    
    reader.readAsArrayBuffer(file);
  };
  
  return { importedEmployees, handleImportEmployees };
};
