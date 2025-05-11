
import { useState, useCallback, useRef } from 'react';
import { Employee, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployeeLoader = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const employeeCache = useRef<{[key: string]: Employee[]}>({});
  const lastFetchTime = useRef<{[key: string]: number}>({});
  const CACHE_TTL = 60000; // 1 minute cache lifetime

  const fetchEmployees = useCallback(async (department: string = 'all') => {
    try {
      // Log the fetch attempt for debugging
      console.log(`Attempting to fetch employees for department: ${department}`);
      
      const cacheKey = `employees-${department}`;
      
      // Check if cache is valid
      const now = Date.now();
      if (employeeCache.current[cacheKey]?.length > 0 && 
          lastFetchTime.current[cacheKey] && 
          now - lastFetchTime.current[cacheKey] < CACHE_TTL) {
        console.log(`Using cached employees data for department: ${department}`);
        setEmployees(employeeCache.current[cacheKey]);
        return employeeCache.current[cacheKey];
      }
      
      console.log(`Loading employees from Supabase for department: ${department}...`);
      
      // Build the base query with explicit column selection for better performance
      let query = supabase.from('employes')
        .select('id, nom, prenom, departement, identifiant, fonction, role, uid')
        .order('nom', { ascending: true });
      
      // Add department filter if needed (and not 'all')
      if (department !== 'all') {
        query = query.eq('departement', department);
      }
      
      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise<{ data: any[], error: Error }>((_, reject) => {
        setTimeout(() => reject(new Error('Supabase query timed out')), 8000);
      });
      
      // Execute the query with timeout
      const employeesResult = await Promise.race([
        query,
        timeoutPromise
      ]);

      if (employeesResult.error) {
        throw new Error(`Error loading employees: ${employeesResult.error.message}`);
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

      console.log(`Successfully loaded ${loadedEmployees.length} employees for department: ${department}`);
      
      // Update cache
      employeeCache.current[cacheKey] = loadedEmployees;
      lastFetchTime.current[cacheKey] = now;
      
      setEmployees(loadedEmployees);
      return loadedEmployees;
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Error loading data from Supabase');
      return [];
    }
  }, []);

  return {
    employees,
    fetchEmployees
  };
};
