
import { useState, useCallback } from 'react';
import { Employee, UserRole } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEmployeeLoader = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const fetchEmployees = useCallback(async () => {
    try {
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
