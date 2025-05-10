
import { useState, useCallback } from 'react';
import { Employee, StatusCode } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';
import { toast } from 'sonner';

export const useEmployeesFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchEmployees = useCallback(async (year: number, month: number) => {
    console.log('Chargement des données depuis Supabase pour', year, month);
    setIsLoading(true);

    try {
      // Déterminer les jours du mois pour filtrer les données
      const days = generateDaysInMonth(year, month);
      const startDate = formatDate(days[0]);
      const endDate = formatDate(days[days.length - 1]);

      console.log(`Période: ${startDate} à ${endDate}`);

      // Récupérer les employés
      const employeesResult = await supabase
        .from('employes')
        .select('*');

      if (employeesResult.error) {
        throw new Error(`Erreur lors du chargement des employés: ${employeesResult.error.message}`);
      }

      const employees: Employee[] = employeesResult.data.map(emp => ({
        id: emp.id,
        name: emp.nom + (emp.prenom ? ` ${emp.prenom}` : ''),
        email: emp.identifiant,
        position: emp.fonction,
        department: emp.departement,
        role: (emp.role || 'employee'), // Cast string to UserRole
        uid: emp.uid,
        schedule: []
      }));

      console.log(`${employees.length} employés chargés`);

      // Pour chaque employé, récupérer son planning
      for (const employee of employees) {
        const scheduleResult = await supabase
          .from('employe_schedule')
          .select('*')
          .eq('employe_id', employee.id)
          .gte('date', startDate)
          .lte('date', endDate);

        if (scheduleResult.error) {
          console.error(`Erreur lors du chargement du planning pour ${employee.name}:`, scheduleResult.error);
          continue;
        }

        employee.schedule = scheduleResult.data.map(entry => ({
          date: entry.date,
          status: entry.statut_code as StatusCode,
          period: entry.period as 'AM' | 'PM' | 'FULL',
          note: entry.note || undefined,
          projectCode: entry.project_code || undefined,
          isHighlighted: entry.is_highlighted || false
        }));

        console.log(`${employee.schedule.length} entrées de planning chargées pour ${employee.name}`);
      }

      setIsLoading(false);
      return employees;
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données depuis Supabase');
      setIsLoading(false);
      return [];
    }
  }, []);

  return {
    fetchEmployees,
    isLoading
  };
};
