
import { useState, useEffect, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { 
  setupStatusChannel, 
  setupEmployeesChannel, 
  setupScheduleChannel, 
  cleanupChannels 
} from '@/utils/realtime/realtimeUtils';

export const useRealtimeChannels = (
  isConnected: boolean,
  isEditingRef: { current: boolean },
  pendingRefreshRef: { current: boolean },
  onDataChange: () => void
) => {
  const [isListening, setIsListening] = useState(false);
  const channelsRef = useRef<RealtimeChannel[]>([]);
  const reconnectTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Function to setup all realtime channels
    const setupChannels = () => {
      if (!isConnected) return;
      
      try {
        // Cleanup existing channels first
        if (channelsRef.current.length > 0) {
          cleanupChannels(channelsRef.current);
          channelsRef.current = [];
        }
        
        // Setup status channel
        const statusChannel = setupStatusChannel(
          isEditingRef,
          pendingRefreshRef,
          () => onDataChange()
        );
        channelsRef.current.push(statusChannel);
        
        // Setup employees channel
        const employeesChannel = setupEmployeesChannel(
          isEditingRef,
          pendingRefreshRef,
          () => onDataChange()
        );
        channelsRef.current.push(employeesChannel);
        
        // Setup schedule channel
        const scheduleChannel = setupScheduleChannel(
          isEditingRef,
          pendingRefreshRef,
          () => onDataChange()
        );
        channelsRef.current.push(scheduleChannel);
        
        setIsListening(true);
      } catch (error) {
        console.error('Erreur lors de la configuration des canaux realtime:', error);
        setIsListening(false);
        
        // Try to reconnect after a delay
        if (reconnectTimerRef.current === null) {
          reconnectTimerRef.current = window.setTimeout(() => {
            console.log('Tentative de reconnexion aux canaux realtime...');
            setupChannels();
            reconnectTimerRef.current = null;
          }, 5000);
        }
      }
    };
    
    // Setup channels when connected
    if (isConnected) {
      setupChannels();
    } else {
      // Clean up channels when disconnected
      if (channelsRef.current.length > 0) {
        cleanupChannels(channelsRef.current);
        channelsRef.current = [];
        setIsListening(false);
      }
    }
    
    // Cleanup function
    return () => {
      cleanupChannels(channelsRef.current);
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };
  }, [isConnected, isEditingRef, pendingRefreshRef, onDataChange]);

  return { isListening };
};
