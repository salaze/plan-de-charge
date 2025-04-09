
import React, { useState, useEffect } from 'react';
import ExportTabs from './ExportTabs';
import { statusService } from '@/services/supabaseServices';
import { Status } from '@/types';

interface ExportTabsEnhancedProps {
  activeTab?: string;
}

export function ExportTabsEnhanced({ activeTab }: ExportTabsEnhancedProps) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  
  // Récupérer les statuts depuis Supabase
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusesData = await statusService.getAll();
        setStatuses(statusesData);
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    };
    
    fetchStatuses();
  }, []);
  
  // Méthode pour injecter les statuts dans les props des onglets
  const enhanceTabProps = (tabName: string, originalProps: any) => {
    if (tabName === 'planning') {
      return { ...originalProps, statuses };
    }
    return originalProps;
  };
  
  return <ExportTabs activeTab={activeTab} enhanceTabProps={enhanceTabProps} />;
}
