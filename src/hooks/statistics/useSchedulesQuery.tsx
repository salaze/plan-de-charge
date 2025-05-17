
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee, StatusCode } from '@/types';
import { toast } from 'sonner';
import { useSupabaseSubscription } from '../useSupabaseSubscription';

export const useSchedulesQuery = (
  employees: Employee[],
  startDate: string,
  endDate: string,
  enabled: boolean = true
) => {
  // Définir une clé de requête qui inclut les dates
  const queryKey = ['schedules', startDate, endDate];
  
  // S'abonner aux changements de la table employe_schedule
  useSupabaseSubscription('employe_schedule', queryKey);
  
  // Fonction pour charger tous les plannings
  const fetchSchedules = async (): Promise<Employee[]> => {
    if (employees.length === 0) return [];
    
    try {
      console.log(`Loading schedules from ${startDate} to ${endDate}`);
      
      const { data: scheduleData, error } = await supabase
        .from('employe_schedule')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);
        
      if (error) {
        console.error('Error loading schedules:', error);
        toast.error('Erreur lors du chargement des plannings');
        throw error;
      }
      
      // Préparer les données de planning groupées par employé (optimisation)
      const schedulesByEmployee: Record<string, any[]> = {};
      
      scheduleData.forEach(entry => {
        if (!schedulesByEmployee[entry.employe_id]) {
          schedulesByEmployee[entry.employe_id] = [];
        }
        
        schedulesByEmployee[entry.employe_id].push({
          date: entry.date,
          status: entry.statut_code as StatusCode,
          period: entry.period as 'AM' | 'PM' | 'FULL',
          note: entry.note || undefined,
          projectCode: entry.project_code || undefined,
          isHighlighted: entry.is_highlighted || false
        });
      });
      
      // Attribuer les plannings à chaque employé
      const employeesWithSchedules = employees.map(employee => ({
        ...employee,
        schedule: schedulesByEmployee[employee.id] || []
      }));
      
      console.log('Schedules loaded and assigned to employees');
      return employeesWithSchedules;
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast.error('Erreur lors du chargement des plannings');
      throw error;
    }
  };
  
  return useQuery({
    queryKey,
    queryFn: fetchSchedules,
    enabled: enabled && employees.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes de cache
    gcTime: 15 * 60 * 1000, // 15 minutes avant le nettoyage (remplacement de cacheTime)
  });
};
