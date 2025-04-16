
import { MonthData, StatusCode, DayStatus, Employee } from '@/types';
import * as XLSX from 'xlsx';
import { parse } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateId } from '@/utils/idUtils';
import { getStatusCodeFromLabel } from './statusUtils';
import { getExistingProjects } from './projectUtils';

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
    const headerRow = Array.isArray(data[0]) ? data[0] : [];
    const dates: string[] = [];
    
    for (let i = 1; i < headerRow.length; i++) {
      const dateText = headerRow[i];
      if (dateText && typeof dateText === 'string') {
        // Check for AM/PM format in header
        const dateOnly = dateText.replace(/\s+\(AM\)|\s+\(PM\)/g, '');
        const match = dateOnly.match(/(\d{2})\/(\d{2})/);
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
      const row = Array.isArray(data[i]) ? data[i] : [];
      if (!row[0]) continue; // Skip empty rows
      
      const employeeName = row[0];
      const schedule: DayStatus[] = [];
      
      // Extract status for each date
      let dateIndex = 0;
      for (let j = 1; j < row.length && dateIndex < dates.length; j++) {
        const cellValue = row[j];
        const date = dates[dateIndex];
        
        // Determine if this is AM or PM based on column index
        const period = j % 2 === 1 ? 'AM' : 'PM';
        
        // Move to next date only after processing PM (even columns)
        if (period === 'PM') {
          dateIndex++;
        }
        
        if (cellValue) {
          const statusCode = getStatusCodeFromLabel(cellValue);
          if (statusCode) {
            schedule.push({
              date,
              status: statusCode,
              period
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
    
    // Create and return MonthData with safe defaults
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
