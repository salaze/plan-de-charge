
import { useState } from 'react';
import { toast } from 'sonner';
import { importEmployeesFromExcel } from '@/utils/employeeExportUtils';
import { Employee } from '@/types';
import { saveEmployee } from '@/utils/supabase/employees';

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
            // Synchroniser directement avec Supabase
            for (const employee of employees) {
              try {
                await saveEmployee(employee);
              } catch (syncError) {
                console.error(`Erreur lors de la synchronisation de l'employé ${employee.name}:`, syncError);
              }
            }
            
            setImportedEmployees(employees);
            toast.success(`${employees.length} employés importés et synchronisés avec Supabase`);
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
