
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Fingerprint } from 'lucide-react';

interface EmployeeContactFieldProps {
  uid: string;
  onChange: (value: string) => void;
}

export function EmployeeContactField({ uid, onChange }: EmployeeContactFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="uid">UID *</Label>
      <div className="flex items-center gap-2 relative">
        <Fingerprint className="h-4 w-4 absolute left-3 text-muted-foreground" />
        <Input
          id="uid"
          type="text"
          value={uid}
          onChange={(e) => onChange(e.target.value)}
          placeholder="UID de l'employé"
          className="pl-10"
          required
        />
      </div>
    </div>
  );
}
