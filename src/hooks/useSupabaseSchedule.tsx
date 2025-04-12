
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

      // Validation
      if (!employeeId || !date || !period) {
        console.error("Paramètres manquants:", { employeeId, date, period });
        throw new Error("Paramètres manquants: employeeId, date ou period");
      }

      // Ensure employee ID is a valid UUID - if not valid, we cannot proceed
      if (!isValidUuid(employeeId)) {
        console.error("ID d'employé invalide:", employeeId);
        throw new Error(`ID d'employé invalide: ${employeeId}`);
      }
      
      console.log("SUPABASE: Tentative de mise à jour du statut:", { 
        employeeId, date, period, status, isHighlighted, projectCode 
      });
      
      if (status === '') {
        // If the status is empty, delete the entry using a combination of fields
        console.log("SUPABASE: Suppression de l'entrée pour:", { employeeId, date, period });
        const { error: deleteError, data: deleteData } = await supabase
          .from('employe_schedule')
          .delete()
          .eq('employe_id', employeeId)
          .eq('date', date)
          .eq('period', period);

        if (deleteError) {
          console.error("SUPABASE: Erreur de suppression détaillée:", deleteError);
          throw deleteError;
        }
        console.log("SUPABASE: Entrée supprimée avec succès, résultat:", deleteData);
        return true;
      } else {
        // Check if the entry exists already using the fields
        console.log("SUPABASE: Vérification si l'entrée existe pour:", { employeeId, date, period });
        const { data: existingEntry, error: fetchError } = await supabase
          .from('employe_schedule')
          .select('*')
          .eq('employe_id', employeeId)
          .eq('date', date)
          .eq('period', period)
          .maybeSingle();
        
        if (fetchError) {
          console.error("SUPABASE: Erreur de récupération détaillée:", fetchError);
          throw fetchError;
        }

        if (existingEntry) {
          // Update the existing entry
          console.log("SUPABASE: Mise à jour de l'entrée existante:", existingEntry.id);
          const { data, error: updateError } = await supabase
            .from('employe_schedule')
            .update({
              statut_code: status,
              project_code: projectCode,
              is_highlighted: isHighlighted
            })
            .eq('id', existingEntry.id)
            .select();

          if (updateError) {
            console.error("SUPABASE: Erreur de mise à jour détaillée:", updateError);
            throw updateError;
          }
          console.log("SUPABASE: Entrée mise à jour avec succès:", data);
          return { success: true, data };
        } else {
          // Create a new entry with a valid UUID
          const newEntryId = generateId();
          console.log("SUPABASE: Création d'une nouvelle entrée avec ID:", newEntryId, {
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
            console.error("SUPABASE: Erreur d'insertion détaillée:", insertError);
            throw insertError;
          }
          console.log("SUPABASE: Entrée créée avec succès:", data);
          return { success: true, data };
        }
      }
    } catch (error) {
      console.error("SUPABASE: Erreur lors de la mise à jour du planning:", error);
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
        console.error("SUPABASE: Format d'ID d'employé invalide:", employeeId);
        return [];
      }

      const { data, error } = await supabase
        .from('employe_schedule')
        .select('*')
        .eq('employe_id', employeeId);

      if (error) {
        console.error("SUPABASE: Erreur de récupération du planning:", error);
        throw error;
      }
      
      console.log(`SUPABASE: Planning récupéré pour l'employé ${employeeId}:`, data?.length || 0, "entrées");
      return data || [];
    } catch (error) {
      console.error("SUPABASE: Erreur lors de la récupération du planning:", error);
      setError("Impossible de récupérer le planning depuis Supabase");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Test the Supabase connection
  const testConnection = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('statuts')
        .select('count(*)')
        .single();
        
      if (error) {
        console.error("SUPABASE: Erreur de connexion test:", error);
        return { connected: false, error };
      }
      
      console.log("SUPABASE: Test de connexion réussi:", data);
      return { connected: true, data };
    } catch (error) {
      console.error("SUPABASE: Erreur lors du test de connexion:", error);
      return { connected: false, error };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateScheduleEntry,
    getScheduleForEmployee,
    testConnection,
    isLoading,
    error
  };
}
