
import { useState, useCallback } from 'react';
import { StatusCode } from '@/types';
import { useStatusLoader } from './status/useStatusLoader';
import { useStatusEvents } from './status/useStatusEvents';

export function useStatusOptions() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { availableStatuses, isLoading } = useStatusLoader();
  
  const handleStatusesUpdated = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  useStatusEvents(handleStatusesUpdated);

  return {
    statuses: availableStatuses,
    isLoading
  };
}

export default useStatusOptions;
