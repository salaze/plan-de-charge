
import { useState, useEffect, useCallback } from 'react';
import { getAllSettings, updateSetting as updateSettingApi } from '@/utils/supabase/settings';

// Type pour les paramètres dans le state
export type SettingsState = {
  theme: string;
  showWeekends: boolean;
  autoSave: boolean;
  maintenanceMode: boolean;
};

// Parse une valeur string en type approprié
const parseSettingValue = (name: string, value: string): any => {
  switch (name) {
    case 'show_weekends':
    case 'auto_save':
    case 'maintenance_mode':
      return value === 'true';
    default:
      return value;
  }
};

export const useSettings = () => {
  // Valeurs par défaut
  const [settings, setSettings] = useState<SettingsState>({
    theme: 'system',
    showWeekends: true,
    autoSave: true,
    maintenanceMode: false,
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mapping entre les noms de paramètres dans la BDD et dans le state
  const settingNameMapping: Record<string, keyof SettingsState> = {
    'theme': 'theme',
    'show_weekends': 'showWeekends',
    'auto_save': 'autoSave',
    'maintenance_mode': 'maintenanceMode',
  };
  
  // Mapping inverse
  const reverseNameMapping: Record<keyof SettingsState, string> = {
    'theme': 'theme',
    'showWeekends': 'show_weekends',
    'autoSave': 'auto_save',
    'maintenanceMode': 'maintenance_mode',
  };
  
  // Charger tous les paramètres
  const loadSettings = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      const data = await getAllSettings();
      
      if (data && data.length > 0) {
        const newSettings = { ...settings };
        
        data.forEach((item) => {
          const stateKey = settingNameMapping[item.name];
          if (stateKey) {
            (newSettings[stateKey] as any) = parseSettingValue(item.name, item.value);
          }
        });
        
        setSettings(newSettings);
      }
    } catch (err: any) {
      console.error('Erreur lors du chargement des paramètres:', err);
      setError(err.message || 'Erreur lors du chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Mettre à jour un paramètre
  const updateSetting = useCallback(async <K extends keyof SettingsState>(
    key: K, 
    value: SettingsState[K]
  ): Promise<boolean> => {
    try {
      // Valider que la clé existe dans notre mapping
      if (!reverseNameMapping[key]) {
        throw new Error(`Clé de paramètre invalide: ${key}`);
      }
      
      // Mettre à jour l'état local immédiatement pour la réactivité
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
      
      // Convertir la valeur en string pour le stockage
      const stringValue = typeof value === 'boolean' ? String(value) : value;
      
      // Mettre à jour dans la BDD
      const success = await updateSettingApi(reverseNameMapping[key], stringValue as string);
      
      return success;
    } catch (err: any) {
      console.error(`Erreur lors de la mise à jour de ${key}:`, err);
      
      // Recharger les paramètres en cas d'erreur pour rétablir l'état correct
      loadSettings();
      return false;
    }
  }, [reverseNameMapping, loadSettings]);
  
  // Charger les paramètres au montage du composant
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
