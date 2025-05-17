
import React from 'react';
import { TableRow, TableCell } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface EmployeeTableSkeletonProps {
  rowCount?: number;
}

export function EmployeeTableSkeleton({ rowCount = 5 }: EmployeeTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rowCount }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-28" /></TableCell>
          <TableCell className="text-right">
            <Skeleton className="h-8 w-24 ml-auto" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
