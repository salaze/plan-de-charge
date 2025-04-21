
import { useState, useEffect } from 'react';
import { MonthData } from '@/types';
import { toast } from 'sonner';
import { fetchEmployees } from '@/utils/supabase/employees';
import { fetchSchedule } from '@/utils/supabase/schedule';
import { checkSupabaseConnection } from '@/utils/supabase/connection';
import { getExistingProjects } from '@/utils/export/projectUtils';

export const usePlanningData = (currentYear?: number, currentMonth?: number) => {
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setConnectionError(null);
      
      try {
        console.log(`Chargement des données depuis Supabase...`);
        
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
        
        const employees = await fetchEmployees();
        console.log(`${employees.length} employés récupérés de Supabase`);
        
        if (employees.length === 0) {
          toast.warning("Aucun employé trouvé dans la base de données");
        }
        
        for (let i = 0; i < employees.length; i++) {
          try {
            const schedule = await fetchSchedule(employees[i].id);
            employees[i].schedule = schedule;
            console.log(`Planning chargé pour l'employé ${employees[i].name}: ${schedule.length} entrées`);
          } catch (scheduleError) {
            console.error(`Erreur lors du chargement du planning pour ${employees[i].name}:`, scheduleError);
            employees[i].schedule = [];
          }
        }
        
        // Récupérer les projets depuis Supabase
        const projects = await getExistingProjects();
        
        setData({
          year: year,
          month: month,
          employees,
          projects
        });
        
      } catch (error) {
        console.error('Error loading data:', error);
        const errorMsg = "Erreur lors du chargement des données. Veuillez réessayer.";
        setConnectionError(errorMsg);
        setIsOnline(false);
        toast.error(errorMsg);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [year, month]);

  return { data, setData, loading, isOnline, connectionError };
};
