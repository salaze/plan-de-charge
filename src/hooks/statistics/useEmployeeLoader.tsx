
import { useState, useCallback, useRef } from 'react';
import { Employee, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployeeLoader = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeeCache = useRef<{[key: string]: Employee[]}>({});
  const lastFetchTime = useRef<{[key: string]: number}>({});
  const CACHE_TTL = 60000; // 1 minute en millisecondes

  const fetchEmployees = useCallback(async (department: string = 'all') => {
    try {
      const cacheKey = `employees-${department}`;
      
      // Vérifier si les données en cache sont encore valides
      const now = Date.now();
      if (employeeCache.current[cacheKey]?.length > 0 && 
          lastFetchTime.current[cacheKey] && 
          now - lastFetchTime.current[cacheKey] < CACHE_TTL) {
        console.log(`Utilisation du cache des employés pour le département: ${department}`);
        setEmployees(employeeCache.current[cacheKey]);
        return employeeCache.current[cacheKey];
      }
      
      console.log(`Chargement des employés depuis Supabase pour le département: ${department}...`);
      
      // Construire la requête de base
      let query = supabase.from('employes').select('*');
      
      // Ajouter un filtre par département si nécessaire
      if (department !== 'all') {
        query = query.eq('departement', department);
      }
      
      // Exécuter la requête
      const employeesResult = await query;

      if (employeesResult.error) {
        throw new Error(`Erreur lors du chargement des employés: ${employeesResult.error.message}`);
      }

      const loadedEmployees: Employee[] = employeesResult.data.map(emp => ({
        id: emp.id,
        name: emp.nom + (emp.prenom ? ` ${emp.prenom}` : '') + (emp.departement ? ` (${emp.departement})` : ''),
        email: emp.identifiant,
        position: emp.fonction,
        department: emp.departement,
        role: (emp.role || 'employee') as UserRole,
        uid: emp.uid,
        schedule: []
      }));

      console.log(`${loadedEmployees.length} employés chargés pour le département: ${department}`);
      
      // Mise à jour du cache et de l'horodatage
      employeeCache.current[cacheKey] = loadedEmployees;
      lastFetchTime.current[cacheKey] = now;
      
      setEmployees(loadedEmployees);
      return loadedEmployees;
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      toast.error('Erreur lors du chargement des données depuis Supabase');
      return [];
    }
  }, []);

  return {
    employees,
    fetchEmployees
  };
};
