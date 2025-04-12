
import { useState } from 'react';
import { usePlanningData } from './usePlanningData';
import { useDateSelection } from './useDateSelection';

// This hook is kept for compatibility but functionality is removed
export const useExportActions = (selectedDepartment: string) => {
  const planningData = usePlanningData();
  const { currentYear, currentMonth } = useDateSelection();
  
  // Empty functions since export functionality is removed
  const handleExport = () => {};
  const handleExportEmployees = () => {};
  const handleExportStats = () => {};
  
  return {
    handleExport,
    handleExportEmployees,
    handleExportStats
  };
};
