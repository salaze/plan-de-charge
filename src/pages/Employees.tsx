
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
import { fetchEmployees, saveEmployee, deleteEmployee } from '@/utils/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { checkSupabaseConnection } from '@/utils/supabase/connection';

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const { isAdmin } = useAuth();
  
  // Function to load employees data
  const loadEmployees = async () => {
    setLoading(true);
    setConnectionError(null);
    
    try {
      const isConnected = await checkSupabaseConnection();
      setIsConnected(isConnected);
      
      if (!isConnected) {
        const errorMsg = "Impossible de se connecter à Supabase. Veuillez vérifier votre connexion internet.";
        setConnectionError(errorMsg);
        toast.error(errorMsg);
        setLoading(false);
        return;
      }
      
      const data = await fetchEmployees();
      setEmployees(data);
      
      if (data.length === 0) {
        toast.warning("Aucun employé trouvé dans la base de données");
      }
    } catch (error) {
      console.error('Error loading employees:', error);
      const errorMsg = "Erreur lors du chargement des employés depuis Supabase";
      setConnectionError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
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
    
    if (!isConnected) {
      toast.error("Impossible d'ajouter un employé : connexion à Supabase indisponible");
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
    
    if (!isConnected) {
      toast.error("Impossible de modifier un employé : connexion à Supabase indisponible");
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
    
    if (!isConnected) {
      toast.error("Impossible de supprimer un employé : connexion à Supabase indisponible");
      return;
    }
    
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete || !isAdmin) return;
    
    try {
      const success = await deleteEmployee(employeeToDelete);
      
      if (success) {
        const updatedEmployees = employees.filter(emp => emp.id !== employeeToDelete);
        setEmployees(updatedEmployees);
        toast.success("Employé supprimé avec succès");
      }
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Erreur lors de la suppression de l\'employé');
    } finally {
      setDeleteDialogOpen(false);
      setEmployeeToDelete('');
    }
  };
  
  const handleSaveEmployee = async (employee: Employee) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour modifier un employé");
      return;
    }
    
    if (!isConnected) {
      toast.error("Impossible de sauvegarder un employé : connexion à Supabase indisponible");
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
    
    try {
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
        setFormOpen(false);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Erreur lors de la sauvegarde de l\'employé');
    }
  };
  
  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold mb-6">Gestion des employés</h1>
        
        {connectionError ? (
          <div className="glass-panel p-6 animate-scale-in">
            <div className="flex flex-col items-center justify-center text-center p-6">
              <AlertCircle className="h-12 w-12 text-destructive mb-4" />
              <h3 className="text-xl font-bold mb-2">Erreur de connexion</h3>
              <p className="text-muted-foreground mb-4">{connectionError}</p>
              <Button onClick={() => loadEmployees()}>Réessayer</Button>
            </div>
          </div>
        ) : (
          <div className="glass-panel p-6 animate-scale-in">
            <EmployeeList 
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
              onDeleteEmployee={handleDeleteEmployee}
              loading={loading}
            />
          </div>
        )}
        
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
        
        <AlertDialog open={!isConnected && !loading}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Connexion perdue à Supabase</AlertDialogTitle>
              <AlertDialogDescription>
                La connexion avec la base de données a été perdue. Vérifiez votre connexion internet et réessayez.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end">
              <Button onClick={() => loadEmployees()}>Réessayer</Button>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
};

export default Employees;
