
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode } from '@/types';

export interface SupabaseStatus {
  id: string;
  code: StatusCode;
  libelle: string;
  couleur: string;
  created_at?: string;
  updated_at?: string;
  display_order?: number;
}

export const useSupabaseStatuses = () => {
  const [statuses, setStatuses] = useState<SupabaseStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatuses();
  }, []);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('statuts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        // Convertir explicitement les codes en StatusCode
        const typedData: SupabaseStatus[] = data.map(item => ({
          ...item,
          code: item.code as StatusCode
        }));
        setStatuses(typedData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statuts:', error);
      setError('Impossible de charger les statuts depuis Supabase');
      
      // Fallback au localStorage si Supabase échoue
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const data = JSON.parse(savedData);
        if (data.statuses && data.statuses.length > 0) {
          const localStatuses: SupabaseStatus[] = data.statuses.map((s: any) => ({
            id: s.id,
            code: s.code as StatusCode,
            libelle: s.label,
            couleur: s.color
          }));
          setStatuses(localStatuses);
          toast.info('Utilisation des statuts stockés localement');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addStatus = async (status: Omit<SupabaseStatus, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('statuts')
        .insert([status])
        .select();

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        // Convertir explicitement le code en StatusCode
        const newStatus: SupabaseStatus = {
          ...data[0],
          code: data[0].code as StatusCode
        };
        setStatuses(prev => [...prev, newStatus]);
        return newStatus;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du statut:', error);
      toast.error('Impossible d\'ajouter le statut');
      throw error;
    }
  };

  const updateStatus = async (id: string, status: Partial<SupabaseStatus>) => {
    try {
      const { data, error } = await supabase
        .from('statuts')
        .update(status)
        .eq('id', id)
        .select();

      if (error) {
        throw error;
      }

      if (data && data[0]) {
        // Convertir explicitement le code en StatusCode
        const updatedStatus: SupabaseStatus = {
          ...data[0],
          code: data[0].code as StatusCode
        };
        setStatuses(prev => prev.map(s => s.id === id ? updatedStatus : s));
        return updatedStatus;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      toast.error('Impossible de mettre à jour le statut');
      throw error;
    }
  };

  const deleteStatus = async (id: string) => {
    try {
      const { error } = await supabase
        .from('statuts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setStatuses(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression du statut:', error);
      toast.error('Impossible de supprimer le statut');
      throw error;
    }
  };

  return {
    statuses,
    loading,
    error,
    fetchStatuses,
    addStatus,
    updateStatus,
    deleteStatus
  };
};

export default useSupabaseStatuses;
