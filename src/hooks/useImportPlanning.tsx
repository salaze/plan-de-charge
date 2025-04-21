
import { useState } from 'react';
import { toast } from 'sonner';
import { MonthData } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { saveEmployee } from '@/utils/supabase/employees';
import { saveScheduleEntry } from '@/utils/supabase/schedule';

export const useImportPlanning = () => {
  const [importedData, setImportedData] = useState<MonthData | null>(null);
  
  const handleImportSuccess = async (data: MonthData) => {
    try {
      // Synchroniser directement avec Supabase
      for (const employee of data.employees) {
        await saveEmployee(employee);
        
        // Sauvegarder le planning pour chaque employé
        for (const scheduleItem of employee.schedule) {
          await saveScheduleEntry(employee.id, scheduleItem);
        }
      }
      
      setImportedData(data);
      toast.success('Données du planning importées et synchronisées avec Supabase!');
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec Supabase:', error);
      toast.error('Erreur lors de la synchronisation des données importées');
    }
  };
  
  return { importedData, handleImportSuccess };
};
