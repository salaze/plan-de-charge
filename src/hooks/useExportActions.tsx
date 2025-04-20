
import { useState } from 'react';
import { usePlanningData } from './planning/usePlanningData';
import { useDateSelection } from './useDateSelection';

export const useExportActions = (selectedDepartment: string) => {
  const { data: planningData } = usePlanningData();
  const { currentYear, currentMonth } = useDateSelection();
  
  const handleExport = () => {
    const element = document.querySelector('[data-action="export-planning"]') as HTMLButtonElement;
    if (element) element.click();
  };
  
  const handleExportEmployees = () => {
    const element = document.querySelector('[data-action="export-employees"]') as HTMLButtonElement;
    if (element) element.click();
  };
  
  const handleExportStats = () => {
    const element = document.querySelector('[data-action="export-stats"]') as HTMLButtonElement;
    if (element) element.click();
  };
  
  return {
    handleExport,
    handleExportEmployees,
    handleExportStats
  };
};
