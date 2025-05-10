
import * as XLSX from 'xlsx';
import { StatusCode, STATUS_LABELS } from '@/types';
import { toast } from 'sonner';

/**
 * Exporte les données du tableau de statistiques vers un fichier Excel
 */
export const exportTableToExcel = (
  data: Array<{ name: string; [key: string]: number | string }>,
  statusCodes: StatusCode[],
  filename: string = 'export'
): void => {
  try {
    if (!data || data.length === 0) {
      toast.error('Aucune donnée à exporter');
      return;
    }

    // Créer les en-têtes du tableau
    const headers = ['Employé', ...statusCodes.map(code => STATUS_LABELS[code] || code)];
    
    // Préparer les données
    const excelData = data.map(row => {
      const rowData: (string | number)[] = [row.name];
      
      statusCodes.forEach(status => {
        const value = row[status];
        rowData.push(typeof value === 'number' ? Number(value.toFixed(1)) : 0);
      });
      
      return rowData;
    });
    
    // Ajouter les en-têtes au début des données
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...excelData]);
    
    // Créer un classeur et y ajouter la feuille
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistiques');
    
    // Générer le fichier Excel avec la date actuelle
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${filename}_${date}.xlsx`);
    
    toast.success('Données exportées avec succès au format Excel');
  } catch (error) {
    console.error('Erreur lors de l\'export Excel:', error);
    toast.error('Une erreur est survenue lors de l\'export des données');
  }
};
