
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
  identifiant?: string | null;  // Added identifiant property
  uid?: string | null;  // Keep uid for backward compatibility
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

      console.log('Employés chargés depuis Supabase:', data);
      setEmployees(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des employés:', error);
      setError('Impossible de charger les employés depuis Supabase');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const addEmployee = async (employee: Employee) => {
    try {
      // Convert from UI model to Supabase model
      const supabaseEmployee: SupabaseEmployee = {
        id: employee.id,
        nom: employee.name.split(' ').pop() || employee.name,
        prenom: employee.name.split(' ').slice(0, -1).join(' ') || null,
        departement: employee.department || null,
        fonction: employee.position || null,
        identifiant: employee.uid || null,  // Using identifiant for uid value
        role: employee.role || null
      };
      
      console.log('Ajout d\'un employé à Supabase:', supabaseEmployee);
      
      const { data, error } = await supabase
        .from('employes')
        .insert(supabaseEmployee)
        .select();

      if (error) {
        console.error('Erreur Supabase lors de l\'ajout:', error);
        throw error;
      }

      console.log('Employé ajouté avec succès dans Supabase:', data);
      await fetchEmployees(); // Refresh the employee list
      return data[0];
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'employé:', error);
      toast.error('Impossible d\'ajouter l\'employé');
      throw error;
    }
  };

  const updateEmployee = async (id: string, employee: Partial<Employee>) => {
    try {
      // Convert from UI model to Supabase model
      const supabaseEmployee: Partial<SupabaseEmployee> = {};
      
      if (employee.name) {
        supabaseEmployee.nom = employee.name.split(' ').pop() || employee.name;
        supabaseEmployee.prenom = employee.name.split(' ').slice(0, -1).join(' ') || null;
      }
      
      if (employee.department !== undefined) supabaseEmployee.departement = employee.department || null;
      if (employee.position !== undefined) supabaseEmployee.fonction = employee.position || null;
      if (employee.uid !== undefined) supabaseEmployee.identifiant = employee.uid || null;  // Using identifiant for uid value
      if (employee.role !== undefined) supabaseEmployee.role = employee.role || null;
      
      console.log('Mise à jour d\'un employé dans Supabase:', id, supabaseEmployee);
      
      const { data, error } = await supabase
        .from('employes')
        .update(supabaseEmployee)
        .eq('id', id)
        .select();

      if (error) {
        console.error('Erreur Supabase lors de la mise à jour:', error);
        throw error;
      }

      console.log('Employé mis à jour avec succès dans Supabase:', data);
      await fetchEmployees(); // Refresh the employee list
      return data[0];
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'employé:', error);
      toast.error('Impossible de mettre à jour l\'employé');
      throw error;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      console.log('Suppression d\'un employé dans Supabase:', id);
      
      const { error } = await supabase
        .from('employes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur Supabase lors de la suppression:', error);
        throw error;
      }

      console.log('Employé supprimé avec succès dans Supabase');
      setEmployees(prev => prev.filter(e => e.id !== id));
      toast.success('Employé supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast.error('Impossible de supprimer l\'employé');
      throw error;
    }
  };
  
  const deleteAllEmployees = async () => {
    try {
      console.log('Suppression de tous les employés dans Supabase');
      
      const { error } = await supabase
        .from('employes')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Ceci va supprimer tous les employés

      if (error) {
        console.error('Erreur Supabase lors de la suppression de tous les employés:', error);
        throw error;
      }

      console.log('Tous les employés ont été supprimés avec succès dans Supabase');
      setEmployees([]);
      toast.success('Tous les employés ont été supprimés de Supabase');
    } catch (error) {
      console.error('Erreur lors de la suppression des employés:', error);
      toast.error('Impossible de supprimer les employés');
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
    deleteEmployee,
    deleteAllEmployees
  };
};

export default useSupabaseEmployees;
