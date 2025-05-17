
import { useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { fetchEmployees } from '@/utils/supabase';
import { useConnectionState } from './useConnectionState';
import { useEmployeeManager } from './useEmployeeManager';

export function useEmployeeLoader() {
  const {
    loading, 
    setLoading,
    connectionError,
    setConnectionError,
    isConnected,
    checkConnection
  } = useConnectionState();
  
  const {
    setEmployees,
    ...employeeManager
  } = useEmployeeManager([]);

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setConnectionError(null);
    
    // Check connection first
    const isConnected = await checkConnection();
    if (!isConnected) {
      setLoading(false);
      toast.error("Connexion à Supabase indisponible");
      return;
    }
    
    try {
      const data = await fetchEmployees();
      setEmployees(data);
      
      if (data.length === 0) {
        toast.warning("Aucun employé trouvé dans la base de données");
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      const errorMsg = "Erreur lors du chargement des employés depuis Supabase";
      setConnectionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [setLoading, setConnectionError, checkConnection, setEmployees]);

  // Load employees initially
  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  return {
    loading,
    connectionError,
    isConnected,
    loadEmployees,
    ...employeeManager
  };
}
