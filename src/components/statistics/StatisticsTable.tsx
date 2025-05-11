
import React from 'react';
import { StatusCode, STATUS_LABELS } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusCell } from '@/components/calendar/StatusCell';

interface StatisticsTableProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

export const StatisticsTable = ({ chartData, statusCodes, isLoading }: StatisticsTableProps) => {
  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-safe:animate-spin"></div>
        <p className="mt-2">Chargement des statistiques...</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p className="mb-2 font-medium">Aucune donnée disponible.</p>
        <p className="text-sm">Assurez-vous que des employés et des statuts sont configurés dans le planning.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employé</TableHead>
            {statusCodes.map(status => (
              <TableHead key={status}>
                <div className="flex items-center gap-2">
                  <StatusCell status={status} className="w-3 h-3 rounded-full" />
                  {STATUS_LABELS[status]}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {chartData.map((employee) => (
            <TableRow key={employee.name}>
              <TableCell className="font-medium">{employee.name}</TableCell>
              {statusCodes.map(status => (
                <TableCell key={status}>
                  {typeof employee[status] === 'number'
                    ? (employee[status] as number).toFixed(1)
                    : '0.0'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
