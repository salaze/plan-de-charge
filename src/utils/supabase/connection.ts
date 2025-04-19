
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const checkSupabaseConnection = async () => {
  try {
    // First, ensure we're authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!session) {
      const { error } = await supabase.auth.signInWithPassword({
        email: 'salaze91@gmail.com',
        password: 'Kh19eb87*'
      });
      
      if (error) throw error;
    }
    
    // Then check database connection
    const { data, error } = await supabase
      .from('employes')
      .select('count()', { count: 'exact' });
      
    if (error) throw error;
    
    toast.success('Connexion à Supabase établie');
    return true;
  } catch (error) {
    console.error('Erreur de connexion Supabase:', error);
    toast.error('Erreur de connexion à la base de données');
    return false;
  }
};
