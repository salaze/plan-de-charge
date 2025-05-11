
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
      // Optimisation: charger tous les plannings en une seule requête avec pagination
      console.log(`Chargement des plannings du ${startDate} au ${endDate}`);
      
      const batchSize = 2000; // Augmenter la taille du batch pour réduire les appels
      let allScheduleData: any[] = [];
      let hasMoreData = true;
      let lastId = '';
      let attemptCount = 0;
      const maxAttempts = 3;
      
      while (hasMoreData && attemptCount < maxAttempts) {
        try {
          let query = supabase
            .from('employe_schedule')
            .select('*')
            .gte('date', startDate)
            .lte('date', endDate)
            .order('id', { ascending: true })
            .limit(batchSize);
            
          // Pagination basée sur l'ID pour de meilleures performances
          if (lastId) {
            query = query.gt('id', lastId);
          }
          
          const { data: batchData, error } = await query;
          
          if (error) {
            console.error('Erreur lors du chargement des plannings:', error);
            attemptCount++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant de réessayer
            continue;
          }
          
          if (batchData && batchData.length > 0) {
            allScheduleData = [...allScheduleData, ...batchData];
            lastId = batchData[batchData.length - 1].id;
            hasMoreData = batchData.length === batchSize;
          } else {
            hasMoreData = false;
          }
        } catch (err) {
          attemptCount++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Attendre 1s avant de réessayer
        }
      }

      if (attemptCount >= maxAttempts) {
        toast.error('Problème de chargement des plannings après plusieurs tentatives');
      }

      // Optimisation: Indexage des plannings par ID d'employé pour un accès plus rapide
      const schedulesByEmployee: Record<string, any[]> = {};
      
      // Utilisation d'une boucle for classique pour de meilleures performances
      for (let i = 0; i < allScheduleData.length; i++) {
        const entry = allScheduleData[i];
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
      }

      // Optimisation: map en une seule passe avec des objets préalloués
      const employeesWithSchedules = employees.map(employee => ({
        ...employee,
        schedule: schedulesByEmployee[employee.id] || []
      }));

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
