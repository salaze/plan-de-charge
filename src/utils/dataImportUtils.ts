
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StatusCode, DayPeriod } from '@/types';

/**
 * Fonction pour migrer les données du localStorage vers Supabase
 */
export const migrateLocalStorageToSupabase = async () => {
  try {
    // Récupérer les données du localStorage
    const savedData = localStorage.getItem('planningData');
    if (!savedData) {
      toast.info('Pas de données locales à migrer');
      return null;
    }

    const data = JSON.parse(savedData);
    let migrationSummary = {
      employees: 0,
      statuses: 0,
      schedules: 0
    };

    // 1. Migrer les statuts
    if (data.statuses && data.statuses.length > 0) {
      for (const status of data.statuses) {
        const { error } = await supabase
          .from('statuts')
          .upsert([{
            id: status.id,
            code: status.code,
            libelle: status.label,
            couleur: status.color,
            display_order: data.statuses.indexOf(status)
          }]);
        
        if (error) {
          console.error('Erreur lors de la migration des statuts:', error);
        } else {
          migrationSummary.statuses++;
        }
      }
    }

    // 2. Migrer les employés
    if (data.employees && data.employees.length > 0) {
      for (const employee of data.employees) {
        // Séparer le nom et le prénom si possible
        let nom = employee.name;
        let prenom = null;
        
        if (employee.name.includes(' ')) {
          const nameParts = employee.name.split(' ');
          prenom = nameParts[0];
          nom = nameParts.slice(1).join(' ');
        }

        const { error } = await supabase
          .from('employes')
          .upsert([{
            id: employee.id,
            nom,
            prenom,
            departement: employee.department
          }]);
        
        if (error) {
          console.error('Erreur lors de la migration des employés:', error);
        } else {
          migrationSummary.employees++;
        }

        // 3. Migrer le planning de chaque employé
        if (employee.schedule && employee.schedule.length > 0) {
          for (const day of employee.schedule) {
            const { error } = await supabase
              .from('employe_schedule')
              .upsert([{
                employe_id: employee.id,
                date: day.date,
                period: day.period,
                statut_code: day.status,
                project_code: day.projectCode,
                is_highlighted: day.isHighlighted
              }]);
            
            if (error) {
              console.error('Erreur lors de la migration du planning:', error);
            } else {
              migrationSummary.schedules++;
            }
          }
        }
      }
    }

    toast.success(`Migration réussie: ${migrationSummary.employees} employés, ${migrationSummary.statuses} statuts, ${migrationSummary.schedules} planifications`);
    return migrationSummary;
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    toast.error('Erreur lors de la migration des données');
    return null;
  }
};

/**
 * Fonction pour synchroniser l'état local avec les données de Supabase
 */
export const syncWithSupabase = async () => {
  // Cette fonction sera implémentée plus tard pour synchroniser les changements
  // entre le localStorage et Supabase
};
