
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('employes')
      .select('count()', { count: 'exact' });
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    toast.error('Erreur de connexion à la base de données');
    return false;
  }
};
