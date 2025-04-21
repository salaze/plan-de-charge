
import React from 'react';
import { StatusManager } from '@/components/admin/StatusManager';

interface StatusesTabProps {
  statuses: any[];
  onStatusesChange: (statuses: any[]) => void;
  isLoading: boolean;
  isConnected: boolean;
}

export function StatusesTab({
  statuses,
  onStatusesChange,
  isLoading,
  isConnected
}: StatusesTabProps) {
  return (
    <StatusManager
      statuses={statuses}
      onStatusesChange={onStatusesChange}
      isLoading={isLoading}
      isConnected={isConnected}
    />
  );
}
