
import { supabase } from "@/integrations/supabase/client";
import { mapEmployeeToSupabaseEmployee } from './employeeService';

// Fonction pour migrer les données du localStorage vers Supabase
export const migrateLocalDataToSupabase = async (): Promise<boolean> => {
  try {
    const planningData = localStorage.getItem('planningData');
    if (!planningData) {
      console.log('Aucune donnée locale à migrer');
      return true;
    }
    
    const data = JSON.parse(planningData);
    
    // Migrer les statuts
    if (data.statuses && data.statuses.length > 0) {
      for (const status of data.statuses) {
        const supabaseStatus = {
          code: status.code,
          libelle: status.label,
          couleur: status.color,
          display_order: status.displayOrder || 0
        };
        
        const { error } = await supabase
          .from('statuts')
          .insert(supabaseStatus as any);
          
        if (error && error.code !== '23505') { // Ignorer les erreurs de duplication
          console.error('Erreur lors de la migration du statut:', error);
        }
      }
    }
    
    // Migrer les employés et leurs plannings
    if (data.employees && data.employees.length > 0) {
      for (const employee of data.employees) {
        // Insérer l'employé
        const supabaseEmployee = mapEmployeeToSupabaseEmployee(employee);
        
        const { data: insertedEmployee, error: employeeError } = await supabase
          .from('employes')
          .insert(supabaseEmployee as any)
          .select()
          .single();
          
        if (employeeError) {
          console.error('Erreur lors de la migration de l\'employé:', employeeError);
          continue;
        }
        
        // Insérer le planning de l'employé
        if (employee.schedule && employee.schedule.length > 0) {
          for (const dayStatus of employee.schedule) {
            if (dayStatus.status) {
              const supabaseSchedule = {
                employe_id: (insertedEmployee as any).id,
                date: dayStatus.date,
                statut_code: dayStatus.status,
                period: dayStatus.period,
                note: dayStatus.note || null,
                project_code: dayStatus.projectCode || null,
                is_highlighted: dayStatus.isHighlighted || false
              };
              
              const { error: scheduleError } = await supabase
                .from('employe_schedule')
                .insert(supabaseSchedule as any);
                
              if (scheduleError) {
                console.error('Erreur lors de la migration du planning:', scheduleError);
              }
            }
          }
        }
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la migration des données:', error);
    return false;
  }
};
