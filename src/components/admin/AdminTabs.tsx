
import React from 'react';
import { FileSpreadsheet, LayoutList, Users, Shield, Settings } from 'lucide-react';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { TabTrigger } from './tabs/TabTrigger';
import { ProjectsTab } from './tabs/ProjectsTab';
import { StatusesTab } from './tabs/StatusesTab';
import { EmployeesTab } from './tabs/EmployeesTab';
import { RolesTab } from './tabs/RolesTab';
import { SettingsTab } from './tabs/SettingsTab';

interface AdminTabsProps {
  projects: any[];
  employees: any[];
  statuses: any[];
  onProjectsChange: (projects: any[]) => void;
  onStatusesChange: (statuses: any[]) => void;
  onEmployeesChange: (employees: any[]) => void;
  isLoading?: boolean;
  isConnected?: boolean;
}

export function AdminTabs({
  projects,
  employees,
  statuses,
  onProjectsChange,
  onStatusesChange,
  onEmployeesChange,
  isLoading = false,
  isConnected = true
}: AdminTabsProps) {
  return (
    <Tabs defaultValue="statuses" className="w-full">
      <TabsList className="grid grid-cols-5 mb-4">
        <TabTrigger value="projects" icon={FileSpreadsheet} label="Projets" />
        <TabTrigger value="statuses" icon={LayoutList} label="Statuts" />
        <TabTrigger value="employees" icon={Users} label="Employés" />
        <TabTrigger value="roles" icon={Shield} label="Rôles" />
        <TabTrigger value="settings" icon={Settings} label="Paramètres" />
      </TabsList>

      <TabsContent value="projects">
        <ProjectsTab 
          projects={projects} 
          onProjectsChange={onProjectsChange} 
        />
      </TabsContent>

      <TabsContent value="statuses">
        <StatusesTab
          statuses={statuses}
          onStatusesChange={onStatusesChange}
          isLoading={isLoading}
          isConnected={isConnected}
        />
      </TabsContent>

      <TabsContent value="employees">
        <EmployeesTab
          employees={employees}
          onEmployeesChange={onEmployeesChange}
        />
      </TabsContent>

      <TabsContent value="roles">
        <RolesTab
          employees={employees}
          onEmployeesChange={onEmployeesChange}
        />
      </TabsContent>

      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
}
