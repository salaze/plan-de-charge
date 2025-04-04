
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Fingerprint } from 'lucide-react';

interface EmployeeUidFieldProps {
  uid: string;
  onChange: (value: string) => void;
  error?: string;
}

export function EmployeeUidField({ uid, onChange, error }: EmployeeUidFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="uid">UID *</Label>
      <div className="flex items-center gap-2 relative">
        <Fingerprint className="h-4 w-4 absolute left-3 text-muted-foreground" />
        <Input
          id="uid"
          value={uid}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Identifiant unique"
          className="pl-10"
          required
        />
      </div>
      {error && (
        <p className="text-sm font-medium text-destructive">{error}</p>
      )}
    </div>
  );
}
