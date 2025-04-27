
import { useState, useEffect, useCallback } from 'react';
import { Employee, StatusCode, SummaryStats } from '@/types';
import { calculateEmployeeStats } from '@/utils/statsUtils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { generateDaysInMonth, formatDate } from '@/utils/dateUtils';

interface EmployeeStatusData {
  name: string;
  [key: string]: number | string;
}

export const useStatisticsData = (
  currentYear: number,
  currentMonth: number,
  statusCodes: StatusCode[],
) => {
  const [employeeStats, setEmployeeStats] = useState<SummaryStats[]>([]);
  const [chartData, setChartData] = useState<EmployeeStatusData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour calculer les statistiques
  const calculateStats = useCallback((
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[]
  ) => {
    console.log('Calcul des statistiques avec:', {
      employeeCount: employees.length,
      year,
      month,
      statusCodes: availableStatusCodes
    });

    const stats: SummaryStats[] = [];
    const chartData: EmployeeStatusData[] = [];

    employees.forEach((employee) => {
      const employeeStats = calculateEmployeeStats(employee, year, month);
      stats.push({
        ...employeeStats,
        employeeName: employee.name
      });

      const dataPoint: EmployeeStatusData = { name: employee.name };
      availableStatusCodes.forEach(status => {
        if (status !== 'none') {
          switch(status) {
            case 'assistance':
              dataPoint[status] = employeeStats.presentDays -
                employeeStats.vigiDays -
                employeeStats.trainingDays -
                employeeStats.projectDays -
                employeeStats.managementDays -
                employeeStats.coordinatorDays -
                employeeStats.regisseurDays -
                employeeStats.demenagementDays -
                employeeStats.permanenceDays -
                employeeStats.parcDays;
              break;
            case 'vigi':
              dataPoint[status] = employeeStats.vigiDays;
              break;
            case 'formation':
              dataPoint[status] = employeeStats.trainingDays;
              break;
            case 'projet':
              dataPoint[status] = employeeStats.projectDays;
              break;
            case 'conges':
              dataPoint[status] = employeeStats.vacationDays;
              break;
            case 'management':
              dataPoint[status] = employeeStats.managementDays;
              break;
            case 'tp':
              dataPoint[status] = employeeStats.tpDays;
              break;
            case 'coordinateur':
              dataPoint[status] = employeeStats.coordinatorDays;
              break;
            case 'absence':
              dataPoint[status] = employeeStats.otherAbsenceDays;
              break;
            case 'regisseur':
              dataPoint[status] = employeeStats.regisseurDays;
              break;
            case 'demenagement':
              dataPoint[status] = employeeStats.demenagementDays;
              break;
            case 'permanence':
              dataPoint[status] = employeeStats.permanenceDays;
              break;
            case 'parc':
              dataPoint[status] = employeeStats.parcDays;
              break;
          }
        }
      });

      chartData.push(dataPoint);
    });

    console.log('Statistiques calculées:', {
      employeeStatsCount: stats.length,
      chartDataCount: chartData.length
    });
    
    setEmployeeStats(stats);
    setChartData(chartData);
  }, []);

  // Fonction pour charger les données depuis Supabase
  const fetchFromSupabase = useCallback(async () => {
    setIsLoading(true);
    console.log('Chargement des données depuis Supabase pour', currentYear, currentMonth);

    try {
      // Déterminer les jours du mois pour filtrer les données
      const days = generateDaysInMonth(currentYear, currentMonth);
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
        role: emp.role || 'employee',
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

      // Calculer les statistiques
      if (employees.length > 0 && statusCodes.length > 0) {
        calculateStats(employees, currentYear, currentMonth, statusCodes);
        console.log('Statistiques calculées avec succès');
      } else {
        console.warn('Pas assez de données pour calculer des statistiques');
        setChartData([]);
        setEmployeeStats([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      toast.error('Erreur lors du chargement des données depuis Supabase');
      setChartData([]);
      setEmployeeStats([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentYear, currentMonth, statusCodes, calculateStats]);

  // Chargement initial des données
  useEffect(() => {
    fetchFromSupabase();
  }, [currentYear, currentMonth, statusCodes, fetchFromSupabase, refreshKey]);

  // Écouter les mises à jour en temps réel
  useEffect(() => {
    // Configurer les abonnements en temps réel
    const scheduleChannel = supabase
      .channel('statistics-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employe_schedule'
        },
        (payload) => {
          console.log('Changement dans le planning détecté:', payload);
          toast.info('Mise à jour du planning détectée', {
            description: 'Les statistiques vont être actualisées'
          });
          
          setTimeout(() => {
            setRefreshKey(prev => prev + 1);
          }, 300);
        }
      )
      .subscribe();

    const employeeChannel = supabase
      .channel('statistics-employees-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employes'
        },
        (payload) => {
          console.log('Changement d\'employé détecté:', payload);
          toast.info('Mise à jour des employés détectée', {
            description: 'Les statistiques vont être actualisées'
          });
          
          setTimeout(() => {
            setRefreshKey(prev => prev + 1);
          }, 300);
        }
      )
      .subscribe();

    // Écouteur d'événement personnalisé pour forcer l'actualisation
    const handleForceReload = () => {
      console.log('Rechargement forcé des statistiques');
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('forceStatisticsReload', handleForceReload);

    return () => {
      window.removeEventListener('forceStatisticsReload', handleForceReload);
      supabase.removeChannel(scheduleChannel);
      supabase.removeChannel(employeeChannel);
    };
  }, []);

  // Fonction pour forcer le rechargement des données
  const refreshData = useCallback(() => {
    toast.info('Actualisation des statistiques...');
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    employeeStats,
    chartData,
    isLoading,
    refreshData
  };
};
