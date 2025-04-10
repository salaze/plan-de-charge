
import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface HighlightOptionProps {
  isHighlighted: boolean;
  onHighlightChange: (checked: boolean) => void;
}

export function HighlightOption({ isHighlighted, onHighlightChange }: HighlightOptionProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox 
        id="highlight" 
        checked={isHighlighted}
        onCheckedChange={(checked) => onHighlightChange(checked === true)}
      />
      <Label htmlFor="highlight" className="cursor-pointer">
        Entourer de noir (mettre en évidence)
      </Label>
    </div>
  );
}

export default HighlightOption;
