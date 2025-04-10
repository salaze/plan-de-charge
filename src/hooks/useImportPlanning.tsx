
import { useState } from 'react';
import { toast } from 'sonner';
import { MonthData } from '@/types';

export const useImportPlanning = () => {
  const [importedData, setImportedData] = useState<MonthData | null>(null);
  
  const handleImportSuccess = (data: MonthData) => {
    setImportedData(data);
    toast.success('Données du planning importées avec succès! Les données ont été sauvegardées.');
  };
  
  return { importedData, handleImportSuccess };
};
