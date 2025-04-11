
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EmployeeFilterSelectProps {
  employees: { id: string; name: string }[];
  selectedEmployeeId: string | undefined;
  onChange: (employeeId: string | undefined) => void;
}

export function EmployeeFilterSelect({ employees, selectedEmployeeId, onChange }: EmployeeFilterSelectProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="employee">Employé</Label>
      <Select
        value={selectedEmployeeId || ""}
        onValueChange={(value) => onChange(value || undefined)}
      >
        <SelectTrigger id="employee">
          <SelectValue placeholder="Tous les employés" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous les employés</SelectItem>
          {employees.map(employee => (
            <SelectItem key={employee.id} value={employee.id}>
              {employee.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
