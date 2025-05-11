
import { useState, useEffect, useRef } from 'react';

interface UseLoadingTimeoutProps {
  isLoading: boolean;
  timeoutDuration?: number;
}

export const useLoadingTimeout = ({ 
  isLoading, 
  timeoutDuration = 10000 
}: UseLoadingTimeoutProps) => {
  const [loadTimeout, setLoadTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Handle loading timeouts
  useEffect(() => {
    if (isLoading) {
      console.log('Statistics loading started, setting up timeout detection');
      const timer = setTimeout(() => {
        console.log('Loading timeout detected!');
        setLoadTimeout(true);
      }, timeoutDuration);
      
      timeoutRef.current = timer;
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    } else {
      setLoadTimeout(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [isLoading, timeoutDuration]);

  return { loadTimeout };
};
