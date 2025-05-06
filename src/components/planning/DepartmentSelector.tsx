
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building } from 'lucide-react';

interface DepartmentSelectorProps {
  departments: string[];
  selectedDepartment: string | null;
  onDepartmentChange: (department: string | null) => void;
  isLoading?: boolean;
}

export function DepartmentSelector({
  departments,
  selectedDepartment,
  onDepartmentChange,
  isLoading = false
}: DepartmentSelectorProps) {
  // Gérer la sélection
  const handleSelectionChange = (value: string) => {
    if (value === "all") {
      onDepartmentChange(null);
    } else {
      onDepartmentChange(value);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Building className="h-4 w-4 text-muted-foreground" />
      <Select
        value={selectedDepartment || "all"}
        onValueChange={handleSelectionChange}
        disabled={isLoading || departments.length === 0}
      >
        <SelectTrigger className="w-[200px] h-9">
          <SelectValue placeholder="Sélectionnez un département" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les départements</SelectItem>
          {departments.map(dept => (
            <SelectItem key={dept} value={dept}>
              {dept}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
