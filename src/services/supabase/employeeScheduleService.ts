
import { supabase } from "@/integrations/supabase/client";
import { DayStatus } from "@/types";

// Service pour la gestion du planning des employés
export const employeeScheduleService = {
  // Mise à jour du statut d'un employé pour une date spécifique
  async updateStatus(
    employeeId: string, 
    dayStatus: { 
      date: string; 
      status: string; 
      period: 'AM' | 'PM' | 'FULL'; 
      isHighlighted?: boolean;
      projectCode?: string;
      note?: string;
    }
  ): Promise<boolean> {
    try {
      console.log('Updating status for employee:', employeeId, dayStatus);
      
      // Si le statut est vide, on vérifie s'il y a un enregistrement à supprimer
      if (!dayStatus.status) {
        console.log('Status is empty, checking if we need to delete an entry');
        
        const { data: existingRecords, error: fetchError } = await supabase
          .from('employe_schedule')
          .select('*')
          .eq('employe_id', employeeId)
          .eq('date', dayStatus.date)
          .eq('period', dayStatus.period);

        if (fetchError) {
          console.error('Erreur lors de la vérification du planning existant:', fetchError);
          return false;
        }

        // S'il existe un enregistrement, on le supprime
        if (existingRecords && existingRecords.length > 0) {
          console.log('Found existing record, deleting it:', existingRecords[0]);
          
          const { error: deleteError } = await supabase
            .from('employe_schedule')
            .delete()
            .eq('id', existingRecords[0].id);

          if (deleteError) {
            console.error('Erreur lors de la suppression du statut:', deleteError);
            return false;
          }
          
          console.log('Entry deleted successfully');
        }
        
        return true;
      }

      // Si le statut n'est pas vide, on vérifie s'il faut mettre à jour ou créer
      const { data: existingRecords, error: fetchError } = await supabase
        .from('employe_schedule')
        .select('*')
        .eq('employe_id', employeeId)
        .eq('date', dayStatus.date)
        .eq('period', dayStatus.period);

      if (fetchError) {
        console.error('Erreur lors de la vérification du planning existant:', fetchError);
        return false;
      }

      // Si un statut existe déjà, le mettre à jour
      if (existingRecords && existingRecords.length > 0) {
        console.log('Found existing record, updating it:', existingRecords[0]);
        
        const { error } = await supabase
          .from('employe_schedule')
          .update({
            statut_code: dayStatus.status,
            note: dayStatus.note || null,
            project_code: dayStatus.projectCode || null,
            is_highlighted: dayStatus.isHighlighted || false
          })
          .eq('id', existingRecords[0].id);

        if (error) {
          console.error('Erreur lors de la mise à jour du statut:', error);
          return false;
        }
        
        console.log('Status updated successfully');
      } else {
        // Sinon, créer un nouveau statut
        console.log('No existing record found, creating new entry');
        
        const { error } = await supabase
          .from('employe_schedule')
          .insert({
            employe_id: employeeId,
            date: dayStatus.date,
            statut_code: dayStatus.status,
            period: dayStatus.period,
            note: dayStatus.note || null,
            project_code: dayStatus.projectCode || null,
            is_highlighted: dayStatus.isHighlighted || false
          });

        if (error) {
          console.error('Erreur lors de la création du statut:', error);
          return false;
        }
        
        console.log('New status created successfully');
      }

      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  },
  
  // Récupérer tous les plannings d'un employé
  async getEmployeeSchedule(employeeId: string): Promise<DayStatus[]> {
    try {
      const { data: schedules, error } = await supabase
        .from('employe_schedule')
        .select('*')
        .eq('employe_id', employeeId);
        
      if (error) {
        console.error('Erreur lors de la récupération du planning:', error);
        return [];
      }
      
      // Convertir en DayStatus
      return schedules.map(item => ({
        date: item.date,
        status: item.statut_code,
        period: item.period as 'AM' | 'PM' | 'FULL',
        note: item.note || undefined,
        projectCode: item.project_code || undefined,
        isHighlighted: item.is_highlighted || false
      }));
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return [];
    }
  }
};
