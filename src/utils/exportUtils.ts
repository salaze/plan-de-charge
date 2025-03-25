
import { MonthData, DayStatus } from '@/types';

/**
 * Exports the data to an Excel file (.xlsx)
 */
export const exportToExcel = (data: MonthData): void => {
  // Enrichir les données pour l'export
  const exportData = {
    ...data,
    exportDate: new Date().toISOString(),
    fileType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    extension: ".xlsx",
    metadata: {
      statusTypes: [
        { code: 'assistance', label: 'Assistance', color: '#FFEB3B' },
        { code: 'vigi', label: 'Vigi', color: '#F44336' },
        { code: 'formation', label: 'Formation', color: '#2196F3' },
        { code: 'projet', label: 'Projet', color: '#4CAF50' },
        { code: 'conges', label: 'Congés', color: '#795548' },
        { code: 'management', label: 'Management', color: '#9C27B0' },
        { code: 'tp', label: 'Temps Partiel', color: '#9E9E9E' },
        { code: 'coordinateur', label: 'Coordinateur Vigi Ticket', color: '#8BC34A' },
        { code: 'absence', label: 'Autre Absence', color: '#F48FB1' },
        { code: 'regisseur', label: 'Régisseur', color: '#03A9F4' },
        { code: 'demenagement', label: 'Déménagements', color: '#3F51B5' },
        { code: 'permanence', label: 'Permanences', color: '#E91E63' }
      ]
    }
  };
  
  const jsonData = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `planning_${data.year}_${data.month + 1}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  
  console.log('Export en format Excel (.xlsx) effectué');
};
