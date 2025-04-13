
import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { StatusCode } from '@/types';
import { ensureValidUuid } from '@/utils/idUtils';

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
  const statusesCache = useRef<SupabaseStatus[] | null>(null);
  const lastFetchTime = useRef<number>(0);
  const CACHE_TTL = 60000; // 1 minute cache

  const fetchStatuses = useCallback(async (forceRefresh = false) => {
    // Utiliser le cache si disponible et récent, sauf si forceRefresh est true
    const now = Date.now();
    if (!forceRefresh && statusesCache.current && (now - lastFetchTime.current < CACHE_TTL)) {
      console.log("Utilisation du cache pour les statuts");
      setStatuses(statusesCache.current);
      setLoading(false);
      return statusesCache.current;
    }
    
    try {
      setLoading(true);
      console.log("Chargement des statuts depuis Supabase...");
      
      const { data, error } = await supabase
        .from('statuts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const typedData: SupabaseStatus[] = data.map(item => ({
          ...item,
          code: item.code as StatusCode
        }));
        
        // Mettre en cache les données
        statusesCache.current = typedData;
        lastFetchTime.current = now;
        
        setStatuses(typedData);
        console.log("Statuts chargés:", typedData.length);
      }
      
      setLoading(false);
      return data;
    } catch (error) {
      console.error('Erreur lors du chargement des statuts:', error);
      setError('Impossible de charger les statuts depuis Supabase');
      
      // Utiliser les données du localStorage en cas d'erreur
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          if (data.statuses && data.statuses.length > 0) {
            const localStatuses: SupabaseStatus[] = data.statuses.map((s: any) => ({
              id: s.id || ensureValidUuid(crypto.randomUUID()),
              code: s.code as StatusCode,
              libelle: s.label,
              couleur: s.color
            }));
            setStatuses(localStatuses);
            toast.info('Utilisation des statuts stockés localement');
            
            // Cache aussi les données locales
            statusesCache.current = localStatuses;
            lastFetchTime.current = now;
          }
        } catch (e) {
          console.error("Erreur lors du parsing des données locales:", e);
        }
      }
      
      setLoading(false);
      return null;
    }
  }, []);

  // Chargement initial des statuts
  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  // Le reste du hook reste inchangé
  const addStatus = async (status: Omit<SupabaseStatus, 'created_at' | 'updated_at'>) => {
    try {
      const validId = ensureValidUuid(status.id);
      const statusWithValidId = { ...status, id: validId };
      
      const { data, error } = await supabase
        .from('statuts')
        .insert([statusWithValidId])
        .select();

      if (error) {
        console.error("Erreur détaillée lors de l'ajout du statut:", error);
        throw error;
      }

      if (data && data[0]) {
        const newStatus: SupabaseStatus = {
          ...data[0],
          code: data[0].code as StatusCode
        };
        setStatuses(prev => [...prev, newStatus]);
        return newStatus;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de l'ajout du statut:", error);
      toast.error("Impossible d'ajouter le statut");
      throw error;
    }
  };

  const updateStatus = async (id: string, status: Partial<SupabaseStatus>) => {
    try {
      const validId = ensureValidUuid(id);
      
      const { data, error } = await supabase
        .from('statuts')
        .update(status)
        .eq('id', validId)
        .select();

      if (error) {
        console.error("Erreur détaillée lors de la mise à jour du statut:", error);
        throw error;
      }

      if (data && data[0]) {
        const updatedStatus: SupabaseStatus = {
          ...data[0],
          code: data[0].code as StatusCode
        };
        setStatuses(prev => prev.map(s => s.id === validId ? updatedStatus : s));
        return updatedStatus;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      toast.error("Impossible de mettre à jour le statut");
      throw error;
    }
  };

  const deleteStatus = async (id: string) => {
    try {
      const validId = ensureValidUuid(id);
      
      const { error } = await supabase
        .from('statuts')
        .delete()
        .eq('id', validId);

      if (error) {
        console.error("Erreur détaillée lors de la suppression du statut:", error);
        throw error;
      }

      setStatuses(prev => prev.filter(s => s.id !== validId));
    } catch (error) {
      console.error("Erreur lors de la suppression du statut:", error);
      toast.error("Impossible de supprimer le statut");
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
