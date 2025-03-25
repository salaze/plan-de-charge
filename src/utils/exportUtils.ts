
import { MonthData, DayStatus, StatusCode, STATUS_LABELS } from '@/types';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Exports the data to an Excel file (.xlsx)
 */
export const exportToExcel = (data: MonthData): void => {
  try {
    if (!data || !data.employees) {
      throw new Error('No data to export');
    }

    // Create worksheet data
    const workbookData = prepareExcelData(data);
    
    // Create a new workbook
    const wb = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const ws = XLSX.utils.aoa_to_sheet(workbookData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, `Planning ${format(new Date(data.year, data.month), 'MMMM yyyy', { locale: fr })}`);
    
    // Generate Excel file and download
    XLSX.writeFile(wb, `planning_${data.year}_${data.month + 1}.xlsx`);
    
    console.log('Export en format Excel (.xlsx) effectué avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    throw error; // Let the caller handle the error
  }
};

/**
 * Prepares data for Excel export
 */
function prepareExcelData(data: MonthData): any[][] {
  const { year, month, employees = [] } = data;
  
  // Get all days in the month
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  
  // Create header row
  const headerRow = [
    'Employé', 
    ...days.map(day => format(new Date(year, month, day), 'dd/MM EEE', { locale: fr }))
  ];
  
  // Create data rows
  const dataRows = employees.map(employee => {
    const employeeRow = [employee.name];
    
    // For each day, get the employee's status
    days.forEach(day => {
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      // Find AM and PM statuses
      const amStatus = employee.schedule.find(s => s.date === date && s.period === 'AM');
      const pmStatus = employee.schedule.find(s => s.date === date && s.period === 'PM');
      
      // Format cell value
      let cellValue = '';
      if (amStatus && pmStatus) {
        if (amStatus.status === pmStatus.status) {
          cellValue = formatStatus(amStatus.status);
        } else {
          cellValue = `${formatStatus(amStatus.status)} / ${formatStatus(pmStatus.status)}`;
        }
      } else if (amStatus) {
        cellValue = `AM: ${formatStatus(amStatus.status)}`;
      } else if (pmStatus) {
        cellValue = `PM: ${formatStatus(pmStatus.status)}`;
      }
      
      employeeRow.push(cellValue);
    });
    
    return employeeRow;
  });
  
  // Return combined rows
  return [headerRow, ...dataRows];
}

/**
 * Format status for display
 */
function formatStatus(status: StatusCode): string {
  if (!status || status === '') return '';
  return STATUS_LABELS[status] || status;
}
