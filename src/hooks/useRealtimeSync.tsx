
import { useState } from 'react';
import { useEditStateTracker } from './realtime/useEditStateTracker';
import { useRealtimeChannels } from './realtime/useRealtimeChannels';

export const useRealtimeSync = (isConnected: boolean, onDataChange: () => void) => {
  const { isEditingRef, pendingRefreshRef } = useEditStateTracker(onDataChange);
  const { isListening } = useRealtimeChannels(isConnected, isEditingRef, pendingRefreshRef, onDataChange);

  return { isListening };
};

export default useRealtimeSync;
