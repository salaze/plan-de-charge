
import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface DepartmentHeaderProps {
  name: string;
  colSpan: number;
  allDepartments?: string[];
  onDepartmentSelect?: (department: string) => void;
}

export function DepartmentHeader({ 
  name, 
  colSpan, 
  allDepartments = [], 
  onDepartmentSelect 
}: DepartmentHeaderProps) {
  return (
    <TableRow className="bg-muted/50 border-t-2 border-b-2 border-primary">
      <TableCell 
        colSpan={colSpan} 
        className="sticky left-0 bg-muted/50 font-bold text-sm py-1 flex items-center justify-between"
      >
        <span>Département: {name}</span>
        
        {onDepartmentSelect && allDepartments.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 text-sm px-2 py-1 rounded hover:bg-accent">
              Changer <ChevronDown className="h-4 w-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="z-50"
              style={{
                backgroundColor: "var(--background)",
                color: "var(--foreground)"
              }}
            >
              {allDepartments.map((dept) => (
                <DropdownMenuItem 
                  key={dept} 
                  onClick={() => onDepartmentSelect(dept)}
                  className={dept === name ? "bg-accent/50" : ""}
                >
                  {dept}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </TableCell>
    </TableRow>
  );
}
