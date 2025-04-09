
import { supabase } from "@/integrations/supabase/client";
import { DayStatus } from "@/types";

// Types pour Supabase
type SupabaseSchedule = {
  id: string;
  employe_id: string;
  date: string;
  statut_code: string;
  period: string;
  note: string | null;
  project_code: string | null;
  is_highlighted: boolean | null;
};

const mapDayStatusToSupabaseSchedule = (
  employeeId: string, 
  dayStatus: DayStatus
): Omit<SupabaseSchedule, "id"> => {
  return {
    employe_id: employeeId,
    date: dayStatus.date,
    statut_code: dayStatus.status,
    period: dayStatus.period,
    note: dayStatus.note || null,
    project_code: dayStatus.projectCode || null,
    is_highlighted: dayStatus.isHighlighted || false
  };
};

// Service pour le planning
export const scheduleService = {
  async updateStatus(employeeId: string, dayStatus: DayStatus): Promise<boolean> {
    try {
      const supabaseSchedule = mapDayStatusToSupabaseSchedule(employeeId, dayStatus);
      
      // Vérifier si l'entrée existe déjà
      const { data: existingEntries, error: fetchError } = await supabase
        .from('employe_schedule')
        .select('id')
        .eq('employe_id', employeeId)
        .eq('date', dayStatus.date)
        .eq('period', dayStatus.period);
        
      if (fetchError) {
        console.error('Erreur lors de la vérification de l\'entrée existante:', fetchError);
        return false;
      }
      
      // Si le statut est vide, supprimer l'entrée
      if (!dayStatus.status) {
        if (existingEntries && existingEntries.length > 0) {
          const { error: deleteError } = await supabase
            .from('employe_schedule')
            .delete()
            .eq('id', (existingEntries[0] as any).id);
            
          if (deleteError) {
            console.error('Erreur lors de la suppression du statut:', deleteError);
            return false;
          }
        }
        return true;
      }

      // Mise à jour ou insertion selon le cas
      if (existingEntries && existingEntries.length > 0) {
        const { error: updateError } = await supabase
          .from('employe_schedule')
          .update(supabaseSchedule as any)
          .eq('id', (existingEntries[0] as any).id);
          
        if (updateError) {
          console.error('Erreur lors de la mise à jour du statut:', updateError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from('employe_schedule')
          .insert(supabaseSchedule as any);
          
        if (insertError) {
          console.error('Erreur lors de l\'ajout du statut:', insertError);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  }
};
