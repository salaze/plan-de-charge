
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { StatusManager } from '@/components/admin/StatusManager';
import { RoleManagement } from '@/components/employees/RoleManagement';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Users, Settings as SettingsIcon, FileSpreadsheet, Shield, LayoutList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { EmployeeList } from '@/components/employees/EmployeeList';
import { EmployeeForm } from '@/components/employees/EmployeeForm';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Employee, StatusCode, STATUS_LABELS, STATUS_COLORS } from '@/types';
import { createEmptyEmployee, generateId } from '@/utils';

const Admin = () => {
  const { logout } = useAuth();
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem('planningData');
    return savedData ? JSON.parse(savedData) : { 
      projects: [], 
      employees: [],
      statuses: [] 
    };
  });
  
  // Ajout pour la gestion des employés
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  
  // Initialiser les statuts si c'est le premier accès
  useEffect(() => {
    if (!data.statuses || data.statuses.length === 0) {
      // Créer des statuts par défaut à partir des STATUS_LABELS et STATUS_COLORS
      const defaultStatuses = Object.entries(STATUS_LABELS)
        .filter(([code]) => code !== '') // Ignorer le statut vide
        .map(([code, label]) => ({
          id: generateId(),
          code: code as StatusCode,
          label,
          color: STATUS_COLORS[code as StatusCode]
        }));
      
      setData(prevData => ({
        ...prevData,
        statuses: defaultStatuses
      }));
    }
  }, []);
  
  useEffect(() => {
    if (data) {
      const savedData = localStorage.getItem('planningData');
      const fullData = savedData ? JSON.parse(savedData) : {};
      
      // Mettre à jour les projets, les employés et les statuts dans le localStorage
      localStorage.setItem('planningData', JSON.stringify({
        ...fullData,
        projects: data.projects,
        employees: data.employees,
        statuses: data.statuses
      }));
    }
  }, [data]);
  
  const handleProjectsChange = (projects: any[]) => {
    setData(prevData => ({
      ...prevData,
      projects
    }));
  };
  
  const handleStatusesChange = (statuses: any[]) => {
    setData(prevData => ({
      ...prevData,
      statuses
    }));
  };
  
  const handleEmployeesChange = (employees: any[]) => {
    setData(prevData => ({
      ...prevData,
      employees
    }));
  };
  
  // Fonctions pour gérer les employés
  const handleAddEmployee = () => {
    setCurrentEmployee(undefined);
    setFormOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    setCurrentEmployee(employee);
    setFormOpen(true);
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteEmployee = () => {
    if (!employeeToDelete) return;
    
    const updatedEmployees = data.employees.filter((emp: Employee) => emp.id !== employeeToDelete);
    handleEmployeesChange(updatedEmployees);
    
    toast.success('Employé supprimé avec succès');
    setDeleteDialogOpen(false);
    setEmployeeToDelete('');
  };
  
  const handleSaveEmployee = (employee: Employee) => {
    let updatedEmployees: Employee[];
    
    if (employee.id) {
      // Mettre à jour un employé existant
      updatedEmployees = data.employees.map((emp: Employee) => 
        emp.id === employee.id ? employee : emp
      );
      toast.success('Employé modifié avec succès');
    } else {
      // Ajouter un nouvel employé
      const newEmployee = {
        ...employee,
        id: generateId(),
        schedule: []
      };
      updatedEmployees = [...data.employees, newEmployee];
      toast.success('Employé ajouté avec succès');
    }
    
    handleEmployeesChange(updatedEmployees);
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
            <Card>
              <CardHeader>
                <CardTitle>Gestion des employés</CardTitle>
                <CardDescription>
                  Ajouter, modifier ou supprimer des employés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="glass-panel p-6 animate-scale-in">
                  <EmployeeList 
                    employees={data.employees || []}
                    onAddEmployee={handleAddEmployee}
                    onEditEmployee={handleEditEmployee}
                    onDeleteEmployee={handleDeleteEmployee}
                  />
                </div>
              </CardContent>
            </Card>
            
            <EmployeeForm 
              open={formOpen}
              onClose={() => setFormOpen(false)}
              onSave={handleSaveEmployee}
              employee={currentEmployee}
            />
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action est irréversible. Cela supprimera définitivement l'employé
                    et toutes ses données de présence.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={confirmDeleteEmployee}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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
