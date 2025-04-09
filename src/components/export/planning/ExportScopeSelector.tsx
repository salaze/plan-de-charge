
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ExportScopeSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export const ExportScopeSelector: React.FC<ExportScopeSelectorProps> = ({
  value,
  onValueChange
}) => {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Période</label>
      <Select
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez une période" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="day">Jour</SelectItem>
          <SelectItem value="week">Semaine</SelectItem>
          <SelectItem value="month">Mois</SelectItem>
          <SelectItem value="custom">Personnalisée</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
