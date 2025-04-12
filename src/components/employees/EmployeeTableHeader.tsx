
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function EmployeeTableHeader() {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>Nom</TableHead>
        <TableHead>Identifiant</TableHead>
        <TableHead>Fonction</TableHead>
        <TableHead>Département</TableHead>
        <TableHead className="text-right">Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
}
