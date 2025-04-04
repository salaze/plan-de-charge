
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';

interface EmployeeContactFieldProps {
  email: string;
  onChange: (value: string) => void;
}

export function EmployeeContactField({ email, onChange }: EmployeeContactFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="email">Email</Label>
      <div className="flex items-center gap-2 relative">
        <Mail className="h-4 w-4 absolute left-3 text-muted-foreground" />
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Email de l'employé"
          className="pl-10"
        />
      </div>
    </div>
  );
}
