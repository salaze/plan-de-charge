
import { useCallback } from 'react';
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { SupabaseTable } from '@/types/supabase';
import { ensureValidUuid, generateId } from '@/utils/idUtils';

export const usePlanningPersistence = () => {
  // Use useSyncStatus hook within the component context
  const { syncWithSupabase, isConnected } = useSyncStatus();
  
  // Save data to localStorage and attempt to sync with Supabase
  const saveDataToLocalStorage = useCallback((updatedData: MonthData) => {
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
      updatedData.employees.forEach(employee => {
        try {
          // Ensure employee ID is a valid UUID
          const employeeUuid = ensureValidUuid(employee.id);
              
          syncWithSupabase(
            {
              id: employeeUuid,
              nom: employee.name.split(' ').pop() || employee.name,
              prenom: employee.name.split(' ').slice(0, -1).join(' ') || undefined,
              departement: employee.department
            },
            "employes" as SupabaseTable
          );
          
          // Sync schedule entries for this employee
          employee.schedule.forEach(scheduleItem => {
            if (scheduleItem.date && scheduleItem.period) {
              // Generate a UUID for each schedule entry
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
          });
        } catch (error) {
          console.error("Error syncing with Supabase:", error);
          // Don't show toast here as it would be overwhelming
        }
      });
    }
  }, [isConnected, syncWithSupabase]);
  
  return {
    saveDataToLocalStorage
  };
};

export default usePlanningPersistence;
