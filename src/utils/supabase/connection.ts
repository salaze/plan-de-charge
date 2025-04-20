
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const checkSupabaseConnection = async () => {
  try {
    // First, ensure we're authenticated
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No active session, attempting to sign in");
      const { error } = await supabase.auth.signInWithPassword({
        email: 'salaze91@gmail.com',
        password: 'Kh19eb87*'
      });
      
      if (error) {
        console.error('Authentication error:', error);
        throw error;
      } else {
        console.log("Authentication successful");
      }
    } else {
      console.log("Session found", session);
    }
    
    // Then check database connection with a retry mechanism
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        const { data, error } = await supabase
          .from('employes')
          .select('count()', { count: 'exact' })
          .limit(1);
          
        if (error) throw error;
        
        console.log("Database connection successful");
        toast.success('Connexion à Supabase établie');
        return true;
      } catch (connectionError) {
        console.error(`Connection attempt ${retryCount + 1} failed:`, connectionError);
        retryCount++;
        
        if (retryCount === maxRetries) {
          throw connectionError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erreur de connexion Supabase:', error);
    toast.error('Erreur de connexion à la base de données. Vérifiez votre connexion internet.');
    return false;
  }
};
