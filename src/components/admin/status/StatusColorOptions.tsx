
import React from 'react';
import { Button } from '@/components/ui/button';

interface ColorOption {
  value: string;
  label: string;
}

interface StatusColorOptionsProps {
  colorOptions: ColorOption[];
  selectedColor: string;
  onColorChange: (color: string) => void;
}

export function StatusColorOptions({ 
  colorOptions, 
  selectedColor, 
  onColorChange 
}: StatusColorOptionsProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {colorOptions.map((colorOption) => (
        <Button
          key={colorOption.value}
          type="button"
          variant="outline"
          className={`h-10 ${selectedColor === colorOption.value ? 'ring-2 ring-primary' : ''}`}
          onClick={() => onColorChange(colorOption.value)}
        >
          <div className={`w-full h-6 rounded ${colorOption.value} flex items-center justify-center`}>
            {colorOption.label}
          </div>
        </Button>
      ))}
    </div>
  );
}

export default StatusColorOptions;
