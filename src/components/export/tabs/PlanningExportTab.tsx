
import React, { useState } from 'react';
import { Status } from '@/types';
import { ExportCard } from '../planning/ExportCard';
import { ImportCard } from '../planning/ImportCard';
import StatusLegendCard from '../planning/StatusLegendCard';

interface PlanningExportTabProps {
  handleExport: () => void;
  handleImportSuccess: (data: any) => void;
  importedData: any | null;
  statuses?: Status[];
}

const PlanningExportTab: React.FC<PlanningExportTabProps> = ({
  handleExport,
  handleImportSuccess,
  importedData,
  statuses = []
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ExportCard handleExport={handleExport} />
        <ImportCard 
          handleImportSuccess={handleImportSuccess}
          importedData={importedData}
        />
      </div>
      
      <StatusLegendCard statuses={statuses} />
    </div>
  );
};

export default PlanningExportTab;
