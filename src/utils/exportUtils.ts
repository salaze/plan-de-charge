
import { MonthData } from '@/types';

/**
 * Exports the data to a JSON file (simulating Excel export)
 */
export const exportToExcel = (data: MonthData): void => {
  const jsonData = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `planning_${data.year}_${data.month + 1}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  // In a real app, use a library like xlsx to generate a proper Excel file
  console.log('Export to Excel feature would be implemented here with a proper Excel library');
};
