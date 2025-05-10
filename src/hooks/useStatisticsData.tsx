
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Employee, StatusCode, SummaryStats, UserRole } from '@/types';
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingState, setLoadingState] = useState<'idle' | 'loading-employees' | 'loading-schedules' | 'calculating'>('idle');

  // Fonction pour récupérer les employés
  const fetchEmployees = useCallback(async () => {
    try {
      setLoadingState('loading-employees');
      console.log('Chargement des employés depuis Supabase...');
      
      const employeesResult = await supabase
        .from('employes')
        .select('*');

      if (employeesResult.error) {
        throw new Error(`Erreur lors du chargement des employés: ${employeesResult.error.message}`);
      }

      const loadedEmployees: Employee[] = employeesResult.data.map(emp => ({
        id: emp.id,
        name: emp.nom + (emp.prenom ? ` ${emp.prenom}` : ''),
        email: emp.identifiant,
        position: emp.fonction,
        department: emp.departement,
        role: (emp.role || 'employee') as UserRole,
        uid: emp.uid,
        schedule: []
      }));

      console.log(`${loadedEmployees.length} employés chargés`);
      setEmployees(loadedEmployees);
      return loadedEmployees;
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des données depuis Supabase');
      return [];
    }
  }, []);

  // Fonction pour récupérer les plannings des employés
  const fetchSchedules = useCallback(async (
    employees: Employee[],
    startDate: string, 
    endDate: string
  ) => {
    setLoadingState('loading-schedules');
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

  // Fonction pour calculer les statistiques
  const calculateStats = useCallback((
    employees: Employee[],
    year: number,
    month: number,
    availableStatusCodes: StatusCode[]
  ) => {
    setLoadingState('calculating');
    console.log('Calcul des statistiques...');
    
    if (employees.length === 0 || availableStatusCodes.length === 0) {
      console.warn('Pas assez de données pour calculer des statistiques');
      setChartData([]);
      setEmployeeStats([]);
      return;
    }

    const stats: SummaryStats[] = [];
    const chartData: EmployeeStatusData[] = [];

    // Calcul optimisé des statistiques
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
    
    setEmployeeStats(stats);
    setChartData(chartData);
    console.log('Statistiques calculées avec succès');
  }, []);

  // Effet principal qui gère la séquence de chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('Chargement des données depuis Supabase pour', currentYear, currentMonth);

        // 1. Déterminer l'intervalle de dates pour le mois sélectionné
        const days = generateDaysInMonth(currentYear, currentMonth);
        const startDate = formatDate(days[0]);
        const endDate = formatDate(days[days.length - 1]);
        console.log(`Période: ${startDate} à ${endDate}`);

        // 2. Charger les employés
        const loadedEmployees = await fetchEmployees();
        
        // 3. Charger les plannings pour ces employés
        const employeesWithSchedules = await fetchSchedules(loadedEmployees, startDate, endDate);
        
        // 4. Calculer les statistiques
        calculateStats(employeesWithSchedules, currentYear, currentMonth, statusCodes);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        toast.error('Erreur lors du chargement des données depuis Supabase');
      } finally {
        setIsLoading(false);
        setLoadingState('idle');
      }
    };

    // Déclencher le chargement des données
    loadData();
  }, [currentYear, currentMonth, statusCodes, fetchEmployees, fetchSchedules, calculateStats, refreshKey]);

  // Configurer les abonnements en temps réel
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

  // Exposer l'état de chargement détaillé pour le débogage
  const loadingDetails = useMemo(() => {
    return {
      state: loadingState,
      employeesCount: employees.length,
      statusCodesCount: statusCodes.length,
      chartDataCount: chartData.length
    };
  }, [loadingState, employees.length, statusCodes.length, chartData.length]);

  // Fonction pour forcer le rechargement des données
  const refreshData = useCallback(() => {
    toast.info('Actualisation des statistiques...');
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    employeeStats,
    chartData,
    isLoading,
    loadingDetails, // Nouvelle propriété pour le débogage
    refreshData
  };
};
