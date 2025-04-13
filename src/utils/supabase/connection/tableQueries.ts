
import { supabase } from '@/integrations/supabase/client';
import { createTimeout } from './connectionVerifier';

interface TableTestResult {
  success: boolean;
  table?: 'statuts' | 'employes';
  data?: any;
}

/**
 * Performs optimized table queries to verify database connection
 */
export async function testTableQueries(): Promise<TableTestResult> {
  // Test uniquement sur la table statuts (la plus importante et légère)
  try {
    const testPromise = supabase
      .from('statuts')
      .select('count')
      .limit(1)
      .maybeSingle();
      
    // Ajouter un timeout de 2 secondes maximum
    const { data, error } = await Promise.race([
      testPromise,
      createTimeout(3000).then(() => { throw new Error('Timeout de connexion') })
    ]) as any;
    
    if (!error && data) {
      return {
        success: true,
        table: 'statuts',
        data
      };
    }
  } catch (e) {
    console.warn("Échec du test rapide sur la table statuts:", e);
  }
  
  // Si le test sur statuts échoue, essayer la table employes
  try {
    const testPromise = supabase
      .from('employes')
      .select('count')
      .limit(1)
      .maybeSingle();
        
    // Ajouter un timeout de 3 secondes maximum
    const { data, error } = await Promise.race([
      testPromise,
      createTimeout(3000).then(() => { throw new Error('Timeout de connexion') })
    ]) as any;
    
    if (!error && data) {
      return {
        success: true,
        table: 'employes',
        data
      };
    }
  } catch (e) {
    console.warn("Échec du test rapide sur la table employes:", e);
  }
  
  return { success: false };
}
