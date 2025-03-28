
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { RoleManagement } from '@/components/employees/RoleManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Settings as SettingsIcon, FileSpreadsheet, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { logout } = useAuth();
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { projects: [], employees: [] };
  });
  
  useEffect(() => {
    if (data) {
      const savedData = localStorage.getItem('planningData');
      const fullData = savedData ? JSON.parse(savedData) : {};
      
      // Mettre à jour les projets et les employés dans le localStorage
      localStorage.setItem('planningData', JSON.stringify({
        ...fullData,
        projects: data.projects,
        employees: data.employees
      }));
    }
  }, [data]);
  
  const handleProjectsChange = (projects: any[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleEmployeesChange = (employees: any[]) => {
    setData(prevData => ({
      ...prevData,
      employees
    }));
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Administration</h1>
          <Button variant="outline" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
        
        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span>Projets</span>
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
              projects={data.projects || []} 
              onProjectsChange={handleProjectsChange} 
            />
          </TabsContent>
          
          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Gestion des employés</CardTitle>
                <CardDescription>
                  Ajouter, modifier ou supprimer des employés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilisez la page Employés pour gérer le personnel.
                </p>
                <div className="mt-4">
                  <Link to="/employees">
                    <Button>Aller à la page Employés</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="roles">
            <RoleManagement 
              employees={data.employees || []} 
              onEmployeesChange={handleEmployeesChange} 
            />
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
                <CardDescription>
                  Configuration de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Options de configuration et paramètres avancés.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
