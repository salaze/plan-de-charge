
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
      <div className="text-center p-4">Loading statistics...</div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        <p className="mb-2">No data available.</p>
        <p className="text-sm">Make sure employees and statuses are configured in the planning.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
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
