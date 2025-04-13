
import { supabase } from '@/integrations/supabase/client';
import { createTimeout } from './connectionVerifier';

/**
 * Tests connection by checking Supabase authentication session
 */
export async function sessionTest(): Promise<boolean> {
  try {
    const sessionCheck = await Promise.race([
      supabase.auth.getSession(),
      createTimeout(2000)
    ]);
    
    // Type guard to check if sessionCheck is an object with data property
    if (sessionCheck && typeof sessionCheck === 'object' && 'data' in sessionCheck) {
      return true;
    }
    
    return false;
  } catch (e) {
    console.warn("Session check failed:", e);
    return false;
  }
}
