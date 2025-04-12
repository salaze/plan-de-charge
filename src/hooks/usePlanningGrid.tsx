
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { StatusCode, DayPeriod } from '@/types';

export function usePlanningGrid(isAdmin: boolean) {
  const isMobile = useIsMobile();
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string;
    date: string;
    period: DayPeriod;
  } | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('AM');
  
  const handleCellClick = (employeeId: string, date: string, period: DayPeriod) => {
    if (!isAdmin) {
      toast.info("Mode lecture seule. Connexion administrateur requise pour modifier.");
      return;
    }
    
    if (!employeeId || !date) {
      console.error("ID employé ou date invalide", { employeeId, date });
      return;
    }
    
    console.log("Cellule sélectionnée:", { employeeId, date, period });
    
    setSelectedCell({
      employeeId,
      date,
      period
    });
    
    setSelectedPeriod(period);
  };
  
  const handleCloseDialog = () => {
    setSelectedCell(null);
    setSelectedPeriod('AM');
  };
  
  // Helper function to get visible days for mobile or desktop
  const getVisibleDays = (days: Date[], year: number, month: number) => {
    if (isMobile) {
      // On mobile, show fewer days
      const today = new Date();
      if (today.getFullYear() === year && today.getMonth() === month) {
        // If it's the current month, start with the current date
        const currentDay = today.getDate() - 1; // 0-indexed
        return days.slice(
          Math.max(0, Math.min(currentDay, days.length - 4)), 
          Math.max(4, Math.min(currentDay + 4, days.length))
        );
      }
      return days.slice(0, Math.min(4, days.length));
    }
    return days;
  };
  
  return {
    selectedCell,
    setSelectedCell,
    selectedPeriod,
    setSelectedPeriod,
    handleCellClick,
    handleCloseDialog,
    getVisibleDays
  };
}
