
import React, { useState, useEffect } from 'react';
import ExportTabs from './ExportTabs';
import { statusService } from '@/services/supabaseServices';
import { Status } from '@/types';

interface ExportTabsEnhancedProps {
  activeTab?: string;
}

export function ExportTabsEnhanced({ activeTab }: ExportTabsEnhancedProps) {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [importedData, setImportedData] = useState<any | null>(null);
  const [importedEmployees, setImportedEmployees] = useState<any[] | null>(null);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [activeTabState, setActiveTabState] = useState(activeTab || "planning");
  
  // Récupérer les statuts depuis Supabase
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusesData = await statusService.getAll();
        setStatuses(statusesData);
      } catch (error) {
        console.error('Erreur lors du chargement des statuts:', error);
      }
    };
    
    fetchStatuses();
  }, []);
  
  // Placeholder functions for the required handlers
  const handleImportSuccess = (data: any) => {
    setImportedData(data);
  };
  
  const handleImportEmployees = (e: React.ChangeEvent<HTMLInputElement>) => {
    // This is just a placeholder
    console.log('Import employees', e);
  };
  
  const handleExport = () => {
    // This is just a placeholder
    console.log('Export');
  };
  
  const handleExportEmployees = () => {
    // This is just a placeholder
    console.log('Export employees');
  };
  
  const handleExportStats = () => {
    // This is just a placeholder
    console.log('Export stats');
  };
  
  return (
    <ExportTabs
      activeTab={activeTabState}
      setActiveTab={setActiveTabState}
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
  );
}
