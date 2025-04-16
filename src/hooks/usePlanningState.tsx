
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { MonthData, StatusCode, DayPeriod, FilterOptions } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { createSampleData } from '@/utils';
import { filterData } from '@/utils/dataFilterUtils';

export const usePlanningState = () => {
  const { isAdmin } = useAuth();

  const [data, setData] = useState<MonthData>(() => {
    // Récupérer les données depuis le localStorage ou créer des données de démo
    const savedData = localStorage.getItem('planningData');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        
        // Assurer que les données ont la structure correcte
        if (!parsedData.year) parsedData.year = new Date().getFullYear();
        if (!parsedData.month && parsedData.month !== 0) parsedData.month = new Date().getMonth();
        if (!Array.isArray(parsedData.employees)) parsedData.employees = [];
        
        // Assurer que la structure contient des projets
        if (!parsedData.projects) {
          parsedData.projects = [
            { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
            { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
            { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
            { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
            { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
          ];
        }
        
        return parsedData;
      } catch (error) {
        console.error("Erreur lors de la lecture des données:", error);
        return createDefaultData();
      }
    } else {
      return createDefaultData();
    }
  });
  
  const [currentYear, setCurrentYear] = useState(data.year || new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(typeof data.month === 'number' ? data.month : new Date().getMonth());
  const [filters, setFilters] = useState<FilterOptions>({});
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Données filtrées basées sur les filtres appliqués
  const [filteredData, setFilteredData] = useState<MonthData>(data);

  // Appliquer les filtres lorsqu'ils changent
  useEffect(() => {
    const filtered = filterData(data, filters);
    setFilteredData(filtered);
  }, [data, filters]);

  function createDefaultData() {
    const sampleData = createSampleData();
    
    // Ajouter des projets aux données de démo
    sampleData.projects = [
      { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
      { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
      { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
      { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
      { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
    ];
    
    return sampleData;
  }

  // Sauvegarde automatique des données 
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
  
  const handleStatusChange = (
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
    setIsLegendOpen,
    handleMonthChange,
    handleStatusChange,
    handleFiltersChange
  };
};

export default usePlanningState;
