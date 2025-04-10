
import React from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportStatsToExcel } from '@/utils/statsExportUtils';
import { calculateEmployeeStats } from '@/utils/statsUtils';

interface ExportStatsButtonProps {
  selectedDepartment: string;
  currentYear: number;
  currentMonth: number;
}

export const ExportStatsButton: React.FC<ExportStatsButtonProps> = ({
  selectedDepartment,
  currentYear,
  currentMonth
}) => {
  const handleExportStats = () => {
    try {
      const savedData = localStorage.getItem('planningData');
      if (!savedData) {
        toast.error('Aucune donnée disponible');
        return;
      }
      
      const data = JSON.parse(savedData);
      let employees = data.employees || [];
      
      // Filter by department if needed
      if (selectedDepartment !== "all") {
        employees = employees.filter(emp => emp.department === selectedDepartment);
      }
      
      const year = currentYear || new Date().getFullYear();
      const month = currentMonth || new Date().getMonth();
      
      if (employees.length === 0) {
        toast.error('Aucun employé pour calculer les statistiques');
        return;
      }
      
      const stats = employees.map(employee => calculateEmployeeStats(employee, year, month));
      
      exportStatsToExcel(stats);
      toast.success('Statistiques exportées avec succès au format Excel');
    } catch (error) {
      console.error('Erreur lors de l\'export des statistiques:', error);
      toast.error('Une erreur est survenue lors de l\'export des statistiques');
    }
  };
  
  return (
    <Button onClick={handleExportStats} className="w-full">
      <FileSpreadsheet className="h-4 w-4 mr-2" />
      Exporter les statistiques au format Excel
    </Button>
  );
};
