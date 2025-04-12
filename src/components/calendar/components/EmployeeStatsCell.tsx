
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface EmployeeStatsCellProps {
  totalStats: number;
}

export function EmployeeStatsCell({ totalStats }: EmployeeStatsCellProps) {
  return (
    <TableCell className="text-right font-medium sticky right-0 bg-white dark:bg-gray-900">
      {totalStats.toFixed(1)}
    </TableCell>
  );
}
