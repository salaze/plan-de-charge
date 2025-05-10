
import { useCallback } from 'react';
import { Employee, StatusCode } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useScheduleLoader = () => {
  const fetchSchedules = useCallback(async (
    employees: Employee[],
    startDate: string, 
    endDate: string
  ) => {
    if (employees.length === 0) return employees;

    try {
      // Optimisation: charger tous les plannings en une seule requête
      console.log(`Chargement des plannings du ${startDate} au ${endDate}`);
      
      const scheduleResult = await supabase
        .from('employe_schedule')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate);

      if (scheduleResult.error) {
        console.error('Erreur lors du chargement des plannings:', scheduleResult.error);
        toast.error('Erreur lors du chargement des plannings');
        return employees;
      }

      // Grouper les plannings par ID d'employé pour une attribution plus rapide
      const schedulesByEmployee = scheduleResult.data.reduce((acc, entry) => {
        if (!acc[entry.employe_id]) {
          acc[entry.employe_id] = [];
        }
        acc[entry.employe_id].push({
          date: entry.date,
          status: entry.statut_code as StatusCode,
          period: entry.period as 'AM' | 'PM' | 'FULL',
          note: entry.note || undefined,
          projectCode: entry.project_code || undefined,
          isHighlighted: entry.is_highlighted || false
        });
        return acc;
      }, {} as Record<string, any[]>);

      // Attribuer les plannings à chaque employé
      const employeesWithSchedules = employees.map(employee => {
        return {
          ...employee,
          schedule: schedulesByEmployee[employee.id] || []
        };
      });

      console.log('Plannings chargés et attribués aux employés');
      return employeesWithSchedules;
    } catch (error) {
      console.error('Erreur lors du chargement des plannings:', error);
      toast.error('Erreur lors du chargement des plannings');
      return employees;
    }
  }, []);

  return { fetchSchedules };
};
