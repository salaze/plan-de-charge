
import { SummaryStats } from '@/types';
import * as XLSX from 'xlsx';

/**
 * Exporte les statistiques vers un fichier Excel
 */
export const exportStatsToExcel = (stats: SummaryStats[]): void => {
  try {
    if (!stats || stats.length === 0) {
      throw new Error('Aucune statistique à exporter');
    }

    // Préparer les données pour Excel
    const headers = [
      'Employé', 
      'Jours Total', 
      'Jours Présent', 
      'Jours Absent', 
      'Jours Congés',
      'Jours Formation',
      'Jours Management',
      'Jours Projet',
      'Jours Vigi',
      'Jours TP',
      'Jours Coordinateur',
      'Jours Autres Absences',
      'Jours Régisseur',
      'Jours Déménagement',
      'Jours Permanence'
    ];
    
    const data = stats.map(stat => [
      stat.employeeName || 'Inconnu',
      stat.totalDays,
      stat.presentDays,
      stat.absentDays,
      stat.vacationDays,
      stat.trainingDays,
      stat.managementDays,
      stat.projectDays,
      stat.vigiDays,
      stat.tpDays,
      stat.coordinatorDays,
      stat.otherAbsenceDays,
      stat.regisseurDays,
      stat.demenagementDays,
      stat.permanenceDays
    ]);
    
    // Créer le workbook et la worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    
    // Ajouter la worksheet au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');
    
    // Si des projets sont présents dans les stats, ajouter une feuille pour eux
    if (stats.some(stat => Object.keys(stat.projectStats).length > 0)) {
      const projectsData: any[] = [];
      const projectsHeaders = ['Employé', 'Code Projet', 'Jours'];
      
      stats.forEach(stat => {
        if (stat.employeeName && Object.keys(stat.projectStats).length > 0) {
          Object.entries(stat.projectStats).forEach(([projectCode, days]) => {
            projectsData.push([stat.employeeName, projectCode, days]);
          });
        }
      });
      
      if (projectsData.length > 0) {
        const projectsWs = XLSX.utils.aoa_to_sheet([projectsHeaders, ...projectsData]);
        XLSX.utils.book_append_sheet(wb, projectsWs, 'Projets');
      }
    }
    
    // Générer le fichier Excel et le télécharger
    XLSX.writeFile(wb, `statistiques_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    
    console.log('Export des statistiques en format Excel (.xlsx) effectué avec succès');
  } catch (error) {
    console.error('Erreur lors de l\'export Excel des statistiques:', error);
    throw error;
  }
};
