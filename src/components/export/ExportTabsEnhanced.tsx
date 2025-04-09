
import React, { useState, useEffect } from 'react';
import ExportTabs from './ExportTabs';
import { Status } from '@/types';
import { statusService } from '@/services/supabaseServices';
import { toast } from 'sonner';
import { exportToExcel } from '@/utils/excel/exportToExcel';
import { importEmployeesFromExcel, exportEmployeesToExcel } from '@/utils/employeeExportUtils';
import { exportStatsToExcel } from '@/utils/statsExportUtils';

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
  
  // Fetch statuses from Supabase
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const statusesData = await statusService.getAll();
        setStatuses(statusesData);
      } catch (error) {
        console.error('Error loading statuses:', error);
        toast.error('Failed to load status data');
      }
    };
    
    fetchStatuses();
  }, []);
  
  // Handlers for import/export functionality
  const handleImportSuccess = (data: any) => {
    setImportedData(data);
    toast.success(`Successfully imported data for ${data.employees.length} employees`);
  };
  
  const handleImportEmployees = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (event.target?.result) {
          const employees = await importEmployeesFromExcel(event.target.result as ArrayBuffer);
          setImportedEmployees(employees);
          toast.success(`Successfully imported ${employees.length} employees`);
        }
      } catch (error) {
        console.error('Error importing employees:', error);
        toast.error('Failed to import employees');
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const handleExport = () => {
    try {
      // This is just a placeholder implementation
      const dummyData = {
        year: currentYear,
        month: currentMonth,
        employees: []
      };
      exportToExcel(dummyData);
      toast.success('Planning exported successfully');
    } catch (error) {
      console.error('Error exporting planning:', error);
      toast.error('Failed to export planning');
    }
  };
  
  const handleExportEmployees = () => {
    try {
      // This is just a placeholder implementation
      exportEmployeesToExcel([]);
      toast.success('Employees exported successfully');
    } catch (error) {
      console.error('Error exporting employees:', error);
      toast.error('Failed to export employees');
    }
  };
  
  const handleExportStats = () => {
    try {
      // This is just a placeholder implementation
      exportStatsToExcel([]);
      toast.success('Statistics exported successfully');
    } catch (error) {
      console.error('Error exporting statistics:', error);
      toast.error('Failed to export statistics');
    }
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
      statuses={statuses}
    />
  );
}
