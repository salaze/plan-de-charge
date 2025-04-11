
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode, DayPeriod } from '@/types';

export interface SupabaseSchedule {
  id: string;
  employe_id: string;
  date: string;
  period: string;
  statut_code: StatusCode;
  project_code?: string | null;
  is_highlighted?: boolean | null;
  note?: string | null;
  created_at?: string | null;
}

export const useSupabaseSchedule = () => {
  const [loading, setLoading] = useState(false);

  const fetchEmployeeSchedule = async (employeeId: string, startDate?: string, endDate?: string) => {
    try {
      setLoading(true);
      let query = supabase
        .from('employe_schedule')
        .select('*')
        .eq('employe_id', employeeId);

      if (startDate) {
        query = query.gte('date', startDate);
      }
      
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Erreur lors du chargement du planning:', error);
      toast.error('Impossible de charger le planning depuis Supabase');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const updateScheduleEntry = async (
    employeeId: string,
    date: string,
    status: StatusCode,
    period: DayPeriod,
    isHighlighted?: boolean,
    projectCode?: string
  ) => {
    try {
      setLoading(true);
      
      // Vérifier si une entrée existe déjà pour cet employé à cette date et période
      const { data: existing } = await supabase
        .from('employe_schedule')
        .select('id')
        .eq('employe_id', employeeId)
        .eq('date', date)
        .eq('period', period);

      if (existing && existing.length > 0) {
        // Si le statut est vide/null, supprimer l'entrée existante
        if (!status) {
          const { error: deleteError } = await supabase
            .from('employe_schedule')
            .delete()
            .eq('id', existing[0].id);

          if (deleteError) throw deleteError;
          return null;
        } 

        // Sinon, mettre à jour l'entrée existante
        const { data, error: updateError } = await supabase
          .from('employe_schedule')
          .update({
            statut_code: status,
            is_highlighted: isHighlighted,
            project_code: status === 'projet' ? projectCode : null
          })
          .eq('id', existing[0].id)
          .select();

        if (updateError) throw updateError;
        return data[0];
      } else if (status) {
        // Créer une nouvelle entrée seulement si le statut n'est pas vide
        const { data, error: insertError } = await supabase
          .from('employe_schedule')
          .insert([{
            employe_id: employeeId,
            date,
            period,
            statut_code: status,
            is_highlighted: isHighlighted,
            project_code: status === 'projet' ? projectCode : null
          }])
          .select();

        if (insertError) throw insertError;
        return data[0];
      }

      return null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du planning:', error);
      toast.error('Impossible de mettre à jour le planning');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchEmployeeSchedule,
    updateScheduleEntry
  };
};

export default useSupabaseSchedule;
