
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MonthData, StatusCode, DayPeriod, FilterOptions } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { createSampleData } from '@/utils';
import { filterData } from '@/utils/dataFilterUtils';
import { fetchEmployees } from '@/utils/supabase/employees';
import { fetchSchedule, saveScheduleEntry, deleteScheduleEntry } from '@/utils/supabase/schedule';
import { getExistingProjects } from '@/utils/export/projectUtils';
import { checkSupabaseConnection } from '@/utils/supabase/connection';

export const usePlanningState = () => {
  const { isAdmin } = useAuth();

  const [data, setData] = useState<MonthData>(() => {
    // Créer une structure de données par défaut qui sera remplie avec les données de Supabase
    return {
      year: new Date().getFullYear(),
      month: new Date().getMonth(),
      employees: [],
      projects: getExistingProjects()
    };
  });
  
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const maxRetries = 3;

  // Données filtrées basées sur les filtres appliqués
  const [filteredData, setFilteredData] = useState<MonthData>(data);

  // Charger les données depuis Supabase au montage du composant
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        console.log(`Tentative de chargement des données (essai ${retryCount + 1}/${maxRetries})...`);
        
        // Vérifier la connexion à Supabase d'abord
        const isConnected = await checkSupabaseConnection();
        setIsOnline(isConnected);
        
        if (!isConnected) {
          console.log("Connexion à Supabase impossible, tentative de chargement depuis le cache local");
          // Charger depuis localStorage comme fallback
          try {
            const savedData = localStorage.getItem('planningData');
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              setData(parsedData);
              console.log("Données chargées depuis le cache local");
              toast.info("Mode hors ligne: utilisation des données en cache", {
                duration: 5000,
              });
            } else {
              // Si pas de données en cache, créer des exemples
              const sampleData = createSampleData();
              setData(sampleData);
              console.log("Pas de cache disponible, création de données exemple");
            }
          } catch (localError) {
            console.error('Erreur lors du chargement des données depuis le cache:', localError);
          }
          return;
        }
        
        // Charger les employés depuis Supabase
        const employees = await fetchEmployees();
        console.log(`${employees.length} employés récupérés de Supabase`);
        
        // Charger le planning pour chaque employé
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
        
        // Mettre à jour l'état avec les données chargées
        setData(prevData => ({
          ...prevData,
          employees
        }));
        
        // Stocker également dans localStorage pour compatibilité avec les fonctionnalités existantes
        localStorage.setItem('planningData', JSON.stringify({
          year: currentYear,
          month: currentMonth,
          employees,
          projects: getExistingProjects()
        }));
        
        // Réinitialiser le compteur de tentatives en cas de succès
        setRetryCount(0);
      } catch (error: any) {
        console.error('Erreur lors du chargement des données depuis Supabase:', error);
        
        if (retryCount < maxRetries - 1) {
          // Incrémenter le compteur de tentatives et réessayer après un délai
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            loadData();
          }, 2000 * (retryCount + 1)); // Attendre plus longtemps à chaque nouvel essai
          return;
        } else {
          // Après le nombre maximum de tentatives, basculer en mode hors ligne
          setIsOnline(false);
          
          if (error.message?.includes('NetworkError')) {
            toast.error('Problème de connexion réseau. Basculement en mode hors ligne.', {
              duration: 5000,
            });
          } else {
            toast.error('Erreur persistante lors du chargement des données. Vérifiez votre connexion réseau.', {
              duration: 5000,
            });
          }
          
          // Charger depuis localStorage comme fallback
          try {
            const savedData = localStorage.getItem('planningData');
            if (savedData) {
              const parsedData = JSON.parse(savedData);
              setData(parsedData);
              console.log("Données chargées depuis le cache local");
            } else {
              // Si pas de données en cache, créer des exemples
              const sampleData = createSampleData();
              setData(sampleData);
              console.log("Pas de cache disponible, création de données exemple");
            }
          } catch (localError) {
            console.error('Erreur lors du chargement des données depuis le cache:', localError);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentYear, currentMonth]);

  // Appliquer les filtres lorsqu'ils changent
  useEffect(() => {
    const filtered = filterData(data, filters);
    setFilteredData(filtered);
  }, [data, filters]);

  // Sauvegarder les données dans localStorage pour compatibilité
  const saveDataToLocalStorage = useCallback((updatedData: MonthData) => {
    localStorage.setItem('planningData', JSON.stringify(updatedData));
  }, []);
  
  // Sauvegarde immédiate lors des changements
  useEffect(() => {
    saveDataToLocalStorage(data);
  }, [data, saveDataToLocalStorage]);
  
  const handleMonthChange = (year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    setRetryCount(0); // Réinitialiser le compteur de tentatives lors du changement de mois
  };
  
  const handleStatusChange = async (
    employeeId: string,
    date: string,
    status: StatusCode,
    period: DayPeriod,
    isHighlighted?: boolean,
    projectCode?: string
  ) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour modifier le planning");
      return;
    }
    
    try {
      // Mettre à jour l'état local d'abord pour un retour immédiat
      setData((prevData) => {
        const updatedEmployees = prevData.employees.map((employee) => {
          if (employee.id === employeeId) {
            // Trouver si un statut existe déjà pour cette date et période
            const existingStatusIndex = employee.schedule.findIndex(
              (day) => day.date === date && day.period === period
            );
            
            if (existingStatusIndex >= 0) {
              // Mise à jour d'un statut existant
              if (status === '') {
                // Si le nouveau statut est vide, supprimer l'entrée
                const newSchedule = [...employee.schedule];
                newSchedule.splice(existingStatusIndex, 1);
                return { ...employee, schedule: newSchedule };
              } else {
                // Sinon, mettre à jour l'entrée existante
                const newSchedule = [...employee.schedule];
                newSchedule[existingStatusIndex] = {
                  date,
                  status,
                  period,
                  isHighlighted,
                  projectCode: status === 'projet' ? projectCode : undefined
                };
                return { ...employee, schedule: newSchedule };
              }
            } else if (status !== '') {
              // Ajout d'un nouveau statut
              return {
                ...employee,
                schedule: [
                  ...employee.schedule,
                  {
                    date,
                    status,
                    period,
                    isHighlighted,
                    projectCode: status === 'projet' ? projectCode : undefined
                  }
                ]
              };
            }
          }
          return employee;
        });
        
        const updatedData = {
          ...prevData,
          employees: updatedEmployees
        };
        
        // Sauvegarder immédiatement les données mises à jour
        saveDataToLocalStorage(updatedData);
        
        return updatedData;
      });
      
      // Si nous sommes en ligne, mettre à jour dans Supabase
      if (isOnline) {
        // Vérifier la connexion avant d'envoyer la mise à jour
        const isConnected = await checkSupabaseConnection();
        
        if (!isConnected) {
          toast.warning("Mode hors ligne: les modifications seront synchronisées plus tard", {
            duration: 5000,
          });
          return;
        }
        
        if (status === '') {
          // Supprimer l'entrée
          await deleteScheduleEntry(employeeId, date, period);
          console.log(`Entrée supprimée pour ${employeeId} le ${date} (${period})`);
        } else {
          // Sauvegarder l'entrée
          await saveScheduleEntry(employeeId, {
            date,
            status,
            period,
            isHighlighted,
            projectCode: status === 'projet' ? projectCode : undefined
          });
          console.log(`Entrée enregistrée pour ${employeeId} le ${date} (${period}): statut=${status}`);
        }
      } else {
        console.log("Mode hors ligne: les modifications seront synchronisées ultérieurement");
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut dans Supabase:', error);
      toast.error('Erreur lors de la mise à jour du statut. Vérifiez votre connexion internet.');
    }
  };

  // Gestionnaire pour mettre à jour les filtres
  const handleFiltersChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    
    // Afficher un toast pour indiquer que les filtres ont été appliqués
    if (Object.keys(newFilters).length > 0 && 
        (newFilters.employeeId || 
         newFilters.projectCode || 
         (newFilters.statusCodes && newFilters.statusCodes.length) || 
         newFilters.startDate || 
         newFilters.endDate)) {
      toast.success("Filtres appliqués");
    } else {
      toast.info("Filtres réinitialisés");
    }
  };

  return {
    data: filteredData,
    originalData: data,
    currentYear,
    currentMonth,
    filters,
    isLegendOpen,
    loading,
    isOnline,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange
  };
};

export default usePlanningState;
