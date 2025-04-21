
import React from 'react';
import { FileSpreadsheet, LayoutList, Users, Shield, Settings as SettingsIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { StatusManager } from '@/components/admin/StatusManager';
import { RoleManagement } from '@/components/employees/RoleManagement';
import { EmployeeTab } from '@/components/admin/EmployeeTab';
import { SettingsTab } from '@/components/admin/SettingsTab';
import { Employee } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AdminTabsProps {
  projects: any[];
  employees: Employee[];
  statuses: any[];
  onProjectsChange: (projects: any[]) => void;
  onStatusesChange: (statuses: any[]) => void;
  onEmployeesChange: (employees: Employee[]) => void;
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
    <>
      {!isConnected && (
        <Alert variant="warning" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Mode hors ligne</AlertTitle>
          <AlertDescription>
            Vous travaillez actuellement en mode hors ligne. Les modifications seront stockées localement jusqu'à ce que la connexion soit rétablie.
          </AlertDescription>
        </Alert>
      )}
      <Tabs defaultValue="statuses" className="w-full">
        <TabsList className="grid grid-cols-5 mb-4">
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Projets</span>
          </TabsTrigger>
          <TabsTrigger value="statuses" className="flex items-center gap-2">
            <LayoutList className="h-4 w-4" />
            <span>Statuts</span>
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Employés</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Rôles</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <ProjectManager
            projects={projects}
            onProjectsChange={onProjectsChange}
          />
        </TabsContent>

        <TabsContent value="statuses" className="space-y-4">
          <StatusManager
            statuses={statuses}
            onStatusesChange={onStatusesChange}
            isLoading={isLoading}
            isConnected={isConnected}
          />
        </TabsContent>

        <TabsContent value="employees">
          <EmployeeTab
            employees={employees}
            onEmployeesChange={onEmployeesChange}
          />
        </TabsContent>

        <TabsContent value="roles">
          <RoleManagement
            employees={employees}
            onEmployeesChange={onEmployeesChange}
          />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsTab />
        </TabsContent>
      </Tabs>
    </>
  );
}
