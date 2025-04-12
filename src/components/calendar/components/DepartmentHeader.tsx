
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

interface DepartmentHeaderProps {
  name: string;
  colSpan: number;
}

export function DepartmentHeader({ name, colSpan }: DepartmentHeaderProps) {
  return (
    <TableRow className="bg-muted/50">
      <TableCell colSpan={colSpan} className="py-2 px-4 font-semibold">
        {name}
      </TableCell>
    </TableRow>
  );
}
