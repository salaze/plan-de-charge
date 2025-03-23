
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getMonthName } from '@/utils/dataUtils';

interface MonthSelectorProps {
  year: number;
  month: number;
  onChange: (year: number, month: number) => void;
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const handlePreviousMonth = () => {
    if (month === 0) {
      onChange(year - 1, 11);
    } else {
      onChange(year, month - 1);
    }
  };
  
  const handleNextMonth = () => {
    if (month === 11) {
      onChange(year + 1, 0);
    } else {
      onChange(year, month + 1);
    }
  };
  
  return (
    <div className="flex items-center justify-between mb-4">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handlePreviousMonth}
        className="transition-transform hover:scale-105"
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      
      <h2 className="text-2xl font-semibold">
        {getMonthName(month)} {year}
      </h2>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleNextMonth}
        className="transition-transform hover:scale-105"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}
