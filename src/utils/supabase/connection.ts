
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

let isOfflineMode = false;

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('employes')
      .select('count()', { count: 'exact' });
      
    if (error) throw error;
    
    if (isOfflineMode) {
      isOfflineMode = false;
      toast.success('Connexion à la base de données rétablie');
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    
    if (!isOfflineMode) {
      isOfflineMode = true;
      toast.warning('Mode hors-ligne activé - les données sont enregistrées localement');
    }
    
    return false;
  }
};

export const getOfflineMode = () => isOfflineMode;
export const setOfflineMode = (mode: boolean) => {
  isOfflineMode = mode;
};
