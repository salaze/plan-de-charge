
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StatusCode, DayPeriod } from '@/types';
import { generateId } from '@/utils';

export function useSupabaseSchedule() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

      // Créer un ID unique basé sur l'employé, la date et la période
      const entryId = `${employeeId}_${date}_${period}`;

      if (status === '') {
        // Si le statut est vide, supprimer l'entrée
        const { error: deleteError } = await supabase
          .from('employe_schedule')
          .delete()
          .eq('id', entryId);

        if (deleteError) throw deleteError;
        return true;
      } else {
        // Vérifier si l'entrée existe déjà
        const { data: existingEntry } = await supabase
          .from('employe_schedule')
          .select('*')
          .eq('id', entryId)
          .maybeSingle();

        if (existingEntry) {
          // Mettre à jour une entrée existante
          const { error: updateError } = await supabase
            .from('employe_schedule')
            .update({
              statut_code: status,
              project_code: projectCode,
              is_highlighted: isHighlighted
            })
            .eq('id', entryId);

          if (updateError) throw updateError;
        } else {
          // Créer une nouvelle entrée
          const { error: insertError } = await supabase
            .from('employe_schedule')
            .insert({
              id: entryId,
              employe_id: employeeId,
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

      const { data, error } = await supabase
        .from('employe_schedule')
        .select('*')
        .eq('employe_id', employeeId);

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
