
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Checks if the app_settings table exists and creates it if needed
 */
export const ensureSettingsTableExists = async (): Promise<boolean> => {
  try {
    // Check if table exists by trying to read from it
    const { error } = await supabase
      .from('app_settings')
      .select('count(*)', { count: 'exact', head: true });
      
    if (!error) {
      console.log('Settings table exists');
      return true;
    }
      
    // If error, the table might not exist
    console.log('Settings table might not exist, attempting to create it...');
    
    // Create the table
    const { error: createError } = await supabase
      .rpc('create_settings_table_if_not_exists');
      
    if (createError) {
      console.error('Failed to create settings table:', createError);
      return false;
    }
    
    // Add default settings
    await initializeDefaultSettings();
    return true;
  } catch (err) {
    console.error('Error ensuring settings table exists:', err);
    return false;
  }
};

/**
 * Initializes default settings if they don't exist
 */
const initializeDefaultSettings = async (): Promise<void> => {
  const defaultSettings = [
    { key: 'theme', value: 'system', description: 'Default theme for the application' },
    { key: 'notifications_enabled', value: 'true', description: 'Enable system notifications' },
    { key: 'auto_backup', value: 'true', description: 'Automatically backup data daily' },
    { key: 'max_employees', value: '50', description: 'Maximum number of employees to display' },
    { key: 'maintenance_mode', value: 'false', description: 'Put application in maintenance mode' }
  ];
  
  try {
    for (const setting of defaultSettings) {
      const { error } = await supabase
        .from('app_settings')
        .upsert(setting, { 
          onConflict: 'key',
          ignoreDuplicates: false 
        });
        
      if (error) {
        console.error(`Error inserting setting ${setting.key}:`, error);
      }
    }
    console.log('Default settings initialized');
  } catch (err) {
    console.error('Error initializing default settings:', err);
    toast.error('Failed to initialize default settings');
  }
};
