
import { supabase } from '@/integrations/supabase/client';

/**
 * Vérifie si le client Supabase est correctement initialisé
 * en utilisant uniquement des opérations synchrones
 */
export function isSupabaseClientInitialized(): boolean {
  try {
    // Vérification plus robuste du client
    if (!supabase) return false;
    if (!supabase.auth) return false;
    if (typeof supabase.from !== 'function') return false;
    
    return true;
  } catch (e) {
    console.error("Erreur lors de la vérification du client Supabase:", e);
    return false;
  }
}

/**
 * Crée une fonction de timeout pour les opérations asynchrones
 */
export function createTimeout(ms: number): Promise<never> {
  return new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout')), ms)
  );
}

/**
 * Constants for Supabase connection
 */
export const SUPABASE_URL = "https://ggfgfkvihtrxntjgeboi.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnZmdma3ZpaHRyeG50amdlYm9pIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzOTk5NDAsImV4cCI6MjA1OTk3NTk0MH0.XtJ9_KniBKCHJtSC-2owq-8ZTecW56jx36LmS7DwjMM";
