
import React from 'react';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DayPeriod } from '@/types';

interface SelectPeriodProps {
  value: DayPeriod;
  onChange: (value: DayPeriod) => void;
}

export function SelectPeriod({ value, onChange }: SelectPeriodProps) {
  return (
    <div className="space-y-3">
      <Label>Période</Label>
      <RadioGroup 
        value={value} 
        onValueChange={(value) => onChange(value as DayPeriod)}
        className="flex space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="AM" id="am" />
          <Label htmlFor="am">Matin</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="PM" id="pm" />
          <Label htmlFor="pm">Après-midi</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="FULL" id="full" />
          <Label htmlFor="full">Journée complète</Label>
        </div>
      </RadioGroup>
    </div>
  );
}
