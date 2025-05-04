
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Type pour la représentation d'un paramètre
export type AppSetting = {
  id: string;
  name: string;
  value: string;
  description: string | null;
};

/**
 * Récupère tous les paramètres de l'application
 */
export const getAllSettings = async (): Promise<AppSetting[] | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('*');
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (err) {
    console.error('Erreur lors de la récupération des paramètres:', err);
    toast.error('Impossible de récupérer les paramètres');
    return null;
  }
};

/**
 * Récupère un paramètre spécifique par son nom
 */
export const getSetting = async (name: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value')
      .eq('name', name)
      .single();
      
    if (error) {
      return null;
    }
    
    return data.value;
  } catch (err) {
    console.error(`Erreur lors de la récupération du paramètre ${name}:`, err);
    return null;
  }
};

/**
 * Met à jour un paramètre existant
 */
export const updateSetting = async (name: string, value: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('app_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('name', name);
      
    if (error) {
      throw error;
    }
    
    toast.success(`Paramètre "${name}" mis à jour`);
    return true;
  } catch (err) {
    console.error(`Erreur lors de la mise à jour du paramètre ${name}:`, err);
    toast.error(`Erreur lors de la mise à jour du paramètre`);
    return false;
  }
};
