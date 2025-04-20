
import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';

// Import our new components and hooks
import DepartmentFilter from '@/components/export/DepartmentFilter';
import ExportTabs from '@/components/export/ExportTabs';
import { useImportPlanning } from '@/hooks/useImportPlanning';
import { useImportEmployees } from '@/hooks/useImportEmployees';
import { usePlanningData } from '@/hooks/planning/usePlanningData';
import { useDateSelection } from '@/hooks/useDateSelection';
import { useExportActions } from '@/hooks/useExportActions';
import { ExportPlanningButton } from '@/components/export/actions/ExportPlanningButton';
import { ExportEmployeesButton } from '@/components/export/actions/ExportEmployeesButton';
import { ExportStatsButton } from '@/components/export/actions/ExportStatsButton';

const Export = () => {
  const [activeTab, setActiveTab] = useState("planning");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  
  // Use our custom hooks
  const { date, currentYear, currentMonth, setCurrentYear, setCurrentMonth } = useDateSelection();
  const { importedData, handleImportSuccess } = useImportPlanning();
  const { importedEmployees, handleImportEmployees } = useImportEmployees();
  const { data: planningData } = usePlanningData();
  const { handleExport, handleExportEmployees, handleExportStats } = useExportActions(selectedDepartment);
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold">Exporter les données</h1>
        
        <DepartmentFilter 
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
        />
        
        {/* Hidden action buttons that will be triggered programmatically */}
        <div className="hidden">
          <ExportPlanningButton selectedDepartment={selectedDepartment} data-action="export-planning" />
          <ExportEmployeesButton selectedDepartment={selectedDepartment} data-action="export-employees" />
          <ExportStatsButton 
            selectedDepartment={selectedDepartment} 
            currentYear={currentYear} 
            currentMonth={currentMonth}
            data-action="export-stats" 
          />
        </div>
        
        <ExportTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedDepartment={selectedDepartment}
          currentYear={currentYear}
          currentMonth={currentMonth}
          setCurrentYear={setCurrentYear}
          setCurrentMonth={setCurrentMonth}
          importedData={importedData}
          importedEmployees={importedEmployees}
          handleImportSuccess={handleImportSuccess}
          handleImportEmployees={handleImportEmployees}
          handleExport={handleExport}
          handleExportEmployees={handleExportEmployees}
          handleExportStats={handleExportStats}
        />
      </div>
    </Layout>
  );
};

export default Export;
