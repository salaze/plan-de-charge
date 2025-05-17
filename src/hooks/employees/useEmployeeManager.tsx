
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { Employee } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { generateId } from '@/utils';
import { saveEmployee, deleteEmployee } from '@/utils/supabase';

export function useEmployeeManager(initialEmployees: Employee[] = []) {
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  const { isAdmin } = useAuth();

  const handleAddEmployee = useCallback(() => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour ajouter un employé");
      return;
    }
    
    setCurrentEmployee(undefined);
    setFormOpen(true);
  }, [isAdmin]);

  const handleEditEmployee = useCallback((employee: Employee) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour modifier un employé");
      return;
    }
    
    setCurrentEmployee(employee);
    setFormOpen(true);
  }, [isAdmin]);

  const handleDeleteEmployee = useCallback((employeeId: string) => {
    if (!isAdmin) {
      toast.error("Vous n'avez pas les droits pour supprimer un employé");
      return;
    }
    
    setEmployeeToDelete(employeeId);
    setDeleteDialogOpen(true);
  }, [isAdmin]);

  const confirmDeleteEmployee = useCallback(async () => {
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
  }, [employeeToDelete, isAdmin, employees]);

  const handleSaveEmployee = useCallback(async (employee: Employee) => {
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
        setFormOpen(false);
      }
    } catch (error) {
      console.error('Error saving employee:', error);
      toast.error('Erreur lors de la sauvegarde de l\'employé');
    }
  }, [employees, isAdmin]);
  
  return {
    employees,
    setEmployees,
    formOpen,
    setFormOpen,
    currentEmployee,
    setCurrentEmployee,
    deleteDialogOpen,
    setDeleteDialogOpen,
    employeeToDelete,
    handleAddEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    confirmDeleteEmployee,
    handleSaveEmployee
  };
}
