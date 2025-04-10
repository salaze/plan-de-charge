
import React, { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, Users, Settings as SettingsIcon, Shield, LayoutList } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { StatusManager } from '@/components/admin/StatusManager';
import { ConnectionLogsTab } from '@/components/admin/tabs/ConnectionLogsTab';
import { EmployeesTab } from '@/components/admin/tabs/EmployeesTab';
import { useAdminData } from '@/hooks/useAdminData';
import { useSearchParams, useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const { logout, isAdmin } = useAuth();
  const { data, handleProjectsChange, handleStatusesChange, handleEmployeesChange } = useAdminData();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('projects');
  
  useEffect(() => {
    // Redirect if not admin
    if (!isAdmin) {
      navigate('/');
    }
    
    const tabParam = searchParams.get('tab');
    if (tabParam && ['projects', 'statuses', 'employees', 'logs', 'settings'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams, isAdmin, navigate]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <MainLayout>
      <div className="space-y-6 animate-fade-in">
        <AdminHeader onLogout={handleLogout} />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
            <TabsTrigger value="logs" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Journaux</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <SettingsIcon className="h-4 w-4" />
              <span>Paramètres</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="projects" className="space-y-4">
            <ProjectManager
              projects={data.projects || []}
              onProjectsChange={handleProjectsChange}
            />
          </TabsContent>
          
          <TabsContent value="statuses" className="space-y-4">
            <StatusManager
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
          
          <TabsContent value="logs">
            <ConnectionLogsTab />
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="p-4 bg-muted/20 rounded-md">
              <p>Paramètres en cours de développement</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Admin;
