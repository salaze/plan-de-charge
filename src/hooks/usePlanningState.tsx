
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MonthData, StatusCode, DayPeriod, FilterOptions } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { createSampleData } from '@/utils';
import { filterData } from '@/utils/dataFilterUtils';
import { fetchEmployees, fetchSchedule, saveScheduleEntry, deleteScheduleEntry } from '@/utils/supabaseUtils';
import { getExistingProjects } from '@/utils/export/projectUtils';

export const usePlanningState = () => {
  const { isAdmin } = useAuth();

  const [data, setData] = useState<MonthData>(() => {
    // Create default data structure that will be populated with Supabase data
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

  // Données filtrées basées sur les filtres appliqués
  const [filteredData, setFilteredData] = useState<MonthData>(data);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Load employees from Supabase
        const employees = await fetchEmployees();
        
        // Load schedule for each employee
        for (let i = 0; i < employees.length; i++) {
          const schedule = await fetchSchedule(employees[i].id);
          employees[i].schedule = schedule;
        }
        
        // Update state with loaded data
        setData(prevData => ({
          ...prevData,
          employees
        }));
        
        // Also store in localStorage for compatibility with existing functionality
        localStorage.setItem('planningData', JSON.stringify({
          year: currentYear,
          month: currentMonth,
          employees,
          projects: getExistingProjects()
        }));
      } catch (error) {
        console.error('Error loading data from Supabase:', error);
        
        // Fall back to localStorage if Supabase fails
        const savedData = localStorage.getItem('planningData');
        if (savedData) {
          try {
            const parsedData = JSON.parse(savedData);
            
            // Ensure data has the correct structure
            if (!parsedData.year) parsedData.year = new Date().getFullYear();
            if (!parsedData.month && parsedData.month !== 0) parsedData.month = new Date().getMonth();
            if (!Array.isArray(parsedData.employees)) parsedData.employees = [];
            if (!parsedData.projects) parsedData.projects = getExistingProjects();
            
            setData(parsedData);
          } catch (error) {
            console.error("Error reading localStorage data:", error);
            setData(createDefaultData());
          }
        } else {
          setData(createDefaultData());
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

  function createDefaultData() {
    const sampleData = createSampleData();
    sampleData.projects = getExistingProjects();
    return sampleData;
  }

  // Save data to Supabase and localStorage
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
    
    // Update the local state first for immediate feedback
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
    
    // Then update in Supabase
    try {
      if (status === '') {
        // Delete the entry
        await deleteScheduleEntry(employeeId, date, period);
      } else {
        // Save the entry
        await saveScheduleEntry(employeeId, {
          date,
          status,
          period,
          isHighlighted,
          projectCode: status === 'projet' ? projectCode : undefined
        });
      }
    } catch (error) {
      console.error('Error updating status in Supabase:', error);
      toast.error('Erreur lors de la mise à jour du statut');
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
    data: filteredData, // Utiliser les données filtrées
    originalData: data, // Conserver l'accès aux données originales si nécessaire
    currentYear,
    currentMonth,
    filters,
    isLegendOpen,
    loading,
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange
  };
};

export default usePlanningState;
