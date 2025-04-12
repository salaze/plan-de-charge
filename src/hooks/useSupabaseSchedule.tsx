
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StatusCode, DayPeriod } from '@/types';
import { generateId, isValidUuid } from '@/utils/idUtils';

export function useSupabaseSchedule() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Function to update a schedule entry in Supabase
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

      // Ensure employee ID is a valid UUID - if not valid, we cannot proceed
      if (!isValidUuid(employeeId)) {
        throw new Error(`Invalid employee ID format: ${employeeId}`);
      }
      
      console.log("Mise à jour du statut pour l'employé:", employeeId, "date:", date, "période:", period, "statut:", status);
      
      if (status === '') {
        // If the status is empty, delete the entry using a combination of fields
        console.log("Suppression de l'entrée pour l'employé:", employeeId, "date:", date, "période:", period);
        const { error: deleteError } = await supabase
          .from('employe_schedule')
          .delete()
          .eq('employe_id', employeeId)
          .eq('date', date)
          .eq('period', period);

        if (deleteError) {
          console.error("Détails de l'erreur de suppression:", deleteError);
          throw deleteError;
        }
        console.log("Entrée supprimée avec succès");
        return true;
      } else {
        // Check if the entry exists already using the fields
        console.log("Vérification si l'entrée existe pour l'employé:", employeeId, "date:", date, "période:", period);
        const { data: existingEntry, error: fetchError } = await supabase
          .from('employe_schedule')
          .select('*')
          .eq('employe_id', employeeId)
          .eq('date', date)
          .eq('period', period)
          .maybeSingle();
        
        if (fetchError) {
          console.error("Détails de l'erreur de récupération:", fetchError);
          throw fetchError;
        }

        if (existingEntry) {
          // Update the existing entry
          console.log("Mise à jour de l'entrée existante:", existingEntry.id);
          const { error: updateError } = await supabase
            .from('employe_schedule')
            .update({
              statut_code: status,
              project_code: projectCode,
              is_highlighted: isHighlighted
            })
            .eq('id', existingEntry.id);

          if (updateError) {
            console.error("Détails de l'erreur de mise à jour:", updateError);
            throw updateError;
          }
          console.log("Entrée mise à jour avec succès");
        } else {
          // Create a new entry with a valid UUID
          const newEntryId = generateId();
          console.log("Création d'une nouvelle entrée avec ID:", newEntryId, {
            id: newEntryId,
            employe_id: employeeId,
            date: date,
            period: period,
            statut_code: status,
            project_code: projectCode,
            is_highlighted: isHighlighted
          });
          
          const { data, error: insertError } = await supabase
            .from('employe_schedule')
            .insert({
              id: newEntryId,
              employe_id: employeeId,
              date: date,
              period: period,
              statut_code: status,
              project_code: projectCode,
              is_highlighted: isHighlighted
            })
            .select();

          if (insertError) {
            console.error("Détails de l'erreur d'insertion:", insertError);
            throw insertError;
          }
          console.log("Entrée créée avec succès:", data);
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

  // Function to get all schedule entries for an employee
  const getScheduleForEmployee = useCallback(async (employeeId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Only proceed if employee ID is a valid UUID
      if (!isValidUuid(employeeId)) {
        console.error("Invalid employee ID format:", employeeId);
        return [];
      }

      const { data, error } = await supabase
        .from('employe_schedule')
        .select('*')
        .eq('employe_id', employeeId);

      if (error) {
        console.error("Fetch schedule error:", error);
        throw error;
      }
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
