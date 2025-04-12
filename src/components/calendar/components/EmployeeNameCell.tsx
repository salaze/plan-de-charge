
import React from 'react';
import { TableCell } from '@/components/ui/table';

interface EmployeeNameCellProps {
  name: string;
}

export function EmployeeNameCell({ name }: EmployeeNameCellProps) {
  return (
    <TableCell className="sticky left-0 bg-white dark:bg-gray-900 font-medium group-hover:bg-muted/30 truncate max-w-[200px]">
      {name}
    </TableCell>
  );
}
