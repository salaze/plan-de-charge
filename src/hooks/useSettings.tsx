
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define the types for our settings
export type AppSetting = {
  id: string;
  key: string;
  value: string;
  description: string | null;
};

// Define a type for the settings we're tracking in the UI
export type SettingsState = {
  theme: string;
  notificationsEnabled: boolean;
  autoBackup: boolean;
  maxEmployees: string;
  maintenanceMode: boolean;
};

// Convert from string value to appropriate type for UI
const parseSettingValue = (key: string, value: string): any => {
  switch (key) {
    case 'notificationsEnabled':
    case 'autoBackup':
    case 'maintenance_mode':
      return value === 'true';
    default:
      return value;
  }
};

// Convert from UI value to string for storage
const stringifySettingValue = (value: any): string => {
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  return String(value);
};

export const useSettings = () => {
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'system',
    notificationsEnabled: true,
    autoBackup: true,
    maxEmployees: '50',
    maintenanceMode: false,
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Map from database keys to state keys
  const keyMapping: Record<string, keyof SettingsState> = {
    'theme': 'theme',
    'notifications_enabled': 'notificationsEnabled',
    'auto_backup': 'autoBackup',
    'max_employees': 'maxEmployees',
    'maintenance_mode': 'maintenanceMode',
  };
  
  // Map from state keys to database keys (reverse mapping)
  const reverseKeyMapping: Record<keyof SettingsState, string> = {
    'theme': 'theme',
    'notificationsEnabled': 'notifications_enabled',
    'autoBackup': 'auto_backup',
    'maxEmployees': 'max_employees',
    'maintenanceMode': 'maintenance_mode',
  };
  
  // Load all settings from Supabase
  const loadSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('app_settings')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const newSettings = { ...settings };
        
        data.forEach((item: AppSetting) => {
          const stateKey = keyMapping[item.key];
          if (stateKey) {
            newSettings[stateKey] = parseSettingValue(stateKey, item.value);
          }
        });
        
        setSettings(newSettings);
      }
    } catch (err: any) {
      console.error('Error loading settings:', err);
      setError(err.message || 'Error loading settings');
      toast.error('Failed to load settings from database');
    } finally {
      setIsLoading(false);
    }
  }, [settings, keyMapping]);
  
  // Update a single setting value
  const updateSetting = useCallback(async <K extends keyof SettingsState>(
    key: K, 
    value: SettingsState[K]
  ): Promise<boolean> => {
    try {
      // Validate the key exists in our mapping
      if (!reverseKeyMapping[key]) {
        throw new Error(`Invalid setting key: ${key}`);
      }
      
      // Update local state immediately for responsiveness
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      // Convert the value to string for database storage
      const stringValue = stringifySettingValue(value);
      
      // Update in database
      const { error } = await supabase
        .from('app_settings')
        .update({ value: stringValue })
        .eq('key', reverseKeyMapping[key]);
        
      if (error) {
        throw error;
      }
      
      toast.success(`Setting "${key}" updated successfully`);
      return true;
    } catch (err: any) {
      console.error(`Error updating ${key}:`, err);
      
      // Revert local state on error
      loadSettings();
      
      toast.error(`Failed to update ${key}: ${err.message || 'Unknown error'}`);
      return false;
    }
  }, [reverseKeyMapping, loadSettings]);
  
  // Load settings on initial mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  return {
    settings,
    isLoading,
    error,
    updateSetting,
    reloadSettings: loadSettings
  };
};
