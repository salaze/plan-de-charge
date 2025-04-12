
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';

export function EmptyEmployeeTable() {
  return (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
        Aucun employé trouvé
      </TableCell>
    </TableRow>
  );
}
