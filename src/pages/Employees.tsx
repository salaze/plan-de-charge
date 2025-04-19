
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

const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  const { isAdmin } = useAuth();
  
  // Function to load employees data
  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await fetchEmployees();
      setEmployees(data);
      
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
    } catch (error) {
      console.error('Error loading employees:', error);
      toast.error('Erreur lors du chargement des employés');
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
    
    try {
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
        
        // Also update localStorage for compatibility
        const savedData = localStorage.getItem('planningData');
        if (savedData) {
          const data = JSON.parse(savedData);
          data.employees = updatedEmployees;
          localStorage.setItem('planningData', JSON.stringify(data));
        }
        
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
