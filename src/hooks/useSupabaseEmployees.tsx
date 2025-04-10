
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/types';

export interface SupabaseEmployee {
  id: string;
  nom: string;
  prenom?: string | null;
  departement?: string | null;
  fonction?: string | null;
  role?: string | null;
  uid?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export const useSupabaseEmployees = () => {
  const [employees, setEmployees] = useState<SupabaseEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employes')
        .select('*')
        .order('nom');

      if (error) {
        throw error;
      }

      setEmployees(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      setError('Impossible de charger les employés depuis Supabase');
      
      // Fallback au localStorage si Supabase échoue
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.employees && data.employees.length > 0) {
          setEmployees(data.employees.map((e: Employee) => ({
            id: e.id,
            nom: e.name,
            departement: e.department || null
          })));
          toast.info('Utilisation des employés stockés localement');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Omit<SupabaseEmployee, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('employes')
        .insert([employee])
        .select();

      if (error) {
        throw error;
      }

      setEmployees(prev => [...prev, data[0]]);
      return data[0];
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast.error('Impossible d\'ajouter l\'employé');
      throw error;
    }
  };

  const updateEmployee = async (id: string, employee: Partial<SupabaseEmployee>) => {
    try {
      const { data, error } = await supabase
        .from('employes')
        .update(employee)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      setEmployees(prev => prev.map(e => e.id === id ? data[0] : e));
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      toast.error('Impossible de mettre à jour l\'employé');
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      const { error } = await supabase
        .from('employes')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setEmployees(prev => prev.filter(e => e.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast.error('Impossible de supprimer l\'employé');
      throw error;
    }
  };

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee
  };
};

export default useSupabaseEmployees;
