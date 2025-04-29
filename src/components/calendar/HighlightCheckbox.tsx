
import React from 'react';
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface HighlightCheckboxProps {
  highlighted: boolean;
  onChange: (highlighted: boolean) => void;
}

export function HighlightCheckbox({ highlighted, onChange }: HighlightCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="highlight"
        checked={highlighted}
        onCheckedChange={(checked) => {
          // Handle the "indeterminate" state properly
          const isChecked = checked === "indeterminate" ? false : checked;
          onChange(isChecked);
        }}
      />
      <Label htmlFor="highlight">Mettre en évidence</Label>
    </div>
  );
}
