
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import { checkSupabaseConnection } from './connection';

// Liste des messages d'erreur connus pour les politiques RLS
const RLS_ERROR_PATTERNS = [
  'new row violates row-level security policy',
  'row-level security policy',
  'permission denied'
];

// Fonction pour vérifier si une erreur est liée à RLS
export const isRLSError = (error: any): boolean => {
  if (!error || !error.message) return false;
  
  return RLS_ERROR_PATTERNS.some(pattern => 
    error.message.toLowerCase().includes(pattern.toLowerCase())
  );
};

// Fonction pour surveiller et gérer les erreurs de connexion
export const monitorConnection = async (retries = 3): Promise<boolean> => {
  let attemptCount = 0;
  
  while (attemptCount < retries) {
    try {
      console.log(`Tentative de connexion à Supabase (${attemptCount + 1}/${retries})...`);
      
      const isConnected = await checkSupabaseConnection();
      
      if (isConnected) {
        console.log('Connexion à Supabase établie avec succès');
        return true;
      }
      
      attemptCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attemptCount));
      
    } catch (error) {
      console.error(`Erreur de connexion (tentative ${attemptCount + 1})`, error);
      
      // Si c'est une erreur liée à RLS, notifier l'utilisateur
      if (isRLSError(error)) {
        toast.error("Erreur de politique RLS détectée. Vérifiez les paramètres de sécurité.");
        console.error("Erreur RLS détectée:", error);
      }
      
      attemptCount++;
      await new Promise(resolve => setTimeout(resolve, 1000 * attemptCount));
    }
  }
  
  console.error(`Échec de connexion après ${retries} tentatives`);
  return false;
};

// Tester une connexion Supabase spécifique avec authentification anonyme
export const testAnonymousAccess = async () => {
  try {
    // Tester un accès anonyme à la table employe_schedule
    const { data, error } = await supabase
      .from('employe_schedule')
      .select('id')
      .limit(1);
      
    if (error) {
      console.error("Erreur d'accès anonyme:", error);
      return false;
    }
    
    console.log("Accès anonyme réussi", data);
    return true;
  } catch (error) {
    console.error("Exception lors du test d'accès anonyme:", error);
    return false;
  }
};
