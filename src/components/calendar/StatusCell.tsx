
import React from 'react';
import { cn } from '@/lib/utils';
import { StatusCode, STATUS_COLORS, STATUS_LABELS } from '@/types';

interface StatusCellProps {
  status: StatusCode;
  isBadge?: boolean;
  className?: string;
}

export function StatusCell({ status, isBadge = false, className }: StatusCellProps) {
  if (!status) return <span className="text-muted-foreground">-</span>;
  
  if (isBadge) {
    return (
      <span 
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
          STATUS_COLORS[status],
          className
        )}
      >
        {STATUS_LABELS[status]}
      </span>
    );
  }
  
  return (
    <span 
      className={cn(
        "inline-block w-full text-center py-1",
        STATUS_COLORS[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
