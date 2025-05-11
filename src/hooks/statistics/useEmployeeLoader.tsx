
import { useState, useCallback, useRef } from 'react';
import { Employee, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployeeLoader = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeeCache = useRef<Employee[]>([]);
  const lastFetchTime = useRef<number>(0);
  const CACHE_TTL = 300000; // Increase cache time to 5 minutes
  
  const fetchEmployees = useCallback(async () => {
    try {
      // Check cache first
      const now = Date.now();
      if (employeeCache.current.length > 0 && now - lastFetchTime.current < CACHE_TTL) {
        console.log('Using employee cache, skipping DB call');
        return employeeCache.current;
      }
      
      console.log('Loading employees from Supabase...');
      
      const employeesResult = await supabase
        .from('employes')
        .select('*');

      if (employeesResult.error) {
        throw new Error(`Error loading employees: ${employeesResult.error.message}`);
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

      console.log(`${loadedEmployees.length} employees loaded successfully`);
      
      // Update cache and timestamp
      employeeCache.current = loadedEmployees;
      lastFetchTime.current = now;
      
      setEmployees(loadedEmployees);
      return loadedEmployees;
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error loading data from Supabase');
      return employeeCache.current.length > 0 ? employeeCache.current : []; // Try to use cache if available
    }
  }, []);

  return {
    employees,
    fetchEmployees
  };
};
