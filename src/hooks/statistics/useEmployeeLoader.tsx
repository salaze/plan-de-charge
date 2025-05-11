
import { useState, useCallback, useRef } from 'react';
import { Employee, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployeeLoader = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeeCache = useRef<Employee[]>([]);
  const lastFetchTime = useRef<number>(0);
  const CACHE_TTL = 60000; // 1 minute en millisecondes

  const fetchEmployees = useCallback(async () => {
    try {
      // Vérifier si les données en cache sont encore valides
      const now = Date.now();
      if (employeeCache.current.length > 0 && now - lastFetchTime.current < CACHE_TTL) {
        console.log('Utilisation du cache des employés');
        setEmployees(employeeCache.current);
        return employeeCache.current;
      }
      
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
      
      // Mise à jour du cache et de l'horodatage
      employeeCache.current = loadedEmployees;
      lastFetchTime.current = now;
      
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
