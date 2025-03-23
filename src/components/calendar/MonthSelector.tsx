
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMonthName } from '@/utils';

interface MonthSelectorProps {
  year: number;
  month: number;  // 0-11
  onChange: (year: number, month: number) => void;
}

export function MonthSelector({ year, month, onChange }: MonthSelectorProps) {
  const handlePreviousMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    onChange(newYear, newMonth);
  };
  
  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    
    onChange(newYear, newMonth);
  };
  
  // Génère un tableau d'années (année courante +/- 5 ans)
  const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="flex items-center">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handlePreviousMonth}
          className="mr-2"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-2xl font-bold min-w-40">
          {getMonthName(month)} {year}
        </div>
        
        <Button 
          variant="outline" 
          size="icon" 
          onClick={handleNextMonth}
          className="ml-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex gap-2">
        <Select
          value={month.toString()}
          onValueChange={(value) => onChange(year, parseInt(value))}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Mois" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                {getMonthName(i)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={year.toString()}
          onValueChange={(value) => onChange(parseInt(value), month)}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Année" />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
