
import { useMemo } from 'react';

export const useWorkerDetection = () => {
  // Check if Web Workers are available and would be beneficial
  const canUseWebWorkers = useMemo(() => {
    return typeof Worker !== 'undefined';
  }, []);
  
  return {
    canUseWebWorkers,
    shouldUseWorkers: (employeeCount: number) => {
      return canUseWebWorkers && employeeCount > 10;
    }
  };
};
