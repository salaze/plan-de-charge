
import { useState, useRef, useMemo } from 'react';

type LoadingStateType = 'idle' | 'loading-employees' | 'loading-schedules' | 'calculating';

export const useLoadingState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingState, setLoadingState] = useState<LoadingStateType>('idle');
  const [refreshKey, setRefreshKey] = useState(0);

  const incrementRefreshKey = () => {
    setRefreshKey(prev => prev + 1);
  };

  return {
    isLoading,
    setIsLoading,
    loadingState,
    setLoadingState,
    refreshKey,
    incrementRefreshKey
  };
};
