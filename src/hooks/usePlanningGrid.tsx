
import { useState, useEffect, useCallback } from 'react';
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
  
  // État pour suivre si un dialogue est en cours d'édition
  const [isEditing, setIsEditing] = useState(false);
  
  // Écouter les événements d'édition pour mettre à jour l'état local
  useEffect(() => {
    const handleEditStart = () => {
      setIsEditing(true);
    };
    
    const handleEditEnd = () => {
      // Utiliser un délai pour éviter les problèmes de timing
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
    
    // Ne pas permettre l'ouverture d'un nouveau dialogue si l'édition est en cours
    if (isEditing) {
      console.log("Édition en cours, nouvelle sélection ignorée");
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
    
    // Signaler le début de l'édition
    const event = new CustomEvent('statusEditStart');
    window.dispatchEvent(event);
  }, [isAdmin, isEditing]);
  
  // Memoize dialog close handler
  const handleCloseDialog = useCallback(() => {
    setSelectedCell(null);
    setSelectedPeriod('AM');
    
    // Signaler la fin de l'édition après un court délai
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
