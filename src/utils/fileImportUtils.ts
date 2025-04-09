
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { MonthData } from '@/types';
import { getExistingProjects } from './excel/projectsHelper';

/**
 * Handles file import from Excel
 */
export const handleFileImport = (
  e: React.ChangeEvent<HTMLInputElement>, 
  onSuccess: (data: MonthData) => void
) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  // Check file type
  const fileType = file.name.split('.').pop()?.toLowerCase();
  if (fileType !== 'xlsx') {
    toast.error('Format de fichier non supporté. Veuillez utiliser un fichier Excel (.xlsx)');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      if (!event.target?.result) {
        throw new Error('Failed to read file');
      }
      
      // Read the file
      const workbook = XLSX.read(event.target.result, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Process the data
      const processedData: MonthData = {
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        employees: jsonData.map((row: any) => ({
          name: row.Employé || row.Employe || row.Nom || '',
          schedule: []
        })),
        projects: getExistingProjects() // Add existing projects
      };
      
      onSuccess(processedData);
    } catch (error) {
      console.error('Error importing file:', error);
      toast.error('Erreur lors de l\'importation du fichier');
    }
  };
  
  reader.readAsArrayBuffer(file);
};
