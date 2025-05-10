
import React from 'react';
import { StatisticsTable } from '../StatisticsTable';
import { StatusCode } from '@/types';
import { Button } from '@/components/ui/button';
import { FileSpreadsheet } from 'lucide-react';
import { exportTableToExcel } from '@/utils/tableExportUtils';

interface StatisticsTablePanelProps {
  chartData: Array<{ name: string; [key: string]: number | string }>;
  statusCodes: StatusCode[];
  isLoading: boolean;
}

export const StatisticsTablePanel = ({ chartData, statusCodes, isLoading }: StatisticsTablePanelProps) => {
  const handleExportTable = () => {
    exportTableToExcel(chartData, statusCodes, 'statistiques_par_employe');
  };

  return (
    <div className="glass-panel p-6 animate-scale-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Répartition des statuts par employé</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleExportTable}
          disabled={isLoading || !chartData || chartData.length === 0}
          className="flex items-center gap-1"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Exporter</span>
        </Button>
      </div>
      <StatisticsTable 
        chartData={chartData}
        statusCodes={statusCodes}
        isLoading={isLoading}
      />
    </div>
  );
};
