
import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { StatusCode, DayPeriod } from '@/types';

export function usePlanningGrid(isAdmin: boolean) {
  const isMobile = useIsMobile();
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string;
    date: string;
    currentStatus: StatusCode;
    isHighlighted?: boolean;
    projectCode?: string;
  } | null>(null);
  
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('AM');
  
  const handleCellClick = (employeeId: string, date: string, period: DayPeriod) => {
    if (!isAdmin) {
      toast.info("Mode lecture seule. Connexion administrateur requise pour modifier.");
      return;
    }
    
    // Find the current status for this cell from the schedule
    const getCurrentStatus = (employeeId: string, date: string, period: DayPeriod, employees: any[]) => {
      const employee = employees.find(emp => emp.id === employeeId);
      if (!employee) return { status: '' as StatusCode };
      
      const dayEntry = employee.schedule.find(
        (day: any) => day.date === date && day.period === period
      );
      
      return {
        status: dayEntry?.status || '' as StatusCode,
        isHighlighted: dayEntry?.isHighlighted,
        projectCode: dayEntry?.projectCode
      };
    };
    
    setSelectedCell({
      employeeId,
      date,
      currentStatus: '' as StatusCode, // Will be populated by the component
      isHighlighted: false,
      projectCode: undefined
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
