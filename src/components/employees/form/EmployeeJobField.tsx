
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Briefcase, Building } from 'lucide-react';

interface EmployeeJobFieldProps {
  position: string;
  department: string;
  onPositionChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
}

export function EmployeeJobField({ 
  position, 
  department, 
  onPositionChange, 
  onDepartmentChange 
}: EmployeeJobFieldProps) {
  return (
    <>
      <div className="grid gap-2">
        <Label htmlFor="position">Fonction</Label>
        <div className="flex items-center gap-2 relative">
          <Briefcase className="h-4 w-4 absolute left-3 text-muted-foreground" />
          <Input
            id="position"
            value={position}
            onChange={(e) => onPositionChange(e.target.value)}
            placeholder="Fonction de l'employé"
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="department">Département</Label>
        <div className="flex items-center gap-2 relative">
          <Building className="h-4 w-4 absolute left-3 text-muted-foreground" />
          <Input
            id="department"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            placeholder="Département de l'employé"
            className="pl-10"
          />
        </div>
      </div>
    </>
  );
}
