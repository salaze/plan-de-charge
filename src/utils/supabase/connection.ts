
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

export const checkSupabaseConnection = async () => {
  try {
    // Vérifier si nous avons une session active avant d'essayer de se connecter
    const { data: { session } } = await supabase.auth.getSession();

    // Si pas de session, essayer une tentative de connexion par défaut
    if (!session) {
      console.log("Pas de session active, tentative de connexion en cours...");
      try {
        const { error } = await supabase.auth.signInWithPassword({
          email: 'salaze91@gmail.com',
          password: 'Kh19eb87*'
        });
        
        if (error) {
          console.error('Erreur d\'authentification:', error);
          throw error;
        } else {
          console.log("Authentification réussie");
        }
      } catch (authError) {
        console.error('Erreur de connexion:', authError);
        // Même en cas d'erreur d'authentification, on continue pour vérifier
        // si on peut quand même accéder aux données (mode public)
      }
    } else {
      console.log("Session existante trouvée");
    }
    
    // Tester la connexion en vérifiant l'accès à la table des employés
    // avec un mécanisme de retry et timeout
    let retryCount = 0;
    const maxRetries = 3;
    const timeout = 5000; // 5 secondes
    
    while (retryCount < maxRetries) {
      try {
        console.log(`Tentative de connexion à Supabase (${retryCount + 1}/${maxRetries})...`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const { data, error } = await supabase
          .from('employes')
          .select('count()', { count: 'exact' })
          .limit(1)
          .abortSignal(controller.signal);
          
        clearTimeout(timeoutId);
        
        if (error) throw error;
        
        console.log("Connexion à Supabase établie avec succès");
        toast.success('Connexion à Supabase établie');
        return true;
      } catch (connectionError) {
        console.error(`Tentative de connexion ${retryCount + 1} échouée:`, connectionError);
        retryCount++;
        
        if (retryCount === maxRetries) {
          toast.error('Erreur de connexion à la base de données. Utilisation des données locales.');
          console.log("Basculement vers les données en cache local");
          return false;
        }
        
        // Attendre avant de réessayer
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }
    
    return false;
  } catch (error) {
    console.error('Erreur de vérification de connexion Supabase:', error);
    toast.error('Erreur de connexion à la base de données. Vérifiez votre connexion internet.');
    return false;
  }
};
