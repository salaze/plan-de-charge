
import { useState, useEffect } from 'react';
import { StatusCode } from '@/types';
import { useStatusFetcher } from './useStatusFetcher';
import { useStatusRealtime } from './useStatusRealtime';
import { useStatusUpdateEvents } from './useStatusUpdateEvents';

interface UseStatusLoaderResult {
  availableStatuses: StatusCode[];
  isLoading: boolean;
  refreshStatuses: () => void;
}

export function useStatusLoader(): UseStatusLoaderResult {
  const { statuses, isLoading, fetchStatuses } = useStatusFetcher();
  const [availableStatuses, setAvailableStatuses] = useState<StatusCode[]>([]);

  // Update available statuses when statuses change
  useEffect(() => {
    setAvailableStatuses(statuses);
  }, [statuses]);

  // Initialize status loading
  useEffect(() => {
    console.log("useStatusLoader: Initial component mount");
    fetchStatuses();
  }, []);

  // Set up real-time updates
  useStatusRealtime(fetchStatuses);
  
  // Set up status update events
  useStatusUpdateEvents(fetchStatuses);

  return { 
    availableStatuses, 
    isLoading, 
    refreshStatuses: fetchStatuses 
  };
}
