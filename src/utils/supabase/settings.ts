
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Database } from '@/integrations/supabase/types';

// Définir le type pour la table app_settings
type AppSetting = Database['public']['Tables']['app_settings']['Insert'];

/**
 * Vérifie si la table app_settings existe et la crée si nécessaire
 */
export const ensureSettingsTableExists = async (): Promise<boolean> => {
  try {
    // Vérifier si la table existe en essayant de lire depuis celle-ci
    const { error } = await supabase
      .from('app_settings')
      .select('count(*)', { count: 'exact', head: true });
      
    if (!error) {
      console.log('Settings table exists');
      return true;
    }
      
    // Si erreur, la table pourrait ne pas exister
    console.log('Settings table might not exist, attempting to create it...');
    
    // Appeler la fonction RPC pour créer la table sans paramètres
    // En TypeScript, nous devons passer un objet vide comme second argument
    const { error: createError } = await supabase
      .rpc('create_settings_table_if_not_exists');
      
    if (createError) {
      console.error('Failed to create settings table:', createError);
      return false;
    }
    
    // Ajouter les paramètres par défaut
    await initializeDefaultSettings();
    return true;
  } catch (err) {
    console.error('Error ensuring settings table exists:', err);
    return false;
  }
};

/**
 * Initialise les paramètres par défaut s'ils n'existent pas
 */
const initializeDefaultSettings = async (): Promise<void> => {
  const defaultSettings: AppSetting[] = [
    { key: 'theme', value: 'system', description: 'Default theme for the application' },
    { key: 'notifications_enabled', value: 'true', description: 'Enable system notifications' },
    { key: 'auto_backup', value: 'true', description: 'Automatically backup data daily' },
    { key: 'max_employees', value: '50', description: 'Maximum number of employees to display' },
    { key: 'maintenance_mode', value: 'false', description: 'Put application in maintenance mode' }
  ];
  
  try {
    // Insérer tous les paramètres par défaut en une seule opération
    const { error } = await supabase
      .from('app_settings')
      .insert(defaultSettings);
      
    if (error) {
      console.error('Error inserting default settings:', error);
    } else {
      console.log('Default settings initialized');
    }
  } catch (err) {
    console.error('Error initializing default settings:', err);
    toast.error('Failed to initialize default settings');
  }
};
