
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { StatusCode, DayPeriod } from '@/types';

export function usePlanningGrid(isAdmin: boolean) {
  const isMobile = useIsMobile();
  const [selectedCell, setSelectedCell] = useState<{
    employeeId: string;
    date: string;
    period: DayPeriod;
    currentStatus: StatusCode;
    isHighlighted?: boolean;
    projectCode?: string;
  } | null>(null);
  
  // Initialize selectedPeriod with 'AM' as the default
  const [selectedPeriod, setSelectedPeriod] = useState<DayPeriod>('AM');
  
  // State to track if a dialog is being edited
  const [isEditing, setIsEditing] = useState(false);
  
  // Listen for edit events to update the local state
  useEffect(() => {
    const handleEditStart = () => {
      setIsEditing(true);
    };
    
    const handleEditEnd = () => {
      // Use a delay to avoid timing issues
      setTimeout(() => {
        setIsEditing(false);
      }, 500);
    };
    
    window.addEventListener('statusEditStart', handleEditStart);
    window.addEventListener('statusEditEnd', handleEditEnd);
    
    return () => {
      window.removeEventListener('statusEditStart', handleEditStart);
      window.removeEventListener('statusEditEnd', handleEditEnd);
    };
  }, []);
  
  // Memoize cell click handler to prevent unnecessary re-renders
  const handleCellClick = useCallback((employeeId: string, date: string, period: DayPeriod) => {
    if (!isAdmin) {
      toast.info("Mode lecture seule. Connexion administrateur requise pour modifier.");
      return;
    }
    
    // Do not allow opening a new dialog if editing is in progress
    if (isEditing) {
      console.log("Editing in progress, new selection ignored");
      return;
    }
    
    setSelectedCell({
      employeeId,
      date,
      period,
      currentStatus: '' as StatusCode, // Will be populated by the component
      isHighlighted: false,
      projectCode: undefined
    });
    
    setSelectedPeriod(period);
    
    // Signal the start of editing
    const event = new CustomEvent('statusEditStart');
    window.dispatchEvent(event);
  }, [isAdmin, isEditing]);
  
  // Memoize dialog close handler
  const handleCloseDialog = useCallback(() => {
    setSelectedCell(null);
    setSelectedPeriod('AM');
    
    // Signal the end of editing after a short delay
    setTimeout(() => {
      const event = new CustomEvent('statusEditEnd');
      window.dispatchEvent(event);
    }, 300);
  }, []);
  
  // Helper function to get visible days for mobile or desktop
  const getVisibleDays = useCallback((days: Date[], year: number, month: number) => {
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
  }, [isMobile]);
  
  return {
    selectedCell,
    setSelectedCell,
    selectedPeriod,
    setSelectedPeriod,
    isEditing,
    handleCellClick,
    handleCloseDialog,
    getVisibleDays
  };
}
