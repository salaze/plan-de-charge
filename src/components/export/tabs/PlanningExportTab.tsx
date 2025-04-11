
import React from 'react';
import { Files, FileJson } from 'lucide-react';
import ExportSettings from '@/components/export/planning/ExportSettings';
import ImportPlanning from '@/components/export/planning/ImportPlanning';
import StatusLegendCard from '@/components/export/legend/StatusLegendCard';
import { useAvailableStatuses } from '@/hooks/useAvailableStatuses';
import { StatusCode } from '@/types';

interface PlanningExportTabProps {
  handleExport: () => void;
  handleImportSuccess: (data: any) => void;
  importedData: any | null;
}

const PlanningExportTab: React.FC<PlanningExportTabProps> = ({
  handleExport,
  handleImportSuccess,
  importedData
}) => {
  // Default statuses for the planning export legend
  const defaultStatuses: StatusCode[] = ['assistance', 'absence', 'conges', 'formation', 'permanence'];
  
  // Get available statuses using our custom hook
  const { statuses, loading } = useAvailableStatuses(defaultStatuses);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExportSettings handleExport={handleExport} />
        <ImportPlanning 
          handleImportSuccess={handleImportSuccess}
          importedData={importedData}
        />
      </div>
      
      <StatusLegendCard statuses={statuses || defaultStatuses} />
    </div>
  );
};

export default PlanningExportTab;
