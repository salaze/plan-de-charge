
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://rplvyqneecqvmbxhgekl.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwbHZ5cW5lZWNxdm1ieGhnZWtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MDc3ODgsImV4cCI6MjA1ODk4Mzc4OH0.7P_sn1UFDZCp6homuzHZeaKsZr8cgWbpgo_BCUIi90k";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
