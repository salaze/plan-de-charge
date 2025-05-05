
import React, { useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EmployeeFilterSelectProps {
  employees: { id: string; name: string }[];
  selectedEmployeeId: string | undefined;
  onChange: (employeeId: string | undefined) => void;
}

export function EmployeeFilterSelect({ employees, selectedEmployeeId, onChange }: EmployeeFilterSelectProps) {
  // Trier les employés par nom pour faciliter la recherche
  const sortedEmployees = useMemo(() => {
    return [...employees].sort((a, b) => a.name.localeCompare(b.name));
  }, [employees]);

  return (
    <div className="space-y-2">
      <Label htmlFor="employee">Employé</Label>
      <Select
        value={selectedEmployeeId || "all"}
        onValueChange={(value) => onChange(value === "all" ? undefined : value)}
      >
        <SelectTrigger id="employee">
          <SelectValue placeholder="Tous les employés" />
        </SelectTrigger>
        <SelectContent>
          <ScrollArea className="h-72">
            <SelectItem value="all">Tous les employés ({employees.length})</SelectItem>
            {sortedEmployees.map(employee => (
              <SelectItem 
                key={employee.id} 
                value={employee.id || `employee-${employee.name.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {employee.name}
              </SelectItem>
            ))}
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  );
}
