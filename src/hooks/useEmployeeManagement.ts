
import { useState } from 'react';
import { toast } from 'sonner';
import { Employee } from '@/types';
import { useSupabaseEmployees } from './useSupabaseEmployees';
import { generateId } from '@/utils';

export const useEmployeeManagement = (
  initialEmployees: Employee[],
  onEmployeesChange: (employees: Employee[]) => void
) => {
  const [formOpen, setFormOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | undefined>(undefined);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string>('');
  const { deleteAllEmployees, addEmployee, updateEmployee, deleteEmployee } = useSupabaseEmployees();

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
  
  const handleDeleteAllEmployees = () => {
    setDeleteAllDialogOpen(true);
  };
  
  const confirmDeleteAllEmployees = async () => {
    try {
      await deleteAllEmployees();
      onEmployeesChange([]);
      toast.success('Tous les employés ont été supprimés');
    } catch (error) {
      console.error('Erreur lors de la suppression des employés:', error);
      toast.error('Impossible de supprimer tous les employés');
    } finally {
      setDeleteAllDialogOpen(false);
    }
  };
  
  const confirmDeleteEmployee = async () => {
    if (!employeeToDelete) return;
    
    try {
      await deleteEmployee(employeeToDelete);
      const updatedEmployees = initialEmployees.filter((emp: Employee) => emp.id !== employeeToDelete);
      onEmployeesChange(updatedEmployees);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'employé:', error);
      toast.error('Impossible de supprimer l\'employé');
    }
    
    setDeleteDialogOpen(false);
    setEmployeeToDelete('');
  };
  
  const handleSaveEmployee = async (employee: Employee) => {
    try {
      let updatedEmployees: Employee[];
      
      if (employee.id) {
        // Mettre à jour un employé existant
        await updateEmployee(employee.id, employee);
        updatedEmployees = initialEmployees.map((emp: Employee) => 
          emp.id === employee.id ? employee : emp
        );
        toast.success('Employé modifié avec succès');
      } else {
        // Ajouter un nouvel employé
        const result = await addEmployee({
          ...employee,
          id: generateId(),
          schedule: []
        });
        
        const newEmployee = {
          id: result.id,
          name: result.prenom ? `${result.prenom} ${result.nom}` : result.nom,
          uid: result.identifiant || result.uid || '',  // Using either identifiant or uid
          position: result.fonction || undefined,
          department: result.departement || undefined,
          role: result.role as any || 'employee',
          schedule: []
        };
        
        updatedEmployees = [...initialEmployees, newEmployee];
        toast.success('Employé ajouté avec succès');
      }
      
      onEmployeesChange(updatedEmployees);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'employé:', error);
      toast.error('Impossible de sauvegarder l\'employé');
    }
  };

  return {
    formOpen,
    currentEmployee,
    deleteDialogOpen,
    deleteAllDialogOpen,
    employeeToDelete,
    handleAddEmployee,
    handleEditEmployee,
    handleDeleteEmployee,
    handleDeleteAllEmployees,
    confirmDeleteAllEmployees,
    confirmDeleteEmployee,
    handleSaveEmployee,
    setFormOpen,
    setDeleteDialogOpen,
    setDeleteAllDialogOpen
  };
};
