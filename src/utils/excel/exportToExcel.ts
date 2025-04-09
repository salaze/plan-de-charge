
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
  const days = Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1));
  
  // Create header row with AM/PM columns for each day
  const headerRow = ['Employé'];
  
  days.forEach(day => {
    const formattedDay = format(day, 'dd/MM EEE', { locale: fr });
    // Add explicit AM column
    headerRow.push(`${formattedDay} (AM)`);
    // Add explicit PM column
    headerRow.push(`${formattedDay} (PM)`);
  });
  
  // Create data rows
  const dataRows = employees.map(employee => {
    const employeeRow = [employee.name];
    
    // For each day, get the employee's AM and PM statuses
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      
      // Find AM status
      const amStatusEntry = employee.schedule.find(
        s => s.date === dateStr && (s.period === 'AM' || s.period === 'FULL')
      );
      
      // Find PM status
      const pmStatusEntry = employee.schedule.find(
        s => s.date === dateStr && (s.period === 'PM' || s.period === 'FULL')
      );
      
      // Format AM status
      let amCellValue = '';
      if (amStatusEntry) {
        amCellValue = formatStatus(amStatusEntry.status);
        if (amStatusEntry.isHighlighted) {
          amCellValue += ' (Permanence)';
        }
        if (amStatusEntry.status === 'projet' && amStatusEntry.projectCode) {
          amCellValue += ` - ${amStatusEntry.projectCode}`;
        }
      }
      
      // Format PM status
      let pmCellValue = '';
      if (pmStatusEntry) {
        pmCellValue = formatStatus(pmStatusEntry.status);
        if (pmStatusEntry.isHighlighted) {
          pmCellValue += ' (Permanence)';
        }
        if (pmStatusEntry.status === 'projet' && pmStatusEntry.projectCode) {
          pmCellValue += ` - ${pmStatusEntry.projectCode}`;
        }
      }
      
      employeeRow.push(amCellValue);
      employeeRow.push(pmCellValue);
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
  if (status === undefined || status === null || status === '') return '';
  return STATUS_LABELS[status] || status;
}
