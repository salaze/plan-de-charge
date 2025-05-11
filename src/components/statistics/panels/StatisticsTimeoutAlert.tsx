
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface StatisticsTimeoutAlertProps {
  onRetry: () => void;
}

export const StatisticsTimeoutAlert = ({ onRetry }: StatisticsTimeoutAlertProps) => {
  return (
    <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4 rounded">
      <div className="flex items-center">
        <AlertTriangle className="h-5 w-5 mr-2" />
        <p>The data is taking longer than expected to load. You can continue waiting or try refreshing.</p>
      </div>
      <Button 
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="mt-2"
      >
        Retry
      </Button>
    </div>
  );
};
