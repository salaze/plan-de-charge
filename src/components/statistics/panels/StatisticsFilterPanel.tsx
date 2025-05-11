
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Filter, RefreshCw, Loader2 } from 'lucide-react';

interface StatisticsFilterPanelProps {
  departments: Array<{ value: string; label: string }>;
  selectedDepartment: string;
  onDepartmentChange: (dept: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const StatisticsFilterPanel = ({
  departments,
  selectedDepartment,
  onDepartmentChange,
  onRefresh,
  isLoading
}: StatisticsFilterPanelProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4" />
        <Select
          value={selectedDepartment}
          onValueChange={onDepartmentChange}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept.value} value={dept.value}>
                {dept.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        variant="outline"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="flex items-center gap-1"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </>
        )}
      </Button>
    </div>
  );
};
