
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

interface DepartmentHeaderProps {
  name: string;
  colSpan: number;
}

export function DepartmentHeader({ name, colSpan }: DepartmentHeaderProps) {
  return (
    <TableRow className="bg-muted/50 border-t-2 border-b-2 border-primary">
      <TableCell 
        colSpan={colSpan} 
        className="sticky left-0 bg-muted/50 font-bold text-sm py-1"
      >
        Département: {name}
      </TableCell>
    </TableRow>
  );
}
