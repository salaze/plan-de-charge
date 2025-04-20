
import { useState, useEffect } from 'react';
import { MonthData, Employee } from '@/types';
import { toast } from 'sonner';
import { fetchEmployees } from '@/utils/supabase/employees';
import { fetchSchedule } from '@/utils/supabase/schedule';
import { checkSupabaseConnection } from '@/utils/supabase/connection';
import { createSampleData } from '@/utils';
import { getExistingProjects } from '@/utils/export/projectUtils';

export const usePlanningData = (currentYear: number, currentMonth: number) => {
  const [data, setData] = useState<MonthData>(() => ({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
    employees: [],
    projects: getExistingProjects()
  }));
  
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        console.log(`Tentative de chargement des données (essai ${retryCount + 1}/${maxRetries})...`);
        
        const isConnected = await checkSupabaseConnection();
        setIsOnline(isConnected);
        
        if (!isConnected) {
          console.log("Connexion à Supabase impossible, tentative de chargement depuis le cache local");
          try {
            const savedData = localStorage.getItem('planningData');
            if (savedData) {
              setData(JSON.parse(savedData));
              console.log("Données chargées depuis le cache local");
              toast.info("Mode hors ligne: utilisation des données en cache", {
                duration: 5000,
              });
            } else {
              setData(createSampleData());
              console.log("Pas de cache disponible, création de données exemple");
            }
          } catch (localError) {
            console.error('Erreur lors du chargement des données depuis le cache:', localError);
          }
          return;
        }
        
        const employees = await fetchEmployees();
        console.log(`${employees.length} employés récupérés de Supabase`);
        
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
        
        setData(prevData => ({
          ...prevData,
          year: currentYear,
          month: currentMonth,
          employees
        }));
        
        setRetryCount(0);
      } catch (error) {
        console.error('Error loading data:', error);
        if (retryCount < maxRetries - 1) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => loadData(), 2000 * (retryCount + 1));
          return;
        }
        setIsOnline(false);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentYear, currentMonth, retryCount]);

  return { data, setData, loading, isOnline };
};
