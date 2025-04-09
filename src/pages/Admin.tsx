
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Users, Settings as SettingsIcon, Shield, LayoutList, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProjectsTab } from '@/components/admin/tabs/ProjectsTab';
import { StatusesTab } from '@/components/admin/tabs/StatusesTab';
import { EmployeesTab } from '@/components/admin/tabs/EmployeesTab';
import { RolesTab } from '@/components/admin/tabs/RolesTab';
import { SettingsTab } from '@/components/admin/tabs/SettingsTab';
import { ConnectionLogsTab } from '@/components/admin/tabs/ConnectionLogsTab';
import { useAdminData } from '@/hooks/useAdminData';

const Admin = () => {
  const { logout } = useAuth();
  const { data, handleProjectsChange, handleStatusesChange, handleEmployeesChange } = useAdminData();
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader onLogout={logout} />
        
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid grid-cols-6 mb-4">
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
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span>Connexions</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            <ProjectsTab
              projects={data.projects || []}
              onProjectsChange={handleProjectsChange}
            />
          </TabsContent>
          
          <TabsContent value="statuses" className="space-y-4">
            <StatusesTab
              statuses={data.statuses || []}
              onStatusesChange={handleStatusesChange}
            />
          </TabsContent>
          
          <TabsContent value="employees">
            <EmployeesTab
              employees={data.employees || []}
              onEmployeesChange={handleEmployeesChange}
            />
          </TabsContent>
          
          <TabsContent value="roles">
            <RolesTab
              employees={data.employees || []}
              onEmployeesChange={handleEmployeesChange}
            />
          </TabsContent>
          
          <TabsContent value="logs">
            <ConnectionLogsTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
