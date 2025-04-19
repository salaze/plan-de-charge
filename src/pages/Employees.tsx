
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
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
import { Employee } from '@/types';
import { generateId } from '@/utils';
import { fetchEmployees, saveEmployee, deleteEmployee, checkSupabaseConnection } from '@/utils/supabaseUtils';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, CloudOff, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  const [isOffline, setIsOffline] = useState(false);
  const { isAdmin } = useAuth();
  
  // Function to load employees data
  const loadEmployees = async () => {
    setLoading(true);
    
    // Check connection first
    const isOnline = await checkSupabaseConnection();
    setIsOffline(!isOnline);
    
    const data = await fetchEmployees();
    setEmployees(data);
    setLoading(false);
    
    // Also update localStorage for compatibility with existing functionality
    const savedData = localStorage.getItem('planningData');
    if (savedData) {
      const planningData = JSON.parse(savedData);
      planningData.employees = data;
      localStorage.setItem('planningData', JSON.stringify(planningData));
    } else {
      localStorage.setItem('planningData', JSON.stringify({
        year: new Date().getFullYear(),
        month: new Date().getMonth(),
        employees: data,
        projects: []
      }));
    }
  };
  
  // Load employees from Supabase
  useEffect(() => {
    loadEmployees();
  }, []);
  
  const handleAddEmployee = () => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour ajouter un employé");
      return;
    }
    
    setCurrentEmployee(undefined);
    setFormOpen(true);
  };
  
  const handleEditEmployee = (employee: Employee) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour modifier un employé");
      return;
    }
    
    setCurrentEmployee(employee);
    setFormOpen(true);
  };
  
  const handleDeleteEmployee = (employeeId: string) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour supprimer un employé");
      return;
    }
    
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete || !isAdmin) return;
    
    const success = await deleteEmployee(employeeToDelete);
    
    if (success) {
      const updatedEmployees = employees.filter(emp => emp.id !== employeeToDelete);
      setEmployees(updatedEmployees);
      
      // Also update localStorage for compatibility
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const data = JSON.parse(savedData);
        data.employees = updatedEmployees;
        localStorage.setItem('planningData', JSON.stringify(data));
      }
    }
    
    setDeleteDialogOpen(false);
    setEmployeeToDelete('');
  };
  
  const handleSaveEmployee = async (employee: Employee) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour modifier un employé");
      return;
    }
    
    let updatedEmployee = employee;
    
    // Add ID if it's a new employee
    if (!updatedEmployee.id) {
      updatedEmployee = {
        ...updatedEmployee,
        id: generateId(),
        schedule: []
      };
    }
    
    const success = await saveEmployee(updatedEmployee);
    
    if (success) {
      // Update the local state
      let updatedEmployees: Employee[];
      
      if (employee.id) {
        // Update existing employee
        updatedEmployees = employees.map(emp => 
          emp.id === employee.id ? updatedEmployee : emp
        );
      } else {
        // Add new employee
        updatedEmployees = [...employees, updatedEmployee];
      }
      
      setEmployees(updatedEmployees);
      
      // Also update localStorage for compatibility
      const savedData = localStorage.getItem('planningData');
      if (savedData) {
        const data = JSON.parse(savedData);
        data.employees = updatedEmployees;
        localStorage.setItem('planningData', JSON.stringify(data));
      }
      
      setFormOpen(false);
    }
  };
  
  // Function to try reconnecting to Supabase
  const handleTryReconnect = () => {
    toast.info("Tentative de reconnexion à la base de données...");
    loadEmployees();
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Gestion des employés</h1>
        
        {isOffline && (
          <Alert variant="warning" className="bg-amber-50 border-amber-200">
            <CloudOff className="h-4 w-4" />
            <AlertTitle>Mode Hors-ligne</AlertTitle>
            <AlertDescription className="flex justify-between items-center">
              <span>Vous travaillez actuellement en mode hors-ligne. Les modifications sont enregistrées localement.</span>
              <Button variant="outline" size="sm" onClick={handleTryReconnect} className="ml-4">
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer la connexion
              </Button>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="glass-panel p-6 animate-scale-in">
          <EmployeeList 
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            loading={loading}
          />
        </div>
        
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
      </div>
    </Layout>
  );
};

export default Employees;
