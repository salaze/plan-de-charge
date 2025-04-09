
import { supabase } from "@/integrations/supabase/client";
import { Status } from "@/types";

// Types pour Supabase
type SupabaseStatus = {
  id: string;
  code: string;
  libelle: string;
  couleur: string;
  display_order: number;
};

// Convertisseurs de types
const mapSupabaseStatusToStatus = (status: SupabaseStatus): Status => {
  return {
    id: status.id,
    code: status.code,
    label: status.libelle,
    color: status.couleur,
    displayOrder: status.display_order
  };
};

const mapStatusToSupabaseStatus = (status: Status): Omit<SupabaseStatus, "id"> => {
  return {
    code: status.code,
    libelle: status.label,
    couleur: status.color,
    display_order: status.displayOrder || 0
  };
};

// Service pour les statuts
export const statusService = {
  async getAll(): Promise<Status[]> {
    try {
      const { data, error } = await supabase
        .from('statuts')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Erreur lors de la récupération des statuts:', error);
        return [];
      }

      return (data as unknown as SupabaseStatus[]).map(mapSupabaseStatusToStatus);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return [];
    }
  },

  async create(status: Omit<Status, 'id'>): Promise<Status | null> {
    try {
      const supabaseStatus = mapStatusToSupabaseStatus(status as Status);
      const { data, error } = await supabase
        .from('statuts')
        .insert(supabaseStatus as any)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la création du statut:', error);
        return null;
      }

      return mapSupabaseStatusToStatus(data as unknown as SupabaseStatus);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return null;
    }
  },

  async update(status: Status): Promise<Status | null> {
    try {
      const supabaseStatus = mapStatusToSupabaseStatus(status);
      const { data, error } = await supabase
        .from('statuts')
        .update(supabaseStatus as any)
        .eq('id', status.id)
        .select()
        .single();

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        return null;
      }

      return mapSupabaseStatusToStatus(data as unknown as SupabaseStatus);
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return null;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('statuts')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erreur lors de la suppression du statut:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erreur non gérée:', error);
      return false;
    }
  }
};
