
import React from 'react';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { StatusCode, STATUS_COLORS } from '@/types';

interface StatusOptionProps {
  value: StatusCode;
  label: string;
}

export function StatusOption({ value, label }: StatusOptionProps) {
  return (
    <div 
      className="flex items-center space-x-2 rounded-md border p-2 hover:bg-secondary/50 transition-colors"
    >
      <RadioGroupItem value={value} id={`status-${value}`} />
      <Label htmlFor={`status-${value}`} className="flex-1 cursor-pointer">
        <div className="flex items-center gap-2">
          {value && STATUS_COLORS[value] && (
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: value ? STATUS_COLORS[value].split(' ')[0].replace('bg-', '') : 'transparent',
              }}
            />
          )}
          {label}
        </div>
      </Label>
    </div>
  );
}

export default StatusOption;
