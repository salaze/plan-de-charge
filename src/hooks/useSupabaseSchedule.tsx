
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StatusCode, DayPeriod } from '@/types';
import { generateId, isValidUuid } from '@/utils/idUtils';

export function useSupabaseSchedule() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to check if an ID is a valid UUID, if not, convert it to one
  const ensureValidId = (id: string): string => {
    return isValidUuid(id) ? id : generateId();
  };

  // Fonction pour mettre à jour une entrée de planning dans Supabase
  const updateScheduleEntry = useCallback(async (
    employeeId: string,
    date: string,
    status: StatusCode,
    period: DayPeriod,
    isHighlighted?: boolean,
    projectCode?: string
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure employee ID is a valid UUID
      const validEmployeeId = ensureValidId(employeeId);
      
      // Generate a unique ID for the entry based on its unique attributes
      // This ensures we can find it again if needed
      const entryId = generateId();

      if (status === '') {
        // If the status is empty, delete the entry using a combination of fields
        const { error: deleteError } = await supabase
          .from('employe_schedule')
          .delete()
          .eq('employe_id', validEmployeeId)
          .eq('date', date)
          .eq('period', period);

        if (deleteError) throw deleteError;
        return true;
      } else {
        // Check if the entry exists already using the fields
        const { data: existingEntry } = await supabase
          .from('employe_schedule')
          .select('*')
          .eq('employe_id', validEmployeeId)
          .eq('date', date)
          .eq('period', period)
          .maybeSingle();

        if (existingEntry) {
          // Update the existing entry
          const { error: updateError } = await supabase
            .from('employe_schedule')
            .update({
              statut_code: status,
              project_code: projectCode,
              is_highlighted: isHighlighted
            })
            .eq('id', existingEntry.id);

          if (updateError) throw updateError;
        } else {
          // Create a new entry with a valid UUID
          const { error: insertError } = await supabase
            .from('employe_schedule')
            .insert({
              id: entryId,
              employe_id: validEmployeeId,
              date: date,
              period: period,
              statut_code: status,
              project_code: projectCode,
              is_highlighted: isHighlighted
            });

          if (insertError) throw insertError;
        }

        return true;
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour du planning:", error);
      setError("Impossible de mettre à jour le planning dans Supabase");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Récupérer toutes les entrées de planning pour un employé
  const getScheduleForEmployee = useCallback(async (employeeId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Ensure employee ID is a valid UUID
      const validEmployeeId = ensureValidId(employeeId);

      const { data, error } = await supabase
        .from('employe_schedule')
        .select('*')
        .eq('employe_id', validEmployeeId);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Erreur lors de la récupération du planning:", error);
      setError("Impossible de récupérer le planning depuis Supabase");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateScheduleEntry,
    getScheduleForEmployee,
    isLoading,
    error
  };
}
