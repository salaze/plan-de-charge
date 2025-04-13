
import { createTimeout, SUPABASE_URL, SUPABASE_KEY } from './connectionVerifier';

/**
 * Performs a lightweight health check against the Supabase REST endpoint
 */
export async function healthCheckTest(): Promise<boolean> {
  try {
    const healthCheck = await Promise.race([
      fetch(`${SUPABASE_URL}/rest/v1/`, {
        headers: {
          'apikey': SUPABASE_KEY,
          'Content-Type': 'application/json'
        }
      }),
      createTimeout(3000)
    ]);
    
    if (healthCheck instanceof Response && healthCheck.ok) {
      return true;
    }
    
    return false;
  } catch (e) {
    console.warn("Health check failed:", e);
    return false;
  }
}
