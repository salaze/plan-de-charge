
import { Employee } from '@/types';
import * as XLSX from 'xlsx';
import { generateId } from './idUtils';

/**
 * Exporte les données des employés vers un fichier Excel
 */
export const exportEmployeesToExcel = (employees: Employee[]): void => {
  try {
    if (!employees || employees.length === 0) {
      throw new Error('Aucun employé à exporter');
    }

    // Préparer les données pour Excel
    const headers = ['Nom', 'UID', 'Fonction', 'Département', 'ID'];
    
    const data = employees.map(employee => [
      employee.name,
      employee.uid || '',
      employee.position || '',
      employee.department || '',
      employee.id
    ]);
    
    // Créer le workbook et la worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Employés');
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, `employes_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    console.log('Export des employés en format Excel (.xlsx) effectué avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'export Excel des employés:', error);
    throw error;
  }
};

/**
 * Importe les données des employés depuis un fichier Excel
 */
export const importEmployeesFromExcel = async (file: ArrayBuffer): Promise<Employee[]> => {
  try {
    // Lire le workbook
    const wb = XLSX.read(file, { type: 'array' });
    
    // Obtenir la première worksheet
    const wsname = wb.SheetNames[0];
    const ws = wb.Sheets[wsname];
    
    // Convertir la worksheet en tableau d'objets
    const data = XLSX.utils.sheet_to_json<any>(ws);
    
    if (!data || data.length === 0) {
      throw new Error('Fichier vide ou format invalide');
    }
    
    // Transformer les données en objets Employee
    const employees: Employee[] = data.map(row => {
      const employee: Employee = {
        id: row.ID || generateId(),
        name: row.Nom || row.nom || '',
        uid: row.UID || row.uid || undefined,
        position: row.Fonction || row.Position || row.fonction || row.position || undefined,
        department: row.Département || row.Departement || row.département || row.departement || undefined,
        schedule: []
      };
      
      // S'assurer que le nom est présent
      if (!employee.name) {
        console.warn('Employé sans nom ignoré:', row);
        return null;
      }
      
      return employee;
    }).filter(Boolean) as Employee[];
    
    return employees;
  } catch (error) {
    console.error('Erreur lors de l\'import Excel des employés:', error);
    throw error;
  }
};
