
import { useState, useEffect, useCallback } from 'react';
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { fetchEmployees } from '@/utils/supabase/employees';
import { fetchSchedule } from '@/utils/supabase/schedule';
import { fetchProjects } from '@/utils/supabase/projects';
import { checkSupabaseConnection } from '@/utils/supabase/connection';
import { syncStatusesWithDatabase } from '@/utils/supabase/sync';

export const usePlanningData = (currentYear?: number, currentMonth?: number, selectedDepartment?: string | null) => {
  const year = currentYear || new Date().getFullYear();
  const month = currentMonth || new Date().getMonth();
  
  const [data, setData] = useState<MonthData>(() => ({
    year: year,
    month: month,
    employees: [],
    projects: []
  }));
  
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const [allDepartments, setAllDepartments] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setConnectionError(null);
    
    try {
      console.log(`Chargement des données depuis Supabase... (${new Date().toISOString()})`);
      
      const isConnected = await checkSupabaseConnection();
      setIsOnline(isConnected);
      
      if (!isConnected) {
        const errorMsg = "Impossible de se connecter à Supabase. Veuillez vérifier votre connexion internet.";
        console.error(errorMsg);
        setConnectionError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      // Synchroniser d'abord les statuts
      await syncStatusesWithDatabase();
      
      // Récupérer les projets depuis Supabase (avant les employés pour garantir qu'ils sont disponibles)
      const projects = await fetchProjects();
      console.log(`${projects.length} projets récupérés de Supabase:`, projects);
      
      // Si c'est le premier chargement, récupérer la liste de tous les départements
      if (allDepartments.length === 0) {
        const allEmployees = await fetchEmployees();
        const departments = [...new Set(allEmployees.map(emp => emp.department || 'Sans département'))];
        setAllDepartments(departments);
        console.log("Départements disponibles:", departments);
      }
      
      // Récupérer uniquement les employés du département sélectionné s'il y en a un
      const employees = await fetchEmployees(selectedDepartment || undefined);
      console.log(`${employees.length} employés récupérés de Supabase`);
      
      if (employees.length === 0) {
        toast.warning(selectedDepartment 
          ? `Aucun employé trouvé dans le département ${selectedDepartment}`
          : "Aucun employé trouvé dans la base de données"
        );
      }
      
      // Charger le planning pour chaque employé
      let schedulesLoaded = 0;
      for (let i = 0; i < employees.length; i++) {
        try {
          const schedule = await fetchSchedule(employees[i].id);
          employees[i].schedule = schedule;
          schedulesLoaded += schedule.length;
          console.log(`Planning chargé pour l'employé ${employees[i].name}: ${schedule.length} entrées`);
        } catch (scheduleError) {
          console.error(`Erreur lors du chargement du planning pour ${employees[i].name}:`, scheduleError);
          employees[i].schedule = [];
        }
      }
      
      console.log(`Total des entrées de planning chargées: ${schedulesLoaded}`);
      console.log(`Nombre total d'employés chargés: ${employees.length}`);
      
      setData({
        year: year,
        month: month,
        employees,
        projects
      });
      
      setLastRefresh(new Date());
      setRetryCount(0); // Réinitialiser le compteur de tentatives car le chargement a réussi
      
    } catch (error) {
      console.error('Error loading data:', error);
      const errorMsg = "Erreur lors du chargement des données. Veuillez réessayer.";
      setConnectionError(errorMsg);
      setIsOnline(false);
      toast.error(errorMsg);
      
      // Incrémenter le compteur de tentatives et réessayer si nécessaire
      setRetryCount(prev => prev + 1);
      if (retryCount < 3) {
        console.log(`Nouvelle tentative de chargement (${retryCount + 1}/3)...`);
        setTimeout(() => {
          loadData();
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [year, month, retryCount, selectedDepartment, allDepartments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ajout d'une fonction de rechargement manuel des données
  const reloadData = useCallback(async () => {
    console.log("Rechargement manuel des données demandé");
    setRetryCount(0); // Réinitialiser le compteur de tentatives
    await loadData();
  }, [loadData]);

  return { 
    data, 
    setData, 
    loading, 
    isOnline, 
    connectionError, 
    reloadData, 
    lastRefresh,
    allDepartments
  };
};
