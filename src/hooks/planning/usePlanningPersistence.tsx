
import { useCallback } from 'react';
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export const usePlanningPersistence = () => {
  const { syncWithSupabase, isConnected } = useSyncStatus();
  
  // Sauvegarde des données dans localStorage et tente une synchronisation avec Supabase
  const saveDataToLocalStorage = useCallback((updatedData: MonthData) => {
    // Toujours sauvegarder en local d'abord
    localStorage.setItem('planningData', JSON.stringify(updatedData));
    
    // Si connecté à Supabase, tenter une synchronisation de chaque employé
    if (isConnected && updatedData.employees) {
      // Note: La synchronisation est tentée mais n'est pas bloquante
      // On pourrait implémenter une file d'attente pour les synchronisations si nécessaire
      updatedData.employees.forEach(employee => {
        try {
          syncWithSupabase(
            {
              id: employee.id,
              nom: employee.name.split(' ').pop() || employee.name,
              prenom: employee.name.split(' ').slice(0, -1).join(' ') || undefined,
              departement: employee.department
            },
            'employes'
          );
          
          // Synchroniser les entrées de planning pour cet employé
          employee.schedule.forEach(scheduleItem => {
            syncWithSupabase(
              {
                id: `${employee.id}_${scheduleItem.date}_${scheduleItem.period}`,
                employe_id: employee.id,
                date: scheduleItem.date,
                period: scheduleItem.period,
                statut_code: scheduleItem.status,
                is_highlighted: scheduleItem.isHighlighted,
                project_code: scheduleItem.projectCode
              },
              'employe_schedule'
            );
          });
        } catch (error) {
          console.error("Erreur lors de la synchronisation avec Supabase:", error);
        }
      });
      
      // Synchroniser les projets
      if (updatedData.projects) {
        updatedData.projects.forEach(project => {
          try {
            syncWithSupabase(
              {
                id: project.id,
                code: project.code,
                name: project.name,
                color: project.color
              },
              'projets'
            );
          } catch (error) {
            console.error("Erreur lors de la synchronisation des projets:", error);
          }
        });
      }
    }
  }, [isConnected, syncWithSupabase]);
  
  return {
    saveDataToLocalStorage
  };
};
