
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { importFromExcel } from './excel';
import { saveData } from '@/services/jsonStorage';

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
          // Sauvegarder via notre service JSON
          saveData({
            planningData: importedData,
            employees: importedData.employees,
            projects: importedData.projects,
            statuses: [] // Si les statuts sont gérés ailleurs
          });
          
          // Callback si fourni
          if (onSuccess) {
            onSuccess(importedData);
          }
          
          toast.success('Données importées avec succès');
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
