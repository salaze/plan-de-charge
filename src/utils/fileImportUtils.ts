
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { importFromExcel } from './export/excelImport';
import { supabase } from '@/integrations/supabase/client';
import { saveEmployee } from './supabase/employees';
import { saveScheduleEntry } from './supabase/schedule';

/**
 * Handle file import from an input element
 */
export const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>, onSuccess?: (data: MonthData) => void): void => {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = async (e) => {
    try {
      const result = e.target?.result;
      if (typeof result === 'string' || result instanceof ArrayBuffer) {
        const importedData = await importFromExcel(result);
        
        if (importedData) {
          const safeData: MonthData = {
            year: importedData.year || new Date().getFullYear(),
            month: typeof importedData.month === 'number' ? importedData.month : new Date().getMonth(),
            employees: Array.isArray(importedData.employees) ? importedData.employees : [],
            projects: Array.isArray(importedData.projects) ? importedData.projects : []
          };
          
          // Sync directly with Supabase
          try {
            // Save employees
            for (const employee of safeData.employees) {
              await saveEmployee(employee);
              
              // Save schedule for each employee
              for (const scheduleItem of employee.schedule) {
                await saveScheduleEntry(employee.id, scheduleItem);
              }
            }
            
            // Save projects if needed
            // This would require a new Supabase table and utility functions
            
            // Callback if provided
            if (onSuccess) {
              onSuccess(safeData);
            }
            
            toast.success('Données importées et synchronisées avec Supabase');
          } catch (syncError) {
            console.error('Erreur lors de la synchronisation avec Supabase:', syncError);
            toast.error('Erreur lors de la synchronisation des données importées avec Supabase');
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      toast.error('Erreur lors de l\'import du fichier');
    }
    
    // Reset the input file
    if (event.target) {
      event.target.value = '';
    }
  };
  
  reader.readAsArrayBuffer(file);
};
