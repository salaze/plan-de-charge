
import React from 'react';
import { Calendar, UserSearch, BarChartIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PlanningExportTab from '@/components/export/tabs/PlanningExportTab';
import EmployeesExportTab from '@/components/export/tabs/EmployeesExportTab';
import StatisticsExportTab from '@/components/export/tabs/StatisticsExportTab';
import { Status } from '@/types';

interface ExportTabsProps {
  activeTab: string;
  setActiveTab: (value: string) => void;
  selectedDepartment: string;
  currentYear: number;
  currentMonth: number;
  setCurrentYear: (year: number) => void;
  setCurrentMonth: (month: number) => void;
  importedData: any | null;
  importedEmployees: any[] | null;
  handleImportSuccess: (data: any) => void;
  handleImportEmployees: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExport: () => void;
  handleExportEmployees: () => void;
  handleExportStats: () => void;
  statuses?: Status[];  // Add optional statuses prop
}

const ExportTabs: React.FC<ExportTabsProps> = ({
  activeTab,
  setActiveTab,
  selectedDepartment,
  currentYear,
  currentMonth,
  setCurrentYear,
  setCurrentMonth,
  importedData,
  importedEmployees,
  handleImportSuccess,
  handleImportEmployees,
  handleExport,
  handleExportEmployees,
  handleExportStats,
  statuses = []  // Default to empty array
}) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="planning">
          <Calendar className="h-4 w-4 mr-2" />
          Planning
        </TabsTrigger>
        <TabsTrigger value="employees">
          <UserSearch className="h-4 w-4 mr-2" />
          Employés
        </TabsTrigger>
        <TabsTrigger value="statistics">
          <BarChartIcon className="h-4 w-4 mr-2" />
          Statistiques
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="planning">
        <PlanningExportTab
          handleExport={handleExport}
          handleImportSuccess={handleImportSuccess}
          importedData={importedData}
          statuses={statuses}
        />
      </TabsContent>
      
      <TabsContent value="employees">
        <EmployeesExportTab
          handleExportEmployees={handleExportEmployees}
          handleImportEmployees={handleImportEmployees}
          importedEmployees={importedEmployees}
          selectedDepartment={selectedDepartment}
        />
      </TabsContent>
      
      <TabsContent value="statistics">
        <StatisticsExportTab
          currentYear={currentYear}
          currentMonth={currentMonth}
          setCurrentYear={setCurrentYear}
          setCurrentMonth={setCurrentMonth}
          handleExportStats={handleExportStats}
          selectedDepartment={selectedDepartment}
        />
      </TabsContent>
    </Tabs>
  );
};

export default ExportTabs;
