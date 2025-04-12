
import { useCallback } from 'react';
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { SupabaseTable } from '@/types/supabase';
import { ensureValidUuid, generateId } from '@/utils/idUtils';
import { supabase } from '@/integrations/supabase/client';

export const usePlanningPersistence = () => {
  // Use useSyncStatus hook within the component context
  const { syncWithSupabase, isConnected } = useSyncStatus();
  
  // Check if employee exists in Supabase before trying to sync schedule
  const checkEmployeeExists = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('employes')
        .select('id')
        .eq('id', employeeId)
        .single();
      
      if (error) {
        console.error("Error checking if employee exists:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Exception checking if employee exists:", error);
      return false;
    }
  };
  
  // Save data to localStorage and attempt to sync with Supabase
  const saveDataToLocalStorage = useCallback(async (updatedData: MonthData) => {
    // Always save locally first
    try {
      localStorage.setItem('planningData', JSON.stringify(updatedData));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
      toast.error("Erreur lors de la sauvegarde locale");
    }
    
    // If connected to Supabase, try to sync each employee
    if (isConnected && updatedData.employees) {
      // Note: Synchronization is attempted but not blocking
      for (const employee of updatedData.employees) {
        try {
          // Ensure employee ID is a valid UUID before syncing
          const employeeUuid = ensureValidUuid(employee.id);
          
          // Check if employee exists in Supabase before trying to sync schedule
          const employeeExists = await checkEmployeeExists(employeeUuid);
          
          if (employeeExists) {
            // If employee exists, sync schedule entries
            for (const scheduleItem of employee.schedule) {
              if (scheduleItem.date && scheduleItem.period) {
                // Generate a new UUID for each schedule entry
                const entryId = generateId();
                
                syncWithSupabase(
                  {
                    id: entryId,
                    employe_id: employeeUuid,
                    date: scheduleItem.date,
                    period: scheduleItem.period,
                    statut_code: scheduleItem.status,
                    is_highlighted: scheduleItem.isHighlighted,
                    project_code: scheduleItem.projectCode
                  },
                  "employe_schedule" as SupabaseTable
                );
              }
            }
          } else {
            console.log(`Skipping schedule sync for non-existent employee: ${employeeUuid}`);
          }
        } catch (error) {
          console.error("Error syncing with Supabase:", error);
          // Don't show toast here as it would be overwhelming
        }
      }
    }
  }, [isConnected, syncWithSupabase]);
  
  return {
    saveDataToLocalStorage
  };
};

export default usePlanningPersistence;
