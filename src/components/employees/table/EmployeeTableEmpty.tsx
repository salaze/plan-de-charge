
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';

export function EmployeeTableEmpty() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
        Aucun employé trouvé
      </TableCell>
    </TableRow>
  );
}
