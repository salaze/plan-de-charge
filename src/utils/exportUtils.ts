
import { MonthData, DayStatus, StatusCode, STATUS_LABELS, Employee } from '@/types';
import * as XLSX from 'xlsx';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateId } from './idUtils';

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
 * Imports data from an Excel file (.xlsx)
 */
export const importFromExcel = async (file: string | ArrayBuffer): Promise<MonthData | null> => {
  try {
    // Read the workbook
    const wb = XLSX.read(file, { type: file instanceof ArrayBuffer ? 'array' : 'binary' });
    
    // Get the first worksheet
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    
    // Convert worksheet to array of arrays
    const data = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
    
    if (!data || data.length <= 1) {
      throw new Error('Fichier vide ou format invalide');
    }
    
    // Parse the month and year from the sheet name
    let year = new Date().getFullYear();
    let month = new Date().getMonth();
    
    // Try to extract from sheet name if possible
    const sheetNameMatch = wsname.match(/Planning\s+(\w+)\s+(\d{4})/i);
    if (sheetNameMatch) {
      const monthName = sheetNameMatch[1];
      const yearStr = sheetNameMatch[2];
      
      try {
        // Parse month name in French
        const monthDate = parse(monthName, 'MMMM', new Date(), { locale: fr });
        month = monthDate.getMonth();
        year = parseInt(yearStr);
      } catch (e) {
        console.warn('Could not parse month/year from sheet name:', e);
      }
    }
    
    // Extract dates from header row
    const headerRow = data[0] as string[];
    const dates: string[] = [];
    
    for (let i = 1; i < headerRow.length; i++) {
      const dateText = headerRow[i];
      if (dateText && typeof dateText === 'string') {
        const match = dateText.match(/(\d{2})\/(\d{2})/);
        if (match) {
          const day = match[1];
          const monthNum = match[2];
          dates.push(`${year}-${monthNum}-${day}`);
        }
      }
    }
    
    // Create employees from data rows
    const employees: Employee[] = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i] as string[];
      if (!row[0]) continue; // Skip empty rows
      
      const employeeName = row[0];
      const schedule: DayStatus[] = [];
      
      // Extract status for each date
      for (let j = 1; j < row.length && j - 1 < dates.length; j++) {
        const cellValue = row[j];
        if (!cellValue) continue;
        
        const date = dates[j - 1];
        
        // Check for AM/PM split
        if (cellValue.includes('/')) {
          const [amStatus, pmStatus] = cellValue.split('/').map(s => s.trim());
          
          if (amStatus) {
            const statusCode = getStatusCodeFromLabel(amStatus);
            if (statusCode) {
              schedule.push({
                date,
                status: statusCode,
                period: 'AM'
              });
            }
          }
          
          if (pmStatus) {
            const statusCode = getStatusCodeFromLabel(pmStatus);
            if (statusCode) {
              schedule.push({
                date,
                status: statusCode,
                period: 'PM'
              });
            }
          }
        } 
        // Check for AM: or PM: prefix
        else if (cellValue.startsWith('AM:') || cellValue.startsWith('PM:')) {
          const period = cellValue.startsWith('AM:') ? 'AM' : 'PM';
          const statusText = cellValue.substring(3).trim();
          const statusCode = getStatusCodeFromLabel(statusText);
          
          if (statusCode) {
            schedule.push({
              date,
              status: statusCode,
              period
            });
          }
        } 
        // Full day status
        else {
          const statusCode = getStatusCodeFromLabel(cellValue);
          if (statusCode) {
            schedule.push({
              date,
              status: statusCode,
              period: 'AM'
            });
            schedule.push({
              date,
              status: statusCode,
              period: 'PM'
            });
          }
        }
      }
      
      // Add employee
      employees.push({
        id: generateId(),
        name: employeeName,
        schedule
      });
    }
    
    // Create and return MonthData
    return {
      year,
      month,
      employees,
      // Preserve existing projects if any
      projects: getExistingProjects()
    };
    
  } catch (error) {
    console.error('Erreur lors de l\'import Excel:', error);
    throw error;
  }
};

/**
 * Get status code from displayed label
 */
function getStatusCodeFromLabel(label: string): StatusCode | null {
  const normalizedLabel = label.toLowerCase().trim();
  
  // Check if it's a direct match from STATUS_LABELS
  for (const [code, statusLabel] of Object.entries(STATUS_LABELS)) {
    if (statusLabel.toLowerCase() === normalizedLabel) {
      return code as StatusCode;
    }
  }
  
  // If not found, use some common abbreviations/alternative names
  const alternatives: Record<string, StatusCode> = {
    'présent': 'assistance',
    'present': 'assistance',
    'p': 'assistance',
    'abs': 'absence',
    'a': 'absence',
    'congés': 'conges',
    'conges': 'conges',
    'vacances': 'conges',
    'vac': 'conges',
    'v': 'conges',
    'formation': 'formation',
    'form': 'formation',
    't': 'formation',
    'mal': 'absence',
    'maladie': 'absence',
    's': 'absence',
    'tp': 'tp',
    'télétravail': 'tp',
    'teletravail': 'tp',
    'remote': 'tp',
    'proj': 'projet',
    'project': 'projet',
    'mission': 'projet',
    'vigi': 'vigi',
    'management': 'management',
    'coordinateur': 'coordinateur',
    'regisseur': 'regisseur',
    'demenagement': 'demenagement',
    'permanence': 'permanence'
  };
  
  return alternatives[normalizedLabel] || null;
}

/**
 * Get existing projects from localStorage
 */
function getExistingProjects() {
  try {
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const data = JSON.parse(savedData);
      if (data.projects && Array.isArray(data.projects)) {
        return data.projects;
      }
    }
  } catch (e) {
    console.warn('Error getting existing projects:', e);
  }
  
  // Default projects if none found
  return [
    { id: '1', code: 'P001', name: 'Développement interne', color: '#4CAF50' },
    { id: '2', code: 'P002', name: 'Client A', color: '#2196F3' },
    { id: '3', code: 'P003', name: 'Client B', color: '#FF9800' },
    { id: '4', code: 'P004', name: 'Maintenance préventive', color: '#9C27B0' },
    { id: '5', code: 'P005', name: 'Mission externe', color: '#00BCD4' },
  ];
}

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
  if (status === undefined || status === null || status === '') return '';
  return STATUS_LABELS[status] || status;
}
