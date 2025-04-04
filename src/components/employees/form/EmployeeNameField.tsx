
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EmployeeNameFieldProps {
  name: string;
  onChange: (value: string) => void;
}

export function EmployeeNameField({ name, onChange }: EmployeeNameFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="name">Nom *</Label>
      <Input
        id="name"
        value={name}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nom de l'employé"
        required
      />
    </div>
  );
}
