import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { MonthData } from '@/types';
import { useSupabaseEmployees } from '../useSupabaseEmployees';
import { useSupabaseStatuses } from '../useSupabaseStatuses';
import { createSampleData } from '@/utils';

export const usePlanningDataLoader = () => {
  const { employees: supabaseEmployees, loading: loadingEmployees } = useSupabaseEmployees();
  const { statuses: supabaseStatuses, loading: loadingStatuses } = useSupabaseStatuses();
  const [data, setData] = useState<MonthData>(createDefaultData());
  const [isLoading, setIsLoading] = useState(true);
  
  function createDefaultData(): MonthData {
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
  
  // Charger les données depuis Supabase au montage du composant
  useEffect(() => {
    async function loadDataFromSupabase() {
      try {
        if (loadingEmployees || loadingStatuses) return;
        
        // D'abord, voir si des données sont déjà dans localStorage (rétrocompatibilité)
        const savedData = localStorage.getItem('planningData');
        let parsedData;
        
        if (savedData) {
          try {
            parsedData = JSON.parse(savedData);
            
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
          } catch (error) {
            console.error("Erreur lors de la lecture des données:", error);
            parsedData = null;
          }
        }
        
        // Convert Supabase employees to our app format
        const convertedEmployees = supabaseEmployees.map(emp => ({
          id: emp.id,
          name: emp.prenom ? `${emp.prenom} ${emp.nom}` : emp.nom,
          department: emp.departement || undefined,
          position: emp.fonction || undefined,
          uid: emp.uid || undefined,
          schedule: [] // Les plannings seront chargés séparément pour chaque employé
        }));

        console.log("Employees loaded from Supabase:", convertedEmployees);
        
        // Use either parsed data or create new data structure
        if (parsedData) {
          // Keep existing data but update employees list with fresh data from Supabase
          const existingEmployeeIds = new Set(parsedData.employees.map((e: any) => e.id));
          
          // Merge schedules from existing employees with new employee data
          const mergedEmployees = convertedEmployees.map(newEmp => {
            const existingEmp = parsedData.employees.find((e: any) => e.id === newEmp.id);
            return existingEmp ? { 
              ...newEmp, 
              schedule: existingEmp.schedule || []
            } : newEmp;
          });
          
          // Add any employees from localStorage that aren't in Supabase
          parsedData.employees.forEach((emp: any) => {
            if (!supabaseEmployees.some(sEmp => sEmp.id === emp.id)) {
              mergedEmployees.push(emp);
            }
          });
          
          setData({
            ...parsedData,
            employees: mergedEmployees
          });
        } else {
          // Create new data with just Supabase employees
          setData(prev => ({
            ...prev,
            employees: convertedEmployees
          }));
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Impossible de charger les données");
        setIsLoading(false);
      }
    }
    
    loadDataFromSupabase();
  }, [supabaseEmployees, supabaseStatuses, loadingEmployees, loadingStatuses]);
  
  return {
    data,
    setData,
    isLoading
  };
};
