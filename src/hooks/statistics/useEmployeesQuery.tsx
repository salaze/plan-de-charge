
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';
import { toast } from 'sonner';
import { useSupabaseSubscription } from '../useSupabaseSubscription';

export const useEmployeesQuery = () => {
  // Définition de la clé de requête
  const queryKey = ['employees'];
  
  // S'abonner aux changements de la table employes
  useSupabaseSubscription('employes', queryKey);
  
  // Fonction pour charger les employés depuis Supabase
  const fetchEmployees = async (): Promise<Employee[]> => {
    console.log('Fetching employees from Supabase...');
    
    const { data, error } = await supabase
      .from('employes')
      .select('*');

    if (error) {
      console.error('Error fetching employees:', error);
      toast.error('Erreur lors du chargement des employés');
      throw error;
    }

    const loadedEmployees: Employee[] = data.map(emp => ({
      id: emp.id,
      name: emp.nom + (emp.prenom ? ` ${emp.prenom}` : ''),
      email: emp.identifiant,
      position: emp.fonction,
      department: emp.departement,
      role: (emp.role || 'employee') as any,
      uid: emp.uid,
      schedule: []
    }));

    console.log(`${loadedEmployees.length} employees loaded successfully`);
    return loadedEmployees;
  };

  return useQuery({
    queryKey,
    queryFn: fetchEmployees,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
