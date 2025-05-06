
import { useState, useEffect, useCallback, useRef } from 'react';
import { MonthData, Employee, UserRole } from '@/types';
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
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  
  // Utiliser une référence pour annuler les requêtes précédentes
  const abortController = useRef<AbortController | null>(null);

  // Load employee data with optimized approach
  const loadData = useCallback(async () => {
    // Annuler toute requête précédente
    if (abortController.current) {
      abortController.current.abort();
    }
    
    // Créer un nouveau contrôleur
    abortController.current = new AbortController();
    const signal = abortController.current.signal;
    
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
        setLoading(false);
        return;
      }
      
      // Exécuter ces requêtes en parallèle pour gagner du temps
      const [projectsPromise, syncPromise] = await Promise.all([
        // Récupérer les projets
        fetchProjects().catch(error => {
          console.error('Erreur lors du chargement des projets:', error);
          return [];
        }),
        
        // Synchroniser les statuts silencieusement
        syncStatusesWithDatabase().catch(error => {
          console.error('Erreur lors de la synchronisation des statuts:', error);
          // Continuer même en cas d'échec
        })
      ]);
      
      const projects = projectsPromise;
      console.log(`${projects.length} projets récupérés de Supabase`);
      
      // Si c'est le premier chargement, récupérer la liste de tous les départements
      if (allDepartments.length === 0) {
        try {
          const allEmployees = await fetchEmployees();
          const departments = [...new Set(allEmployees.map(emp => emp.department || 'Sans département'))].filter(Boolean);
          setAllDepartments(departments);
          console.log("Départements disponibles:", departments);
        } catch (error) {
          console.error('Erreur lors du chargement des départements:', error);
          // On continue quand même avec les employés du département sélectionné
        }
      }
      
      // Récupérer uniquement les employés du département sélectionné s'il y en a un
      const employees = await fetchEmployees(selectedDepartment || undefined);
      
      // Conversion explicite du rôle pour résoudre l'erreur TypeScript
      const typedEmployees = employees.map(emp => ({
        ...emp,
        role: (emp.role || 'employee') as UserRole
      }));
      
      console.log(`${typedEmployees.length} employés récupérés de Supabase`);
      
      if (typedEmployees.length === 0 && selectedDepartment) {
        toast.warning(`Aucun employé trouvé dans le département ${selectedDepartment}`);
      }
      
      // Mettre à jour les données sans les plannings pour un affichage immédiat
      setData({
        year: year,
        month: month,
        employees: typedEmployees,
        projects
      });
      
      // Réduire l'état de chargement principal pour afficher l'UI
      setLoading(false);
      
      // Maintenant charger les plannings en arrière-plan
      setLoadingSchedules(true);
      
      // Charger le planning pour chaque employé en lots de 5 pour éviter de surcharger l'API
      const batchSize = 5;
      const results = [];
      
      for (let i = 0; i < typedEmployees.length; i += batchSize) {
        // Vérifier si l'opération a été annulée
        if (signal.aborted) {
          console.log('Chargement des plannings annulé');
          break;
        }
        
        const batch = typedEmployees.slice(i, i + batchSize);
        const batchPromises = batch.map(employee => 
          fetchSchedule(employee.id)
            .then(schedule => ({
              employeeId: employee.id,
              schedule
            }))
            .catch(error => {
              console.error(`Erreur lors du chargement du planning pour ${employee.name}:`, error);
              return { employeeId: employee.id, schedule: [] };
            })
        );
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Mettre à jour progressivement les plannings pour montrer le chargement
        setData(prevData => {
          const updatedEmployees = prevData.employees.map(employee => {
            const employeeSchedule = results.find(s => s.employeeId === employee.id);
            return employeeSchedule ? {
              ...employee,
              schedule: employeeSchedule.schedule
            } : employee;
          });
          
          return {
            ...prevData,
            employees: updatedEmployees
          };
        });
      }
      
      setLoadingSchedules(false);
      setLastRefresh(new Date());
      setRetryCount(0); // Réinitialiser le compteur de tentatives car le chargement a réussi
      
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Ne pas afficher l'erreur si l'opération a été annulée délibérément
      if (signal.aborted) {
        console.log('Opération annulée, ignorant l\'erreur');
        return;
      }
      
      const errorMsg = "Erreur lors du chargement des données. Veuillez réessayer.";
      setConnectionError(errorMsg);
      setIsOnline(false);
      
      // Incrémenter le compteur de tentatives et réessayer si nécessaire
      setRetryCount(prev => prev + 1);
      if (retryCount < 3) {
        console.log(`Nouvelle tentative de chargement (${retryCount + 1}/3)...`);
        setTimeout(() => {
          loadData();
        }, 2000);
      }
    } finally {
      if (loading) setLoading(false);
    }
  }, [year, month, retryCount, selectedDepartment, allDepartments, loading]);

  useEffect(() => {
    loadData();
    
    return () => {
      // Nettoyer en annulant toute requête en cours quand le composant est démonté
      if (abortController.current) {
        abortController.current.abort();
      }
    };
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
    loadingSchedules,
    isOnline, 
    connectionError, 
    reloadData, 
    lastRefresh,
    allDepartments
  };
};
